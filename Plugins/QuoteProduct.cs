using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;
using System.Threading;
using System.Xml.Linq;
using System.IdentityModel.Metadata;

namespace XMA_InternalPlugins.XMA.CE.Plugins
{
    public class QuoteProduct : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            //Initializing Service Context.
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = factory.CreateOrganizationService(context.UserId);
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            decimal sellPrice = 0;
            decimal origSellPrice = 0;
            var isPriceManuallyChanged = false;

            try
            {
                if (context.InputParameters.Contains("Target") &&
                    (context.InputParameters["Target"] is Entity))
                {
                    if (context.PreEntityImages.Contains("UpdateQuoteDetail") && context.PreEntityImages["UpdateQuoteDetail"] is Entity preImage)
                    {
                        Entity entity = (Entity)context.InputParameters["Target"];

                        if (entity == null)
                            return;

                        if (entity != null && entity.LogicalName != "quotedetail")
                            return;

                        if (preImage.GetAttributeValue<Money>("priceperunit") == null)
                            sellPrice = 0;
                        else
                            sellPrice = preImage.GetAttributeValue<Money>("priceperunit").Value;

                        if (preImage.GetAttributeValue<Money>("igl_originalpeprice") == null)
                            origSellPrice = 0;
                        else
                            origSellPrice = preImage.GetAttributeValue<Money>("igl_originalpeprice").Value;

                        isPriceManuallyChanged = preImage.GetAttributeValue<bool>("xma_issellpricemanuallychanged");

                        tracingService.Trace($"Sell Price: {sellPrice.ToString()} original price: {origSellPrice.ToString()} sell price flag: {isPriceManuallyChanged}");

                        if (sellPrice != origSellPrice && !isPriceManuallyChanged) 
                        {                            
                            entity["xma_pricechanged"] = 1;
                            entity["xma_issellpricemanuallychanged"] = false;                            
                        }                        
                    }
                }
            }
            catch (Exception ex)
            {
                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}