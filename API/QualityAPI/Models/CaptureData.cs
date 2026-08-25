using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public class CaptureData
    {
          

        public decimal Employee_ID { get; set; }
        public decimal Checkpoint_ID { get; set; }
        public string Audit_Control_Column_Name { get; set; }
        public string Plant_Name { get; set; }
        public int Sort_Order { get; set; }

        public String checkListError { get; set; }
        public Boolean IS_Column_Check { get; set; }
        public Boolean IS_Error { get; set; }
 
        }
}