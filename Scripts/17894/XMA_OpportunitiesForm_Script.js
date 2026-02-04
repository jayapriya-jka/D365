//async function validateVendor(executionContext) {
    function validateVendor(executionContext) {
        
        var formContext = executionContext.getFormContext();   
        var opportunityGUID = Xrm.Page.data.entity.getId();
        var margin = formContext.getAttribute("igl_margin").getValue(); 
        var revenue = formContext.getAttribute("estimatedvalue").getValue();
        var revenueBrand = formContext.getAttribute("xma_opportunitybrandrevenuetotal").getValue();
        var marginBrand = formContext.getAttribute("xma_opportunitybrandmargintotal").getValue();

        /*
            
        if (revenueBrand != null && marginBrand != null)
        {                
            if (margin != marginBrand)// || margin != marginContractPeriods)
            {
                formContext.ui.setFormNotification("Margin doesn't match with vendor's margin. Amend Margin.", "WARNING", "MarginWarning");
                //alert("Estimate revenue doesn't match with Brand revenue and/or Contract periods. Amend Est. Revenue!");
            }
            else
            {
                Xrm.Page.ui.clearFormNotification("MarginWarning");
            }

            if (revenue != revenueBrand)// || revenue != revenueContractPeriods)
            {
                formContext.ui.setFormNotification("Estimated revenue doesn't match with vendor's revenue. Amend Est. Revenue.", "WARNING", "RevenueWarning");
                //alert("Estimate revenue doesn't match with Brand revenue and/or Contract periods. Amend Est. Revenue!");
            }
            else
            {
                formContext.ui.clearFormNotification("RevenueWarning");
            }                                                                                                    
        }     
            */   
    }
    
    //async function validateContract(executionContext) {
        function validateContract(executionContext) {
        var formContext = executionContext.getFormContext();        
        var opportunityGUID = Xrm.Page.data.entity.getId();
        var margin = formContext.getAttribute("igl_margin").getValue();
        var revenue = formContext.getAttribute("estimatedvalue").getValue();
        var marginContractPeriods = formContext.getAttribute("xma_opportunitycontractperiodmargintotal").getValue();
        var revenueContractPeriods = formContext.getAttribute("xma_opportunitycontractperiodtotal").getValue(); 
    
        /*
        if (marginContractPeriods != null && revenueContractPeriods != null)
        {                
            if (margin != marginContractPeriods)
            {
                formContext.ui.setFormNotification("Margin doesn't match with contract period's margin. Amend Margin.", "WARNING", "MarginWarningContract");
                //alert("Estimate revenue doesn't match with Brand revenue and/or Contract periods. Amend Est. Revenue!");
            }
            else
            {
                Xrm.Page.ui.clearFormNotification("MarginWarningContract");
            }

            if (revenue != revenueContractPeriods)
            {
                formContext.ui.setFormNotification("Estimated revenue doesn't match with contract period's revenue. Amend Est. Revenue.", "WARNING", "RevenueWarningContract");
                //alert("Estimate revenue doesn't match with Brand revenue and/or Contract periods. Amend Est. Revenue!");
            }
            else
            {
                formContext.ui.clearFormNotification("RevenueWarningContract");
            }                                                                                                         
        }
            */
    }
    
    function validateRevenueBalance(executionContext){          
        validateVendor(executionContext);
        validateContract(executionContext);    
    }
    
    function updateOpportunityBrandRevenueTotal(executionContext){
        //alert("This is an example of a JavaScript alert window.");
        var formContext = executionContext.getFormContext();    
        var opportunityId = formContext.getAttribute("igl_opportunityid").getValue(); 
        var primaryOffer = formContext.getAttribute("igl_primaryofferbool").getValue(); 
        
        /*
        if (opportunityId != null && opportunityId != '' && primaryOffer == true)
        {
            var entityName = "igl_opportunitybrand";
            var recordId = opportunityId[0].id;
    
            var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitybrand'><attribute name='igl_estrevenue'/><filter><condition attribute='igl_opportunityid' operator='eq' value='"+recordId+"'/><condition attribute='igl_primaryofferbool' operator='eq' value='1'/><condition attribute='statuscode' operator='eq' value='1'/></filter></entity></fetch>";
    
            Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
            .then(
                function success(result) {
                    var brandRevenueTotal = 0;
                    for (var i = 0; i < result.entities.length; i++) {
                        console.log(result.entities[i].igl_estrevenue);
                        brandRevenueTotal += result.entities[i].igl_estrevenue;
                        }     
                        
                        var brandRevenue = formContext.getAttribute("igl_estrevenue").getValue();  
                        var entityName = "opportunity";
                        var recordId = opportunityId[0].id;
                        brandRevenueTotal += brandRevenue;
    
                        Xrm.WebApi.retrieveRecord(entityName, recordId, "?$select=estimatedvalue").then(
                            function success(result) {
                                console.log("Estimated values: " + result.estimatedvalue);
    
                                
                                if(brandRevenueTotal > result.estimatedvalue)
                                {         
                                    //alert('');                       
                                    formContext.getControl("igl_estrevenue").setNotification("The opportunity header £"+result.estimatedvalue+" rev is the total value of the opportunity. The estimated £"+brandRevenueTotal+" rev cannot exceed the header value. All vendors marked 'yes' for primary offer must total the opportunity header value. Please adjust the required primary offer (y/n) or values in each vendor to equal the opportunity header value.");
                                }
                                else{
                                    formContext.getControl("igl_estrevenue").clearNotification();
                                }                                
                            },
                            function (error) {
                                console.log(error.message);
                                // handle error conditions
                            }
                        );
                                                                    
                },
                function (error) {
                    console.log(error.message);                
                }
            );                        
        }
        else{
            formContext.getControl("igl_estrevenue").clearNotification();
        }
         
        */ 
    }
    
    function updateOpportunityBrandMarginTotal(executionContext){    
        var formContext = executionContext.getFormContext();    
        var opportunityId = formContext.getAttribute("igl_opportunityid").getValue(); 
        var primaryOffer = formContext.getAttribute("igl_primaryofferbool").getValue(); 
        /*               
        if (opportunityId != null && opportunityId != '' && primaryOffer == true)
        {
            var entityName = "igl_opportunitybrand";
            var recordId = opportunityId[0].id;
    
            var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitybrand'><attribute name='igl_estmargin'/><filter><condition attribute='igl_opportunityid' operator='eq' value='"+recordId+"'/><condition attribute='igl_primaryofferbool' operator='eq' value='1'/><condition attribute='statuscode' operator='eq' value='1'/></filter></entity></fetch>";
    
            Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
            .then(
                function success(result) {
                    var brandRevenueTotal = 0;
                    for (var i = 0; i < result.entities.length; i++) {
                        console.log(result.entities[i].igl_estmargin);
                        brandRevenueTotal += result.entities[i].igl_estmargin;
                        }     
                        
                        var brandRevenue = formContext.getAttribute("igl_estmargin").getValue();  
                        var entityName = "opportunity";
                        var recordId = opportunityId[0].id;
                        brandRevenueTotal += brandRevenue;
    
                        Xrm.WebApi.retrieveRecord(entityName, recordId, "?$select=igl_margin").then(
                            function success(result) {
                                console.log("Estimated values: " + result.igl_margin);
    
                                
                                if(brandRevenueTotal > result.igl_margin)
                                {         
                                    //alert('');                       
                                    formContext.getControl("igl_estmargin").setNotification("The opportunity header £"+result.igl_margin+" margin is the total value of the opportunity. The estimated £"+brandRevenueTotal+" margin cannot exceed the header value. All vendors marked 'yes' for primary offer must total the opportunity header value. Please adjust the required primary offer (y/n) or values in each vendor to equal the opportunity header value.");
                                }
                                else{
                                    formContext.getControl("igl_estmargin").clearNotification();
                                }                                
                            },
                            function (error) {
                                console.log(error.message);
                                // handle error conditions
                            }
                        );
                                                                
                },
                function (error) {
                    console.log(error.message);                
                }
            );                
        } 
        else{
            formContext.getControl("igl_estmargin").clearNotification();
        }   
            */
    }
    
    function updateOpportunityContractPeriodRevenueTotal(executionContext){    
        var formContext     = executionContext.getFormContext();
        var opportunityId   = formContext.getAttribute("igl_opportunity_id").getValue();  
        /*
        if (opportunityId != null && opportunityId != '')
        {                  
            var entityName = "igl_opportunitycontractperiod";
            var recordId = opportunityId[0].id;
    
            //var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitycontractperiod'><attribute name='igl_estrevenue_value'/><filter><condition attribute='igl_opportunity_id' operator='eq' value='"+recordId+"'/></filter></entity></fetch>";
            var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitycontractperiod'><attribute name='igl_estrevenue_value'/><filter><condition attribute='igl_opportunity_id' operator='eq' value='"+recordId+"'/><condition attribute='statuscode' operator='eq' value='1'/></filter></entity></fetch>";
    
            Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
            .then(
                function success(result) {
                    var pricingContractRevenueTotal = 0;
                    for (var i = 0; i < result.entities.length; i++) {
                        console.log(result.entities[i].igl_estrevenue_value);
                        pricingContractRevenueTotal += result.entities[i].igl_estrevenue_value;
                        }     
                        
                        var pricingContractRevenue = formContext.getAttribute("igl_estrevenue_value").getValue();                                            
    
                        var entityName = "opportunity";
                        var recordId = opportunityId[0].id;                    
                        pricingContractRevenueTotal += pricingContractRevenue;
    
                        Xrm.WebApi.retrieveRecord(entityName, recordId, "?$select=estimatedvalue").then(
                            function success(result) {
                                console.log("Estimated values: " + result.estimatedvalue);
                            
                            if(pricingContractRevenueTotal > result.estimatedvalue)
                            {         
                                var contractName   = formContext.getAttribute("igl_name").getValue();
                                //alert('');                       
                                formContext.getControl("igl_estrevenue_value").setNotification("The opportunity header £"+result.estimatedvalue+" rev value is the total value of the opportunity. The estimated £"+pricingContractRevenueTotal+" rev cannot exceed the header value. Please adjust the required contract period "+contractName+" rev values to equal the sum total in the opportunity header.");
                            }
                            else{
                                formContext.getControl("igl_estrevenue_value").clearNotification();
                            }                            
                        });                  
                },
                function (error) {
                    console.log(error.message);                
                }
            ); 
        }    
        */    
    }
    
    function updateOpportunityContractPeriodMarginTotal(executionContext){    
        var formContext     = executionContext.getFormContext();
        var opportunityId   = formContext.getAttribute("igl_opportunity_id").getValue();  
        /*                   
        if (opportunityId != null && opportunityId != '')
        {                  
            var entityName = "igl_opportunitycontractperiod";
            var recordId = opportunityId[0].id;
    
            var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitycontractperiod'><attribute name='igl_margin_value'/><filter><condition attribute='igl_opportunity_id' operator='eq' value='"+recordId+"'/><condition attribute='statuscode' operator='eq' value='1'/></filter></entity></fetch>";
    
            Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
            .then(
                function success(result) {
                    var pricingContractRevenueTotal = 0;
                    for (var i = 0; i < result.entities.length; i++) {
                        console.log(result.entities[i].igl_margin_value);
                        pricingContractRevenueTotal += result.entities[i].igl_margin_value;
                        }     
                        
                        var pricingContractRevenue = formContext.getAttribute("igl_margin_value").getValue();                      
                        var entityName = "opportunity";
                        var recordId = opportunityId[0].id;
                        pricingContractRevenueTotal += pricingContractRevenue;
    
                        Xrm.WebApi.retrieveRecord(entityName, recordId, "?$select=igl_margin").then(
                            function success(result) {
                                console.log("Estimated values: " + result.igl_margin);
                            
                            if(pricingContractRevenueTotal > result.igl_margin)
                            {         
                                //alert(''); 
                                var contractName   = formContext.getAttribute("igl_name").getValue();                      
                                formContext.getControl("igl_margin_value").setNotification("The opportunity header margin £"+result.igl_margin+" value is the total value of the opportunity. The estimated margin £"+pricingContractRevenueTotal+" cannot exceed the header value. Please adjust the required contract period margin "+contractName+" values to equal the sum total in the opportunity header.");
                            }
                            else{
                                formContext.getControl("igl_margin_value").clearNotification();
                            }                            
                        });                  
                },
                function (error) {
                    console.log(error.message);                
                }
            ); 
        } */       
    }
    
    function updateOpportunityContractPeriodRevenueTotal_update(executionContext){    
        var formContext     = executionContext.getFormContext();
        var opportunityId   = formContext.getAttribute("igl_opportunity_id").getValue();  
        /*
        if (opportunityId != null && opportunityId != '')
        {                  
            var entityName = "igl_opportunitycontractperiod";
            var recordId = opportunityId[0].id;
    
            var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitycontractperiod'><attribute name='igl_estrevenue_value'/><filter><condition attribute='igl_opportunity_id' operator='eq' value='"+recordId+"'/><condition attribute='statuscode' operator='eq' value='1'/></filter></entity></fetch>";
    
            Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
            .then(
                function success(result) {
                    var pricingContractRevenueTotal = 0;
                    for (var i = 0; i < result.entities.length; i++) {
                        console.log(result.entities[i].igl_estrevenue_value);
                        pricingContractRevenueTotal += result.entities[i].igl_estrevenue_value;
                        }     
                        
                        var pricingContractRevenue = formContext.getAttribute("igl_estrevenue_value").getValue();    
                        var pricingContractRevenueBase = formContext.getAttribute("igl_estrevenue_value_base").getValue();                     
    
                        var entityName = "opportunity";
                        var recordId = opportunityId[0].id;
                        
                        pricingContractRevenueTotal += pricingContractRevenue - pricingContractRevenueBase;
                        
    
                        Xrm.WebApi.retrieveRecord(entityName, recordId, "?$select=estimatedvalue").then(
                            function success(result) {
                                console.log("Estimated values: " + result.estimatedvalue);
                            
                            if(pricingContractRevenueTotal > result.estimatedvalue)
                            {         
                                var contractName   = formContext.getAttribute("igl_name").getValue();
                                //alert('');                       
                                formContext.getControl("igl_estrevenue_value").setNotification("The opportunity header £"+result.estimatedvalue+" rev value is the total value of the opportunity. The estimated £"+pricingContractRevenueTotal+" rev cannot exceed the header value. Please adjust the required contract period "+contractName+" rev values to equal the sum total in the opportunity header.");
                            }
                            else
                            {
                                formContext.getControl("igl_estrevenue_value").clearNotification();                                
                            }
                        });                  
                },
                function (error) {
                    console.log(error.message);                
                }
            ); 
        }   
        */     
    }
    
    function updateOpportunityContractPeriodMarginTotal_Update(executionContext){    
        var formContext     = executionContext.getFormContext();
        var opportunityId   = formContext.getAttribute("igl_opportunity_id").getValue();  
        /*              
        if (opportunityId != null && opportunityId != '')
        {                  
            var entityName = "igl_opportunitycontractperiod";
            var recordId = opportunityId[0].id;
    
            var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitycontractperiod'><attribute name='igl_margin_value'/><filter><condition attribute='igl_opportunity_id' operator='eq' value='"+recordId+"'/><condition attribute='statuscode' operator='eq' value='1'/></filter></entity></fetch>";
    
            Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
            .then(
                function success(result) {
                    var pricingContractRevenueTotal = 0;
                    for (var i = 0; i < result.entities.length; i++) {
                        console.log(result.entities[i].igl_margin_value);
                        pricingContractRevenueTotal += result.entities[i].igl_margin_value;
                        }     
                        
                        var pricingContractRevenue = formContext.getAttribute("igl_margin_value").getValue();   
                        var pricingContractMarginBase = formContext.getAttribute("igl_margin_value_base").getValue();                   
                        var entityName = "opportunity";
                        var recordId = opportunityId[0].id;
                        pricingContractRevenueTotal += pricingContractRevenue - pricingContractMarginBase;
    
                        Xrm.WebApi.retrieveRecord(entityName, recordId, "?$select=igl_margin").then(
                            function success(result) {
                                console.log("Estimated values: " + result.igl_margin);
                            
                            if(pricingContractRevenueTotal > result.igl_margin)
                            {         
                                //alert(''); 
                                var contractName   = formContext.getAttribute("igl_name").getValue();                      
                                formContext.getControl("igl_margin_value").setNotification("The opportunity header margin £"+result.igl_margin+" value is the total value of the opportunity. The estimated margin £"+pricingContractRevenueTotal+" cannot exceed the header value. Please adjust the required contract period margin "+contractName+" values to equal the sum total in the opportunity header.");
                            }
                            else
                            {
                                formContext.getControl("igl_margin_value").clearNotification();                                
                            }
                        });                  
                },
                function (error) {
                    console.log(error.message);                
                }
            ); 
        }  */      
    }
    
    function updateOpportunityBrandRevenueTotal_update(executionContext){
        //alert("This is an example of a JavaScript alert window.");
        var formContext = executionContext.getFormContext();    
        var opportunityId = formContext.getAttribute("igl_opportunityid").getValue();  
        var primaryOffer = formContext.getAttribute("igl_primaryofferbool").getValue();  
                 /*      
        if (opportunityId != null && opportunityId != '' && primaryOffer == true)
        {
            var entityName = "igl_opportunitybrand";
            var recordId = opportunityId[0].id;
    
            var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitybrand'><attribute name='igl_estrevenue'/><filter><condition attribute='igl_opportunityid' operator='eq' value='"+recordId+"'/><condition attribute='igl_primaryofferbool' operator='eq' value='1'/><condition attribute='statuscode' operator='eq' value='1'/></filter></entity></fetch>";
    
            Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
            .then(
                function success(result) {
                    var brandRevenueTotal = 0;
                    for (var i = 0; i < result.entities.length; i++) {
                        console.log(result.entities[i].igl_estrevenue);
                        brandRevenueTotal += result.entities[i].igl_estrevenue;
                        }     
                        
                        var brandRevenue = formContext.getAttribute("igl_estrevenue").getValue();  
                        var pricingBrandRevenueBase = formContext.getAttribute("igl_estrevenue_base").getValue();
                        var entityName = "opportunity";
                        var recordId = opportunityId[0].id;                    
                        brandRevenueTotal += brandRevenue - pricingBrandRevenueBase;                    
    
                        Xrm.WebApi.retrieveRecord(entityName, recordId, "?$select=estimatedvalue").then(
                            function success(result) {
                                console.log("Estimated values: " + result.estimatedvalue);
    
                                
                                if(brandRevenueTotal > result.estimatedvalue)
                                {         
                                    //alert('');                       
                                    formContext.getControl("igl_estrevenue").setNotification("The opportunity header £"+result.estimatedvalue+" rev is the total value of the opportunity. The estimated £"+brandRevenueTotal+" rev cannot exceed the header value. All vendors marked 'yes' for primary offer must total the opportunity header value. Please adjust the required primary offer (y/n) or values in each vendor to equal the opportunity header value.");
                                }
                                else{
                                    formContext.getControl("igl_estrevenue").clearNotification();
                                }                                
                            },
                            function (error) {
                                console.log(error.message);
                                // handle error conditions
                            }
                        );                                                                    
                },
                function (error) {
                    console.log(error.message);                
                }
            );                        
        }
        */
    }
    
    function updateOpportunityBrandMarginTotal_update(executionContext){    
        var formContext = executionContext.getFormContext();    
        var opportunityId = formContext.getAttribute("igl_opportunityid").getValue(); 
        var primaryOffer = formContext.getAttribute("igl_primaryofferbool").getValue();   
          /*             
        if (opportunityId != null && opportunityId != '' && primaryOffer == true)
        {
            var entityName = "igl_opportunitybrand";
            var recordId = opportunityId[0].id;
    
            var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitybrand'><attribute name='igl_estmargin'/><filter><condition attribute='igl_opportunityid' operator='eq' value='"+recordId+"'/><condition attribute='igl_primaryofferbool' operator='eq' value='1'/><condition attribute='statuscode' operator='eq' value='1'/></filter></entity></fetch>";
    
            Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
            .then(
                function success(result) {
                    var brandRevenueTotal = 0;
                    for (var i = 0; i < result.entities.length; i++) {
                        console.log(result.entities[i].igl_estmargin);
                        brandRevenueTotal += result.entities[i].igl_estmargin;
                        }     
                        
                        var brandRevenue = formContext.getAttribute("igl_estmargin").getValue();  
                        var pricingBrandMarginBase = formContext.getAttribute("igl_estmargin_base").getValue(); 
                        var entityName = "opportunity";
                        var recordId = opportunityId[0].id;
                        brandRevenueTotal += brandRevenue - pricingBrandMarginBase;
    
                        Xrm.WebApi.retrieveRecord(entityName, recordId, "?$select=igl_margin").then(
                            function success(result) {
                                console.log("Estimated values: " + result.igl_margin);
    
                                
                                if(brandRevenueTotal > result.igl_margin)
                                {         
                                    //alert('');                       
                                    formContext.getControl("igl_estmargin").setNotification("The opportunity header £"+result.igl_margin+" margin is the total value of the opportunity. The estimated £"+brandRevenueTotal+" margin cannot exceed the header value. All vendors marked 'yes' for primary offer must total the opportunity header value. Please adjust the required primary offer (y/n) or values in each vendor to equal the opportunity header value.");
                                }
                                else{
                                    formContext.getControl("igl_estmargin").clearNotification();
                                }                                                                
                            },
                            function (error) {
                                console.log(error.message);
                                // handle error conditions
                            }
                        );
                                                                
                },
                function (error) {
                    console.log(error.message);                
                }
            );                
        } 
        */   
    }
    
    function clearNotifications(executionContext){
        var formContext = executionContext.getFormContext();
        var primaryOffer = formContext.getAttribute("igl_primaryofferbool").getValue();
        if (primaryOffer == true){
            updateOpportunityBrandRevenueTotal(executionContext);
            updateOpportunityBrandMarginTotal(executionContext);        
        }
        else{
            formContext.getControl("igl_estmargin").clearNotification();
            formContext.getControl("igl_estrevenue").clearNotification();                
        }
    }
    
    function onSaveMarginUpdate(executionContext){
        var formContext = executionContext.getFormContext();    
        var opportunityId = formContext.getAttribute("igl_opportunityid").getValue(); 
        var primaryOffer = formContext.getAttribute("igl_primaryofferbool").getValue();   
            /*              
        if (opportunityId != null && opportunityId != '' && primaryOffer == true)
        {
            var entityName = "igl_opportunitybrand";
            var recordId = opportunityId[0].id;
    
            var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitybrand'><attribute name='igl_estrevenue'/><attribute name='igl_estmargin'/><filter><condition attribute='igl_opportunityid' operator='eq' value='"+recordId+"'/><condition attribute='igl_primaryofferbool' operator='eq' value='1'/><condition attribute='statuscode' operator='eq' value='1'/></filter></entity></fetch>";
    
            Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
            .then(
                function success(result) {
                    var brandRevenueTotal = 0;
                    var brandMarginTotal = 0;
                    for (var i = 0; i < result.entities.length; i++) {
                        console.log(result.entities[i].igl_estrevenue);
                        brandRevenueTotal += result.entities[i].igl_estrevenue;
                        brandMarginTotal += result.entities[i].igl_estmargin;
                        }     
                        
                        var brandRevenue = formContext.getAttribute("igl_estrevenue").getValue(); 
                        var brandMargin = formContext.getAttribute("igl_estmargin").getValue(); 
                        var pricingBrandRevenueBase = formContext.getAttribute("igl_estrevenue_base").getValue();
                        var pricingBrandMarginBase = formContext.getAttribute("igl_estmargin_base").getValue();                      
                        var entityName = "opportunity";
                        var recordId = opportunityId[0].id;
    
                        brandRevenueTotal += brandRevenue - pricingBrandRevenueBase;
                        brandMarginTotal += brandMargin - pricingBrandMarginBase;
                             
                        brandRevenueTotal = Math.abs(brandRevenueTotal);
                        brandMarginTotal = Math.abs(brandMarginTotal);
                        console.log(brandRevenueTotal);
                        console.log(brandMarginTotal);
    
                        var data =
                        {
                            "xma_opportunitybrandrevenuetotal": brandRevenueTotal, 
                            "xma_opportunitybrandmargintotal": brandMarginTotal
                        }
                                        
                        Xrm.WebApi.updateRecord(entityName, recordId, data)
                        .then(
                            function success(result) {                                                                
                                console.log('Revenue updated');                                                                                    
                            },
                            function (error) {
                                console.log(error.message);                            
                            }
                        );                                                                                                                                         
                },
                function (error) {
                    console.log(error.message);                
                }
            );                
        }
        */
    }
    
    function onSaveContractPeriodUpdate(executionContext){
        var formContext     = executionContext.getFormContext();
        var opportunityId   = formContext.getAttribute("igl_opportunity_id").getValue();  
         /*                  
        if (opportunityId != null && opportunityId != '')
        {                  
            var entityName = "igl_opportunitycontractperiod";
            var recordId = opportunityId[0].id;
    
            var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitycontractperiod'><attribute name='igl_estrevenue_value'/><attribute name='igl_margin_value'/><filter><condition attribute='igl_opportunity_id' operator='eq' value='"+recordId+"'/><condition attribute='statuscode' operator='eq' value='1'/></filter></entity></fetch>";
    
            Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
            .then(
                function success(result) {
                    var pricingContractRevenueTotal = 0;
                    var pricingContractMarginTotal = 0;
                    for (var i = 0; i < result.entities.length; i++) {
                        console.log(result.entities[i].igl_estrevenue_value);
                        pricingContractRevenueTotal += result.entities[i].igl_estrevenue_value;
                        pricingContractMarginTotal += result.entities[i].igl_margin_value;
                        }     
                        
                        var pricingContractRevenue = formContext.getAttribute("igl_estrevenue_value").getValue();    
                        var pricingContractRevenueBase = formContext.getAttribute("igl_estrevenue_value_base").getValue(); 
                        var pricingContractMargin = formContext.getAttribute("igl_margin_value").getValue();   
                        var pricingContractMarginBase = formContext.getAttribute("igl_margin_value_base").getValue();                     
    
                        var entityName = "opportunity";
                        var recordId = opportunityId[0].id;
                        
                        pricingContractRevenueTotal += pricingContractRevenue - pricingContractRevenueBase;
                        pricingContractMarginTotal += pricingContractMargin - pricingContractMarginBase;
                                                                                            
                        var data =
                        {
                            "xma_opportunitycontractperiodtotal": pricingContractRevenueTotal,
                            "xma_opportunitycontractperiodmargintotal":  pricingContractMarginTotal
                        }
                        Xrm.WebApi.updateRecord(entityName, recordId, data)
                        .then(
                            function success(result) {                                                                
                                console.log('Revenue updated');
                                                                                        
                            },
                            function (error) {
                                console.log(error.message);                            
                            }
                        );                                                                               
                },
                function (error) {
                    console.log(error.message);                
                }
            ); 
        } 
        */
    }
    
    
    function validateOpportunityForm_Revenue(executionContext){
        var formContext = executionContext.getFormContext();    
        var revenue = formContext.getAttribute("estimatedvalue").getValue();
        var revenueBrand = formContext.getAttribute("xma_opportunitybrandrevenuetotal").getValue();
        var revenueContractPeriods = formContext.getAttribute("xma_opportunitycontractperiodtotal").getValue();    
        /*
        if (revenue < revenueBrand || revenue < revenueContractPeriods){
            
            executionContext.getEventArgs().preventDefault();
            //estField.setNotification("The revenue can't be reduced below brands' revenue. Please amend the brand's and try again.", "RevenueError");        
            formContext.ui.setFormNotification("The revenue can't be reduced below vendor's/contract period's revenue. Please amend and try again.", "ERROR", "RevenueError");
        }
        else{
            //estField.getControl("estimatedvalue").clearNotification("RevenueError");        
            formContext.ui.clearFormNotification("RevenueError");
        }  
            */  
    }
    
    function validateOpportunityForm_Margin(executionContext){
        var formContext = executionContext.getFormContext();    
        var margin = formContext.getAttribute("igl_margin").getValue();
        var marginBrand = formContext.getAttribute("xma_opportunitybrandmargintotal").getValue();
        var marginContractPeriods = formContext.getAttribute("xma_opportunitycontractperiodmargintotal").getValue();
        /*
        if (margin < marginBrand || margin < marginContractPeriods){
            executionContext.getEventArgs().preventDefault();
            formContext.ui.setFormNotification("The margin can't be reduced below vendor's/contract period's margin. Please amend and try again.","ERROR", "MarginError");        
            //formContext.ui.setFormNotification("The maring can't be reduced below brands'/contract period's margin. Please amend and try again.", "ERROR", "MarginError");
        }
        else{
            //formContext.getControl("estimatedvalue").clearNotification("MarginError"); 
            formContext.ui.clearFormNotification("MarginError"); 
        }
            */
    }
    
    function brandOnInsertSaveValidation(executionContext){
        var formContext = executionContext.getFormContext();
        var primaryOffer = formContext.getAttribute("igl_primaryofferbool").getValue();
        /*
        if (primaryOffer == true){
            updateOpportunityBrandRevenueTotal(executionContext);
            updateOpportunityBrandMarginTotal(executionContext);        
        }
        else{
            formContext.getControl("igl_estmargin").clearNotification();
            formContext.getControl("igl_estrevenue").clearNotification();                
        }*/
    }
    
    function contractOnInsertSaveValidation(executionContext){
        var formContext = executionContext.getFormContext();
            /*
        updateOpportunityContractPeriodRevenueTotal(executionContext);
        updateOpportunityContractPeriodMarginTotal(executionContext);  
        */                  
    }