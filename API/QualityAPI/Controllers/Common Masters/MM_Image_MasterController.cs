using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using QualityAPI.Helper;
using QualityAPI.Models;

namespace QualityAPI.Controllers.EST
{
    public class MM_Image_MasterController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        ValidationModel validobj = new ValidationModel();
        private General generalLogObj = new General();

        // GET: api/MM_Image_Master
        public IQueryable<MM_Image_Master> GetMM_Image_Master()
        {
            return db.MM_Image_Master;
        }

        // GET: api/MM_Image_Master/5
        [ResponseType(typeof(MM_Image_Master))]
        public IHttpActionResult GetMM_Image_Master(decimal id)
        {
            try
            { 
            MM_Image_Master mM_Audit_Image_Mstr = db.MM_Image_Master.Find(id);
            if (mM_Audit_Image_Mstr == null)
            {
                return NotFound();
            }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = mM_Audit_Image_Mstr;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Image_Master", "GetMM_Image_Master(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        [Route("api/MM_Image_Master/AssignImage/{Shop_ID},{Model_ID},{Parameter_ID},{Location_ID}")]
        [HttpGet]
        [ActionName("AssignImage")]
        public IHttpActionResult AssignImage(int Shop_ID,int Model_ID,int Area_ID, int Part_ID)
        {
            var checkobj = (from c in db.MM_Image_Master
                            where c.Shop_ID == Shop_ID && c.Model_ID == Model_ID && c.Area_ID == Area_ID && c.Part_ID == Part_ID
                            select new
                            {
                                c.Image_ID,
                                c.Plant_ID,
                                c.Shop_ID,
                                c.Model_ID,
                                c.Area_ID,
                                c.Part_ID,
                                c.FileContent
                            }
                           ).ToList();
            return Ok(checkobj);

        }
        [Route("api/MM_Image_Master/ImageUpload")]
        [HttpPost]
        [ActionName("ImageUpload")]
        public IHttpActionResult ImageUpload()
        {
            decimal userid = 0;
            try
            {
                var httpRequest = HttpContext.Current.Request;
                HttpFileCollection uploadFiles = httpRequest.Files;
                var docfiles = new List<string>();
                HttpPostedFile postedFile = uploadFiles[0];
                MM_Image_Master obj = (MM_Image_Master)Newtonsoft.Json.JsonConvert.DeserializeObject(httpRequest.Params["imagemodel"], typeof(MM_Image_Master));
                userid = obj.Inserted_User_ID??0;
                if (db.MM_Image_Master.Any(i => i.Plant_ID == obj.Plant_ID && i.Shop_ID == obj.Shop_ID && i.Model_ID == obj.Model_ID && i.Area_ID == obj.Area_ID && i.Part_ID == obj.Part_ID && i.Audit_Type_Id == obj.Audit_Type_Id))
                {
                    this.validobj.IsErrorAlertDuplicate = true;
                    this.validobj.IsTitle = messageDataObj.DuplicateTitle;
                    this.validobj.IsMassege = messageDataObj.DuplicateMessage;
                    return Ok(validobj);
                }
                if (postedFile != null && postedFile.ContentLength > 0)
                {
                    using (var reader = new System.IO.BinaryReader(postedFile.InputStream))
                    {
                        obj.FileName = System.IO.Path.GetFileName(postedFile.FileName);
                        obj.FileType = Path.GetExtension(postedFile.FileName);
                        obj.ContentType = postedFile.ContentType;
                        obj.FileContent = reader.ReadBytes(postedFile.ContentLength);
                        obj.Inserted_Date = DateTime.Now;
                        obj.Plant_ID = obj.Plant_ID;
                        obj.Shop_ID = obj.Shop_ID;
                        obj.Model_ID = obj.Model_ID;
                        obj.Audit_Type_Id = obj.Audit_Type_Id;
                        obj.Area_ID = obj.Area_ID;
                        obj.Part_ID = obj.Part_ID;
                        db.MM_Image_Master.Add(obj);
                        db.SaveChanges();

                        this.validobj.IsSuccessAlert = true;
                        this.validobj.IsTitle = messageDataObj.SuccessTitle;
                        this.validobj.IsMassege = messageDataObj.SuccessMessage;
                    }
                }
            }
            catch (DbUpdateException dbe)
            {
                generalLogObj.addControllerException(dbe, "MM_Image_Master", "ImageUpload()", userid);
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
                generalLogObj.addControllerException(e, "MM_Image_Master", "ImageUpload()", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(validobj);
        }

        // PUT: api/MM_Image_Master/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutMM_Image_Master(decimal id, MM_Image_Master mM_Audit_Image_Mstr)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (id != mM_Audit_Image_Mstr.Image_ID)
            {
                return BadRequest();
            }
            db.Entry(mM_Audit_Image_Mstr).State = EntityState.Modified;
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!MM_Image_MasterExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            return StatusCode(HttpStatusCode.NoContent);
        }
        //====== Update Image=====
        [Route("api/MM_Image_Master/UpdateImage/{Image_ID}")]
        [HttpPost]
        [ActionName("UpdateImage")]
        public IHttpActionResult UpdateImage(decimal Image_ID)
        {
            decimal userid = 0;
            try
            {
                var httpRequest = HttpContext.Current.Request;
                HttpFileCollection uploadFiles = httpRequest.Files;
                var docfiles = new List<string>();
                HttpPostedFile postedFile = uploadFiles[0];
                MM_Image_Master obj = (MM_Image_Master)Newtonsoft.Json.JsonConvert.DeserializeObject(httpRequest.Params["imagemodel"], typeof(MM_Image_Master));
                userid = obj.Inserted_User_ID ?? 0;
                MM_Image_Master objSave = db.MM_Image_Master.Find(Image_ID);
                if (postedFile != null && postedFile.ContentLength > 0)
                {
                    using (var reader = new System.IO.BinaryReader(postedFile.InputStream))
                    {
                        objSave.FileName = System.IO.Path.GetFileName(postedFile.FileName);
                        objSave.FileType = Path.GetExtension(postedFile.FileName);
                        objSave.ContentType = postedFile.ContentType;
                        objSave.FileContent = reader.ReadBytes(postedFile.ContentLength);
                        objSave.Updated_Date = DateTime.Now;
                        objSave.Updated_User_ID = userid;
                        db.Entry(objSave).State = EntityState.Modified;
                        db.SaveChanges();
                        messageDataObj.isSuccessMessage = true;
                        messageDataObj.messageDetail = messageDataObj.UpdateTitle;
                        messageDataObj.messageTitle = messageDataObj.UploadMessage;
                    }
                }
            }
            catch (DbEntityValidationException ex)
            {
                foreach (var entityValidationErrors in ex.EntityValidationErrors)
                {
                    foreach (var validationError in entityValidationErrors.ValidationErrors)
                    {
                        var propertyName = validationError.PropertyName;
                        var errorMessage = validationError.ErrorMessage;

                        generalLogObj.addControllerException(ex, "MM_Model_MasterController", "PostMM_Model_Master()", userid);
                        messageDataObj.isErrorMessage = true;
                        messageDataObj.messageDetail = ex.ToString();
                        messageDataObj.messageTitle = "Update Data Error" + propertyName + "," + errorMessage;
                    }
                }
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Image_Master", "UpdateImage()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_Image_Master/EditImageData/{imageid}")]
        [HttpPut]
        [ActionName("EditImageData")]
        public IHttpActionResult EditImageData(int imageid, MM_Image_Master mM_Audit_Image_Mstr)
        {
            decimal userid = mM_Audit_Image_Mstr.Inserted_User_ID??0;
            try
            {
                if (db.MM_Image_Master.Any(i => i.Plant_ID == mM_Audit_Image_Mstr.Plant_ID && i.Shop_ID == mM_Audit_Image_Mstr.Shop_ID && i.Model_ID == mM_Audit_Image_Mstr.Model_ID && i.Area_ID == mM_Audit_Image_Mstr.Area_ID && i.Part_ID == mM_Audit_Image_Mstr.Part_ID && i.Audit_Type_Id == mM_Audit_Image_Mstr.Audit_Type_Id && i.Image_ID != imageid))
                {
                    this.validobj.IsErrorAlertDuplicate = true;
                    this.validobj.IsTitle = messageDataObj.DuplicateTitle;
                    this.validobj.IsMassege = messageDataObj.DuplicateMessage;
                    return Ok(validobj);
                }
                MM_Image_Master obj = db.MM_Image_Master.Find(imageid);
                obj.Plant_ID = mM_Audit_Image_Mstr.Plant_ID;
                obj.Shop_ID = mM_Audit_Image_Mstr.Shop_ID;
                obj.Model_ID = mM_Audit_Image_Mstr.Model_ID;
                obj.Area_ID = mM_Audit_Image_Mstr.Area_ID;
                obj.Part_ID = mM_Audit_Image_Mstr.Part_ID;
                obj.Audit_Type_Id = mM_Audit_Image_Mstr.Audit_Type_Id;
                obj.Is_Edited = true;
                obj.ImageName = mM_Audit_Image_Mstr.ImageName;
                db.Entry(obj).State = EntityState.Modified;
                db.SaveChanges();

                this.validobj.IsSuccessAlert = true;
                this.validobj.IsTitle = messageDataObj.UpdateTitle;
                this.validobj.IsMassege = messageDataObj.UpdateMessage;
            }
            catch (DbUpdateException dbe)
            {
                generalLogObj.addControllerException(dbe, "MM_Image_Master", "EditImageData", userid);
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
                generalLogObj.addControllerException(e, "MM_Image_Master", "EditImageData", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.UpdateErrorTitle;
            }
            return Ok(validobj);
        }
        [Route("api/MM_Image_Master/GetImageData/{plantid},{Audit_Type_Id},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetImageData")]
        public IHttpActionResult GetImageData(decimal plantid, decimal Audit_Type_Id, int Shop_ID, bool Is_AllShops)
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
            var imageobj = (from i in db.MM_Image_Master
                            join
                            p in db.MM_PartMaster
                            on i.Part_ID equals p.Part_ID
                            join plant in db.MM_Plant
                            on i.Plant_ID equals plant.Plant_ID
                            join l in db.MM_AreaMaster
                            on i.Area_ID equals l.Area_ID
                            join m in db.MM_Model
                            on i.Model_ID equals m.Model_ID
                            join s in db.MM_Shop
                            on i.Shop_ID equals s.Shop_ID
                            where i.Plant_ID == plantid && i.Audit_Type_Id == Audit_Type_Id
                            && Shop_ids.Contains(i.Shop_ID)
                            orderby i.Inserted_Date descending
                            select new
                            {
                                i.Image_ID,
                                i.FileContent,
                                plant.Plant_Name,
                                i.FileName,
                                i.ImageName,
                                plant.Plant_ID,
                                p.Part_ID,
                                p.Part_Name,
                                l.Area_ID,
                                l.Area_Name,
                                m.Model_ID,
                                m.Model_Name,
                                s.Shop_ID,
                                s.Shop_Name,
                                i.Audit_Type_Id,
                            }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = imageobj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Image_Master", "GetImageData(" + plantid + ", " + Shop_ID + ","+Audit_Type_Id+"," + Is_AllShops + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Image_Master/EditImage/{imageid}")]
        [HttpPut]
        [ActionName("EditImage")]
        public IHttpActionResult EditImage(int imageid)
        {
            string imageName = null;
            var httpRequest = HttpContext.Current.Request;
            HttpFileCollection uploadFiles = httpRequest.Files;
            var docfiles = new List<string>();
            int i;
            HttpPostedFile postedFile = uploadFiles[0];
            var obj1 = (from I in db.MM_Image_Master
                        where I.Image_ID == imageid
                        select I).ToList();
            if (obj1.Count > 0)
            {
                MM_Image_Master obj = db.MM_Image_Master.Find(obj1[0].Image_ID);

                if (postedFile != null && postedFile.ContentLength > 0)
                {
                    using (var reader = new System.IO.BinaryReader(postedFile.InputStream))
                    {
                        obj.FileName = System.IO.Path.GetFileName(postedFile.FileName);
                        obj.FileType = Path.GetExtension(postedFile.FileName);
                        obj.ContentType = postedFile.ContentType;
                        obj.FileContent = reader.ReadBytes(postedFile.ContentLength);
                        db.SaveChanges();
                    }
                }
            }

            return Ok();
        }
        [Route("api/MM_Image_Master/ModifiedData/{imageid}")]
        [HttpPut]
        [ActionName("ModifiedData")]
        public IHttpActionResult ModifiedData(int imageid, MM_Image_Master mM_Audit_Image_Mstr)
        {
            decimal userid = mM_Audit_Image_Mstr.Inserted_User_ID??0;
            try
            {
                if (db.MM_Image_Master.Any(i => i.Plant_ID == mM_Audit_Image_Mstr.Plant_ID && i.Shop_ID == mM_Audit_Image_Mstr.Shop_ID && i.Model_ID == mM_Audit_Image_Mstr.Model_ID && i.Part_ID == mM_Audit_Image_Mstr.Part_ID && i.Audit_Type_Id == mM_Audit_Image_Mstr.Audit_Type_Id && i.Image_ID != imageid))
                {
                    this.validobj.IsErrorAlertDuplicate = true;
                    this.validobj.IsTitle = messageDataObj.DuplicateTitle;
                    this.validobj.IsMassege = messageDataObj.DuplicateMessage;
                    return Ok(validobj);
                }
                MM_Image_Master obj = db.MM_Image_Master.Find(imageid);
                obj.Plant_ID = mM_Audit_Image_Mstr.Plant_ID;
                obj.Shop_ID = mM_Audit_Image_Mstr.Shop_ID;
                obj.Model_ID = mM_Audit_Image_Mstr.Model_ID;
                obj.Part_ID = mM_Audit_Image_Mstr.Part_ID;
                obj.Area_ID = mM_Audit_Image_Mstr.Area_ID;
                obj.Audit_Type_Id = mM_Audit_Image_Mstr.Audit_Type_Id;
                db.Entry(obj).State = EntityState.Modified;
                db.SaveChanges();

                this.validobj.IsSuccessAlert = true;
                this.validobj.IsTitle = messageDataObj.UpdateTitle;
                this.validobj.IsMassege = messageDataObj.UpdateMessage;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Image_Master", "ModifiedData("+imageid+")", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.UpdateErrorTitle;
            }
            return Ok(validobj);
        }
        [HttpPost]
        [Route("api/MM_Image_Master/UploadImage")]
        public HttpResponseMessage UploadImage()
        {
            string imageName = null;
            var httpRequest = HttpContext.Current.Request;
            HttpFileCollection uploadFiles = httpRequest.Files;
            var docfiles = new List<string>();
            HttpPostedFile postedFile = uploadFiles[0];
            MM_Image_Master obj = new MM_Image_Master();

            if (postedFile != null && postedFile.ContentLength > 0)
            {
                using (var reader = new System.IO.BinaryReader(postedFile.InputStream))
                {
                    obj.FileName = System.IO.Path.GetFileName(postedFile.FileName);
                    obj.FileType = Path.GetExtension(postedFile.FileName);
                    obj.ContentType = postedFile.ContentType;
                    obj.FileContent = reader.ReadBytes(postedFile.ContentLength);
                }

                db.MM_Image_Master.Add(obj);
                db.SaveChanges();
                //return Ok(obj);
            }

            return Request.CreateResponse(HttpStatusCode.Created);
        }

        // POST: api/MM_Image_Master
        [ResponseType(typeof(MM_Image_Master))]
        public IHttpActionResult PostMM_Image_Master(MM_Image_Master mM_Audit_Image_Mstr)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var obj1 = (from I in db.MM_Image_Master
                        where I.FileName == mM_Audit_Image_Mstr.FileName
                        select I).ToList();
            var obj2 = obj1.LastOrDefault();
            if (obj2 != null)
            {
                MM_Image_Master obj = db.MM_Image_Master.Find(obj2.Image_ID);
                obj.Plant_ID = mM_Audit_Image_Mstr.Plant_ID;
                obj.Shop_ID = mM_Audit_Image_Mstr.Shop_ID;
                obj.Model_ID = mM_Audit_Image_Mstr.Model_ID;
                obj.Part_ID = mM_Audit_Image_Mstr.Part_ID;
                obj.Area_ID = mM_Audit_Image_Mstr.Area_ID;
                obj.Audit_Type_Id = mM_Audit_Image_Mstr.Audit_Type_Id;
                db.Entry(obj).State = EntityState.Modified;
                db.SaveChanges();

                db.MM_Image_Master.Add(mM_Audit_Image_Mstr);
                db.SaveChanges();
            }
            return CreatedAtRoute("DefaultApi", new { id = mM_Audit_Image_Mstr.Image_ID }, mM_Audit_Image_Mstr);
        }
        // DELETE: api/MM_Image_Master/5
        [ResponseType(typeof(MM_Image_Master))]
        public IHttpActionResult DeleteMM_Image_Master(decimal id)
        {
            MM_Image_Master mM_Audit_Image_Mstr = db.MM_Image_Master.Find(id);
            if (mM_Audit_Image_Mstr == null)
            {
                this.validobj.IsErrorAlertNotFound = true;
                this.validobj.IsTitle = messageDataObj.RecordnotFoundTitle;
                this.validobj.IsMassege = messageDataObj.RecordNotFoundMessage;
                return Ok(validobj);
            }
            try
            {
                db.MM_Image_Master.Remove(mM_Audit_Image_Mstr);
                db.SaveChanges();
                this.validobj.IsSuccessAlert = true;
                this.validobj.IsTitle = messageDataObj.DeletionTitle;
                this.validobj.IsMassege = messageDataObj.DeletionMessage;
                return Ok(validobj);
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Image_Master", "DeleteMM_Image_Master(" + id + ")", 1);
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
        private bool MM_Image_MasterExists(decimal id)
        {
            return db.MM_Image_Master.Count(e => e.Image_ID == id) > 0;
        }
    }
}