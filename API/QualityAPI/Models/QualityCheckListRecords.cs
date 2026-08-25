using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace QualityAPI.Models
{
  
    public class QualityCheckListRecords
    {
        
    public string Part_Name { get; set; }
    public string Part_Description { get; set; }
    public decimal Plant_ID { get; set; }
    public string Plant_Name { get; set; }
    public decimal Model_ID { get; set; }
    public string Model_Code { get; set; }  
    public String checkListError { get; set; }
        public Boolean IS_Success { get; set; }
        public Boolean IS_Error { get; set; }
    }

}