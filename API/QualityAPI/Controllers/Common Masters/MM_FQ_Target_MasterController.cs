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
using OfficeOpenXml;
using System.IO;
using System.Web;


namespace QualityAPI.Controllers.Common_Masters
{
    public class MM_FQ_Target_MasterController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();
        // GET: MM_FQ_Target_Master
        public IQueryable<MM_FQ_Target_Master> GetMM_FQ_Target_Master()
        {
            return db.MM_FQ_Target_Master;
        }

        [Route("api/MM_FQ_Target_Master/GetFQ_Target/{Plant_ID},{Audit_Type_Id},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetFQ_Target")]
        public IHttpActionResult GetFQ_Target(decimal Plant_ID, decimal Audit_Type_Id, int Shop_ID, bool Is_AllShops)
        {
            try
            {
                IEnumerable<decimal> Shop_ids;

                if (Is_AllShops == true)
                {
                    Shop_ids = (from shop in db.MM_Shop
                                where shop.Plant_ID == Plant_ID
                                select (decimal)shop.Shop_ID).ToList();
                }
                else
                {
                    Shop_ids = new List<decimal> { Shop_ID };
                }

                var obj = (from Target in db.MM_FQ_Target_Master
                           join shop in db.MM_Shop on Target.Shop_ID equals shop.Shop_ID
                           join model in db.MM_Model on Target.Model_ID equals model.Model_ID
                           where Target.Plant_ID == Plant_ID  && Target.Audit_Type_Id == Audit_Type_Id
&& Shop_ids.Contains(Target.Shop_ID ?? 0)
                           orderby Target.Inserted_Date descending
                           select new
                           {
                               Target.FQ_Target_ID,
                               Target.FY_Name,
                               Target.FQ_Name,
                               Target.FQ_Target_L3,
                               Target.FQ_Target_L4,
                               Target.SORTORDER,
                               Target.Model_ID,
                               model.Model_Name,
                               Target.Shop_ID,
                               shop.Shop_Name,
                               Target.Plant_ID,
                               Target.Audit_Type_Master.Audit_Type,
                               Target.Audit_Type_Id
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
                generalLogObj.addControllerException(e, "MM_FQ_Target_MasterController", "GetFQ_Target(" + Plant_ID + ", " + Shop_ID + ", " + Is_AllShops + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_FQ_Target_Master/GetFQ_TargetByID/{FQ_Target_ID}")]
        [HttpGet]
        [ActionName("GetFQ_TargetByID")]
        public IHttpActionResult GetFQ_TargetByID(int FQ_Target_ID)
        {
            try
            {
                var obj = (from Target in db.MM_FQ_Target_Master
                           where Target.FQ_Target_ID == FQ_Target_ID
                           select new
                           {
                               Target.FQ_Target_ID,
                               Target.FY_Name,
                               Target.FQ_Name,
                               Target.FQ_Target_L3,
                               Target.FQ_Target_L4,
                               Target.SORTORDER,
                               Target.Model_ID,
                               Target.Shop_ID,
                               Target.Plant_ID
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
                generalLogObj.addControllerException(e, "MM_FQ_Target_MasterController", "GetFQ_TargetByID(" + FQ_Target_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [ResponseType(typeof(MM_FQ_Target_Master))]
        public IHttpActionResult GetMM_FQ_Target_Master(decimal id)
        {
            try
            {
                MM_FQ_Target_Master MM_FQ_Target_Master = db.MM_FQ_Target_Master.Find(id);
                if (MM_FQ_Target_Master == null)
                {
                    return NotFound();
                }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = MM_FQ_Target_Master;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_FQ_Target_MasterController", "GetMM_FQ_Target_Master(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_FQ_Target_Master/EditFQ_Target/{id}")]
        [HttpPut]
        [ActionName("EditFQ_Target")]
        public IHttpActionResult EditFQ_Target(decimal id, MM_FQ_Target_Master MM_FQ_Target_Master)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = Convert.ToDecimal(MM_FQ_Target_Master.Updated_User_ID);
            try
            {
                if (db.MM_FQ_Target_Master.Any(m => m.FQ_Name == MM_FQ_Target_Master.FQ_Name && m.FY_Name == MM_FQ_Target_Master.FY_Name && m.FQ_Target_ID != MM_FQ_Target_Master.FQ_Target_ID && m.Plant_ID == MM_FQ_Target_Master.Plant_ID && m.Shop_ID == MM_FQ_Target_Master.Shop_ID && m.Model_ID == MM_FQ_Target_Master.Model_ID && m.Audit_Type_Id == MM_FQ_Target_Master.Audit_Type_Id))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                MM_FQ_Target_Master obj = db.MM_FQ_Target_Master.Where(p => p.FQ_Target_ID == id).FirstOrDefault();
                if (obj != null)
                {
                    obj.FY_Name = MM_FQ_Target_Master.FY_Name;
                    obj.FQ_Name = MM_FQ_Target_Master.FQ_Name;
                    obj.FQ_Target_L3 = MM_FQ_Target_Master.FQ_Target_L3;
                    obj.FQ_Target_L4 = MM_FQ_Target_Master.FQ_Target_L4;
                    obj.Shop_ID = MM_FQ_Target_Master.Shop_ID;
                    obj.Model_ID = MM_FQ_Target_Master.Model_ID;
                    obj.SORTORDER = MM_FQ_Target_Master.SORTORDER;
                    obj.Plant_ID = MM_FQ_Target_Master.Plant_ID;
                    obj.Plant_Code = MM_FQ_Target_Master.Plant_Code;
                    obj.Audit_Type_Id = MM_FQ_Target_Master.Audit_Type_Id;
                    obj.Is_Edited = true;
                    obj.Updated_Host = MM_FQ_Target_Master.Updated_Host;
                    obj.Updated_User_ID = MM_FQ_Target_Master.Updated_User_ID;
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
                if (!MM_FQ_Target_MasterExists(id))
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_FQ_Target_MasterController", "EditAreaMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                    messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;
                }
                else
                {
                    if (e.InnerException != null)
                    {
                        e = e.InnerException;
                    }
                    generalLogObj.addControllerException(e.InnerException, "MM_FQ_Target_MasterController", "EditAreaMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
                }
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_FQ_Target_Master/SaveMM_FQ_Target_Master")]
        [HttpPost]
        [ActionName("SaveMM_FQ_Target_Master")]
        public IHttpActionResult SaveMM_FQ_Target_Master(MM_FQ_Target_Master[] MM_FQ_Target_Master)
        {
            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                foreach (var item in MM_FQ_Target_Master)
                {
                    userid = Convert.ToDecimal(item.Inserted_User_ID);
                    if (db.MM_FQ_Target_Master.Any(m => m.FQ_Name == item.FQ_Name && m.FY_Name == item.FY_Name && m.Plant_ID == item.Plant_ID && m.Shop_ID == item.Shop_ID && m.Model_ID == item.Model_ID && m.Audit_Type_Id == item.Audit_Type_Id))
                    {
                        messageDataObj.isAlertMessage = true;
                        messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                        messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                        return Ok(messageDataObj);
                    }
                }
                foreach (var item in MM_FQ_Target_Master)
                {
                    MM_FQ_Target_Master obj = new MM_FQ_Target_Master();
                    obj.FY_Name = item.FY_Name;
                    obj.FQ_Name = item.FQ_Name;
                    obj.FQ_Target_L3 = item.FQ_Target_L3;
                    obj.FQ_Target_L4 = item.FQ_Target_L4;
                    obj.Shop_ID = item.Shop_ID;
                    obj.Model_ID = item.Model_ID;
                    obj.SORTORDER = item.SORTORDER;
                    obj.Plant_ID = item.Plant_ID;
                    obj.Plant_Code = item.Plant_Code;
                    obj.Audit_Type_Id = item.Audit_Type_Id;
                    obj.Inserted_Host = item.Inserted_Host;
                    obj.Inserted_User_ID = item.Inserted_User_ID;
                    obj.Inserted_Date = DateTime.Now;
                    db.MM_FQ_Target_Master.Add(obj);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                    messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_FQ_Target_MasterController", "SaveMM_FQ_Target_Master()", userid);
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
                generalLogObj.addControllerException(e, "MM_FQ_Target_MasterController", "SaveMM_FQ_Target_Master()", userid);
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
        [Route("api/MM_FQ_Target_Master/DeleteMM_FQ_Target_Master/{FQ_Target_ID}")]
        [HttpDelete]
        [ActionName("DeleteMM_FQ_Target_Master")]
        public IHttpActionResult DeleteMM_FQ_Target_Master(decimal FQ_Target_ID)
        {
            MM_FQ_Target_Master MM_FQ_Target_Master = db.MM_FQ_Target_Master.Find(FQ_Target_ID);
            if (MM_FQ_Target_Master == null)
            {
                return NotFound();
            }
            else
            {
                try
                {
                    db.MM_FQ_Target_Master.Remove(MM_FQ_Target_Master);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                    messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                }
                catch (DbUpdateException dbe)
                {
                    generalLogObj.addControllerException(dbe, "MM_FQ_Target_Master", "DeleteMM_FQ_Target_Master(" + FQ_Target_ID + ")", 1);
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
                    generalLogObj.addControllerException(e, "MM_FQ_Target_Master", "DeleteMM_FQ_Target_Master(" + FQ_Target_ID + ")", 1);
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

        private bool MM_FQ_Target_MasterExists(decimal id)
        {
            return db.MM_FQ_Target_Master.Count(e => e.FQ_Target_ID == id) > 0;
        }
    }
}
