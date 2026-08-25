using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace QualityAPI.Models
{
    [MetadataType(typeof(MM_Qlty_Image))]
    public partial class MM_Qlty_Image
    {
        public decimal Checkpoint_ID { get; set; }
        public decimal Frequency_ID { get; set; }
        public decimal Shift_ID { get; set; }
        public decimal Audit_ID { get; set; }
        public decimal Tab_ID { get; set; }
    }
    public class MetaMM_Qlty_Image
    {
    }
}