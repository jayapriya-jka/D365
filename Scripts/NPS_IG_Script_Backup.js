function showHideSections(executionContext) {

    var formContext = executionContext.getFormContext();

    var requestType = formContext.getAttribute("igl_requesttype").getValue();
    // igl_requesttype - New Supplier = 100000000 | New Product = 100000001 | Both = 100000002

    var newSupplierSection = formContext.ui.tabs.get("generaltab").sections.get("newsuppliersection");
    var newProductSection = formContext.ui.tabs.get("generaltab").sections.get("newproductsection");

    switch (requestType){
        case 100000000:
            newSupplierSection.setVisible(true);
            newProductSection.setVisible(false);
            break;
        case 100000001:
            newSupplierSection.setVisible(false);
            newProductSection.setVisible(true);
            break;
        case 100000002:
            newSupplierSection.setVisible(true);
            newProductSection.setVisible(true);
            break;
        case null:
            break;
        default:
            alert(`Optionset value of ${requestType} not catered for, please raise this with XMA IT.`)
            break;
    }
    
}