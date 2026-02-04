var pageContextObj;
var entityName;
var recordId;
var data;
var workflowCreateArray = [];
var pageInput;


var environmentVariable = { //do not change the name of the variable!
    "primaryEntityFieldId": "opportunityid",
    "primaryEntityExclusionArray": false, //change this to true to exclude the columns in "primaryEntityArray"!
    "primaryEntityArray": [
        "name",
        "estimatedvalue",
        "estimatedclosedate",
        "description"
        //"igl_drsdetailsid", //When excluding be sure to remove
        //"igl_schemearticle_applicationid_igl_appli"//
    ],
    "primaryEntityODataQuery": "?$select=*"
    ,
    "createLookUpObjectArray": [
        /* {
             "lookupId": "igl_drsdetailsid",
             "filterEntityId": "igl_depositreturnschemedetailsid",
             "array": ["igl_column1", "column2"], // **
             "exclusionArray": true,  //change this to false to include the columns in "array"!
             "workflowCreate": true
         }  */
    ],
    "updateLookUpObjectArray": [
        {
            "key": "parentaccountid@odata.bind", //this is the schema name of the lookup column appended with "@odata.bind" attached
            "value": "_parentaccountid_value", //This is always the name of the lookup with the an underscore prepended and _value appended
            "lookup": "/accounts" //This is always the plural name of the entity you are associating with
        },
        {
            "key": "parentcontactid@odata.bind",
            "value": "_parentcontactid_value",
            "lookup": "/contacts"
        }
    ]
};

environmentVariable.primaryEntityFieldId
environmentVariable.primaryEntityExclusionArray
environmentVariable.primaryEntityArray // This is an array of fields to exclude from the copy; by default lookups are removed (as this breaks the copy).
environmentVariable.primaryEntityODataQuery
environmentVariable.createLookUpObjectArray // This should take the form specified: [{ lookupId: "igl_drsdetailsid", filterEntityId: "igl_depositreturnschemedetailsid", array: [], workflowCreate: true }]
environmentVariable.updateLookUpObjectArray// This should take the form specified: //[{ key: "igl_produceraccountid@odata.bind", value: result._igl_produceraccountid_value, lookup: "/accounts" }]
//where key is the single valued navigation property (schema name) of the lookup, lookup is the "/"+entitypluralname ,value is the logical name of the field with an "_" prepended and _value appended 
//e.g._igl_produceraccountid_value

console.log(environmentVariable)

function cloneOpportunity() {

    //Begin Loading spinner
    Xrm.Utility.showProgressIndicator("Cloning Opportunity")

    pageContextObj = Xrm.Utility.getPageContext().input;
    entityName = pageContextObj.entityName;
    recordId = pageContextObj.entityId.replace(/[{()}]/g, '').toLowerCase();

    console.log("You clicked me");
    console.log(pageContextObj);


    console.log("Entered Opportunity clone code!!");

    var test = Xrm.WebApi.retrieveRecord(entityName, recordId, environmentVariable.primaryEntityODataQuery).then(
        function success(result) {
            console.log("Great Success the below was retrieved")
            console.log(result);

            // DEFINE AND FILTER THE Primary Entity OBJECT. 

            var primaryEntityData = primaryEntityHandler(result, environmentVariable.primaryEntityFieldId, environmentVariable.primaryEntityArray, environmentVariable.primaryEntityExclusionArray);

            console.log(primaryEntityData);

            // DEFINE AND FILTER THE DRS DETAILS OBJECT. 
            //THIS IS CREATED VIA A WORKFLOW AUTOMATICALLY UPON APPLICATION CREATION AND IS THEREFORE UPDATED LATER IN THE CODE

            if (environmentVariable.createLookUpObjectArray > 0) {

                var lookupCreateArray = lookUpEntityCreateHandler(result, environmentVariable.createLookUpObjectArray)

                // This will be used to update the primaryentitydata variable ordinarily.
                // For DRSDetails a workflow already creates the record and this needs updating hence why we check element.workflowCreate below.....

                lookupCreateArray.forEach(function (element) {

                    if (!element.workflowCreate) {
                        primaryEntityData.element.lookupId = element.lookupObj;
                    } else { workflowCreateArray.push(element) }
                })

            };

            //Update any lookups with exitsing values and add them to primaryEntityData
            lookupEntityUpdateHandler(result, primaryEntityData, environmentVariable.updateLookUpObjectArray)

            //Append clone to the name of the primaryentity record
           // primaryEntityData.name += " CLONE"

            console.log(" HERE IS ALL THE DATA!!!!");
            console.log(primaryEntityData)

            // Create Application record && associate (Account,Contact)--> Then Navigate User to New Opportunity
            createRecord(entityName, primaryEntityData, "This isn't relevant").then(function (result) {

                console.log("Here we are updating the Application name!!")
                console.log(result)

                // define page input to allow navigation to new cloned record.
                pageInput = {
                    pageType: "entityrecord",
                    entityName: entityName,
                    entityId: result.id.replace(/[{()}]/g, '').toLowerCase()
                };

                console.log(pageInput);

                console.log(result + " This is the second result console.log")
                navigateToRecord(pageInput);

                return "next"

            }).then(function (result) {

                console.log(result)
                Xrm.Utility.closeProgressIndicator()
                //once navigated remove loading spinner

            })

            return "Returned TEST VARIABLE !!!!!!!!!!!!"

        },
        function (error) {
            console.log(error.message);
            // handle error conditions

            Xrm.Utility.closeProgressIndicator()
            //once navigated remove loading spinner


        }
    ).catch(function(error){
        console.log(error);

        Xrm.Utility.closeProgressIndicator()
            //once navigated remove loading spinner
            
    });

    console.log("!!!!!!!!!!!!!!!! HERE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    console.log(test);// this will be blank as cloneOpp func not async    
};


/////FUNCTIONS BELOW!!!//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function createRecord(funcEntityName, funcData, updateData) {

    var create = await Xrm.WebApi.createRecord(funcEntityName, funcData).then(
        function success(result) {
            console.log(result.id + " This worked!!");
            console.log(" This is the full result!");
            console.log(result);
            result["updateData"] = updateData

            return result;
        },
        function (error) {
            console.log(error.message);
            // handle error conditions

            //cloneButton.innerHTML = "Error contact admin";
            //cloneButton.disabled = false;
        }
    );

    return create

};

async function getRecord(entityName, recordId, options) {

    const getId = await Xrm.WebApi.retrieveRecord(entityName, recordId, options).then(
        function success(result) {
            console.log("We are getting the record and recording the result")
            console.log(result)

            return result
        },
        function (error) {
            console.log(error.message);
            // handle error conditions
        }
    )
    console.log("below we await the result.......");
    console.log(getId); console.log("The var VARIABLE IS HERE!!!")
    return getId;

};

async function updateRecord(entityName, recordId, data) {

    var updateRec = await Xrm.WebApi.updateRecord(entityName, recordId, data).then(
        function success(result) {

            console.log("Update successful!")
            console.log(result);

            return result
            // perform operations on record update
        },
        function (error) {
            console.log(error.message);
            // handle error conditions
        }
    );
    return updateRec

};

function navigateToRecord(pageInput) {
    Xrm.Navigation.navigateTo(pageInput).then(
        function (success) {
            console.log(success)
        },
        function (error) {
            console.log(error.message);
        }
    );
};

//param1:This needs to be an object; Specify the record object you want to filter; 
//param2: This Needs to be a string; Specify the name of the ID column (this needs to be filtered out or it confuses it because that id already exists), 
//param3:This needs to be an array of strings; Specify any other columns you don't want copied in an array.

//primaryEntityHandler(result, environmentVariable.primaryEntityFieldId, environmentVariable.primaryEntityArray, environmentVariable.primaryEntityExclusionArray);

function FilterLookupAndEntityReferenceFields(object, filterEntityId, array, excludeArray) {
    //This function tidies up the results object returned from retrieveRecord and removing lookup related keys and other entity properties which can't be updated
    //i.e. keys which start _logicalname_value (for lookups) and @Odataxyz for incompatible updates.
    //The entity id is also removed as this interfers when creating a new record.
    var tempObj = {};
    console.log("Array to include/exclude:")
    console.log(array)
    //var exclude = array;

    if (excludeArray) {
        for (const property in object) {

            //console.log(property)
            //console.log(property.substring(0, 1) != "_");
            var excludeValue = array.indexOf(property) == -1

            if (property.substring(0, 1) != "_" && property != filterEntityId && property.substring(0, 1) != "@" && excludeValue) {

                tempObj[property] = object[property];
            }
        }
    } else {

        for (const property in object) {

            //console.log(property)
            var includeValue = array.indexOf(property) != -1

            if (includeValue) {

                tempObj[property] = object[property];
            }
        }

    }

    console.log("output of FilterLookupAndEntityReferenceFields()")
    console.log(tempObj)
    return tempObj;
};

/*
async function GetEnvironmentVariableValue(name) {
    let results = await parent.Xrm.WebApi.retrieveMultipleRecords("environmentvariabledefinition",
        "?$filter=schemaname eq " + "'" + name + "'" + "&$select=environmentvariabledefinitionid&$expand=environmentvariabledefinition_environmentvariablevalue($select=value)");

    if (!results || !results.entities || results.entities.length < 1) return null;
    let variable = results.entities[0];
    if (!variable.environmentvariabledefinition_environmentvariablevalue || variable.environmentvariabledefinition_environmentvariablevalue.length < 1) return null;

    console.log("ENVIROMENT VARIABLE BELOW!!!")
    console.log(variable.environmentvariabledefinition_environmentvariablevalue[0].value);
    return variable.environmentvariabledefinition_environmentvariablevalue[0].value;
};

*/



function primaryEntityHandler(data, filterEntityId, array, excludeArray) {

    console.log(data);

    var filterData = FilterLookupAndEntityReferenceFields(data, filterEntityId, array, excludeArray)
    console.log("PLEASE SEE BELOW FILTERED DATA");
    console.log(filterData);

    return filterData
};

//var lookupCreateArray = lookUpEntityCreateHandler(result, environmentVariable.createLookUpObjectArray)

function lookUpEntityCreateHandler(data, lookUpObjectArray) {
    // lookUpObjectArray needs to be an array of objects of the form [{lookupID, filterEntityId, array,workflowCreate}]

    console.log(data);
    var tempArray = [];

    lookUpObjectArray.forEach(
        function (element) {
            var lookupObj = FilterLookupAndEntityReferenceFields(data[element.lookupId], element.filterEntityId, element.array, element.exclusionArray, element.workflowCreate)
            console.log(data[element.lookupId])
            console.log("PLEASE SEE BELOW FILTERED DATA");
            console.log(lookupObj);

            lookupObj = { "lookupId": element.lookupId, workflowCreate: element.workflowCreate, "lookupObj": lookupObj }
            tempArray.push(lookupObj);

        }
    )

    console.log("TEMP ARRAY BELOW!!!")
    console.log(tempArray)

    return tempArray;
};

function lookupEntityUpdateHandler(data, updateObj, lookupArray) {
    // lookupArray needs to be an array of objects of the form given below; object Key values must be used.
    //[{ key: "igl_produceraccountid@odata.bind", value: _igl_produceraccountid_value, lookup: "/accounts" },
    // { key: "igl_applicantcontactid@odata.bind", value: _igl_applicantcontactid_value, lookup: "/contacts" }]

    lookupArray.forEach(function (element) {

        if (data[element.value] != null) {
            updateObj[element.key] = element.lookup + "(" + data[element.value] + ")"
        }
    });

};

//The lookups are here because if result._lookupId_value is null the data object is rejected by the createRecord function/Xrm.createRecord.....
//To get the binding use the single value navigation property (aka the schema name of the lookup field) + @odata.bind