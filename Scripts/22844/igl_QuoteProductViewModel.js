/*
 * The QuoteProductViewModel is a JavaScript model which encapsulates the Quote Product form functionality
 *
 * @version 1.0.0.0
 * @author  Incremental Group
 * @param   {object}    currencyModel           An instance of the CurrencyViewModel
 * @param   {object}    getPriceModel           An instance of the GetPriceViewModel
 * @param   {object}    ppLibrary               An instance of the IncrementalPPLibrary
 * @param   {object}    productModel            An instance of the ProductViewModel
 * @pram    {object}    productSupplierModel    An instance of the ProductSupplierViewModel
 * @param   {object}    quoteModel              An instance of the QuoteViewModel
 */
var QuoteProductViewModel = function(currencyModel, getPriceModel, ppLibrary, productModel, productSupplierModel, quoteModel){
    var _model = this;
    

    // Constants for the logical names of the Quote Product attributes
    const _attributes = {
        Amount:"baseamount",
        BidExpiry: "igl_bidexpirydate",
        BidQuantityLeft: "igl_bidquantityleft",
        BidReference: "igl_bidreference",
        BidReference2: "igl_bidreference2",
        BidSupplier: "igl_bidsupplier",
        BidSupplier_lookup: "igl_bidsupplier_lookup",
        BidSupportedCost: "igl_bidsupportedcost",
        BidSupportedCost2: "igl_bidsupportedcost2",
        BidSupportedCostCurrency: "igl_bidsupportedcostcurrency",
        BidSupportedCost2Currency: "igl_bidsupportedcostcurrency2",
        BidType: "igl_bidtype",
        BidType2: "igl_bidtype2",
        BidValidFrom: "igl_bidvalidfromdate",
        CostSourceIdentifier: "igl_costsourceidentifier",
        DiscountPercentage: "igl_manualdiscount",
        DiscountValue: "igl_discountvalue",
        DiscountValueTotal:"igl_discounttotal",
        GetPriceRequestId: "igl_getpricerequestid",
        MarginPercentage: "igl_margin",
        MarginValue: "igl_marginvalue",
        MarginValueTotal:"igl_margintotal",
        MinimumSellPrice: "igl_floorprice",
        OriginalDiscountPercentage: "igl_originalpediscount",
        OriginalDiscountValue: "igl_originalpediscountvalue",
        OriginalMarginPercentage: "igl_originalpemargin",
        OriginalMarginValue: "igl_originalpemarginvalue",
        OriginalPrice: "igl_originalpeprice",
        Price: "priceperunit",
        PriceCurrency: "igl_sellpricecurrency",
        PriceLastRetrieved: "igl_pricelastretrieved",
        PriceListName: "igl_pricelistname",
        Product: "productid",
        ProductSupplier: "igl_productsupplier",
        ProductSupplier_lookup: "igl_productsupplier_lookup",
        Quote: "quoteid",
        QuoteEntityName: "quote",
        StatusCode: "statuscode",
        Quantity: "quantity",
        StandardCost: "igl_standardcost",
        StandardCostCurrency: "igl_standardcostcurrency",
        TotalCharges: "igl_totalcharges",
        TotalLineChargeValue: "igl_totallinechargevalue"
    };

    const _charges = {
        Attributes: {
            Calculatedvalue: "igl_calculatedvalue",
            Id: "igl_quotelinechargeid",
            PercentageValue: "igl_percentagevalue"
        },
        EntityLogicalName: "igl_quotelinecharge",
        LoadSize: 50,
        NewRecordNotificationId: "QPCU-Notificiation-NewRecord",
        NotificationId: "QPCU-Notificiation",
        PercentageChoiceValue: 285540001,
        SaveMessage: "Please note the Quote line/product has been saved automatically so the charges can be calculated. The changes may take a few minutes to come from the financial system. Please Wait...",
        SetName: "igl_quotelinecharges"
    };

    // Mappings for the cost source identifiers - has mappings for CE and Pricing Engine
    const _costSourceIdentifiers = [
        { CE: 285540000, PricingEngine: "Standard Cost" },
        { CE: 285540001, PricingEngine: "Bid Supported Cost" }
    ];

    const _parentQuoteStatusReasons = {
        Confirmed: 4
    }

    const _currencyModel = currencyModel;

    const _errorCodes = {
        ChargesRefresh: "QPE-Charges-Error",
        ChargesTotalRefreshError: "QPE-ChargesTotal-Error",
        Invalid: "QPE-Invalid",
        GetPriceException: "QPE-PricingEngine-Exception",
        GetPriceResponseException: "QPE-PricingEngine-Response-Exception",
        PricingEngineError: "QPE-PricingEngine-Error"
    };

    const _getPriceModel = getPriceModel;

    const _ppLibrary = ppLibrary;

    const _productModel = productModel;

    const _productSupplierModel = productSupplierModel;

    const _quoteModel = quoteModel;

    const _setName = "quotedetails";

    /**
     * 
     * @param {decimal} amount              The Amount of the Quote Product.
     * @param {decimal} percentageValue     The Percentage to calculate.
     * @returns {decimal}                   The calculated percentage amount.
     */
    var calculatePercentageAmount = function(amount, percentageValue){
        return amount && amount > 0 && percentageValue && percentageValue > 0
            ? amount * (percentageValue / 100)
            : 0;
    };

    /**
     * Asynchronously calculates and refreshes the value of the percentage charges.
     * 
     * @accessibility {private}
     */
    var calculatePercentageChargesAsync = async function() {
        var quoteLineId = _ppLibrary.getEntityId();
        var amount = _ppLibrary.getAttributeValue(_attributes.Amount);
        var odataOptions = `?$filter=(igl_chargecategory_choice eq ${_charges.PercentageChoiceValue} and _igl_quoteproduct_value eq ${quoteLineId})`;
        var result = await _ppLibrary.retrieveMultipleRecordsAsync(_charges.EntityLogicalName, odataOptions, _charges.LoadSize);

        for (var charge of result.entities){
            var chargeId = charge[_charges.Attributes.Id];
            var percentageValue = charge[_charges.Attributes.PercentageValue];
            var calculatedvalue = calculatePercentageAmount(amount, percentageValue);
            var data = {
                igl_calculatedvalue: calculatedvalue
            };
            await _ppLibrary.updateRecordAsync(_charges.EntityLogicalName, chargeId, data);
        }

        // Show notification to user if charges have been updated.
        if(result.entities.length > 0){
            var message = `Charges have been updated - ${new Date().toTimeString()}`;
            _ppLibrary.showNotificationInfo(message, _charges.NotificationId);
        }
    };
   
    /**
     * Converts a date string to a Date object. Method also has a null check.
     *
     * @accessibility {private}
     * @param   {string}    A date in a string format
     * @return  {date}      A date object
     */ 
    var convertToDate = function(dateString){
        return _ppLibrary.isNotNullOrEmpty(dateString)
            ? new Date(dateString)
            : null;
    };

    /**
     * Gets the CE Cost Source Identifier choice value for the corresponding pricing engine value.
     *
     * @accessibility {private}
     * @param   {string}    pricingEngineValue  The Cost Source Identifier returned by the Pricing Engine.
     * @return  {integer}   The Cost Source Identifier choice value.
     */
    var getCostSourceIdentifierValue = function(pricingEngineValue){
        var filtered = _costSourceIdentifiers.filter(x => x.PricingEngine === pricingEngineValue);
        if(filtered.length > 0){
            return filtered[0].CE;
        }
        return null;
    };

    /**
     * Asynchronously gets the Customer Id.
     * Gets the Customer Id by loading the assigned Quote with the Account.
     * 
     * @accessibility {private}
     * @return  {string}    The Customer Id
     */
    var getCustomerIdAsync = async function(){
        if(hasQuote()){
            const quoteId = _ppLibrary.getLookupId(_attributes.Quote);
            return await _quoteModel.loadRelatedAccountNumberAsync(quoteId);
        }
        return null;
    };

    /**
     * Verifies parent quote, ensures status is not completed.
     * 
     * @accessibility {private}
     * @return  {boolean}  The validation result
     */
    var verifyParentQuoteAsync = async function(){
        var valid = true; 

        if(hasQuote()){
           const quoteId = _ppLibrary.getStrippedLookupId(_attributes.Quote);
           var odataFilter = _ppLibrary.buildODataSelectFilter([_attributes.StatusCode]);
           try {
            var parentQuoteStatus = await _ppLibrary.retrieveRecordAsync(
                    _attributes.QuoteEntityName,
                    quoteId,
                    '?'+odataFilter
                );
                if(parentQuoteStatus.statuscode == _parentQuoteStatusReasons.Confirmed){
                    valid = false; 
                    return valid; 
                }
            }catch(error){
                const message = "Unable to get parent quote as an error occurred.";
                _ppLibrary.showErrorMessage(_errorCodes.GetPriceException, error.message, message)
            }
        }
        return valid; 
    }

    /**
     * Asynchronously gets details needs to make the get price request.
     *
     * @accessibility {private}
     * @return  {object}    The details of the Quote Product.
     *                  - {String}      CustomerId      The account number 
     *                  - {String}      ProductId       The Product number
     *                  - {Integer}     Quantity        The desidered quantity
     *                  - {string}      RequestId       A Guid that can be used to search for logs in the Azure function
     */
    var getProductDetailsAsync = async function(){
        return {
            CustomerId: await getCustomerIdAsync(),
            ProductId: await getProductIdAsync(),
            Quantity: _ppLibrary.getAttributeValue(_attributes.Quantity),
            RequestId: _ppLibrary.generateGuid()
        };
    };
    
    /**
     * Asynchronously gets the Product Id.
     * Gets the Product Id from loading the Product assigned to the Quote Product.
     * 
     * @accessibility {private}
     * @return  {string}    The Product Id
     */
    var getProductIdAsync = async function(){
        if(_ppLibrary.attributeHasValue(_attributes.Product)){
            var productId = _ppLibrary.getLookupId(_attributes.Product);
            return await _productModel.loadProductNumberAsync(productId);
        }
        return null;
    };

    /**
     * Asynchronously gets the recommended pricing of the Quote Product from the Pricing Engine
     * Gets the details of Quote Product, validates the details, makes a request ot the get price custom action to call the Pricing Engines APIs.
     *
     * @accessibility {public}
     */
    _model.getPriceAsync = async function(){
        try {
            //show spinner to user
            _ppLibrary.showSpinnerDialog("Contacting Pricing Engine to to get price. Please wait...");
            // Get customer, product, quantity, and generate requestID
            const details = await getProductDetailsAsync();
            //verify returned values are valid.
            const validation = validate(details);

            if(validation.IsSuccess){

                //set priceRequestID
                _ppLibrary.setAttributeValue(_attributes.GetPriceRequestId, details.RequestId);

                //Fetch the price
                var getPriceData =  await _getPriceModel.makeGetPriceRequestAsync(details);
                console.log(getPriceData);

                //set each entity attribute to the value returned from the PE.
                await processGetPriceResponseAsync(getPriceData);

            } else {
                _ppLibrary.showErrorMessage(_errorCodes.Invalid, validation.Message, validation.Message)
            }

        } catch (error) {
            const message = "Unable to get price from the pricing engine as an error occurred.";
            _ppLibrary.showErrorMessage(_errorCodes.GetPriceException, error.message, message)
        }
        _ppLibrary.closeSpinnerDialog();
    };

    /**
     * Checks and confirms whether the Quote Product has an assigned Quote.
     * 
     * @accessibility {private}
     * @return {Boolean}    A Boolean flag which indicates if the Header Charge has an assigned Quote.
     */ 
    var hasQuote = function(){
        return _ppLibrary.attributeHasValue(_attributes.Quote);
    };

    /**
     * Checks whether the Quote Product has been saved/persisted.
     * 
     * @returns {Boolean}   A Boolean flag which indicates whether the Quote Product has been saved/persisted.
     */
    var isPersisted = function(){
        return Boolean(ppLibrary.getEntityId());
    };

    /**
     * Processes the error of the charges refresh process.
     * 
     * @param {string} error    The error that has occurred. 
     */
    var onChargesRefreshError = function(error){
        const message = "Unable to refresh/recalculate charges total.";
        _ppLibrary.showNotificationWarning(message, _charges.NotificationId);
        _ppLibrary.showErrorMessage(_errorCodes.ChargesTotalRefreshError, error.message, message)
        _ppLibrary.closeSpinnerDialog();
        console.error(error);
    };

    /**
     * Processes the success of the refresh of the charges.
     * 
     * @accessibility {private}
     */
    var onChargesRefreshSuccess = function(){
        _ppLibrary.closeSpinnerDialog();
        
        // Set the Total Charges field value to the calculated/rollup charges total. 
        // Ensures existing functionality works with changes.
        var totalCharges = _ppLibrary.getAttributeValue(_attributes.TotalLineChargeValue);
        _ppLibrary.setAttributeValueAndFireOnChange(_attributes.TotalCharges, totalCharges);
    };

    /**
     * Asynchronously processes the change of the Quote Product amount.
     *      - Automatically Saves Record
     *      - Refreshes Charges if persisted.
     * 
     * @accessibility {public}
     */
    _model.processAmountChangeAsync = async function(){
        try{
            var amountValue = _ppLibrary.getAttributeValue(_attributes.Amount);
            var hasAmount = Boolean(amountValue);

            if(hasAmount || amountValue == 0){
                var newRecord = !isPersisted();
                await _ppLibrary.saveAysnc();

                if(newRecord){
                    const thirtySeconds = 30000;
                    _ppLibrary.showNotificationWarning(_charges.SaveMessage, _charges.NotificationId);
                    await _ppLibrary.sleepAsync(thirtySeconds);
                }

                await _model.refreshChargesAsync();
            }
        } catch(error){
            const message = "Unable to refresh charges as an error occurred.";
            _ppLibrary.showErrorMessage(_errorCodes.ChargesRefresh, error.message, message);
        }
    };

    /**
     * Asynchronously processes the response returned from the Pricing Engine and custom action.
     *
     * @accessibility {private}
     * @param   {object}     priceResponse    The response from the the custom action. The Get Price response is wrapped in the ResponseBody output parameter.  
     */
    var processGetPriceResponseAsync = async function(priceResponse){
        try{
            if(priceResponse.isSuccess()){
                setPricingValues(priceResponse);
                await setLookupsAsync(priceResponse);
            } else {
                showPricingEngineError(priceResponse);
            }
        }
        catch(error){
            const message = "Unable to process response from the pricing engine.";
            _ppLibrary.showErrorMessage(_errorCodes.GetPriceResponseException, error.message, message)
        }
    };

    /**
     * Asynchronously refreshes the Quote Product/Line charges.
     * 
     * @accessibility {public}
     */
    _model.refreshChargesAsync = async function(){
        try {
            var parentQuoteValid = await verifyParentQuoteAsync();
            console.log(`is parent valid: ${parentQuoteValid}`);
            if(isPersisted() && parentQuoteValid == true){
                _ppLibrary.showSpinnerDialog("Refreshing Charges. Please wait...");
                await calculatePercentageChargesAsync();
                await refreshChargesTotalAsync();

                var withSave = true;
                _ppLibrary.refreshData(withSave, onChargesRefreshSuccess, onChargesRefreshError);
            }

        }  catch(error){
            const message = "Unable to refresh charges as an error occurred.";
            _ppLibrary.showErrorMessage(_errorCodes.ChargesRefresh, error.message, message);
            _ppLibrary.closeSpinnerDialog();
        } 
    };

    /**
     * Asynchronously Refreshes the Charges Total.
     * 
     * @accessibility {private}
     */
    var refreshChargesTotalAsync = async function(){
        var quoteProductId = ppLibrary.getEntityId();
        await _ppLibrary.calculateRollupFieldAsync(_setName, quoteProductId, _attributes.TotalLineChargeValue);
    };

    /**
     * Asynchronously sets all currency lookup values to the currencies returned by the pricing engine.
     *
     * @accessibility {private}
     * @param   {object}    priceResponse   The response and data from the pricing engine with all the new values.
     */
    var setLookupsAsync = async function(priceResponse){
        var currencies = await _currencyModel.loadCurrenciesAsync();
        var supplierFilterBase = "igl_supplier_id eq";
        var productSupplierValue = await _productSupplierModel.loadSupplierAsync(`${supplierFilterBase} '${priceResponse.ProductSupplier}'`)
        var bidSupplierValue = await _productSupplierModel.loadSupplierAsync(`${supplierFilterBase} '${priceResponse.BidSupplier}'`)

        const mappings = [
            { 
                LookupName: _attributes.BidSupportedCostCurrency, 
                Value: _currencyModel.getLookupValueForCurrency(currencies, priceResponse.BidSupportedCostCurrency) 
            },
            { 
                LookupName: _attributes.BidSupportedCost2Currency, 
                Value: _currencyModel.getLookupValueForCurrency(currencies, priceResponse.BidSupportedCost2Currency) 
            },
            { 
                LookupName: _attributes.PriceCurrency, 
                Value: _currencyModel.getLookupValueForCurrency(currencies, priceResponse.PriceCurrency) 
            },
            
            { 
                LookupName: _attributes.StandardCostCurrency, 
                Value: _currencyModel.getLookupValueForCurrency(currencies, priceResponse.StandardCostCurrency) 
            },
            { 
                LookupName: _attributes.ProductSupplier_lookup, 
                Value: productSupplierValue
            },
            { 
                LookupName: _attributes.BidSupplier_lookup, 
                Value:  bidSupplierValue
            }
        ];

        mappings.forEach(function(mapping){
            console.log(`Updating ${mapping.LookupName} lookup...`);
            _ppLibrary.setAttributeValue(mapping.LookupName, mapping.Value);
            console.log(`Successfully updated ${mapping.LookupName} lookup.`);
        });
    };

    /**
     * Overrides the pricing values with the values returned from the pricing engine.
     *
     * @accessibility {private}
     * @param   {object}    priceResponse   The get price response from the pricing engine.
     */
    var setPricingValues = function(priceResponse){

        var quantity = _ppLibrary.getAttributeValue(_attributes.Quantity);

        const mappings = [
            { Name: _attributes.BidExpiry, Value: convertToDate(priceResponse.BidExpiryDate) },
            { Name: _attributes.BidQuantityLeft, Value: priceResponse.BidQuantityLeft },
            { Name: _attributes.BidReference, Value: priceResponse.BidReference },
            { Name: _attributes.BidReference2, Value: priceResponse.BidReference2 },
            { Name: _attributes.BidSupplier, Value: priceResponse.BidSupplier },
            { Name: _attributes.BidSupportedCost, Value: priceResponse.BidSupportedCost },
            { Name: _attributes.BidSupportedCost2, Value: priceResponse.BidSupportedCost2 },
            { Name: _attributes.BidType, Value: priceResponse.BidType },
            { Name: _attributes.BidType2, Value: priceResponse.BidType2 },
            { Name: _attributes.BidValidFrom, Value: convertToDate(priceResponse.BidValidFrom) },
            { Name: _attributes.CostSourceIdentifier, Value: getCostSourceIdentifierValue(priceResponse.CostSourceIdentifier) },
            { Name: _attributes.DiscountValueTotal, Value: 0 },
            { Name: _attributes.MarginPercentage, Value: priceResponse.MarginPercentage },
            { Name: _attributes.MarginValue, Value: priceResponse.MarginValue },
            { Name: _attributes.MarginValueTotal, Value: priceResponse.MarginValue*quantity },
            { Name: _attributes.MinimumSellPrice, Value: priceResponse.MinimalSellPrice },
            { Name: _attributes.OriginalDiscountPercentage, Value: priceResponse.DiscountPercentage },
            { Name: _attributes.OriginalDiscountValue, Value: priceResponse.DiscountValue },
            { Name: _attributes.OriginalMarginPercentage, Value: priceResponse.MarginPercentage },
            { Name: _attributes.OriginalMarginValue, Value: priceResponse.MarginValue },
            { Name: _attributes.OriginalPrice, Value: priceResponse.Price },
            { Name: _attributes.Price, Value: priceResponse.Price },
            { Name: _attributes.PriceLastRetrieved, Value: new Date() },
            { Name: _attributes.PriceListName, Value: priceResponse.PriceListName },
            { Name: _attributes.ProductSupplier, Value: priceResponse.ProductSupplier },
            { Name: _attributes.StandardCost, Value: priceResponse.StandardCost },
        ];

        mappings.forEach(function(mapping){
            console.log(`Updating ${mapping.Name}...`);
            _ppLibrary.setAttributeValue(mapping.Name, mapping.Value);
            console.log(`Updated ${mapping.Name}.`);
        });
    };

    /**
     * Shows the error of the get price response to the user.
     *
     * @accessibility {private}
     * @param   {object}    priceResponse   The get price response from the pricing engine.
     */
    var showPricingEngineError = function(priceResponse){
        var message = priceResponse.getErrorMessage();
        _ppLibrary.showErrorMessage(_errorCodes.PricingEngineError, message, message)
    };

    /**
     * Validates the Product details of the Quote Product.

     * @accessibility {private}
     * @param   {object}     details    The details of the Quote Product
     * @return  {object}
     *          - {Boolean} IsSuccess   A Boolean flag which indicates if the validation is a success or failure
     *          - {String}  Message     A message which states why the validation failed
     */
    var validate = function(details){
        var result = { IsSuccess: false, Message: null };

        if(_ppLibrary.isNullOrEmpty(details.CustomerId)) {
            result.Message = "Customer/account Id is missing. Please ensure a quote with a valid account (has an account number) is assigned.";

        } else if(_ppLibrary.isNullOrEmpty(details.ProductId)) {
            result.Message = "Product Number is missing. Please ensure a product with a valid number is assigned.";

        } else if(_ppLibrary.isNullOrEmpty(details.Quantity)) {
            result.Message = "No Quantity has been assigned.";

        } else if(details.Quantity <= 0) {
            result.Message = "Quantity is invalid. Must set to 1 or more.";

        } else if(_ppLibrary.isNullOrEmpty(details.RequestId)){
            result.Message = "Request Id is missing.";

        } else {
            result.IsSuccess = true;
        }

        return result;
    };

    return _model;
};