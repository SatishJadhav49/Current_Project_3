using Microsoft.Diagnostics.Instrumentation.Extensions.Base;
using OfficeOpenXml;
using QualityAPI.Areas.HelpPage.ModelDescriptions;
using QualityAPI.Controllers.Transactions;
using QualityAPI.Helper;
using QualityAPI.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;

namespace QualityAPI.Controllers.Common_Masters
{
    public class MM_SpecificationMasterController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        GlobalOperations global = new GlobalOperations();
        private General generalLogObj = new General();
        // GET: MM_SpecificationMaster
        public IQueryable<MM_SpecificationMaster> GetMM_SpecificationMaster()
        {
            return db.MM_SpecificationMaster;
        }

        [Route("api/MM_SpecificationMaster/GetSpecification/{Plant_ID},{Audit_Type_Id},{Shop_ID},{Model_ID}")]
        [HttpGet]
        [ActionName("GetSpecification")]
        public IHttpActionResult GetSpecification(decimal Plant_ID, decimal Audit_Type_Id, int Shop_ID, int Model_ID)
        {
            try
            {
                //IEnumerable<decimal> Shop_ids;

                //if (Is_AllShops == true)
                //{
                //    Shop_ids = (from shop in db.MM_Shop
                //                where shop.Audit_Type_Id == Audit_Type_Id && shop.Plant_ID == Plant_ID
                //                select (decimal)shop.Shop_ID).ToList();
                //}
                //else
                //{
                //    Shop_ids = new List<decimal> { Shop_ID };
                //}
                var obj = (from specification in db.MM_SpecificationMaster
                           join shop in db.MM_Shop on specification.Shop_ID equals shop.Shop_ID
                           join model in db.MM_Model on specification.Model_ID equals model.Model_ID
                           join area in db.MM_AreaMaster on specification.Area_ID equals area.Area_ID
                           join part in db.MM_PartMaster on specification.Part_ID equals part.Part_ID
                           join checkpoint in db.MM_CheckpointMaster on specification.Checkpoint_ID equals checkpoint.Checkpoint_ID
                           join location in db.MM_LocationMaster on specification.Location_ID equals location.Location_ID
                           where specification.Audit_Type_Id == Audit_Type_Id && specification.Plant_ID == Plant_ID
                          // && Shop_ids.Contains(specification.Shop_ID ?? 0)
                          && shop.Shop_ID == Shop_ID && model.Model_ID== Model_ID
                           orderby specification.Inserted_Date descending
                           select new
                           {
                               specification.Specification_ID,
                               specification.Specification_Desc,
                               specification.Area_ID,
                               area.Area_Name,
                               specification.Specification_Name,
                               specification.Is_Active,
                               specification.SORTORDER,
                               specification.Model_ID,
                               specification.MaxVal,
                               specification.MinVal,
                               specification.Is_Gap,
                               specification.Is_Flushness,
                               model.Model_Name,
                               specification.Shop_ID,
                               shop.Shop_Name,
                               specification.Plant_ID,
                               part.Part_ID,
                               part.Part_Name,
                               checkpoint.Checkpoint_ID,
                               checkpoint.Checkpoint_Name,
                               location.Location_ID,
                               location.Location_Name,
                               specification.Audit_Type_Id,
                               specification.LCL,
                               specification.UCL,
                               specification.UCLR,
                               Status = specification.Is_Active == true ? "Active" : "In Active"
                           }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = obj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_SpecificationMaster", "GetSpecification(" + Plant_ID + "," + Audit_Type_Id + "," + Shop_ID + "," + Model_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }


        [Route("api/MM_SpecificationMaster/GetSpecificationByID/{Specification_ID}")]
        [HttpGet]
        [ActionName("GetSpecificationByID")]
        public IHttpActionResult GetSpecificationByID(int Specification_ID)
        {
            try
            {
                var obj = (from specification in db.MM_SpecificationMaster
                           where specification.Specification_ID == Specification_ID
                           select new
                           {
                               specification.Specification_ID,
                               specification.Specification_Desc,
                               specification.Area_ID,
                               specification.Specification_Name,
                               specification.SORTORDER,
                               specification.Model_ID,
                               specification.Part_ID,
                               specification.MaxVal,
                               specification.MinVal,
                               specification.Is_Gap,
                               specification.Is_Flushness,
                               specification.Is_Active,
                               specification.Shop_ID,
                               specification.Plant_ID,
                               specification.Location_ID,
                               specification.Checkpoint_ID
                           }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = obj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_SpecificationMaster", "GetSpecificationByID(" + Specification_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        // GET: api/MM_Model/5
        [ResponseType(typeof(MM_Model))]
        public IHttpActionResult GetMM_SpecificationMaster(decimal id)
        {
            try
            {
                MM_SpecificationMaster MM_SpecificationMaster = db.MM_SpecificationMaster.Find(id);
                if (MM_SpecificationMaster == null)
                {
                    return NotFound();
                }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = MM_SpecificationMaster;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_SpecificationMaster", "GetMM_SpecificationMaster(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_SpecificationMaster/EditSpecificationMaster/{id}")]
        [HttpPut]
        [ActionName("EditSpecificationMaster")]
        public IHttpActionResult EditSpecificationMaster(decimal id, MM_SpecificationMaster mM_SpecificationMaster)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = Convert.ToDecimal(mM_SpecificationMaster.Updated_User_ID);
            try
            {
                if (db.MM_SpecificationMaster.Any(m => m.Specification_Name.ToUpper() == mM_SpecificationMaster.Specification_Name.ToUpper() && m.Specification_ID != mM_SpecificationMaster.Specification_ID && m.Plant_ID == mM_SpecificationMaster.Plant_ID && m.Shop_ID == mM_SpecificationMaster.Shop_ID && m.Model_ID == mM_SpecificationMaster.Model_ID && m.Area_ID == mM_SpecificationMaster.Area_ID && m.Part_ID == mM_SpecificationMaster.Part_ID && m.Checkpoint_ID == mM_SpecificationMaster.Checkpoint_ID && m.Location_ID == mM_SpecificationMaster.Location_ID && m.Audit_Type_Id == mM_SpecificationMaster.Audit_Type_Id && m.Is_Active == true))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                MM_SpecificationMaster obj = db.MM_SpecificationMaster.Where(p => p.Specification_ID == id).FirstOrDefault();
                if (obj != null)
                {
                    obj.Specification_Name = mM_SpecificationMaster.Specification_Name;
                    obj.Specification_Desc = mM_SpecificationMaster.Specification_Desc;
                    obj.Shop_ID = mM_SpecificationMaster.Shop_ID;
                    obj.Model_ID = mM_SpecificationMaster.Model_ID;
                    obj.Area_ID = mM_SpecificationMaster.Area_ID;
                    obj.Part_ID = mM_SpecificationMaster.Part_ID;
                    obj.Checkpoint_ID = mM_SpecificationMaster.Checkpoint_ID;
                    obj.Location_ID = mM_SpecificationMaster.Location_ID;
                    obj.MinVal = mM_SpecificationMaster.MinVal;
                    obj.MaxVal = mM_SpecificationMaster.MaxVal;
                    obj.UCL = mM_SpecificationMaster.UCL;
                    obj.LCL = mM_SpecificationMaster.LCL;
                    obj.UCLR = mM_SpecificationMaster.UCLR;
                    obj.Is_Gap = mM_SpecificationMaster.Is_Gap;
                    obj.Is_Flushness = mM_SpecificationMaster.Is_Flushness;
                    obj.Is_Active = mM_SpecificationMaster.Is_Active;
                    obj.SORTORDER = mM_SpecificationMaster.SORTORDER;
                    obj.Plant_ID = mM_SpecificationMaster.Plant_ID;
                    obj.Plant_Code = mM_SpecificationMaster.Plant_Code;
                    obj.Audit_Type_Id = mM_SpecificationMaster.Audit_Type_Id;
                    obj.Is_Edited = true;
                    obj.Updated_Host = mM_SpecificationMaster.Updated_Host;
                    obj.Updated_User_ID = mM_SpecificationMaster.Updated_User_ID;
                    obj.Updated_Date = DateTime.Now;
                    db.Entry(obj).State = EntityState.Modified;
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.UpdateMessage;
                    messageDataObj.messageTitle = messageDataObj.UpdateTitle;
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e.InnerException, "MM_SpecificationMasterController", "EditSpecificationMaster()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
            }
            catch (Exception e)
            {
                if (!MM_SpecificationMasterExists(id))
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_SpecificationMasterController", "EditSpecificationMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                    messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;
                    return Ok(messageDataObj);
                }
                else
                {
                    if (e.InnerException != null)
                    {
                        e = e.InnerException;
                    }
                    generalLogObj.addControllerException(e.InnerException, "MM_SpecificationMasterController", "EditSpecificationMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
                }
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_SpecificationMaster/SaveUpdatedCalculation/{id}")]
        [HttpPut]
        [ActionName("SaveUpdatedCalculation")]
        public IHttpActionResult SaveUpdatedCalculation(decimal id, MM_SpecificationMaster mM_SpecificationMaster)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = Convert.ToDecimal(mM_SpecificationMaster.Updated_User_ID);
            try
            {
                if (db.MM_SpecificationMaster.Any(m => m.Specification_Name.ToUpper() == mM_SpecificationMaster.Specification_Name.ToUpper() && m.Specification_ID != mM_SpecificationMaster.Specification_ID && m.Plant_ID == mM_SpecificationMaster.Plant_ID && m.Shop_ID == mM_SpecificationMaster.Shop_ID && m.Model_ID == mM_SpecificationMaster.Model_ID && m.Area_ID == mM_SpecificationMaster.Area_ID && m.Part_ID == mM_SpecificationMaster.Part_ID && m.Checkpoint_ID == mM_SpecificationMaster.Checkpoint_ID && m.Location_ID == mM_SpecificationMaster.Location_ID && m.Audit_Type_Id == mM_SpecificationMaster.Audit_Type_Id && m.Is_Active == true))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                MM_SpecificationMaster obj = db.MM_SpecificationMaster.Where(p => p.Specification_ID == id).FirstOrDefault();
                if (obj != null)
                {
                    obj.Is_Active = false;
                    obj.Updated_Host = mM_SpecificationMaster.Updated_Host;
                    obj.Updated_User_ID = mM_SpecificationMaster.Updated_User_ID;
                    obj.Updated_Date = DateTime.Now;
                    db.Entry(obj).State = EntityState.Modified;
                    db.SaveChanges();

                    
                    if (mM_SpecificationMaster.Is_Gap.HasValue && mM_SpecificationMaster.Is_Gap.Value)
                    {
                        var existingGapEntries = db.MM_SpecificationMaster.Where(m => m.Location_ID == mM_SpecificationMaster.Location_ID && m.Is_Gap == true && m.Is_Active == true).ToList();
                        foreach (var existingEntry in existingGapEntries)
                        {
                            existingEntry.Is_Active = false;
                            db.Entry(existingEntry).State = EntityState.Modified;
                        }
                        db.SaveChanges();
                    }

                    if (mM_SpecificationMaster.Is_Flushness.HasValue && mM_SpecificationMaster.Is_Flushness.Value)
                    {
                        var existingFlushnessEntries = db.MM_SpecificationMaster.Where(m => m.Location_ID == mM_SpecificationMaster.Location_ID && m.Is_Flushness == true && m.Is_Active == true).ToList();
                        foreach (var existingEntry in existingFlushnessEntries)
                        {
                            existingEntry.Is_Active = false;
                            db.Entry(existingEntry).State = EntityState.Modified;
                        }
                        db.SaveChanges();
                    }

                    MM_SpecificationMaster newObj = new MM_SpecificationMaster();
                    newObj.Specification_Name = mM_SpecificationMaster.Specification_Name;
                    newObj.Specification_Desc = mM_SpecificationMaster.Specification_Desc;
                    newObj.Shop_ID = mM_SpecificationMaster.Shop_ID;
                    newObj.Model_ID = mM_SpecificationMaster.Model_ID;
                    newObj.Area_ID = mM_SpecificationMaster.Area_ID;
                    newObj.Part_ID = mM_SpecificationMaster.Part_ID;
                    newObj.Checkpoint_ID = mM_SpecificationMaster.Checkpoint_ID;
                    newObj.Location_ID = mM_SpecificationMaster.Location_ID;
                    newObj.MinVal = mM_SpecificationMaster.MinVal;
                    newObj.MaxVal = mM_SpecificationMaster.MaxVal;
                    newObj.UCL = mM_SpecificationMaster.UCL;
                    newObj.LCL = mM_SpecificationMaster.LCL;
                    newObj.UCLR = mM_SpecificationMaster.UCLR;
                    newObj.Is_Gap = mM_SpecificationMaster.Is_Gap;
                    newObj.Is_Flushness = mM_SpecificationMaster.Is_Flushness;
                    newObj.Is_Active = true; // New entry should be active
                    newObj.SORTORDER = mM_SpecificationMaster.SORTORDER;
                    newObj.Plant_ID = mM_SpecificationMaster.Plant_ID;
                    newObj.Audit_Type_Id = mM_SpecificationMaster.Audit_Type_Id;
                    newObj.Inserted_Host = mM_SpecificationMaster.Updated_Host;
                    newObj.Inserted_User_ID = mM_SpecificationMaster.Updated_User_ID;
                    newObj.Inserted_Date = DateTime.Now;
                    db.MM_SpecificationMaster.Add(newObj);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.UpdateMessage;
                    messageDataObj.messageTitle = messageDataObj.UpdateTitle;
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e.InnerException, "MM_SpecificationMasterController", "SaveUpdatedCalculation("+id+")", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
            }
            catch (Exception e)
            {
                if (!MM_SpecificationMasterExists(id))
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_SpecificationMasterController", "SaveUpdatedCalculation("+id+")", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                    messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;
                    return Ok(messageDataObj);
                }
                else
                {
                    if (e.InnerException != null)
                    {
                        e = e.InnerException;
                    }
                    generalLogObj.addControllerException(e.InnerException, "MM_SpecificationMasterController", "SaveUpdatedCalculation("+id+")", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
                }
            }
            return Ok(messageDataObj);
        }


        //[Route("api/MM_SpecificationMaster/SaveMM_SpecificationMaster")]
        //[HttpPost]
        //[ActionName("SaveMM_SpecificationMaster")]
        //public IHttpActionResult SaveMM_SpecificationMaster(MM_SpecificationMaster[] mM_SpecificationMaster)
        //{
        //    decimal userid = 0;
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }
        //    try
        //    {
        //        foreach (var item in mM_SpecificationMaster)
        //        {
        //            userid = Convert.ToDecimal(item.Inserted_User_ID);
        //            if (db.MM_SpecificationMaster.Any(m => m.Specification_Name.ToUpper() == item.Specification_Name.ToUpper() && m.Plant_ID == item.Plant_ID && m.Shop_ID == item.Shop_ID && m.Model_ID == item.Model_ID && m.Area_ID == item.Area_ID && m.Part_ID == item.Part_ID && m.Checkpoint_ID == item.Checkpoint_ID && m.Location_ID == item.Location_ID && m.Audit_Type_Id == item.Audit_Type_Id && m.Is_Active == true))
        //            {
        //                messageDataObj.isAlertMessage = true;
        //                messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
        //                messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

        //                return Ok(messageDataObj);
        //            }
        //        }
        //        foreach (var item in mM_SpecificationMaster)
        //        {
        //            MM_SpecificationMaster obj = new MM_SpecificationMaster();
        //            obj.Specification_Name = item.Specification_Name;
        //            obj.Specification_Desc = item.Specification_Desc;
        //            obj.Shop_ID = item.Shop_ID;
        //            obj.Model_ID = item.Model_ID;
        //            obj.Area_ID = item.Area_ID;
        //            obj.Part_ID = item.Part_ID;
        //            obj.Checkpoint_ID = item.Checkpoint_ID;
        //            obj.Location_ID = item.Location_ID;
        //            obj.MinVal = item.MinVal;
        //            obj.MaxVal = item.MaxVal;
        //            obj.UCL = item.UCL;
        //            obj.LCL = item.LCL;
        //            obj.UCLR = item.UCLR;
        //            obj.Is_Gap = item.Is_Gap;
        //            obj.Is_Flushness = item.Is_Flushness;
        //            obj.Is_Active = item.Is_Active;
        //            obj.SORTORDER = item.SORTORDER;
        //            obj.Plant_ID = item.Plant_ID;
        //            obj.Audit_Type_Id = item.Audit_Type_Id;
        //            obj.Inserted_Host = item.Inserted_Host;
        //            obj.Inserted_User_ID = item.Inserted_User_ID;
        //            obj.Inserted_Date = DateTime.Now;
        //            db.MM_SpecificationMaster.Add(obj);
        //            db.SaveChanges();

        //            messageDataObj.isSuccessMessage = true;
        //            messageDataObj.messageDetail = messageDataObj.SuccessMessage;
        //            messageDataObj.messageTitle = messageDataObj.SuccessTitle;
        //        }
        //    }
        //    catch (DbUpdateException e)
        //    {
        //        generalLogObj.addControllerException(e, "MM_SpecificationMasterController", "SaveMM_SpecificationMaster()", userid);
        //        messageDataObj.isErrorMessage = true;
        //        messageDataObj.messageDetail = e.ToString();
        //        messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;

        //        return Ok(messageDataObj);

        //    }
        //    catch (Exception e)
        //    {
        //        if (e.InnerException != null)
        //        {
        //            e = e.InnerException;
        //        }
        //        generalLogObj.addControllerException(e, "MM_SpecificationMasterController", "SaveMM_SpecificationMaster()", userid);
        //        messageDataObj.isErrorMessage = true;
        //        messageDataObj.messageDetail = e.ToString();
        //        messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
        //    }
        //    //catch (DbEntityValidationException ex)
        //    //{
        //    //    foreach (var entityValidationErrors in ex.EntityValidationErrors)
        //    //    {
        //    //        foreach (var validationError in entityValidationErrors.ValidationErrors)
        //    //        {
        //    //            var propertyName = validationError.PropertyName;
        //    //            var errorMessage = validationError.ErrorMessage;
        //    //        }
        //    //    }
        //    //}
        //    return Ok(messageDataObj);
        //}

        [Route("api/MM_SpecificationMaster/SaveMM_SpecificationMaster")]
        [HttpPost]
        [ActionName("SaveMM_SpecificationMaster")]
        public IHttpActionResult SaveMM_SpecificationMaster(MM_SpecificationMaster[] mM_SpecificationMaster)
        {
            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                foreach (var item in mM_SpecificationMaster)
                {
                    userid = Convert.ToDecimal(item.Inserted_User_ID);
                    if (db.MM_SpecificationMaster.Any(m => m.Specification_Name.ToUpper() == item.Specification_Name.ToUpper() && m.Plant_ID == item.Plant_ID && m.Shop_ID == item.Shop_ID && m.Model_ID == item.Model_ID && m.Area_ID == item.Area_ID && m.Part_ID == item.Part_ID && m.Checkpoint_ID == item.Checkpoint_ID && m.Location_ID == item.Location_ID && m.Audit_Type_Id == item.Audit_Type_Id && m.Is_Active == true))
                    {
                        messageDataObj.isAlertMessage = true;
                        messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                        messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                        return Ok(messageDataObj);
                    }
                }
                foreach (var item in mM_SpecificationMaster)
                {
                    // Update existing entries for Is_Gap
                    if (item.Is_Gap.HasValue && item.Is_Gap.Value)
                    {
                        var existingGapEntries = db.MM_SpecificationMaster.Where(m => m.Location_ID == item.Location_ID && m.Is_Gap == true && m.Is_Active == true).ToList();
                        foreach (var existingEntry in existingGapEntries)
                        {
                            existingEntry.Is_Active = false;
                            db.Entry(existingEntry).State = EntityState.Modified;
                        }
                        db.SaveChanges();
                    }

                    // Update existing entries for Is_Flushness
                    if (item.Is_Flushness.HasValue && item.Is_Flushness.Value)
                    {
                        var existingFlushnessEntries = db.MM_SpecificationMaster.Where(m => m.Location_ID == item.Location_ID && m.Is_Flushness == true && m.Is_Active == true).ToList();
                        foreach (var existingEntry in existingFlushnessEntries)
                        {
                            existingEntry.Is_Active = false;
                            db.Entry(existingEntry).State = EntityState.Modified;
                        }
                        db.SaveChanges();
                    }

                    // Add the new entry
                    MM_SpecificationMaster obj = new MM_SpecificationMaster();
                    obj.Specification_Name = item.Specification_Name;
                    obj.Specification_Desc = item.Specification_Desc;
                    obj.Shop_ID = item.Shop_ID;
                    obj.Model_ID = item.Model_ID;
                    obj.Area_ID = item.Area_ID;
                    obj.Part_ID = item.Part_ID;
                    obj.Checkpoint_ID = item.Checkpoint_ID;
                    obj.Location_ID = item.Location_ID;
                    obj.MinVal = item.MinVal;
                    obj.MaxVal = item.MaxVal;
                    obj.UCL = item.UCL;
                    obj.LCL = item.LCL;
                    obj.UCLR = item.UCLR;
                    obj.Is_Gap = item.Is_Gap;
                    obj.Is_Flushness = item.Is_Flushness;
                    obj.Is_Active = item.Is_Active;
                    obj.SORTORDER = item.SORTORDER;
                    obj.Plant_ID = item.Plant_ID;
                    obj.Plant_Code = item.Plant_Code;
                    obj.Audit_Type_Id = item.Audit_Type_Id;
                    obj.Inserted_Host = item.Inserted_Host;
                    obj.Inserted_User_ID = item.Inserted_User_ID;
                    obj.Inserted_Date = DateTime.Now;
                    db.MM_SpecificationMaster.Add(obj);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                    messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_SpecificationMasterController", "SaveMM_SpecificationMaster()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;

                return Ok(messageDataObj);
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_SpecificationMasterController", "SaveMM_SpecificationMaster()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_SpecificationMaster/DeleteMM_SpecificationMaster/{Specification_ID}")]
        [HttpDelete]
        [ActionName("DeleteMM_SpecificationMaster")]
        public IHttpActionResult DeleteMM_SpecificationMaster(decimal Specification_ID)
        {
            MM_SpecificationMaster MM_SpecificationMaster = db.MM_SpecificationMaster.Find(Specification_ID);
            if (MM_SpecificationMaster == null)
            {
                return NotFound();
            }
            else
            {
                try
                {
                    db.MM_SpecificationMaster.Remove(MM_SpecificationMaster);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                    messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                }
                catch (DbUpdateException dbe)
                {
                    generalLogObj.addControllerException(dbe, "MM_SpecificationMaster", "DeleteMM_SpecificationMaster(" + Specification_ID + ")", 1);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = dbe.ToString();
                    messageDataObj.messageTitle = messageDataObj.DeleteConflictTitle;
                }
                catch (Exception e)
                {
                    while (e.InnerException != null)
                    {
                        e = e.InnerException;
                    }
                    generalLogObj.addControllerException(e, "MM_SpecificationMaster", "DeleteMM_SpecificationMaster(" + Specification_ID + ")", 1);
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.DeletionErrorTitle;
                    messageDataObj.isErrorMessage = true;
                }
                return Ok(messageDataObj);
            }
        }
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
        private bool MM_SpecificationMasterExists(decimal id)
        {
            return db.MM_SpecificationMaster.Count(e => e.Specification_ID == id) > 0;
        }

        [Route("api/MM_SpecificationMaster/UploadData")]
        [HttpPost]
        [ActionName("UploadData")]
        public IHttpActionResult UploadData()
        {
            int? Inserted_User_ID = 0;
            try
            {
                var httpRequest = HttpContext.Current.Request;
                HttpFileCollection uploadFiles = httpRequest.Files;
                var docfiles = new List<string>();
                HttpPostedFile postedFile = uploadFiles[0];
                MM_SpecificationMaster obj = (MM_SpecificationMaster)Newtonsoft.Json.JsonConvert.DeserializeObject(httpRequest.Params["otherinfo"], typeof(MM_SpecificationMaster));
                string filePath = HttpContext.Current.Server.MapPath("~/App_Data/" + postedFile.FileName);
                postedFile.SaveAs(filePath);
                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
                using (var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    var worksheet = package.Workbook.Worksheets[0];

                    int rowCount = worksheet.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++)
                    {
                        string Area_Name = worksheet.Cells[row, 1].Value?.ToString();
                        string Part_Name = worksheet.Cells[row, 2].Value?.ToString();
                        string Checkpoint_Name = worksheet.Cells[row, 3].Value?.ToString();
                        object cellValue = worksheet.Cells[row, 4].Value;
                        string Parallelism = (cellValue != null) ? cellValue?.ToString() : null;
                        string Location_Name = worksheet.Cells[row, 5].Value?.ToString();
                        string Specification_Name = worksheet.Cells[row, 6].Value?.ToString();
                        string Gap = worksheet.Cells[row, 7].Value?.ToString();
                        string GapMinVal = worksheet.Cells[row, 8].Value?.ToString();
                        string GapMaxVal = worksheet.Cells[row, 9].Value?.ToString();
                        string GapUCL = worksheet.Cells[row, 10].Value?.ToString();
                        string GapLCL = worksheet.Cells[row, 11].Value?.ToString();
                        string GapUCLR = worksheet.Cells[row, 12].Value?.ToString();
                        string Flushness = worksheet.Cells[row, 13].Value?.ToString();
                        string FlushMinVal = worksheet.Cells[row, 14].Value?.ToString();
                        string FlushMaxVal = worksheet.Cells[row, 15].Value?.ToString();
                        string FlushUCL = worksheet.Cells[row, 16].Value?.ToString();
                        string FlushLCL = worksheet.Cells[row, 17].Value?.ToString();
                        string FlushUCLR = worksheet.Cells[row, 18].Value?.ToString();
                        string SORTORDER = worksheet.Cells[row, 19].Value?.ToString();

                        // validation part
                        string message = "";
                        decimal ParallelismdecValue;
                        decimal GapMinValdecValue;
                        decimal GapMaxValdecValue;
                        decimal FlushMaxValdecValue;
                        decimal FlushMinValdecValue;
                        decimal GapUCLdec;
                        decimal GapLCLdec;
                        decimal GapUCLRdec;
                        decimal FlushUCLdec;
                        decimal FlushLCLdec;
                        decimal FlushUCLRdec;

                        int ParallelismintValue;
                        int GapMinValintValue;
                        int GapMaxValintValue;
                        int FlushMaxValintValue;
                        int FlushMinValintValue;
                        int GapUCLint;
                        int GapLCLint;
                        int GapUCLRint;
                        int FlushUCLint;
                        int FlushLCLint;
                        int FlushUCLRint;
                        int SORTORDERValue;

                        bool decimalParallelismResult = decimal.TryParse(Parallelism, out ParallelismdecValue);
                        bool intParallelismResult = int.TryParse(Parallelism, out ParallelismintValue);
                        bool decimalGapMinValResult = decimal.TryParse(GapMinVal, out GapMinValdecValue);
                        bool intGapMinValResult = int.TryParse(GapMinVal, out GapMinValintValue);
                        bool decimalGapMaxValResult = decimal.TryParse(GapMaxVal, out GapMaxValdecValue);
                        bool intGapMaxValResult = int.TryParse(GapMaxVal, out GapMaxValintValue);
                        bool decimalFlushMaxValResult = decimal.TryParse(FlushMaxVal, out FlushMaxValdecValue);
                        bool intFlushMaxValResult = int.TryParse(FlushMaxVal, out FlushMaxValintValue);
                        bool decimalFlushMinValResult = decimal.TryParse(FlushMinVal, out FlushMinValdecValue);
                        bool intFlushMinValResult = int.TryParse(FlushMinVal, out FlushMinValintValue);
                        bool decimalGapUCLResult = decimal.TryParse(GapUCL, out GapUCLdec);
                        bool intGapUCLResult = int.TryParse(GapUCL, out GapUCLint);
                        bool decimalGapLCLResult = decimal.TryParse(GapLCL, out GapLCLdec);
                        bool intGapLCLResult = int.TryParse(GapLCL, out GapLCLint);
                        bool decimalGapUCLRResult = decimal.TryParse(GapUCLR, out GapUCLRdec);
                        bool intGapUCLRResult = int.TryParse(GapUCLR, out GapUCLRint);
                        bool decimalFlushUCLResult = decimal.TryParse(FlushUCL, out FlushUCLdec);
                        bool intFlushUCLResult = int.TryParse(FlushUCL, out FlushUCLint);
                        bool decimalFlushLCLResult = decimal.TryParse(FlushLCL, out FlushLCLdec);
                        bool intFlushLCLResult = int.TryParse(FlushLCL, out FlushLCLint);
                        bool decimalFlushUCLRResult = decimal.TryParse(FlushUCLR, out FlushUCLRdec);
                        bool intFlushUCLRResult = int.TryParse(FlushUCLR, out FlushUCLRint);
                        bool intSORTORDEResult = int.TryParse(SORTORDER, out SORTORDERValue);

                        if (string.IsNullOrEmpty(Area_Name) || string.IsNullOrWhiteSpace(Area_Name))
                        {
                            message = "Required area name in row = " + row + "";
                        }
                        else if (string.IsNullOrEmpty(Part_Name) || string.IsNullOrWhiteSpace(Part_Name))
                        {
                            message += "Required part name in row = " + row + "";
                        }
                        else if (string.IsNullOrEmpty(Checkpoint_Name) || string.IsNullOrWhiteSpace(Checkpoint_Name))
                        {
                            message += "Required check point name in row = " + row + "";
                        }
                        else if (string.IsNullOrEmpty(Location_Name) || string.IsNullOrWhiteSpace(Location_Name))
                        {
                            message += "Required location name in row = " + row + "";
                        }
                        else if (string.IsNullOrEmpty(Specification_Name) || string.IsNullOrWhiteSpace(Specification_Name))
                        {
                            message += "Required specification name in row = " + row + "";
                        }
                        else if (string.IsNullOrEmpty(Gap) || string.IsNullOrWhiteSpace(Gap))
                        {
                            message += "Required Gap in row = " + row + "";
                        }
                        else if (Convert.ToBoolean(Gap) == true)
                        {
                            if (string.IsNullOrEmpty(GapMinVal) || string.IsNullOrWhiteSpace(GapMinVal))
                            {
                                message += "Required Gap Min in row = " + row + "";
                            }
                            else if (string.IsNullOrEmpty(GapMaxVal) || string.IsNullOrWhiteSpace(GapMaxVal))
                            {
                                message += "Required Gap max in row = " + row + "";
                            }
                            else if (!string.IsNullOrEmpty(GapUCL) || !string.IsNullOrWhiteSpace(GapUCL))
                            {
                                if (!decimalGapUCLResult && !intGapUCLResult)
                                {
                                    message += "Gap UCL value should be decimal or number for row = " + row + "";
                                }
                            }
                            else if (!string.IsNullOrEmpty(GapLCL) || !string.IsNullOrWhiteSpace(GapLCL))
                            {
                                if (!decimalGapLCLResult && !intGapLCLResult)
                                {
                                    message += "Gap LCL value should be decimal or number for row = " + row + "";
                                }
                            }
                            else if (!string.IsNullOrEmpty(GapUCLR) || !string.IsNullOrWhiteSpace(GapUCLR))
                            {
                                if (!decimalGapUCLRResult && !intGapUCLRResult)
                                {
                                    message += "Gap UCLR value should be decimal or number for row = " + row + "";
                                }
                            }
                        }
                        else if (string.IsNullOrEmpty(Flushness) || string.IsNullOrWhiteSpace(Flushness))
                        {
                            message += "Required flushness in row = " + row + "";
                        }
                        else if (Convert.ToBoolean(Flushness) == true)
                        {
                            if (string.IsNullOrEmpty(FlushMinVal) || string.IsNullOrWhiteSpace(FlushMinVal))
                            {
                                message += "Required Flushness Min in row = " + row + "";
                            }
                            else if (string.IsNullOrEmpty(FlushMaxVal) || string.IsNullOrWhiteSpace(FlushMaxVal))
                            {
                                message += "Required Flushness max in row = " + row + "";
                            }
                            else if (!string.IsNullOrEmpty(FlushUCL) || !string.IsNullOrWhiteSpace(FlushUCL))
                            {
                                if (!decimalFlushUCLResult && !intFlushUCLResult)
                                {
                                    message += "Flush UCL value should be decimal or number for row = " + row + "";
                                }
                            }
                            else if (!string.IsNullOrEmpty(FlushLCL) || !string.IsNullOrWhiteSpace(FlushLCL))
                            {
                                if (!decimalFlushLCLResult && !intFlushLCLResult)
                                {
                                    message += "Flush LCL value should be decimal or number for row = " + row + "";
                                }
                            }
                            else if (!string.IsNullOrEmpty(FlushUCLR) || !string.IsNullOrWhiteSpace(FlushUCLR))
                            {
                                if (!decimalFlushUCLRResult && !intFlushUCLRResult)
                                {
                                    message += "Flush UCLR value should be decimal or number for row = " + row + "";
                                }
                            }
                        }
                        else if (!string.IsNullOrEmpty(Parallelism) || !string.IsNullOrWhiteSpace(Parallelism))
                        {
                            if (!decimalParallelismResult && !intParallelismResult)
                            {
                                message += "parallelism value should be decimal or number for row = " + row + "";
                            }
                        }
                        else if (!decimalGapMaxValResult && !intGapMaxValResult)
                        {
                            message += "Max value should be decimal or number for row = " + row + "";
                        }
                        else if (!decimalGapMinValResult && !intGapMinValResult)
                        {
                            message += "Min value should be decimal or number for row = " + row + "";
                        }

                        else if (!decimalFlushMaxValResult && !intFlushMaxValResult)
                        {
                            message += "Flushness Max value should be decimal or number for row = " + row + "";
                        }
                        else if (!decimalFlushMinValResult && !intFlushMinValResult)
                        {
                            message += "Flushness Min value should be decimal or number for row = " + row + "";
                        }
                        else if (!intSORTORDEResult)
                        {
                            message += "SORTORDER value should be number for row = " + row + "";
                        }
                        if (message.Length > 0)
                        {
                            messageDataObj.isAlertMessage = true;
                            messageDataObj.messageDetail = message;
                            messageDataObj.messageTitle = "Validation Error: Required Field";
                            return Ok(messageDataObj);
                        }
                        //
                        int? Area_ID = db.MM_AreaMaster
                            .Where(a => a.Area_Name.Trim().ToLower() == Area_Name.Trim().ToLower() 
                                     && a.Shop_ID == obj.Shop_ID 
                                     && a.Audit_Type_Id == obj.Audit_Type_Id 
                                     && a.Model_ID == obj.Model_ID 
                                     && a.Is_Active == true)
                            .Select(a => (int?)a.Area_ID)
                            .FirstOrDefault();

                        if (Area_ID == null)
                        {
                            var newArea = new MM_AreaMaster
                            {
                                Area_Name = Area_Name,
                                Area_Desc = Area_Name,
                                Shop_ID = obj.Shop_ID,
                                Model_ID = obj.Model_ID,
                                Is_Gap = Convert.ToBoolean(Gap),
                                Is_Flushness = Convert.ToBoolean(Flushness),
                                SORTORDER = Convert.ToInt16(SORTORDER),
                                Is_Active = true,
                                Plant_ID = obj.Plant_ID,
                                Audit_Type_Id = obj.Audit_Type_Id,
                                Inserted_Host = obj.Inserted_Host,
                                Inserted_User_ID = obj.Inserted_User_ID,
                                Inserted_Date = DateTime.Now,
                            };

                            db.MM_AreaMaster.Add(newArea);
                            db.SaveChanges();
                            Area_ID = Convert.ToInt16(newArea.Area_ID);
                        }
                        else
                        {
                            var query = db.MM_AreaMaster.Where(p => p.Area_ID == Area_ID).Select(p => new { IsGap = p.Is_Gap, IsFlushness = p.Is_Flushness });
                            var result = query.FirstOrDefault();
                            if (result != null)
                            {
                                var area = db.MM_AreaMaster.FirstOrDefault(p => p.Area_ID == Area_ID);
                                if (result.IsFlushness == false && Convert.ToBoolean(Flushness) == true)
                                {
                                    area.Is_Flushness = Convert.ToBoolean(Flushness);
                                    db.SaveChanges();
                                }
                                if (result.IsGap == false && Convert.ToBoolean(Gap) == true)
                                {
                                    area.Is_Gap = Convert.ToBoolean(Gap);
                                    db.SaveChanges();
                                }
                            }
                        }

                        int? Part_ID = db.MM_PartMaster
                            .Where(a => a.Part_Name.Trim().ToLower() == Part_Name.Trim().ToLower() 
                                     && a.Shop_ID == obj.Shop_ID 
                                     && a.Area_ID == Area_ID
                                     && a.Audit_Type_Id == obj.Audit_Type_Id 
                                     && a.Model_ID == obj.Model_ID 
                                     && a.Is_Active == true
                                     )
                            .Select(a => (int?)a.Part_ID)
                            .FirstOrDefault();

                        if (Part_ID == null)
                        {
                            var newPart = new MM_PartMaster
                            {
                                Part_Name = Part_Name,
                                Part_Desc = Part_Name,
                                Area_ID = Area_ID,
                                Shop_ID = obj.Shop_ID,
                                Model_ID = obj.Model_ID,
                                Is_Gap = Convert.ToBoolean(Gap),
                                Is_Flushness = Convert.ToBoolean(Flushness),
                                SORTORDER = Convert.ToInt16(SORTORDER),
                                Is_Active = true,
                                Plant_ID = obj.Plant_ID,
                                Audit_Type_Id = obj.Audit_Type_Id,
                                Inserted_Host = obj.Inserted_Host,
                                Inserted_User_ID = obj.Inserted_User_ID,
                                Inserted_Date = DateTime.Now,

                            };

                            db.MM_PartMaster.Add(newPart);
                            db.SaveChanges();
                            Part_ID = Convert.ToInt16(newPart.Part_ID);
                        }
                        else
                        {
                            var query = db.MM_PartMaster.Where(p => p.Part_ID == Part_ID).Select(p => new { IsGap = p.Is_Gap, IsFlushness = p.Is_Flushness });
                            var result = query.FirstOrDefault();
                            if (result != null)
                            {
                                var part = db.MM_PartMaster.FirstOrDefault(p => p.Part_ID == Part_ID);
                                if (result.IsFlushness == false && Convert.ToBoolean(Flushness) == true)
                                {
                                    part.Is_Flushness = Convert.ToBoolean(Flushness);
                                    db.SaveChanges();
                                }
                                if (result.IsGap == false && Convert.ToBoolean(Gap) == true)
                                {
                                    part.Is_Gap = Convert.ToBoolean(Gap);
                                    db.SaveChanges();
                                }
                            }
                        }

                        int? Checkpoint_ID = db.MM_CheckpointMaster
                            .Where(a => a.Checkpoint_Name.Trim().ToLower() == Checkpoint_Name.ToLower() 
                                     && a.Shop_ID == obj.Shop_ID 
                                     && a.Model_ID == obj.Model_ID
                                     && a.Audit_Type_Id == obj.Audit_Type_Id 
                                     && a.Area_ID == Area_ID 
                                     && a.Part_ID == Part_ID
                                     && a.Is_Active == true
                                     )
                            .Select(a => (int?)a.Checkpoint_ID)
                            .FirstOrDefault();

                        if (Checkpoint_ID == null)
                        {
                            var newCheckpoint = new MM_CheckpointMaster
                            {
                                Checkpoint_Name = Checkpoint_Name,
                                Checkpoint_Desc = Checkpoint_Name,
                                Area_ID = Area_ID,
                                Part_ID = Part_ID,
                                Parallelism = Convert.ToDecimal(Parallelism),
                                Shop_ID = obj.Shop_ID,
                                Model_ID = obj.Model_ID,
                                Is_Gap = Convert.ToBoolean(Gap),
                                Is_Flushness = Convert.ToBoolean(Flushness),
                                Is_Active = true,
                                SORTORDER = Convert.ToInt16(SORTORDER),
                                Plant_ID = obj.Plant_ID,
                                Audit_Type_Id = obj.Audit_Type_Id,
                                Inserted_Host = obj.Inserted_Host,
                                Inserted_User_ID = obj.Inserted_User_ID,
                                Inserted_Date = DateTime.Now,

                            };

                            db.MM_CheckpointMaster.Add(newCheckpoint);
                            db.SaveChanges();
                            Checkpoint_ID = Convert.ToInt16(newCheckpoint.Checkpoint_ID);
                        }
                        else
                        {
                            var query = db.MM_CheckpointMaster.Where(p => p.Checkpoint_ID == Checkpoint_ID).Select(p => new { IsGap = p.Is_Gap, IsFlushness = p.Is_Flushness });
                            var result = query.FirstOrDefault();
                            if (result != null)
                            {
                                var Checkpoint = db.MM_CheckpointMaster.FirstOrDefault(p => p.Checkpoint_ID == Checkpoint_ID);
                                if (result.IsFlushness == false && Convert.ToBoolean(Flushness) == true)
                                {
                                    Checkpoint.Is_Flushness = Convert.ToBoolean(Flushness);
                                    db.SaveChanges();
                                }
                                if (result.IsGap == false && Convert.ToBoolean(Gap) == true)
                                {
                                    Checkpoint.Is_Gap = Convert.ToBoolean(Gap);
                                    db.SaveChanges();
                                }
                            }
                        }

                        int? Location_ID = db.MM_LocationMaster
                            .Where(a => a.Location_Name.Trim().ToLower() == Location_Name.ToLower() 
                                     && a.Shop_ID == obj.Shop_ID 
                                     && a.Model_ID == obj.Model_ID
                                     && a.Audit_Type_Id == obj.Audit_Type_Id 
                                     && a.Part_ID == Part_ID 
                                     && a.Checkpoint_ID == Checkpoint_ID
                                     && a.Is_Active == true
                                     )
                            .Select(a => (int?)a.Location_ID)
                            .FirstOrDefault();

                        if (Location_ID == null)
                        {
                            var newLocation = new MM_LocationMaster
                            {
                                Location_Name = Location_Name,
                                Location_Desc = Location_Name,
                                Area_ID = Area_ID,
                                Part_ID = Part_ID,
                                Checkpoint_ID = Checkpoint_ID,
                                Shop_ID = obj.Shop_ID,
                                Model_ID = obj.Model_ID,
                                Is_Gap = Convert.ToBoolean(Gap),
                                Is_Flushness = Convert.ToBoolean(Flushness),
                                Is_Active = true,
                                SORTORDER = Convert.ToInt16(SORTORDER),
                                Plant_ID = obj.Plant_ID,
                                Audit_Type_Id = obj.Audit_Type_Id,
                                Inserted_Host = obj.Inserted_Host,
                                Inserted_User_ID = obj.Inserted_User_ID,
                                Inserted_Date = DateTime.Now,
                            };

                            db.MM_LocationMaster.Add(newLocation);
                            db.SaveChanges();
                            Location_ID = Convert.ToInt16(newLocation.Location_ID);
                        }
                        else
                        {
                            var query = db.MM_LocationMaster.Where(p => p.Location_ID == Location_ID).Select(p => new { IsGap = p.Is_Gap, IsFlushness = p.Is_Flushness });
                            var result = query.FirstOrDefault();
                            if (result != null)
                            {
                                var Location = db.MM_LocationMaster.FirstOrDefault(p => p.Location_ID == Location_ID);
                                if (result.IsFlushness == false && Convert.ToBoolean(Flushness) == true)
                                {
                                    Location.Is_Flushness = Convert.ToBoolean(Flushness);
                                    db.SaveChanges();
                                }
                                if (result.IsGap == false && Convert.ToBoolean(Gap) == true)
                                {
                                    Location.Is_Gap = Convert.ToBoolean(Gap);
                                    db.SaveChanges();
                                }
                            }
                        }

                        int? Specification_ID = db.MM_SpecificationMaster
                            .Where(m => m.Specification_Name.Trim().ToLower() == Specification_Name.Trim().ToLower() 
                                     && m.Model_ID == obj.Model_ID 
                                     && m.Area_ID == Area_ID 
                                     && m.Part_ID == Part_ID 
                                     && m.Checkpoint_ID == Checkpoint_ID 
                                     && m.Location_ID == Location_ID 
                                     && m.Shop_ID == obj.Shop_ID 
                                     && m.Plant_ID == obj.Plant_ID 
                                     && m.Audit_Type_Id == obj.Audit_Type_Id 
                                     && m.Is_Active == true)
                            .Select(a => (int?)a.Specification_ID)
                            .FirstOrDefault();
                        if (Specification_ID == null)
                        {
                            var mM_SpecificationMaster = new MM_SpecificationMaster
                            {
                                Specification_Name = Specification_Name,
                                Specification_Desc = Specification_Name,
                                Shop_ID = obj.Shop_ID,
                                Model_ID = obj.Model_ID,
                                Area_ID = Area_ID,
                                Part_ID = Part_ID,
                                Checkpoint_ID = Checkpoint_ID,
                                Location_ID = Location_ID,
                                Plant_ID = obj.Plant_ID,
                                Is_Active = true,
                                Audit_Type_Id = obj.Audit_Type_Id,
                                Inserted_Host = obj.Inserted_Host,
                                Inserted_User_ID = obj.Inserted_User_ID,
                                Inserted_Date = DateTime.Now,
                            };

                            // Check if Gap is true
                            if (Convert.ToBoolean(Gap))
                            {
                                mM_SpecificationMaster.Is_Gap = true;
                                mM_SpecificationMaster.MinVal = Convert.ToDecimal(GapMinVal);
                                mM_SpecificationMaster.MaxVal = Convert.ToDecimal(GapMaxVal);
                                mM_SpecificationMaster.UCL = Convert.ToDecimal(GapUCL);
                                mM_SpecificationMaster.LCL = Convert.ToDecimal(GapLCL);
                                mM_SpecificationMaster.UCLR = Convert.ToDecimal(GapUCLR);
                                mM_SpecificationMaster.SORTORDER = Convert.ToInt16(SORTORDER);
                                db.MM_SpecificationMaster.Add(mM_SpecificationMaster);
                            }

                            // Check if Flushness is true
                            if (Convert.ToBoolean(Flushness))
                            {
                                var flushnessSpecificationMaster = new MM_SpecificationMaster
                                {
                                    Specification_Name = Specification_Name,
                                    Specification_Desc = Specification_Name,
                                    Shop_ID = obj.Shop_ID,
                                    Model_ID = obj.Model_ID,
                                    Area_ID = Area_ID,
                                    Part_ID = Part_ID,
                                    Checkpoint_ID = Checkpoint_ID,
                                    Location_ID = Location_ID,
                                    Is_Flushness = true,
                                    Is_Active = true,
                                    MinVal = Convert.ToDecimal(FlushMinVal),
                                    MaxVal = Convert.ToDecimal(FlushMaxVal),
                                    UCL = Convert.ToDecimal(FlushUCL),
                                    LCL = Convert.ToDecimal(FlushLCL),
                                    UCLR = Convert.ToDecimal(FlushUCLR),
                                    SORTORDER = Convert.ToInt16(SORTORDER),
                                    Plant_ID = obj.Plant_ID,
                                    Audit_Type_Id = obj.Audit_Type_Id,
                                    Inserted_Host = obj.Inserted_Host,
                                    Inserted_User_ID = obj.Inserted_User_ID,
                                    Inserted_Date = DateTime.Now,
                                };
                                db.MM_SpecificationMaster.Add(flushnessSpecificationMaster);
                            }
                            db.SaveChanges();
                        }
                        else
                        {
                            var query = db.MM_SpecificationMaster.Where(p => p.Specification_ID == Specification_ID).Select(p => new { IsGap = p.Is_Gap, IsFlushness = p.Is_Flushness });
                            var result = query.FirstOrDefault();
                            if (result != null)
                            {
                                var Spec = db.MM_SpecificationMaster.FirstOrDefault(p => p.Specification_ID == Specification_ID);
                                if (result.IsFlushness == false && Convert.ToBoolean(Flushness) == true)
                                {
                                    Spec.Is_Flushness = Convert.ToBoolean(Flushness);
                                    db.SaveChanges();
                                }
                                if (result.IsGap == false && Convert.ToBoolean(Gap) == true)
                                {
                                    Spec.Is_Gap = Convert.ToBoolean(Gap);
                                    db.SaveChanges();
                                }
                            }
                        }
                    }
                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = "Your file has been successfully uploaded and processed.";
                    messageDataObj.messageTitle = "Upload Successful!";
                }
                return Ok(messageDataObj);
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_SpecificationMaster", "UploadData()", Inserted_User_ID ?? 0);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = "No data could be extracted from this file **";
                messageDataObj.messageTitle = "Uploading Error";

                return Ok(messageDataObj);
            }
        }

        [Route("api/MM_SpecificationMaster/UpdateCalculation/{FrmDt},{ToDt},{Audit_Type_Id},{Plant_ID},{Location_ID},{Parameter_ID}")]
        [HttpGet]
        [ActionName("UpdateCalculation")]
        public IHttpActionResult UpdateCalculation(string FrmDt, string ToDt, int Audit_Type_Id, int Plant_ID, int Location_ID, int Parameter_ID)
        {
            try
            {
                string columnName = "";
                if (Parameter_ID == 1)
                {
                    columnName = "Is_Gap";
                }
                else
                {
                    columnName = "Is_Flushness";
                }
                SQLConnection sc = new SQLConnection();
                List<MM_SpecificationMaster> DataList = new List<MM_SpecificationMaster>();

                string sqlQuery2 = " WITH MR_Calculation AS(";
                sqlQuery2 += " SELECT";
                sqlQuery2 += " dbo.MM_LocationMaster.Location_ID, dbo.MM_LocationMaster.Location_Name, dbo.MM_Track_Sheet.Reading,";
                sqlQuery2 += " CAST(ROUND(AVG(CAST(Reading AS DECIMAL(18, 2))) OVER(), 2) AS DECIMAL(18, 2)) AS XDoubleBar,";
                sqlQuery2 += " CASE";
                sqlQuery2 += " WHEN LAG(MM_Track_Sheet.Location_ID) OVER(ORDER BY MM_Track_Sheet.Location_ID, MM_Vehicle_Audit.Audit_date) <> MM_Track_Sheet.Location_ID THEN NULL";
                sqlQuery2 += " ELSE CASE";
                sqlQuery2 += " WHEN ABS(CAST(MM_Track_Sheet.Reading AS DECIMAL(18, 2)) - CAST(LAG(MM_Track_Sheet.Reading) OVER(ORDER BY MM_Track_Sheet.Location_ID, MM_Vehicle_Audit.Audit_date) AS DECIMAL(18, 2))) = 0 THEN NULL";
                sqlQuery2 += " ELSE ABS(CAST(MM_Track_Sheet.Reading AS DECIMAL(18, 2)) - CAST(LAG(MM_Track_Sheet.Reading) OVER(ORDER BY MM_Track_Sheet.Location_ID, MM_Vehicle_Audit.Audit_date) AS DECIMAL(18, 2)))";
                sqlQuery2 += " END END AS MR";
                sqlQuery2 += " FROM ";
                sqlQuery2 += " dbo.MM_Vehicle_Audit INNER JOIN";
                sqlQuery2 += " dbo.MM_Track_Sheet ON dbo.MM_Vehicle_Audit.Audit_ID = dbo.MM_Track_Sheet.Audit_ID  INNER JOIN";
                sqlQuery2 += " dbo.MM_LocationMaster ON dbo.MM_Track_Sheet.Location_ID = dbo.MM_LocationMaster.Location_ID";
                sqlQuery2 += " WHERE";
                sqlQuery2 += " (dbo.MM_Track_Sheet.Remark = 'OK')  and(dbo.MM_Track_Sheet.Parameter_ID = " + Parameter_ID + ") AND(dbo.MM_LocationMaster." + columnName + " = 1)";
                sqlQuery2 += " AND(CONVERT(DATE, dbo.MM_Vehicle_Audit.Audit_Date, 103) BETWEEN CONVERT(DATE, '" + FrmDt + "', 103) AND CONVERT(DATE, '" + ToDt + "', 103))";
                sqlQuery2 += " AND(dbo.MM_Vehicle_Audit.Plant_ID = " + Plant_ID + ")";
                sqlQuery2 += " AND(dbo.MM_Vehicle_Audit.Audit_Type_Id = " + Audit_Type_Id + ")";
                sqlQuery2 += " AND(dbo.MM_LocationMaster.Location_ID = " + Location_ID + "))";
                sqlQuery2 += " SELECT MR_Calculation.Location_ID, MR_Calculation.Location_Name, MR_Calculation.XDoubleBar, ROUND(AVG(MR), 2) AS MRBar,";
                sqlQuery2 += " CAST(ROUND((MR_Calculation.XDoubleBar + (3 * (ROUND(AVG(MR), 2) / 1.13))), 2) AS DECIMAL(18, 2)) AS UCL,";
                sqlQuery2 += " CAST(ROUND((MR_Calculation.XDoubleBar - (3 * (ROUND(AVG(MR), 2) / 1.13))), 2) AS DECIMAL(18, 2)) AS LCL,";
                sqlQuery2 += " CAST(ROUND((3.27 * ROUND(AVG(MR), 2)), 2) AS DECIMAL(18, 2)) AS UCLR";
                sqlQuery2 += " FROM MR_Calculation";
                sqlQuery2 += " GROUP BY MR_Calculation.Location_ID, MR_Calculation.Location_Name, MR_Calculation.XDoubleBar;";

                DataSet ds_Tran = new DataSet();
                ds_Tran = sc.SQLDataSet(sqlQuery2);
                if (ds_Tran.Tables[0].Rows.Count > 0)
                {
                    for (int i = 0; i < ds_Tran.Tables[0].Rows.Count; i++)
                    {
                        DataList.AddRange(new List<MM_SpecificationMaster> {
                                        new MM_SpecificationMaster
                                        {
                                            Location_ID = Convert.ToInt32(ds_Tran.Tables[0].Rows[i]["Location_ID"]),
                                            UCL = (ds_Tran.Tables[0].Rows[i]["UCL"] == DBNull.Value) ? 0 : Convert.ToDecimal(ds_Tran.Tables[0].Rows[i]["UCL"]),
                                            LCL = (ds_Tran.Tables[0].Rows[i]["LCL"] == DBNull.Value) ? 0 : Convert.ToDecimal(ds_Tran.Tables[0].Rows[i]["LCL"]),
                                            UCLR = (ds_Tran.Tables[0].Rows[i]["UCLR"] == DBNull.Value) ? 0 : Convert.ToDecimal(ds_Tran.Tables[0].Rows[i]["UCLR"]),
                                        }
                                    });
                    }
                }
                var result = DataList;
                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = result;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_SpecificationMaster", "UpdateCalculation(" + FrmDt + ", " + ToDt + ", " + Audit_Type_Id + ", " + Plant_ID + ", " + Location_ID + ", " + Parameter_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        
    }
}

