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
    public class QuoteAdjustedCostCalculation : IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {
            //Initializing Service Context.
            IPluginExecutionContext context = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            IOrganizationServiceFactory factory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            IOrganizationService service = factory.CreateOrganizationService(context.UserId);
            ITracingService tracingService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));

            decimal standardCost = 0;
            decimal bidSupportedCost = 0;
            decimal sellPrice = 0;
            decimal prodTotalCharges = 0;
            decimal quoteProductCost = 0;
            decimal quoteProductMargin = 0;
            decimal quoteTotalCharges = 0;
            decimal quoteTotalCost = 0;
            decimal totallineitemamount = 0;
            decimal freightamount = 0;
            decimal totalAdjChargesLineOnly = 0;
            decimal quoteTotalMarginCalc = 0;
            decimal quoteProductQty = 0;
            decimal marginPercentage = 0;
            decimal quoteProductLineCharges = 0;

            bool productLines = false;

            OptionSetValue costSource = null;

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
                        if (context.PostEntityImages.Contains("QuoteDetailCreate") && context.PostEntityImages["QuoteDetailCreate"] is Entity postImage)
                        {
                            //Retrieve quote product line charges                            
                            costSource = postImage.GetAttributeValue<OptionSetValue>("igl_costsourceidentifier");

                            if (postImage.GetAttributeValue<Money>("igl_standardcost") == null)
                                standardCost = 0;
                            else
                                standardCost = postImage.GetAttributeValue<Money>("igl_standardcost").Value;

                            if (postImage.GetAttributeValue<Money>("igl_bidsupportedcost") == null)
                                bidSupportedCost = 0;
                            else
                                bidSupportedCost = postImage.GetAttributeValue<Money>("igl_bidsupportedcost").Value;

                            if (postImage.GetAttributeValue<Money>("priceperunit") == null)
                                sellPrice = 0;
                            else
                                sellPrice = postImage.GetAttributeValue<Money>("priceperunit").Value;

                            if (postImage.GetAttributeValue<Money>("igl_totalcharges") == null)
                                prodTotalCharges = 0;
                            else
                                prodTotalCharges = postImage.GetAttributeValue<Money>("igl_totalcharges").Value;

                            if (postImage.GetAttributeValue<Money>("xma_newadjustedcost") == null)
                                quoteProductCost = 0;
                            else
                                quoteProductCost = postImage.GetAttributeValue<Money>("xma_newadjustedcost").Value;
                            
                            Entity quoteDetail = new Entity("quotedetail", eTarget.Id);

                            if (costSource.Value == 285540000)
                            {
                                quoteProductCost = (standardCost + prodTotalCharges);
                                quoteProductMargin = sellPrice - quoteProductCost;

                                quoteDetail["xma_newadjustedcost"] = quoteProductCost;
                                quoteDetail["xma_margininternalheaderlineadjustments"] = quoteProductMargin;

                                if (sellPrice > 0)
                                {
                                    quoteDetail["xma_margin"] = (quoteProductMargin / sellPrice) * 100;
                                }
                                else
                                {
                                    quoteDetail["xma_margin"] = marginPercentage;
                                }

                                quoteProductCost = standardCost;
                            }
                            else if (costSource.Value == 285540001)//Bid
                            {
                                quoteProductCost = (bidSupportedCost + prodTotalCharges);// * quantity;
                                quoteProductMargin = sellPrice - quoteProductCost;

                                quoteDetail["xma_newadjustedcost"] = quoteProductCost;
                                quoteDetail["xma_margininternalheaderlineadjustments"] = quoteProductMargin;

                                if (sellPrice > 0)
                                {
                                    quoteDetail["xma_margin"] = (quoteProductMargin / sellPrice) * 100;
                                }
                                else
                                {
                                    quoteDetail["xma_margin"] = marginPercentage;
                                }

                                quoteProductCost = bidSupportedCost;
                            }

                            service.Update(quoteDetail);
                        }
                        else if (context.PostEntityImages.Contains("QuoteDetailUpdate") && context.PostEntityImages["QuoteDetailUpdate"] is Entity postDetailImage)
                        {
                            EntityReference quoteId = postDetailImage.GetAttributeValue<EntityReference>("quoteid");

                            if (quoteId == null)
                                return;

                            if (quoteId != null && quoteId.Id == null)
                                return;

                            Entity quote = new Entity("quote", quoteId.Id);
                            service.Update(quote);

                        }
                        else if (context.PostEntityImages.Contains("ProductChargeLineImage") && context.PostEntityImages["ProductChargeLineImage"] is Entity postImageCharge)
                        {
                            //Retrieve quote product line charges
                            EntityReference quoteProductId = postImageCharge.GetAttributeValue<EntityReference>("igl_quoteproduct");

                            if (quoteProductId == null)
                                return;

                            if (quoteProductId != null && quoteProductId.Id == null)
                                return;

                            if (postImageCharge.GetAttributeValue<Money>("igl_calculatedvalue") == null)
                                quoteProductLineCharges = 0;
                            else
                                quoteProductLineCharges = postImageCharge.GetAttributeValue<Money>("igl_calculatedvalue").Value;

                            //Retrieve Quote product
                            QueryExpression queryQuoteProduct = new QueryExpression("quotedetail")
                            {
                                ColumnSet = new ColumnSet("quoteid", "igl_costsourceidentifier", "igl_standardcost", "igl_bidsupportedcost", "priceperunit", "igl_totalcharges", "xma_newadjustedcost", "quantity"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                {
                                    new ConditionExpression("quotedetailid", ConditionOperator.Equal, quoteProductId.Id)
                                }
                                }
                            };

                            EntityReference quoteId = null;

                            EntityCollection product = service.RetrieveMultiple(queryQuoteProduct);

                            foreach (Entity relatedEntity in product.Entities)
                            {
                                if (relatedEntity.GetAttributeValue<Money>("igl_totalcharges") == null)
                                    prodTotalCharges = 0;
                                else
                                    prodTotalCharges = relatedEntity.GetAttributeValue<Money>("igl_totalcharges").Value;

                                if (relatedEntity.GetAttributeValue<Money>("xma_newadjustedcost") == null)
                                    quoteProductCost = 0;
                                else
                                    quoteProductCost = relatedEntity.GetAttributeValue<Money>("xma_newadjustedcost").Value;

                                if (relatedEntity.GetAttributeValue<Money>("priceperunit") == null)
                                    sellPrice = 0;
                                else
                                    sellPrice = relatedEntity.GetAttributeValue<Money>("priceperunit").Value;

                                if (relatedEntity.GetAttributeValue<Money>("igl_standardcost") == null)
                                    standardCost = 0;
                                else
                                    standardCost = relatedEntity.GetAttributeValue<Money>("igl_standardcost").Value;

                                if (relatedEntity.GetAttributeValue<Money>("igl_bidsupportedcost") == null)
                                    bidSupportedCost = 0;
                                else
                                    bidSupportedCost = relatedEntity.GetAttributeValue<Money>("igl_bidsupportedcost").Value;

                                if (relatedEntity.GetAttributeValue<Money>("igl_totalchargevalue") == null)
                                    quoteTotalCharges = 0;
                                else
                                    quoteTotalCharges = relatedEntity.GetAttributeValue<Money>("igl_totalchargevalue").Value;

                                quoteId = relatedEntity.GetAttributeValue<EntityReference>("quoteid");
                                costSource = relatedEntity.GetAttributeValue<OptionSetValue>("igl_costsourceidentifier");
                            }

                            Entity quoteDetail = new Entity("quotedetail", quoteProductId.Id);

                            if (costSource.Value == 285540000)//Standard
                            {
                                quoteProductCost = (standardCost + quoteProductLineCharges);
                                quoteProductMargin = sellPrice - quoteProductCost;

                                quoteDetail["xma_newadjustedcost"] = quoteProductCost;
                                quoteDetail["xma_margininternalheaderlineadjustments"] = quoteProductMargin;

                                if (sellPrice > 0)
                                {
                                    quoteDetail["xma_margin"] = (quoteProductMargin / sellPrice) * 100;
                                }
                                else
                                {
                                    quoteDetail["xma_margin"] = marginPercentage;
                                }
                            }
                            else if (costSource.Value == 285540001)//Bid
                            {
                                quoteProductCost = (bidSupportedCost + quoteProductLineCharges);
                                quoteProductMargin = sellPrice - quoteProductCost;

                                quoteDetail["xma_newadjustedcost"] = quoteProductCost;
                                quoteDetail["xma_margininternalheaderlineadjustments"] = quoteProductMargin;

                                if (sellPrice > 0)
                                {
                                    quoteDetail["xma_margin"] = (quoteProductMargin / sellPrice) * 100;
                                }
                                else
                                {
                                    quoteDetail["xma_margin"] = marginPercentage;
                                }
                            }

                            service.Update(quoteDetail);

                        }
                        else if (context.PreEntityImages.Contains("QuoteUpdateImage") && context.PreEntityImages["QuoteUpdateImage"] is Entity preImageQuoteUpd)
                        {
                            Entity entity = (Entity)context.InputParameters["Target"];

                            if (entity == null)
                                return;

                            if (entity != null && entity.LogicalName != "quote")
                                return;
                            
                            if (preImageQuoteUpd.GetAttributeValue<Money>("igl_totaladjustmentsinternal") == null)
                                totalAdjChargesLineOnly = 0;
                            else
                                totalAdjChargesLineOnly = preImageQuoteUpd.GetAttributeValue<Money>("igl_totaladjustmentsinternal").Value;

                            if (preImageQuoteUpd.GetAttributeValue<Money>("igl_totalchargevalue") == null)
                                quoteTotalCharges = 0;
                            else
                                quoteTotalCharges = preImageQuoteUpd.GetAttributeValue<Money>("igl_totalchargevalue").Value;

                            if (preImageQuoteUpd.GetAttributeValue<Money>("freightamount") == null)
                                freightamount = 0;
                            else
                                freightamount = preImageQuoteUpd.GetAttributeValue<Money>("freightamount").Value;

                            if (preImageQuoteUpd.GetAttributeValue<Money>("totallineitemamount") == null)
                                totallineitemamount = 0;
                            else
                                totallineitemamount = preImageQuoteUpd.GetAttributeValue<Money>("totallineitemamount").Value;

                            //Retrieve Quote Products                            
                            QueryExpression queryQuoteProducts = new QueryExpression("quotedetail")
                            {
                                ColumnSet = new ColumnSet("xma_newadjustedcost", "quantity", "igl_standardcost", "igl_bidsupportedcost", "igl_costsourceidentifier"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("quoteid", ConditionOperator.Equal, entity.Id)
                                    }
                                }
                            };

                            EntityCollection quoteProducts = service.RetrieveMultiple(queryQuoteProducts);

                            foreach (Entity relatedEntity in quoteProducts.Entities)
                            {
                                if (relatedEntity.GetAttributeValue<Money>("xma_newadjustedcost") == null)
                                    quoteProductCost = 0;
                                else
                                    quoteProductCost = relatedEntity.GetAttributeValue<Money>("xma_newadjustedcost").Value;

                                if (relatedEntity.GetAttributeValue<Money>("igl_standardcost") == null)
                                    standardCost = 0;
                                else
                                    standardCost = relatedEntity.GetAttributeValue<Money>("igl_standardcost").Value;

                                if (relatedEntity.GetAttributeValue<Money>("igl_bidsupportedcost") == null)
                                    bidSupportedCost = 0;
                                else
                                    bidSupportedCost = relatedEntity.GetAttributeValue<Money>("igl_bidsupportedcost").Value;

                                costSource = relatedEntity.GetAttributeValue<OptionSetValue>("igl_costsourceidentifier");

                                quoteProductQty = relatedEntity.GetAttributeValue<decimal>("quantity");

                                if (costSource.Value == 285540000)
                                {
                                    quoteTotalCost += standardCost * quoteProductQty;
                                }
                                else if (costSource.Value == 285540001)
                                {
                                    quoteTotalCost += bidSupportedCost * quoteProductQty;
                                }

                                standardCost = 0;
                                bidSupportedCost = 0;
                                productLines = true;
                            }

                            quoteTotalCost = quoteTotalCost + totalAdjChargesLineOnly;
                            quoteTotalMarginCalc = totallineitemamount - quoteTotalCharges - quoteTotalCost + freightamount;

                            entity["xma_totalcost"] = productLines ? quoteTotalCost : 0;
                            entity["xma_totalmargin"] = productLines ? quoteTotalMarginCalc : 0;

                            if (totallineitemamount > 0 && productLines)
                            {
                                entity["xma_margin"] = (quoteTotalMarginCalc / totallineitemamount) * 100;
                            }
                            else
                            {
                                entity["xma_margin"] = marginPercentage;
                            }
                        }
                        else if (context.PreEntityImages.Contains("DeleteQuoteDetail") && context.PreEntityImages["DeleteQuoteDetail"] is Entity preImage)
                        {
                            EntityReference quoteId = preImage.GetAttributeValue<EntityReference>("quoteid");

                            if (quoteId == null)
                                return;

                            if (quoteId != null && quoteId.Id == null)
                                return;

                            Entity quote = new Entity("quote", quoteId.Id);

                            service.Update(quote);
                        }
                    }

                }
                else
                {
                    if (context.PreEntityImages.Contains("DeleteQuoteDetail") && context.PreEntityImages["DeleteQuoteDetail"] is Entity preImage)
                    {
                        EntityReference quoteId = preImage.GetAttributeValue<EntityReference>("quoteid");

                        if (quoteId == null)
                            return;

                        if (quoteId != null && quoteId.Id == null)
                            return;

                        Entity quote = new Entity("quote", quoteId.Id);

                        service.Update(quote);
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
