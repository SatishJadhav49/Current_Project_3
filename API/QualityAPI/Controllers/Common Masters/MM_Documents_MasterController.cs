using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using QualityAPI.Helper;
using QualityAPI.Models;

namespace QualityAPI.Controllers.Common_Masters
{
    public class MM_Documents_MasterController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        ValidationModel validobj = new ValidationModel();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();


        [Route("api/MM_Documents_Master/DocumentUpload")]
        [HttpPost]
        [ActionName("DocumentUpload")]
        public IHttpActionResult DocumentUpload()
        {
            decimal userid = 0;
            try
            {
                var httpRequest = HttpContext.Current.Request;
                HttpFileCollection uploadFiles = httpRequest.Files;
                var docfiles = new List<string>();
                HttpPostedFile postedFile = uploadFiles[0];
                MM_Documents_Master obj = (MM_Documents_Master)Newtonsoft.Json.JsonConvert.DeserializeObject(httpRequest.Params["Documentmodel"], typeof(MM_Documents_Master));
                userid = obj.Inserted_User_ID ?? 0;

                if (postedFile != null && postedFile.ContentLength > 0)
                {
                    // Generate new file name
                    string newFileName = Guid.NewGuid().ToString() + Path.GetExtension(postedFile.FileName);
                    string filePath = HttpContext.Current.Server.MapPath("~/App_Data/Documents/" + newFileName);

                    // Save the file to the server
                    postedFile.SaveAs(filePath);

                    // Set properties
                    obj.Document_Path = newFileName; // Save the new file name in the database
                    obj.Document_Title = obj.Document_Title;
                    obj.Inserted_Date = DateTime.Now;
                    obj.Inserted_Host = obj.Inserted_Host;
                    obj.Inserted_User_ID = obj.Inserted_User_ID;
                    db.MM_Documents_Master.Add(obj);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                    messageDataObj.messageTitle = messageDataObj.SuccessTitle;
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
                        messageDataObj.messageDetail = ex.ToString() + propertyName + " - " + errorMessage;
                        messageDataObj.messageTitle = "Save Data Error";
                    }
                }
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Documents_Master", "DocumentUpload()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_Documents_Master/GetTableData")]
        [HttpGet]
        [ActionName("GetTableData")]
        public IHttpActionResult GetTableData()
        {
            try
            {
                var obj = (from item in db.MM_Documents_Master
                           join emp in db.MM_Employee on item.Inserted_User_ID equals emp.Employee_ID
                           orderby item.Inserted_Date descending
                           select new
                           {
                               item.Document_Title,
                               item.Document_ID,
                               item.Document_Path,
                               item.Inserted_User_ID,
                               item.Inserted_Date,
                               emp.Employee_Name
                           }).ToList();

                var DataList = obj.ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = DataList;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Documents_Master", "GetTableData()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Documents_Master/DeleteFile/{Document_ID}")]
        [HttpDelete]
        [ActionName("DeleteFile")]
        public IHttpActionResult DeleteFile(decimal Document_ID)
        {
            try
            {
                // Find the record in the database
                var fileRecord = db.MM_Documents_Master.FirstOrDefault(i => i.Document_ID == Document_ID);
                if (fileRecord == null)
                {
                    return Content(HttpStatusCode.NotFound, "Document not found");
                }

                // Define the  path
                string filePath = HttpContext.Current.Server.MapPath("~/App_Data/Documents/" + fileRecord.Document_Path);

                // Check if the  file exists and delete it
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }

                // Delete the record from the database
                db.MM_Documents_Master.Remove(fileRecord);
                db.SaveChanges();


                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                return Ok(messageDataObj);
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Documents_Master", "DeleteFile(" + Document_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(messageDataObj);
            }
        }

        [Route("api/MM_Documents_Master/DownloadDocument")]
        [HttpGet]
        public IHttpActionResult DownloadDocument(string fileName)
        {
            try
            {
                string filePath = HttpContext.Current.Server.MapPath("~/App_Data/Documents/" + fileName);
                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound();
                }

                byte[] fileBytes = System.IO.File.ReadAllBytes(filePath);
                var response = new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new ByteArrayContent(fileBytes)
                };
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
                {
                    FileName = fileName
                };
                response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");

                return ResponseMessage(response);
            }
            catch (Exception e)
            {
                return InternalServerError(e);
            }
        }
    }
}
