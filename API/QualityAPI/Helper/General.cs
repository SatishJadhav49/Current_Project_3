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
using System.Security.Cryptography;
using System.Text;
using System.Web.Mvc;

namespace QualityAPI.Helper
{
    public class General
    {

        MM_Error_Log mmErrorLogObj = new MM_Error_Log();
        private OneD_DB_Entity db = new OneD_DB_Entity();

        public bool addControllerException(Exception ex, String controllerName, String actionName, decimal userId = 1)
        {

            mmErrorLogObj = new MM_Error_Log();
            mmErrorLogObj.Controller_Name = controllerName;
            mmErrorLogObj.Action_Name = actionName;

            while (ex.InnerException != null)
            {
                ex = ex.InnerException;
            }
            try
            {

                if (ex != null)
                {

                    if (ex.InnerException != null)
                        mmErrorLogObj.Inner_Exception = ex.InnerException + "";

                    if (ex.Message != null)
                        mmErrorLogObj.Message = ex.Message.ToString();

                    if (ex.Data != null)
                        mmErrorLogObj.Exception_Data = ex.Data.ToString();

                    if (ex.TargetSite != null)
                        mmErrorLogObj.Target_Site = ex.TargetSite.ToString();

                    if (ex.StackTrace != null)
                        mmErrorLogObj.Stack_Trace = ex.StackTrace.ToString();

                    if (ex.Source != null)
                        mmErrorLogObj.Source = ex.Source.ToString();

                    if (ex.HResult != null)
                        mmErrorLogObj.H_Result = ex.HResult.ToString();


                }
                mmErrorLogObj.Inserted_Date = DateTime.Now;
                mmErrorLogObj.Inserted_Host = "sample";
                mmErrorLogObj.Inserted_User_ID = userId;
                db.MM_Error_Log.Add(mmErrorLogObj);
                db.SaveChanges();

            }
            catch (Exception e)
            {

                return false;
            }
            return true;

        }

        public bool addShopControllerException(Exception ex, String controllerName, String actionName, int stationID, int plantID, int shopID, int lineID, int userId = 1)
        {
            //int plantid = ((FDSession)this.Session["FDSession"]).plantId;
            mmErrorLogObj = new MM_Error_Log();
            mmErrorLogObj.Controller_Name = controllerName;
            mmErrorLogObj.Action_Name = actionName;

            if (ex != null)
            {
                if (ex.InnerException != null)
                    mmErrorLogObj.Inner_Exception = ex.InnerException + "";

                if (ex.Message != null)
                    mmErrorLogObj.Message = ex.Message.ToString();

                if (ex.Data != null)
                    mmErrorLogObj.Exception_Data = ex.Data.ToString();

                if (ex.TargetSite != null)
                    mmErrorLogObj.Target_Site = ex.TargetSite.ToString();

                if (ex.StackTrace != null)
                    mmErrorLogObj.Stack_Trace = ex.StackTrace.ToString();

                if (ex.Source != null)
                    mmErrorLogObj.Source = ex.Source.ToString();

                if (ex.HResult != null)
                    mmErrorLogObj.H_Result = ex.HResult.ToString();

            }
            mmErrorLogObj.BuyoffCode = stationID;
            mmErrorLogObj.Plant_ID = plantID;
            mmErrorLogObj.Shop_ID = shopID;
            mmErrorLogObj.Line_ID = lineID;
            mmErrorLogObj.Inserted_Date = DateTime.Now;
            mmErrorLogObj.Inserted_Host = "sample";
            mmErrorLogObj.Inserted_User_ID = userId;
            db.MM_Error_Log.Add(mmErrorLogObj);
            db.SaveChanges();

            return true;

        }

        public void logUserActivity(decimal? shopID, decimal? lineID, String moduleName, String remarks, DateTime startTime, DateTime? endTime, decimal userID, string userHost)
        {
            try
            {
                MM_UserActivity_Log activityLog = new MM_UserActivity_Log();
                activityLog.Inserted_User_ID = userID;
                activityLog.Inserted_Host = userHost;
                activityLog.Start_Time = startTime;
                activityLog.End_Time = endTime;
                activityLog.Module_Name = moduleName;
                activityLog.Remarks = remarks;
                activityLog.Shop_ID = shopID;
                activityLog.Line_ID = lineID;
                db.MM_UserActivity_Log.Add(activityLog);
                db.SaveChanges();
            }
            catch (Exception exp)
            {
                General genObj = new General();
                genObj.addControllerException(exp, "Helper/General", "logUserActivity(ShopID: " + shopID + ", lineID: " + lineID + ", Modul Name: " + moduleName + ",Remark: " + remarks + ") ");
            }
        }

        //    public bool addPurgeDeletedRecords(int plantId, String tableName, String columnName, String columnValue, String hostName, int userId)
        //    {
        //        try
        //        {
        //            MM_Purge_Deleted_Records purgeDeletedRecordsobj = new MM_Purge_Deleted_Records();
        //            purgeDeletedRecordsobj.Plant_ID = plantId;
        //            purgeDeletedRecordsobj.Table_Name = tableName;
        //            purgeDeletedRecordsobj.Column_Name = columnName;
        //            purgeDeletedRecordsobj.Column_Value = columnValue;
        //            purgeDeletedRecordsobj.Inserted_Host = hostName;
        //            purgeDeletedRecordsobj.Inserted_User_ID = userId;
        //            purgeDeletedRecordsobj.Inserted_Date = DateTime.Now;
        //            db.MM_Purge_Deleted_Records.Add(purgeDeletedRecordsobj);
        //            db.SaveChanges();
        //            return true;
        //        }
        //        catch (Exception ex)
        //        {
        //            return false;
        //        }
        //    }

        public DatetimeList GetStartTimeEndTimeAgainstFrequency(decimal Frequency_ID,DateTime todayDate,bool Is_Shift_Wise, decimal Shop_ID,decimal shiftno,bool isManager)
        {
            DatetimeList obj = new DatetimeList();
            DateTimeExtensionsList exten = new DateTimeExtensionsList();
            if (Frequency_ID == 1)//1   Daily
            {
                if (Is_Shift_Wise == true)
                {
                    obj = exten.GetDailyShiftwise(todayDate, Shop_ID, shiftno, isManager);
                }
                else
                {
                    obj = exten.GetDaily(todayDate, Shop_ID, shiftno, isManager);
                }
            }

            else if (Frequency_ID == 2)  //2   Weekly
            {
                obj = exten.GetWeekly(todayDate, Shop_ID, shiftno, isManager);
            }
            else if (Frequency_ID == 3)   //3   Fortnightly
            {
                obj = exten.GetForthNightly(todayDate, Shop_ID, shiftno, isManager);
            }
            else if (Frequency_ID == 4)   //4   Monthly
            {
                obj = exten.GetMonthly(todayDate, Shop_ID, shiftno, isManager);
            }
            else if (Frequency_ID == 5)     //5   Quarterly
            {
                obj = exten.GetQuarter(todayDate, Shop_ID, shiftno, isManager);
            }
            else if (Frequency_ID == 6)//6   Half Yearly
            {
                obj = exten.GetHalfYearly(todayDate, Shop_ID, shiftno, isManager);
            }
            else if (Frequency_ID == 7) //7   Yearly
            {
                obj = exten.GetYearly(todayDate, Shop_ID, shiftno, isManager);
            }

            return obj;
        }
    }
}