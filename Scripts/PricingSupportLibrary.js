/* Global Variables */
let marginVisible = false;

/* 
  Function to show or hide sections based on the conditions.
  Parameters: executionContext - the context from which the function is called.
*/
function showHideSections(executionContext) {
  const formContext = executionContext.getFormContext();

  const pricingOrMarginSupport = formContext.getAttribute("igl_pricingormarginsupportbool").getValue();
  const marginSupportRequired = formContext.getAttribute("igl_marginsupportrequired").getValue();

  const pricingSupportSection = formContext.ui.tabs.get("General").sections.get("pricingsupportsection");
  const marginSupportSection = formContext.ui.tabs.get("General").sections.get("marginsupportsection");

  if (!pricingSupportSection || !marginSupportSection) {
    console.error("Sections not found");
    return;
  }

  if (pricingOrMarginSupport) {
    marginSupportSection.setVisible(true);
    pricingSupportSection.setVisible(false);
  } else {
    pricingSupportSection.setVisible(true);
    if (marginSupportRequired) {
      marginSupportSection.setVisible(true);
      marginVisible = true;
      showHideSupplier(executionContext);
    } else {
      marginSupportSection.setVisible(false);
      marginVisible = false;
    }
  }
}

/* 
  Function to show or hide supplier fields based on the conditions.
  Parameters: executionContext - the context from which the function is called.
*/
function showHideSupplier(executionContext) {
  if (!marginVisible) {
    return;
  }

  const formContext = executionContext.getFormContext();

  const approvedSupplier = formContext.getControl("igl_supplierid");
  const unapprovedSupplier = formContext.getControl("igl_unapprovedsupplier");

  if (!approvedSupplier || !unapprovedSupplier) {
    console.error("Attributes not found");
    return;
  }

  const approvedSupplierRequired = formContext.getAttribute("igl_approvedsupplier").getValue();

  approvedSupplier.setVisible(approvedSupplierRequired);
  unapprovedSupplier.setVisible(!approvedSupplierRequired);
}

/* 
  Function to show or hide department field based on the conditions.
  Parameters: executionContext - the context from which the function is called.
*/
function showHideDepartment(executionContext) {
  // Exit if margin section is not visible
  if (!marginVisible) {
    return;
  }

  const formContext = executionContext.getFormContext();

  const department = formContext.getControl("igl_department");
  const fundedby = formContext.getAttribute("igl_fundedby").getValue();

  // Check for missing attributes
  if (!fundedby || !department) {
    console.error("Attributes not found");
    return;
  }

  // Show or hide department based on the value of fundedby
  department.setVisible(fundedby === 100000000);
}
