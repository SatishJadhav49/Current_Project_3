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
    public class MM_CheckpointMasterController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();
        // GET: MM_CheckpointMaster
        public IQueryable<MM_CheckpointMaster> GetMM_CheckpointMaster()
        {
            return db.MM_CheckpointMaster;
        }

        [Route("api/MM_CheckpointMaster/GetCheckpoint/{Plant_ID},{Audit_Type_Id},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetCheckpoint")]
        public IHttpActionResult GetCheckpoint(decimal Plant_ID, decimal Audit_Type_Id, int Shop_ID, bool Is_AllShops)
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
                var obj = (from checkpoint in db.MM_CheckpointMaster
                           join shop in db.MM_Shop on checkpoint.Shop_ID equals shop.Shop_ID
                           join model in db.MM_Model on checkpoint.Model_ID equals model.Model_ID
                           join area in db.MM_AreaMaster on checkpoint.Area_ID equals area.Area_ID
                           join part in db.MM_PartMaster on checkpoint.Part_ID equals part.Part_ID
                           where checkpoint.Audit_Type_Id == Audit_Type_Id && checkpoint.Plant_ID == Plant_ID
                           //&& Shop_ids.Contains(checkpoint.Shop_ID ?? 0)
                           && shop.Shop_ID == Shop_ID
                           orderby checkpoint.Inserted_Date descending
                           select new
                           {
                               checkpoint.Checkpoint_ID,
                               checkpoint.Checkpoint_Desc,
                               checkpoint.Parallelism,
                               checkpoint.Area_ID,
                               area.Area_Name,
                               checkpoint.Checkpoint_Name,
                               checkpoint.Is_Active,
                               checkpoint.SORTORDER,
                               checkpoint.Model_ID,
                               model.Model_Name,
                               checkpoint.Shop_ID,
                               shop.Shop_Name,
                               checkpoint.Plant_ID,
                               checkpoint.Is_Gap,
                               checkpoint.Is_Flushness,
                               part.Part_ID,
                               part.Part_Name,
                               checkpoint.Audit_Type_Id,
                               Status = checkpoint.Is_Active == true?"Active":"In Active"
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
                generalLogObj.addControllerException(e, "MM_CheckpointMaster", "GetCheckpoint(" + Plant_ID + ", " + Shop_ID + ","+Audit_Type_Id+"," + Is_AllShops + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }


        [Route("api/MM_CheckpointMaster/GetCheckpointByID/{Checkpoint_ID}")]
        [HttpGet]
        [ActionName("GetCheckpointByID")]
        public IHttpActionResult GetCheckpointByID(int Checkpoint_ID)
        {
            try
            { 
            var obj = (from checkpoint in db.MM_CheckpointMaster
                       where checkpoint.Checkpoint_ID == Checkpoint_ID
                       select new
                       {
                           checkpoint.Checkpoint_ID,
                           checkpoint.Checkpoint_Desc,
                           checkpoint.Parallelism,
                           checkpoint.Area_ID,
                           checkpoint.Checkpoint_Name,
                           checkpoint.Is_Active,
                           checkpoint.SORTORDER,
                           checkpoint.Model_ID,
                           checkpoint.Part_ID,
                           checkpoint.Shop_ID,
                           checkpoint.Plant_ID,
                           checkpoint.Is_Gap,
                           checkpoint.Is_Flushness,
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
                generalLogObj.addControllerException(e, "MM_CheckpointMaster", "GetCheckpointByID(" + Checkpoint_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        // GET: api/MM_Model/5
        [ResponseType(typeof(MM_Model))]
        public IHttpActionResult GetMM_CheckpointMaster(decimal id)
        {
            try
            { 
            MM_CheckpointMaster MM_CheckpointMaster = db.MM_CheckpointMaster.Find(id);
            if (MM_CheckpointMaster == null)
            {
                return NotFound();
            }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = MM_CheckpointMaster;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_CheckpointMaster", "GetMM_CheckpointMaster(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_CheckpointMaster/EditCheckpointMaster/{id}")]
        [HttpPut]
        [ActionName("EditCheckpointMaster")]
        public IHttpActionResult EditCheckpointMaster(decimal id, MM_CheckpointMaster mM_CheckpointMaster)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = Convert.ToDecimal(mM_CheckpointMaster.Updated_User_ID);
            try
            {
                if (db.MM_CheckpointMaster.Any(m => m.Checkpoint_Name.ToUpper() == mM_CheckpointMaster.Checkpoint_Name.ToUpper() && m.Checkpoint_ID != mM_CheckpointMaster.Checkpoint_ID && m.Plant_ID == mM_CheckpointMaster.Plant_ID && m.Shop_ID == mM_CheckpointMaster.Shop_ID && m.Model_ID == mM_CheckpointMaster.Model_ID && m.Area_ID == mM_CheckpointMaster.Area_ID && m.Part_ID == mM_CheckpointMaster.Part_ID && m.Audit_Type_Id == mM_CheckpointMaster.Audit_Type_Id && m.Is_Active == true))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                MM_CheckpointMaster obj = db.MM_CheckpointMaster.Where(p => p.Checkpoint_ID == id).FirstOrDefault();
                if (obj != null)
                {
                    obj.Checkpoint_Name = mM_CheckpointMaster.Checkpoint_Name;
                    obj.Checkpoint_Desc = mM_CheckpointMaster.Checkpoint_Desc;
                    obj.Shop_ID = mM_CheckpointMaster.Shop_ID;
                    obj.Model_ID = mM_CheckpointMaster.Model_ID;
                    obj.Area_ID = mM_CheckpointMaster.Area_ID;
                    obj.Part_ID = mM_CheckpointMaster.Part_ID;
                    obj.Parallelism = mM_CheckpointMaster.Parallelism;
                    obj.Is_Active = mM_CheckpointMaster.Is_Active;
                    obj.SORTORDER = mM_CheckpointMaster.SORTORDER;
                    obj.Plant_ID = mM_CheckpointMaster.Plant_ID;
                    obj.Plant_Code = mM_CheckpointMaster.Plant_Code;
                    obj.Audit_Type_Id = mM_CheckpointMaster.Audit_Type_Id;
                    obj.Is_Flushness = mM_CheckpointMaster.Is_Flushness;
                    obj.Is_Gap = mM_CheckpointMaster.Is_Gap;
                    obj.Is_Edited = true;
                    obj.Updated_Host = mM_CheckpointMaster.Updated_Host;
                    obj.Updated_User_ID = mM_CheckpointMaster.Updated_User_ID;
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
                if (!MM_CheckpointMasterExists(id))
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_CheckpointMasterController", "EditCheckpointMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                    messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;
                }
                else
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_CheckpointMasterController", "EditCheckpointMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
                }
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_CheckpointMaster/SaveMM_CheckpointMaster")]
        [HttpPost]
        [ActionName("SaveMM_CheckpointMaster")]
        public IHttpActionResult SaveMM_CheckpointMaster(MM_CheckpointMaster[] mM_CheckpointMaster)
        {
            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                foreach (var item in mM_CheckpointMaster)
                {
                    userid = Convert.ToDecimal(item.Inserted_User_ID);
                    if (db.MM_CheckpointMaster.Any(m => m.Checkpoint_Name.ToUpper() == item.Checkpoint_Name.ToUpper() && m.Plant_ID == item.Plant_ID && m.Shop_ID == item.Shop_ID && m.Model_ID == item.Model_ID && m.Area_ID == item.Area_ID && m.Part_ID == item.Part_ID && m.Audit_Type_Id == item.Audit_Type_Id && m.Is_Active == true))
                    {
                        messageDataObj.isAlertMessage = true;
                        messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                        messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                        return Ok(messageDataObj);
                    }
                }
                foreach (var item in mM_CheckpointMaster)
                {
                    MM_CheckpointMaster obj = new MM_CheckpointMaster();
                    obj.Checkpoint_Name = item.Checkpoint_Name;
                    obj.Checkpoint_Desc = item.Checkpoint_Desc;
                    obj.Parallelism = item.Parallelism;
                    obj.Shop_ID = item.Shop_ID;
                    obj.Model_ID = item.Model_ID;
                    obj.Area_ID = item.Area_ID;
                    obj.Part_ID = item.Part_ID;
                    obj.Is_Active = item.Is_Active;
                    obj.SORTORDER = item.SORTORDER;
                    obj.Plant_ID = item.Plant_ID;
                    obj.Plant_Code = item.Plant_Code;
                    obj.Audit_Type_Id = item.Audit_Type_Id;
                    obj.Is_Gap = item.Is_Gap;
                    obj.Is_Flushness = item.Is_Flushness;
                    obj.Inserted_Host = item.Inserted_Host;
                    obj.Inserted_User_ID = item.Inserted_User_ID;
                    obj.Inserted_Date = DateTime.Now;
                    db.MM_CheckpointMaster.Add(obj);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                    messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_CheckpointMasterController", "SaveMM_CheckpointMaster()", userid);
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
                generalLogObj.addControllerException(e, "MM_CheckpointMasterController", "SaveMM_CheckpointMaster()", userid);
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

        [Route("api/MM_CheckpointMaster/DeleteMM_CheckpointMaster/{Checkpoint_ID}")]
        [HttpDelete]
        [ActionName("DeleteMM_CheckpointMaster")]
        public IHttpActionResult DeleteMM_CheckpointMaster(decimal Checkpoint_ID)
        {
            MM_CheckpointMaster MM_CheckpointMaster = db.MM_CheckpointMaster.Find(Checkpoint_ID);
            if (MM_CheckpointMaster == null)
            {
                return NotFound();
            }
            else
            {
                try
                {
                    db.MM_CheckpointMaster.Remove(MM_CheckpointMaster);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                    messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                }
                catch (DbUpdateException dbe)
                {
                    generalLogObj.addControllerException(dbe, "MM_CheckpointMaster", "DeleteMM_CheckpointMaster(" + Checkpoint_ID + ")", 1);
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
                    generalLogObj.addControllerException(e, "MM_CheckpointMaster", "DeleteMM_CheckpointMaster(" + Checkpoint_ID + ")", 1);
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
        private bool MM_CheckpointMasterExists(decimal id)
        {
            return db.MM_CheckpointMaster.Count(e => e.Checkpoint_ID == id) > 0;
        }
    }
}