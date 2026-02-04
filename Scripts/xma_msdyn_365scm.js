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
async function on(executionContext){    
    PriceQuote(executionContext)
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