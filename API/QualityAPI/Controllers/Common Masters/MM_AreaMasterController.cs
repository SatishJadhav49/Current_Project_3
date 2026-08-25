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
    public class MM_AreaMasterController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();
        // GET: MM_AreaMaster
        public IQueryable<MM_AreaMaster> GetMM_AreaMaster()
        {
            return db.MM_AreaMaster;
        }

        [Route("api/MM_AreaMaster/GetArea/{Plant_ID},{Audit_Type_Id},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetArea")]
        public IHttpActionResult GetArea(decimal Plant_ID, decimal Audit_Type_Id, int Shop_ID, bool Is_AllShops)
        {
            try
            { 
            IEnumerable<decimal> Shop_ids;

            if (Is_AllShops == true)
            {
                Shop_ids = (from shop in db.MM_Shop
                            where shop.Audit_Type_Id == Audit_Type_Id && shop.Plant_ID == Plant_ID
                            select (decimal)shop.Shop_ID).ToList();
            }
            else
            {
                Shop_ids = new List<decimal> { Shop_ID };
            }
            var obj = (from area in db.MM_AreaMaster
                       join shop in db.MM_Shop on area.Shop_ID equals shop.Shop_ID
                       join model in db.MM_Model on area.Model_ID equals model.Model_ID
                       where area.Audit_Type_Id == Audit_Type_Id && area.Plant_ID == Plant_ID
                       && Shop_ids.Contains(area.Shop_ID ?? 0)
                       orderby area.Inserted_Date descending
                       select new
                       {
                           area.Area_ID,
                           area.Area_Desc,
                           area.Is_Gap,
                           area.Is_Flushness,
                           area.Area_Name,
                           area.Is_Active,
                           area.SORTORDER,
                           area.Model_ID,
                           model.Model_Name,
                           area.Shop_ID,
                           shop.Shop_Name,
                           area.Plant_ID,
                           area.Audit_Type_Id,
                           Status = area.Is_Active==true ?"Active" :"In Active"
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
                generalLogObj.addControllerException(e, "MM_AreaMaster", "GetArea(" + Plant_ID + ", " + Shop_ID + "," + Is_AllShops + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e});
            }
        }


        [Route("api/MM_AreaMaster/GetAreaByID/{Area_ID}")]
        [HttpGet]
        [ActionName("GetAreaByID")]
        public IHttpActionResult GetAreaByID(int Area_ID)
        {
            try
            { 
            var obj = (from area in db.MM_AreaMaster
                       where area.Area_ID == Area_ID
                       select new
                       {
                           area.Area_ID,
                           area.Area_Desc,
                           area.Is_Gap,
                           area.Is_Flushness,
                           area.Is_Active,
                           area.Area_Name,
                           area.SORTORDER,
                           area.Model_ID,
                           area.Shop_ID,
                           area.Plant_ID
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
                generalLogObj.addControllerException(e, "MM_AreaMaster", "GetAreaByID(" + Area_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        // GET: api/MM_Model/5
        [ResponseType(typeof(MM_Model))]
        public IHttpActionResult GetMM_AreaMaster(decimal id)
        {
            try
            { 
            MM_AreaMaster MM_AreaMaster = db.MM_AreaMaster.Find(id);
            if (MM_AreaMaster == null)
            {
                return NotFound();
            }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = MM_AreaMaster;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_AreaMaster", "GetMM_AreaMaster(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_AreaMaster/EditAreaMaster/{id}")]
        [HttpPut]
        [ActionName("EditAreaMaster")]
        public IHttpActionResult EditAreaMaster(decimal id, MM_AreaMaster mM_AreaMaster)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = Convert.ToDecimal(mM_AreaMaster.Updated_User_ID);
            try
            {

                if (db.MM_AreaMaster.Any(m => m.Area_Name.ToUpper() == mM_AreaMaster.Area_Name.ToUpper() && m.Area_ID != mM_AreaMaster.Area_ID && m.Plant_ID == mM_AreaMaster.Plant_ID && m.Shop_ID == mM_AreaMaster.Shop_ID && m.Model_ID == mM_AreaMaster.Model_ID && m.Audit_Type_Id == mM_AreaMaster.Audit_Type_Id && m.Is_Active == true))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                MM_AreaMaster obj = db.MM_AreaMaster.Where(p => p.Area_ID == id).FirstOrDefault();
                if (obj != null)
                {
                    obj.Area_Name = mM_AreaMaster.Area_Name;
                    obj.Area_Desc = mM_AreaMaster.Area_Desc;
                    obj.Shop_ID = mM_AreaMaster.Shop_ID;
                    obj.Model_ID = mM_AreaMaster.Model_ID;
                    obj.Is_Gap = mM_AreaMaster.Is_Gap;
                    obj.Is_Flushness = mM_AreaMaster.Is_Flushness;
                    obj.Is_Active = mM_AreaMaster.Is_Active;
                    obj.SORTORDER = mM_AreaMaster.SORTORDER;
                    obj.Plant_ID = mM_AreaMaster.Plant_ID;
                    obj.Plant_Code = mM_AreaMaster.Plant_Code;
                    obj.Audit_Type_Id = mM_AreaMaster.Audit_Type_Id;
                    obj.Is_Edited = true;
                    obj.Updated_Host = mM_AreaMaster.Updated_Host;
                    obj.Updated_User_ID = mM_AreaMaster.Updated_User_ID;
                    obj.Updated_Date =DateTime.Now;
                    db.Entry(obj).State = EntityState.Modified;
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.UpdateMessage;
                    messageDataObj.messageTitle = messageDataObj.UpdateTitle;
                }
            }
            catch (Exception e)
            {
                if (!MM_AreaMasterExists(id))
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_AreaMasterController", "EditAreaMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                    messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;
                }
                else
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_AreaMasterController", "EditAreaMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
                }
            }
            return Ok(messageDataObj);
        }
        
        [Route("api/MM_AreaMaster/SaveMM_AreaMaster")]
        [HttpPost]
        [ActionName("SaveMM_AreaMaster")]
        public IHttpActionResult SaveMM_AreaMaster(MM_AreaMaster[] mM_AreaMaster)
        {
            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                foreach (var item in mM_AreaMaster)
                {
                    userid = Convert.ToDecimal(item.Inserted_User_ID);
                    if (db.MM_AreaMaster.Any(m => m.Area_Name.ToUpper() == item.Area_Name.ToUpper() && m.Plant_ID == item.Plant_ID && m.Shop_ID == item.Shop_ID && m.Model_ID == item.Model_ID && m.Audit_Type_Id == item.Audit_Type_Id && m.Is_Active == true))
                    {
                        messageDataObj.isAlertMessage = true;
                        messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                        messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                        return Ok(messageDataObj);
                    }
                }
                foreach (var item in mM_AreaMaster)
                {
                    MM_AreaMaster obj = new MM_AreaMaster();
                    obj.Area_Name = item.Area_Name;
                    obj.Area_Desc = item.Area_Desc;
                    obj.Shop_ID = item.Shop_ID;
                    obj.Model_ID = item.Model_ID;
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
                    db.MM_AreaMaster.Add(obj);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                    messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_AreaMasterController", "SaveMM_AreaMaster()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_AreaMasterController", "SaveMM_AreaMaster()", userid);
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
        
        [Route("api/MM_AreaMaster/DeleteMM_AreaMaster/{Area_ID}")]
        [HttpDelete]
        [ActionName("DeleteMM_AreaMaster")]
        public IHttpActionResult DeleteMM_AreaMaster(decimal Area_ID)
        {
            MM_AreaMaster MM_AreaMaster = db.MM_AreaMaster.Find(Area_ID);
            if (MM_AreaMaster == null)
            {
                return NotFound();
            }
            else
            {
                try
                {
                    db.MM_AreaMaster.Remove(MM_AreaMaster);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                    messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                }
                catch (DbUpdateException dbe)
                {
                    generalLogObj.addControllerException(dbe, "MM_AreaMaster", "DeleteMM_AreaMaster(" + Area_ID + ")", 1);
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
                    generalLogObj.addControllerException(e, "MM_AreaMaster", "DeleteMM_AreaMaster(" + Area_ID + ")", 1);
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

        private bool MM_AreaMasterExists(decimal id)
        {
            return db.MM_AreaMaster.Count(e => e.Area_ID == id) > 0;
        }
    }
}