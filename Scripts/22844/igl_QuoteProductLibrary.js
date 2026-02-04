/*
 * Creates an instance of the QuoteProductViewModel model which contains the functionality
 *
 * @param {object}  executionContext    The execution context of the form call
 */
function createViewModel(executionContext){
    var ppLibrary = new IncrementalPPLibrary(executionContext);
    var currencyModel = new CurrencyViewModel(ppLibrary);
    var getPriceModel = new GetPriceViewModel(ppLibrary);
    var productModel = new ProductViewModel(ppLibrary);
    var productSupplierModel = new ProductSupplierViewModel(ppLibrary);

    var quoteRollupFieldsModel = new QuoteRollupFieldsViewModel(ppLibrary);
    var quoteModel = new QuoteViewModel(ppLibrary, quoteRollupFieldsModel);
    
    return new QuoteProductViewModel(currencyModel, getPriceModel, ppLibrary, productModel, productSupplierModel, quoteModel);
};

/*
 * Creates an instance of the QuoteProductMappingViewModel model which contains the functionality
 *
 * @param {object}  executionContext    The execution context of the form call
 */
function createFlagsViewModel(executionContext){
    var ppLibrary = new IncrementalPPLibrary(executionContext);
    var productModel = new ProductViewModel(ppLibrary);
    return new QuoteProductFlagsViewModel(ppLibrary, productModel);
};

/*
 * Asynchronously gets the price details from the pricing engine.
 *
 * @param {object}  executionContext    The execution context of the form call
 */
async function getPrice(executionContext){
    var model = createViewModel(executionContext);
    await model.getPriceAsync();
    window.IGLQuoteProductForm.calculateAllFields();
};

/*
 * Asynchronously gets and maps flags from product to the quote product.
 *
 * @param {object}  executionContext    The execution context of the form call
 */ 
async function mapProductFlagsAsync(executionContext){
    var flagsModel = createFlagsViewModel(executionContext);
    await flagsModel.mapProductFlagsAsync();

    const showDialog = true;
    await flagsModel.showNotificationIfRequiredAsync(showDialog);
}

/*
 * Attached to form and executed on page load.
 *  - Refreshes Charges.
 * 
 * @param {object}  executionContext    The execution context of the form call
 */ 
async function onLoadAsync(executionContext){
    var model = createViewModel(executionContext);
    await model.refreshChargesAsync();

    const showDialog = false;
    var flagsModel = createFlagsViewModel(executionContext);
    await flagsModel.showNotificationIfRequiredAsync(showDialog);
};

/*
 * Attached to the Amount field and processes the change.
 *
 * @param {object}  executionContext    The execution context of the form call
 */
async function processAmountChangeAsync(executionContext) {
    var model = createViewModel(executionContext);
    await model.processAmountChangeAsync();
}