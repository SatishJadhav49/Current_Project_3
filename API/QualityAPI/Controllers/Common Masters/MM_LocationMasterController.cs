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
    public class MM_LocationMasterController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();
        // GET: MM_LocationMaster
        public IQueryable<MM_LocationMaster> GetMM_LocationMaster()
        {
            return db.MM_LocationMaster;
        }

        [Route("api/MM_LocationMaster/GetLocation/{Plant_ID},{Audit_Type_Id},{Shop_ID},{Model_ID}")]
        [HttpGet]
        [ActionName("GetLocation")]
        public IHttpActionResult GetLocation(decimal Plant_ID, decimal Audit_Type_Id, int Shop_ID, int Model_ID)
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
            var obj = (from location in db.MM_LocationMaster
                       join shop in db.MM_Shop on location.Shop_ID equals shop.Shop_ID
                       join model in db.MM_Model on location.Model_ID equals model.Model_ID
                       join area in db.MM_AreaMaster on location.Area_ID equals area.Area_ID
                       join part in db.MM_PartMaster on location.Part_ID equals part.Part_ID
                       join checkpoint in db.MM_CheckpointMaster on location.Checkpoint_ID equals checkpoint.Checkpoint_ID
                       where location.Audit_Type_Id == Audit_Type_Id && location.Plant_ID == Plant_ID
                      // && Shop_ids.Contains(location.Shop_ID ?? 0)
                      && shop.Shop_ID == Shop_ID && model.Model_ID== Model_ID
                       orderby location.Inserted_Date descending
                       select new
                       {
                           location.Location_ID,
                           location.Location_Desc,
                           location.Area_ID,
                           area.Area_Name,
                           location.Location_Name,
                           location.Is_Active,
                           location.SORTORDER,
                           location.Model_ID,
                           model.Model_Name,
                           location.Shop_ID,
                           shop.Shop_Name,
                           location.Plant_ID,
                           location.Is_Gap,
                           location.Is_Flushness,
                           part.Part_ID,
                           part.Part_Name,
                           checkpoint.Checkpoint_ID,
                           checkpoint.Checkpoint_Name,
                           location.Audit_Type_Id,
                           Status = location.Is_Active == true ? "Active" : "In Active"
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
                generalLogObj.addControllerException(e, "MM_LocationMaster", "GetLocation(" + Plant_ID + ","+Audit_Type_Id+", " + Shop_ID + "," + Model_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }


        [Route("api/MM_LocationMaster/GetLocationByID/{Location_ID}")]
        [HttpGet]
        [ActionName("GetLocationByID")]
        public IHttpActionResult GetLocationByID(int Location_ID)
        {
            try
            { 
            var obj = (from location in db.MM_LocationMaster
                       where location.Location_ID == Location_ID
                       select new
                       {
                           location.Location_ID,
                           location.Location_Desc,
                           location.Area_ID,
                           location.Location_Name,
                           location.Is_Active,
                           location.SORTORDER,
                           location.Model_ID,
                           location.Part_ID,
                           location.Shop_ID,
                           location.Plant_ID,
                           location.Is_Gap,
                           location.Is_Flushness,
                           location.Checkpoint_ID
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
                generalLogObj.addControllerException(e, "MM_LocationMaster", "GetLocationByID(" + Location_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        // GET: api/MM_Model/5
        [ResponseType(typeof(MM_Model))]
        public IHttpActionResult GetMM_LocationMaster(decimal id)
        {
            try
            { 
            MM_LocationMaster MM_LocationMaster = db.MM_LocationMaster.Find(id);
            if (MM_LocationMaster == null)
            {
                return NotFound();
            }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = MM_LocationMaster;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_LocationMaster", "GetMM_LocationMaster(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_LocationMaster/EditLocationMaster/{id}")]
        [HttpPut]
        [ActionName("EditLocationMaster")]
        public IHttpActionResult EditLocationMaster(decimal id, MM_LocationMaster mM_LocationMaster)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = Convert.ToDecimal(mM_LocationMaster.Updated_User_ID);
            try
            {
                if (db.MM_LocationMaster.Any(m => m.Location_Name.ToUpper() == mM_LocationMaster.Location_Name.ToUpper() && m.Location_ID != mM_LocationMaster.Location_ID && m.Plant_ID == mM_LocationMaster.Plant_ID && m.Shop_ID == mM_LocationMaster.Shop_ID && m.Model_ID == mM_LocationMaster.Model_ID && m.Area_ID == mM_LocationMaster.Area_ID && m.Part_ID == mM_LocationMaster.Part_ID && m.Checkpoint_ID == mM_LocationMaster.Checkpoint_ID && m.Audit_Type_Id == mM_LocationMaster.Audit_Type_Id && m.Is_Active == true))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                MM_LocationMaster obj = db.MM_LocationMaster.Where(p => p.Location_ID == id).FirstOrDefault();
                if (obj != null)
                {
                    obj.Location_Name = mM_LocationMaster.Location_Name;
                    obj.Location_Desc = mM_LocationMaster.Location_Desc;
                    obj.Shop_ID = mM_LocationMaster.Shop_ID;
                    obj.Model_ID = mM_LocationMaster.Model_ID;
                    obj.Area_ID = mM_LocationMaster.Area_ID;
                    obj.Part_ID = mM_LocationMaster.Part_ID;
                    obj.Plant_Code = mM_LocationMaster.Plant_Code;
                    obj.Checkpoint_ID = mM_LocationMaster.Checkpoint_ID;
                    obj.Is_Active = mM_LocationMaster.Is_Active;
                    obj.SORTORDER = mM_LocationMaster.SORTORDER;
                    obj.Plant_ID = mM_LocationMaster.Plant_ID;
                    obj.Audit_Type_Id = mM_LocationMaster.Audit_Type_Id;
                    obj.Is_Flushness = mM_LocationMaster.Is_Flushness;
                    obj.Is_Gap = mM_LocationMaster.Is_Gap;
                    obj.Is_Edited = true;
                    obj.Updated_Host = mM_LocationMaster.Updated_Host;
                    obj.Updated_User_ID = mM_LocationMaster.Updated_User_ID;
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
                if (!MM_LocationMasterExists(id))
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_LocationMasterController", "EditLocationMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                    messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;
                }
                else
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_LocationMasterController", "EditLocationMaster()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
                }
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_LocationMaster/SaveMM_LocationMaster")]
        [HttpPost]
        [ActionName("SaveMM_LocationMaster")]
        public IHttpActionResult SaveMM_LocationMaster(MM_LocationMaster[] mM_LocationMaster)
        {
            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                foreach (var item in mM_LocationMaster)
                {
                    userid = Convert.ToDecimal(item.Inserted_User_ID);
                    if (db.MM_LocationMaster.Any(m => m.Location_Name.ToUpper() == item.Location_Name.ToUpper() && m.Plant_ID == item.Plant_ID && m.Shop_ID == item.Shop_ID && m.Model_ID == item.Model_ID && m.Area_ID == item.Area_ID && m.Part_ID == item.Part_ID && m.Checkpoint_ID == item.Checkpoint_ID && m.Audit_Type_Id == item.Audit_Type_Id && m.Is_Active == true))
                    {
                        messageDataObj.isAlertMessage = true;
                        messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                        messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                        return Ok(messageDataObj);
                    }
                }
                foreach (var item in mM_LocationMaster)
                {
                    MM_LocationMaster obj = new MM_LocationMaster();
                    obj.Location_Name = item.Location_Name;
                    obj.Location_Desc = item.Location_Desc;
                    obj.Shop_ID = item.Shop_ID;
                    obj.Model_ID = item.Model_ID;
                    obj.Area_ID = item.Area_ID;
                    obj.Part_ID = item.Part_ID;
                    obj.Checkpoint_ID = item.Checkpoint_ID;
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
                    db.MM_LocationMaster.Add(obj);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                    messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_LocationMasterController", "SaveMM_LocationMaster()", userid);
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
                generalLogObj.addControllerException(e, "MM_LocationMasterController", "SaveMM_LocationMaster()", userid);
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

        [Route("api/MM_LocationMaster/DeleteMM_LocationMaster/{Location_ID}")]
        [HttpDelete]
        [ActionName("DeleteMM_LocationMaster")]
        public IHttpActionResult DeleteMM_LocationMaster(decimal Location_ID)
        {
            MM_LocationMaster MM_LocationMaster = db.MM_LocationMaster.Find(Location_ID);
            if (MM_LocationMaster == null)
            {
                return NotFound();
            }
            else
            {
                try
                {
                    db.MM_LocationMaster.Remove(MM_LocationMaster);
                    db.SaveChanges();
                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                    messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                }
                catch (DbUpdateException dbe)
                {
                    generalLogObj.addControllerException(dbe, "MM_LocationMaster", "DeleteMM_LocationMaster(" + Location_ID + ")", 1);
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
                    generalLogObj.addControllerException(e, "MM_LocationMaster", "DeleteMM_LocationMaster(" + Location_ID + ")", 1);
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
        private bool MM_LocationMasterExists(decimal id)
        {
            return db.MM_LocationMaster.Count(e => e.Location_ID == id) > 0;
        }

        [Route("api/MM_LocationMapping/SaveMM_LocationMapping")]
        [HttpPost]
        [ActionName("SaveMM_LocationMapping")]
        public IHttpActionResult SaveMM_LocationMapping(MM_Location_Mapping[] locationMappings)
        {
            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                foreach (var item in locationMappings)
                {
                    userid = Convert.ToDecimal(item.Inserted_User_ID);

                    // Check for duplicate mapping (same TCF + BIW + Plant)
                    if (db.MM_Location_Mapping.Any(m =>
                        m.TCF_Location_ID == item.TCF_Location_ID &&
                        m.BIW_Location_ID == item.BIW_Location_ID &&
                        m.Plant_Code == item.Plant_Code &&
                        m.Is_Deleted == false))
                    {
                        messageDataObj.isAlertMessage = true;
                        messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                        messageDataObj.messageTitle = messageDataObj.DuplicateTitle;
                        return Ok(messageDataObj);
                    }
                }

                foreach (var item in locationMappings)
                {
                    MM_Location_Mapping obj = new MM_Location_Mapping();
                    obj.TCF_Location_ID = item.TCF_Location_ID;
                    obj.BIW_Location_ID = item.BIW_Location_ID;
                    obj.Plant_Code = item.Plant_Code;
                    obj.Is_Purgeable = item.Is_Purgeable;
                    obj.Is_Edited = item.Is_Edited;
                    obj.Is_Transferred = item.Is_Transferred;
                    obj.Is_Deleted = false;
                    obj.Inserted_Host = item.Inserted_Host;
                    obj.Inserted_User_ID = item.Inserted_User_ID;
                    obj.Inserted_Date = DateTime.Now;

                    db.MM_Location_Mapping.Add(obj);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                    messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_LocationMappingController", "SaveMM_LocationMapping()", userid);
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
                generalLogObj.addControllerException(e, "MM_LocationMappingController", "SaveMM_LocationMapping()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }

            return Ok(messageDataObj);
        }

        [Route("api/MM_LocationMapping/GetLocationMapping/{Plant_ID},{Audit_Type_Id},{LM_ID}")]
        [HttpGet]
        [ActionName("GetLocationMapping")]
        public IHttpActionResult GetLocationMapping(decimal Plant_ID, decimal Audit_Type_Id, decimal LM_ID)
        {
            try
            {

                var obj = db.MM_Location_Mapping
                    .Join(db.MM_LocationMaster,
                          lm => lm.TCF_Location_ID,
                          tcf => tcf.Location_ID,
                          (lm, tcf) => new { lm, tcf })
                    .Join(db.MM_LocationMaster,
                          x => x.lm.BIW_Location_ID,
                          biw => biw.Location_ID,
                          (x, biw) => new { x.lm, x.tcf, biw })
                    .Where(x => x.tcf.Plant_ID == Plant_ID
                             && x.tcf.Audit_Type_Id == Audit_Type_Id
                             && x.tcf.Location_ID == LM_ID)
                    .OrderByDescending(x => x.lm.Inserted_Date)
                    .Select(x => new
                    {
                       x.lm.LM_ID,
                        x.lm.TCF_Location_ID,
                        x.lm.BIW_Location_ID,
                        TCF_Location_Name = x.tcf.Location_Name,
                        BIW_Location_Name = x.biw.Location_Name
                    })
                    .ToList();


                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                return Ok(new { messageDataObj, dataList = obj });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_LocationMapping",
                    $"GetLocationMapping({Plant_ID},{Audit_Type_Id},{LM_ID})");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }


        [Route("api/MM_LocationMapping/EditLocationMapping/{id}")]
        [HttpPut]
        [ActionName("EditLocationMapping")]
        public IHttpActionResult EditLocationMapping(int id, MM_Location_Mapping mapping)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            decimal userid = Convert.ToDecimal(mapping.Updated_User_ID);

            try
            {
                // Check for duplicate mapping (same TCF + BIW + Plant)
                if (db.MM_Location_Mapping.Any(m =>
                    m.TCF_Location_ID == mapping.TCF_Location_ID &&
                    m.BIW_Location_ID == mapping.BIW_Location_ID &&
                    m.Plant_Code == mapping.Plant_Code &&
                    m.LM_ID != id &&
                    m.Is_Deleted == false))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;
                    return Ok(messageDataObj);
                }

                var obj = db.MM_Location_Mapping.FirstOrDefault(p => p.LM_ID == id);
                if (obj != null)
                {
                    obj.TCF_Location_ID = mapping.TCF_Location_ID;
                    obj.BIW_Location_ID = mapping.BIW_Location_ID;
                    obj.Plant_Code = mapping.Plant_Code;
                    obj.Is_Purgeable = mapping.Is_Purgeable;
                    obj.Is_Edited = true;
                    obj.Is_Transferred = mapping.Is_Transferred;
                    obj.Is_Deleted = mapping.Is_Deleted;
                    obj.Updated_Host = mapping.Updated_Host;
                    obj.Updated_User_ID = mapping.Updated_User_ID;
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
                if (!LocationMappingExists(id))
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_LocationMappingController", "EditLocationMapping()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                    messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;
                }
                else
                {
                    generalLogObj.addControllerException(e.InnerException, "MM_LocationMappingController", "EditLocationMapping()", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
                }
            }

            return Ok(messageDataObj);
        }

        [Route("api/MM_LocationMapping/DeleteLocationMapping/{id}")]
        [HttpDelete]
        [ActionName("DeleteLocationMapping")]
        public IHttpActionResult DeleteLocationMapping(int id)
        {
            var mapping = db.MM_Location_Mapping.Find(id);
            if (mapping == null)
            {
                return NotFound();
            }

            try
            {
                db.MM_Location_Mapping.Remove(mapping);
                db.SaveChanges();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                messageDataObj.messageTitle = messageDataObj.DeletionTitle;
            }
            catch (DbUpdateException dbe)
            {
                generalLogObj.addControllerException(dbe, "MM_LocationMappingController", "DeleteLocationMapping(" + id + ")", 1);
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
                generalLogObj.addControllerException(e, "MM_LocationMappingController", "DeleteLocationMapping(" + id + ")", 1);
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.DeletionErrorTitle;
                messageDataObj.isErrorMessage = true;
            }

            return Ok(messageDataObj);
        }
        private bool LocationMappingExists(int id)
        {
            return db.MM_Location_Mapping.Count(e => e.LM_ID == id) > 0;
        }





    }
}