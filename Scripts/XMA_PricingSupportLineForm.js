function filterApprovedSupplierSubGrid(executionContext) {
    var formContext = executionContext.getFormContext();
    var itemNumberAttr = formContext.getAttribute("xma_itemnumber");  // Main lookup field
    if (!itemNumberAttr) return;

    var itemNumberValue = itemNumberAttr.getValue();

    var subgrid = formContext.getControl("Subgrid_new_1");
    
    if (!subgrid) {
        setTimeout(function() { filterChildSubgrid(executionContext); }, 1500);
        return;
    }

    var subgrid2 = formContext.getControl("Subgrid_new_2");

    if (!subgrid2) {
        setTimeout(function() { filterChildSubgrid(executionContext); }, 1500);
        return;
    }

    if (!itemNumberValue || itemNumberValue.length === 0) { 
               
        var emptyFetchXml = 
            "<fetch version='1.0' output-format='xml-platform' mapping='logical'>" +
            "  <entity name='mserp_purchproductapprovedvendorentity'>" +
            "    <attribute name='mserp_approvedvendoraccountnumber' />" +
            "    <attribute name='mserp_itemnumber' />" +
            "    <filter type='and'>" +
            "      <condition attribute='mserp_itemnumber' operator='eq' value='__NO_SUCH_ITEM__' />" +  // Impossible value
            "    </filter>" +
            "  </entity>" +
            "</fetch>";
        
        subgrid.setFilterXml(emptyFetchXml);
        subgrid.refresh();

        var emptyFetchXml = 
            "<fetch version='1.0' output-format='xml-platform' mapping='logical'>" +
            "  <entity name='product'>" +
            "    <attribute name='msdyn_itemnumber' />" +
            "    <attribute name='xma_defaultsupplier' />" +
            "    <filter type='and'>" +
            "      <condition attribute='productid' operator='eq' value='xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' />" +  // Impossible value
            "    </filter>" +
            "  </entity>" +
            "</fetch>";
        
        subgrid2.setFilterXml(emptyFetchXml);
        subgrid2.refresh();
        
        return;
    }

    var productLookup = itemNumberValue[0];    
    var productGuid = productLookup.id.replace(/[{}]/g, "");
    var productEntity = productLookup.entityType;

    if (!productGuid || !productEntity) {
        return;
    }

    // Async retrieve - handle INSIDE .then()
    Xrm.WebApi.retrieveRecord(productEntity, productGuid, "?$select=msdyn_itemnumber")
        .then(function(result) {
            if (result && result.msdyn_itemnumber) {
                var itemNumber = result.msdyn_itemnumber;

                // NOW build and apply FetchXML with the real value
                var fetchXml = 
                    "<fetch version='1.0' output-format='xml-platform' mapping='logical'>" +
                    "  <entity name='mserp_purchproductapprovedvendorentity'>" +
                    "    <attribute name='mserp_approvedvendoraccountnumber' />" +
                    "    <attribute name='mserp_itemnumber' />" +        
                    "    <filter type='and'>" +
                    "      <condition attribute='mserp_itemnumber' operator='eq' value='" + itemNumber + "' />" +		
                    "    </filter>" +
                    "  </entity>" +
                    "</fetch>";

                subgrid.setFilterXml(fetchXml);
                subgrid.refresh();
            } else {
                // No item number found - clear filter
                subgrid.clearCustomFilter();
                subgrid.refresh();
            }
        })
        .catch(function(error) {
            console.log("Retrieve error: " + error.message);
            subgrid.clearCustomFilter();
            subgrid.refresh();
        });
            
    // Async retrieve - handle INSIDE .then()
    Xrm.WebApi.retrieveRecord(productEntity, productGuid, "?$select=msdyn_itemnumber")
        .then(function(result) {
            if (result && result.msdyn_itemnumber) {
                var itemNumber = result.msdyn_itemnumber;

                // NOW build and apply FetchXML with the real value
                var fetchXml = 
                    "<fetch version='1.0' output-format='xml-platform' mapping='logical'>" +
                    "  <entity name='product'>" +
                    "    <attribute name='msdyn_itemnumber' />" +
                    "    <attribute name='xma_defaultsupplier' />" +        
                    "    <filter type='and'>" +
                    "      <condition attribute='productid' operator='eq' value='" + productGuid + "' />" +		
                    "    </filter>" +
                    "  </entity>" +
                    "</fetch>";

                subgrid2.setFilterXml(fetchXml);
                subgrid2.refresh();
            } else {
                // No item number found - clear filter
                subgrid2.clearCustomFilter();
                subgrid2.refresh();
            }
        })
        .catch(function(error) {
            console.log("Retrieve error: " + error.message);
            subgrid2.clearCustomFilter();
            subgrid2.refresh();
        });
}
