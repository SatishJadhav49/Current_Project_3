using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    [MetadataType(typeof(MM_Audit_Level_Mstr))]
    public partial class MM_Audit_Level_Mstr
    {
        public bool Is_Manager { get; set; }
        public DateTime Selected_Audit_date { get; set; }
        public decimal Selected_Shift_ID { get; set; }

        public decimal Selected_Checkpoint_ID { get; set; }
        public decimal Auditor_User_Id { get; set; }

        public List<First_Level_Mail_ID> First_Level_Mail_ID { get; set; }
        public List<Second_Level_Mail_ID> Second_Level_Mail_ID{ get; set; }

        public int Escalation_Level_ID { get; set; }

        public int First_Duration_Hours { get; set; }

        public int First_Duration_Days { get; set; }

        public int Second_Duration_Hours { get; set; }

        public int Second_Duration_Days { get; set; }
        public string Frequency_Name { get; set; }

        public string Plant_Name { get; set; }
        public string Shop_Name { get; set; }





    }
    public class First_Level_Mail_ID
    {
        public string Email_Address { get; set; }
        public decimal Employee_ID { get; set; }
        public string Employee_Name { get; set; }
    }

    public class Second_Level_Mail_ID
    {
        public string Email_Address { get; set; }
        public decimal Employee_ID { get; set; }
        public string Employee_Name { get; set; }
        
    }
    public class MetaMM_Audit_Level_Mstr
    {
    }
}