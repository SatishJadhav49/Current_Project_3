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

namespace QualityAPI.GNOVA_C
{
    public class MM_Audit_BuildPhase_MstrController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        ValidationModel validobj = new ValidationModel();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();

        // GET: api/MM_Audit_BuildPhase_Mstr
        public IQueryable<MM_Audit_BuildPhase_Mstr> GetMM_Audit_BuildPhase_Mstr()
        {
            return db.MM_Audit_BuildPhase_Mstr;
        }

        // GET: api/MM_Audit_BuildPhase_Mstr/5
        [ResponseType(typeof(MM_Audit_BuildPhase_Mstr))]
        public IHttpActionResult GetMM_Audit_BuildPhase_Mstr(decimal id)
        {
            try
            { 
            MM_Audit_BuildPhase_Mstr mM_Audit_BuildPhase_Mstr = db.MM_Audit_BuildPhase_Mstr.Find(id);
            if (mM_Audit_BuildPhase_Mstr == null)
            {
                return NotFound();
            }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = mM_Audit_BuildPhase_Mstr;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Audit_BuildPhase_Mstr", "GetMM_Audit_BuildPhase_Mstr(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Audit_BuildPhase_Mstr/GetBuildData/{plantid}")]
        [HttpGet]
        [ActionName("GetBuildData")]
        public IHttpActionResult GetBuildData(decimal plantid)
        {
            try
            { 
            var builphaseobj = (from b in db.MM_Audit_BuildPhase_Mstr
                                join
                                p in db.MM_Plant
                                on b.Plant_ID equals p.Plant_ID
                                where b.Plant_ID == plantid
                                orderby b.Inserted_Date descending
                                select new
                                {
                                    b.Build_Phase_ID,
                                    b.Build_Phase_Name,
                                    b.Build_Phase_Description,
                                    p.Plant_ID,
                                    p.Plant_Name
                                }
                                ).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = builphaseobj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Audit_BuildPhase_Mstr", "GetBuildData(" + plantid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        // PUT: api/MM_Audit_BuildPhase_Mstr/5
        //[ResponseType(typeof(void))]
        [Route("api/MM_Audit_BuildPhase_Mstr/PostMM_Audit_BuildPhase_Mstr/{id}")]
        [HttpPut]
        [ActionName("PostMM_Audit_BuildPhase_Mstr")]
        public IHttpActionResult PutMM_Audit_BuildPhase_Mstr(decimal id, MM_Audit_BuildPhase_Mstr mM_Audit_BuildPhase_Mstr)
        {
            decimal userid = mM_Audit_BuildPhase_Mstr.Updated_User_ID ?? 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != mM_Audit_BuildPhase_Mstr.Build_Phase_ID)
            {
                return BadRequest();
            }
            try
            {

                if (db.MM_Audit_BuildPhase_Mstr.Any(b => b.Build_Phase_ID != mM_Audit_BuildPhase_Mstr.Build_Phase_ID && b.Build_Phase_Name.ToLower() == mM_Audit_BuildPhase_Mstr.Build_Phase_Name.ToLower() && b.Plant_ID == mM_Audit_BuildPhase_Mstr.Plant_ID))
                {
                    this.validobj.IsErrorAlertDuplicate = true;
                    this.validobj.IsTitle = messageDataObj.DuplicateTitle;
                    this.validobj.IsMassege = messageDataObj.DuplicateMessage;
                    return Ok(validobj);
                }
                else
                {
                    MM_Audit_BuildPhase_Mstr obj = db.MM_Audit_BuildPhase_Mstr.Where(p => p.Build_Phase_ID == id).FirstOrDefault();
                    if (obj != null)
                    {
                        obj.Build_Phase_Name = mM_Audit_BuildPhase_Mstr.Build_Phase_Name;
                        obj.Shop_ID = mM_Audit_BuildPhase_Mstr.Shop_ID;
                        obj.Plant_ID = mM_Audit_BuildPhase_Mstr.Plant_ID;
                        obj.Plant_Code = mM_Audit_BuildPhase_Mstr.Plant_Code;
                        obj.Build_Phase_Description = mM_Audit_BuildPhase_Mstr.Build_Phase_Description;
                        obj.Is_Edited = true;
                        obj.Updated_Date = DateTime.Now;
                        obj.Updated_Host = mM_Audit_BuildPhase_Mstr.Updated_Host;
                        obj.Updated_User_ID = mM_Audit_BuildPhase_Mstr.Updated_User_ID;
                        db.Entry(obj).State = EntityState.Modified;
                        db.SaveChanges();

                        this.validobj.IsSuccessAlert = true;
                        this.validobj.IsTitle = messageDataObj.UpdateTitle;
                        this.validobj.IsMassege = messageDataObj.UpdateMessage;
                    }
                }
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Audit_BuildPhase_Mstr", "PutMM_Audit_BuildPhase_Mstr", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.UpdateErrorTitle;
            }
            return Ok(validobj);
        }

        // POST: api/MM_Audit_BuildPhase_Mstr
        //[ResponseType(typeof(MM_Audit_BuildPhase_Mstr))]
        [Route("api/MM_Audit_BuildPhase_Mstr/PostMM_Audit_BuildPhase_Mstr")]
        [HttpPost]
        [ActionName("PostMM_Audit_BuildPhase_Mstr")]
        public IHttpActionResult PostMM_Audit_BuildPhase_Mstr(MM_Audit_BuildPhase_Mstr mM_Audit_BuildPhase_Mstr)
        {
            decimal userid = mM_Audit_BuildPhase_Mstr.Inserted_User_ID ?? 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                if (db.MM_Audit_BuildPhase_Mstr.Any(b => b.Build_Phase_ID != mM_Audit_BuildPhase_Mstr.Build_Phase_ID && b.Plant_ID == mM_Audit_BuildPhase_Mstr.Plant_ID && b.Build_Phase_Name.ToLower() == mM_Audit_BuildPhase_Mstr.Build_Phase_Name.ToLower()))
                {
                    this.validobj.IsErrorAlertDuplicate = true;
                    this.validobj.IsTitle = messageDataObj.DuplicateTitle;
                    this.validobj.IsMassege = messageDataObj.DuplicateMessage;
                    return Ok(validobj);
                }
                mM_Audit_BuildPhase_Mstr.Inserted_Date = DateTime.Now;
                db.MM_Audit_BuildPhase_Mstr.Add(mM_Audit_BuildPhase_Mstr);
                db.SaveChanges();

                this.validobj.IsSuccessAlert = true;
                this.validobj.IsTitle = messageDataObj.SuccessTitle;
                this.validobj.IsMassege = messageDataObj.SuccessMessage;
            }
            catch (DbUpdateException dbe)
            {
                generalLogObj.addControllerException(dbe, "MM_Audit_BuildPhase_Mstr", "PostMM_Audit_BuildPhase_Mstr()", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = dbe.ToString();
                this.validobj.IsTitle = messageDataObj.SaveErrorTitle;

                return Ok(validobj);

            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Audit_BuildPhase_Mstr", "PostMM_Audit_BuildPhase_Mstr()", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(validobj);
        }

        // DELETE: api/MM_Audit_BuildPhase_Mstr/5
        //[ResponseType(typeof(MM_Audit_BuildPhase_Mstr))]
        [Route("api/MM_Audit_BuildPhase_Mstr/DeleteMM_BuildPhase_Master/{id}")]
        [HttpDelete]
        [ActionName("DeleteMM_BuildPhase_Master")]
        public IHttpActionResult DeleteMM_BuildPhase_Master(decimal id)
        {
            MM_Audit_BuildPhase_Mstr mM_Audit_BuildPhase_Mstr = db.MM_Audit_BuildPhase_Mstr.Find(id);
            if (mM_Audit_BuildPhase_Mstr == null)
            {
                this.validobj.IsErrorAlertNotFound = true;
                this.validobj.IsTitle = messageDataObj.RecordnotFoundTitle;
                this.validobj.IsMassege = messageDataObj.RecordNotFoundMessage;

                return Ok(validobj);
                //return NotFound();
            }
            try
            {
                db.MM_Audit_BuildPhase_Mstr.Remove(mM_Audit_BuildPhase_Mstr);
                db.SaveChanges();

                this.validobj.IsSuccessAlert = true;
                this.validobj.IsTitle = messageDataObj.DeletionTitle;
                this.validobj.IsMassege = messageDataObj.DeletionMessage;

            }
            catch (DbUpdateException dbe)
            {
                generalLogObj.addControllerException(dbe, "MM_Audit_BuildPhase_Mstr", "DeleteMM_BuildPhase_Master(" + id + ")", 1);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = messageDataObj.DeleteConflictMessage;
                this.validobj.IsTitle = messageDataObj.DeleteConflictTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Audit_BuildPhase_Mstr", "DeleteMM_BuildPhase_Master(" + id + ")", 1);
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

        private bool MM_Audit_BuildPhase_MstrExists(decimal id)
        {
            return db.MM_Audit_BuildPhase_Mstr.Count(e => e.Build_Phase_ID == id) > 0;
        }
    }
}