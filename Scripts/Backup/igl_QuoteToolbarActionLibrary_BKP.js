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

    var quoteId = formContext.data.entity.getId();

    let result = await Xrm.WebApi.retrieveMultipleRecords("quotedetail", `?$select=priceperunit,igl_originalpeprice,igl_productcode,quotedetailid&$filter=_quoteid_value eq ${quoteId}`);        
    if (result != null){
        result.entities.forEach(function (entity) {
            if (entity.priceperunit != entity.igl_originalpeprice)
            {
                itemPriceChanged +=  "The sell price for the item " +entity.igl_productcode+ " has been changed in the pricing engine [New price : Â£" +entity.priceperunit+ " - Original price : Â£"+entity.igl_originalpeprice+"]. \n";
            }            
        });
    } 
    
    if (itemPriceChanged != "")
    {       
        var confirmStrings = { 
            text: itemPriceChanged, 
            title: "Price change alert!",
            confirmButtonLabel: "Quoted Price",
            cancelButtonLabel: "New Price"
        };
        var confirmOptions = { height: 400, width: 800 };                
            
        Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
            function (success) {
                if (success.confirmed) {
                    activateQuoteAsync(executionContext);
                } else {
                    var entityLogicalName = "quote"; 
                    var data = {
                        "statuscode": 1
                    };
                    Xrm.WebApi.updateRecord(entityLogicalName, quoteId, data).then(
                        function success(result) {
                            console.log("Quote status updated to Created successfully");                                    
                        },
                        function error(error) {
                            console.log(error.message);
                            // Handle error conditions
                        }
                    );

                    Xrm.Page.data.refresh(false);
                    
                    /*entityLogicalName = "quotedetail"; 
                    data = {
                        "xma_pricechanged": 1
                    };
                    Xrm.WebApi.updateRecord(entityLogicalName, entity.quotedetailid, data).then(
                        function success(result) {
                            console.log("Price change status updated");                                    
                        },
                        function error(error) {
                            console.log(error.message);
                            // Handle error conditions
                        }
                    );*/                    
                }
            },
            function (error) {
                console.log(error.message);
            }
        );
    }
    else{
        activateQuoteAsync(executionContext);
    }
}