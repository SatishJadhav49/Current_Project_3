using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public class MasterDashboardCount
    {
        public int Shift1 { get; set; }
        public int Shift2 { get; set; }
        public int Shift3 { get; set; }
        public int Number_of_Defects { get; set; }
        public int Total_Number_of_No_Defects { get; set; }
        public int Total_Number_Engines { get; set; }
        public decimal DPT { get; set; }

        public decimal FRC { get; set; }
        public decimal PPM { get; set; }
        public string Shop_Name { get; set; }
        public int Shop_ID { get; set; }

    }
}