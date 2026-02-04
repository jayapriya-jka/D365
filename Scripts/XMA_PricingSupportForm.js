const TEAM_NAME = "Product & Pricing Team";   // exact team name

const STATUSCODE_ATTR = "statuscode";  // field's logical name

var previousRowCount = -1;

// Get current user ID
function getCurrentUserId() {
    return Xrm.Utility.getGlobalContext()
        .userSettings.userId.replace(/[{}]/g, "");      
}

// Get teamid by team name
async function getTeamIdByName(teamName) {
    const encoded = encodeURIComponent(teamName.replace(/'/g, "''"));
    const query = `?$select=teamid&$filter=name eq '${encoded}'`; 

    const result = await Xrm.WebApi.retrieveMultipleRecords("team", query); 
    if (result.entities.length === 0) {
        throw new Error("Team not found: " + teamName);
    }
    return result.entities[0].teamid;
}

// Check if current user is member of a team (by id)
async function isCurrentUserInTeam(teamId) {
    const userId = getCurrentUserId();

    const query =
        `?$select=teammembershipid` +
        `&$filter=systemuserid eq ${userId} and teamid eq ${teamId}`; 

    const result = await Xrm.WebApi.retrieveMultipleRecords("teammembership", query);
    return result.entities.length > 0;
}


async function onLoad_StatusByTeam(executionContext) {
    const formContext = executionContext.getFormContext();
    const attr = formContext.getAttribute(STATUSCODE_ATTR);
    var ctrl =
        formContext.getControl("header_statuscode") ||
        formContext.getControl("header_process_statuscode");

    try {
        const teamId = await getTeamIdByName(TEAM_NAME);
        const inTeam = await isCurrentUserInTeam(teamId);

        if (attr){                       
            ctrl.setDisabled(!inTeam);          
        }           
    }
     catch (e) {        
        if (attr) {
            formContext.getControl(STATUSCODE_ATTR).setDisabled(true);
        }
        console.error(e.message);
    }
}


function onSaveCheckMandatoryValues(executionContext) {
    var formContext = executionContext.getFormContext();

    var pricingAttr = formContext.getAttribute("igl_pricingormarginsupportbool");
    var fundedByAttr = formContext.getAttribute("igl_fundedby");
    var isAapprovedSupplier = formContext.getAttribute("xma_approvedsupplier");
    var approvedSupplier = formContext.getAttribute("igl_supplierid");
    var unApprovedSupplier = formContext.getAttribute("xma_unapprovedsupplier");

    if (isAapprovedSupplier.getValue() == 100000002){ 
        formContext.getAttribute("igl_approvedsupplier").setValue(true);
    }
    else {
        formContext.getAttribute("igl_approvedsupplier").setValue(false);
    }
    
    if (!pricingAttr || !fundedByAttr || !isAapprovedSupplier) {
        return;
    }

    var pricingValue = pricingAttr.getValue(); 
    
    if (pricingValue) {
        fundedByAttr.setRequiredLevel("required");
    } else {
        fundedByAttr.setRequiredLevel("none");
    }

    var isApprovedSupplierValue = isAapprovedSupplier.getValue(); 
    
    if (pricingValue) {
        isAapprovedSupplier.setRequiredLevel("required");
    } else {
        isAapprovedSupplier.setRequiredLevel("none");
    }

    if (pricingValue) {
        if (isApprovedSupplierValue == 100000002) { // Approved Supplier
            approvedSupplier.setRequiredLevel("required");
            unApprovedSupplier.setRequiredLevel("none");
        } else if (isApprovedSupplierValue == 100000001) { // Unapproved Supplier
            approvedSupplier.setRequiredLevel("none");
            unApprovedSupplier.setRequiredLevel("required");
        }
    }else {  
        approvedSupplier.setRequiredLevel("none");
        unApprovedSupplier.setRequiredLevel("none");
    }
}

function onSubgridLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    var subgrid = formContext.getControl("Subgrid_new_1");  // Replace with your subgrid name (from Advanced > Name)

    if (subgrid) {
        subgrid.addOnLoad(subgridOnLoad);
    }
}

function subgridOnLoad(executionContext) {
    var formContext = executionContext.getFormContext();
    var subgrid = formContext.getControl("Subgrid_new_1");
    var currentRowCount = subgrid.getGrid().getTotalRecordCount();

    if (previousRowCount !== -1 && currentRowCount < previousRowCount) {
        // Record deleted - refresh main form
        //formContext.data.refresh(true);
        var entityFormOptions = {
        entityName: formContext.data.entity.getEntityName(),
        entityId: formContext.data.entity.getId(),
        openInNewWindow: false
        };
        Xrm.Navigation.openForm(entityFormOptions);
    }
    
    previousRowCount = currentRowCount;
}

