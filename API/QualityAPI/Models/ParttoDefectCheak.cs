using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public class ParttoDefectCheak
    {
        public string Part_Name { get; set; }
        public string Part_Description { get; set; }
        public decimal Plant_ID { get; set; }
        public decimal Defect_ID { get; set; }
        public string Plant_Name { get; set; }
        public string Defect_Name { get; set; }
        public decimal Model_ID { get; set; }
        public string Model_Code { get; set; }
        public String checkListError { get; set; }
        public Boolean IS_Success { get; set; }
        public Boolean IS_Error { get; set; }
        // public Boolean Model_Code { get; set; }
       


    }
}