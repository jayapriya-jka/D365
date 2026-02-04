function PriceQuote(executionContext){             
    callQuoteProduct(executionContext);    
}

function callQuoteProduct(executionContext) {    
    Xrm.Utility.showProgressIndicator(Xrm.Utility.getResourceString("msdyn_d365scm_resource", "Pricing_Quote"));

        const formContext = executionContext.data 
                            ? executionContext 
                            : executionContext.getFormContext();

       var quoteProductId = formContext.data.entity.getId();
       let quoteId = formContext.getAttribute("quoteid").getValue()[0].id;
       
       if (quoteProductId != "" && quoteId != "") {
                                
        Xrm.WebApi.retrieveRecord("quote", quoteId, "?$select=msdyn_quotenumber").then(
            function success(result) {
                      
                quoteNumber = result.msdyn_quotenumber;
                company = "X200";//result.msdyn_company; 

                console.log(quoteNumber);
                
                if (quoteNumber && company) {
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
                            
                            console.log("entityName : "+entityName);

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
            }  );
        }                           
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
           console.log("Test : "+this.response);
           //formContext.data.refresh();
           disableLoading();
        }
    };
    req.send(JSON.stringify(body));
    console.log("Send request called");
}