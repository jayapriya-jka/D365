/*
 * Creates an instance of the QuoteCreateOrderViewModel model which contains the functionality.
 *
 * @param   {object}  executionContext    The execution context of the form call.
 * @return  {object}  An instance of QuoteCreateOrderViewModel.
 */
function createQuoteOrderModel(executionContext){
    var ppLibrary = new IncrementalPPLibrary(executionContext);
    var validationModel = createValidationViewModel(ppLibrary);
    return new QuoteCreateOrderViewModel(ppLibrary, validationModel);
};

/*
 * Asynchronously creates an order from the Quote.
 *
 * @param {object}  executionContext    The execution context of the form call.
 */
async function createOrderAsync(executionContext){
    var model = createQuoteOrderModel(executionContext);
    await model.createOrderAsync();
};

/*
 * Creates an a Quote Validation View Model.
 *
 * @param   {object}  ppLibrary       An instance of the IncrementalPPLibrary model
 * @return  {object}  An instance of QuoteValidationViewModel.
 */
function createValidationViewModel(ppLibrary){
    var getPriceModel = new GetPriceViewModel(ppLibrary);
    var loadQuoteProductsModel = new LoadQuoteProductsViewModel(ppLibrary);
    var quoteModel = new QuoteViewModel(ppLibrary);
    return new QuoteValidationViewModel(getPriceModel, loadQuoteProductsModel, ppLibrary, quoteModel);
};

/*
 * Creates an instance of the QuoteActivateQuoteViewModel model which contains the functionality.
 *
 * @param {object}  executionContext    The execution context of the form call.
 * @return  {object}  An instance of QuoteActivateQuoteViewModel.
 */
function activateQuoteModel(executionContext){
    var ppLibrary = new IncrementalPPLibrary(executionContext);
    var validationModel = createValidationViewModel(ppLibrary);
    return new QuoteActivateQuoteViewModel(ppLibrary, validationModel);
};

/*
 * Asynchronously activates the Quote.
 *
 * @param {object}  executionContext    The execution context of the form call.
 */
async function activateQuoteAsync(executionContext){
    var model = activateQuoteModel(executionContext);
    await model.XMA_ActivateQuoteAsync();   
};


function checkQuoteDetail(executionContext){             
    checkQuotePriceChanges(executionContext);
}

async function checkQuotePriceChanges(executionContext){

    const formContext = executionContext.data 
        ? executionContext 
        : executionContext.getFormContext();

    var itemPriceChanged = "";    
    var quoteDetailIds = [];
    var quoteId = formContext.data.entity.getId();
    formContext.getAttribute("totallineitemamount").getValue();
    var entityLogicalName;
    var data;

    let result = await Xrm.WebApi.retrieveMultipleRecords("quotedetail", `?$select=xma_issellpricemanuallychanged,xma_sellpricechanged,quotedetailid,priceperunit,igl_originalpeprice,igl_productcode,quotedetailid&$filter=_quoteid_value eq ${quoteId}`);    
    /*if (result != null){
        result.entities.forEach(function (entity) {
            if (entity.xma_sellpricechanged == 1 && entity.xma_issellpricemanuallychanged == false){            
                itemPriceChanged +=  "The sell price for the item " +entity.igl_productcode+ " has been changed in the pricing engine [New price : Â£" +entity.priceperunit+ " - Original price : Â£"+entity.igl_originalpeprice+"]. \n";
                quoteDetailIds.push([entity.quotedetailid, entity.igl_originalpeprice]);
            }            
        });
    } */


    if (result && !itemPriceChanged) {
        
        try {
            Xrm.Utility.showProgressIndicator("Checking prices, please wait...");
            itemPriceChanged = await checkPrices(formContext); 
        }
        catch (error) {
            Xrm.Navigation.openAlertDialog({ text: "Error: " + error.message });
        }
        finally {
        Xrm.Utility.closeProgressIndicator();
        }
    }
    
    if (itemPriceChanged && itemPriceChanged != "NONE")
    {       
        if (itemPriceChanged == "NO_PRICE_CHANGE"){
            await activateQuoteAsync(executionContext);
        }
        else{
            var alertStrings = { 
            text: itemPriceChanged, 
            title: "Price check alert!",
            confirmButtonLabel: "Review",
            showCancelButton: false
            };
        
            var confirmOptions = { height: 400, width: 800 };                
                
            Xrm.Navigation.openAlertDialog(alertStrings, confirmOptions).then(
                async (success) => {
                    if (success.confirmed) {                                            
                        entityLogicalName = "quote"; 
                        data = {
                            "statuscode": 1
                        };
                        try{
                            await Xrm.WebApi.updateRecord(entityLogicalName, quoteId, data);
                            console.log("Quote status updated to Created successfully");                                    
                        } 
                        catch (error) {
                            alert(error.message);
                        }                                                             
                        Xrm.Page.data.refresh(false);                    
                    }                
                },
                (error) =>{
                    alert(error.message);
                }
            );
        }
    }
    else{
        alert("Failed to check prices. Please try again.");      
    }

    Xrm.Page.data.refresh(false); 
}


/**
 * Gets the account number asynchronously.
 * @param {object} primaryControl
 * @return {Promise<string>}
 */
async function getAccountNumberAsync(primaryControl) {
    var formContext = primaryControl;
    var customerField = formContext.getAttribute("customerid");

    if (customerField && customerField.getValue() !== null) {
        var customer = customerField.getValue()[0];

        if (customer.entityType === "account") {
            var accountId = customer.id.replace("{", "").replace("}", "");
            try {
                const result = await Xrm.WebApi.retrieveRecord("account", accountId, "?$select=accountnumber");
                return result.accountnumber;
            } catch (error) {
                throw new Error("Error retrieving account: " + error.message);
            }
        } else {
            throw new Error("Selected customer is not an Account.");
        }
    } else {
        throw new Error("No customer selected.");
    }
}

/**
 * Checks prices for the current quote, returns a message if changed, else "NONE".
 * @param {object} primaryControl
 * @return {Promise<string>}
 */
async function checkPrices(primaryControl) {
    var formContext = primaryControl;
    var quoteId = formContext.data.entity.getId();

    if (!quoteId) {
        await Xrm.Navigation.openAlertDialog({ text: "Quote ID not found." });
        return "NONE";
    }

    quoteId = quoteId.replace("{", "").replace("}", "");

    let accountNumber;
    try {
        accountNumber = await getAccountNumberAsync(primaryControl);
    } catch (error) {
        await Xrm.Navigation.openAlertDialog({ text: error.message });
        return "NONE";
    }

    // Build custom request for pricing action
    var request = {
        QuoteGUID: quoteId,
        CustomerID: accountNumber,
        getMetadata: function () {
            return {
                boundParameter: null,
                parameterTypes: {
                    QuoteGUID: { typeName: "Edm.String", structuralProperty: 1 },
                    CustomerID: { typeName: "Edm.String", structuralProperty: 1 }
                },
                operationName: "xma_XMAGetPrice",
                operationType: 0
            };
        }
    };

    try {
        var response = await Xrm.WebApi.online.execute(request);
        if (response.ok) {
            var data = await response.json();
            if (data.OutputMessage && data.OutputMessage !== "NONE") {
                var message = data.OutputMessage;
                //await Xrm.Navigation.openAlertDialog({ text: message });
                return message; // propagate change
            } else {
                //await Xrm.Navigation.openAlertDialog({
                    //text: "Global action executed successfully with no price changes."
                //});
                return "NONE";
            }
        } else {
            throw new Error("Check PE price action failed.");
        }
    } catch (error) {
        await Xrm.Navigation.openAlertDialog({ text: "Error: " + error.message });
        return "NONE";
    }
}