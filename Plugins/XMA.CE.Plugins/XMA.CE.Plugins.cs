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

namespace XMA_QuoteNewAdjustedCostPlugin.XMA_QuoteNewAdjustedCost
{
    public class QuoteAdjCostCalc : IPlugin
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
                        //Entity existingEntity = service.Retrieve(eTarget.LogicalName, eTarget.Id, new ColumnSet(true));
                        //if (existingEntity != null)
                        if (context.PostEntityImages.Contains("Image") && context.PostEntityImages["Image"] is Entity postImage)
                        {
                            //Retrieve quote product line charges                            
                            OptionSetValue costSource = postImage.GetAttributeValue<OptionSetValue>("igl_costsourceidentifier");

                            decimal standardCost;
                            decimal bidSupportedCost;
                            decimal sellPrice;
                            decimal prodTotalCharges;
                            decimal quoteProductCost = 0;
                            decimal quoteProductMargin = 0;

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

                            var quantity = postImage.GetAttributeValue<Decimal>("quantity");

                            var quoteDetailId = postImage.GetAttributeValue<Guid>("quotedetailid");

                            Entity quoteDetail = new Entity("quotedetail", eTarget.Id);

                            if (costSource.Value == 285540000)//Standard
                            {
                                quoteProductCost = (standardCost + prodTotalCharges);// * quantity;
                                quoteProductMargin = sellPrice - quoteProductCost;

                                quoteDetail["xma_newadjustedcost"] = quoteProductCost;
                                quoteDetail["xma_margininternalheaderlineadjustments"] = quoteProductMargin;
                                if (sellPrice > 0)
                                {
                                    quoteDetail["xma_margin"] = (quoteProductMargin / sellPrice) * 100;
                                }
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
                            }

                            service.Update(quoteDetail);

                            //Retrieve header charges

                            EntityReference quoteId = postImage.GetAttributeValue<EntityReference>("quoteid");
                            
                            decimal quoteTotalCharges = 0;

                            QueryExpression queryQuoteCharges = new QueryExpression("igl_quoteheadercharges")
                            {
                                ColumnSet = new ColumnSet("igl_chargevalue_dec"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("igl_quote_lookup", ConditionOperator.Equal, quoteId.Id),
                                        new ConditionExpression("igl_displayince_bool", ConditionOperator.Equal, true)
                                    }
                                }
                            };

                            EntityCollection quoteCharges = service.RetrieveMultiple(queryQuoteCharges);

                            foreach (Entity relatedEntity in quoteCharges.Entities)
                            {
                                if (relatedEntity.GetAttributeValue<Money>("igl_chargevalue_dec") == null)
                                    quoteTotalCharges = 0;
                                else
                                    quoteTotalCharges += relatedEntity.GetAttributeValue<Money>("igl_chargevalue_dec").Value;                                
                            }

                            //Retrieve Quote
                            
                            QueryExpression query = new QueryExpression("quote")
                            {
                                ColumnSet = new ColumnSet("igl_totaladjustmentsinternalheaderline", "xma_totalcost", "xma_totalmargin", "totallineitemamount", "freightamount"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("quoteid", ConditionOperator.Equal, quoteId.Id)
                                    }
                                }
                            };

                            EntityCollection relatedEntities = service.RetrieveMultiple(query);

                            decimal quoteTotalCost = 0;
                            decimal quoteTotalMargin = 0;
                            decimal totallineitemamount = 0;
                            decimal freightamount = 0;

                            foreach (Entity relatedEntity in relatedEntities.Entities)
                            {
                                if (relatedEntity.GetAttributeValue<Money>("xma_totalcost") == null)
                                    quoteTotalCost = 0;
                                else
                                    quoteTotalCost = relatedEntity.GetAttributeValue<Money>("xma_totalcost").Value;

                                if (relatedEntity.GetAttributeValue<Money>("xma_totalmargin") == null)
                                    quoteTotalMargin = 0;
                                else
                                    quoteTotalMargin = relatedEntity.GetAttributeValue<Money>("xma_totalmargin").Value;

                                if (relatedEntity.GetAttributeValue<Money>("totallineitemamount") == null)
                                    totallineitemamount = 0;
                                else
                                    totallineitemamount = relatedEntity.GetAttributeValue<Money>("totallineitemamount").Value;

                                if (relatedEntity.GetAttributeValue<Money>("freightamount") == null)
                                    freightamount = 0;
                                else
                                    freightamount = relatedEntity.GetAttributeValue<Money>("freightamount").Value;
                            }

                            //Update Quote Totals--------------------------> totallineitemamount freightamount
                            Entity quote = new Entity("quote", quoteId.Id);
                            quote = new Entity("quote", quoteId.Id);
                            
                            decimal quoteTotalCostCalc = (quoteProductCost * quantity) + quoteTotalCost;// + freightamount;
                            decimal quoteTotalMarginCalc = totallineitemamount - quoteTotalCharges - quoteTotalCostCalc + freightamount;

                            quote["xma_totalcost"] = quoteTotalCostCalc;
                            quote["xma_totalmargin"] = quoteTotalMarginCalc;

                            if (totallineitemamount > 0)
                            {
                                quote["xma_margin"] = Math.Floor(quoteTotalMarginCalc / totallineitemamount * 100);
                            }


                            tracingService.Trace($"Quote Total cost: {quoteTotalCost}; Quote total margin: {quoteTotalMargin}; Quote total line amount: {totallineitemamount}; Quote total freight amount: {freightamount}; Quote Total cost calc: {quoteTotalCostCalc}; Quote Total margin calc: {quoteTotalMarginCalc};");

                            service.Update(quote);
                        }


                        else if (context.PostEntityImages.Contains("ProductChargeLineImage") && context.PostEntityImages["ProductChargeLineImage"] is Entity postImageCharge)
                        {
                            //Retrieve quote product line charges
                            EntityReference quoteProductId = postImageCharge.GetAttributeValue<EntityReference>("igl_quoteproduct");

                            decimal quoteProductLineCharges = 0;

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
                            
                            decimal sellPrice = 0;
                            decimal prodTotalCharges = 0;
                            decimal quoteProductCost = 0;
                            decimal quoteProductMargin = 0;
                            decimal standardCost = 0;
                            decimal bidSupportedCost = 0;
                            EntityReference quoteId = null;
                            OptionSetValue costSource = null;

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


                                quoteId = relatedEntity.GetAttributeValue<EntityReference>("quoteid");
                                costSource = relatedEntity.GetAttributeValue<OptionSetValue>("igl_costsourceidentifier");
                            }
                                                                                    
                            Entity quoteDetail = new Entity("quotedetail", quoteProductId.Id);

                            if (costSource.Value == 285540000)//Standard
                            {
                                quoteProductCost = (standardCost + quoteProductLineCharges);// * quantity;
                                quoteProductMargin = sellPrice - quoteProductCost;

                                quoteDetail["xma_newadjustedcost"] = quoteProductCost;
                                quoteDetail["xma_margininternalheaderlineadjustments"] = quoteProductMargin;
                                if (sellPrice > 0)
                                {
                                    quoteDetail["xma_margin"] = (quoteProductMargin / sellPrice) * 100;
                                }
                            }
                            else if (costSource.Value == 285540001)//Bid
                            {
                                quoteProductCost = (bidSupportedCost + quoteProductLineCharges);// * quantity;
                                quoteProductMargin = sellPrice - quoteProductCost;

                                quoteDetail["xma_newadjustedcost"] = quoteProductCost;
                                quoteDetail["xma_margininternalheaderlineadjustments"] = quoteProductMargin;
                                if (sellPrice > 0)
                                {
                                    quoteDetail["xma_margin"] = (quoteProductMargin / sellPrice) * 100;
                                }
                            }

                            quoteDetail["xma_newadjustedcost"] = quoteProductCost;
                            quoteDetail["xma_margininternalheaderlineadjustments"] = quoteProductMargin;
                            if (sellPrice > 0)
                            {
                                quoteDetail["xma_margin"] = (quoteProductMargin / sellPrice) * 100;
                            }

                            service.Update(quoteDetail);

                            //Retrieve Quote Products                            
                            decimal quoteProductQty = 0;
                            decimal quoteTotalCost = 0;

                            QueryExpression queryQuoteProducts = new QueryExpression("quotedetail")
                            {
                                ColumnSet = new ColumnSet("xma_newadjustedcost", "quantity"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("quoteid", ConditionOperator.Equal, quoteId.Id)                                        
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
                                
                                quoteProductQty = relatedEntity.GetAttributeValue<decimal>("quantity");

                                quoteTotalCost += quoteProductCost * quoteProductQty;
                            }

                            //Retrieve Quote Header Charges
                            decimal quoteTotalCharges = 0;

                            QueryExpression queryQuoteCharges = new QueryExpression("igl_quoteheadercharges")
                            {
                                ColumnSet = new ColumnSet("igl_chargevalue_dec"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("igl_quote_lookup", ConditionOperator.Equal, quoteId.Id),
                                        new ConditionExpression("igl_displayince_bool", ConditionOperator.Equal, true)
                                    }
                                }
                            };

                            EntityCollection quoteCharges = service.RetrieveMultiple(queryQuoteCharges);

                            foreach (Entity relatedEntity in quoteCharges.Entities)
                            {
                                if (relatedEntity.GetAttributeValue<Money>("igl_chargevalue_dec") == null)
                                    quoteTotalCharges = 0;
                                else
                                    quoteTotalCharges += relatedEntity.GetAttributeValue<Money>("igl_chargevalue_dec").Value;
                            }

                            //Retrieve Quote
                            decimal totallineitemamount = 0;
                            decimal freightamount = 0;

                            QueryExpression query = new QueryExpression("quote")
                            {
                                ColumnSet = new ColumnSet("totallineitemamount", "freightamount"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("quoteid", ConditionOperator.Equal, quoteId.Id)
                                    }
                                }
                            };

                            EntityCollection relatedEntities = service.RetrieveMultiple(query);

                            foreach (Entity relatedEntity in relatedEntities.Entities)
                            {
                                if (relatedEntity.GetAttributeValue<Money>("totallineitemamount") == null)
                                    totallineitemamount = 0;
                                else
                                    totallineitemamount = relatedEntity.GetAttributeValue<Money>("totallineitemamount").Value;

                                if (relatedEntity.GetAttributeValue<Money>("freightamount") == null)
                                    freightamount = 0;
                                else
                                    freightamount = relatedEntity.GetAttributeValue<Money>("freightamount").Value;
                            }



                            tracingService.Trace($"Delete : Quote Total cost: {quoteTotalCost}; Quote total charges: {quoteTotalCharges}; Quote total line amount: {totallineitemamount}; Quote total freight amount: {freightamount};  Product cost: {quoteProductCost};");

                            //Update Quote Totals-------------------------->

                            Entity quote = new Entity("quote", quoteId.Id);
                            quote["xma_totalcost"] = quoteTotalCost;
                            quote["xma_totalmargin"] = totallineitemamount - quoteTotalCharges - quoteTotalCost + freightamount;
                            if (totallineitemamount > 0)
                            {
                                quote["xma_margin"] = ((totallineitemamount - quoteTotalCharges - quoteTotalCost + freightamount) / totallineitemamount) * 100;
                            }

                            service.Update(quote);

                        }
                        else if (context.PostEntityImages.Contains("UpdImage") && context.PostEntityImages["UpdImage"] is Entity postImageUpd)
                        {
                            OptionSetValue costSource = postImageUpd.GetAttributeValue<OptionSetValue>("igl_costsourceidentifier");
                            decimal standardCost;
                            decimal bidSupportedCost;
                            decimal sellPrice;
                            decimal prodTotalCharges;
                            decimal quoteProductCost = 0;
                            decimal quoteProductMargin = 0;

                            if (postImageUpd.GetAttributeValue<Money>("igl_standardcost") == null)
                                standardCost = 0;
                            else
                                standardCost = postImageUpd.GetAttributeValue<Money>("igl_standardcost").Value;

                            if (postImageUpd.GetAttributeValue<Money>("igl_bidsupportedcost") == null)
                                bidSupportedCost = 0;
                            else
                                bidSupportedCost = postImageUpd.GetAttributeValue<Money>("igl_bidsupportedcost").Value;

                            if (postImageUpd.GetAttributeValue<Money>("priceperunit") == null)
                                sellPrice = 0;
                            else
                                sellPrice = postImageUpd.GetAttributeValue<Money>("priceperunit").Value;

                            if (postImageUpd.GetAttributeValue<Money>("igl_totalcharges") == null)
                                prodTotalCharges = 0;
                            else
                                prodTotalCharges = postImageUpd.GetAttributeValue<Money>("igl_totalcharges").Value;

                            if (postImageUpd.GetAttributeValue<Money>("xma_newadjustedcost") == null)
                                quoteProductCost = 0;
                            else
                                quoteProductCost = postImageUpd.GetAttributeValue<Money>("xma_newadjustedcost").Value;

                            var quantity = postImageUpd.GetAttributeValue<Decimal>("quantity");

                            var quoteDetailId = postImageUpd.GetAttributeValue<Guid>("quotedetailid");



                            Entity quoteDetail = new Entity("quotedetail", eTarget.Id);

                            if (costSource.Value == 285540000)//Standard
                            {
                                quoteProductCost = (standardCost + prodTotalCharges);// * quantity;
                                quoteProductMargin = sellPrice - quoteProductCost;

                                quoteDetail["xma_newadjustedcost"] = quoteProductCost;
                                quoteDetail["xma_margininternalheaderlineadjustments"] = quoteProductMargin;
                                if (sellPrice > 0)
                                    quoteDetail["xma_margin"] = (quoteProductMargin / sellPrice) * 100;
                            }
                            else if (costSource.Value == 285540001)//Bid
                            {
                                quoteProductCost = (bidSupportedCost + prodTotalCharges);// * quantity;
                                quoteProductMargin = sellPrice - quoteProductCost;

                                quoteDetail["xma_newadjustedcost"] = quoteProductCost;
                                quoteDetail["xma_margininternalheaderlineadjustments"] = quoteProductMargin;
                                if (sellPrice > 0)
                                    quoteDetail["xma_margin"] = (quoteProductMargin / sellPrice) * 100;
                            }

                            //service.Update(quoteDetail);


                            //Retrieve charges

                            EntityReference quoteId = postImageUpd.GetAttributeValue<EntityReference>("quoteid");
                            
                            decimal quoteTotalCharges = 0;

                            QueryExpression queryQuoteCharges = new QueryExpression("igl_quoteheadercharges")
                            {
                                ColumnSet = new ColumnSet("igl_chargevalue_dec"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("igl_quote_lookup", ConditionOperator.Equal, quoteId.Id),
                                        new ConditionExpression("igl_displayince_bool", ConditionOperator.Equal, true)
                                    }
                                }
                            };

                            EntityCollection quoteCharges = service.RetrieveMultiple(queryQuoteCharges);

                            foreach (Entity relatedEntity in quoteCharges.Entities)
                            {
                                if (relatedEntity.GetAttributeValue<Money>("igl_chargevalue_dec") == null)
                                    quoteTotalCharges = 0;
                                else
                                    quoteTotalCharges += relatedEntity.GetAttributeValue<Money>("igl_chargevalue_dec").Value;                                
                            }

                            //Retrieve Quote                       
                            Entity quote = new Entity("quote", quoteId.Id);
                            
                            QueryExpression query = new QueryExpression("quote")
                            {
                                ColumnSet = new ColumnSet("igl_totaladjustmentsinternalheaderline", "xma_totalcost", "xma_totalmargin", "totallineitemamount", "freightamount"),
                                Criteria = new FilterExpression
                                {
                                    Conditions =
                                    {
                                        new ConditionExpression("quoteid", ConditionOperator.Equal, quoteId.Id)
                                    }
                                }
                            };

                            EntityCollection relatedEntities = service.RetrieveMultiple(query);

                            decimal quoteTotalCost = 0;
                            decimal quoteTotalMargin = 0;
                            decimal totallineitemamount = 0;
                            decimal freightamount = 0;

                            foreach (Entity relatedEntity in relatedEntities.Entities)
                            {
                                if (relatedEntity.GetAttributeValue<Money>("xma_totalcost") == null)
                                    quoteTotalCost = 0;
                                else
                                    quoteTotalCost = relatedEntity.GetAttributeValue<Money>("xma_totalcost").Value;

                                if (relatedEntity.GetAttributeValue<Money>("xma_totalmargin") == null)
                                    quoteTotalMargin = 0;
                                else
                                    quoteTotalMargin = relatedEntity.GetAttributeValue<Money>("xma_totalmargin").Value;

                                if (relatedEntity.GetAttributeValue<Money>("totallineitemamount") == null)
                                    totallineitemamount = 0;
                                else
                                    totallineitemamount = relatedEntity.GetAttributeValue<Money>("totallineitemamount").Value;

                                if (relatedEntity.GetAttributeValue<Money>("freightamount") == null)
                                    freightamount = 0;
                                else
                                    freightamount = relatedEntity.GetAttributeValue<Money>("freightamount").Value;
                            }

                            //Update Quote Totals--------------------------> totallineitemamount freightamount

                            quote = new Entity("quote", quoteId.Id);
                            
                            decimal quoteTotalCostCalc = (quoteProductCost * quantity) + quoteTotalCost;
                            decimal quoteTotalMarginCalc = totallineitemamount - quoteTotalCharges - quoteTotalCostCalc + freightamount;

                            quote["xma_totalcost"] = quoteTotalCostCalc;
                            quote["xma_totalmargin"] = quoteTotalMarginCalc;

                            if (totallineitemamount > 0)
                            {
                                quote["xma_margin"] = Math.Floor(quoteTotalMarginCalc / totallineitemamount * 100);
                            }


                            tracingService.Trace($"Quote Total cost: {quoteTotalCost}; Quote total margin: {quoteTotalMargin}; Quote total line amount: {totallineitemamount}; Quote total freight amount: {freightamount}; Quote Total cost calc: {quoteTotalCostCalc}; Quote Total margin calc: {quoteTotalMarginCalc};");

                            service.Update(quote);
                        }

                    }

                }
                else
                {
                    if (context.PreEntityImages.Contains("Image") && context.PreEntityImages["Image"] is Entity preImage)
                    {                        
                        EntityReference quoteId = preImage.GetAttributeValue<EntityReference>("quoteid");
                        var quoteDetailId = preImage.GetAttributeValue<Guid>("quotedetailid");


                        //Retrieve Quote Products
                        decimal quoteProductCost = 0;
                        decimal quoteProductQty = 0;
                        decimal quoteTotalCost = 0;

                        QueryExpression queryQuoteProducts = new QueryExpression("quotedetail")
                        {
                            ColumnSet = new ColumnSet("xma_newadjustedcost", "quantity"),
                            Criteria = new FilterExpression
                            {
                                Conditions =
                                    {
                                        new ConditionExpression("quoteid", ConditionOperator.Equal, quoteId.Id),
                                        new ConditionExpression("quotedetailid", ConditionOperator.NotEqual, quoteDetailId)
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

                            quoteProductQty = relatedEntity.GetAttributeValue<decimal>("quantity");

                            quoteTotalCost += quoteProductCost * quoteProductQty;
                        }

                        //Retrieve charges
                        decimal quoteTotalCharges = 0;

                        QueryExpression queryQuoteCharges = new QueryExpression("igl_quoteheadercharges")
                        {
                            ColumnSet = new ColumnSet("igl_chargevalue_dec"),
                            Criteria = new FilterExpression
                            {
                                Conditions =
                                    {
                                        new ConditionExpression("igl_quote_lookup", ConditionOperator.Equal, quoteId.Id),
                                        new ConditionExpression("igl_displayince_bool", ConditionOperator.Equal, true)
                                    }
                            }
                        };

                        EntityCollection quoteCharges = service.RetrieveMultiple(queryQuoteCharges);

                        foreach (Entity relatedEntity in quoteCharges.Entities)
                        {
                            if (relatedEntity.GetAttributeValue<Money>("igl_chargevalue_dec") == null)
                                quoteTotalCharges = 0;
                            else
                                quoteTotalCharges += relatedEntity.GetAttributeValue<Money>("igl_chargevalue_dec").Value;                            
                        }

                        //Retrieve Quote
                        decimal totallineitemamount = 0;
                        decimal freightamount = 0;

                        QueryExpression query = new QueryExpression("quote")
                        {
                            ColumnSet = new ColumnSet("totallineitemamount", "freightamount"),
                            Criteria = new FilterExpression
                            {
                                Conditions =
                                    {
                                        new ConditionExpression("quoteid", ConditionOperator.Equal, quoteId.Id)
                                    }
                            }
                        };
                        
                        EntityCollection relatedEntities = service.RetrieveMultiple(query);
                                                                        
                        foreach (Entity relatedEntity in relatedEntities.Entities)
                        {                                                        
                            if (relatedEntity.GetAttributeValue<Money>("totallineitemamount") == null)
                                totallineitemamount = 0;
                            else
                                totallineitemamount = relatedEntity.GetAttributeValue<Money>("totallineitemamount").Value;

                            if (relatedEntity.GetAttributeValue<Money>("freightamount") == null)
                                freightamount = 0;
                            else
                                freightamount = relatedEntity.GetAttributeValue<Money>("freightamount").Value;                            
                        }

                        

                        tracingService.Trace($"Delete : Quote Total cost: {quoteTotalCost}; Quote total charges: {quoteTotalCharges}; Quote total line amount: {totallineitemamount}; Quote total freight amount: {freightamount};  Product cost: {quoteProductCost};");

                        //Update Quote Totals-------------------------->

                        Entity quote = new Entity("quote", quoteId.Id);                        
                        quote["xma_totalcost"]      = quoteTotalCost;                        
                        quote["xma_totalmargin"]    = totallineitemamount - quoteTotalCharges - quoteTotalCost + freightamount; 
                        if (totallineitemamount > 0)
                        {
                            quote["xma_margin"] = ((totallineitemamount - quoteTotalCharges - quoteTotalCost + freightamount) / totallineitemamount) * 100;
                        }
                                                    
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
