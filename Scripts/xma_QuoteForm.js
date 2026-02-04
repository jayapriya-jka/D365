function onSave(executionContext){             
    callQuote(executionContext);    
}

function callQuote(executionContext) {    
        const formContext = executionContext.data 
                            ? executionContext 
                            : executionContext.getFormContext();       
       var totalMargin = 0;
       var totalMarginPercentage = 0;       
       let totallineitemamount = formContext.getAttribute("totallineitemamount").getValue();
       let igl_totalchargevalue = formContext.getAttribute("igl_totalchargevalue").getValue();
       let xma_totalcost = formContext.getAttribute("xma_totalcost").getValue();
       let freightamount = formContext.getAttribute("freightamount").getValue();

       totalMargin = totallineitemamount - igl_totalchargevalue - xma_totalcost + freightamount; 
       totalMarginPercentage = totallineitemamount > 0 ? roundToDecimal((totalMargin / totallineitemamount * 100), 2) : 0;  

       formContext.getAttribute("xma_totalmargin").setValue(totalMargin);
       formContext.getAttribute("xma_margin").setValue(totalMarginPercentage);                                      
}

function roundToDecimal(marginPercent, decimals) {
    let factor = Math.pow(10, decimals);
    return Math.round(marginPercent * factor) / factor;
  }
