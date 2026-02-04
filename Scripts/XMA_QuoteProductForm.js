function PriceQuote(executionContext){             

    callQuoteProduct(executionContext);    
}

function callQuoteProduct(executionContext) {    
    //Xrm.Utility.showProgressIndicator(Xrm.Utility.getResourceString("msdyn_d365scm_resource", "Pricing_Quote"));

        const formContext = executionContext.data 
                            ? executionContext 
                            : executionContext.getFormContext();

       var quoteProductId = formContext.data.entity.getId();
       var totalMargin = 0;
       var totalMarginPercentage = 0;
       let quoteId = formContext.getAttribute("quoteid").getValue()[0].id;
              
       if (quoteProductId != "" && quoteId != "") {
                                
        Xrm.WebApi.retrieveRecord("quote", quoteId, "?$select=msdyn_quotenumber,totallineitemamount,igl_totalchargevalue,xma_totalcost,freightamount").then(
            async function success(result) {
                      
                quoteNumber = result.msdyn_quotenumber;
                totalMargin = result.totallineitemamount - result.igl_totalchargevalue - result.xma_totalcost + result.freightamount; 
                totalMarginPercentage = result.totallineitemamount > 0 ? roundToDecimal((totalMargin / result.totallineitemamount * 100), 2) : 0;
                company = "X200";//result.msdyn_company; 
                
                if (totalMargin > 0) {
                        // Update the quote product with the new price
                        let updateData = {
                            xma_totalmargin: totalMargin,
                            xma_margin: totalMarginPercentage
                        };

                        await Xrm.WebApi.updateRecord("quote", quoteId, updateData).then(
                            function success(result) {
                                console.log("Quote updated successfully : " +totalMargin+ " - "+totalMarginPercentage);
                            },
                            function (error) {
                                alert(error.message);
                            }
                        );
                    }

                console.log(quoteNumber);                                
            }  );
        }                           
}

function roundToDecimal(marginPercent, decimals) {
    let factor = Math.pow(10, decimals);
    return Math.round(marginPercent * factor) / factor;
  }
