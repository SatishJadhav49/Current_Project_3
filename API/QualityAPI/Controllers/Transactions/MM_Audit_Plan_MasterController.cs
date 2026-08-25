using OfficeOpenXml;
using QualityAPI.Helper;
using QualityAPI.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Web;
using System.Web.Http;

namespace QualityAPI.Controllers.Transactions
{
    public class MM_Audit_Plan_MasterController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        private General generalLogObj = new General();


        GlobalData messageDataObj = new GlobalData();
        GlobalOperations gbOperation = new GlobalOperations();

        // GET: MM_Audit_Plan_Master

       
        [Route("api/MM_Audit_Plan_Master/GetauditPlanData/{Plant_ID},{Audit_Type_Id},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetauditPlanData")]
        public IHttpActionResult GetauditPlanData(decimal Plant_ID, decimal Audit_Type_Id, int Shop_ID, bool Is_AllShops)
        {

            try
            {
                IEnumerable<decimal> Shop_ids;

                if (Is_AllShops == true)
                {
                    Shop_ids = (from shop in db.MM_Shop
                                where shop.Audit_Type_Id == Audit_Type_Id && shop.Plant_ID == Plant_ID
                                select (decimal)shop.Shop_ID).ToList();
                }
                else
                {
                    Shop_ids = new List<decimal> { Shop_ID };
                }
                var Data = from record in db.MM_Audit_Plan_Master
                           join emp in db.MM_Employee on record.Inserted_User_ID equals emp.Employee_ID
                           where record.Plant_ID == Plant_ID
                            && Shop_ids.Contains(record.Shop_ID ?? 0)
                           orderby record.Inserted_Date descending
                           select new
                           {
                               record.Audit_Plan_ID,
                               record.Model_ID,
                               record.MM_Model.Model_Name,
                               record.Shop_ID,
                               record.MM_Shop.Shop_Name,
                               record.Schedule_Type_ID,
                               record.MM_Schedule_Type_Master.Schedule_Type,
                               record.Assign_User_ID,
                              // record.MM_Employee.Employee_Name,
                              emp.Employee_Name,
                               record.Audit_Start_Date,
                               record.Audit_End_Date,
                               record.IS_Active,
                               record.Plant_ID,
                               record.MM_Plant.Plant_Name,
                               record.Audit_Type_Id,
                               record.Audit_Type_Master.Audit_Type,
                               record.Is_Edited,
                               record.Frequency
                           };

                var DataList = Data.ToList();

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
                generalLogObj.addControllerException(e, "MM_Audit_Plan_MasterController", "GetauditPlanData(" + Plant_ID + ", " + Audit_Type_Id + "," + Shop_ID + "," + Is_AllShops + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        [Route("api/MM_Audit_Plan_Master/SaveData")]
        [HttpPost]
        [ActionName("SaveData")]
        public IHttpActionResult SaveData(MM_Audit_Plan_Master mM_Audit_Plan_Master)
        {
            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                if (db.MM_Audit_Plan_Master.Any(m => m.Model_ID == mM_Audit_Plan_Master.Model_ID && m.Shop_ID == mM_Audit_Plan_Master.Shop_ID && m.Assign_User_ID == mM_Audit_Plan_Master.Assign_User_ID && m.Plant_ID == mM_Audit_Plan_Master.Plant_ID && m.Audit_Type_Id == mM_Audit_Plan_Master.Audit_Type_Id && m.Schedule_Type_ID == mM_Audit_Plan_Master.Schedule_Type_ID && m.Audit_Start_Date == mM_Audit_Plan_Master.Audit_Start_Date && m.Audit_End_Date == mM_Audit_Plan_Master.Audit_End_Date))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;
                    return Ok(messageDataObj);
                }
                MM_Audit_Plan_Master obj = new MM_Audit_Plan_Master();

                userid = mM_Audit_Plan_Master.Inserted_User_ID ?? 0;
                obj.Model_ID = mM_Audit_Plan_Master.Model_ID;
                obj.Shop_ID = mM_Audit_Plan_Master.Shop_ID;
                obj.Schedule_Type_ID = mM_Audit_Plan_Master.Schedule_Type_ID;
                obj.Assign_User_ID = mM_Audit_Plan_Master.Assign_User_ID;
                obj.Audit_Start_Date = mM_Audit_Plan_Master.Audit_Start_Date;
                obj.Audit_End_Date = mM_Audit_Plan_Master.Audit_End_Date;
                obj.Schedule_Type_ID = mM_Audit_Plan_Master.Schedule_Type_ID;
                obj.IS_Active = mM_Audit_Plan_Master.IS_Active;
                obj.Plant_ID = mM_Audit_Plan_Master.Plant_ID;
                obj.Plant_Code = mM_Audit_Plan_Master.Plant_Code;
                obj.Audit_Type_Id = mM_Audit_Plan_Master.Audit_Type_Id;
                obj.Inserted_Host = mM_Audit_Plan_Master.Inserted_Host;
                obj.Inserted_User_ID = mM_Audit_Plan_Master.Inserted_User_ID;
                obj.Frequency = mM_Audit_Plan_Master.Frequency;
                obj.Inserted_Date = DateTime.Now;

                db.MM_Audit_Plan_Master.Add(obj);
                db.SaveChanges();
                ExecuteStoredProcedure("[dbo].[SP_GeneratePlanAuditLog]");
                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                messageDataObj.messageTitle = messageDataObj.SuccessTitle;
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_Audit_Plan_Master", "SaveData()", userid);
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
                generalLogObj.addControllerException(e, "MM_Audit_Plan_Master", "SaveData()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_Audit_Plan_Master/EditData/{Audit_Plan_ID}")]
        [HttpPost]
        [ActionName("EditData")]
        public IHttpActionResult EditData(decimal Audit_Plan_ID, MM_Audit_Plan_Master mM_Audit_Plan_Master)
        {
            decimal userid = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                if (db.MM_Audit_Plan_Master.Any(m => m.Audit_Plan_ID != Audit_Plan_ID && m.Model_ID == mM_Audit_Plan_Master.Model_ID && m.Shop_ID == mM_Audit_Plan_Master.Shop_ID && m.Assign_User_ID == mM_Audit_Plan_Master.Assign_User_ID && m.Plant_ID == mM_Audit_Plan_Master.Plant_ID && m.Audit_Type_Id == mM_Audit_Plan_Master.Audit_Type_Id && m.Schedule_Type_ID == mM_Audit_Plan_Master.Schedule_Type_ID && m.Audit_Start_Date == mM_Audit_Plan_Master.Audit_Start_Date && m.Audit_End_Date == mM_Audit_Plan_Master.Audit_End_Date))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;
                    return Ok(messageDataObj);
                }
                MM_Audit_Plan_Master obj = obj = db.MM_Audit_Plan_Master.Where(p => p.Audit_Plan_ID == Audit_Plan_ID).FirstOrDefault();

                userid = mM_Audit_Plan_Master.Updated_User_ID ?? 0;
                obj.Model_ID = mM_Audit_Plan_Master.Model_ID;
                obj.Shop_ID = mM_Audit_Plan_Master.Shop_ID;
                obj.Schedule_Type_ID = mM_Audit_Plan_Master.Schedule_Type_ID;
                obj.Audit_Start_Date = mM_Audit_Plan_Master.Audit_Start_Date;
                obj.Audit_End_Date = mM_Audit_Plan_Master.Audit_End_Date;
                obj.Schedule_Type_ID = mM_Audit_Plan_Master.Schedule_Type_ID;
                obj.Assign_User_ID = mM_Audit_Plan_Master.Assign_User_ID;
                obj.IS_Active = mM_Audit_Plan_Master.IS_Active;
                obj.Plant_Code = mM_Audit_Plan_Master.Plant_Code;
                obj.Updated_Host = mM_Audit_Plan_Master.Updated_Host;
                obj.Updated_User_ID = mM_Audit_Plan_Master.Updated_User_ID;
                obj.Frequency = mM_Audit_Plan_Master.Frequency;
                obj.Updated_Date = DateTime.Now;

                db.Entry(obj).State = EntityState.Modified;
                db.SaveChanges();
                ExecuteStoredProcedure("[dbo].[SP_GeneratePlanAuditLog]");
                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.UpdateMessage;
                messageDataObj.messageTitle = messageDataObj.UpdateTitle;
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_Audit_Plan_Master", "EditData(" + Audit_Plan_ID + ")", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Audit_Plan_Master", "EditData()", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
            }
            return Ok(messageDataObj);
        }

        public void ExecuteStoredProcedure(string storedProcedureName)
        {
            string connectionString = ConfigurationManager.ConnectionStrings["OneD_DB"].ConnectionString;
            using (SqlConnection connection = new SqlConnection(connectionString))
            {
                using (SqlCommand command = new SqlCommand(storedProcedureName, connection))
                {
                    command.CommandType = CommandType.StoredProcedure;
                    try
                    {
                        connection.Open();
                        command.ExecuteNonQuery();
                    }
                    catch (SqlException ex)
                    {
                        generalLogObj.addControllerException(ex, "MM_Audit_Plan_Master", $"ExecuteStoredProcedure: {storedProcedureName}", 0);
                        throw;
                    }
                }
            }
        }

        [Route("api/MM_Audit_Plan_Master/DeleteData/{Audit_Plan_ID}")]
        [HttpDelete]
        [ActionName("DeleteData")]
        public IHttpActionResult DeleteData(decimal Audit_Plan_ID)
        {
            try
            {
                MM_Audit_Plan_Master obj = db.MM_Audit_Plan_Master.Find(Audit_Plan_ID);
                db.MM_Audit_Plan_Master.Remove(obj);
                db.SaveChanges();
                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                messageDataObj.messageTitle = messageDataObj.DeletionTitle;
            }
            catch (DbUpdateException dbe)
            {
                generalLogObj.addControllerException(dbe, "MM_Audit_Plan_Master", "DeleteData(" + Audit_Plan_ID + ")", 1);
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
                generalLogObj.addControllerException(e, "MM_Audit_Plan_Master", "DeleteData(" + Audit_Plan_ID + ")", 1);
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.DeletionErrorTitle;
                messageDataObj.isErrorMessage = true;
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_Audit_Plan_Master/DeletePlanLog")]
        [HttpPost]
        [ActionName("DeletePlanLog")]
        public IHttpActionResult DeletePlanLog(DeletePlan deletePlan)
        {
            try
            {
                using (var transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        MM_Audit_Plan_Log_Details obj = db.MM_Audit_Plan_Log_Details.Find(deletePlan.Audit_Plan_Log_ID);
                        MM_Audit_Plan_Log_Details_Deleted planToDelete = new MM_Audit_Plan_Log_Details_Deleted();

                        planToDelete.Audit_Plan_Log_ID = obj.Audit_Plan_Log_ID;
                        planToDelete.Audit_Plan_ID = obj.Audit_Plan_ID;
                        planToDelete.Model_ID = obj.Model_ID;
                        planToDelete.Audit_Due_Date = obj.Audit_Due_Date;
                        planToDelete.Shop_ID = obj.Shop_ID;
                        planToDelete.Plant_ID = obj.Plant_ID;
                        planToDelete.Audit_Type_Id = obj.Audit_Type_Id;
                        planToDelete.Plant_Code = obj.Plant_Code;
                        planToDelete.Deleted_User_ID = deletePlan.Deleted_User_ID;
                        planToDelete.Deleted_Date = DateTime.Now;
                        planToDelete.StatusRemark = deletePlan.Reason;
                        db.MM_Audit_Plan_Log_Details_Deleted.Add(planToDelete);
                        db.SaveChanges();

                        db.MM_Audit_Plan_Log_Details.Remove(obj);
                        db.SaveChanges();

                        transaction.Commit();

                        messageDataObj.isSuccessMessage = true;
                        messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                        messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
            catch (DbUpdateException dbe)
            {
                generalLogObj.addControllerException(dbe, "MM_Audit_Plan_Master", "DeletePlanLog(" + deletePlan.Audit_Plan_Log_ID + ")", 1);
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
                generalLogObj.addControllerException(e, "MM_Audit_Plan_Master", "DeletePlanLog(" + deletePlan.Audit_Plan_Log_ID + ")", 1);
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.DeletionErrorTitle;
                messageDataObj.isErrorMessage = true;
            }
            return Ok(messageDataObj);
        }

        [Route("api/MM_Audit_Plan_Master/GetAuditedPlanData/{Audit_Plan_ID},{Audit_Plan_Log_ID}")]
        [HttpGet]
        [ActionName("GetAuditedPlanData")]
        public IHttpActionResult GetAuditTableData(int Audit_Plan_ID, int Audit_Plan_Log_ID)
        {
            try
            {
                var obj = (from audit in db.MM_Vehicle_Audit
                           join model in db.MM_Model
                           on audit.Model_ID equals model.Model_ID
                           where audit.Audit_Plan_ID == Audit_Plan_ID && audit.Audit_Plan_Log_ID == Audit_Plan_Log_ID
                           orderby audit.Audit_ID descending
                           select new
                           {
                               audit.Audit_ID,
                               audit.Body_No,
                               audit.VIN_No,
                               audit.Audit_Date,
                               model.Model_Code,
                               audit.Model_Name,
                               audit.Gap_PIST,
                               audit.Flush_PIST,
                               audit.Total_PIST
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
                generalLogObj.addControllerException(e, "MM_Audit_Plan_Master", "GetAuditedPlanData(" + Audit_Plan_ID + "," + Audit_Plan_Log_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }


        [Route("api/MM_Audit_Plan_Master/GetPendingAuditList/{Plant_ID},{Audit_Type_Id},{Model_ID},{Assign_User_ID}")]
        [HttpGet]
        [ActionName("GetPendingAuditList")]
        public IHttpActionResult GetPendingAuditList(decimal Plant_ID, decimal Audit_Type_Id, int Model_ID, decimal Assign_User_ID)
        {
            try
            {
                var invalidStatuses = new List<int> { 1, 2, 3 };
                var Data = from planMaster in db.MM_Audit_Plan_Master
                           join logDetails in db.MM_Audit_Plan_Log_Details
                               on planMaster.Audit_Plan_ID equals logDetails.Audit_Plan_ID
                           join model in db.MM_Model
                               on planMaster.Model_ID equals model.Model_ID
                           join scheduleType in db.MM_Schedule_Type_Master
                               on planMaster.Schedule_Type_ID equals scheduleType.Schedule_Type_ID
                           // Left join with the Audit  table
                           join audit in db.MM_Vehicle_Audit
                               on logDetails.Audit_Plan_Log_ID equals audit.Audit_Plan_Log_ID into auditjoin
                           from auditData in auditjoin.DefaultIfEmpty() // Left join equivalent
                           where !invalidStatuses.Contains(logDetails.Status ?? 0)
                                // && planMaster.Assign_User_ID == Assign_User_ID
                                 && planMaster.Plant_ID == Plant_ID 
                                 && planMaster.Audit_Type_Id == Audit_Type_Id
                                && planMaster.Model_ID == Model_ID
                           select new
                           {
                               planMaster.Audit_Plan_ID,
                               logDetails.Audit_Plan_Log_ID,
                               planMaster.Model_ID,
                               model.Model_Name,
                               scheduleType.Schedule_Type,
                               planMaster.MM_Shop.Shop_Name,
                               planMaster.Shop_ID,
                               planMaster.Audit_Start_Date,
                               planMaster.Audit_End_Date,
                               planMaster.Audit_Type_Master.Audit_Type,
                               planMaster.Audit_Type_Master.Audit_Type_Id,
                               logDetails.Audit_Due_Date,
                               ParameterDate = db.MM_Vehicle_Audit
                                              .Where(a => a.Audit_Plan_Log_ID == logDetails.Audit_Plan_Log_ID)
                                              .Select(a => (DateTime?)a.Audit_Date)
                                              .FirstOrDefault() ?? logDetails.Audit_Due_Date,
                               Totalpointchecked = db.MM_Vehicle_Audit
                                                .Where(am => am.Audit_Plan_Log_ID == logDetails.Audit_Plan_Log_ID)
                                                .SelectMany(am => db.MM_Track_Sheet
                                                                  .Where(asd => asd.Audit_ID == am.Audit_ID))
                                                .Count(),
                               VIN_No = planMaster.Audit_Type_Id == 1 ? (auditData != null ? auditData.VIN_No : null) : (auditData != null ? auditData.Body_No : null),
                               Audit_Date = auditData != null ? auditData.Audit_Date : DateTime.Now,
                               Audit_ID = auditData != null ? auditData.Audit_ID : 0,
                               Total_PIST = auditData != null ? auditData.Total_PIST : 0,
                               Total_Checked = auditData != null ? auditData.Gap_Total_Check: 0,
                               Total_OK = auditData != null ? auditData.Gap_Ok : 0,
                               Total_NOK = auditData != null ? auditData.Gap_Nok : 0,
                               Total_NA = auditData != null ? auditData.Gap_NA : 0,
                           };

                var DataList = Data.ToList();

                var resultList = DataList.Select(data =>
                {
                    var totalCheckpoint = db.MM_LocationMaster.Count(l => l.Model_ID == data.Model_ID && l.Is_Active == true  && l.MM_PartMaster.Is_Active == true && l.MM_AreaMaster.Is_Active == true && l.MM_CheckpointMaster.Is_Active == true && l.Audit_Type_Id == data.Audit_Type_Id ); //&& DbFunctions.TruncateTime(l.Inserted_Date) <= DbFunctions.TruncateTime(data.ParameterDate) && DbFunctions.TruncateTime(l.MM_CheckpointMaster.Inserted_Date) <= DbFunctions.TruncateTime(data.ParameterDate) && DbFunctions.TruncateTime(l.MM_PartMaster.Inserted_Date) <= DbFunctions.TruncateTime(data.ParameterDate)
                   // var totalCheckpoint = db.MM_SpecificationMaster.Count(l => l.Model_ID == data.Model_ID && l.Is_Active == true  && l.Audit_Type_Id == data.Audit_Type_Id ); //&& DbFunctions.TruncateTime(l.Inserted_Date) <= DbFunctions.TruncateTime(data.ParameterDate) && DbFunctions.TruncateTime(l.MM_CheckpointMaster.Inserted_Date) <= DbFunctions.TruncateTime(data.ParameterDate) && DbFunctions.TruncateTime(l.MM_PartMaster.Inserted_Date) <= DbFunctions.TruncateTime(data.ParameterDate)

                    return new
                    {
                        data.Audit_Plan_ID,
                        data.Audit_Plan_Log_ID,
                        data.Model_ID,
                        data.Model_Name,
                        data.Schedule_Type,
                        data.Shop_Name,
                        data.Shop_ID,
                        data.Audit_Start_Date,
                        data.Audit_End_Date,
                        data.Audit_Due_Date,
                        data.Audit_Type_Id,
                        data.Audit_Type,
                        Due_Date = GetCalculatedDate(data.Schedule_Type, data.Audit_Due_Date),
                        TotalCheckpoint = totalCheckpoint,
                        data.Totalpointchecked,
                        IS_Audit_Completed = totalCheckpoint <= data.Totalpointchecked,
                        data.ParameterDate,
                        data.VIN_No,
                        Audit_Date = Convert.ToDateTime(data.Audit_Date).ToString("dd-MMM-yyyy"),
                        data.Audit_ID,
                        data.Total_PIST,
                        data.Total_Checked,
                        data.Total_OK,
                        data.Total_NOK,
                        data.Total_NA
                    };
                }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = resultList;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Audit_Plan_MasterController", "GetPendingAuditList(" + Plant_ID + ", " + Audit_Type_Id + "," + Model_ID + "," + Assign_User_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        private DateTime GetCalculatedDate(string scheduleType, DateTime? Audit_Due_Date)
        {
            DateTime currentDate = Audit_Due_Date.Value;
            switch (scheduleType)
            {
                case "Daily":
                    return currentDate.Date;
                case "Weekly":
                    // Calculate the last date of the current week (assuming week ends on Saturday)
                    int daysUntilEndOfWeek = DayOfWeek.Saturday - currentDate.DayOfWeek;
                    return currentDate.AddDays(daysUntilEndOfWeek).Date;
                case "Monthly":
                    // Calculate the last date of the current month
                    return new DateTime(currentDate.Year, currentDate.Month, DateTime.DaysInMonth(currentDate.Year, currentDate.Month)).Date;
                case "Half Monthly":
                    // If the auditDueDate is on or before the 15th, return the 15th of the month
                    // Otherwise, return the last date of the month
                    if (currentDate.Day <= 15)
                    {
                        return new DateTime(currentDate.Year, currentDate.Month, 15);
                    }
                    else
                    {
                        return new DateTime(currentDate.Year, currentDate.Month, DateTime.DaysInMonth(currentDate.Year, currentDate.Month)).Date;
                    }
                case "Half Yearly":
                    // If the auditDueDate month is between April to September, return the last day of September
                    // If the auditDueDate month is between October to March, return the last day of March
                    if (currentDate.Month >= 4 && currentDate.Month <= 9)
                    {
                        return new DateTime(currentDate.Year, 9, 30);
                    }
                    else
                    {
                        return new DateTime(currentDate.Year, 3, DateTime.DaysInMonth(currentDate.Year, 3));
                    }
                case "Yearly":
                    // For financial year April 1 to March 31, return the last day of March of the next year
                    if (currentDate.Month >= 4)
                    {
                        return new DateTime(currentDate.Year + 1, 3, 31);
                    }
                    else
                    {
                        return new DateTime(currentDate.Year, 3, 31);
                    }
                case "Quarterly":
                    // Calculate the next quarter dates based on the auditDueDate
                    DateTime nextQuarter1 = new DateTime(currentDate.Year, 4, 1);
                    DateTime nextQuarter2 = new DateTime(currentDate.Year, 7, 1);
                    DateTime nextQuarter3 = new DateTime(currentDate.Year, 10, 1);
                    DateTime nextQuarter4 = new DateTime(currentDate.Year + 1, 1, 1);

                    if (currentDate < nextQuarter1)
                    {
                        return nextQuarter1.AddMonths(3).AddDays(-1); // March 31
                    }
                    else if (currentDate < nextQuarter2)
                    {
                        return nextQuarter2.AddMonths(3).AddDays(-1); // June 30
                    }
                    else if (currentDate < nextQuarter3)
                    {
                        return nextQuarter3.AddMonths(3).AddDays(-1); // September 30
                    }
                    else
                    {
                        return nextQuarter4.AddMonths(3).AddDays(-1); // December 31
                    }
                default:
                    throw new ArgumentException("Invalid schedule type");
            }
        }
        [Route("api/MM_Audit_Plan_Master/GetCompletedAuditList/{Plant_ID},{Audit_Type_Id},{Model_ID},{Assign_User_ID}")]
        [HttpGet]
        [ActionName("GetCompletedAuditList")]
        public IHttpActionResult GetCompletedAuditList(decimal Plant_ID, decimal Audit_Type_Id, int Model_ID, decimal Assign_User_ID)
        {
            try
            {
                var invalidStatuses = new List<int> { 1, 2, 3 };
                var Data = from planMaster in db.MM_Audit_Plan_Master
                           join logDetails in db.MM_Audit_Plan_Log_Details
                               on planMaster.Audit_Plan_ID equals logDetails.Audit_Plan_ID
                           join model in db.MM_Model
                               on planMaster.Model_ID equals model.Model_ID
                           join scheduleType in db.MM_Schedule_Type_Master
                               on planMaster.Schedule_Type_ID equals scheduleType.Schedule_Type_ID
                           where invalidStatuses.Contains(logDetails.Status ?? 0)
                                    //  && planMaster.Assign_User_ID == Assign_User_ID
                                    && planMaster.Plant_ID == Plant_ID
                                  && planMaster.Model_ID == Model_ID
                           orderby logDetails.Updated_Date descending
                           select new
                           {
                               planMaster.Audit_Plan_ID,
                               logDetails.Audit_Plan_Log_ID,
                               planMaster.Model_ID,
                               model.Model_Name,
                               scheduleType.Schedule_Type,
                               planMaster.MM_Shop.Shop_Name,
                               planMaster.Shop_ID,
                               planMaster.Audit_Start_Date,
                               planMaster.Audit_End_Date,
                               planMaster.Audit_Type_Master.Audit_Type,
                               planMaster.Audit_Type_Master.Audit_Type_Id,
                               logDetails.Status,
                               Status_desc = logDetails.Status == 1 ? "Completed" : logDetails.Status == 2 ? "Holiday/Shut Down" : logDetails.StatusRemark,
                               CompletionDate = logDetails.Status == 1 ? db.MM_Vehicle_Audit.Where(a => a.Audit_Plan_Log_ID == logDetails.Audit_Plan_Log_ID).Select(a => a.Audit_Date).FirstOrDefault() : logDetails.Updated_Date,
                               VIN_No = logDetails.Status == 1 ? db.MM_Vehicle_Audit.Where(a => a.Audit_Plan_Log_ID == logDetails.Audit_Plan_Log_ID).Select(a => a.VIN_No).FirstOrDefault() : null,
                               Audit_Date = logDetails.Status == 1 ? db.MM_Vehicle_Audit.Where(a => a.Audit_Plan_Log_ID == logDetails.Audit_Plan_Log_ID).Select(a => a.Audit_Date).FirstOrDefault() : DateTime.Now
                           };

                var DataList = Data.ToList();

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
                generalLogObj.addControllerException(e, "MM_Audit_Plan_MasterController", "GetCompletedAuditList(" + Plant_ID + ", " + Audit_Type_Id + "," + Model_ID + "," + Assign_User_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Audit_Plan_Master/sendMail")]
        [HttpPost]
        [ActionName("sendMail")]
        public bool sendMail(MailRequest mailData)
        {
            try
            {
                // HelperLibrary helperObj = new HelperLibrary();
                SmtpClient smtp_server = new SmtpClient();
                MailMessage email = new MailMessage();
                MailMessage email1 = new MailMessage();
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
                email.Subject = mailData.Subject;
                email.From = new MailAddress(mailData.FromEmail);

                email.Body = mailData.MessageBody;
                email.IsBodyHtml = true;

                foreach (var item in mailData.ToEmailList)
                {
                    email.To.Add(item);
                }
                if (mailData.CcList != null)
                {
                    foreach (var item in mailData.CcList)
                    {
                        email.CC.Add(item);
                    }
                }
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

        public class DeletePlan
        {
            public string Reason { get; set; }
            public decimal Audit_Plan_Log_ID { get; set; }
            public decimal Deleted_User_ID { get; set; }
            public string Deleted_Host { get; set; }
        }
        public class MailRequest
        {
            public string FromEmail { get; set; }
            public List<string> ToEmailList { get; set; }
            public string Subject { get; set; }
            public string MessageBody { get; set; }
            public List<string> CcList { get; set; }
            public List<string> BccList { get; set; }
        }
    }
}