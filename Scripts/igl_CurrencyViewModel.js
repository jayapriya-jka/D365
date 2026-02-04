/*
 * The CurrencyViewModel is a JavaScript model which encapsulates the Currency functionality
 *
 * @version 1.0.0.0
 * @author  Incremental Group
 * @param   {object}        ppLibrary   An instance of the IncrementalPPLibrary model
 */
var CurrencyViewModel = function(ppLibrary){
    var _model = this;

    // Constants for the logical names of the currency attributes
    const _attributes = {
        CurrencyName: "currencyname",
        Id: "transactioncurrencyid",
        ISOCurrencycode: "isocurrencycode",
        toLoad: function(){
            return [this.CurrencyName, this.Id, this.ISOCurrencycode]
        }
    }

    const _entityName = "transactioncurrency";

    const _ppLibrary = ppLibrary;

    /*
     * Gets a lookup value for a given ISO code.
     *
     * @accessibility {public}
     * @param   {object array}  currencies  A list of possible currencies.
     * @param   {string}        isoCode     The ISO code of the curreny to turn into a lookup value.
     * @return  {object array} or null      The lookup value for the currency
     */ 
    _model.getLookupValueForCurrency = function(currencies, isoCode){
        const filtered = currencies.filter(currency => currency[_attributes.ISOCurrencycode] === isoCode);
        if(filtered.length > 0){
            var currency = filtered[0];
            var lookup = {
                entityType: _entityName,
                id: currency[_attributes.Id],
                name: currency[_attributes.CurrencyName]
            };
            return [lookup];
        }
        return null;
    };

    /*
     * Asynchronously loads the currencies from dataverse.
     * 
     * @accessibility {public}
     * @return {object array}   An array of currencies or an empty array
     */
    _model.loadCurrenciesAsync = async function(){
        const select = _ppLibrary.buildODataSelectFilter(_attributes.toLoad());
        const options = `?${select}`;
        const pageSize = 100;
        const result = await _ppLibrary.retrieveMultipleRecordsAsync(_entityName, options, pageSize);
        return result.entities;
    };

    return _model;
};