using QualityAPI.Helper;
using QualityAPI.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Mail;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Http;

namespace QualityAPI.Controllers.Transactions
{
    public class AutoMailController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        private General generalLogObj = new General();


        GlobalData messageDataObj = new GlobalData();
        GlobalOperations gbOperation = new GlobalOperations();

        [Route("api/MM_Audit_MailController/SendAuditMail/{Audit_Plan_Log_ID},{Model_ID}")]
        [HttpPost]
        [ActionName("SendAuditMail")]
        public IHttpActionResult SendAuditMail(decimal Audit_Plan_Log_ID, decimal Model_ID)
        {
            try
            {

                // Get email addresses from model table based on Model_ID
                var modelEmailData = (from model in db.MM_Model
                                      where model.Model_ID == Model_ID
                                      select new
                                      {
                                          To_Email = model.Email_Addresses
                                      }).FirstOrDefault();
                if (modelEmailData == null || string.IsNullOrEmpty(modelEmailData.To_Email))
                {

                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = "Email Not Configured";
                    this.messageDataObj.messageDetail = "No email addresses configured for Model: ";
                    return Ok(new { messageDataObj, });
                }

                // Step 1: Get Audit Data
                var AuditData = GetAuditData(Audit_Plan_Log_ID);
                if (AuditData == null)
                {
                    this.messageDataObj.isErrorMessage = true;
                    this.messageDataObj.messageTitle = "Data Not Found";
                    this.messageDataObj.messageDetail = "Audit data not found for Audit_Plan_Log_ID: " + Audit_Plan_Log_ID;
                    return Ok(new { messageDataObj, });
                }

                // Step 2: Get Concerns Data
                var ConcernsData = GetConcernData(Audit_Plan_Log_ID);
                if (ConcernsData == null)
                {
                    ConcernsData = new List<ConcernData>();
                }



                // Step 3: Prepare Subject
                var Subject = AuditData.Audit_Type_Name + " Report of " + AuditData.Model_Name + " : " + AuditData.VIN_NO + " : " + AuditData.Audit_Date.ToString("dd-MMM-yyyy");

                // Step 4: Prepare Report Link
                var VIN = AuditData.Audit_Type_Id == 1 ? AuditData.VIN_NO : AuditData.BIW_NO;
                var ReportLink = "http://mmnsk1drsv/DronaRep/Pages/ReportViewer.aspx?%2fPQ+Dashboard%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK"
                                                                   + "&Plant_ID=1"
                                                                   + "&VIN_Number=" + VIN
                                                                   + "&Audit_Type_Id=" + AuditData.Audit_Type_Id;


                // Step 5: Map Data to Mail Body
                var MailBody = MapDataToMailBody(AuditData, ConcernsData, ReportLink);
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
                var fromAddress = (AuditData.Audit_Type_Id == 1 ? "1DTCF" : "1DBIW") + "Module@mahindra.com";
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


        public AuditData GetAuditData(decimal Audit_Plan_Log_ID)
        {
            try
            {
                var auditData = (from audit in db.MM_Vehicle_Audit
                                 join model in db.MM_Model on audit.Model_ID equals model.Model_ID
                                 join emp in db.MM_Employee on audit.Auditor1_ID equals emp.Employee_ID into empJoin
                                 from emp in empJoin.DefaultIfEmpty()
                                 join atype in db.Audit_Type_Master on audit.Audit_Type_Id equals atype.Audit_Type_Id into typeJoin
                                 from atype in typeJoin.DefaultIfEmpty()

                                 where audit.Audit_Plan_Log_ID == Audit_Plan_Log_ID
                                 select new AuditData
                                 {
                                     VIN_NO = string.IsNullOrEmpty(audit.VIN_No) ? audit.Body_No : audit.VIN_No,
                                     //VIN_NO = audit.VIN_No,
                                     BIW_NO = audit.Body_No,
                                     Variant = audit.Variant_Name,
                                     Audit_Date = audit.Audit_Date,
                                     Model_Name = model.Model_Name,
                                     Auditor_Name = emp != null ? emp.Employee_Name : "",
                                     Total_Pist = audit.Total_PIST ?? 0,
                                     Total_Checked = (audit.Gap_Total_Check ?? 0) + (audit.Flush_Total_Check ?? 0),
                                     Total_OK = (audit.Gap_Ok ?? 0) + (audit.Flush_Ok ?? 0),
                                     Total_NOK = (audit.Gap_Nok ?? 0) + (audit.Flush_Nok ?? 0),
                                     Total_NA = (audit.Gap_NA ?? 0) + (audit.Flush_NA ?? 0),
                                     Audit_ID = audit.Audit_ID,
                                     Audit_Type_Id = audit.Audit_Type_Id,
                                     Audit_Type_Name = atype != null ? atype.Audit_Type : "Audit"
                                 }).FirstOrDefault();

                return auditData;
            }
            catch (Exception ex)
            {
                generalLogObj.addControllerException(ex, "MM_Audit_MailController", "GetAuditData(" + Audit_Plan_Log_ID + ")");
                return null;
            }
        }


        public List<ConcernData> GetConcernData(decimal Audit_Plan_Log_ID)
        {
            try
            {
                var data = (from audit in db.MM_Vehicle_Audit
                            join sheet in db.MM_Track_Sheet
                                on audit.Audit_ID equals sheet.Audit_ID
                            where audit.Audit_Plan_Log_ID == Audit_Plan_Log_ID
                                  && sheet.Remark != "OK"
                                  && sheet.Remark != "NA"
                            orderby sheet.Inserted_Date descending
                            select new ConcernData
                            {
                                Audit_ID = audit.Audit_ID,
                                VIN_No = audit.VIN_No.Length == 17 ? audit.VIN_No.Substring(9) : audit.VIN_No,
                                Body_No = audit.Body_No,
                                Model_Name = audit.Model_Name,
                                Model_Code = audit.Model_Code,
                                Audit_Date = audit.Audit_Date,
                                Type = sheet.MM_Gap_And_FlushMaster.Type,
                                Part_ID = sheet.Part_ID,
                                Part_Name = sheet.MM_PartMaster.Part_Name,
                                Checkpoint_ID = sheet.MM_CheckpointMaster.Checkpoint_ID,
                                Checkpoint_Name = sheet.MM_CheckpointMaster.Checkpoint_Name,
                                Location_ID = sheet.MM_LocationMaster.Location_ID,
                                Location_Name = sheet.MM_LocationMaster.Location_Name,
                                Specification_Name = sheet.MM_SpecificationMaster.Specification_Name,
                                Parameter_ID = sheet.Parameter_ID,
                                Reading = sheet.Reading,
                                Remark = sheet.Remark
                            }).ToList();

                foreach (var concern in data)
                {
                    var lastReadings = (from sheet in db.MM_Track_Sheet
                                        join audit in db.MM_Vehicle_Audit on sheet.Audit_ID equals audit.Audit_ID
                                        join location in db.MM_LocationMaster on sheet.Location_ID equals location.Location_ID
                                        where sheet.Part_ID == concern.Part_ID
                                              && sheet.Checkpoint_ID == concern.Checkpoint_ID
                                              && sheet.Location_ID == concern.Location_ID
                                              && sheet.Parameter_ID == concern.Parameter_ID
                                              && sheet.Audit_ID != concern.Audit_ID
                                        orderby audit.Audit_Date descending
                                        select new ConcernReading
                                        {
                                            Reading = sheet.Reading,
                                            Remark = sheet.Remark,
                                            Audit_Date = audit.Audit_Date
                                        })
                                        .Take(5)
                                        .ToList();

                    concern.LastReadings = lastReadings;
                }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;

                return data;
            }
            catch (Exception ex)
            {
                generalLogObj.addControllerException(ex, "MM_Audit_MailController", $"GetConcernData({Audit_Plan_Log_ID})");
                return new List<ConcernData>();
            }
        }



        private string MapDataToMailBody(AuditData auditData, List<ConcernData> concernsData, string ReportLink)
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
                    concernsData = new List<ConcernData>();
                }

                // Read the HTML template
                string templatePath = System.Web.Hosting.HostingEnvironment.MapPath("~/App_Data/Template/1D_TCF_BIW_Audit_Report.html");
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

                // Map Concern Details (Dynamic Rows)
                var auditMeta = (from audit in db.MM_Vehicle_Audit
                                 where audit.Audit_ID == auditData.Audit_ID
                                 select new
                                 {
                                     audit.Model_ID,
                                     audit.Plant_ID
                                 }).FirstOrDefault();

                htmlTemplate = MapConcernDetails(htmlTemplate, concernsData);

                // Map Footer
                htmlTemplate = htmlTemplate.Replace("[PLANT_NAME]", "Nashik Plant");
                htmlTemplate = htmlTemplate.Replace("[GENERATED_DATE]", DateTime.Now.ToString("dd-MMM-yyyy HH:mm"));

                // Map Report URL
                htmlTemplate = htmlTemplate.Replace("[REPORT_URL]", ReportLink);

                return htmlTemplate;
            }
            catch (Exception ex)
            {
                generalLogObj.addControllerException(ex, "MM_Audit_MailController", "MapDataToMailBody");
                return string.Empty;
            }
        }

        private string MapConcernDetails(string htmlTemplate, List<ConcernData> concernsData)
        {
            var rows = new StringBuilder();

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
                    string remark = HttpUtility.HtmlEncode(string.IsNullOrWhiteSpace(c.Remark) ? "—" : c.Remark);

                    // Prepare last 5 reading dates and readings
                    var lastReadingDates = new List<string>();
                    var lastAuditReadings = new List<string>();

                    if (c.LastReadings != null)
                    {
                        foreach (var r in c.LastReadings)
                        {
                            // Format the date like summary section
                            lastReadingDates.Add(HttpUtility.HtmlEncode(r.Audit_Date.ToString("dd-MM") ?? " "));
                            lastAuditReadings.Add(HttpUtility.HtmlEncode(string.IsNullOrWhiteSpace(r.Reading) ? " " : r.Reading));
                        }
                    }

                    while (lastReadingDates.Count < 5) lastReadingDates.Add(string.Empty);
                    while (lastAuditReadings.Count < 5) lastAuditReadings.Add(string.Empty);

                    // Build row with 12 columns
                    rows.Append($@"
                                    <tr>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{type}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{part}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{checkpoint}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{location}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{specification}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{reading}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{remark}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{lastAuditReadings[0]}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{lastAuditReadings[1]}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{lastAuditReadings[2]}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{lastAuditReadings[3]}</td>
                                        <td style=""padding: 8px; font-size: 12px; border: 1px solid #e5e7eb;"">{lastAuditReadings[4]}</td>
                                    </tr>");

                    // Map Reading Dates into placeholders for template replacement
                    htmlTemplate = htmlTemplate.Replace("[READING_DATE1]",
                        c.LastReadings?.ElementAtOrDefault(0)?.Audit_Date.ToString("dd-MM") ?? " ");
                    htmlTemplate = htmlTemplate.Replace("[READING_DATE2]",
                        c.LastReadings?.ElementAtOrDefault(1)?.Audit_Date.ToString("dd-MM") ?? " ");
                    htmlTemplate = htmlTemplate.Replace("[READING_DATE3]",
                        c.LastReadings?.ElementAtOrDefault(2)?.Audit_Date.ToString("dd-MM") ?? " ");
                    htmlTemplate = htmlTemplate.Replace("[READING_DATE4]",
                        c.LastReadings?.ElementAtOrDefault(3)?.Audit_Date.ToString("dd-MM") ?? " ");
                    htmlTemplate = htmlTemplate.Replace("[READING_DATE5]",
                        c.LastReadings?.ElementAtOrDefault(4)?.Audit_Date.ToString("dd-MM") ?? " ");
                }
            }

            return htmlTemplate.Replace("[CONCERN_ROWS]", rows.ToString());
        }

    }

    public class AuditData
    {
        public decimal Audit_ID { get; set; }
        public string VIN_NO { get; set; }
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
    }

    public class ConcernData
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
        public decimal Parameter_ID { get; set; }
        public List<ConcernReading> LastReadings { get; set; }
    }

    public class ConcernReading
    {
        public string Reading { get; set; }
        public string Remark { get; set; }
        public DateTime Audit_Date { get; set; }
        public DateTime Inserted_Date { get; set; }
    }

}
