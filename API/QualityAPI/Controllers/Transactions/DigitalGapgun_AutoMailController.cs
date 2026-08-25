using QualityAPI.Controllers.Transactions;
using QualityAPI.Helper;
using QualityAPI.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Http;
using System.Web.UI.WebControls;
using System.Windows.Media.Media3D;

namespace QualityAPI.Controllers.Transactions
{
    public class DigitalGapgun_AutoMailController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        private General generalLogObj = new General();


        GlobalData messageDataObj = new GlobalData();
        GlobalOperations gbOperation = new GlobalOperations();

        [Route("api/DigitalGapgun_AutoMailController/SendAuditMail/{Audit_Date},{Model_ID}")]
        [HttpPost]
        [ActionName("SendAuditMail")]
        public IHttpActionResult SendAuditMail(string Audit_Date, decimal Model_ID)
        {
            try
            {
                DateTime reportDate;
                if (!TryParseAuditDate(Audit_Date, out reportDate))
                {
                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = "Invalid Date";
                    this.messageDataObj.messageDetail = "Unable to parse Audit_Date: " + Audit_Date;
                    return Ok(new { messageDataObj, });
                }

                // Get email addresses from model table based on Model_ID
                var modelEmailData = (from model in db.MM_Model
                                      where model.Model_ID == Model_ID
                                      select new
                                      {
                                          Model_Name = model.Model_Name,
                                          To_Email = model.Email_Addresses
                                      }).FirstOrDefault();
                if (modelEmailData == null || string.IsNullOrEmpty(modelEmailData.To_Email))
                {

                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = "Email Not Configured";
                    this.messageDataObj.messageDetail = "No email addresses configured for Model: ";
                    return Ok(new { messageDataObj, });
                }

                var historicalAuditDates = GetPreviousAuditDates(Model_ID, reportDate, 5);

                // Step 1: Get Audit Data
                var AuditData = GetAuditData(reportDate, Model_ID);
                if (AuditData == null)
                {
                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = "Data Not Found";
                    this.messageDataObj.messageDetail = "Audit data not found for Audit_Date: " + reportDate.ToString("dd-MMM-yyyy") + " and Model_ID: " + Model_ID;
                    return Ok(new { messageDataObj, });
                }

                // Step 2: Get Concerns Data
                var ConcernsData = GetConcernData(reportDate, Model_ID, historicalAuditDates);
                if (ConcernsData == null)
                {
                    ConcernsData = new List<DigitalConcernData>();
                }



                // Step 3: Prepare Subject
                var Subject = " Digital Gapgun Report of " + AuditData.Model_Name + " : " + reportDate.ToString("dd-MMM-yyyy");

                // Step 4: Prepare Report Link
                var VIN = AuditData.Audit_Type_Id == 1 ? AuditData.RepresentativeVIN_NO : AuditData.RepresentativeBIW_NO;
                var ReportLink = "http://mmnsk1drsv/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK"
                                                                   + "&Plant_ID=1"
                                                                   + "&VIN_Number=" + VIN
                                                                   + "&Audit_Type_Id=" + AuditData.Audit_Type_Id;


                // Step 5: Map Data to Mail Body
                var MailBody = MapDataToMailBody(AuditData, ConcernsData, historicalAuditDates, ReportLink, Model_ID);
                if (string.IsNullOrEmpty(MailBody))
                {
                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = "Error";
                    this.messageDataObj.messageDetail = "Failed to generate mail body";
                    return Ok(new { messageDataObj, });
                }

                // Configure SMTP settings
                SmtpClient smtp_server = new SmtpClient();
                string smtpHostName = null;
                string username = null;
                string password = "";
                string port = null;

                string userEmail = null;
                smtpHostName = System.Configuration.ConfigurationManager.AppSettings["SMTP_SERVER"];
                username = System.Configuration.ConfigurationManager.AppSettings["SMTP_USER_NAME"];
                port = System.Configuration.ConfigurationManager.AppSettings["SMTP_PORT"];

                userEmail = System.Configuration.ConfigurationManager.AppSettings["SMTP_USER_EMAIL"];
                password = System.Configuration.ConfigurationManager.AppSettings["SMTP_PASSWORD"];
                if (smtpHostName == null || username == null || password == null || userEmail == null)
                {
                    throw new Exception("SMTP configuration is missing.");
                }

                smtp_server.UseDefaultCredentials = false;

                smtp_server.Credentials = new System.Net.NetworkCredential(username, password);
                smtp_server.Host = smtpHostName;
                var fromAddress = "GapGunDronaModule@mahindra.com";
                MailMessage email = new MailMessage
                {
                    From = new MailAddress(fromAddress),
                    Subject = Subject,
                    Body = MailBody,
                    IsBodyHtml = true
                };

                if (modelEmailData != null)
                {
                    var toEmails = modelEmailData.To_Email.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                    foreach (var toEmail in toEmails)
                    {
                        email.To.Add(toEmail.Trim());
                    }
                }
                //email.To.Add("jadhav.satish4@mahindra.com");
                email.CC.Add("jadhav.satish4@mahindra.com");


                // Send email
                smtp_server.Send(email);

                this.messageDataObj.isErrorMessage = false;
                this.messageDataObj.isSuccessMessage = true;
                this.messageDataObj.messageTitle = "Mail Sent Successfully";
                this.messageDataObj.messageDetail = "Mail of audit report has been succefully sent to model managers";
                return Ok(messageDataObj);
            }
            catch (SmtpException smtpNotFound)
            {
                // General genObj = new General();
                if (smtpNotFound.InnerException != null)
                {
                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = this.messageDataObj.RecordnotFoundTitle;
                    this.messageDataObj.messageDetail = "SMTP Not found " + smtpNotFound.Message;
                    return Ok(messageDataObj);
                }
                else
                {
                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = this.messageDataObj.RecordnotFoundTitle;
                    this.messageDataObj.messageDetail = "SMTP Not found " + smtpNotFound.InnerException;
                    return Ok(messageDataObj);
                }
            }
            catch (Exception exp)
            {
                this.messageDataObj.isErrorMessage = true;
                this.messageDataObj.messageTitle = "Error";
                this.messageDataObj.messageDetail = exp.Message;
                //string error = e.Message;
                return Ok(messageDataObj);
            }
        }

        [Route("api/DigitalGapgun_AutoMailController/GetAuditMailPreview/{Audit_Date},{Model_ID}")]
        [HttpGet]
        public IHttpActionResult GetAuditMailPreview(string Audit_Date, decimal Model_ID)
        {
            try
            {
                DateTime reportDate;
                if (!TryParseAuditDate(Audit_Date, out reportDate))
                {
                    return Ok(new AuditMailPreviewResponse
                    {
                        IsSuccessMessage = false,
                        MessageDetail = "Invalid Audit Date"
                    });
                }
                var historicalAuditDates = 
                    GetPreviousAuditDates(Model_ID, reportDate, 5);
                var auditData = 
                    GetAuditData(reportDate, Model_ID);
                if (auditData == null)
                {
                    return Ok(new AuditMailPreviewResponse
                    {
                        IsSuccessMessage = false,
                        MessageDetail = "Audit data not found"
                    });
                }

       var concernsData = 
                    GetConcernData(
                        reportDate,
                        Model_ID,
                        historicalAuditDates); 
                if (concernsData == null) 
                { 
                    concernsData = new List<DigitalConcernData>(); 
                }

        string VIN = 
                    auditData.Audit_Type_Id == 1
                    ? auditData.RepresentativeVIN_NO
                    : auditData.RepresentativeBIW_NO;
                string reportLink = 
                    "https://mmnsk1drsv.corp.mahindra.com/DronaRep/Pages/ReportViewer.aspx"
                    + "?%2fPQ+Dashboard%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK"
                    + "&Plant_ID=1"
                    + "&VIN_Number=" + VIN
                    + "&Audit_Type_Id=" + auditData.Audit_Type_Id; 
                string mailBody = 
                    MapDataToMailBody(
                        auditData,
                        concernsData,
                        historicalAuditDates,
                        reportLink,
                        Model_ID); 
                return Ok(new AuditMailPreviewResponse { 
                    IsSuccessMessage = true,
                    Audit_ID = auditData.Audit_ID, 
                    HtmlBody = mailBody }); 
            }
            catch (Exception ex)
            { 
                generalLogObj.addControllerException(
                    ex, 
                    "DigitalGapgun_AutoMailController", 
                    "GetAuditMailPreview"); 
                return Ok(new AuditMailPreviewResponse { 
                    IsSuccessMessage = false, 
                    MessageDetail = ex.Message }); 
            }
        }


        public DigitalAuditData GetAuditData(DateTime reportDate, decimal Model_ID)
        {
            try
            {
                var dailyAudits = db.MM_Vehicle_Audit
                    .Where(x =>
                        x.Is_Gapgun == true &&
                        x.Model_ID == Model_ID &&
                        x.Audit_Date.Year == reportDate.Year &&
                        x.Audit_Date.Month == reportDate.Month &&
                        x.Audit_Date.Day == reportDate.Day)
                    .ToList();

                if (dailyAudits.Count == 0)
                    return null;

                decimal totalChecked = dailyAudits.Sum(x =>
                (x.Gap_Total_Check ?? 0) + (x.Flush_Total_Check ?? 0));
                decimal totalOK = dailyAudits.Sum(x =>
                (x.Gap_Ok ?? 0) + (x.Flush_Ok ?? 0));
                decimal totalNOK = dailyAudits.Sum(x =>
                (x.Gap_Nok ?? 0) + (x.Flush_Nok ?? 0));
                decimal totalNA = dailyAudits.Sum(x =>
                (x.Gap_NA ?? 0) + (x.Flush_NA ?? 0));
                decimal totalPIST = totalChecked > 0
                    ? Math.Round((totalOK * 100) / totalChecked, 2)
                    : 0;
                int totalVehiclesAudited = dailyAudits.Count();

                var representativeAudit = dailyAudits
                    .OrderByDescending(x => x.Audit_Date)
                    .ThenByDescending(x => x.Audit_ID)
                    .FirstOrDefault();

                var modelName = db.MM_Model
                    .Where(x => x.Model_ID == Model_ID)
                    .Select(x => x.Model_Name)
                    .FirstOrDefault();

                var representativeAuditorName = (from emp in db.MM_Employee
                                                 where emp.Employee_ID == representativeAudit.Auditor1_ID
                                                 select emp.Employee_Name).FirstOrDefault();

                var representativeAuditTypeName = (from atype in db.Audit_Type_Master
                                                   where atype.Audit_Type_Id == representativeAudit.Audit_Type_Id
                                                   select atype.Audit_Type).FirstOrDefault();

                var auditData = new DigitalAuditData
                {
                    Audit_ID = representativeAudit.Audit_ID,
                    VIN_NO = "DAY WISE REPORT",
                    RepresentativeVIN_NO = GetDisplayVehicleNumber(representativeAudit.VIN_No, representativeAudit.Body_No),
                    RepresentativeBIW_NO = representativeAudit.Body_No,
                    BIW_NO = representativeAudit.Body_No,
                    Variant = representativeAudit.Variant_Name,
                    Audit_Date = reportDate.Date,
                    Model_Name = modelName ?? representativeAudit.Model_Name,
                    Auditor_Name = representativeAuditorName ?? string.Empty,
                    Total_Pist = totalPIST,
                    Total_Checked = totalChecked,
                    Total_OK = totalOK,
                    Total_NOK = totalNOK,
                    Total_NA = totalNA,
                    Total_Vehicles_Audited_Today = totalVehiclesAudited,
                    Audit_Type_Id = representativeAudit.Audit_Type_Id,
                    Audit_Type_Name = string.IsNullOrEmpty(representativeAuditTypeName) ? "Audit" : representativeAuditTypeName,
                    ReportDate = reportDate.Date
                };

                return auditData;
            }
            catch (Exception ex)
            {
                generalLogObj.addControllerException(ex, "DigitalGapgun_AutoMailController", "GetAuditData(" + reportDate + "," + Model_ID + ")");
                return null;
            }
        }


        public List<DigitalConcernData> GetConcernData(DateTime reportDate, decimal Model_ID, List<DateTime> historicalAuditDates)
        {
            try
            {
                var currentAuditIds = db.MM_Vehicle_Audit
                    .Where(x =>
                        x.Is_Gapgun == true &&
                        x.Model_ID == Model_ID &&
                        x.Audit_Date.Year == reportDate.Year &&
                        x.Audit_Date.Month == reportDate.Month &&
                        x.Audit_Date.Day == reportDate.Day)
                    .Select(x => x.Audit_ID)
                    .ToList();

                if (currentAuditIds.Count == 0)
                    return new List<DigitalConcernData>();

                var currentRows = (from audit in db.MM_Vehicle_Audit
                                   join sheet in db.MM_Track_Sheet
                                       on audit.Audit_ID equals sheet.Audit_ID
                                   where audit.Is_Gapgun == true
                                         && audit.Model_ID == Model_ID
                                         && currentAuditIds.Contains(audit.Audit_ID)
                                   select new
                                   {
                                       audit.Audit_ID,
                                       audit.VIN_No,
                                       audit.Body_No,
                                       audit.Model_Name,
                                       audit.Model_Code,
                                       audit.Audit_Date,
                                       TypeName = sheet.MM_Gap_And_FlushMaster.Type,
                                       sheet.Part_ID,
                                       PartName = sheet.MM_PartMaster.Part_Name,
                                       sheet.Checkpoint_ID,
                                       CheckpointName = sheet.MM_CheckpointMaster.Checkpoint_Name,
                                       sheet.Location_ID,
                                       LocationName = sheet.MM_LocationMaster.Location_Name,
                                       SpecificationName = sheet.MM_SpecificationMaster.Specification_Name,
                                       sheet.Parameter_ID,
                                       sheet.Reading,
                                       sheet.Remark,
                                       MinVal = sheet.MM_SpecificationMaster.MinVal,
                                       MaxVal = sheet.MM_SpecificationMaster.MaxVal,
                                       Inserted_Date = sheet.Inserted_Date
                                   }).ToList();

                var currentConcernRows = currentRows
                    .Select(x =>
                    {
                        decimal readingValue;
                        decimal? parsedReading = TryParseDecimalInvariant(x.Reading, out readingValue) ? (decimal?)readingValue : null;

                        decimal? usagePercent = CalculateUsagePercent(parsedReading, x.MinVal, x.MaxVal);

                        return new
                        {
                            x.Audit_ID,
                            x.VIN_No,
                            x.Body_No,
                            x.Model_Name,
                            x.Model_Code,
                            x.Audit_Date,
                            x.TypeName,
                            x.Part_ID,
                            x.PartName,
                            x.Checkpoint_ID,
                            x.CheckpointName,
                            x.Location_ID,
                            x.LocationName,
                            x.SpecificationName,
                            x.Parameter_ID,
                            x.Reading,
                            x.Remark,
                            x.MinVal,
                            x.MaxVal,
                            x.Inserted_Date,
                            ParsedReading = parsedReading,
                            UsagePercent = usagePercent
                        };
                    })
                    .Where(x => x.UsagePercent.HasValue && x.UsagePercent.Value > 150)
                    .GroupBy(x => new
                    {
                        x.Part_ID,
                        x.Checkpoint_ID,
                        x.Location_ID,
                        x.Parameter_ID,
                        x.SpecificationName,
                        x.TypeName,
                        x.PartName,
                        x.CheckpointName,
                        x.LocationName
                    })
                    .Select(g =>
                    {
                        var worstRow = g.OrderByDescending(x => x.UsagePercent.Value).ThenByDescending(x => x.Inserted_Date).First();

                        return new DigitalConcernData
                        {
                            Audit_ID = worstRow.Audit_ID,
                            VIN_No = !string.IsNullOrEmpty(worstRow.VIN_No) && worstRow.VIN_No.Length == 17 ? worstRow.VIN_No.Substring(9) : worstRow.VIN_No,
                            Body_No = worstRow.Body_No,
                            Model_Name = worstRow.Model_Name,
                            Model_Code = worstRow.Model_Code,
                            Audit_Date = worstRow.Audit_Date,
                            Type = worstRow.TypeName,
                            Part_ID = worstRow.Part_ID,
                            Part_Name = worstRow.PartName,
                            Checkpoint_ID = worstRow.Checkpoint_ID,
                            Checkpoint_Name = worstRow.CheckpointName,
                            Location_ID = worstRow.Location_ID,
                            Location_Name = worstRow.LocationName,
                            Specification_Name = worstRow.SpecificationName,
                            Parameter_ID = worstRow.Parameter_ID,
                            Reading = worstRow.Reading,
                            Remark = worstRow.Remark,
                            MinVal = worstRow.MinVal,
                            MaxVal = worstRow.MaxVal,
                            LastReadings = BuildHistoricalReadingsForConcern(Model_ID, worstRow.Part_ID, worstRow.Checkpoint_ID, worstRow.Location_ID, worstRow.Parameter_ID, historicalAuditDates)
                        };
                    })
                    .ToList();

                foreach (var concern in currentConcernRows)
                {
                    concern.SeverityRank = GetConcernSeverityRank(concern);
                }

                currentConcernRows = currentConcernRows
                    .OrderBy(x => x.SeverityRank)
                    .ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;

                return currentConcernRows;
            }
            catch (Exception ex)
            {
                generalLogObj.addControllerException(ex, "DigitalGapgun_AutoMailController", $"GetConcernData({reportDate},{Model_ID})");
                return new List<DigitalConcernData>();
            }
        }



        private string MapDataToMailBody(DigitalAuditData auditData, List<DigitalConcernData> concernsData, List<DateTime> historicalAuditDates, string ReportLink, decimal modelId)
        {
            try
            {
                // Validate input data
                if (auditData == null)
                {
                    throw new Exception("Audit data is null");
                }

                if (concernsData == null)
                {
                    concernsData = new List<DigitalConcernData>();
                }

                // Read the HTML template
                string templatePath = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/Template/DigitalGapgun_Audit_Report.html");
                string htmlTemplate = File.ReadAllText(templatePath);

                // Map Audit Summary
                htmlTemplate = htmlTemplate.Replace("[VIN_NO]", auditData.VIN_NO ?? "N/A");
                htmlTemplate = htmlTemplate.Replace("[MODEL]", auditData.Model_Name ?? "N/A");
                htmlTemplate = htmlTemplate.Replace("[VARIANT]", auditData.Variant ?? "N/A");
                htmlTemplate = htmlTemplate.Replace("[AUDIT_DATE]", auditData.Audit_Date.ToString("dd-MMM-yyyy"));
                htmlTemplate = htmlTemplate.Replace("[AUDITOR_NAME]", auditData.Auditor_Name ?? "N/A");
                htmlTemplate = htmlTemplate.Replace("[TOTAL_PIST]", auditData.Total_Pist.ToString() ?? "N/A");
                htmlTemplate = htmlTemplate.Replace("[TOTAL_CHECKED]", auditData.Total_Checked.ToString() ?? "N/A");
                htmlTemplate = htmlTemplate.Replace("[TOTAL_OK]", auditData.Total_OK.ToString() ?? "N/A");
                htmlTemplate = htmlTemplate.Replace("[TOTAL_NOK]", auditData.Total_NOK.ToString() ?? "N/A");
                htmlTemplate = htmlTemplate.Replace("[TOTAL_NA]", auditData.Total_NA.ToString() ?? "N/A");
                htmlTemplate = htmlTemplate.Replace("[AUDIT_TYPE]", auditData.Audit_Type_Name ?? "Audit");
                htmlTemplate = htmlTemplate.Replace("[TOTAL_VEHICLES_AUDITED_TODAY]", auditData.Total_Vehicles_Audited_Today.ToString());

                var partWiseSummary = GetPartWiseSummary(auditData.Audit_Date, modelId);
                htmlTemplate = MapPartWiseSummary(htmlTemplate, partWiseSummary);

                // Map Concern Details (Dynamic Rows)
                htmlTemplate = MapConcernDetails(htmlTemplate, concernsData, historicalAuditDates);

                // Map Footer
                htmlTemplate = htmlTemplate.Replace("[PLANT_NAME]", "Nashik Plant");
                htmlTemplate = htmlTemplate.Replace("[GENERATED_DATE]", DateTime.Now.ToString("dd-MMM-yyyy HH:mm"));

                // Map Report URL
                htmlTemplate = htmlTemplate.Replace("[REPORT_URL]", ReportLink);

                return htmlTemplate;
            }
            catch (Exception ex)
            {
                generalLogObj.addControllerException(ex, "DigitalGapgun_AutoMailController", "MapDataToMailBody");
                return string.Empty;
            }
        }

        private string MapConcernDetails(string htmlTemplate, List<DigitalConcernData> concernsData, List<DateTime> historicalAuditDates)
        {
            var rows = new StringBuilder();

            var formattedDates = new List<string>();
            if (historicalAuditDates != null)
            {
                foreach (var historicalDate in historicalAuditDates
                    .OrderByDescending(x => x.Date))
                {
                    formattedDates.Add(historicalDate.ToString("dd-MM"));
                }
            }

            while (formattedDates.Count < 5)
            {
                formattedDates.Add(string.Empty);
            }

            htmlTemplate = htmlTemplate.Replace("[READING_DATE1]", formattedDates[0]);
            htmlTemplate = htmlTemplate.Replace("[READING_DATE2]", formattedDates[1]);
            htmlTemplate = htmlTemplate.Replace("[READING_DATE3]", formattedDates[2]);
            htmlTemplate = htmlTemplate.Replace("[READING_DATE4]", formattedDates[3]);
            htmlTemplate = htmlTemplate.Replace("[READING_DATE5]", formattedDates[4]);

            if (concernsData == null || concernsData.Count == 0)
            {
                rows.Append(@"
                                <tr>
                                    <td colspan=""12"" style=""padding: 12px; color: #10b981; font-size: 13px; text-align: center; border: 1px solid #e5e7eb; font-weight: 600;"">
                                        ✓ No CTQ concerns found - All points are within range
                                    </td>
                                </tr>");
            }
            else
            {
                foreach (var c in concernsData)
                {
                    string type = HttpUtility.HtmlEncode(c.Type ?? "N/A");
                    string part = HttpUtility.HtmlEncode(c.Part_Name ?? "N/A");
                    string checkpoint = HttpUtility.HtmlEncode(c.Checkpoint_Name ?? "N/A");
                    string location = HttpUtility.HtmlEncode(c.Location_Name ?? "N/A");
                    string specification = HttpUtility.HtmlEncode(c.Specification_Name ?? "N/A");
                    string reading = HttpUtility.HtmlEncode(string.IsNullOrWhiteSpace(c.Reading) ? "N/A" : c.Reading);
                    //string remark = HttpUtility.HtmlEncode(string.IsNullOrWhiteSpace(c.Remark) ? "—" : c.Remark);

                    var lastAverageReadings = new List<string>();

                    if (c.LastReadings != null)
                    {
                        foreach (var r in c.LastReadings)
                        {
                            lastAverageReadings.Add(HttpUtility.HtmlEncode(string.IsNullOrWhiteSpace(r.Reading) ? " " : r.Reading));
                        }
                    }

                    while (lastAverageReadings.Count < 5) lastAverageReadings.Add(string.Empty);

                    Func<string, decimal?, decimal?, string> readingCell =
                             (readingText, minVal, maxVal) =>
                             {
                                 string bgColor = "transparent";
                                 string textColor = "#1f2937";

                                 decimal readingValue;

                                 if (decimal.TryParse(readingText, out readingValue)
                                     && minVal.HasValue
                                     && maxVal.HasValue)
                                 {
                                     decimal center = (minVal.Value + maxVal.Value) / 2;

                                     decimal halfTolerance = (maxVal.Value - minVal.Value) / 2;

                                     if (halfTolerance > 0)
                                     {
                                         decimal usagePercent =
                                             Math.Abs(readingValue - center) * 100 / halfTolerance;

                                         if (usagePercent > 150)
                                         {
                                             bgColor = "#dc2626";      // Red
                                             textColor = "#ffffff";
                                         }
                                         else if (usagePercent > 100)
                                         {
                                             bgColor = "#e8e823";      // Yellow
                                             textColor = "#1f2937";
                                         }
                                         else
                                         {
                                             bgColor = "#10b981";      // Green
                                             textColor = "#ffffff";
                                         }
                                     }
                                 }

                                 return $@"
                         <td style='padding:8px;
                                    color:{textColor};
                                    background-color:{bgColor};
                                    font-size:12px;
                                    border:1px solid #e5e7eb;
                                    text-align:center;'>
                             {readingText}
                         </td>";
                             };

                    // Build row with 12 columns
                    rows.Append($@"
                                    <tr>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{type}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{part}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{checkpoint}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{location}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{specification}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{reading}</td>
                                       {readingCell(lastAverageReadings[0], c.MinVal, c.MaxVal)}
                                       {readingCell(lastAverageReadings[1], c.MinVal, c.MaxVal)}
                                       {readingCell(lastAverageReadings[2], c.MinVal, c.MaxVal)}
                                       {readingCell(lastAverageReadings[3], c.MinVal, c.MaxVal)}
                                       {readingCell(lastAverageReadings[4], c.MinVal, c.MaxVal)}
                                    </tr>");
                }
            }

            return htmlTemplate.Replace("[CONCERN_ROWS]", rows.ToString());
        }

        private string MapPartWiseSummary(string htmlTemplate, List<DigitalPartSummaryData> partWiseSummary)
        {
            var rows = new StringBuilder();

            if (partWiseSummary == null || partWiseSummary.Count == 0)
            {
                rows.Append(@"
                                <tr>
                                    <td colspan=""5"" style=""padding: 12px; color: #6b7280; font-size: 13px; text-align: center; border: 1px solid #e5e7eb; font-weight: 600;"">
                                        No part wise summary available
                                    </td>
                                </tr>");
            }
            else
            {
                foreach (var part in partWiseSummary)
                {
                    rows.Append($@"
                                    <tr>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{HttpUtility.HtmlEncode(part.Part_Name ?? "N/A")}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb; text-align:center; font-weight:600;"">{part.Total_PIST:0.##}%</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb; color:#10b981; text-align:center;"">{part.Total_OK}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb; color:#dc2626; text-align:center;"">{part.Total_NOK}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb; text-align:center;"">{part.Total_Checked}</td>
                                    </tr>");
                }
            }

            return htmlTemplate.Replace("[PARTWISE_ROWS]", rows.ToString());
        }

        private List<DateTime> GetPreviousAuditDates(decimal Model_ID, DateTime reportDate, int count)
        {
            return db.MM_Vehicle_Audit
                .Where(x =>
                    x.Is_Gapgun == true &&
                    x.Model_ID == Model_ID &&
                    x.Audit_Date < reportDate.Date)
                .Select(x => x.Audit_Date)
                .ToList()
                .Select(x => x.Date)
                .Distinct()
                .OrderByDescending(x => x)
                .Take(count)
                .ToList();
        }

        private List<DigitalConcernReading> BuildHistoricalReadingsForConcern(decimal Model_ID, decimal Part_ID, decimal Checkpoint_ID, decimal Location_ID, decimal Parameter_ID, List<DateTime> historicalAuditDates)
        {
            var readings = new List<DigitalConcernReading>();

            if (historicalAuditDates == null)
            {
                return readings;
            }

            foreach (var historicalDate in historicalAuditDates)
            {
                var dailyReadings = (from audit in db.MM_Vehicle_Audit
                                     join sheet in db.MM_Track_Sheet on audit.Audit_ID equals sheet.Audit_ID
                                     where audit.Is_Gapgun == true
                                     && audit.Model_ID == Model_ID
                                           && audit.Audit_Date.Year == historicalDate.Year
                                           && audit.Audit_Date.Month == historicalDate.Month
                                           && audit.Audit_Date.Day == historicalDate.Day
                                           && sheet.Part_ID == Part_ID
                                           && sheet.Checkpoint_ID == Checkpoint_ID
                                           && sheet.Location_ID == Location_ID
                                           && sheet.Parameter_ID == Parameter_ID
                                     select sheet.Reading).ToList();

                decimal total = 0;
                int count = 0;

                foreach (var readingText in dailyReadings)
                {
                    decimal parsedValue;
                    if (decimal.TryParse(readingText, NumberStyles.Any, CultureInfo.InvariantCulture, out parsedValue))
                    {
                        total += parsedValue;
                        count++;
                    }
                }

                readings.Add(new DigitalConcernReading
                {
                    Reading = count > 0 ? Math.Round(total / count, 2).ToString("0.##", CultureInfo.InvariantCulture) : string.Empty,
                    Remark = string.Empty,
                    Audit_Date = historicalDate
                });
            }

            return readings;
        }

        private Dictionary<string, decimal> BuildHistoricalAverageMap(decimal Model_ID, List<DateTime> historicalAuditDates)
        {
            var averageMap = new Dictionary<string, decimal>();

            if (historicalAuditDates == null || historicalAuditDates.Count == 0)
            {
                return averageMap;
            }

            var historicalDateSet = new HashSet<string>(historicalAuditDates.Select(x => x.ToString("yyyy-MM-dd")));

            var historicalRows = (from audit in db.MM_Vehicle_Audit
                                  join sheet in db.MM_Track_Sheet on audit.Audit_ID equals sheet.Audit_ID
                                  where audit.Is_Gapgun == true
                                        && audit.Model_ID == Model_ID
                                        && audit.Audit_Date < historicalAuditDates.Max().AddDays(1)
                                  select new
                                  {
                                      AuditDate = audit.Audit_Date,
                                      sheet.Part_ID,
                                      sheet.Checkpoint_ID,
                                      sheet.Location_ID,
                                      sheet.Parameter_ID,
                                      sheet.Reading
                                  }).ToList();

            var groupedRows = historicalRows
                .Where(row => historicalDateSet.Contains(row.AuditDate.Date.ToString("yyyy-MM-dd")))
                .Select(row => new
                {
                    AuditDate = row.AuditDate.Date,
                    row.Part_ID,
                    row.Checkpoint_ID,
                    row.Location_ID,
                    row.Parameter_ID,
                    ReadingValue = TryParseDecimal(row.Reading)
                })
                .Where(row => row.ReadingValue.HasValue)
                .GroupBy(row => BuildHistoricalAverageKey(row.Part_ID, row.Checkpoint_ID, row.Location_ID, row.Parameter_ID, row.AuditDate));

            foreach (var group in groupedRows)
            {
                averageMap[group.Key] = Math.Round(group.Average(x => x.ReadingValue.Value), 2);
            }

            return averageMap;
        }

        private string BuildHistoricalAverageKey(decimal Part_ID, decimal Checkpoint_ID, decimal Location_ID, decimal Parameter_ID, DateTime auditDate)
        {
            return Part_ID.ToString(CultureInfo.InvariantCulture)
                   + "|" + Checkpoint_ID.ToString(CultureInfo.InvariantCulture)
                   + "|" + Location_ID.ToString(CultureInfo.InvariantCulture)
                   + "|" + Parameter_ID.ToString(CultureInfo.InvariantCulture)
                   + "|" + auditDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }

        private decimal? TryParseDecimal(string value)
        {
            decimal parsedValue;
            if (decimal.TryParse(value, out parsedValue))
            {
                return parsedValue;
            }

            return null;
        }

        private bool TryParseDecimalInvariant(string value, out decimal parsedValue)
        {
            return decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out parsedValue);
        }

        private decimal? CalculateUsagePercent(decimal? readingValue, decimal? minVal, decimal? maxVal)
        {
            if (!readingValue.HasValue || !minVal.HasValue || !maxVal.HasValue)
            {
                return null;
            }

            decimal lower = minVal.Value;
            decimal upper = maxVal.Value;
            decimal reading = readingValue.Value;

            if (upper == lower)
            {
                return null;
            }

            decimal nominal = (lower + upper) / 2m;
            decimal halfTolerance = Math.Abs(upper - lower) / 2m;

            if (halfTolerance == 0)
            {
                return null;
            }

            return Math.Abs(reading - nominal) * 100m / halfTolerance;
        }

        private List<DigitalPartSummaryData> GetPartWiseSummary(DateTime reportDate, decimal modelId)
        {
            var currentAuditIds = db.MM_Vehicle_Audit
                .Where(x =>
                    x.Is_Gapgun == true &&
                    x.Model_ID == modelId &&
                    x.Audit_Date.Year == reportDate.Year &&
                    x.Audit_Date.Month == reportDate.Month &&
                    x.Audit_Date.Day == reportDate.Day)
                .Select(x => x.Audit_ID)
                .ToList();

            if (currentAuditIds.Count == 0)
            {
                return new List<DigitalPartSummaryData>();
            }

            var currentRows = (from audit in db.MM_Vehicle_Audit
                               join sheet in db.MM_Track_Sheet on audit.Audit_ID equals sheet.Audit_ID
                               where audit.Is_Gapgun == true
                                     && audit.Model_ID == modelId
                                     && currentAuditIds.Contains(audit.Audit_ID)
                               select new
                               {
                                   sheet.Part_ID,
                                   PartName = sheet.MM_PartMaster.Part_Name,
                                   sheet.Reading,
                                   MinVal = sheet.MM_SpecificationMaster.MinVal,
                                   MaxVal = sheet.MM_SpecificationMaster.MaxVal
                               }).ToList();

            var summary = currentRows
                .GroupBy(x => new { x.Part_ID, x.PartName })
                .Select(group =>
                {
                    decimal checkedCount = 0;
                    decimal okCount = 0;
                    decimal nokCount = 0;

                    foreach (var row in group)
                    {
                        checkedCount++;

                        decimal readingValue;
                        decimal? parsedReading = TryParseDecimalFlexible(row.Reading, out readingValue) ? (decimal?)readingValue : null;
                        decimal? usagePercent = CalculateUsagePercent(parsedReading, row.MinVal, row.MaxVal);

                        if (!usagePercent.HasValue || usagePercent.Value > 100)
                        {
                            nokCount++;
                        }
                        else
                        {
                            okCount++;
                        }
                    }

                    return new DigitalPartSummaryData
                    {
                        Part_ID = group.Key.Part_ID,
                        Part_Name = group.Key.PartName,
                        Total_Checked = checkedCount,
                        Total_OK = okCount,
                        Total_NOK = nokCount,
                        Total_PIST = checkedCount > 0 ? Math.Round((okCount * 100m) / checkedCount, 2) : 0
                    };
                })
                .OrderBy(x => x.Part_Name)
                .ToList();

            return summary;
        }

        private int GetConcernSeverityRank(DigitalConcernData concern)
        {
            int redCount = 0;
            int yellowCount = 0;
            int greenCount = 0;

            if (concern.LastReadings != null)
            {
                foreach (var historicalReading in concern.LastReadings)
                {
                    decimal historicalReadingValue;
                    if (TryParseDecimalFlexible(historicalReading.Reading, out historicalReadingValue))
                    {
                        int cellRank = GetSeverityRankForReading(historicalReadingValue, concern.MinVal, concern.MaxVal);

                        if (cellRank == 0)
                        {
                            redCount++;
                        }
                        else if (cellRank == 1)
                        {
                            yellowCount++;
                        }
                        else
                        {
                            greenCount++;
                        }
                    }
                }
            }

            if (redCount == 5)
            {
                return 0;
            }

            if (redCount > 0)
            {
                return 1;
            }

            if (yellowCount > 0 && greenCount > 0)
            {
                return 2;
            }

            return 3;
        }

        private int GetSeverityRankForReading(decimal readingValue, decimal? minVal, decimal? maxVal)
        {
            decimal? usagePercent = CalculateUsagePercent(readingValue, minVal, maxVal);

            if (!usagePercent.HasValue)
            {
                return 2;
            }

            if (usagePercent.Value > 150)
            {
                return 0;
            }

            if (usagePercent.Value > 100)
            {
                return 1;
            }

            return 2;
        }

        private bool TryParseDecimalFlexible(string value, out decimal parsedValue)
        {
            return decimal.TryParse(value, NumberStyles.Any, CultureInfo.InvariantCulture, out parsedValue)
                || decimal.TryParse(value, NumberStyles.Any, CultureInfo.CurrentCulture, out parsedValue);
        }

        private bool TryParseAuditDate(string auditDate, out DateTime parsedDate)
        {
            return DateTime.TryParseExact(
                auditDate,
                new[]
                {
                    "dd-MMM-yyyy",
                    "dd-MM-yyyy",
                    "yyyy-MM-dd",
                    "dd/MM/yyyy",
                    "MM/dd/yyyy",
                    "yyyy-MM-ddTHH:mm:ss",
                    "yyyy-MM-ddTHH:mm:ss.fff"
                },
                CultureInfo.InvariantCulture,
                DateTimeStyles.AllowWhiteSpaces,
                out parsedDate);
        }

        private string GetDisplayVehicleNumber(string vinNumber, string bodyNumber)
        {
            if (!string.IsNullOrEmpty(vinNumber) && vinNumber.Length == 17)
            {
                return vinNumber.Substring(9);
            }

            if (!string.IsNullOrEmpty(vinNumber))
            {
                return vinNumber;
            }

            return bodyNumber;
        }

    }

    public class DigitalAuditData
    {
        public decimal Audit_ID { get; set; }
        public string VIN_NO { get; set; }
        public string RepresentativeVIN_NO { get; set; }
        public string RepresentativeBIW_NO { get; set; }
        public string BIW_NO { get; set; }
        public string Model_Name { get; set; }
        public string Variant { get; set; }
        public string Auditor_Name { get; set; }
        public DateTime Audit_Date { get; set; }
        public decimal Total_Pist { get; set; }
        public decimal Total_Checked { get; set; }
        public decimal Total_OK { get; set; }
        public decimal Total_NOK { get; set; }
        public decimal Total_NA { get; set; }
        public decimal Audit_Type_Id { get; set; }
        public string Audit_Type_Name { get; set; }
        public int Total_Vehicles_Audited_Today { get; set; }
        public DateTime ReportDate { get; set; }
    }

    public class DigitalConcernData
    {
        public decimal Audit_ID { get; set; }
        public string VIN_No { get; set; }
        public string Body_No { get; set; }
        public string Model_Name { get; set; }
        public string Model_Code { get; set; }
        public DateTime Audit_Date { get; set; }
        public string Type { get; set; }
        public decimal Part_ID { get; set; }
        public string Part_Name { get; set; }
        public decimal Checkpoint_ID { get; set; }
        public string Checkpoint_Name { get; set; }
        public decimal Location_ID { get; set; }
        public string Location_Name { get; set; }
        public string Specification_Name { get; set; }
        public string Reading { get; set; }
        public string Remark { get; set; }
        public decimal? MinVal { get; set; }
        public decimal? MaxVal { get; set; }
        public decimal Parameter_ID { get; set; }
        public int SeverityRank { get; set; }
        public List<DigitalConcernReading> LastReadings { get; set; }
    }

    public class DigitalPartSummaryData
    {
        public decimal Part_ID { get; set; }
        public string Part_Name { get; set; }
        public decimal Total_Checked { get; set; }
        public decimal Total_OK { get; set; }
        public decimal Total_NOK { get; set; }
        public decimal Total_PIST { get; set; }
    }

    public class DigitalConcernReading
    {
        public string Reading { get; set; }
        public string Remark { get; set; }
        public DateTime Audit_Date { get; set; }
        public DateTime Inserted_Date { get; set; }
    }

    public class AuditMailPreviewResponse
    {
        public bool IsSuccessMessage { get; set; }
        public string MessageDetail { get; set; }
        public decimal Audit_ID { get; set; }
        public string HtmlBody { get; set; }
    }

}


