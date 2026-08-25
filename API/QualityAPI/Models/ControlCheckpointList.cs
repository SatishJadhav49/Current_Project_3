using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public class ControlCheckpointList
    {
        public decimal Audit_Control_ID { get; set; }
        public string Audit_Control_Column_Name { get; set; }
        public string Audit_Control_Description { get; set; }
        public decimal Control_ID { get; set; }
        public decimal Checkpoint_ID { get; set; }

        public decimal Table_ID { get; set; }
        public decimal Audit_ID { get; set; }
        public decimal Tab_ID { get; set; }
        public int Sort_Order { get; set; }
        public bool Is_Compulsory { get; set; }
        public bool Tab_Submitted { get; set; }

        public decimal Plant_ID { get; set; }
        public decimal Shop_ID { get; set; }
        public decimal Line_ID { get; set; }
        public decimal Platform_ID { get; set; }
        public bool Is_Transfered { get; set; }
        public bool Is_Purgeable { get; set; }
        public bool Is_Edited { get; set; }
        public decimal Inserted_User_ID { get; set; }
        public System.DateTime Inserted_Date { get; set; }
        public decimal Updated_User_ID { get; set; }
        public System.DateTime Updated_Date { get; set; }
    }
}