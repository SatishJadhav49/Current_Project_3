using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using QualityAPI.Helper;
using QualityAPI.Models;

namespace QualityAPI.Controllers
{
    [AllowCrossSiteJson]
    public class MM_Shift_MasterController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        ValidationModel validobj = new ValidationModel();
        GlobalData messageDataObj = new GlobalData();
        private General general = new General();
        // GET: api/MM_Shift
        public IQueryable<MM_Shift> GetMM_Qlty_Shift_Master()
        {
            return db.MM_Shift;
        }

        // GET: api/MM_Shift/5
        [ResponseType(typeof(MM_Shift))]
        public IHttpActionResult GetMM_Qlty_Shift_Master(decimal id)
        {
            try
            { 
            MM_Shift mM_Qlty_Shift_Master = db.MM_Shift.Find(id);
            if (mM_Qlty_Shift_Master == null)
            {
                return NotFound();
            }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = mM_Qlty_Shift_Master;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                general.addControllerException(e, "MM_Shift_Master", "GetMM_Qlty_Shift_Master(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Shift_Master/GetShiftData/{plantid},{Audit_Type_Id},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetShiftData")]
        public IHttpActionResult GetShiftData(decimal plantid,decimal Audit_Type_Id, int Shop_ID, bool Is_AllShops)
        {
            try
            { 
            IEnumerable<decimal> Shop_ids;

            if (Is_AllShops == true)
            {
                Shop_ids = (from shop in db.MM_Shop
                            where shop.Audit_Type_Id == Audit_Type_Id && shop.Plant_ID == plantid
                            select (decimal)shop.Shop_ID).ToList();
            }
            else
            {
                Shop_ids = new List<decimal> { Shop_ID };
            }
            var chkobj = (from S in db.MM_Shift
                          join p in db.MM_Plant on S.Plant_ID equals p.Plant_ID
                          join shop in db.MM_Shop on S.Shop_ID equals shop.Shop_ID
                          where S.Plant_ID == plantid && S.Audit_Type_Id == Audit_Type_Id
                          && Shop_ids.Contains(S.Shop_ID ?? 0)
                          orderby S.Inserted_Date descending
                          select new
                          {
                              S.SHIFT_NO,
                              S.SHIFT_DESC,
                              S.Is_Active,
                              S.WORKING,
                              S.START_TIME,
                              S.END_TIME,
                              p.Plant_ID,
                              p.Plant_Name,
                              shop.Shop_ID,
                              shop.Shop_Name,
                          }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = chkobj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                general.addControllerException(e, "MM_Shift_Master", "GetShiftData(" + plantid + ","+Audit_Type_Id+","+Shop_ID+","+Is_AllShops+")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Shift_Master/Edit_MM_Shift/{SHIFT_NO}")]
        [HttpPost]
        [ActionName("Edit_MM_Shift")]
        public IHttpActionResult Edit_MM_Shift(decimal SHIFT_NO, MM_Shift mM_Shift)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (SHIFT_NO != mM_Shift.SHIFT_NO)
            {
                return BadRequest();
            }
            decimal userid = Convert.ToDecimal(mM_Shift.Updated_User_ID);
            try
            {
                if (db.MM_Shift.Any(c => c.Plant_ID == mM_Shift.Plant_ID && c.Shop_ID == mM_Shift.Shop_ID &&
                c.SHIFT_DESC.ToLower() == mM_Shift.SHIFT_DESC.ToLower() && c.SHIFT_NO != mM_Shift.SHIFT_NO))
                {
                    this.validobj.IsErrorAlertDuplicate = true;
                    this.validobj.IsTitle = messageDataObj.DuplicateTitle;
                    this.validobj.IsMassege = messageDataObj.DuplicateMessage;
                    return Ok(validobj);
                }
                MM_Shift obj = db.MM_Shift.Where(p => p.SHIFT_NO == SHIFT_NO).FirstOrDefault();
                if (obj != null)
                {
                    obj.SHIFT_DESC = mM_Shift.SHIFT_DESC;
                    obj.START_TIME = mM_Shift.START_TIME;
                    obj.END_TIME = mM_Shift.END_TIME;
                    obj.WORKING = mM_Shift.WORKING;
                    obj.Plant_ID = mM_Shift.Plant_ID;
                    obj.Shop_ID = mM_Shift.Shop_ID;
                    obj.Is_Edited = true;
                    obj.Updated_Host = mM_Shift.Updated_Host;
                    obj.Updated_User_ID = mM_Shift.Updated_User_ID;
                    obj.Updated_Date = DateTime.Now;
                    obj.Is_Active = mM_Shift.Is_Active;
                    db.Entry(obj).State = EntityState.Modified;
                    db.SaveChanges();

                    this.validobj.IsSuccessAlert = true;
                    this.validobj.IsTitle = messageDataObj.UpdateTitle;
                    this.validobj.IsMassege = messageDataObj.UpdateMessage;
                }

            }
            catch(DbUpdateException dbe)
            {
                general.addControllerException(dbe, "MM_Shift_MasterController", "Edit_MM_Shift(" + SHIFT_NO + ")", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = dbe.ToString();
                this.validobj.IsTitle = messageDataObj.UpdateErrorTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                general.addControllerException(e, "MM_Shift_MasterController", "Edit_MM_Shift("+SHIFT_NO+")", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.UpdateErrorTitle;
            }
            return Ok(validobj);
        }

        [Route("api/MM_Shift_Master/Save_MM_Shift")]
        [HttpPost]
        [ActionName("Save_MM_Shift")]
        public IHttpActionResult Save_MM_Shift(MM_Shift[] mM_Shift)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = 0;
            try
            {
                foreach (var item in mM_Shift)
                {
                    if (db.MM_Shift.Any(c => c.Plant_ID == item.Plant_ID && c.Shop_ID == item.Shop_ID &&
                    c.SHIFT_DESC.ToLower() == item.SHIFT_DESC.ToLower()))
                    {
                        this.validobj.IsErrorAlertDuplicate = true;
                        this.validobj.IsTitle = messageDataObj.DuplicateTitle;
                        this.validobj.IsMassege = messageDataObj.DuplicateMessage;
                        return Ok(validobj);
                    }
                }
                foreach (var item in mM_Shift)
                {
                    userid = item.Inserted_User_ID ?? 0;
                    MM_Shift obj = new MM_Shift();

                    obj.SHIFT_DESC = item.SHIFT_DESC;
                    obj.START_TIME = item.START_TIME;
                    obj.END_TIME = item.END_TIME;
                    obj.WORKING = item.WORKING;
                    obj.Plant_ID = item.Plant_ID;
                    obj.Shop_ID = item.Shop_ID;
                    obj.Inserted_Host = item.Inserted_Host;
                    obj.Inserted_User_ID = item.Inserted_User_ID;
                    obj.Inserted_Date = DateTime.Now;
                    obj.Is_Active = item.Is_Active;
                    obj.Audit_Type_Id = item.Audit_Type_Id;
                    db.MM_Shift.Add(obj);
                    db.SaveChanges();

                    this.validobj.IsSuccessAlert = true;
                    this.validobj.IsTitle = messageDataObj.SuccessTitle;
                    this.validobj.IsMassege = messageDataObj.SuccessMessage;
                }

            }
            catch(DbUpdateException dbe)
            {
                general.addControllerException(dbe, "MM_Shift_Master", "Save_MM_Shift()", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = dbe.ToString();
                this.validobj.IsTitle = messageDataObj.SaveErrorTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                general.addControllerException(e, "MM_Shift_Master", "Save_MM_Shift()", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(validobj);
        }

        [Route("api/MM_Shift_Master/Delete_MM_Shift/{SHIFT_NO}")]
        [HttpDelete]
        [ActionName("Delete_MM_Shift")]
        public IHttpActionResult Delete_MM_Shift(decimal SHIFT_NO)
        {
            try
            {
                MM_Shift mM_Qlty_Shift_Master = db.MM_Shift.Find(SHIFT_NO);
                if (mM_Qlty_Shift_Master == null)
                {
                    return NotFound();
                }

                db.MM_Shift.Remove(mM_Qlty_Shift_Master);
                db.SaveChanges();

                this.validobj.IsSuccessAlert = true;
                this.validobj.IsTitle = messageDataObj.DeletionTitle;
                this.validobj.IsMassege = messageDataObj.DeletionMessage;
                return Ok(validobj);
            }
            catch (DbUpdateException e)
            {
                general.addControllerException(e, "MM_Shift_MasterController", "Delete_MM_Shift(" + SHIFT_NO + ")");
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.DeleteConflictTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                general.addControllerException(e, "MM_Shift_MasterController", "Delete_MM_Shift(" + SHIFT_NO + ")");
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.DeletionErrorTitle;
                this.validobj.isErrorMessage = true;
            }
            return Ok(validobj);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool MM_Qlty_Shift_MasterExists(decimal id)
        {
            return db.MM_Shift.Count(e => e.SHIFT_NO == id) > 0;
        }
    }
}