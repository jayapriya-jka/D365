var saveAllowed = false;

function OpportunityBrandSave(executionContext) {
    var formContext = executionContext.getFormContext();
    var saveEvent = executionContext.getEventArgs();

    // Prevent save only if save is not allowed
    if (!saveAllowed) {
        saveEvent.preventDefault();
    }

    var recordId = formatGuid(formContext.data.entity.getId());

    Xrm.WebApi.retrieveMultipleRecords("igl_opportunitybrand", "?$select=igl_opportunitybrandid&$filter=_igl_opportunityid_value eq " + recordId + "&$top=1").then(
        function success(results) {
            if (results.entities.length >= 1) {
                // Allow save
                saveAllowed = true;
                // Then manually save the form
                formContext.data.entity.save();
            } else {
                var alertStrings = {
                    confirmButtonLabel: "OK",
                    text: "Please add at least one Brand before saving.",
                    title: "Save Prevented:"
                };
                var alertOptions = { height: 120, width: 260 };

                Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
                    function success() {
                        // No Action Needed
                    },
                    function (error) {
                        console.log(error);
                    }
                );
            }
        },
        function (error) {
            console.log(error.message);
        }
    );

    // Reset the saveAllowed flag for the next manual save attempt
    if (saveAllowed) {
        saveAllowed = false;
    }
}

function formatGuid(guid) {
    if (guid) {
        var formattedGuid = guid.replace(/[{}]/g, "").toLowerCase();
        return formattedGuid;
    } else {
        return null;
    }
}
