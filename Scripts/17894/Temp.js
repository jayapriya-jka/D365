function assignIndustryToContact(executionContext){
    var formContext = executionContext.getFormContext();    
    var accountId = formContext.getAttribute("parentcustomerid").getValue(); 

    if (accountId != null){
        getIndustryName(executionContext);               
    }
}

async function getIndustryName(executionContext){
    var formContext = executionContext.getFormContext();  
    var accountId = formContext.getAttribute("parentcustomerid").getValue(); 
    var accountIdGUID = accountId[0].id;    
    let industry = await Xrm.WebApi.retrieveRecord("account", accountIdGUID, "?$select=name,industryid");  
      
    if (industry._igl_industryid_value != null){
        let industryName = await Xrm.WebApi.retrieveRecord("igl_industry", industry.industryid, "?$select=name");
        formContext.getAttribute("fieldName").setValue(industryName.name);
    }   
}


