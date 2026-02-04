function showDistributionList(executionContext){
	var formContext = executionContext.getFormContext();

    var dealRegStatus = formContext.getAttribute("igl_Direct");

    if (dealRegStatus == true){
        formContext.getControl("igl_DealRegistrationStatus").setVisible(false);
    }

}

function get_set_DistributorLookupValue(executionContext)
{
try {
// Get Lookup
// Getting Form Context
        var formContext = executionContext.getFormContext();
        // Getting the value of Lookup
        var LookupId = formContext.getAttribute("new_lookup").getValue();
        // Getting the GUID of the lookup record
        var Id = LookupId[0].id;// Getting Name of the lookup record
        Id = Id.replace(",", "").replace("}", "").replace("{","");
        var Name = LookupId[0].name;
        // Getting Entity Name of the lookup which entity, the lookup record is belonging to.
        var EntityType = LookupId[0].entityType;
// Set Lookup
var lookup = [];   // Creating a new lookup Array
        lookup[0] = {};    // new Object
        lookup[0].id = Id;  // GUID of the lookup id
        lookup[0].name = Name; // Name of the lookup
        lookup[0].entityType = EntityType; // Entity Type of the lookup entity
        var OtherLookup= formContext.getAttribute("new_Otherl").setValue(lookup);
        
    } catch (ex) {
        console.log("getLookupValue: Error -> " + ex.message);
    }
}


// Define the ID and entity name of the record to update
var recordId = "00000000-0000-0000-0000-000000000001";
var entityName = "account";

// Define the data for the update
var data = {
    "name": "Updated Account Name",
    "revenue": 5000000,
    "description": "This is an updated description"
};

// Create the request
var req = new XMLHttpRequest();
req.open("PATCH", Xrm.Utility.getGlobalContext().getClientUrl() + "/api/data/v9.0/" + entityName + "s(" + recordId + ")", true);
req.setRequestHeader("OData-MaxVersion", "4.0");
req.setRequestHeader("OData-Version", "4.0");
req.setRequestHeader("Accept", "application/json");
req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
req.onreadystatechange = function() {
    if (this.readyState === 4) {
        req.onreadystatechange = null;
        if (this.status === 204) {
            // The record was successfully updated
            console.log("Record updated successfully.");
        } else {
            // An error occurred during the operation
            console.log(this.statusText);
        }
    }
};
req.send(JSON.stringify(data));


function UpdateAccountRecord() {
    // define the data to update a record
    var data =
    {
    "name": "Arun Potti Inc", // Single Line of Text
    "creditonhold": true, // Two Option Set
    "description": "This is the description of the sample account after update", // Multiple Lines of Text
    "revenue": 20000000, // Currency
    "industrycode": 2, // 2 - Agriculture and Non-petrol Natural Resource Extraction // OptionSet
    "primarycontactid@odata.bind": "/contacts(39582A13-E6E7-E711-A95E-000D3AF27CC8)" // ContactId - Arun Potti // Lookup
    }
    // Update the Account Record
    Xrm.WebApi.updateRecord("account", "9CCDEB5F-E9E7-E711-A95E-000D3AF27CC8", data).then(
    function success(result) {
    // Perform operations on record update
    Xrm.Utility.alertDialog("Account updated successfully", null);
    },
    function (error) {
    // Handle error conditions
    Xrm.Utility.alertDialog(error.message, null);
    }
    );
   }


   // define the data to update a record
var data =
{
    "name": "Updated Sample Account ",
    "creditonhold": true,
    "address1_latitude": 47.639583,
    "description": "This is the updated description of the sample account",
    "revenue": 6000000,
    "accountcategorycode": 2
}
// update the record
Xrm.WebApi.updateRecord("account", "5531d753-95af-e711-a94e-000d3a11e605", data).then(
function success(result) {
    console.log("Account updated");
    // perform operations on record update
},
function (error) {
    console.log(error.message);
    // handle error conditions
}
);


function deselectContact(selectedItemIds) {

    // Check if any records are selected

    if (selectedItemIds.length > 0) {

        // Ask for confirmation before proceeding

        var confirmDialog = confirm("Are you sure you want to deselect the selected contact(s)?");   

        if (confirmDialog) {

            // Loop through selected records and perform the delink operation

            selectedItemIds.forEach(function (contactId) {

                // Log the current Contact ID to the console

                console.log("Deselecting Contact ID: " + contactId);

                // Construct the Web API endpoint to update the Contact record (replace version according to your Dynamics 365 version)

                var endpoint = "/api/data/v9.2/contact(" + contactId.replace("{", "").replace("}", "") + ")";   

                // Prepare the data to update the 'accountid' field to null

                var data = {

                    "accountid@odata.bind": null

                };

                // Perform the Web API update request

                Xrm.WebApi.online.updateRecord("contact", contactId, data).then(

                    function success(result) {

                        // Log success message to the console

                        console.log("Contact record deselected successfully.");

                        // Refresh the Account form and subgrid to reflect the changes

                        Xrm.Page.data.refresh(true);

                        Xrm.Page.getControl("Subgrid_new_1").refresh();

                        // Show success message

                        alert("Contact record(s) have been successfully deselected.");

                    },

                    function error(error) {

                        // Log the error message and details to the console

                        console.log("Error deselecting Contact record:", error.message, error);

                        // You may want to handle the error in a way that helps diagnose the issue

                    }

                );

            });

        } else {

            // User canceled the operation

            console.log("Deselection operation canceled by the user.");

        }

    } else {

        // No records selected, display a message or perform other actions as needed

        console.log("No records selected to deselect.");

    }

}


function OnChangeEvent(executionContext, lookupfield, namefield) {
    var formContext = executionContext.getFormContext();
    if (formContext.getAttribute(lookupfield).getValue() != null) {
      formContext
        .getAttribute(namefield)
        .setValue(formContext.getAttribute(lookupfield).getValue()[0].name);
    } else {
      formContext.getAttribute(namefield).setValue("");
    }
  }


  function assignDistributionList(executionContext){
	var formContext = executionContext.getFormContext();
		
      // Define the lookup value
      var lookupValue = new Array();
      lookupValue[0] = new Object();
      lookupValue[0].id = "{4423c1f5-a3d4-ee11-904d-000d3a0bcd24}";  // GUID of the lookup record
      lookupValue[0].name = "Ingram";  // Name of the lookup record
      lookupValue[0].entityType = "xma_distributorlist";  // Entity name of the lookup record
  
      // Set the value of the lookup field
      formContext.getAttribute("xma_distribution1").setValue(lookupValue);

      formContext.getAttribute("xma_dealregistrationstatus1").setValue();

    formContext.data.refresh();
	
	/*var recordId = formContext.data.entity.getId();

    if (recordId != null)
    {	
        var data = {     
        "xma_distribution1": 100000002,
        "xma_distribution2": 100000001,
        "xma_distribution3": 100000002,
        "xma_distribution4": 100000001,
        }
        
        // update the record
        Xrm.WebApi.updateRecord("xma_PricingSupportDirectDistributorsMapping", recordId, data).then(
            function success(result) {
            console.log("Account updated");
            // perform operations on record update
            },
            function (error) {
            console.log(error.message);
            // handle error conditions
            } 
        );
    }*/
}



// This is an example of an event handler function for the OnSave event
function myOnSaveEventHandler(executionContext) {
    // Get the form context
    var formContext = executionContext.getFormContext();

    // Save the record asynchronously
    formContext.data.save().then(
        function success() {
            // After the save operation is completed, get the ID of the record
            var recordId = formContext.data.entity.getId();

            // Log the ID to the console
            console.log("Record saved with ID: " + recordId);
        },
        function error(err) {
            // An error occurred during the save operation
            console.log("Error while saving record: " + err.message);
        }
    );
}



// This is an example of an event handler function for the OnSave event
function myOnSaveEventHandler(executionContext) {
    // Get the form context
    var formContext = executionContext.getFormContext();

    // Define the lookup value
    var lookupValue = new Array();
    lookupValue[0] = new Object();
    lookupValue[0].id = "{00000000-0000-0000-0000-000000000001}";  // GUID of the lookup record
    lookupValue[0].name = "Lookup Record Name";  // Name of the lookup record
    lookupValue[0].entityType = "entityname";  // Entity name of the lookup record

    // Set the value of the lookup field
    formContext.getAttribute("mylookupfieldname").setValue(lookupValue);

    // Save the record asynchronously
    formContext.data.save().then(
        function success() {
            // After the save operation is completed
            console.log("Record saved successfully.");
        },
        function error(err) {
            // An error occurred during the save operation
            console.log("Error while saving record: " + err.message);
        }
    );
}


function assignDistributionList(executionContext){
	var formContext = executionContext.getFormContext();
    var vendorId = formContext.getAttribute("xma_distributor").getValue();   
    
    var distName = '';

    var lookupValue = new Array();
    lookupValue[0] = new Object();    
    lookupValue[0].id = "00000000-0000-0000-0000-000000000000";
    lookupValue[0].name = "";  // Name of the lookup record
    lookupValue[0].entityType = "xma_distributorlist";

    formContext.getAttribute("xma_distributor1").setValue(lookupValue);
    /*formContext.getAttribute("xma_distributor2").setValue(lookupValue);
    formContext.getAttribute("xma_distributor3").setValue(lookupValue);
    formContext.getAttribute("xma_distributor4").setValue(lookupValue);*/

    if (vendorId != null && vendorId != '')
    {	                
        var entityName = "xma_distributor";
        var recordId = vendorId[0].id;
        var distID1 = vendorId[0].id;
                
        Xrm.WebApi.retrieveRecord(entityName, recordId, "?$select=_xma_distributor1_value,_xma_distributor2_value,_xma_distributor3_value,_xma_distributor4_value")
        .then(
            function success(result) {                                
                                
                var entityName = "xma_distributorlist";        

                Xrm.WebApi.retrieveRecord(entityName, result._xma_distributor1_value, "?$select=xma_name")
                .then(
                    function success(result1) {
                        //console.log("Retrieved values: Dist 1: " + result.xma_distributor1 + ", Dist 2: " + result.xma_distributor2, + ", Dist 3: " + result.xma_distributor3, + ", Dist 4: " + result.xma_distributor4);
                        
                        distName =  result1.xma_name;    
                        // Define the lookup value
                        var lookupValue = new Array();
                        lookupValue[0] = new Object();
                        //lookupValue[0].id = "{4423c1f5-a3d4-ee11-904d-000d3a0bcd24}";  // GUID of the lookup record
                        lookupValue[0].id = result._xma_distributor1_value;
                        lookupValue[0].name = distName;  // Name of the lookup record
                        lookupValue[0].entityType = "xma_distributorlist";  // Entity name of the lookup record

                        // Set the value of the lookup field
                        formContext.getAttribute("xma_distribution1").setValue(lookupValue);                            
                    },
                    function (error) {
                        console.log(error.message);
                        // handle error conditions
                    }
                );

                Xrm.WebApi.retrieveRecord(entityName, result._xma_distributor2_value, "?$select=xma_name")
                .then(
                    function success(result1) {
                        //console.log("Retrieved values: Dist 1: " + result.xma_distributor1 + ", Dist 2: " + result.xma_distributor2, + ", Dist 3: " + result.xma_distributor3, + ", Dist 4: " + result.xma_distributor4);
                        
                        distName =  result1.xma_name;    
                        // Define the lookup value
                        var lookupValue = new Array();
                        lookupValue[0] = new Object();
                        //lookupValue[0].id = "{4423c1f5-a3d4-ee11-904d-000d3a0bcd24}";  // GUID of the lookup record
                        lookupValue[0].id = result._xma_distributor2_value;
                        lookupValue[0].name = distName;  // Name of the lookup record
                        lookupValue[0].entityType = "xma_distributorlist";  // Entity name of the lookup record

                        // Set the value of the lookup field
                        formContext.getAttribute("xma_distribution2").setValue(lookupValue);                            
                    },
                    function (error) {
                        console.log(error.message);
                        // handle error conditions
                    }
                );

                Xrm.WebApi.retrieveRecord(entityName, result._xma_distributor3_value, "?$select=xma_name")
                .then(
                    function success(result1) {
                        //console.log("Retrieved values: Dist 1: " + result.xma_distributor1 + ", Dist 2: " + result.xma_distributor2, + ", Dist 3: " + result.xma_distributor3, + ", Dist 4: " + result.xma_distributor4);
                        
                        distName =  result1.xma_name;    
                        // Define the lookup value
                        var lookupValue = new Array();
                        lookupValue[0] = new Object();
                        //lookupValue[0].id = "{4423c1f5-a3d4-ee11-904d-000d3a0bcd24}";  // GUID of the lookup record
                        lookupValue[0].id = result._xma_distributor3_value;
                        lookupValue[0].name = distName;  // Name of the lookup record
                        lookupValue[0].entityType = "xma_distributorlist";  // Entity name of the lookup record

                        // Set the value of the lookup field
                        formContext.getAttribute("xma_distribution3").setValue(lookupValue);                            
                    },
                    function (error) {
                        console.log(error.message);
                        // handle error conditions
                    }
                );

                Xrm.WebApi.retrieveRecord(entityName, result._xma_distributor4_value, "?$select=xma_name")
                .then(
                    function success(result1) {
                        //console.log("Retrieved values: Dist 1: " + result.xma_distributor1 + ", Dist 2: " + result.xma_distributor2, + ", Dist 3: " + result.xma_distributor3, + ", Dist 4: " + result.xma_distributor4);
                        
                        distName =  result1.xma_name;    
                        // Define the lookup value
                        var lookupValue = new Array();
                        lookupValue[0] = new Object();
                        //lookupValue[0].id = "{4423c1f5-a3d4-ee11-904d-000d3a0bcd24}";  // GUID of the lookup record
                        lookupValue[0].id = result._xma_distributor4_value;
                        lookupValue[0].name = distName;  // Name of the lookup record
                        lookupValue[0].entityType = "xma_distributorlist";  // Entity name of the lookup record

                        // Set the value of the lookup field
                        formContext.getAttribute("xma_distributor4").setValue(lookupValue);                            
                    },
                    function (error) {
                        console.log(error.message);
                        // handle error conditions
                    }
                );
            
            
                
            },
            function (error) {
                console.log(error.message);
                // handle error conditions
            }
        );

        
        //formContext.getAttribute("xma_dealregistrationstatus1").setValue(100000001);
        //formContext.data.refresh();
    }
}


// Define the ID and entity name of the record to retrieve
var recordId = "00000000-0000-0000-0000-000000000001";  // GUID of the record
var entityName = "account";  // Entity name of the record

// Create the request
Xrm.WebApi.retrieveRecord(entityName, recordId, "?$select=name&$expand=primarycontactid($select=contactid,fullname)")
    .then(
        function success(result) {
            console.log("Retrieved values: Name: " + result.name + ", Contact ID: " + result.primarycontactid.contactid + ", Full Name: " + result.primarycontactid.fullname);
            // perform operations on record retrieval
        },
        function (error) {
            console.log(error.message);
            // handle error conditions
        }
    );


    Xrm.WebApi.retrieveRecord(entityName, '00000000-0000-0000-0000-000000000001', "?$select=field_name")
                .then(
                    function success(result1) {                                                
                        distName =  result1.xma_name;    
                        
                        var lookupValue = new Array();
                        lookupValue[0] = new Object();                        
                        lookupValue[0].id = result._xma_distributor1_value;
                        lookupValue[0].name = distName;
                        lookupValue[0].entityType = "xma_distributorlist";
                        
                        formContext.getAttribute("xma_distribution1").setValue(lookupValue);                            
                    },
                    function (error) {
                        console.log(error.message);
                    }
                );