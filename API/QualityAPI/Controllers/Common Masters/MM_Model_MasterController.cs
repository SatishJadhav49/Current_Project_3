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

namespace QualityAPI.Controllers
{
    public class MM_Model_MasterController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();
        // GET: api/MM_Model
        public IQueryable<MM_Model> GetMM_Model_Master()
        {
            return db.MM_Model;
        }

        [Route("api/MM_Master_Model/GetModels/{Plant_ID},{Audit_Type_Id},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetModels")]
        public IHttpActionResult GetModels(decimal Plant_ID, decimal Audit_Type_Id, int Shop_ID, bool Is_AllShops)
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
            var obj = (from model in db.MM_Model
                       join shop in db.MM_Shop on model.Shop_ID equals shop.Shop_ID
                       where model.Plant_ID == Plant_ID && model.Audit_Type_Id == Audit_Type_Id
                       && Shop_ids.Contains(model.Shop_ID ?? 0)
                       orderby model.Inserted_Date descending
                       select new
                       {
                           model.Model_Name,
                           model.Model_Description,
                           model.Model_Code,
                           model.Model_ID,
                           model.Shop_ID,
                           shop.Shop_Name,
                           model.Vehicle_Type,
                           model.Plant_ID,
                           model.Email_Addresses
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
                generalLogObj.addControllerException(e, "MM_Master_Model", "GetModels(" + Plant_ID + ","+Audit_Type_Id+", " + Shop_ID + "," + Is_AllShops + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }


        [Route("api/MM_Master_Model/GetModelByID/{id}")]
        [HttpGet]
        [ActionName("GetModelByID")]
        public IHttpActionResult GetModelByID(int id)
        {
            try
            { 
            var obj = (from model in db.MM_Model
                       where model.Model_ID == id
                       select new
                       {
                           model.Model_Code,
                           model.Model_Name,
                           model.Model_Description,
                           model.Model_ID,
                           model.Shop_ID,
                           model.Plant_ID,
                           model.Vehicle_Type,
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
                generalLogObj.addControllerException(e, "MM_Master_Model", "GetModelByID(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        // GET: api/MM_Model/5
        [ResponseType(typeof(MM_Model))]
        public IHttpActionResult GetMM_Model_Master(decimal id)
        {
            try
            { 
            MM_Model mM_Model_Master = db.MM_Model.Find(id);
            if (mM_Model_Master == null)
            {
                return NotFound();
            }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = mM_Model_Master;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Master_Model", "GetMM_Model_Master(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        // PUT: api/MM_Model/5
        [Route("api/MM_Model/PutMM_Model_Master/{id}")]
        [HttpPut]
        [ActionName("PutMM_Model_Master")]
        public IHttpActionResult PutMM_Model_Master(decimal id, MM_Model mM_Model_Master)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = Convert.ToDecimal(mM_Model_Master.Updated_User_ID);
            try
            {

                if (db.MM_Model.Any(m => m.Model_Name.ToUpper() == mM_Model_Master.Model_Name.ToUpper() && m.Model_Code != mM_Model_Master.Model_Code && m.Plant_ID == mM_Model_Master.Plant_ID && m.Audit_Type_Id == mM_Model_Master.Audit_Type_Id))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                MM_Model obj = db.MM_Model.Where(p => p.Model_ID == id).FirstOrDefault();
                if (obj != null)
                {
                    obj.Model_Name = mM_Model_Master.Model_Name;
                    obj.Model_Code = mM_Model_Master.Model_Code;
                    obj.Shop_ID = mM_Model_Master.Shop_ID;
                    obj.Plant_ID = mM_Model_Master.Plant_ID;
                    obj.Model_Description = mM_Model_Master.Model_Description;
                    obj.Email_Addresses = mM_Model_Master.Email_Addresses;
                    obj.Model_Description = mM_Model_Master.Model_Description;
                    obj.Is_Edited = true;
                    obj.Updated_Date = DateTime.Now;
                    obj.Updated_Host = mM_Model_Master.Updated_Host;
                    obj.Updated_User_ID = mM_Model_Master.Updated_User_ID;
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.UpdateMessage;
                messageDataObj.messageTitle = messageDataObj.UpdateTitle;
                }
                else
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                    messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;
                }
            }
            catch (Exception e)
            {
                if (!MM_Model_MasterExists(id))
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_Model_MasterController", "PutMM_Model_Master()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                    messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;
                }
                else
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_Model_MasterController", "PutMM_Model_Master()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
                }
            }
            return Ok(messageDataObj);
        }
        //// POST: api/MM_Model
        //[ResponseType(typeof(MM_Model))]
        [Route("api/MM_Master_Model/PostMM_Model_Master")]
        [HttpPost]
        [ActionName("PostMM_Model_Master")]
        public IHttpActionResult PostMM_Model_Master(MM_Model[] mM_Model_Master)
        {
            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                foreach (var item in mM_Model_Master)
                {
                    userid = Convert.ToDecimal(item.Inserted_User_ID);
                    if (db.MM_Model.Any(m => m.Model_Name.ToLower() == item.Model_Name.ToLower() && m.Audit_Type_Id == item.Audit_Type_Id && m.Plant_ID == item.Plant_ID))
                    {
                        messageDataObj.isAlertMessage = true;
                        messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                        messageDataObj.messageTitle = messageDataObj.DuplicateTitle;
                        return Ok(messageDataObj);
                    }
                }
                foreach (var item in mM_Model_Master)
                {
                    MM_Model obj = new MM_Model();
                    obj.Model_Code = item.Model_Code;
                    obj.Model_Name = item.Model_Name;
                    obj.Model_Description = item.Model_Description;
                    obj.Plant_Code = item.Plant_Code;
                    obj.Plant_ID = item.Plant_ID;
                    obj.Vehicle_Type = item.Vehicle_Type;
                    obj.Shop_ID = item.Shop_ID;
                    obj.Audit_Type_Id = item.Audit_Type_Id;
                    obj.Inserted_Host = item.Inserted_Host;
                    obj.Inserted_User_ID = item.Inserted_User_ID;
                    obj.Inserted_Date = DateTime.Now;
                    db.MM_Model.Add(obj);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                    messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_Model_MasterController", "PostMM_Model_Master()", userid);
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
                generalLogObj.addControllerException(e, "MM_Model_MasterController", "PostMM_Model_Master()", userid);
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
            //            // Access validation error details
            //            var propertyName = validationError.PropertyName;
            //            var errorMessage = validationError.ErrorMessage;

            //            // Handle or log the validation error as needed
            //        }
            //    }
            //}
            return Ok(messageDataObj);
        }

        // DELETE: api/MM_Model/5
        [Route("api/MM_Model/DeleteMM_Model_Master/{id}")]
        [HttpDelete]
        [ActionName("DeleteMM_Model_Master")]
        public IHttpActionResult DeleteMM_Model_Master(decimal id)
        {
            MM_Model mM_Model_Master = db.MM_Model.Find(id);
            if (mM_Model_Master == null)
            {
                return NotFound();
            }
            else
            {
                try
                {
                    db.MM_Model.Remove(mM_Model_Master);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                    messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                }
                catch (DbUpdateException dbe)
                {
                    generalLogObj.addControllerException(dbe, "MM_Model", "DeleteMM_Model_Master(" + id + ")", 1);
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
                    generalLogObj.addControllerException(e, "MM_Model", "DeleteMM_Model_Master(" + id + ")", 1);
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

        private bool MM_Model_MasterExists(decimal id)
        {
            return db.MM_Model.Count(e => e.Model_ID == id) > 0;
        }
    }
}