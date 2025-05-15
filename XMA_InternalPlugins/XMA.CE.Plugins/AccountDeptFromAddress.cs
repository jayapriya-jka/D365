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
    public class AccountDeptFromAddress : IPlugin
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
                //Defining Entity Object.
                Entity eTarget = null;
                if (context.InputParameters.Contains("Target") &&
                    context.InputParameters["Target"] is Entity)
                {
                    eTarget = (context.InputParameters.Contains("Target") && context.InputParameters["Target"] != null) ?
                    context.InputParameters["Target"] as Entity : null;
                    
                    if (eTarget != null)
                    {                        
                        if (context.PostEntityImages.Contains("CreateAddress") && context.PostEntityImages["CreateAddress"] is Entity postImage)
                        {                            
                            string department = postImage.GetAttributeValue<string>("msdyn_streetnumber");
                            string addressType = postImage.GetAttributeValue<string>("msdyn_postaladdresspurposenames");
                            EntityReference partyId = postImage.GetAttributeValue<EntityReference>("msdyn_party");
                            
                            if (addressType == "Invoice" && partyId != null && partyId.Id != null)
                            {
                                //Retrieve Account
                                QueryExpression query = new QueryExpression("account")
                                {
                                    ColumnSet = new ColumnSet("accountid"),
                                    Criteria = new FilterExpression
                                    {
                                        Conditions =
                                        {
                                            new ConditionExpression("msdyn_partyid", ConditionOperator.Equal, partyId.Id)
                                        }
                                    }
                                };

                                EntityCollection relatedEntities = service.RetrieveMultiple(query);
                                Guid accountId = new Guid();

                                foreach (Entity relatedEntity in relatedEntities.Entities)
                                {
                                    accountId = relatedEntity.GetAttributeValue<Guid>("accountid");
                                }

                                //Update Account
                                Entity account = new Entity("account", accountId);
                                account["xma_department"] = department;
                                service.Update(account);
                                tracingService.Trace($"Account Id: {accountId}; Party id: {partyId}; Department: {department}");
                            }
                        }
                        else if (context.PostEntityImages.Contains("UpdateAddress") && context.PostEntityImages["UpdateAddress"] is Entity postImageUpd)
                        {                            
                            string department = postImageUpd.GetAttributeValue<string>("msdyn_streetnumber");
                            string addressType = postImageUpd.GetAttributeValue<string>("msdyn_postaladdresspurposenames");
                            EntityReference partyId = postImageUpd.GetAttributeValue<EntityReference>("msdyn_party");
                            
                            if (addressType == "Invoice" && partyId != null && partyId.Id != null)
                            {
                                //Retrieve Account
                                QueryExpression query = new QueryExpression("account")
                                {
                                    ColumnSet = new ColumnSet("accountid"),
                                    Criteria = new FilterExpression
                                    {
                                        Conditions =
                                        {
                                            new ConditionExpression("msdyn_partyid", ConditionOperator.Equal, partyId.Id)
                                        }
                                    }
                                };

                                EntityCollection relatedEntities = service.RetrieveMultiple(query);
                                Guid accountId = new Guid();

                                foreach (Entity relatedEntity in relatedEntities.Entities)
                                {
                                    accountId = relatedEntity.GetAttributeValue<Guid>("accountid");
                                }

                                //Update Account
                                Entity account = new Entity("account", accountId);
                                account["xma_department"] = department;
                                service.Update(account);
                                tracingService.Trace($"Account Id: {accountId}; Party id: {partyId}; Department: {department}");
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
