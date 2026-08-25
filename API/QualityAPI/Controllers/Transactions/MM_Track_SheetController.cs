using QualityAPI.Controllers;
using QualityAPI.Helper;
using QualityAPI.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Web.Http;
using System.Web.Http.Description;

namespace QualityAPI.Controllers.Transactions
{
    public class MM_Track_SheetController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        ValidationModel validobj = new ValidationModel();
        GlobalData messageDataObj = new GlobalData();
        GlobalOperations global = new GlobalOperations();
        private General generalLogObj = new General();
        // GET: MM_Track_Sheet
        public IQueryable<MM_Track_Sheet> GetMM_Track_Sheet()
        {
            return db.MM_Track_Sheet;
        }

        [Route("api/MM_Track_Sheet/GetData_By_VIN_Or_BIW/{VIN_No},{BIW},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetData_By_VIN_Or_BIW")]
        public IHttpActionResult GetData_By_VIN_Or_BIW(string VIN_No, string BIW, decimal Audit_Type_Id)
        {
            try
            {
                var obj = (from audit in db.MM_Vehicle_Audit
                           where (audit.VIN_No == VIN_No || audit.Body_No == BIW) && audit.Audit_Type_Id == Audit_Type_Id
                           select new
                           {
                               audit.Audit_ID,
                               audit.Audit_Date,
                               audit.Model_Name,
                               audit.Model_ID,
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
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "GetData_By_VIN_Or_BIW(" + VIN_No + ", " + BIW + "," + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

      

        [Route("api/MM_Track_Sheet/GetPartList/{Parameter_Id},{Area_Id},{Audit_Type_Id},{Audit_ID}")]
        [HttpGet]
        [ActionName("GetPartList")]
        public IHttpActionResult GetPartList(int Parameter_Id, int Area_Id, decimal Audit_Type_Id, decimal Audit_ID)
        {
            try
            {
                DateTime? CheckDate = DateTime.Now;
                if (Audit_ID != 0)
                {
                    CheckDate = db.MM_Vehicle_Audit
                           .Where(a => a.Audit_ID == Audit_ID)
                           .Select(a => (DateTime?)a.Audit_Date).
                     FirstOrDefault()?.Date ?? DateTime.Now.Date;
                }
                if (Parameter_Id == 1)
                {
                    var partList = (
                                        from part in db.MM_PartMaster
                                        where part.Audit_Type_Id == Audit_Type_Id && part.Area_ID == Area_Id &&
                                            db.MM_CheckpointMaster
                                                .Any(checkpoint =>
                                                    checkpoint.Part_ID == part.Part_ID &&
                                                    checkpoint.Audit_Type_Id == Audit_Type_Id &&
                                                    checkpoint.Is_Active == true && checkpoint.Inserted_Date.HasValue
                                 && DbFunctions.TruncateTime(checkpoint.Inserted_Date.Value) <= DbFunctions.TruncateTime(CheckDate) &&
                                                    checkpoint.Is_Gap == true &&
                                                    Parameter_Id == 1 &&
                                                    db.MM_LocationMaster
                                                        .Where(location =>
                                                            location.Checkpoint_ID == checkpoint.Checkpoint_ID && location.Is_Gap == true && location.Is_Active == true && location.Inserted_Date.HasValue
                                 && DbFunctions.TruncateTime(location.Inserted_Date.Value) <= DbFunctions.TruncateTime(CheckDate) 
                                                        )
                                                        .Any(location =>
                                                            !db.MM_Track_Sheet.Any(trackSheet =>
                                                                trackSheet.Audit_ID == Audit_ID &&
                                                                trackSheet.Parameter_ID == Parameter_Id &&
                                                                trackSheet.Location_ID == location.Location_ID
                                                            )
                                                        )
                                                )
                                        select new
                                        {
                                            part.Part_ID,
                                            part.Part_Name,
                                            part.SORTORDER
                                        }
                                    ).Distinct().ToList().OrderBy(part => part.SORTORDER);

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.isErrorMessage = false;
                    var dataList = partList;
                    return Ok(new { messageDataObj, dataList });
                }
                else
                {
                    var partList = (
                                        from part in db.MM_PartMaster
                                        where part.Audit_Type_Id == Audit_Type_Id && part.Area_ID == Area_Id &&
                                            db.MM_CheckpointMaster
                                                .Any(checkpoint =>
                                                    checkpoint.Part_ID == part.Part_ID &&
                                                    checkpoint.Audit_Type_Id == Audit_Type_Id &&
                                                    checkpoint.Is_Active == true && checkpoint.Inserted_Date.HasValue
                                 && DbFunctions.TruncateTime(checkpoint.Inserted_Date.Value) <= DbFunctions.TruncateTime(CheckDate) &&
                                                    checkpoint.Is_Flushness == true &&
                                                    Parameter_Id == 2 &&
                                                    db.MM_LocationMaster
                                                        .Where(location =>
                                                            location.Checkpoint_ID == checkpoint.Checkpoint_ID && location.Is_Flushness == true && location.Is_Active == true && location.Inserted_Date.HasValue
                                 && DbFunctions.TruncateTime(location.Inserted_Date.Value) <= DbFunctions.TruncateTime(CheckDate)
                                                        )
                                                        .Any(location =>
                                                            !db.MM_Track_Sheet.Any(trackSheet =>
                                                                trackSheet.Audit_ID == Audit_ID &&
                                                                trackSheet.Parameter_ID == Parameter_Id &&
                                                                trackSheet.Location_ID == location.Location_ID
                                                            )
                                                        )
                                                )
                                        select new
                                        {
                                            part.Part_ID,
                                            part.Part_Name,
                                            part.SORTORDER
                                        }
                                    ).Distinct().ToList().OrderBy(part => part.SORTORDER);
                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.isErrorMessage = false;
                    var dataList = partList;
                    return Ok(new { messageDataObj, dataList });
                }
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "GetPartList(" + Parameter_Id + ", " + Area_Id + "," + Audit_Type_Id + "," + Audit_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Track_Sheet/GetAreaList/{Model_ID},{Audit_Type_Id},{Audit_ID}")]
        [HttpGet]
        [ActionName("GetAreaList")]
        public IHttpActionResult GetAreaList(int Model_ID, decimal Audit_Type_Id, decimal Audit_ID)
        {
            try
            {
                DateTime CheckDate = DateTime.Now;
                if (Audit_ID != 0)
                {
                    CheckDate = db.MM_Vehicle_Audit
                               .Where(a => a.Audit_ID == Audit_ID)
                               .Select(a => (DateTime?)a.Audit_Date)
                               .FirstOrDefault()?.Date ?? DateTime.Now.Date;
                }

                var obj = (from area in db.MM_AreaMaster
                           where area.Model_ID == Model_ID
                                 && area.Audit_Type_Id == Audit_Type_Id
                                 && area.Is_Active == true
                                 && area.Inserted_Date.HasValue
                                 && DbFunctions.TruncateTime(area.Inserted_Date.Value) <= DbFunctions.TruncateTime(CheckDate)
                          
                           select new
                           {
                               area.Area_ID,
                               area.Area_Name,
                               area.Area_Desc,
                               area.Model_ID,
                               area.Shop_ID,
                               area.Plant_ID,
                               area.SORTORDER
                           }).ToList().OrderBy(a=>a.SORTORDER);

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
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "GetAreaList(" + Model_ID + ", " + Audit_Type_Id + "," + Audit_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        [Route("api/MM_Track_Sheet/GetCheckPointList/{Parameter_Id},{Part_ID},{Audit_Type_Id},{Audit_ID}")]
        [HttpGet]
        [ActionName("GetCheckPointList")]
        public IHttpActionResult GetCheckPointList(int Parameter_Id, int Part_ID, decimal Audit_Type_Id, decimal Audit_ID)
        {
            try
            {
                DateTime? CheckDate = DateTime.Now;
                if (Audit_ID != 0)
                {
                    CheckDate = db.MM_Vehicle_Audit
                           .Where(a => a.Audit_ID == Audit_ID)
                           .Select(a => (DateTime?)a.Audit_Date).
                         FirstOrDefault()?.Date ?? DateTime.Now.Date;
                }
                if (Parameter_Id == 1)
                {
                    var checkpointList = (
                        from checkpoint in db.MM_CheckpointMaster
                        where (Parameter_Id == 1 && checkpoint.Is_Gap == true)
                        && checkpoint.Part_ID == Part_ID
                        && checkpoint.Audit_Type_Id == Audit_Type_Id
                        && checkpoint.Is_Active == true
                         && checkpoint.Inserted_Date.HasValue
                                 && DbFunctions.TruncateTime(checkpoint.Inserted_Date.Value) <= DbFunctions.TruncateTime(CheckDate)
                        && !db.MM_LocationMaster
                    .Where(cl => cl.Checkpoint_ID == checkpoint.Checkpoint_ID && cl.Is_Gap == true)
                    .All(cl =>
                        db.MM_Track_Sheet.Any(trackSheet =>
                            trackSheet.Audit_ID == Audit_ID &&
                            trackSheet.Parameter_ID == Parameter_Id &&
                            trackSheet.Location_ID == cl.Location_ID
                        )
                    )
                        select new
                        {
                            checkpoint.Checkpoint_ID,
                            checkpoint.Checkpoint_Name,
                            checkpoint.Parallelism,
                            checkpoint.SORTORDER
                        }
                    ).ToList().OrderBy(a => a.SORTORDER);

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.isErrorMessage = false;
                    var dataList = checkpointList;
                    return Ok(new { messageDataObj, dataList });
                }
                else
                {
                    var checkpointList = (
                        from checkpoint in db.MM_CheckpointMaster
                        where (Parameter_Id == 2 && checkpoint.Is_Flushness == true)
                        && checkpoint.Part_ID == Part_ID
                        && checkpoint.Audit_Type_Id == Audit_Type_Id
                        && checkpoint.Is_Active == true
                        && checkpoint.Inserted_Date.HasValue
                                 && DbFunctions.TruncateTime(checkpoint.Inserted_Date.Value) <= DbFunctions.TruncateTime(CheckDate)
                        && !db.MM_LocationMaster
                    .Where(cl => cl.Checkpoint_ID == checkpoint.Checkpoint_ID && cl.Is_Flushness == true)
                    .All(cl =>
                        db.MM_Track_Sheet.Any(trackSheet =>
                            trackSheet.Audit_ID == Audit_ID &&
                            trackSheet.Parameter_ID == Parameter_Id &&
                            trackSheet.Location_ID == cl.Location_ID
                        )
                    )
                        select new
                        {
                            checkpoint.Checkpoint_ID,
                            checkpoint.Checkpoint_Name,
                            checkpoint.Parallelism,
                            checkpoint.SORTORDER
                        }
                    ).ToList().OrderBy(a => a.SORTORDER);

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.isErrorMessage = false;
                    var dataList = checkpointList;
                    return Ok(new { messageDataObj, dataList });
                }
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "GetCheckPointList(" + Parameter_Id + ", " + Part_ID + "," + Audit_Type_Id + "," + Audit_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Track_Sheet/GetLocationList/{Parameter_Id},{Checkpoint_ID},{Audit_Type_Id},{Audit_ID}")]
        [HttpGet]
        [ActionName("GetLocationList")]
        public IHttpActionResult GetLocationList(int Parameter_Id, int Checkpoint_ID, decimal Audit_Type_Id, decimal Audit_ID)
        {
            try
            {
                DateTime? CheckDate = DateTime.Now;
                if (Audit_ID != 0)
                {
                    CheckDate = db.MM_Vehicle_Audit
                           .Where(a => a.Audit_ID == Audit_ID)
                           .Select(a => (DateTime?)a.Audit_Date)
                           .FirstOrDefault()?.Date ?? DateTime.Now.Date;
                }

                if (Parameter_Id == 1)
                {
                    var excludedLocationIds =
                            from tsd in db.MM_Track_Sheet
                            where tsd.Parameter_ID == 1 && tsd.Checkpoint_ID == Checkpoint_ID && tsd.Audit_Type_Id == Audit_Type_Id && tsd.Audit_ID == Audit_ID
                            select tsd.Location_ID;

                    var result =
                        (from lm in db.MM_LocationMaster
                         where lm.Is_Gap == true && lm.Checkpoint_ID == Checkpoint_ID && lm.Audit_Type_Id == Audit_Type_Id && lm.Is_Active == true && lm.Inserted_Date.HasValue
&& DbFunctions.TruncateTime(lm.Inserted_Date.Value) <= DbFunctions.TruncateTime(CheckDate) && !excludedLocationIds.Contains(lm.Location_ID)
                         select new
                         {
                             lm.Location_ID,
                             lm.Location_Name,
                             lm.SORTORDER
                         }).ToList().OrderBy(l=>l.SORTORDER);

                    var list = result.ToList();
                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.isErrorMessage = false;
                    var dataList = list;
                    return Ok(new { messageDataObj, dataList });
                }
                else
                {
                    var excludedLocationIds =
                            from tsd in db.MM_Track_Sheet
                            where tsd.Parameter_ID == 2 && tsd.Checkpoint_ID == Checkpoint_ID && tsd.Audit_Type_Id == Audit_Type_Id && tsd.Audit_ID == Audit_ID
                            select tsd.Location_ID;

                    var result =
                        (from lm in db.MM_LocationMaster
                         where lm.Is_Flushness == true && lm.Checkpoint_ID == Checkpoint_ID && lm.Audit_Type_Id == Audit_Type_Id && lm.Is_Active == true && lm.Inserted_Date.HasValue
&& DbFunctions.TruncateTime(lm.Inserted_Date.Value) <= DbFunctions.TruncateTime(CheckDate) && !excludedLocationIds.Contains(lm.Location_ID)
                         orderby lm.SORTORDER
                         select new
                         {
                             lm.Location_ID,
                             lm.Location_Name,
                             lm.SORTORDER
                         }).ToList().OrderBy(l => l.SORTORDER);

                    var list = result.ToList();
                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.isErrorMessage = false;
                    var dataList = list;
                    return Ok(new { messageDataObj, dataList });
                }
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "GetLocationList(" + Parameter_Id + ", " + Checkpoint_ID + "," + Audit_Type_Id + "," + Audit_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Track_Sheet/GetSpecificationList/{Parameter_Id},{Location_ID},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetSpecificationList")]
        public IHttpActionResult GetSpecificationList(int Parameter_Id, int Location_ID, decimal Audit_Type_Id)
        {
            try
            {
                if (Parameter_Id == 1)
                {
                    var obj = (from spec in db.MM_SpecificationMaster
                               where spec.Is_Gap == true && spec.Location_ID == Location_ID && spec.Audit_Type_Id == Audit_Type_Id && spec.Is_Active == true
                               orderby spec.Specification_ID descending
                               select new
                               {
                                   spec.Specification_ID,
                                   spec.Specification_Name,
                                   spec.MinVal,
                                   spec.MaxVal,
                               }).Take(1).ToList();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.isErrorMessage = false;
                    var dataList = obj;
                    return Ok(new { messageDataObj, dataList });
                }
                else
                {
                    var obj = (from spec in db.MM_SpecificationMaster
                               where spec.Is_Flushness == true && spec.Location_ID == Location_ID && spec.Audit_Type_Id == Audit_Type_Id && spec.Is_Active == true
                               orderby spec.Specification_ID descending
                               select new
                               {
                                   spec.Specification_ID,
                                   spec.Specification_Name,
                                   spec.MinVal,
                                   spec.MaxVal,
                               }).Take(1).ToList();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.isErrorMessage = false;
                    var dataList = obj;
                    return Ok(new { messageDataObj, dataList });
                }
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "GetSpecificationList(" + Parameter_Id + ", " + Location_ID + "," + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Track_Sheet/GetPartWiseImage/{Part_ID},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetPartWiseImage")]
        public IHttpActionResult GetPartWiseImage(int Part_ID, decimal Audit_Type_Id)
        {
            try
            {
                var obj = (from img in db.MM_Image_Master
                           where img.Part_ID == Part_ID && img.Audit_Type_Id == Audit_Type_Id
                           select new
                           {
                               img.Image_ID,
                               img.ImageName,
                               img.FileContent,
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
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "GetPartWiseImage(" + Part_ID + ", " + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Track_Sheet/GetTrackSheetData/{Plant_ID},{Audit_ID},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetTrackSheetData")]
        public IHttpActionResult GetTrackSheetData(int Plant_ID, int Audit_ID, int Audit_Type_Id)
        {
            try
            {
                var obj = (from trsheet in db.MM_Track_Sheet
                           join parameter in db.MM_Gap_And_FlushMaster on trsheet.Parameter_ID equals parameter.ID
                           join area in db.MM_AreaMaster on trsheet.Area_ID equals area.Area_ID
                           join part in db.MM_PartMaster on trsheet.Part_ID equals part.Part_ID
                           join checkpoint in db.MM_CheckpointMaster on trsheet.Checkpoint_ID equals checkpoint.Checkpoint_ID
                           join location in db.MM_LocationMaster on trsheet.Location_ID equals location.Location_ID
                           join spec in db.MM_SpecificationMaster on trsheet.Specification_ID equals spec.Specification_ID
                           join img in db.MM_Image_Master
                           on trsheet.Image_ID equals img.Image_ID into imagegroup
                           from img in imagegroup.DefaultIfEmpty()
                           where trsheet.Audit_ID == Audit_ID && trsheet.Audit_Type_Id == Audit_Type_Id && trsheet.Plant_ID == Plant_ID
                           orderby trsheet.Inserted_Date descending
                           select new
                           {
                               trsheet.Track_Sheet_ID,
                               trsheet.Audit_ID,
                               parameter.ID,
                               parameter.Type,
                               area.Area_ID,
                               area.Area_Name,
                               part.Part_ID,
                               part.Part_Name,
                               checkpoint.Checkpoint_ID,
                               checkpoint.Checkpoint_Name,
                               checkpoint.Parallelism,
                               location.Location_ID,
                               location.Location_Name,
                               spec.Specification_ID,
                               spec.Specification_Name,
                               spec.MinVal,
                               spec.MaxVal,
                               trsheet.Image_ID,
                               FileContent = (img == null) ? null : img.FileContent,
                               trsheet.Reading,
                               trsheet.Remark,
                               trsheet.Is_NA,
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
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "GetTrackSheetData(" + Plant_ID + ", " + Audit_ID + "," + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Track_Sheet/GetTrackSheetData_ForEdit/{Plant_ID},{Track_Sheet_ID},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetTrackSheetData_ForEdit")]
        public IHttpActionResult GetTrackSheetData_ForEdit(int Plant_ID, int Track_Sheet_ID, int Audit_Type_Id)
        {
            try
            {
                var obj = (from trsheet in db.MM_Track_Sheet
                           join parameter in db.MM_Gap_And_FlushMaster on trsheet.Parameter_ID equals parameter.ID
                           join area in db.MM_AreaMaster on trsheet.Area_ID equals area.Area_ID
                           join part in db.MM_PartMaster on trsheet.Part_ID equals part.Part_ID
                           join checkpoint in db.MM_CheckpointMaster on trsheet.Checkpoint_ID equals checkpoint.Checkpoint_ID
                           join location in db.MM_LocationMaster on trsheet.Location_ID equals location.Location_ID
                           join spec in db.MM_SpecificationMaster on trsheet.Specification_ID equals spec.Specification_ID
                           join img in db.MM_Image_Master on trsheet.Image_ID equals img.Image_ID
                           where trsheet.Track_Sheet_ID == Track_Sheet_ID && trsheet.Audit_Type_Id == Audit_Type_Id && trsheet.Plant_ID == Plant_ID
                           select new
                           {
                               trsheet.Track_Sheet_ID,
                               trsheet.Audit_ID,
                               parameter.ID,
                               parameter.Type,
                               area.Area_ID,
                               area.Area_Name,
                               part.Part_ID,
                               part.Part_Name,
                               checkpoint.Checkpoint_ID,
                               checkpoint.Checkpoint_Name,
                               checkpoint.Parallelism,
                               location.Location_ID,
                               location.Location_Name,
                               spec.Specification_ID,
                               spec.Specification_Name,
                               spec.MinVal,
                               spec.MaxVal,
                               img.Image_ID,
                               img.FileContent,
                               trsheet.Reading,
                               trsheet.Remark,
                               trsheet.Is_NA,
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
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "GetTrackSheetData_ForEdit(" + Plant_ID + ", " + Track_Sheet_ID + "," + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Track_Sheet/SaveTrackSheet")]
        [HttpPost]
        [ActionName("SaveTrackSheet")]
        public IHttpActionResult SaveTrackSheet(TrackSheetData mM_Track_Sheet)
        {
            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                userid = Convert.ToDecimal(mM_Track_Sheet.Inserted_User_ID);
                if (db.MM_Track_Sheet.Any(m => m.Parameter_ID == mM_Track_Sheet.Parameter_ID && m.Area_ID == mM_Track_Sheet.Area_ID && m.Audit_ID == mM_Track_Sheet.Audit_ID && m.Part_ID == mM_Track_Sheet.Part_ID && m.Checkpoint_ID == mM_Track_Sheet.Checkpoint_ID && m.Location_ID == mM_Track_Sheet.Location_ID && m.Specification_ID == mM_Track_Sheet.Specification_ID && m.Audit_Type_Id == mM_Track_Sheet.Audit_Type_Id))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }

                MM_Track_Sheet obj = new MM_Track_Sheet();

                obj.Audit_ID = mM_Track_Sheet.Audit_ID;
                obj.Parameter_ID = mM_Track_Sheet.Parameter_ID;
                obj.Area_ID = mM_Track_Sheet.Area_ID;
                obj.Part_ID = mM_Track_Sheet.Part_ID;
                obj.Checkpoint_ID = mM_Track_Sheet.Checkpoint_ID;
                obj.Location_ID = mM_Track_Sheet.Location_ID;
                obj.Specification_ID = mM_Track_Sheet.Specification_ID;
                obj.Image_ID = mM_Track_Sheet.Image_ID;
                obj.Reading = mM_Track_Sheet.Reading;
                obj.Remark = mM_Track_Sheet.Remark;
                obj.Plant_ID = mM_Track_Sheet.Plant_ID;
                obj.Shop_ID = mM_Track_Sheet.Shop_ID;
                obj.Plant_Code = mM_Track_Sheet.Plant_Code;
                obj.Audit_Type_Id = mM_Track_Sheet.Audit_Type_Id;
                obj.Inserted_Host = mM_Track_Sheet.Inserted_Host;
                obj.Inserted_User_ID = mM_Track_Sheet.Inserted_User_ID;
                obj.Inserted_Date = DateTime.Now;
                db.MM_Track_Sheet.Add(obj);
                db.SaveChanges();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                //var obj2 = db.MM_Vehicle_Audit.Where(p => p.Audit_ID == mM_Track_Sheet.Audit_ID).ToList();
                //foreach (var entity in obj2)
                //{
                //    if (mM_Track_Sheet.Parameter_ID == 1)
                //    {
                //        entity.Gap_PIST = mM_Track_Sheet.Gap_PIST;
                //        entity.Gap_Total_Check = mM_Track_Sheet.Gap_Total_Check;
                //        entity.Gap_Ok = mM_Track_Sheet.Gap_Ok;
                //        entity.Gap_Nok = mM_Track_Sheet.Gap_Nok;
                //        entity.Gap_NA = mM_Track_Sheet.Gap_NA;
                //        entity.Total_PIST = mM_Track_Sheet.Total_PIST;
                //        db.SaveChanges();
                //    }
                //    else if (mM_Track_Sheet.Parameter_ID == 2)
                //    {
                //        entity.Flush_PIST = mM_Track_Sheet.Flush_PIST;
                //        entity.Flush_Total_Check = mM_Track_Sheet.Flush_Total_Check;
                //        entity.Flush_Ok = mM_Track_Sheet.Flush_Ok;
                //        entity.Flush_Nok = mM_Track_Sheet.Flush_Nok;
                //        entity.Flush_NA = mM_Track_Sheet.Flush_NA;
                //        entity.Total_PIST = mM_Track_Sheet.Total_PIST;
                //        db.SaveChanges();
                //    }
                //}
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "SaveTrackSheet()", userid);
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
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "SaveTrackSheet()", userid);
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

        [Route("api/MM_Track_Sheet/EditTrackSheet/{Track_Sheet_ID}")]
        [HttpPut]
        [ActionName("EditTrackSheet")]
        public IHttpActionResult EditTrackSheet(decimal Track_Sheet_ID, TrackSheetData mM_Track_Sheet)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = Convert.ToDecimal(mM_Track_Sheet.Updated_User_ID);
            try
            {
                if (db.MM_Track_Sheet.Any(m => m.Track_Sheet_ID != mM_Track_Sheet.Track_Sheet_ID && m.Parameter_ID == mM_Track_Sheet.Parameter_ID && m.Area_ID == mM_Track_Sheet.Area_ID && m.Audit_ID == mM_Track_Sheet.Audit_ID && m.Part_ID == mM_Track_Sheet.Part_ID && m.Checkpoint_ID == mM_Track_Sheet.Checkpoint_ID && m.Location_ID == mM_Track_Sheet.Location_ID && m.Specification_ID == mM_Track_Sheet.Specification_ID && m.Audit_Type_Id == mM_Track_Sheet.Audit_Type_Id))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                MM_Track_Sheet obj = db.MM_Track_Sheet.Where(p => p.Track_Sheet_ID == Track_Sheet_ID).FirstOrDefault();
                if (obj != null)
                {
                    obj.Reading = mM_Track_Sheet.Reading;
                    obj.Remark = mM_Track_Sheet.Remark;
                    obj.Is_Edited = true;
                    obj.Updated_Host = mM_Track_Sheet.Updated_Host;
                    obj.Updated_User_ID = mM_Track_Sheet.Updated_User_ID;
                    obj.Updated_Date = DateTime.Now;
                    db.Entry(obj).State = EntityState.Modified;
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.UpdateMessage;
                    messageDataObj.messageTitle = messageDataObj.UpdateTitle;
                }

                //var obj2 = db.MM_Vehicle_Audit.Where(p => p.Audit_ID == mM_Track_Sheet.Audit_ID).ToList();
                //foreach (var entity in obj2)
                //{
                //    if (mM_Track_Sheet.Parameter_ID == 1)
                //    {
                //        entity.Gap_PIST = mM_Track_Sheet.Gap_PIST;
                //        entity.Gap_Total_Check = mM_Track_Sheet.Gap_Total_Check;
                //        entity.Gap_Ok = mM_Track_Sheet.Gap_Ok;
                //        entity.Gap_Nok = mM_Track_Sheet.Gap_Nok;
                //        entity.Gap_NA = mM_Track_Sheet.Gap_NA;
                //        entity.Total_PIST = mM_Track_Sheet.Total_PIST;
                //        db.SaveChanges();
                //    }
                //    else if (mM_Track_Sheet.Parameter_ID == 2)
                //    {
                //        entity.Flush_PIST = mM_Track_Sheet.Flush_PIST;
                //        entity.Flush_Total_Check = mM_Track_Sheet.Flush_Total_Check;
                //        entity.Flush_Ok = mM_Track_Sheet.Flush_Ok;
                //        entity.Flush_Nok = mM_Track_Sheet.Flush_Nok;
                //        entity.Flush_NA = mM_Track_Sheet.Flush_NA;
                //        entity.Total_PIST = mM_Track_Sheet.Total_PIST;
                //        db.SaveChanges();
                //    }
                //}
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e.InnerException, "MM_Track_Sheet", "EditTrackSheet()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e.InnerException, "MM_Track_Sheet", "EditTrackSheet()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_Track_Sheet/DeleteData/{Track_Sheet_ID}")]
        [HttpDelete]
        [ActionName("DeleteData")]
        public IHttpActionResult DeleteData(decimal Track_Sheet_ID)
        {
            MM_Track_Sheet mM_Track_Sheet = db.MM_Track_Sheet.Find(Track_Sheet_ID);
            if (mM_Track_Sheet == null)
            {
                return NotFound();
            }
            else
            {
                try
                {
                    db.MM_Track_Sheet.Remove(mM_Track_Sheet);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                    messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                }
                catch (DbUpdateException dbe)
                {
                    generalLogObj.addControllerException(dbe, "MM_Track_Sheet", "DeleteData(" + Track_Sheet_ID + ")", 1);
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
                    generalLogObj.addControllerException(e, "MM_Track_Sheet", "DeleteData(" + Track_Sheet_ID + ")", 1);
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.DeletionErrorTitle;
                    messageDataObj.isErrorMessage = true;
                }
                return Ok(messageDataObj);
            }
        }

        [Route("api/MM_Track_Sheet/UpdateNAData")]
        [HttpPost]
        [ActionName("UpdateNAData")]
        public IHttpActionResult UpdateNAData(TrackSheetData mM_Track_Sheet)
        {
            try
            {
                if (db.MM_Track_Sheet.Any(m => m.Parameter_ID == mM_Track_Sheet.Parameter_ID && m.Area_ID == mM_Track_Sheet.Area_ID && m.Audit_ID == mM_Track_Sheet.Audit_ID && m.Part_ID == mM_Track_Sheet.Part_ID && m.Checkpoint_ID == mM_Track_Sheet.Checkpoint_ID && m.Location_ID == mM_Track_Sheet.Location_ID && m.Is_NA == true && m.Audit_Type_Id == mM_Track_Sheet.Audit_Type_Id))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;
                    return Ok(messageDataObj);
                }

                MM_Track_Sheet obj = new MM_Track_Sheet();

                obj.Audit_ID = mM_Track_Sheet.Audit_ID;
                obj.Parameter_ID = mM_Track_Sheet.Parameter_ID;
                obj.Area_ID = mM_Track_Sheet.Area_ID;
                obj.Part_ID = mM_Track_Sheet.Part_ID;
                obj.Checkpoint_ID = mM_Track_Sheet.Checkpoint_ID;
                obj.Location_ID = mM_Track_Sheet.Location_ID;
                obj.Specification_ID = mM_Track_Sheet.Specification_ID;
                obj.Image_ID = mM_Track_Sheet.Image_ID;
                obj.Remark = "NA";
                obj.Is_NA = true;
                obj.Is_Edited = true;
                obj.Plant_ID = mM_Track_Sheet.Plant_ID;
                obj.Plant_Code = mM_Track_Sheet.Plant_Code;
                obj.Shop_ID = mM_Track_Sheet.Shop_ID;
                obj.Audit_Type_Id = mM_Track_Sheet.Audit_Type_Id;
                obj.Inserted_Host = mM_Track_Sheet.Inserted_Host;
                obj.Inserted_User_ID = mM_Track_Sheet.Inserted_User_ID;
                obj.Inserted_Date = DateTime.Now;

                db.MM_Track_Sheet.Add(obj);
                db.SaveChanges();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                //var obj2 = db.MM_Vehicle_Audit.Where(p => p.Audit_ID == mM_Track_Sheet.Audit_ID).ToList();
                //foreach (var entity in obj2)
                //{
                //    if (mM_Track_Sheet.Parameter_ID == 1)
                //    {
                //        entity.Gap_PIST = mM_Track_Sheet.Gap_PIST;
                //        entity.Gap_Total_Check = mM_Track_Sheet.Gap_Total_Check;
                //        entity.Gap_Ok = mM_Track_Sheet.Gap_Ok;
                //        entity.Gap_Nok = mM_Track_Sheet.Gap_Nok;
                //        entity.Gap_NA = mM_Track_Sheet.Gap_NA;
                //        entity.Total_PIST = mM_Track_Sheet.Total_PIST;
                //        db.SaveChanges();
                //    }
                //    else if (mM_Track_Sheet.Parameter_ID == 2)
                //    {
                //        entity.Flush_PIST = mM_Track_Sheet.Flush_PIST;
                //        entity.Flush_Total_Check = mM_Track_Sheet.Flush_Total_Check;
                //        entity.Flush_Ok = mM_Track_Sheet.Flush_Ok;
                //        entity.Flush_Nok = mM_Track_Sheet.Flush_Nok;
                //        entity.Flush_NA = mM_Track_Sheet.Flush_NA;
                //        entity.Total_PIST = mM_Track_Sheet.Total_PIST;
                //        db.SaveChanges();
                //    }
                //}
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "UpdateNAData()", 1);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "UpdateNAData()", 1);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_Track_Sheet/UpdateCalculation/{Audit_ID}")]
        [HttpPut]
        [ActionName("UpdateCalculation")]
        public IHttpActionResult UpdateCalculation(decimal Audit_ID, TrackSheetData mM_Track_Sheet)
        {

            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                userid = Convert.ToDecimal(mM_Track_Sheet.Inserted_User_ID);

                var obj2 = db.MM_Vehicle_Audit.Where(p => p.Audit_ID == Audit_ID).ToList();
                foreach (var entity in obj2)
                {
                    entity.Flush_PIST = mM_Track_Sheet.Flush_PIST;
                    entity.Flush_Total_Check = mM_Track_Sheet.Flush_Total_Check;
                    entity.Flush_Ok = mM_Track_Sheet.Flush_Ok;
                    entity.Flush_Nok = mM_Track_Sheet.Flush_Nok;
                    entity.Flush_NA = mM_Track_Sheet.Flush_NA;
                    entity.Total_PIST = mM_Track_Sheet.Total_PIST;
                    entity.Gap_PIST = mM_Track_Sheet.Gap_PIST;
                    entity.Gap_Total_Check = mM_Track_Sheet.Gap_Total_Check;
                    entity.Gap_Ok = mM_Track_Sheet.Gap_Ok;
                    entity.Gap_Nok = mM_Track_Sheet.Gap_Nok;
                    entity.Gap_NA = mM_Track_Sheet.Gap_NA;
                    entity.Is_Edited = true;
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                    messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                }
            }

            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "UpdateCalculation()", userid);
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
                generalLogObj.addControllerException(e, "MM_Track_Sheet", "UpdateCalculation()", userid);
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
        [Route("api/Track_SheetController/SendAuditSubmissionEmail")]
        [HttpPost]
        [ActionName("SendAuditSubmissionEmail")]
        public bool SendAuditSubmissionEmail(AuditSubmission submission)
        {
            try
            {
                var manager = db.MM_Employee.Where(a => a.Employee_ID == submission.Manager_ID).FirstOrDefault();
                string subject = $" {submission.Audit_Type} Audit Submission for {submission.Model_Name} by {submission.Employee_Name}";
                string body = "";

                // Determine the message content based on the submission status
                if (submission.Status == 1)
                {
                    var Audit_ID = db.MM_Vehicle_Audit.Where(a => a.Audit_Plan_Log_ID == submission.Plan_Log_ID).Select(p => p.Audit_ID).FirstOrDefault();
                    var ReportUrl = "";
                    switch (submission.Plant_Code)
                    {
                        case "A003":
                            if (submission.Audit_Type == "DIMENSION")
                            {
                                ReportUrl = "'http://mmnsk1drsv/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK&Plant_ID=" + submission.Plant_ID + "&Audit_ID=" + Audit_ID + "'";
                            }
                            else
                            {
                                ReportUrl = "'http://mmnsk1drsv/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK&Plant_ID=" + submission.Plant_ID + "&Audit_ID=" + Audit_ID + "'";
                            }
                            break;
                        case "CK01":
                            if (submission.Audit_Type == "DIMENSION")
                            {
                                ReportUrl = "'http://mmnsk1drsv/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK&Plant_ID=" + submission.Plant_ID + "&Audit_ID=" + Audit_ID + "'";
                            }
                            else
                            {
                                ReportUrl = "'http://mmnsk1drsv/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK&Plant_ID=" + submission.Plant_ID + "&Audit_ID=" + Audit_ID + "'";
                            }
                            break;
                        case "A002":
                            if (submission.Audit_Type == "DIMENSION")
                            {
                                ReportUrl = "'http://mmnsk1drsv/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK&Plant_ID=" + submission.Plant_ID + "&Audit_ID=" + Audit_ID + "'";
                            }
                            else
                            {
                                ReportUrl = "'http://mmnsk1drsv/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK&Plant_ID=" + submission.Plant_ID + "&Audit_ID=" + Audit_ID + "'";
                            }
                            break;
                        case "A010":
                            if (submission.Audit_Type == "DIMENSION")
                            {
                                ReportUrl = "'http://mmnsk1drsv/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK&Plant_ID=" + submission.Plant_ID + "&Audit_ID=" + Audit_ID + "'";
                            }
                            else
                            {
                                ReportUrl = "'http://mmnsk1drsv/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK&Plant_ID=" + submission.Plant_ID + "&Audit_ID=" + Audit_ID + "'";
                            }
                            break;

                    }

                    body = $@"
                <p>Dear {manager.Employee_Name},</p>
                <p>This is to inform you that {submission.Employee_Name} has completed the  {submission.Audit_Type} audit for <strong>{submission.Model_Name}</strong> as scheduled.</p>
                <p>Submission Date: {DateTime.Now.ToString("D")}</p>
               <a href={ReportUrl}
                   style='display: inline-block; text-decoration: none; background-color: #28a745; color: white; font-size: 14px; font-weight: bold; padding: 12px 24px; border-radius: 5px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);'
                   target='_blank'>
                   View Report
                </a>";
                }
                else if (submission.Status == 2)
                {
                    body = $@"
                <p>Dear {manager.Employee_Name},</p>
                <p>This is to inform you that {submission.Employee_Name} was unable to complete the  {submission.Audit_Type} audit for <strong>{submission.Model_Name}</strong> due to a holiday or shutdown on the scheduled date.</p>
                <p>Please review and reschedule if necessary.</p>";
                }
                else if (submission.Status == 3)
                {
                    body = $@"
                <p>Dear {manager.Employee_Name},</p>
                <p>This is to inform you that {submission.Employee_Name} was unable to complete the  {submission.Audit_Type} audit for <strong>{submission.Model_Name}</strong>.</p>
                <p>Reason provided: {submission.Reason}</p>
                <p>Please review the reason and reschedule if necessary.</p>";
                }

                // Add late submission message if the submission was past due
                if (submission.Audit_Due_Date.Date < DateTime.Now.Date)
                {
                    int daysLate = (DateTime.Now - submission.Audit_Due_Date).Days;
                    body += $@"
                <p><strong>Note:</strong> The audit was submitted <span style='color:red;'>late by {daysLate} days </span>. The due date was {submission.Audit_Due_Date.ToString("D")}.</p>";
                }
                else
                {
                    body += $@"
            <p>Audit Due Date: {submission.Audit_Due_Date.ToString("D")}</p>";
                }

                body += $@"
            <p>Best regards,<br>
            Audit Notification System</p>
            <p>Note: This is an auto-generated email; please do not reply.</p>";

                // Configure SMTP settings
                SmtpClient smtp_server = new SmtpClient();
                string smtpHostName = null;
                string username = null;
                string password = "";
                string port = null;

                string userEmail = null;
                smtpHostName = System.Configuration.ConfigurationManager.AppSettings["SMTP_SERVER"];
                username = System.Configuration.ConfigurationManager.AppSettings["SMTP_USER_NAME"];
                port = System.Configuration.ConfigurationManager.AppSettings["SMTP_PORT"];

                userEmail = System.Configuration.ConfigurationManager.AppSettings["SMTP_USER_EMAIL"];
                password = System.Configuration.ConfigurationManager.AppSettings["SMTP_PASSWORD"];
                if (smtpHostName == null || username == null || password == null || userEmail == null)
                {
                    throw new Exception("SMTP configuration is missing.");
                }

                smtp_server.UseDefaultCredentials = false;

                smtp_server.Credentials = new System.Net.NetworkCredential(username, password);
                smtp_server.Host = smtpHostName;
                MailMessage email = new MailMessage
                {
                    From = new MailAddress("DIMENSIONModule@mahindra.com"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                email.To.Add(manager.Email_Address);
                email.CC.Add(submission.Employee_Email);

                // Send email
                smtp_server.Send(email);
                return true;
            }
            catch (SmtpException smtpNotFound)
            {
                // General genObj = new General();
                if (smtpNotFound.InnerException != null)
                {
                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = this.messageDataObj.RecordnotFoundTitle;
                    this.messageDataObj.messageDetail = "SMTP Not found " + smtpNotFound.Message;
                    //string error = e.Message;
                    return false;
                }
                else
                {
                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = this.messageDataObj.RecordnotFoundTitle;
                    this.messageDataObj.messageDetail = "SMTP Not found " + smtpNotFound.InnerException;
                    //string error = e.Message;
                    return false;
                }
            }
            catch (Exception exp)
            {
                this.messageDataObj.isErrorMessage = true;
                this.messageDataObj.messageTitle = "Error";
                this.messageDataObj.messageDetail = exp.Message;
                //string error = e.Message;
                return false;
            }
        }

        [Route("api/Track_SheetController/SendReportMail")]
        [HttpPost]
        [ActionName("SendReportMail")]
        public bool SendReportMail(ReportMail submission)
        {
            try
            {

                // Configure SMTP settings
                SmtpClient smtp_server = new SmtpClient();
                string smtpHostName = null;
                string username = null;
                string password = "";
                string port = null;

                string userEmail = null;
                smtpHostName = System.Configuration.ConfigurationManager.AppSettings["SMTP_SERVER"];
                username = System.Configuration.ConfigurationManager.AppSettings["SMTP_USER_NAME"];
                port = System.Configuration.ConfigurationManager.AppSettings["SMTP_PORT"];

                userEmail = System.Configuration.ConfigurationManager.AppSettings["SMTP_USER_EMAIL"];
                password = System.Configuration.ConfigurationManager.AppSettings["SMTP_PASSWORD"];
                if (smtpHostName == null || username == null || password == null || userEmail == null)
                {
                    throw new Exception("SMTP configuration is missing.");
                }

                smtp_server.UseDefaultCredentials = false;

                smtp_server.Credentials = new System.Net.NetworkCredential(username, password);
                smtp_server.Host = smtpHostName;
                MailMessage email = new MailMessage
                {
                    From = new MailAddress("DIMENSIONModule@mahindra.com"),
                    Subject = submission.Subject,
                    Body = submission.MessageBody,
                    IsBodyHtml = true
                };
                for (int i = 0; i < submission.ToEmailList.Length; i++)
                {
                    email.To.Add(submission.ToEmailList[i]);
                }
                for (int i = 0; i < submission.CcList.Length; i++)
                {
                    email.CC.Add(submission.ToEmailList[i]);
                }

                // Send email
                smtp_server.Send(email);
                return true;
            }
            catch (SmtpException smtpNotFound)
            {
                // General genObj = new General();
                if (smtpNotFound.InnerException != null)
                {
                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = this.messageDataObj.RecordnotFoundTitle;
                    this.messageDataObj.messageDetail = "SMTP Not found " + smtpNotFound.Message;
                    //string error = e.Message;
                    return false;
                }
                else
                {
                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = this.messageDataObj.RecordnotFoundTitle;
                    this.messageDataObj.messageDetail = "SMTP Not found " + smtpNotFound.InnerException;
                    //string error = e.Message;
                    return false;
                }
            }
            catch (Exception exp)
            {
                this.messageDataObj.isErrorMessage = true;
                this.messageDataObj.messageTitle = "Error";
                this.messageDataObj.messageDetail = exp.Message;
                //string error = e.Message;
                return false;
            }
        }

        [Route("api/Track_SheetController/GetDefectsForMail/{Audit_Plan_Log_ID},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetDefectsForMail")]
        public IHttpActionResult GetDefectsForMail(decimal Audit_Plan_Log_ID, decimal Audit_Type_Id)
        {
            try
            {

                var data = (from audit in db.MM_Vehicle_Audit
                            join sheet in db.MM_Track_Sheet
                                on audit.Audit_ID equals sheet.Audit_ID
                            where audit.Audit_Type_Id == Audit_Type_Id
                               && audit.Audit_Plan_Log_ID == Audit_Plan_Log_ID
                            orderby sheet.Inserted_Date
                            select new
                            {
                                VIN_No = audit.VIN_No.Length == 17 ? audit.VIN_No.Substring(9) : audit.VIN_No,
                                audit.Body_No,
                                audit.Model_Name,
                                audit.Model_Code,
                                audit.Auditor1_ID,
                                audit.Audit_Date,
                                audit.Shift_ID,
                                audit.Active,
                                sheet.MM_Gap_And_FlushMaster.Type,
                                sheet.MM_PartMaster.Part_Name,
                                sheet.MM_PartMaster.MM_AreaMaster.Area_Name,
                                sheet.MM_CheckpointMaster.Checkpoint_Name,
                                sheet.MM_LocationMaster.Location_Name,
                                sheet.MM_SpecificationMaster.Specification_Name,
                                audit.Variant_Name,
                                audit.Color_Name,
                                audit.Audit_Type_Id,
                                audit.Total_PIST,
                                audit.Gap_PIST,
                                audit.Flush_PIST,
                                Total_Checked = audit.Gap_Total_Check,
                                Total_OK = audit.Gap_Ok,
                                Total_NOK = audit.Gap_Nok,
                                Total_NA = audit.Gap_NA,
                                sheet.Reading,
                                sheet.Remark,
                            }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;

                return Ok(new { messageDataObj, dataList = data });
            }
            catch (Exception e)
            {
                var exceptionMessage = e.InnerException?.ToString() ?? e.ToString();
                generalLogObj.addControllerException(e, "AuditSheet",
                    $"GetDefectsForMail({Audit_Plan_Log_ID}, {Audit_Type_Id})");
                messageDataObj.messageDetail = exceptionMessage;
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;

                return Ok(new { messageDataObj, exceptionMessage });
            }
        }
        [Route("api/Track_SheetController/GetAuditedRecords/{Audit_Type_Id},{startDate},{endDate},{Model_ID},{User_ID}")]
        [HttpGet]
        [ActionName("GetAuditedRecords")]
        public IHttpActionResult GetAuditedRecords(int Audit_Type_Id, DateTime startDate, DateTime endDate, decimal Model_ID, decimal User_ID)
        {
            var obj = (from audit in db.MM_Vehicle_Audit
                       join model in db.MM_Model on audit.Model_ID equals model.Model_ID
                       join plan in db.MM_Audit_Plan_Master on audit.Audit_Plan_ID equals plan.Audit_Plan_ID
                       join log in db.MM_Audit_Plan_Log_Details on audit.Audit_Plan_Log_ID equals log.Audit_Plan_Log_ID
                       where audit.Audit_Type_Id == Audit_Type_Id && model.Model_ID == Model_ID && (plan.Inserted_User_ID == User_ID || plan.Assign_User_ID == User_ID)
                             && (
                             (audit.Audit_Date.Year == startDate.Year && audit.Audit_Date.Month > startDate.Month) ||
                             (audit.Audit_Date.Year == startDate.Year && audit.Audit_Date.Month == startDate.Month && audit.Audit_Date.Day >= startDate.Day) ||
                             (audit.Audit_Date.Year > startDate.Year)
                            )
                        && (
                             (audit.Audit_Date.Year == endDate.Year && audit.Audit_Date.Month < endDate.Month) ||
                             (audit.Audit_Date.Year == endDate.Year && audit.Audit_Date.Month == endDate.Month && audit.Audit_Date.Day <= endDate.Day) ||
                             (audit.Audit_Date.Year < endDate.Year)
                            )
                       orderby audit.Audit_Date descending
                       select new
                       { 
                           audit.VIN_No,
                           audit.Body_No,
                           audit.Audit_ID,
                           audit.Plant_ID,
                           audit.Audit_Date,
                           model.Model_ID,
                           model.Model_Name,
                           audit.Audit_Plan_ID,
                           audit.Audit_Plan_Log_ID,
                           plan.Inserted_User_ID,
                           audit.Audit_Type_Id,
                           audit.MM_Audit_Plan_Log_Details.Audit_Due_Date,
                           Is_Assigned = plan.Inserted_User_ID == User_ID ? true : false,
                           log.Status
                       }).ToList();

            return Ok(obj);
        }
        public class AuditSubmission
        {
            public string Employee_Name { get; set; }
            public string Employee_Email { get; set; }
            public int Manager_ID { get; set; }
            public string Model_Name { get; set; }
            public int Status { get; set; }
            public int Plant_ID { get; set; }
            public int Plan_Log_ID { get; set; }
            public DateTime Audit_Due_Date { get; set; }
            public string Reason { get; set; }
            public string Audit_Type { get; set; }
            public string Plant_Code { get; set; }
        }
        public class ReportMail
        {
            public string FromEmail { get; set; }
            public string[] ToEmailList { get; set; }
            public string[] CcList { get; set; }
            public string[] BccList { get; set; }
            public string Subject { get; set; }
            public string MessageBody { get; set; }
        }

    }
}