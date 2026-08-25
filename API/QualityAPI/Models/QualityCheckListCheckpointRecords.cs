using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace QualityAPI.Models
{
  
    public class QualityCheckListCheckpointRecords
    {
        public string Plant_Name { get; set; }
        public decimal Plant_ID { get; set; }
        public decimal User_ID { get; set; }
        public string Host_Name { get; set; }
        public string Shop_Name { get; set; }
        public string Checklist_Name { get; set; }    
        public string Checkpoint_Name { get; set; }  
        public string Details_Of_Operation { get; set; }  
        public string Active { get; set; }
        public String checkListError { get; set; }
        public Boolean IS_Success { get; set; }
        public Boolean IS_Error { get; set; }
    }

}