using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using QualityAPI.Helper;
using QualityAPI.Models;

namespace QualityAPI.Controllers.Common_Masters
{
    public class MM_PartMasterController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();
        // GET: MM_PartMaster

        public IQueryable<MM_PartMaster> GetMM_PartMaster()
        {
            return db.MM_PartMaster;
        }

        [Route("api/MM_PartMaster/GetPart/{Plant_ID},{Audit_Type_Id},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetPart")]
        public IHttpActionResult GetPart( decimal Plant_ID, decimal Audit_Type_Id, int Shop_ID, bool Is_AllShops)
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
            var obj = (from part in db.MM_PartMaster
                       join shop in db.MM_Shop on part.Shop_ID equals shop.Shop_ID
                       join model in db.MM_Model on part.Model_ID equals model.Model_ID
                       join area in db.MM_AreaMaster on part.Area_ID equals area.Area_ID
                       where part.Audit_Type_Id == Audit_Type_Id && part.Plant_ID == Plant_ID
                       && part.Shop_ID == Shop_ID
                       //&& Shop_ids.Contains(part.Shop_ID ?? 0)
                       orderby part.Inserted_Date descending
                       select new
                       {
                           part.Part_ID,
                           part.Part_Desc,
                           part.Area_ID,
                           area.Area_Name,
                           part.Part_Name,
                           part.SORTORDER,
                           part.Is_Active,
                           part.Model_ID,
                           model.Model_Name,
                           part.Shop_ID,
                           shop.Shop_Name,
                           part.Plant_ID,
                           part.Is_Gap,
                           part.Is_Flushness,
                           part.Audit_Type_Id,
                           Status = part.Is_Active == true ? "Active" : "In Active"
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
                generalLogObj.addControllerException(e, "MM_PartMaster", "GetPart(" + Plant_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }


        [Route("api/MM_PartMaster/GetPartByID/{Part_ID}")]
        [HttpGet]
        [ActionName("GetPartByID")]
        public IHttpActionResult GetPartByID(int Part_ID)
        {
            try
            { 
            var obj = (from part in db.MM_PartMaster
                       where part.Part_ID == Part_ID
                       select new
                       {
                           part.Part_ID,
                           part.Part_Desc,
                           part.Area_ID,
                           part.Part_Name,
                           part.Is_Active,
                           part.SORTORDER,
                           part.Model_ID,
                           part.Shop_ID,
                           part.Plant_ID,
                           part.Is_Gap,
                           part.Is_Flushness,
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
                generalLogObj.addControllerException(e, "MM_PartMaster", "GetPartByID(" + Part_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        // GET: api/MM_Model/5
        [ResponseType(typeof(MM_Model))]
        public IHttpActionResult GetMM_PartMaster(decimal id)
        {
            try
            { 
            MM_PartMaster MM_PartMaster = db.MM_PartMaster.Find(id);
            if (MM_PartMaster == null)
            {
                return NotFound();
            }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = MM_PartMaster;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_PartMaster", "GetMM_PartMaster(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_PartMaster/EditPartMaster/{id}")]
        [HttpPut]
        [ActionName("EditPartMaster")]
        public IHttpActionResult EditPartMaster(decimal id, MM_PartMaster mM_PartMaster)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = Convert.ToDecimal(mM_PartMaster.Updated_User_ID);
            try
            {

                if (db.MM_PartMaster.Any(m => m.Part_Name.ToUpper() == mM_PartMaster.Part_Name.ToUpper() && m.Part_ID != mM_PartMaster.Part_ID && m.Plant_ID == mM_PartMaster.Plant_ID && m.Shop_ID == mM_PartMaster.Shop_ID && m.Model_ID == mM_PartMaster.Model_ID && m.Area_ID == mM_PartMaster.Area_ID && m.Audit_Type_Id == mM_PartMaster.Audit_Type_Id && m.Is_Active == true))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                MM_PartMaster obj = db.MM_PartMaster.Where(p => p.Part_ID == id).FirstOrDefault();
                if (obj != null)
                {
                    obj.Part_Name = mM_PartMaster.Part_Name;
                    obj.Part_Desc = mM_PartMaster.Part_Desc;
                    obj.Shop_ID = mM_PartMaster.Shop_ID;
                    obj.Model_ID = mM_PartMaster.Model_ID;
                    obj.Area_ID = mM_PartMaster.Area_ID;
                    obj.Plant_Code = mM_PartMaster.Plant_Code;
                    obj.SORTORDER = mM_PartMaster.SORTORDER;
                    obj.Plant_ID = mM_PartMaster.Plant_ID;
                    obj.Audit_Type_Id = mM_PartMaster.Audit_Type_Id;
                    obj.Is_Flushness = mM_PartMaster.Is_Flushness;
                    obj.Is_Active = mM_PartMaster.Is_Active;
                    obj.Is_Gap = mM_PartMaster.Is_Gap;
                    obj.Is_Edited = true;
                    obj.Updated_Host = mM_PartMaster.Updated_Host;
                    obj.Updated_User_ID = mM_PartMaster.Updated_User_ID;
                    obj.Updated_Date = DateTime.Now;
                    db.Entry(obj).State = EntityState.Modified;
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.UpdateMessage;
                    messageDataObj.messageTitle = messageDataObj.UpdateTitle;
                }
            }
            catch (Exception e)
            {
                if (!MM_PartMasterExists(id))
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_PartMasterController", "EditPartMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                    messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;
                }
                else
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_PartMasterController", "EditPartMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
                }
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_PartMaster/SaveMM_PartMaster")]
        [HttpPost]
        [ActionName("SaveMM_PartMaster")]
        public IHttpActionResult SaveMM_PartMaster(MM_PartMaster[] mM_PartMaster)
        {
            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                foreach (var item in mM_PartMaster)
                {
                    userid = Convert.ToDecimal(item.Inserted_User_ID);
                    if (db.MM_PartMaster.Any(m => m.Part_Name.ToUpper() == item.Part_Name.ToUpper() && m.Plant_ID == item.Plant_ID && m.Shop_ID == item.Shop_ID && m.Model_ID == item.Model_ID && m.Area_ID == item.Area_ID && m.Audit_Type_Id == item.Audit_Type_Id && m.Is_Active == true))
                    {
                        messageDataObj.isAlertMessage = true;
                        messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                        messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                        return Ok(messageDataObj);
                    }
                }
                foreach (var item in mM_PartMaster)
                {
                    MM_PartMaster obj = new MM_PartMaster();
                    obj.Part_Name = item.Part_Name;
                    obj.Part_Desc = item.Part_Desc;
                    obj.Shop_ID = item.Shop_ID;
                    obj.Model_ID = item.Model_ID;
                    obj.Area_ID = item.Area_ID;
                    obj.Plant_Code = item.Plant_Code;
                    obj.SORTORDER = item.SORTORDER;
                    obj.Plant_ID = item.Plant_ID;
                    obj.Audit_Type_Id = item.Audit_Type_Id;
                    obj.Is_Gap = item.Is_Gap;
                    obj.Is_Flushness = item.Is_Flushness;
                    obj.Is_Active = item.Is_Active;
                    obj.Inserted_Host = item.Inserted_Host;
                    obj.Inserted_User_ID = item.Inserted_User_ID;
                    obj.Inserted_Date = DateTime.Now;
                    db.MM_PartMaster.Add(obj);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                    messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_PartMasterController", "SaveMM_PartMaster()", userid);
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
                generalLogObj.addControllerException(e, "MM_PartMasterController", "SaveMM_PartMaster()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            //catch (DbEntityValidationException ex)
            //{
            //    foreach (var entityValidationErrors in ex.EntityValidationErrors)
            //    {
            //        foreach (var validationError in entityValidationErrors.ValidationErrors)
            //        {
            //            var propertyName = validationError.PropertyName;
            //            var errorMessage = validationError.ErrorMessage;
            //        }
            //    }
            //}
            return Ok(messageDataObj);
        }

        [Route("api/MM_PartMaster/DeleteMM_PartMaster/{Part_ID}")]
        [HttpDelete]
        [ActionName("DeleteMM_PartMaster")]
        public IHttpActionResult DeleteMM_PartMaster(decimal Part_ID)
        {
            MM_PartMaster MM_PartMaster = db.MM_PartMaster.Find(Part_ID);
            if (MM_PartMaster == null)
            {
                return NotFound();
            }
            else
            {
                try
                {
                    db.MM_PartMaster.Remove(MM_PartMaster);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                    messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                }
                catch (DbUpdateException dbe)
                {
                    generalLogObj.addControllerException(dbe, "MM_PartMaster", "DeleteMM_PartMaster(" + Part_ID + ")", 1);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeleteConflictMessage;
                    messageDataObj.messageTitle = messageDataObj.DeleteConflictTitle;
                }
                catch (Exception e)
                {
                    while (e.InnerException != null)
                    {
                        e = e.InnerException;
                    }
                    generalLogObj.addControllerException(e, "MM_PartMaster", "DeleteMM_PartMaster(" + Part_ID + ")", 1);
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

        private bool MM_PartMasterExists(decimal id)
        {
            return db.MM_PartMaster.Count(e => e.Part_ID == id) > 0;
        }
    }
}