using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public class MenuRoles
    {
        public decimal Role_ID { get; set; }
        public string Role_Name { get; set; }
        public string Role_Description { get; set; }
        public long Menu_Role_ID { get; set; }
        public decimal Plant_ID { get; set; }
        public int Sucess { get; set; }
        public long Menu_ID { get; set; }
        public long Sub_Menu_ID { get; set; }
        public string Inserted_Host { get; set; }
        public Nullable<decimal> Inserted_User_ID { get; set; }
        public Nullable<System.DateTime> Inserted_Date { get; set; }
        public string Updated_Host { get; set; }
        public Nullable<decimal> Updated_User_ID { get; set; }
        public Nullable<System.DateTime> Updated_Date { get; set; }
        public Nullable<bool> Is_Transfered { get; set; }
        public Nullable<bool> Is_Purgeable { get; set; }
        public Nullable<bool> Is_Edited { get; set; }
        public Nullable<bool> Is_Show_Documentations { get; set; }
        public string Technical_Documentations { get; set; }
        public string Functional_Documentations { get; set; }
        public Nullable<decimal> Audit_Type_Id { get; set; }

    }
}