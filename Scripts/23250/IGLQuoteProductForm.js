"use strict";

/**
 * The IGL Quote Product Form JavaScript Library
 * This library contains functions for the Quote Product form to handle calculations and updates 
 * for Margin %, Margin Value, Discount %, Discount Value, and Sell Price.
 *
 * @version 1.0
 * @since 2023-12-21
 * @author Daniel Malkin
 * @namespace
 */
var IGLQuoteProductForm = window.IGLQuoteProductForm || {
  
    executionContext: null,
    formContext: null,

    /**
     * Initializes the form logic, attaching event handlers and performing initial calculations.
     *
     * @memberof IGLQuoteProductForm
     * @function
     * @param {Object} executionContext - The XRM Execution Context.
     */
    onLoad: function(executionContext) {
        try {
            IGLQuoteProductForm.executionContext = executionContext;
            IGLQuoteProductForm.formContext = executionContext.getFormContext();
            IGLQuoteProductForm.attachEventHandlers();
            IGLQuoteProductForm.passIframeExecutionContext(executionContext,"WebResource_AutoCharge",true)   
        } catch (error) {
            console.error("Error in IGLQuoteProductForm onLoad: " + error.message);
        }
    },

    /**
     * Attaches event handlers to fields.
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    attachEventHandlers: function() {
        IGLQuoteProductForm.attachOnChangeHandler("priceperunit", IGLQuoteProductForm.calculateAllFields);
        IGLQuoteProductForm.attachOnChangeHandler("igl_standardcost", IGLQuoteProductForm.calculateAllFields);
        IGLQuoteProductForm.attachOnChangeHandler("igl_bidsupportedcost", IGLQuoteProductForm.calculateAllFields);
        IGLQuoteProductForm.attachOnChangeHandler("igl_margin", IGLQuoteProductForm.handleMarginChange);
        IGLQuoteProductForm.attachOnChangeHandler("igl_marginvalue", IGLQuoteProductForm.handleMarginValueChange);
    },

    /**
     * Attaches an OnChange event handler to a field.
     *
     * @memberof IGLQuoteProductForm
     * @function
     * @param {string} fieldName - The name of the field.
     * @param {function} handlerFunction - The function to execute when the field changes.
     */
    attachOnChangeHandler: function(fieldName, handlerFunction) {
        var field = IGLQuoteProductForm.formContext.getAttribute(fieldName);
        if (field) {
            field.addOnChange(handlerFunction);
        }
    },

    /**
     * Calculates and updates all related fields (Margin %, Margin Value, Discount %, Discount Value).
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    calculateAllFields: function() {
        IGLQuoteProductForm.calculateAndSetMargin();
        IGLQuoteProductForm.updateMarginPercentFromValue();
        IGLQuoteProductForm.updateDiscountValue();
        IGLQuoteProductForm.calculateAndSetDiscount();
        IGLQuoteProductForm.calculateAmount();
		IGLQuoteProductForm.calculateNewAdjustedCost();
    },

    /**
     * Get the value of the cost source identifier field
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    getCostSourceIdentifierValue: function(costSourceIdentifier){
        var calculatedCost;
        if (costSourceIdentifier == 285540000) { // standard
            calculatedCost = IGLQuoteProductForm.formContext.getAttribute("igl_standardcost").getValue();
        } else if (costSourceIdentifier == 285540001) { // bid
            calculatedCost = IGLQuoteProductForm.formContext.getAttribute("igl_bidsupportedcost").getValue();
        }
        return calculatedCost;
    },

    /**
     * Calculates and updates Margin Value based on Sell Price and Standard Cost.
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    calculateAndSetMargin: function() {
        var sellPrice = IGLQuoteProductForm.formContext.getAttribute("priceperunit").getValue();
        var costSourceIdentifier = IGLQuoteProductForm.formContext.getAttribute("igl_costsourceidentifier").getValue();
        var quantity = IGLQuoteProductForm.formContext.getAttribute("quantity").getValue();
        var calculatedCost = IGLQuoteProductForm.getCostSourceIdentifierValue(costSourceIdentifier);

        if (sellPrice != null && calculatedCost != null && sellPrice >= 0) {
            var marginValue = sellPrice - calculatedCost;
            IGLQuoteProductForm.formContext.getAttribute("igl_marginvalue").setValue(marginValue);
            IGLQuoteProductForm.formContext.getAttribute("igl_margintotal").setValue(marginValue*quantity);
        }
    },

    /**
     * Calculates the Amount field
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    calculateAmount: function() {
        var baseAmountField = IGLQuoteProductForm.formContext.getAttribute("baseamount");
        var currentAmount = baseAmountField.getValue();
        var sellPrice = IGLQuoteProductForm.formContext.getAttribute("priceperunit").getValue();
        var quantity = IGLQuoteProductForm.formContext.getAttribute("quantity").getValue();

        if (sellPrice != null && quantity != null && sellPrice >= 0) {
            var baseAmount = sellPrice * quantity;
            
            if(baseAmount != currentAmount){
                baseAmountField.setValue(baseAmount);
                baseAmountField.fireOnChange();
            }
        }
    },
    
	/**
     * Calculates the Amount field
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    calculateNewAdjustedCost: function() {
        var costSourceIdentifier = IGLQuoteProductForm.formContext.getAttribute("igl_costsourceidentifier").getValue();        
        var sellPrice = IGLQuoteProductForm.formContext.getAttribute("priceperunit").getValue();
        var prodTotalCharges = IGLQuoteProductForm.formContext.getAttribute("igl_totalcharges").getValue();        
        var calculatedCost = IGLQuoteProductForm.getCostSourceIdentifierValue(costSourceIdentifier);

        if (calculatedCost != null && (sellPrice != null && sellPrice >= 0) && costSourceIdentifier != null && prodTotalCharges != null) {     
                const roundToDecimal = (marginPercent, decimals) => {
                let factor = Math.pow(10, decimals);
                return Math.round(marginPercent * factor) / factor;
                };  
                var cost = calculatedCost + prodTotalCharges;                             
                var adjMargin = sellPrice - cost; 
                var adjMarginPercentage = sellPrice > 0 ? roundToDecimal((adjMargin / sellPrice * 100), 2) : 0;            
                adjMarginPercentage = Math.round(adjMarginPercentage);
                IGLQuoteProductForm.formContext.getAttribute("xma_newadjustedcost").setValue(cost);
                IGLQuoteProductForm.formContext.getAttribute("xma_margininternalheaderlineadjustments").setValue(adjMargin);
                IGLQuoteProductForm.formContext.getAttribute("xma_margin").setValue(adjMarginPercentage);                                                
        }
    },

    /**
     * Calculates and updates Discount % and Discount Value based on Sell Price.
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    calculateAndSetDiscount: function() {
        var sellPrice = IGLQuoteProductForm.formContext.getAttribute("priceperunit").getValue();
        var originalPrice = IGLQuoteProductForm.formContext.getAttribute("igl_originalpeprice").getValue();
        var discountValue = IGLQuoteProductForm.formContext.getAttribute("igl_discountvalue").getValue();
        // Check both SellPrice and Original Price.  Avoids a division by zero.
        if ((sellPrice && sellPrice >= 0) && (originalPrice && originalPrice > 0)) {
            var discountPercent = Math.round((discountValue / originalPrice) * 100);
            IGLQuoteProductForm.formContext.getAttribute("igl_manualdiscount").setValue(discountPercent);
        }
    },

    /**
     * Handles changes to the Margin %, updates the Sell Price and Margin Value.
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    handleMarginChange: function() {
        IGLQuoteProductForm.updateSellPriceFromMargin();
        IGLQuoteProductForm.calculateAndSetMargin();
        IGLQuoteProductForm.updateDiscountValue();
        IGLQuoteProductForm.calculateAndSetDiscount();
        IGLQuoteProductForm.calculateAmount();
    },

    /**
     * Handles changes to the Margin Value, updates the Margin % and Sell Price.
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    handleMarginValueChange: function() {
        IGLQuoteProductForm.updateSellPriceFromMarginValue();
        IGLQuoteProductForm.updateMarginPercentFromValue();
        IGLQuoteProductForm.updateDiscountValue();
        IGLQuoteProductForm.calculateAndSetDiscount();
    },

    /**
     * Updates the Sell Price based on the inputted Margin Value and Standard Cost.
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    updateSellPriceFromMarginValue: function() {
        var marginValue = IGLQuoteProductForm.formContext.getAttribute("igl_marginvalue").getValue();
        var costSourceIdentifier = IGLQuoteProductForm.formContext.getAttribute("igl_costsourceidentifier").getValue();
        var calculatedCost = IGLQuoteProductForm.getCostSourceIdentifierValue(costSourceIdentifier);
        if (marginValue != null && calculatedCost != null && marginValue >= 0) {
            var newSellPrice = calculatedCost + marginValue;
            IGLQuoteProductForm.formContext.getAttribute("priceperunit").setValue(newSellPrice);
        }
    },

    /**
     * Updates the Sell Price based on the inputted Margin % and Standard Cost.
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    updateSellPriceFromMargin: function() {
        var marginPercent = IGLQuoteProductForm.formContext.getAttribute("igl_margin").getValue();
        var costSourceIdentifier = IGLQuoteProductForm.formContext.getAttribute("igl_costsourceidentifier").getValue();
        var calculatedCost = IGLQuoteProductForm.getCostSourceIdentifierValue(costSourceIdentifier);

        if (marginPercent != null && calculatedCost != null) {
            var newSellPrice = calculatedCost + ((calculatedCost * marginPercent) / 100);
            IGLQuoteProductForm.formContext.getAttribute("priceperunit").setValue(newSellPrice);
        }
    },

    /**
     * Updates the Margin % based on the inputted Margin Value and Standard Cost.
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    updateMarginPercentFromValue: function() {
        var costSourceIdentifier = IGLQuoteProductForm.formContext.getAttribute("igl_costsourceidentifier").getValue();
        var calculatedCost = IGLQuoteProductForm.getCostSourceIdentifierValue(costSourceIdentifier);
        var sellPrice = IGLQuoteProductForm.formContext.getAttribute("priceperunit").getValue();

        if(calculatedCost && sellPrice){
            const twoDP = 2;
            var marginValue = (sellPrice - calculatedCost).toFixed(twoDP);
            var marginPercent = (marginValue / sellPrice) * 100;
            var marginPercentRounded = Math.round(marginPercent);
            IGLQuoteProductForm.formContext.getAttribute("igl_margin").setValue(marginPercentRounded);
        }
    },

    /**
     * Updates the Discount Value based on the inputted Discount % and Sell Price.
     *
     * @memberof IGLQuoteProductForm
     * @function
     */
    updateDiscountValue: function() {
        var originalPrice = IGLQuoteProductForm.formContext.getAttribute("igl_originalpeprice").getValue();
        var sellPrice = IGLQuoteProductForm.formContext.getAttribute("priceperunit").getValue();
        var discountValue;
        var quantity = IGLQuoteProductForm.formContext.getAttribute("quantity").getValue();

        if (originalPrice != null && sellPrice != null) {
            discountValue = originalPrice - sellPrice;
        } 
        IGLQuoteProductForm.formContext.getAttribute("igl_discountvalue").setValue(discountValue);
        IGLQuoteProductForm.formContext.getAttribute("igl_discounttotal").setValue((discountValue*quantity));
    },


    /**
     * Pass execution context to the Iframe.
     * This function passes the execution context to the Iframe.
     * @param {object} executionContext - The record to navigate to.
     */
    // This function should be registered on the form's OnLoad event
    passIframeExecutionContext:function(executionContext,webResource,createHeaders) {
        try {
            var formContext = executionContext.getFormContext();
            var IFrameCtrl = formContext.getControl(webResource);
            
            if (IFrameCtrl) {
                IFrameCtrl.getContentWindow().then(function (win) {
                    win.handleExecutionContext(executionContext,createHeaders);
                }).catch(function (error) {
                    console.error("Error getting IFrame content window: " + error.message);
                });
            }
        } catch (error) {
            console.error("An error occurred in the OnLoad function: " + error.message);
        }
    }
};