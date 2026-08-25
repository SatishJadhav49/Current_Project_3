using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    public class GlobalData
    {
        
        public String messageTitle { get; set; }
        public String messageDetail { get; set; }
        public bool isSuccessMessage { get; set; }
        public bool isErrorMessage { get; set; }
        public bool isAlertMessage { get; set; }
        public bool isDublicateMessage { get; set; }
        public bool isDBErrorMessage { get; set; }
        public dynamic Data { get; set; }

        public string SuccessTitle { get; } = "Save Data Success";
        public string SaveErrorTitle { get; } = "Save Data Error";
        public string UpdateErrorTitle { get; } = "Update Data Error";
        public string DeletionErrorTitle { get; } = "Deletion Error";
        public string UpdateTitle { get; } = "Update Data Success";
        public string DuplicateTitle { get; } = "Duplicate Record Found";
        public string DeletionTitle { get; } = "Deletion Successful";
        public string UploadTitle { get; } = "Upload Successful";
        public string RecordnotFoundTitle { get; } = "Record Not Found";
        public string DeleteConflictTitle { get; } = "Deletion Conflict";
        public string ExceptionTitle { get; } = "Exception Encountered";
        public string SuccessMessage { get; } = "Your data has been successfully saved";
        public string UpdateMessage { get; } = "Your data has been successfully updated";
        public string DuplicateMessage { get; } = "A record with similar details already exists.";
        public string DeletionMessage { get; } = "The record has been successfully deleted.";
        public string UploadMessage { get; } = "Your file has been successfully uploaded and processed.";
        public string SaveErrorMessage { get; } = "An error occurred while saving your data";
        public string UpdateErrorMessage { get; } = "An error occurred while updating your data";
        public string DeleteErrorMessage { get; } = "An error occurred while trying to delete the record.";
        public string RecordNotFoundMessage { get; } = "The requested record could not be found.";
        public string DeleteConflictMessage { get; } = "The record cannot be deleted because it is referenced in another table.";
        public string toYesNo(bool b)
        {
            return b ? "Yes" : "No";
        }

    }

    
}