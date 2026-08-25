using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public class Count_List_Shopfloor
    {
        public string Stage { get; set; }
        public int Shift_Count   { get; set; }
        public int Day_Count { get; set; }

        public Count_List_Shopfloor(string stage,int shift,int day)
        {
            this.Stage = stage;
            this.Shift_Count = shift;
            this.Day_Count = day;
        }
       
    }
}