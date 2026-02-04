function getAccountNumberAsync(primaryControl) {
    return new Promise(function (resolve, reject) {
        var formContext = primaryControl;
        var customerField = formContext.getAttribute("customerid");

        if (customerField && customerField.getValue() !== null) {
            var customer = customerField.getValue()[0];

            if (customer.entityType === "account") {
                var accountId = customer.id.replace("{", "").replace("}", "");

                Xrm.WebApi.retrieveRecord("account", accountId, "?$select=accountnumber").then(
                    function (result) {
                        resolve(result.accountnumber);
                    },
                    function (error) {
                        reject("Error retrieving account: " + error.message);
                    }
                );
            } else {
                reject("Selected customer is not an Account.");
            }
        } else {
            reject("No customer selected.");
        }
    });
}

var callGlobalQuoteAction = window.callGlobalQuoteAction || {
    checkPrices: function(primaryControl) {
        var formContext = primaryControl;
        var quoteId = formContext.data.entity.getId();

        if (!quoteId) {
            Xrm.Navigation.openAlertDialog({ text: "Quote ID not found." });
            return;
        }

        quoteId = quoteId.replace("{", "").replace("}", "");

        getAccountNumberAsync(primaryControl)
            .then(function (accountNumber) {
                if (!accountNumber) {
                    throw new Error("Account number not found.");
                }

                var request = {
                    QuoteGUID: quoteId,
                    CustomerID: accountNumber,
                    getMetadata: function () {
                        return {
                            boundParameter: null,
                            parameterTypes: {
                                "QuoteGUID": {
                                    typeName: "Edm.String",
                                    structuralProperty: 1
                                },
                                "CustomerID": {
                                    typeName: "Edm.String",
                                    structuralProperty: 1
                                }
                            },
                            operationName: "xma_XMAGetPrice",
                            operationType: 0
                        };
                    }
                };

                return Xrm.WebApi.online.execute(request);
            })
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Global action failed.");
                }
            })
            .then(function (data) {
                var message = data.OutputMessage && data.OutputMessage !== "NONE"
                    ? "Price(s) have been changed to the following products:\n" + data.OutputMessage
                    : "Global action executed successfully with no price changes.";

                Xrm.Navigation.openAlertDialog({ text: message });
            })
            .catch(function (error) {
                Xrm.Navigation.openAlertDialog({ text: "Error: " + error.message });
            });
    }
};