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
using QualityAPI.Models;
using System.Web;
using System.Web.Security;
using QualityAPI.Helper;
using System.Data.Entity.Validation;

namespace QualityAPI.Controllers.CommanAPIS
{
    [AllowCrossSiteJson]
    public class MasterAPISController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();
        // GET: MasterAPIS

        [Route("api/MasterAPIS/GetPlantList")]
        [HttpGet]
        [ActionName("GetPlantList")]
        public IHttpActionResult GetPlantList()
        {
            try
            {
                var plantlist = (from plant in db.MM_Plant
                                 select new
                                 {
                                     plant.Plant_ID,
                                     plant.Plant_Name,
                                     plant.Address,
                                     plant.Description,
                                     plant.City,
                                     plant.IS_Active,
                                     plant.Sap_Code
                                 }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = plantlist;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MasterAPIS", "GetPlantList()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetShoplist/{plantid}")]
        [HttpGet]
        [ActionName("GetShoplist")]
        public IHttpActionResult GetShoplist(decimal plantid)
        {
            try
            {
                var Shoplist = (from shops in db.MM_Shop
                                where shops.Plant_ID == plantid
                                select new
                                {
                                    shops.Shop_ID,
                                    shops.Shop_Name,
                                }).Distinct().ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = Shoplist;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MasterAPIS", "GetShoplist(" + plantid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/Get_Audit_wise_Shoplist/{plantid},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("Get_Audit_wise_Shoplist")]
        public IHttpActionResult Get_Audit_wise_Shoplist(decimal plantid, decimal Audit_Type_Id)
        {
            try
            {
                var Shoplist = (from shops in db.MM_Shop
                                where shops.Plant_ID == plantid && shops.Audit_Type_Id == Audit_Type_Id
                                select new
                                {
                                    shops.Shop_ID,
                                    shops.Shop_Name,
                                }).Distinct().ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = Shoplist;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MasterAPIS", "Get_Audit_wise_Shoplist(" + plantid + ", " + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetAudit_Type_list")]
        [HttpGet]
        [ActionName("GetAudit_Type_list")]
        public IHttpActionResult GetAudit_Type_list()
        {
            try
            {
                var Auditlist = (from Audit in db.Audit_Type_Master
                                 select new
                                 {
                                     Audit.Audit_Type_Id,
                                     Audit.Audit_Type,
                                 }).Distinct().ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = Auditlist;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MasterAPIS", "GetAudit_Type_list()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetEmployee/{Plant_ID},{Audit_Type_ID}")]
        [HttpGet]
        [ActionName("GetEmployee")]
        public IHttpActionResult GetEmployee(int Plant_ID, int Audit_Type_ID)
        {
            try
            {
                var obj = (from emp in db.MM_Employee
                           where emp.Plant_ID == Plant_ID && emp.Audit_Type_Id == Audit_Type_ID
                           select new
                           {
                               emp.Employee_Name,
                               emp.Employee_No,
                               emp.Employee_ID
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
                generalLogObj.addControllerException(e, "MasterAPIS", "GetEmployee(" + Plant_ID + "," + Audit_Type_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetShift/{Plant_ID},{Shop_ID}")]
        [HttpGet]
        [ActionName("GetShift")]
        public IHttpActionResult GetShift(int Plant_ID, int Shop_ID)
        {
            try
            {
                var obj = (from Shift in db.MM_Shift
                           where Shift.Shop_ID == Shop_ID && Shift.Plant_ID == Plant_ID && Shift.Is_Active == true
                           select new
                           {
                               Shift.SHIFT_NO,
                               Shift.SHIFT_DESC,
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
                generalLogObj.addControllerException(e, "MasterAPIS", "GetShift(" + Plant_ID + "," + Shop_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetModelByShop/{Shop_ID},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetModelByShop")]
        public IHttpActionResult GetModelByShop(int Shop_ID, decimal Audit_Type_Id)
        {
            try
            {
                var obj = (from model in db.MM_Model
                           where model.Shop_ID == Shop_ID && model.Audit_Type_Id == Audit_Type_Id
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
                generalLogObj.addControllerException(e, "MasterAPIS", "GetModelByShop(" + Shop_ID + "," + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetGapAndFlush")]
        [HttpGet]
        [ActionName("GetGapAndFlush")]
        public IHttpActionResult GetGapAndFlush()
        {
            try
            {
                var obj = (from g in db.MM_Gap_And_FlushMaster
                           select new
                           {
                               g.ID,
                               g.Type,
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
                generalLogObj.addControllerException(e, "MasterAPIS", "GetGapAndFlush()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetAreaByModel/{Model_ID},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetAreaByModel")]
        public IHttpActionResult GetAreaByModel(int Model_ID, decimal Audit_Type_Id)
        {
            try
            {
                var obj = (from area in db.MM_AreaMaster
                           where area.Model_ID == Model_ID && area.Audit_Type_Id == Audit_Type_Id && area.Is_Active == true
                           orderby area.SORTORDER ascending
                           select new
                           {
                               area.Area_ID,
                               area.Area_Name,
                               area.Area_Desc,
                               area.Model_ID,
                               area.Shop_ID,
                               area.Plant_ID,
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
                generalLogObj.addControllerException(e, "MasterAPIS", "GetAreaByModel(" + Model_ID + ", " + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetPartByArea/{Area_ID},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetPartByArea")]
        public IHttpActionResult GetPartByArea(int Area_ID, decimal Audit_Type_Id)
        {
            try
            {
                var obj = (from part in db.MM_PartMaster
                           where part.Area_ID == Area_ID && part.Audit_Type_Id == Audit_Type_Id && part.Is_Active == true
                           orderby part.SORTORDER ascending
                           select new
                           {
                               part.Part_ID,
                               part.Part_Name,
                               part.Part_Desc,
                               part.Area_ID,
                               part.Shop_ID,
                               part.Plant_ID,
                               part.Is_Gap,
                               part.Is_Flushness,
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
                generalLogObj.addControllerException(e, "MasterAPIS", "GetPartByArea(" + Area_ID + "," + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetCheckpointByPart/{Part_ID},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetCheckpointByPart")]
        public IHttpActionResult GetCheckpointByPart(int Part_ID, decimal Audit_Type_Id)
        {
            try
            {
                var obj = (from checkpoint in db.MM_CheckpointMaster
                           where checkpoint.Part_ID == Part_ID && checkpoint.Audit_Type_Id == Audit_Type_Id && checkpoint.Is_Active == true
                           orderby checkpoint.SORTORDER ascending
                           select new
                           {
                               checkpoint.Checkpoint_ID,
                               checkpoint.Checkpoint_Name,
                               checkpoint.Checkpoint_Desc,
                               checkpoint.Parallelism,
                               checkpoint.Part_ID,
                               checkpoint.Area_ID,
                               checkpoint.Model_ID,
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
                generalLogObj.addControllerException(e, "MasterAPIS", "GetCheckpointByPart(" + Part_ID + "," + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetLocationByCheckpoint/{Checkpoint_ID},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetLocationByCheckpoint")]
        public IHttpActionResult GetLocationByCheckpoint(int Checkpoint_ID, decimal Audit_Type_Id)
        {
            try
            {
                var obj = (from location in db.MM_LocationMaster
                           where location.Checkpoint_ID == Checkpoint_ID && location.Audit_Type_Id == Audit_Type_Id && location.Is_Active == true
                           orderby location.SORTORDER ascending
                           select new
                           {
                               location.Location_ID,
                               location.Location_Name,
                               location.Location_Desc,
                               location.Checkpoint_ID,
                               location.Part_ID,
                               location.Area_ID,
                               location.Model_ID,
                               location.Shop_ID,
                               location.Plant_ID,
                               location.Is_Gap,
                               location.Is_Flushness,
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
                generalLogObj.addControllerException(e, "MasterAPIS", "GetLocationByCheckpoint(" + Checkpoint_ID + "," + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetRightlist/{plantid}")]
        [HttpGet]
        [ActionName("GetRightlist")]
        public IHttpActionResult GetRightlist(decimal plantid)
        {
            try
            {
                var Rightlist = (from Right in db.MM_Rights
                                 where Right.Plant_ID == plantid
                                 select new
                                 {
                                     Right.Right_ID,
                                     Right.Right_Name,
                                 }).Distinct().ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = Rightlist;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MasterAPIS", "GetRightlist(" + plantid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MasterAPIS/GetScheduleType")]
        [HttpGet]
        [ActionName("GetScheduleType")]
        public IHttpActionResult GetScheduleType()
        {
            try
            {
                var schedulelist = (from schedule in db.MM_Schedule_Type_Master
                                    select new
                                    {
                                        schedule.Schedule_Type_ID,
                                        schedule.Schedule_Type,
                                    }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = schedulelist;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MasterAPIS", "GetScheduleType()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new
                {
                    messageDataObj,
                    e
                });
            }
        }

        [Route("api/MasterAPIS/GetBoxPlotData/{Year},{Part_ID},{Checkpoint_ID},{Location_ID},{Parameter_ID}")]
        [HttpGet]
        [ActionName("GetBoxPlotData")]
        public IHttpActionResult GetBoxPlotData(int Year, decimal Part_ID, decimal Checkpoint_ID, decimal Location_ID, decimal Parameter_ID)
        {
            try
            {
                var startDate = new DateTime(Year - 1, 4, 1);
                var endDate = new DateTime(Year, 3, 31);

                var rawData = (from sheet in db.MM_Track_Sheet
                               join audit in db.MM_Vehicle_Audit on sheet.Audit_ID equals audit.Audit_ID
                               where sheet.Part_ID == Part_ID
                                     && sheet.Location_ID == Location_ID
                                     && sheet.Checkpoint_ID == Checkpoint_ID
                                     && sheet.Parameter_ID == Parameter_ID
                                     // && sheet.Is_NA == false
                                     && audit.Audit_Date >= startDate
                                     && audit.Audit_Date <= endDate
                               group sheet by audit.Audit_Date.Month into grouped
                               select new
                               {
                                   Month = grouped.Key,
                                   Data = grouped.Select(x => new { x.Reading }).ToList()
                               }).ToList();

                // Perform the conversion in memory
                var result = rawData.Select(r => new
                {
                    Month = r.Month,
                    Data = r.Data.Select(d => d.Reading).ToList()
                }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = result;
                return Ok(new { messageDataObj, dataList });

            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MasterAPIS", "GetBoxPlotData()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new
                {
                    messageDataObj,
                    e
                });
            }
        }

        [Route("api/MasterAPIS/GetBoxPlotDataByDates/{startDate},{endDate},{Part_ID},{Checkpoint_ID},{Location_ID},{Parameter_ID}")]
        [HttpGet]
        [ActionName("GetBoxPlotDataByDates")]
        public IHttpActionResult GetBoxPlotDataByDates(DateTime startDate, DateTime endDate, decimal Part_ID, decimal Checkpoint_ID, decimal Location_ID, decimal Parameter_ID)
        {
            try
            {

                var rawData = (from sheet in db.MM_Track_Sheet
                               join audit in db.MM_Vehicle_Audit on sheet.Audit_ID equals audit.Audit_ID
                               where sheet.Part_ID == Part_ID
                                     && sheet.Location_ID == Location_ID
                                     && sheet.Checkpoint_ID == Checkpoint_ID
                                     && sheet.Parameter_ID == Parameter_ID
                                     // && sheet.Is_NA == false
                                     && audit.Audit_Date >= startDate
                                     && audit.Audit_Date <= endDate
                               group sheet by audit.Audit_Date.Month into grouped
                               select new
                               {
                                   Month = grouped.Key,
                                   Data = grouped.Select(x => new { x.Reading }).ToList()
                               }).ToList();

                // Perform the conversion in memory
                var result = rawData.Select(r => new
                {
                    Month = r.Month,
                    Data = r.Data.Select(d => d.Reading).ToList()
                }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = result;
                return Ok(new { messageDataObj, dataList });

            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MasterAPIS", "GetBoxPlotDataByDates()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new
                {
                    messageDataObj,
                    e
                });
            }
        }

        [Route("api/Report/GetSPCRulesData/{FrmDt},{ToDt},{Area_ID},{Model_ID},{Plant_ID},{Part_ID},{CheckPoint},{Location},{Parameter_ID}")]
        [HttpGet]
        [ActionName("GetSPCRulesData")]
        public IHttpActionResult GetSPCRulesData(DateTime FrmDt, DateTime ToDt, int Area_ID, int Model_ID, int Plant_ID, int Part_ID, int CheckPoint, int Location, int Parameter_ID)
        {

            try
            {
                DateTime startDate = FrmDt;
                DateTime endDate = ToDt;

                var query = (from va in db.MM_Vehicle_Audit
                             join sheet in db.MM_Track_Sheet on va.Audit_ID equals sheet.Audit_ID
                             join spec in db.MM_SpecificationMaster on sheet.Specification_ID equals spec.Specification_ID
                             where va.Plant_ID == Plant_ID && va.Model_ID == Model_ID && sheet.Part_ID == Part_ID && Area_ID == sheet.Area_ID && sheet.Reading != null && CheckPoint == sheet.Checkpoint_ID && Location == sheet.Location_ID && sheet.Parameter_ID == Parameter_ID
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
                                 sheet.Track_Sheet_ID,
                                 Average = sheet.Reading,
                                 LCL = spec.LCL == null ? 0 : spec.LCL,
                                 UCL = spec.UCL == null ? 0 : spec.UCL,
                                 LSL = spec.MinVal == null ? 0 : spec.MinVal,
                                 USL = spec.MaxVal == null ? 0 : spec.MaxVal,
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
                generalLogObj.addControllerException(e, "MIS_ReportController", "Get_BIW_List(" + Plant_ID + "," + Model_ID + "," + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        [Route("api/MasterAPIS/GetMailIdsByModel/{Model_ID}")]
        [HttpGet]
        [ActionName("GetMailIdsByModel")]
        public IHttpActionResult GetMailIdsByModel(int Model_ID)
        {
            try
            {
                var obj = (from model in db.MM_Model
                           where model.Model_ID == Model_ID
                           orderby model.Inserted_Date descending
                           select new
                           {
                               model.Model_ID,
                               model.Model_Name,
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
                generalLogObj.addControllerException(e, "MasterAPIS", "GetMailIdsByModel(" + Model_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new
                {
                    messageDataObj,
                    e
                });
            }
        }

        
    }
}