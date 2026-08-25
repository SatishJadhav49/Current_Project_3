using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public partial class MM_Audit_TemConcern
    {
        public decimal Concern_Directory_ID { get; set; }
        //public List<pointerdata> Pointerlist { get; set; }

        public decimal Pointer_ID { get; set; }
        
        public decimal Severity_ID { get; set; }

        public decimal Category_ID { get; set; }

        public decimal Exter_ID { get; set; }

        public string Exterior_Name { get; set; }

        public decimal Defect_ID { get; set; }

        public string Defect_Name { get; set; }

        public decimal Plant_ID { get; set; }
        public string Inserted_Host { get; set; }
        public Nullable<decimal> Inserted_User_ID { get; set; }
        public Nullable<System.DateTime> Inserted_Date { get; set; }
        public string Updated_Host { get; set; }
        public Nullable<decimal> Updated_User_ID { get; set; }
        public Nullable<System.DateTime> Updated_Date { get; set; }
    }
}