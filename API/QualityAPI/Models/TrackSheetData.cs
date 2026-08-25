using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public class TrackSheetData
    {
        public decimal Track_Sheet_ID { get; set; }
        public decimal Audit_ID { get; set; }
        public int Parameter_ID { get; set; }
        public decimal Area_ID { get; set; }
        public decimal Part_ID { get; set; }
        public decimal Checkpoint_ID { get; set; }
        public decimal Location_ID { get; set; }
        public decimal Specification_ID { get; set; }
        public string Reading { get; set; }
        public string Remark { get; set; }
        public decimal Plant_ID { get; set; }
        public decimal Shop_ID { get; set; }
        public decimal Audit_Type_Id { get; set; }
        public Nullable<bool> Is_Transfered { get; set; }
        public Nullable<bool> Is_Purgeable { get; set; }
        public Nullable<bool> Is_Edited { get; set; }
        public Nullable<bool> Is_Deleted { get; set; }
        public string Plant_Code { get; set; }
        public string Inserted_Host { get; set; }
        public Nullable<decimal> Inserted_User_ID { get; set; }
        public Nullable<System.DateTime> Inserted_Date { get; set; }
        public string Updated_Host { get; set; }
        public Nullable<decimal> Updated_User_ID { get; set; }
        public Nullable<System.DateTime> Updated_Date { get; set; }
        public Nullable<decimal> Image_ID { get; set; }
        public Nullable<bool> Is_NA { get; set; }
        public decimal Gap_PIST { get; set; }
        public decimal Gap_Total_Check { get; set; }
        public decimal Gap_Ok { get; set; }
        public decimal Gap_Nok { get; set; }
        public decimal Gap_NA { get; set; }
        public decimal Flush_PIST { get; set; }
        public decimal Flush_Total_Check { get; set; }
        public decimal Flush_Ok { get; set; }
        public decimal Flush_Nok { get; set; }
        public decimal Flush_NA { get; set; }
        public decimal Total_PIST { get; set; }
    }
}