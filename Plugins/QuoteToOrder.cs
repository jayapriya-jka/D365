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
    public class QuoteToOrder : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            //Initializing Service Context.
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = factory.CreateOrganizationService(context.UserId);
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));


            try
            {                               
                if (context.InputParameters.Contains("Target") &&
                    (context.InputParameters["Target"] is Entity))
                {
                    // Obtain the target entity from the input parameters.
                    //EntityReference entity = (EntityReference)context.InputParameters["Target"];
                    Entity entity = (Entity)context.InputParameters["Target"];

                    if (entity == null)
                        return;

                    var quoteId = entity.GetAttributeValue<EntityReference>("quoteid");

                    if (quoteId != null)
                    {

                        QueryExpression query = new QueryExpression
                        {
                            EntityName = "msdyn_salesorderorigin",
                            ColumnSet = new ColumnSet("msdyn_salesorderoriginid"),
                            Criteria = new FilterExpression
                            {
                                Conditions =
                            {
                                new ConditionExpression("msdyn_origincode", ConditionOperator.Equal, "CE")
                            }
                            }
                        };

                        EntityCollection relatedEntities = service.RetrieveMultiple(query);
                        Guid salesOriginIdGuid = new Guid();

                        foreach (Entity relatedEntity in relatedEntities.Entities)
                        {
                            salesOriginIdGuid = relatedEntity.GetAttributeValue<Guid>("msdyn_salesorderoriginid");
                        }

                        EntityReference salesOriginId = new EntityReference("msdyn_salesorderorigin", salesOriginIdGuid);

                        if (entity.LogicalName == "salesorder")
                        {
                            entity["msdyn_salesorderorigin"] = salesOriginId;
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
