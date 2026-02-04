function assignIndustryToContact(executionContext){
    var formContext = executionContext.getFormContext();    
    var accountId = formContext.getAttribute("parentcustomerid").getValue(); 

    if (accountId != null){
        getIndustryName(executionContext);
        getSubIndustryName(executionContext)
        /*getIndustryName(executionContext, (accountIdGUID) =>{          
            Xrm.WebApi.retrieveRecord("account", accountIdGUID, "?$select=name", ).then(
                function success(result) {console.log("Estimated values: " + result.name);
                })
        })*/        
    }
}

async function getIndustryName(executionContext){
    var formContext = executionContext.getFormContext();  
    var accountId = formContext.getAttribute("parentcustomerid").getValue(); 
    var accountIdGUID = accountId[0].id;
    //console.log("accountId: " + accountIdGUID);
    let industry = await Xrm.WebApi.retrieveRecord("account", accountIdGUID, "?$select=name,_igl_industryid_value");
    //console.log("Accoount Name: " + industry.name);
    //console.log("industryId: " + industry._igl_industryid_value);
    if (industry._igl_industryid_value != null){
        let industryName = await Xrm.WebApi.retrieveRecord("igl_industry", industry._igl_industryid_value, "?$select=igl_name");
        formContext.getAttribute("xma_industry").setValue(industryName.igl_name);
    }   
}

async function getSubIndustryName(executionContext){
    var formContext = executionContext.getFormContext();  
    var accountId = formContext.getAttribute("parentcustomerid").getValue(); 
    var accountIdGUID = accountId[0].id;
    //console.log("accountId: " + accountIdGUID);
    let subIndustry = await Xrm.WebApi.retrieveRecord("account", accountIdGUID, "?$select=name,_igl_subindustryid_value");
    //console.log("Accoount Name: " + industry.name);
    //console.log("industryId: " + industry._igl_industryid_value);
    if (subIndustry._igl_subindustryid_value != null){
        let subIndustryName = await Xrm.WebApi.retrieveRecord("igl_subindustry", subIndustry._igl_subindustryid_value, "?$select=igl_name");
        formContext.getAttribute("xma_subindustry").setValue(subIndustryName.igl_name);
    }   
}

/*function getIndustryName(executionContext, callback){
    var formContext = executionContext.getFormContext();  
    var accountId = formContext.getAttribute("parentcustomerid").getValue(); 
    var accountIdGUID = accountId[0].id;
    console.log("accountId: " + accountIdGUID);
    var industryId = callback(accountIdGUID);
    console.log("industryId: " + industryId);
}*/