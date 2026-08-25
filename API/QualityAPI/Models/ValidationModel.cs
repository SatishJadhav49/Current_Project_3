using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public class ValidationModel
    {

        public bool IsErrorAlertNotFound { get; set; }
        public bool IsErrorAlert { get; set; }
    
        public bool isErrorMessage { get; set; }

        public bool isErrorDbupdate { get; set; }

        public bool isExceptionMessage { get; set; }

        public bool IsSuccessAlert { get; set; }

        public bool IsErrorAlertRef { get; set; }
        public bool IsErrorAlertDuplicate { get; set; }
        public string IsMassege { get; set; } 
       public string IsTitle { get; set; }

     
    }
}