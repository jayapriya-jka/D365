const TEAM_NAME = "Product & Pricing Team";   // exact team name

const STATUSCODE_ATTR = "statuscode";  // field's logical name

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
