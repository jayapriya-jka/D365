/*
 * Creates an instance of the QuoteViewModel model which contains the functionality
 *
 * @param {object}  executionContext    The execution context of the form call
 */
function createViewModel(executionContext){
    var ppLibrary = new IncrementalPPLibrary(executionContext);
    var quoteRollupFieldsModel = new QuoteRollupFieldsViewModel(ppLibrary);
    return QuoteViewModel(ppLibrary, quoteRollupFieldsModel);
};

/**
 * Sets up form on load.
 * 
 * @param {object}  executionContext    The execution context of the form call.
 */
async function onLoad(executionContext){
    var ppLibrary = new IncrementalPPLibrary(executionContext);
    ppLibrary.addOnPostSave(onPostSave);

    const withPriceQuote =  true;
    const model = createViewModel(executionContext);
    await model.refreshRollupsAsync(withPriceQuote);

    const formContext = executionContext.data 
                            ? executionContext 
                            : executionContext.getFormContext(); 

    if (formContext.getAttribute("igl_totaltaxinccharges").getValue() > 0 ||
        formContext.getAttribute("totallineitemamount").getValue() > 0) {
        PriceQuote(executionContext);   
    }
};

/**
 * Processes the update of the Pre-Freight Amount.
 * 
 * @param {object}  executionContext    The execution context of the form call.
 */
async function onPreFreightAmountChange(executionContext){
    const withoutPriceQuote =  false;
    const model = createViewModel(executionContext);
    await model.refreshRollupsAsync(withoutPriceQuote);
};

/**
 * Invoked after the Quote has saved.
 *  If Success and Quote Financials Updated - refreshes data to get new totals.
 * 
 * #TODO - Review as it uses Window variable which is bad practice. 
 *          Is there a better way to work out which attributes have been updated?
 * 
 * @param {object}  executionContext    The execution context of the form call.
 */
function onPostSave(executionContext){
    var depth = executionContext.getDepth();
    var eventArgs = executionContext.getEventArgs();
    var isSaveSuccess = eventArgs.getIsSaveSuccess();

    if(depth === 0 && isSaveSuccess && Window.QuoteFinancialsUpdated){
        const ppLibrary = new IncrementalPPLibrary(executionContext);
        const model = new QuoteTotalsRefreshViewModel(ppLibrary);
        model.priceAfterDelayAsync().then(console.log("Price function has run"));
    }
};

/**
 * Function attached to the save event of the Quote form.
 * 
 * Captures whether any financial fields have been updated for the Post Save Event.
 * 
 *  #TODO - Review as it uses Window variable which is bad practice. 
 *          Is there a better way to work out which attributes have been updated?
 * 
 * @param {object}  executionContext    The execution context of the form call.
 */
function onQuoteSave(executionContext){
    const ppLibrary = new IncrementalPPLibrary(executionContext);
    const model = new QuoteTotalsRefreshViewModel(ppLibrary);
    Window.QuoteFinancialsUpdated = model.financialsUpdated();
};



function PriceQuote(primaryControl) {
    let formContext = primaryControl;
    Xrm.Utility.showProgressIndicator(Xrm.Utility.getResourceString("msdyn_d365scm_resource", "Pricing_Quote"));

    setTimeout(function () {
        if (formContext.getAttribute("msdyn_quotenumber") && formContext.getAttribute("msdyn_company")) {
            var configEntityName = "msdyn_dualwriteruntimeconfig";
            var externalEntityNameCDS = "CDS sales quotation header";
            var externalEntityNameD365 = "Dynamics 365 Sales quotation header";
            var queryOption = "?$select=msdyn_externalentityname&$filter=msdyn_internalentityname eq 'quote' and msdyn_externalentityname eq '" + externalEntityNameD365 + "'";

            Xrm.WebApi.retrieveMultipleRecords(configEntityName, queryOption).then(
                (result) => {
                    var entityName = externalEntityNameCDS;
                    if (result.entities.length == 1) {
                        entityName = externalEntityNameD365;
                    }

                    var quoteNumber = formContext.getAttribute("msdyn_quotenumber").getValue()
                    var company = formContext.getAttribute("msdyn_company").getValue()[0].name
                    var body = {
                        "entityName": entityName,
                        "fieldValueMapping": "\"SalesQuotationNumber\":\"" + quoteNumber + "\"",
                        "legalEntityId":  company ,
                        "documentActionNameIdentifier": "updatePrices"
                    }

                    SendRequest(formContext, body)
                },
                (error) => { 
                    console.log(error.message);
                }
            );
        }
    }, 500);
}

function SendRequest(formContext, body) {
    var req = new XMLHttpRequest();
    req.open("POST", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.1/_msdyn_FinOpsRunDocumentAction", true);
    req.setRequestHeader("OData-MaxVersion", "4.0");
    req.setRequestHeader("OData-Version", "4.0");
    req.setRequestHeader("Accept", "application/json");
    req.setRequestHeader("Content-Type", "application/json; charset=utf-8");

    req.onreadystatechange = function() {
        if (this.readyState == 4) {
           // Typical action to be performed when the document is ready:
           console.log(this.response);
           formContext.data.refresh();
           disableLoading();
        }
    };
    req.send(JSON.stringify(body));
}


function disableLoading() {
    if (window.top.document.readyState === "complete") {
        Xrm.Utility.closeProgressIndicator();
    }
}