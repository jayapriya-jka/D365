function validateXMAVATFlag(executionContext){
	var formContext = executionContext.getFormContext();

    var vatFlag = formContext.getAttribute("xma_xmavatexemptflag").getValue();
        
    if (vatFlag == true){
        var quoteIdGUID = formContext.data.entity.getId();
        quoteIdGUID     = quoteIdGUID.replace("{", '').replace("}", ''); 
        var totaltax = formContext.getAttribute("totaltax").getValue();   
        var totalamount = formContext.getAttribute("totalamount").getValue();  
        totalamount -= totaltax;
        var data =
        {
            "totaltax": 0,   
            "totalamount": totalamount         
        }        
        Xrm.WebApi.updateRecord("quote", quoteIdGUID, data).then(
            function success(result) {
                console.log("Removed tax");            
            },
            function (error) {
                console.log(error.message);                
            });

        formContext.data.refresh(true);
    }
    else{
        PriceQuote(formContext)
    }    
}

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