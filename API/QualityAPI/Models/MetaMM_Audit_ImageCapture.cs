using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    [MetadataType(typeof(MM_Audit_ImageCapture))]
    public partial class MM_Audit_ImageCapture
    {
        public byte[] File_Content { get; set; }
        public bool Is_Manager { get; set; }
        public DateTime Selected_Audit_date { get; set; }
        public decimal Selected_Shift_ID { get; set; }

        public decimal Selected_Checkpoint_ID { get; set; }
    }
        public class MetaMM_Audit_ImageCapture
    {
    }
}