/*
 * The QuoteActivateQuoteViewModel is a JavaScript model which encapsulates the Quote create order functionality.
 * Replicates functionality in QuoteCreateOrderViewModel.js with some slight amendments
 *
 * @version 1.0.0.0
 * @author  Incremental Group
 * @param   {object}    ppLibrary               An instance of the IncrementalPPLibrary model
 * @param   {object}    validationModel         An instance of the QuoteValidationViewModel model
 */
var QuoteActivateQuoteViewModel = function(ppLibrary, validationModel){
    const _model = this;

    const _ppLibrary = ppLibrary;

    const _quote = {
        Statuses: {
            Draft: 0,
            Active: 1,
            Won: 2,
            ErrorMessage: "Quote is not in a Draft state."
        }
    };

    const _validationModel = validationModel;

    /*
     * Asynchronously validates the Quote, the Quote Product lines, and invokes the inbuild Create Order Functionality.
     *
     * @accessibility {public}
     */ 
    _model.activateQuoteAsync = async function(){
        try{
            const validation = await validateAsync();
            if(validation.IsSuccess){
                invokeActivateQuoteRibbonAction();
            } else {
                getUserConfirmation(validation);
            }

        } catch(error){
            const errorCode = "QCO-001";
            const message = `Unable to activate quote as an error occurred.`;
            _ppLibrary.showErrorMessage(errorCode, error.message, message);

        } finally{
            _ppLibrary.closeSpinnerDialog();
        }
    };

    /*
     * Asynchronously validates the Quote, the Quote Product lines, and invokes the inbuild Create Order Functionality without user's confirmation.
     *
     * @accessibility {public}
     */ 
    _model.XMA_ActivateQuoteAsync = async function(){
        try{
            const validation = await validateAsync();
            invokeActivateQuoteRibbonAction();                                  
        } catch(error){
            const errorCode = "QCO-001";
            const message = `Unable to activate quote as an error occurred.`;
            _ppLibrary.showErrorMessage(errorCode, error.message, message);

        } finally{
            _ppLibrary.closeSpinnerDialog();
        }
    };

    /*
     * Opens a dialog that displays a validation error to the user and confirms whether they wish to proceed to create the order.
     *
     * @accessibility {private}
     * @param   {object}    The validation result
     *              - {string array or null}    Errors      An array of validation errors.
     *              - {Boolean}                 IsSuccess   A Boolean flag indicating whether the validation succeeded.
     *              - {string or null}          Message     The message of the validation failure.
     */
    var getUserConfirmation = function(validation){
        var options = {
            confirmButtonLabel: "Activate Quote",
            height: 400,
            text: `${_validationModel.getErrorFromValidation(validation)} \n\nDo you wish to activate this quote?`,
            title: "Activate Quote",
            subtitle: "Validation Failed!",
            width: 500
        };
        _ppLibrary.openConfirmDialog(options, invokeActivateQuoteRibbonAction, onCancel);
    };

    /*
     * Invokes the inbuild Microsoft Activate Quote ribbon action/function.
     *
     * @accessibility {private}
     */  
    var invokeActivateQuoteRibbonAction = function(){
        _ppLibrary.showSpinnerDialog("Activating Quote...");
        Sales.QuoteRibbonActions.Instance.activateQuote();
        _ppLibrary.closeSpinnerDialog();
    };

    /*
     * The method called when the user decides not to proceed creating the order.
     * Closes the spinner dialog.
     *
     * @accessibility {private}
     */  
    var onCancel = function(){
        _ppLibrary.closeSpinnerDialog();
    };

    /*
     * Asynchronously validates the quote and it's related entities.
     *
     * @accessibility {private}
     * @return  {object}    The validation result.
     *              - {string array or null}    Errors      An array of validation errors.
     *              - {Boolean}                 IsSuccess   A Boolean flag indicating whether the validation succeeded.
     *              - {string or null}          Message     A message string indicating the cause/reason for the failure.
     */
    var validateAsync = async function(){
        _ppLibrary.showSpinnerDialog("Validating Quote for Activation...");

        var statusDetails = {
            Expected: [ _quote.Statuses.Draft ],
            ErrorMessage: _quote.Statuses.ErrorMessage
        };

        return await _validationModel.validateAsync(statusDetails);
    };

    return _model;
};