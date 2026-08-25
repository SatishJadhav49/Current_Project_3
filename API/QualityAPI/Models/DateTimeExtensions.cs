using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public class DateTimeExtensions
    {
    }
    public partial class DateTimeExtensionsList
    {
        GlobalOperations global = new GlobalOperations();

        public DateTime GetPost12Shiftdate(DateTime date, decimal shopId, decimal shiftno, bool isManager)
        {
            if(isManager==false)
            {
                MM_Shift currentshift = global.getCurrentRunningShiftByShopID(shopId);
                if (currentshift.Is_PostshiftTimeNextDay == true)
                {
                    DateTime today = DateTime.Now;
                    DateTime after12Time = DateTime.Parse("0001/01/01 00:00:00.001");

                    var result = TimeSpan.Compare(today.TimeOfDay, after12Time.TimeOfDay);
                    // -1  if  today is shorter  than after12Time.
                    //0   if  today is equal to after12Time.
                    //1   if  today is longer than after12Time.
                    if (result == 0 || result == 1)
                    {
                        date = date.AddDays(-1);

                    }
                }
            }
            else
            {
                //MM_Shift currentshift = global.getShiftByShopIDAndShifId(shopId, shiftno);
                //if (currentshift.Is_PostshiftTimeNextDay == true)
                //{
                //    TimeSpan today = currentshift.END_TIME.Value;
                //    DateTime after12Time = DateTime.Parse("0001/01/01 00:00:00.001");

                //    var result = TimeSpan.Compare(today, after12Time.TimeOfDay);
                //    // -1  if  today is shorter  than after12Time.
                //    //0   if  today is equal to after12Time.
                //    //1   if  today is longer than after12Time.
                //    if (result == 0 || result == 1)
                //    {
                //        date = date.AddDays(-1);

                //    }
                //}
            }
        
            return date;
        }
        public  DatetimeList GetQuarter(DateTime date, decimal shopId, decimal shiftno, bool isManager)
        {
            date = GetPost12Shiftdate(date, shopId, shiftno, isManager);
            DatetimeList obj = new DatetimeList();
            if (date.Month <= 3)
            {
                obj.Start_Date = new DateTime(date.Year, 01, 01);
                int lastDate = DateTime.DaysInMonth(date.Year, 03);
                obj.End_Date = new DateTime(date.Year, 03, lastDate);
            }
            else if (date.Month > 3 && date.Month <= 6)
            {
                obj.Start_Date = new DateTime(date.Year, 04, 01);
                int lastDate = DateTime.DaysInMonth(date.Year, 06);
                obj.End_Date = new DateTime(date.Year, 06, lastDate);
            }
            else if (date.Month > 6 && date.Month <= 9)
            {
                obj.Start_Date = new DateTime(date.Year, 07, 01);
                int lastDate = DateTime.DaysInMonth(date.Year, 09);
                obj.End_Date = new DateTime(date.Year, 09, lastDate);
            }
            else if (date.Month > 9 && date.Month <= 12)
            {
                obj.Start_Date = new DateTime(date.Year, 10, 01);
                int lastDate = DateTime.DaysInMonth(date.Year, 12);
                obj.End_Date = new DateTime(date.Year, 12, lastDate);
            }

            return obj;
        }
        public  DatetimeList GetHalfYearly(DateTime date, decimal shopId, decimal shiftno, bool isManager)
        {
            date = GetPost12Shiftdate(date, shopId,shiftno,  isManager);
            DatetimeList obj = new DatetimeList();
            if (date.Month <= 6)
            {
                obj.Start_Date = new DateTime(date.Year, 01, 01);
                int lastDate = DateTime.DaysInMonth(date.Year, 06);
                obj.End_Date = new DateTime(date.Year, 06, lastDate);
            }
            else if (date.Month > 6)
            {
                obj.Start_Date = new DateTime(date.Year, 07, 01);
                int lastDate = DateTime.DaysInMonth(date.Year, 12);
                obj.End_Date = new DateTime(date.Year, 12, lastDate);
            }

            return obj;
        }
        public DatetimeList GetDaily(DateTime date, decimal shopId, decimal shiftno, bool isManager)
        {
             date = GetPost12Shiftdate(date, shopId,shiftno,  isManager);
            DatetimeList obj = new DatetimeList();
           
                obj.Start_Date = new DateTime(date.Year, date.Month, date.Day);
                obj.End_Date = new DateTime(date.Year, date.Month, date.Day);
           
                
            return obj;
        }

      
        public DatetimeList GetDailyShiftwise(DateTime date,decimal shopId,decimal shiftno,bool isManager)
        {
             date = GetPost12Shiftdate(date, shopId,shiftno,  isManager);
            DatetimeList obj = new DatetimeList();
            MM_Shift currentshift = global.getCurrentRunningShiftByShopID(shopId);
            obj.Start_Date = new DateTime(date.Year, date.Month, date.Day);
            obj.End_Date = new DateTime(date.Year, date.Month, date.Day);
            if(isManager==true)
            {
                obj.Shift_Id = shiftno;
            }
            else
            {
                if (currentshift != null)
                {
                    obj.Shift_Id = currentshift.SHIFT_NO;

                }
            }
           


            return obj;
        }
        public DatetimeList GetYearly(DateTime date, decimal shopId, decimal shiftno, bool isManager)
        {
             date = GetPost12Shiftdate(date, shopId,shiftno,  isManager);
            DatetimeList obj = new DatetimeList();

            obj.Start_Date = new DateTime(date.Year, 01 ,01);
            int lastDate = DateTime.DaysInMonth(date.Year, 12);
            obj.End_Date = new DateTime(date.Year, 12, lastDate);


            return obj;
        }

        public DatetimeList GetMonthly(DateTime date, decimal shopId, decimal shiftno, bool isManager)
        {
             date = GetPost12Shiftdate(date, shopId,shiftno,  isManager);
            DatetimeList obj = new DatetimeList();

            obj.Start_Date = new DateTime(date.Year, date.Month, 01);
            int lastDate = DateTime.DaysInMonth(date.Year, date.Month);
            obj.End_Date = new DateTime(date.Year, date.Month, lastDate);


            return obj;
        }

        public DatetimeList GetWeekly(DateTime date, decimal shopId, decimal shiftno, bool isManager)
        {
             date = GetPost12Shiftdate(date, shopId,shiftno,  isManager);
            DatetimeList obj = new DatetimeList();


            DayOfWeek fdow = CultureInfo.CurrentCulture.DateTimeFormat.FirstDayOfWeek;
            int offset = fdow - date.DayOfWeek;
            DateTime fdowDate = date.AddDays(offset+1);

            DateTime ldowDate = fdowDate.AddDays(5);

            obj.Start_Date = new DateTime(fdowDate.Year, fdowDate.Month, fdowDate.Day);
            obj.End_Date = new DateTime(ldowDate.Year, ldowDate.Month, ldowDate.Day);
            obj.WeekNo =Convert.ToInt32(date.DayOfWeek);


            return obj;
        }
        public  DatetimeList GetForthNightly(DateTime date, decimal shopId, decimal shiftno, bool isManager)
        {
             date = GetPost12Shiftdate(date, shopId,shiftno,  isManager);
            DatetimeList obj = new DatetimeList();

            int startDate = date.Day;

            if (startDate <= 15)
            {
                obj.Start_Date = new DateTime(date.Year, date.Month, 01);
                obj.End_Date = new DateTime(date.Year, date.Month, 15);
            }
            else if (startDate > 15)
            {
                int lastDate = DateTime.DaysInMonth(date.Year, date.Month);
                obj.Start_Date = new DateTime(date.Year, date.Month, 16);
                obj.End_Date = new DateTime(date.Year, date.Month, lastDate);
            }

            return obj;
        }

     
      

    }

    public class DatetimeList
    {
        public DateTime Start_Date { get; set; }
        public DateTime End_Date { get; set; }
        public int WeekNo { get; set; }
        public decimal Shift_Id { get; set; }


    }
}