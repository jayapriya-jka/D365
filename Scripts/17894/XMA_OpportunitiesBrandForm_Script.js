function validateRevenueBalance(executionContext){
    alert("This is an example of a JavaScript alert window.");
}


// Assume Sdk is an object representing your Web API client

// Define a function to get the user's full name
Sdk.getUsersFullName = function() {
    return new Promise(function(resolve, reject) {
        // Use the WhoAmI function to get the current user's ID
        Sdk.request("GET", "/WhoAmI")
            .then(function(request) {
                // Extract the user ID from the response
                const userId = request.UserId;

                // Now fetch the user's full name using another function
                Sdk.request("GET", `/systemusers(${userId})?$select=fullname`)
                    .then(function(userResponse) {
                        // Extract the full name from the user response
                        const fullName = userResponse.fullname;
                        resolve(fullName); // Resolve the promise with the full name
                    })
                    .catch(function(error) {
                        reject(error); // Reject the promise if an error occurs
                    });
            })
            .catch(function(error) {
                reject(error); // Reject the promise if an error occurs
            });
    });
};

// Usage example
Sdk.getUsersFullName()
    .then(function(fullName) {
        console.log("User's full name:", fullName);
    })
    .catch(function(error) {
        console.error("Error fetching user's full name:", error);
    });




    function SubmitAction(executionContext) {
        var formContext = executionContext.getFormContext();
        var userSettings = Xrm.Utility.getGlobalContext().userSettings;
        var languageCode = userSettings.languageId;
        var isAirportValis = ValidateAirportCountry(executionContext);
        var IsConfidential=formContext.getAttribute("alfa_confidentialguest").getValue();
        var a = true;
        
        //Edit by Abdallah To get the package Type so we can get the package type
        var lookupItem = formContext.getAttribute("alfa_member").getValue()[0].id;
        var theTotalMembersTravling = formContext.getAttribute("alfa_numberofdependent").getValue();
        var remainFlightCredit;
        
        debugger;
        Xrm.WebApi.online.retrieveRecord("contact",lookupItem, "?$select=new_remainstravelcredit").then(
             function employessPackage(result) {
                var new_remainstravelcredit = result["new_remainstravelcredit"];
                if(new_remainstravelcredit !== null){
                if(new_remainstravelcredit > 0)
                {
                    remainFlightCredit = new_remainstravelcredit;
                    console.log(remainFlightCredit+" This not inside any if condition");
        
                            var newRemain = (parseInt(remainFlightCredit)) - (parseInt(theTotalMembersTravling));
                            console.log(newRemain+ " This in the remain if condition");
                            var entity = {};
                            entity.new_remainstravelcredit = newRemain.toString();
                            Xrm.WebApi.online.updateRecord("contact",lookupItem, entity).then(
                            function success(result) {
                                var updatedEntityId = result.id;
                            },
                            function(error) {
                                Xrm.Utility.alertDialog(error.message +" This error is occuring from retriveing the altanfeethi emplyees packgae");
                            }
                        );
                } if(new_remainstravelcredit <= 0)
                {
                    Xrm.Utility.alertDialog("You have exceeds the travel credit");
                    return false;
                  //  throw Xrm.Utility.alertDialog("You have exceeds the travel credit");
        
                } 
            }
            },
            function(error) {
                Xrm.Utility.alertDialog(error.message);
            }
        );
        
        
        
        if (!isAirportValis) {
            return false;
        }
        //var isAttachemntValid = ValidateAttachments(formContext);
        //if (!isAttachemntValid) {
        //    return false;
        //}
        
        var hasTravellers = ValidateTravellers(formContext)
        if (!hasTravellers && !IsConfidential) {
            var userSettings = Xrm.Utility.getGlobalContext().userSettings;
            var languageCode = userSettings.languageId;
            if (languageCode == "1033") {
                alert(Messages.FlightMemberCountValidation1033);
            }
            else {
                alert(Messages.FlightMemberCountValidation1025);
            }
            return false;
        }
        
        
        var isGuestValid = isValidGuest(formContext);
        var isPaymentValid = false;
        var guestPaymentType = formContext.getAttribute('alfa_guestpaymenttype').getValue();
        var addedGuestServices = formContext.getControl('guestservices').getGrid().getTotalRecordCount();
        if (!isGuestValid) {
        
            var membershipType = GetMembershipType();
            if (membershipType != MembershipTypeEnum.Corportate) // Individual
            {
                formContext.getControl('alfa_guestpaymenttype').setVisible(true);
                formContext.getAttribute('alfa_guestpaymenttype').setRequiredLevel('required');
        
                if (!guestPaymentType) {
                    if (languageCode == "1033")
                        alert(Messages.IndividualGuestSub1033);
                    else alert(Messages.IndividualGuestSub1025);
                    formContext.getControl('alfa_guestpaymenttype').setFocus();
                    return false;
                }
                else if (guestPaymentType == GuestPaymentTypeEnum.BuyPackage) {
                    if (addedGuestServices == 0) {
                        if (languageCode == "1033")
                            alert(Messages.AddGuestService1033);
                        else alert(Messages.AddGuestService1025);
                        formContext.getControl('guestservices').setFocus();
                        return false;
                    }
                    else isPaymentValid = true;
                }
                else if (guestPaymentType == GuestPaymentTypeEnum.PayForAdded)
                    isPaymentValid = true;
            }
            else  // Corp
            {
                formContext.getControl('alfa_guestpaymenttype').setVisible(false);
                //var addedGuestServices = formContext.getControl('guestservices').getGrid().getTotalRecordCount();
                // if (addedGuestServices == 0) {
                if (languageCode == "1033")
                    alert(Messages.AddGuestService1033);
                else alert(Messages.AddGuestService1025);
                formContext.getControl('guestservices').setFocus();
                return false;
                // }
                //else isPaymentValid = true;
            }
            if (isPaymentValid) {
                formContext.getAttribute('alfa_requirepayment').setValue(true);
                formContext.getAttribute('alfa_issubmitted').setValue(true);
                formContext.data.save();
            }
        
        }
        
        else {
            formContext.getAttribute('alfa_requirepayment').setValue(addedGuestServices > 0);
            formContext.getControl('alfa_guestpaymenttype').setVisible(false);
            formContext.getAttribute('alfa_guestpaymenttype').setRequiredLevel('none');     
            formContext.getAttribute('alfa_issubmitted').setValue(true);
            formContext.data.save();
         }
        
        
        }


        function validateRevenueBalance(executionContext){
            alert("This is an example of a JavaScript alert window.");
        }
        
        function updateOpportunityBrandRevenueTotal(executionContext){
            //alert("This is an example of a JavaScript alert window.");
            var formContext = executionContext.getFormContext();    
            var opportunityId = formContext.getAttribute("igl_opportunityid").getValue();   
                           
            if (opportunityId != null && opportunityId != '')
            {
                var entityName = "igl_opportunitybrand";
                var recordId = opportunityId[0].id;
        
                var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitybrand'><attribute name='igl_estrevenue'/><filter><condition attribute='igl_opportunityid' operator='eq' value='"+recordId+"'/></filter></entity></fetch>";
        
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
        
                            var data =
                            {
                                "xma_opportunitybrandrevenuetotal": brandRevenueTotal
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
        }
        
        function updateOpportunityContractPeriodRevenueTotal(executionContext){    
            var formContext     = executionContext.getFormContext();
            var opportunityId   = formContext.getAttribute("igl_opportunity_id").getValue();  
            var pricingContractRevenue = formContext.getAttribute("igl_estrevenue_value").getValue();   
                           
            if (opportunityId != null && opportunityId != '')
            {                  
                var entityName = "igl_opportunitycontractperiod";
                var recordId = opportunityId[0].id;
        
                var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitycontractperiod'><attribute name='igl_estrevenue_value'/><filter><condition attribute='igl_opportunity_id' operator='eq' value='"+recordId+"'/></filter></entity></fetch>";
        
                Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
                .then(
                    function success(result) {
                        var pricingContractRevenueTotal = 0;
                        for (var i = 0; i < result.entities.length; i++) {
                            console.log(result.entities[i].igl_estrevenue_value);
                            pricingContractRevenueTotal += result.entities[i].igl_estrevenue_value;
                            }     
                            
                            var pricingContractRevenue = formContext.getAttribute("igl_estrevenue_value").getValue();                      
                            pricingContractRevenueTotal += pricingContractRevenue;
                                                    
                            var entityName = "opportunity";
                            var recordId = opportunityId[0].id;
                            var data =
                            {
                                "xma_opportunitycontractperiodtotal": pricingContractRevenueTotal
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
        }
        
        function updateOpportunityContractPeriodRevenueTotal1(executionContext){    
            var formContext     = executionContext.getFormContext();
            var opportunityId   = formContext.getAttribute("igl_opportunity_id").getValue();  
            var pricingContractRevenue = formContext.getAttribute("igl_estrevenue_value").getValue();   
                
            var entityName = "igl_opportunitycontractperiod";
            var recordId = opportunityId[0].id;
            var opportunityRevenue = findOpportunityRevenue(recordId);    
        
            if (opportunityId != null && opportunityId != '')
            {
                opportunityRevenue.then(function (actualRevenue) {
                if (actualRevenue != null){
                    //console.log(actualRevenue);
                    //estValue = actualRevenue;
                              
                var fetchXml = "?fetchXml=<fetch mapping='logical'><entity name='igl_opportunitycontractperiod'><attribute name='igl_estrevenue_value'/><filter><condition attribute='igl_opportunity_id' operator='eq' value='"+recordId+"'/></filter></entity></fetch>";
        
                Xrm.WebApi.retrieveMultipleRecords(entityName, fetchXml)
                .then(
                    function success(result) {
                        var pricingContractRevenueTotal = 0;
                        for (var i = 0; i < result.entities.length; i++) {
                            //console.log(result.entities[i].igl_estrevenue_value);
                            pricingContractRevenueTotal += result.entities[i].igl_estrevenue_value;
                            }     
                            
                            var pricingContractRevenue = formContext.getAttribute("igl_estrevenue_value").getValue();                      
                            pricingContractRevenueTotal += pricingContractRevenue;
        
                            console.log(pricingContractRevenueTotal);
                            console.log(actualRevenue);
        
                            if (pricingContractRevenueTotal > actualRevenue)
                            {
                                Xrm.Navigation.openAlertDialog('Amount exceeds');
                                executionContext.getEventArgs().preventDefault();
                            }
                            else
                            {
                                /*
                                var entityName = "opportunity";
                                var recordId = opportunityId[0].id;
                                var data =
                                {
                                    "xma_opportunitycontractperiodtotal": pricingContractRevenueTotal
                                }
                                                
                                Xrm.WebApi.updateRecord(entityName, recordId, data)
                                .then(
                                    function success(result) {                                                                
                                        console.log('Revenue updated');
                                                                                                
                                    },
                                    function (error) {
                                        console.log(error.message);                            
                                    }
                                );*/
                            }
                    },
                    function (error) {
                        console.log(error.message);                
                    }
                ); 
              }       
              });
            }
        }
        
        var findOpportunityRevenue = function(opportunityId){
               
            return new Promise(function(resolve, reject){
            Xrm.WebApi.retrieveRecord("opportunity", opportunityId, "?$select=estimatedvalue")
                        .then(
                            function success(result) {  
                                console.log(result.estimatedvalue);                    
                                const estimatedvalueReturn = result.estimatedvalue;
                                resolve(estimatedvalueReturn);
                            },
                            function (error) {
                                reject(error.message);                        
                            }
                        );
        
            });
        }