using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Messages;
using Microsoft.Xrm.Sdk.Query;

namespace XMA_QuoteNewAdjustedCostPlugin.XMA_QuoteNewAdjustedCost
{
    public class QuoteAdjCostCalcPre : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            //Initializing Service Context.
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = factory.CreateOrganizationService(context.UserId);

            try
            {
                //Defining Entity Object.
                Entity eTarget = null;
                if (context.InputParameters.Contains("Target") &&
                    context.InputParameters["Target"] is Entity)
                {
                    eTarget = (context.InputParameters.Contains("Target") && context.InputParameters["Target"] != null) ?
                    context.InputParameters["Target"] as Entity : null;

                    if (eTarget != null)
                    {
                        var actualClosedDate = eTarget.GetAttributeValue<DateTime>("actualclosedate");
                        Guid entityId = eTarget.GetAttributeValue<Guid>("opportunityid");

                        RetrieveRequest request = new RetrieveRequest()
                        {
                            ColumnSet = new ColumnSet("xma_copycloseddate"),
                            Target = new EntityReference("opportunity", eTarget.Id)
                        };
                        var response = (RetrieveResponse)service.Execute(request);

                        if (response != null)
                        {
                            Entity entity = response.Entity;
                            bool setestdate = entity.GetAttributeValue<bool>("xma_copycloseddate");
                            //var estCloseDate = entity["estimatedclosedate"];
                            //var setestdate = entity["xma_copycloseddate"];

                            if (actualClosedDate != null && setestdate == false)
                            {
                                Entity oppotunityUpdate = new Entity("opportunity");
                                oppotunityUpdate.Id = eTarget.Id;
                                oppotunityUpdate["estimatedclosedate"] = actualClosedDate;
                                oppotunityUpdate["xma_copycloseddate"] = true;
                                service.Update(oppotunityUpdate);
                            }
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
