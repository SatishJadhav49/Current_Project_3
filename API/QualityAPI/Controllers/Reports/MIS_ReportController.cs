using QualityAPI.Controllers;
using QualityAPI.Helper;
using QualityAPI.Models;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Hosting;
using System.Web.Http;
using System.Web.Http.Description;
using System.Windows.Media.Media3D;

namespace QualityAPI.Controllers.Reports
{
    public class MIS_ReportController : ApiController
    {
        // GET: MIS_Report

        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();

        [Route("api/MIS_Report/Get_BIW_List/{Model_ID},{FromDate},{ToDate},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("Get_BIW_List")]
        public IHttpActionResult Get_CRF_Audit_VIN_Nolist(decimal Model_ID, DateTime FromDate, DateTime ToDate, decimal Audit_Type_Id)
        {
            try
            { 
            DateTime startDate = FromDate;
            DateTime endDate = ToDate;

            var query = (from va in db.MM_Vehicle_Audit
                         join mm in db.MM_Model on va.Model_ID equals mm.Model_ID
                         where va.Audit_Type_Id == Audit_Type_Id && va.Model_ID == Model_ID
                        && (
                             (va.Audit_Date.Year == startDate.Year && va.Audit_Date.Month > startDate.Month) ||
                             (va.Audit_Date.Year == startDate.Year && va.Audit_Date.Month == startDate.Month && va.Audit_Date.Day >= startDate.Day) ||
                             (va.Audit_Date.Year > startDate.Year)
                            )
                        && (
                             (va.Audit_Date.Year == endDate.Year && va.Audit_Date.Month < endDate.Month) ||
                             (va.Audit_Date.Year == endDate.Year && va.Audit_Date.Month == endDate.Month && va.Audit_Date.Day <= endDate.Day) ||
                             (va.Audit_Date.Year < endDate.Year)
                            )
                         select new
                         {
                             va.Audit_ID,
                             va.Body_No,
                             va.VIN_No,
                             va.Audit_Date
                         }).Distinct().ToList();


                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = query;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MIS_Report", "Get_CRF_Audit_VIN_Nolist(" + Model_ID + ", " + FromDate + "," + ToDate + ","+Audit_Type_Id+")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }



        [Route("api/Report/GetXbarData/{FromDate},{ToDate},{Model_ID},{Area_ID},{Part_ID},{Checkpoint_ID},{Location_ID},{Parameter_ID}")]
        [HttpGet]
        [ActionName("GetXbarData")]
        public IHttpActionResult GetXbarData(DateTime FromDate, DateTime ToDate, int Model_ID, int Area_ID, int Part_ID, int Checkpoint_ID, int Location_ID, int Parameter_ID)
        {
            var query = (from va in db.MM_Vehicle_Audit
                         join sheet in db.MM_Track_Sheet on va.Audit_ID equals sheet.Audit_ID
                         join spec in db.MM_SpecificationMaster on sheet.Specification_ID equals spec.Specification_ID
                         where va.Model_ID == Model_ID
                               && sheet.Part_ID == Part_ID
                               && sheet.Area_ID == Area_ID
                               && sheet.Reading != null
                               && sheet.Checkpoint_ID == Checkpoint_ID
                               && sheet.Location_ID == Location_ID
                               && sheet.Parameter_ID == Parameter_ID
                               && va.Audit_Date >= FromDate
                               && va.Audit_Date <= ToDate
                         select new
                         {
                             va.Audit_ID,
                             sheet.Track_Sheet_ID,
                             va.Audit_Date,
                             Average = sheet.Reading,
                             LCL = spec.MinVal == null ? 0 : spec.MinVal,
                             UCL = spec.MaxVal == null ? 0 : spec.MaxVal,
                         }).Distinct().ToList();

            var result = query.Select(x => new
            {
                x.Audit_ID,
                x.Track_Sheet_ID,
                x.Average,
                Audit_Date = x.Audit_Date.ToString("dd-MMM-yyyy"),
                LSL = x.LCL,
                USL = x.UCL,
            }).ToList().OrderBy(a =>a.Audit_ID);

            return Ok(result);
        }

        //[Route("api/Report/GetMappingData/{FromDate},{ToDate},{Audit_Type_ID},{Location_ID},{Parameter_ID}")]
        //[HttpGet]
        //[ActionName("GetMappingData")]
        //public IHttpActionResult GetMappingData(DateTime FromDate, DateTime ToDate, int Audit_Type_ID, int Location_ID, int Parameter_ID)
        //{
        //    try
        //    {

        //        // Find mapped apposite audit location id
        //        var mappedLocation = db.MM_Location_Mapping
        //                               .Where(m => (Audit_Type_ID == 1 && m.TCF_Location_ID == Location_ID) || (Audit_Type_ID == 2 && m.BIW_Location_ID == Location_ID))
        //                               .OrderByDescending(m => m.Inserted_Date)
        //                               .Select(m => Audit_Type_ID == 1 ? m.BIW_Location_ID : m.TCF_Location_ID)
        //                               .FirstOrDefault();

        //        if (mappedLocation != 0 && mappedLocation != null)
        //        {
        //            var biwReadings = (from va in db.MM_Vehicle_Audit
        //                               join sheet in db.MM_Track_Sheet on va.Audit_ID equals sheet.Audit_ID
        //                               where sheet.Reading != null
        //                                     && sheet.Parameter_ID == Parameter_ID
        //                                     && va.Audit_Date >= FromDate
        //                                     && va.Audit_Date <= ToDate
        //                                     && (Audit_Type_ID == 1 ? sheet.Location_ID == mappedLocation : sheet.Location_ID == Location_ID)
        //                               select new
        //                               {
        //                                   va.Audit_ID,
        //                                   va.Audit_Date,
        //                                   sheet.Location_ID,
        //                                   Reading = sheet.Reading,
        //                               }).ToList().OrderBy(a => a.Audit_Date);

        //            var tcfReadings = (from va in db.MM_Vehicle_Audit
        //                               join sheet in db.MM_Track_Sheet on va.Audit_ID equals sheet.Audit_ID
        //                               where sheet.Reading != null
        //                                     && sheet.Parameter_ID == Parameter_ID
        //                                     && va.Audit_Date >= FromDate
        //                                     && va.Audit_Date <= ToDate
        //                                     && (Audit_Type_ID == 1 ? sheet.Location_ID == Location_ID : sheet.Location_ID == mappedLocation)
        //                               select new
        //                               {
        //                                   va.Audit_ID,
        //                                   va.Audit_Date,
        //                                   sheet.Location_ID,
        //                                   Reading = sheet.Reading,
        //                               }).ToList().OrderBy(a => a.Audit_Date);
        //            messageDataObj.isSuccessMessage = true;
        //            messageDataObj.isErrorMessage = false;
        //            var dataList = new { biwReadings, tcfReadings };
        //            return Ok(new { messageDataObj, dataList });
        //        }
        //        messageDataObj.isSuccessMessage = false;
        //        messageDataObj.isErrorMessage = true;
        //        messageDataObj.messageTitle = "Location Not Mapped";
        //        messageDataObj.messageDetail = "Please map location in master";
        //        var dataListB = "";
        //        return Ok(new { messageDataObj, dataListB });

        //    }
        //    catch (Exception e)
        //    {
        //        if (e.InnerException != null)
        //        {
        //            e = e.InnerException;
        //        }
        //        generalLogObj.addControllerException(e, "MIS_Report", "GetMappingData(" + Audit_Type_ID + ", " + FromDate + "," + ToDate + "," + Location_ID + ")");
        //        messageDataObj.messageDetail = e.ToString();
        //        messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
        //        messageDataObj.isSuccessMessage = false;
        //        messageDataObj.isErrorMessage = true;
        //        return Ok(new
        //        {
        //            messageDataObj,
        //            e
        //        });
        //    }

        //}
        [Route("api/Report/GetMappingData/{FromDate},{ToDate},{Model_ID},{Area_ID},{Part_ID},{Checkpoint_ID},{Location_ID},{Parameter_ID},{Audit_Type_ID}")]
        [HttpGet]
        [ActionName("GetMappingData")]
        public IHttpActionResult GetMappingData(DateTime FromDate, DateTime ToDate, int Model_ID, int Area_ID, int Part_ID, int Checkpoint_ID, int Location_ID, int Parameter_ID, int Audit_Type_ID)
        {
            try
            {
                // Find mapped apposite audit location id
                var mappedLocation = db.MM_Location_Mapping
                                       .Where(m => (Audit_Type_ID == 1 && m.TCF_Location_ID == Location_ID)
                                                || (Audit_Type_ID == 2 && m.BIW_Location_ID == Location_ID))
                                       .OrderByDescending(m => m.Inserted_Date)
                                       .Select(m => Audit_Type_ID == 1 ? m.BIW_Location_ID : m.TCF_Location_ID)
                                       .FirstOrDefault();

                if (mappedLocation != 0 && mappedLocation != null)
                {
                    // BIW Readings
                    var biwReadings = (from va in db.MM_Vehicle_Audit
                                       join sheet in db.MM_Track_Sheet on va.Audit_ID equals sheet.Audit_ID
                                       join spec in db.MM_SpecificationMaster on sheet.Specification_ID equals spec.Specification_ID
                                       where 
                                             //va.Model_ID == Model_ID
                                             //&& sheet.Part_ID == Part_ID
                                             //&& sheet.Area_ID == Area_ID
                                             sheet.Reading != null
                                             //&& sheet.Checkpoint_ID == Checkpoint_ID
                                             //&& sheet.Location_ID == Location_ID
                                             && sheet.Parameter_ID == Parameter_ID
                                             && va.Audit_Date >= FromDate
                                             && va.Audit_Date <= ToDate
                                             && (Audit_Type_ID == 1 ? sheet.Location_ID == mappedLocation : sheet.Location_ID == Location_ID)
                                       orderby va.Audit_Date
                                       select new
                                       {
                                           va.Audit_ID,
                                           va.Audit_Date,
                                           sheet.Track_Sheet_ID,
                                           sheet.Location_ID,
                                           Reading = sheet.Reading,
                                           LCL = spec.MinVal ?? 0,
                                           UCL = spec.MaxVal ?? 0,
                                       }).ToList();

                    var biwResult = biwReadings.Select(x => new
                    {
                        x.Audit_ID,
                        x.Track_Sheet_ID,
                        x.Reading,
                        Audit_Date = x.Audit_Date.ToString("dd-MMM-yyyy"),
                        LSL = x.LCL,
                        USL = x.UCL,
                    }).OrderBy(a => a.Audit_ID).ToList();

                    // TCF Readings
                    var tcfReadings = (from va in db.MM_Vehicle_Audit
                                       join sheet in db.MM_Track_Sheet on va.Audit_ID equals sheet.Audit_ID
                                       join spec in db.MM_SpecificationMaster on sheet.Specification_ID equals spec.Specification_ID
                                       where 
                                             //va.Model_ID == Model_ID
                                             //&& sheet.Part_ID == Part_ID
                                             //&& sheet.Area_ID == Area_ID
                                             sheet.Reading != null
                                             //&& sheet.Checkpoint_ID == Checkpoint_ID
                                             //&& sheet.Location_ID == Location_ID
                                             && sheet.Parameter_ID == Parameter_ID
                                             && va.Audit_Date >= FromDate
                                             && va.Audit_Date <= ToDate
                                             && (Audit_Type_ID == 1 ? sheet.Location_ID == Location_ID : sheet.Location_ID == mappedLocation)
                                       orderby va.Audit_Date
                                       select new
                                       {
                                           va.Audit_ID,
                                           va.Audit_Date,
                                           sheet.Track_Sheet_ID,
                                           sheet.Location_ID,
                                           Reading = sheet.Reading,
                                           LCL = spec.MinVal ?? 0,
                                           UCL = spec.MaxVal ?? 0,
                                       }).ToList();

                    var tcfResult = tcfReadings.Select(x => new
                    {
                        x.Audit_ID,
                        x.Track_Sheet_ID,
                        x.Reading,
                        Audit_Date = x.Audit_Date.ToString("dd-MMM-yyyy"),
                        LSL = x.LCL,
                        USL = x.UCL,
                    }).OrderBy(a => a.Audit_ID).ToList();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.isErrorMessage = false;

                    var dataList = new { biwReadings = biwResult, tcfReadings = tcfResult };
                    return Ok(new { messageDataObj, dataList });
                }

                // Location not mapped
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageTitle = "Location Not Mapped";
                messageDataObj.messageDetail = "Please map location in master";
                return Ok(new { messageDataObj, dataListB = "" });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MIS_Report",
                    $"GetMappingData({Audit_Type_ID}, {FromDate}, {ToDate}, {Location_ID},{Model_ID},{Area_ID},{Part_ID},{Checkpoint_ID})");

                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;

                return Ok(new { messageDataObj, e });
            }
        }


        




    }
}