using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public class DefectCheck
    {
        public decimal Plant_ID { get; set; }
        public string Defect_Name { get; set; }
        public string Plant_Name { get; set; }
        public string Defect_Desc { get; set; }

        public String checkListError { get; set; }
        public Boolean IS_Success { get; set; }
        public Boolean IS_Error { get; set; }
    }
}