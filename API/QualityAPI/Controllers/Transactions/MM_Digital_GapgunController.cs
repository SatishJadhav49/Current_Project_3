using OfficeOpenXml;
using QualityAPI.Helper;
using QualityAPI.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.SqlClient;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Windows.Controls.Primitives;

namespace QualityAPI.Controllers.Transactions
{
    public class MM_Digital_GapgunController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        GlobalOperations global = new GlobalOperations();
        private General generalLogObj = new General();

        [Route("api/MM_Digital_Gapgun/UploadGapgunExcel")]
        [HttpPost]
        public IHttpActionResult UploadGapgunExcel()
        {
            int insertCount = 0;
            string debugMessage = "";
            decimal auditId = 0;

            try
            {
                var httpRequest = HttpContext.Current.Request;

                HttpPostedFile postedFile = httpRequest.Files[0];


                GapgunUploadModel obj = Newtonsoft.Json.JsonConvert
                    .DeserializeObject<GapgunUploadModel>(httpRequest.Params["otherinfo"]);

                if (obj == null)
                {
                    return Ok(new
                    {
                        messageDataObj = new
                        {
                            isErrorMessage = true,
                            messageTitle = "Error",
                            messageDetail = "Invalid request data"
                        }
                    });
                }


                string filePath = HttpContext.Current.Server.MapPath("~/App_Data/" + postedFile.FileName);
                postedFile.SaveAs(filePath);

                ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

                using (var package = new ExcelPackage(new FileInfo(filePath)))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    int rowCount = worksheet.Dimension.Rows;


                    MM_Shift currentShift = global.getCurrentRunningShiftByShopID((int)obj.Shop_ID);

                    if (currentShift == null)
                    {
                        return Ok(new
                        {
                            isErrorMessage = true,
                            messageDetail = "No running shift found"
                        });
                    }

                    decimal shiftId = currentShift.SHIFT_NO;
                    decimal shopId = obj.Shop_ID;

                    decimal defaultAreaId = 0;
                    decimal defaultPartId = 0;

                    string prevVin = "";
                    HashSet<decimal> auditedVehiclesAuditIDs = new HashSet<decimal>();


                    for (int row = 2; row <= rowCount; row++)
                    {
                        try
                        {
                            //  EXCEL READ
                            string VIN = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                            string Model_Code = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                            string dateStr = worksheet.Cells[row, 4].Value?.ToString()?.Trim();
                            string timeStr = worksheet.Cells[row, 5].Value?.ToString()?.Trim();
                            string MeasurementCode = worksheet.Cells[row, 6].Value?.ToString()?.Trim();
                            string Description = worksheet.Cells[row, 7].Value?.ToString()?.Trim();
                            string rawType = worksheet.Cells[row, 8].Value?.ToString()?.Trim();

                            string MeasurementType;

                            if (string.IsNullOrEmpty(rawType) || rawType == "-")
                            {
                                MeasurementType = "gap";   
                            }
                            else if (rawType.Contains("flush"))
                            {
                                MeasurementType = "flush";
                            }
                            else
                            {
                                MeasurementType = "gap";   
                            }

                            string Actual = worksheet.Cells[row, 12].Value?.ToString()?.Trim();

                            if (string.IsNullOrWhiteSpace(VIN) ||
                                string.IsNullOrWhiteSpace(MeasurementCode) ||
                                string.IsNullOrWhiteSpace(Description))
                            {
                                debugMessage += $"Row {row}: Missing required fields\n";
                                continue;
                            }


                            //  DATE TIME CONVERSION
                            DateTime auditDate = DateTime.Now;

                            DateTime parsedDate;
                            DateTime parsedTime;

                            if (DateTime.TryParse(dateStr, out parsedDate))
                            {
                                if (DateTime.TryParse(timeStr, out parsedTime))
                                    auditDate = parsedDate.Date + parsedTime.TimeOfDay;
                                else
                                    auditDate = parsedDate;
                            }
                            

                            if (prevVin != VIN)
                            {
                                //  VIN SEARCH
                                string searchVIN = VIN.Length == 8 ? "%" + VIN : VIN;

                                SQLConnection sc = new SQLConnection();

                                var param = new List<SqlParameter>
                                {
                                    new SqlParameter("@VIN_Number", searchVIN),
                                    new SqlParameter("@BIW_Number", "")
                                };

                                DataSet ds = sc.GetDataSet_SQL(
                                    "SP_GetDataFrom_Vin_Number",
                                    CommandType.StoredProcedure,
                                    param.ToArray(),
                                    null
                                );

                                string biw_no = null;
                                string model_description = null;
                                string color = null;
                                string variant = null;

                                if (ds.Tables[0].Rows.Count > 0)
                                {
                                    var vinData = ds.Tables[0].Rows[0];
                                    biw_no = vinData["BIW_No"]?.ToString();
                                    model_description = vinData["Model_Description"]?.ToString();
                                    color = vinData["Colour_Desc"]?.ToString();
                                    variant = vinData["Variant_name"]?.ToString();
                                }
                                else
                                {
                                    debugMessage += $"Row {row}: VIN no not found\n";
                                }


                                var existingAudit = db.MM_Vehicle_Audit.FirstOrDefault(x =>
                                        x.VIN_No == VIN &&
                                        x.Model_ID == obj.Model_ID
                                    );

                                if (existingAudit != null)
                                {
                                    auditId = existingAudit.Audit_ID;
                                }
                                else
                                {
                                    MM_Vehicle_Audit audit = new MM_Vehicle_Audit
                                    {
                                        VIN_No = VIN,
                                        Model_Code = Model_Code,
                                        Model_ID = obj.Model_ID,

                                        Body_No = biw_no,
                                        Model_Name = model_description,
                                        Color_Name = color,
                                        Variant_Name = variant,
                                        Auditor1_ID = obj.Inserted_User_ID,

                                        Build_Phase_ID = 14,
                                        Audit_Date = auditDate,
                                        Shift_ID = shiftId,

                                        Plant_ID = obj.Plant_ID,
                                        Shop_ID = shopId,
                                        Audit_Type_Id = obj.Audit_Type_Id,
                                        Plant_Code = obj.Plant_Code,

                                        Inserted_Date = DateTime.Now,
                                        Inserted_User_ID = obj.Inserted_User_ID,
                                        Inserted_Host = obj.Inserted_Host,
                                        Active = true,
                                        Is_Gapgun = true
                                    };

                                    db.MM_Vehicle_Audit.Add(audit);
                                    db.SaveChanges();

                                    auditId = audit.Audit_ID;
                                    
                                }
                                prevVin = VIN;
                                auditedVehiclesAuditIDs.Add(auditId);
                            }
                            

                            //   CHECKPOINT FIRST
                            var checkpointData = db.MM_CheckpointMaster
                                .Where(x =>
                                    x.Checkpoint_Name.Trim().ToLower() == Description.Trim().ToLower() &&
                                    x.Shop_ID == shopId &&
                                    x.Model_ID == obj.Model_ID &&
                                    x.Audit_Type_Id == obj.Audit_Type_Id
                                )
                                .FirstOrDefault();

                            if (checkpointData == null)
                            {
                                debugMessage += $"Row {row}: Checkpoint not found\n";
                                continue;
                            }

                            //  LOCATION
                            var locationData = db.MM_LocationMaster
                                                    .Where(x =>
                                                        x.Location_Name.Trim().ToLower() == MeasurementCode.Trim().ToLower() &&
                                                        x.Checkpoint_ID == checkpointData.Checkpoint_ID &&
                                                        x.Shop_ID == shopId &&
                                                        x.Model_ID == obj.Model_ID
                                                    )
                                                    .FirstOrDefault();

                            if (locationData == null)
                            {
                                debugMessage += $"Row {row}: Location not found with checkpoint match\n";
                                continue;
                            }

                            // AREA & PART SAFE HANDLING
                            decimal areaId = locationData.Area_ID.HasValue
                                ? locationData.Area_ID.Value
                                : defaultAreaId;

                            decimal partId = locationData.Part_ID.HasValue
                                ? locationData.Part_ID.Value
                                : defaultPartId;

                            // SPECIFICATION
                            decimal specId = db.MM_SpecificationMaster
                                .Where(x =>
                                    x.Area_ID == areaId &&
                                    x.Part_ID == partId &&
                                    x.Checkpoint_ID == checkpointData.Checkpoint_ID &&
                                    x.Location_ID == locationData.Location_ID &&
                                    x.Model_ID == obj.Model_ID &&
                                    (
                                        (MeasurementType.ToLower().Contains("gap") && x.Is_Gap == true) ||
                                        (MeasurementType.ToLower().Contains("flush") && x.Is_Flushness == true)
                                    )

                                )
                                .Select(x => x.Specification_ID)
                                .FirstOrDefault();

                            if (specId == 0)
                            {
                                debugMessage += $"Row {row}: Specification not found\n";
                                continue;
                            }


                            int parameterId = (MeasurementType == "flush") ? 2 : 1;


                            bool trackExists = db.MM_Track_Sheet.Any(x =>
                                x.Audit_ID == auditId &&
                                x.Location_ID == locationData.Location_ID &&
                                x.Checkpoint_ID == checkpointData.Checkpoint_ID &&
                                x.Parameter_ID == parameterId
                            );

                            if (trackExists)
                            {
                                debugMessage += $"Row {row}: Duplicate Track skipped\n";
                                continue;
                            }


                            MM_Track_Sheet track = new MM_Track_Sheet
                            {
                                Audit_ID = auditId,
                                Location_ID = locationData.Location_ID,
                                Checkpoint_ID = checkpointData.Checkpoint_ID,

                                Area_ID = areaId,
                                Part_ID = partId,
                                Specification_ID = specId,

                                Parameter_ID = parameterId,
                                Reading = Actual,

                                Plant_ID = obj.Plant_ID,
                                Shop_ID = shopId,
                                Audit_Type_Id = obj.Audit_Type_Id,
                                Plant_Code = obj.Plant_Code,

                                Inserted_Date = DateTime.Now,
                                Inserted_User_ID = obj.Inserted_User_ID,
                                Inserted_Host = obj.Inserted_Host,
                            };
                            db.MM_Track_Sheet.Add(track);
                            insertCount++;
                        }
                        catch (Exception rowEx)
                        {
                            debugMessage += $"Row {row}: ERROR {rowEx.Message}\n";
                        }
                    }

                    db.SaveChanges();

                    // 1.Extract unique vin nos from excel sheet - auditedVehiclesAuditIDs

                    // 2. Call function to calculate and save pist data for each vehicle

                    foreach (var val in auditedVehiclesAuditIDs)
                    {
                        UpdateCalculations(val);
                    }

                }

                return Ok(new
                {
                    isSuccessMessage = true,
                    auditId = auditId,
                    messageTitle = "Success",
                    messageDetail = "File uploaded successfully"

                });
            }

            catch (Exception ex)
            {
                return Ok(new
                {
                    isErrorMessage = true,
                    messageDetail = ex.Message
                });
            }
        }

        [Route("api/MM_Digital_Gapgun/GetByVin/{vin}")]
        [HttpGet]
        public IHttpActionResult GetByVin(string vin)
        {
            try
            {
                var data = (from audit in db.MM_Vehicle_Audit
                            join track in db.MM_Track_Sheet
                                on audit.Audit_ID equals track.Audit_ID

                            join area in db.MM_AreaMaster
                                on track.Area_ID equals area.Area_ID

                            join part in db.MM_PartMaster
                                on track.Part_ID equals part.Part_ID

                            join checkpoint in db.MM_CheckpointMaster
                                on track.Checkpoint_ID equals checkpoint.Checkpoint_ID

                            join location in db.MM_LocationMaster
                                on track.Location_ID equals location.Location_ID

                            join spec in db.MM_SpecificationMaster
                                on track.Specification_ID equals spec.Specification_ID

                            where audit.VIN_No == vin && audit.Active == true

                            select new
                            {
                                Audit_ID = audit.Audit_ID,       
                                Model_ID = audit.Model_ID,

                                Type = track.Parameter_ID == 1 ? "Gap" : "Flush",
                                Area_Name = area.Area_Name,
                                Part_Name = part.Part_Name,
                                Checkpoint_Name = checkpoint.Checkpoint_Name,
                                Location_Name = location.Location_Name,
                                Specification_Name = spec.Specification_Name,
                                Reading = track.Reading,
                                Remark = track.Remark,

                                Track_Sheet_ID = track.Track_Sheet_ID, 
                                MinVal = spec.MinVal,
                                MaxVal = spec.MaxVal,
                                Is_NA = false
                            }).ToList();

                return Ok(new
                {
                    isSuccessMessage = true,
                    dataList = data
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    isErrorMessage = true,
                    messageDetail = ex.Message
                });
            }
        }

        public void UpdateCalculations(decimal Audit_ID)
        {
            // 1. Find total gap & flush points added in MM_Track_Sheet table for Audit_ID

            var trackData = db.MM_Track_Sheet
                    .Where(x => x.Audit_ID == Audit_ID)
                    .Join(db.MM_SpecificationMaster,
                        t => t.Specification_ID,
                        s => s.Specification_ID,
                        (t, s) => new
                        {
                            t.Parameter_ID,
                            t.Reading,
                            //Is_NA = (t.Reading == null),
                            MinVal = s.MinVal,
                            MaxVal = s.MaxVal
                        })
                    .ToList();

            if (!trackData.Any()) return;

            int gapOk = 0, gapNok = 0, gapNA = 0;
            int flushOk = 0, flushNok = 0, flushNA = 0;

            foreach (var item in trackData)
            {
                bool isGap = item.Parameter_ID == 1; // 1 = Gap

                //  CHECK NULL / EMPTY
                if (string.IsNullOrEmpty(item.Reading))
                {
                    if (isGap) gapNA++;
                    else flushNA++;
                    continue;
                }

                //bool isNA = item.Reading == null;


                //  CONVERT STRING -> DECIMAL
                decimal readingValue;
                bool isValid = decimal.TryParse(item.Reading, out readingValue);

                if (!isValid)
                {
                    // treat invalid as NA
                    if (isGap) gapNA++;
                    else flushNA++;
                    continue;
                }

                if (isGap)
                {
                    if (readingValue > item.MaxVal || readingValue < item.MinVal)
                        gapNok++;
                    else
                        gapOk++;
                }
                else
                {
                    if (readingValue > item.MaxVal || readingValue < item.MinVal)
                        flushNok++;
                    else
                        flushOk++;
                }

            }


            // 2. Based on extracted data calculate PIST

            decimal gapPist = 0, flushPist = 0, totalPist = 0;

            int totalGapChecked = gapOk + gapNok;
            int totalFlushChecked = flushOk + flushNok;

            if (totalGapChecked > 0)
                gapPist = Math.Round(((decimal)gapOk / totalGapChecked) * 100, 2);

            if (totalFlushChecked > 0)
                flushPist = Math.Round(((decimal)flushOk / totalFlushChecked) * 100, 2);

            int totalChecked = totalGapChecked + totalFlushChecked;

            if (totalChecked > 0)
                totalPist = Math.Round(((decimal)(gapOk + flushOk) / totalChecked) * 100, 2);





            // 3. Update MM_Vehicle_Audit table row for that Audit_ID

            var audit = db.MM_Vehicle_Audit.FirstOrDefault(x => x.Audit_ID == Audit_ID);

            if (audit != null)
            {
                audit.Gap_PIST = gapPist;
                audit.Gap_Total_Check = gapOk + gapNok + gapNA;
                audit.Gap_Ok = gapOk;
                audit.Gap_Nok = gapNok;
                audit.Gap_NA = gapNA;

                audit.Flush_PIST = flushPist;
                audit.Flush_Total_Check = flushOk + flushNok + flushNA;
                audit.Flush_Ok = flushOk;
                audit.Flush_Nok = flushNok;
                audit.Flush_NA = flushNA;

                audit.Total_PIST = totalPist;

                db.SaveChanges();
            }


        }

    }
}

public class GapgunUploadModel
{
    public decimal? Area_ID { get; set; }
    public decimal? Part_ID { get; set; }
    public decimal? Specification_ID { get; set; }
    public decimal Plant_ID { get; set; }
    public decimal Shop_ID { get; set; }
    public string Plant_Code { get; set; }
    public decimal Model_ID { get; set; }
    public decimal Auditor1_ID { get; set; }
    public decimal Audit_Type_Id { get; set; }
    public decimal Inserted_User_ID { get; set; }
    public string Inserted_Host { get; set; }
}
