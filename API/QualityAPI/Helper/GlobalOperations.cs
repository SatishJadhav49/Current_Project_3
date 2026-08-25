using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Configuration;
using System.Data;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Web;
using QualityAPI.Models;
namespace QualityAPI.Models
{
    /* Class Name                 : GlobalOperations
    *  Description                : Wrote all common functions and methods into single class (use for reusability of code) 
    *  Author, Timestamp          : Amol Baviskar       
    */

    public class GlobalOperations
    {
        public enum MaintenanceType
        {
            PM=1,TBM=2,CBM=3,CLITA=4,CALIBRATION=5

        };
        private OneD_DB_Entity db = new OneD_DB_Entity();
        public string _connectionString = "";
        public OleDbConnection _conn;
        public bool primaryPresent = false;
        public ObservableCollection<string> _lstSheetNames = new ObservableCollection<string>();
        public SqlConnection myconnection;
        public string _delim = "";

   



        public MM_Shift getCurrentRunningShiftByShopID(decimal shopId)
        {
            try
            {
                TimeSpan currDate = DateTime.Now.TimeOfDay;
                MM_Shift mmShiftObj = (from shiftObj in db.MM_Shift
                                       where shiftObj.Shop_ID == shopId
                                && TimeSpan.Compare(shiftObj.START_TIME.Value, currDate) < 0
                                && TimeSpan.Compare(shiftObj.END_TIME.Value, currDate) > 0
                                       select shiftObj).FirstOrDefault();
                return mmShiftObj;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
        
        public MM_Shift getShiftByShopIDAndShifId(decimal shopId,decimal shiftId)
        {
            try
            {
                TimeSpan currDate = DateTime.Now.TimeOfDay;
                MM_Shift mmShiftObj = (from shiftObj in db.MM_Shift
                                       where shiftObj.Shop_ID == shopId && shiftObj.SHIFT_NO== shiftId
                                //&& TimeSpan.Compare(shiftObj.START_TIME.Value, currDate) < 0
                                //&& TimeSpan.Compare(shiftObj.END_TIME.Value, currDate) > 0
                                       select shiftObj).FirstOrDefault();
                return mmShiftObj;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
        /*
       * Function Name        : ExcelToDataTable
       * Input Parameter      : Uploaded File,saved file location,extension of file
       * Return Type          : DataTable
       * Author & Time Stamp  : Vijaykumar Kagne
       * Description          : Convert Excel file data to DataTable Format
       */
        public DataTable ExcelToDataTable(HttpPostedFile uploadFile, string fileLocation, string fileExtension)
        {
           

           
            DataTable dtExcelRecords = new DataTable();
            string connectionString = "";
            if (uploadFile.ContentLength > 0)
            {

                uploadFile.SaveAs(fileLocation);

                //Check whether file extension is xls or xslx

                if (fileExtension == ".xls")
                {
                    connectionString = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + fileLocation + ";Extended Properties=\"Excel 8.0;HDR=Yes;IMEX=2\"";
                }
                else if (fileExtension == ".xlsx")
                {
                    connectionString = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + fileLocation + ";Extended Properties=\"Excel 12.0;HDR=Yes;IMEX=2\"";
                }

                //Create OleDB Connection and OleDb Command && Read data from excel and generate datatable 

                OleDbConnection con = new OleDbConnection(connectionString);
                OleDbCommand cmd = new OleDbCommand();
                cmd.CommandType = System.Data.CommandType.Text;
                cmd.Connection = con;
                OleDbDataAdapter dAdapter = new OleDbDataAdapter(cmd);

                con.Open();
                DataTable dtExcelSheetName = con.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);
                string getExcelSheetName = dtExcelSheetName.Rows[0]["Table_Name"].ToString();
                cmd.CommandText = "SELECT * FROM [" + getExcelSheetName + "]";
                dAdapter.SelectCommand = cmd;
                dAdapter.Fill(dtExcelRecords);
                con.Close();

            }
            return dtExcelRecords;
        }



        public byte[] ImageToByteArray(System.Drawing.Image imageIn)
        {
            using (var ms = new MemoryStream())
            {
                imageIn.Save(ms, ImageFormat.Png);
                return ms.ToArray();
            }
        }

        public Image ResizeImage(Image img, int maxWidth, int maxHeight)
        {
            if (img.Height < maxHeight && img.Width < maxWidth) return img;
            using (img)
            {
                Double xRatio = (double)img.Width / maxWidth;
                Double yRatio = (double)img.Height / maxHeight;
                Double ratio = Math.Max(xRatio, yRatio);
                int nnx = (int)Math.Floor(img.Width / ratio);
                int nny = (int)Math.Floor(img.Height / ratio);
                Bitmap cpy = new Bitmap(nnx, nny, PixelFormat.Format32bppArgb);
                using (Graphics gr = Graphics.FromImage(cpy))
                {
                    gr.Clear(Color.Transparent);

                    // This is said to give best quality when resizing images
                    gr.InterpolationMode = InterpolationMode.HighQualityBicubic;

                    gr.DrawImage(img,
                        new Rectangle(0, 0, nnx, nny),
                        new Rectangle(0, 0, img.Width, img.Height),
                        GraphicsUnit.Pixel);
                }
                return cpy;
            }

        }


        /*
      * Function Name        : sendMail
      * Input Parameter      : from_email,to_email,subject and body
      * Return Type          : DataTable
      * Author & Time Stamp  : Vijaykumar Kagne
      * Description          : Send Mail to respective person
      */
        public static bool sendMail(string from, string to, string subject, string body)
        {
            //var bodyFormat = "<p>Email From: {0} ({1})</p><p>Message:</p><p>{2}</p>";
            //we ll take for loop for Every Reciever
            //foreach (var item in toMail)
            //{
            bool flag = false;
            var message = new MailMessage();
            try
            {

                message.To.Add(new MailAddress(to));  // replace with valid value 
                message.From = new MailAddress("test@gmail.com");  // replace with valid value
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = true;
                using (var smtp = new SmtpClient())
                {
                    //var credential = new NetworkCredential
                    //{
                    //    UserName = "vijaykumar.kagne@live.com",  // replace with valid value
                    //    Password = "Vij@ykagne7709"  // replace with valid value
                    //};
                    //smtp.Credentials = credential;
                    //smtp.Host = "smtp-mail.outlook.com";
                    //smtp.Port = 587;

                    var credential = new NetworkCredential
                    {
                        UserName = "test@gmail.com",  // replace with valid value
                        Password = "testPass"  // replace with valid value
                    };
                    smtp.Credentials = credential;
                    smtp.Host = "";
                    //smtp.Host = "190.4.130.173";
                    smtp.Port = 587;
                    smtp.UseDefaultCredentials = true;

                    smtp.EnableSsl = true;
                    smtp.Send(message);
                }
                flag = true;
            }
            catch (Exception ex)
            {

                flag = false;
            }

            return flag;
        }
        //public static bool sendMail(string from, string to, string subject, string body)
        //{
        //    //var bodyFormat = "<p>Email From: {0} ({1})</p><p>Message:</p><p>{2}</p>";
        //    //we ll take for loop for Every Reciever
        //    //foreach (var item in toMail)
        //    //{
        //    bool flag = false;
        //    var message = new MailMessage();
        //    try
        //    {

        //        message.To.Add(new MailAddress(to));  // replace with valid value 
        //        message.From = new MailAddress("ipms_automail@mahindra.com");  // replace with valid value
        //        message.Subject = subject;
        //        message.Body = body;
        //        message.IsBodyHtml = true;
        //        using (var smtp = new SmtpClient())
        //        {
        //            //var credential = new NetworkCredential
        //            //{
        //            //    UserName = "vijaykumar.kagne@live.com",  // replace with valid value
        //            //    Password = "Vij@ykagne7709"  // replace with valid value
        //            //};
        //            //smtp.Credentials = credential;
        //            //smtp.Host = "smtp-mail.outlook.com";
        //            //smtp.Port = 587;

        //            var credential = new NetworkCredential
        //            {
        //                UserName = "drona_automail@mahindra.com",  // replace with valid value
        //                Password = "pass,1234"  // replace with valid value
        //            };
        //            smtp.Credentials = credential;
        //            smtp.Host = "";
        //            //smtp.Host = "190.4.130.173";
        //            smtp.Port = 25;
        //            smtp.UseDefaultCredentials = true;

        //            smtp.EnableSsl = true;
        //            smtp.Send(message);
        //        }
        //        flag = true;
        //    }
        //    catch (Exception ex)
        //    {

        //        flag = false;
        //    }

        //    return flag;
        //}

        /*
       * Function Name        : GetIP
       * Input Parameter      : none
       * Return Type          : string
       * Author & Time Stamp  : Vijaykumar Kagne
       * Description          : Get IP Address
       */
        public static string GetIP()
        {
            string Str = "";
            Str = System.Net.Dns.GetHostName();
            IPHostEntry ipEntry = System.Net.Dns.GetHostEntry(Str);
            IPAddress[] addr = ipEntry.AddressList;
            return addr[addr.Length - 1].ToString();

        }

        /*
       * Function Name        : GetHostName
       * Input Parameter      : none
       * Return Type          : string
       * Author & Time Stamp  : Vijaykumar Kagne
       * Description          : Get Host Name
       */
        public static string GetHostName()
        {
            string Str = "";
            Str = System.Net.Dns.GetHostName();
            return Str;
        }

        /*
         * Function Name        : RemoveAllNullRowsFromDataTable
         * Input Parameter      : DataTable
         * Return Type          : DataTable
         * Author & Time Stamp  : Vijaykumar Kagne
         * Description          : To Remove all null rows from given datatable
         */
        public DataTable RemoveAllNullRowsFromDataTable(DataTable dt)
        {
            try
            {
                int columnCount = dt.Columns.Count;

                for (int i = dt.Rows.Count - 1; i >= 0; i--)
                {
                    bool allNull = true;
                    for (int j = 0; j < columnCount; j++)
                    {
                        if (dt.Rows[i][j] != DBNull.Value)
                        {
                            allNull = false;
                            break;
                        }
                    }
                    if (allNull)
                    {
                        dt.Rows[i].Delete();
                    }
                }
                dt.AcceptChanges();
            }
            catch (Exception ex)
            { }
            return dt;
        }
        /*
       * Function Name        : GenerateTransposedTable
       * Input Parameter      : DataTable
       * Return Type          : DataTable
       * Author & Time Stamp  : Vijaykumar Kagne
       * Description          : To Generate transposed table from given datatable
       */
        public System.Data.DataTable GenerateTransposedTable(System.Data.DataTable inputTable)
        {
            System.Data.DataTable outputTable = new System.Data.DataTable();
            try
            {

                // Add columns by looping rows

                // Header row's first column is same as in inputTable
                outputTable.Columns.Add(inputTable.Columns[0].ColumnName.ToString());

                // Header row's second column onwards, 'inputTable's first column taken
                int cnt = 0;
                foreach (DataRow inRow in inputTable.Rows)
                {
                    string newColName = inRow[0].ToString();
                x:
                    if (outputTable.Columns.Contains(newColName))
                    {
                        newColName = newColName + cnt;
                        cnt++;
                        goto x;
                    }
                    outputTable.Columns.Add(newColName);
                }

                // Add rows by looping columns        
                for (int rCount = 1; rCount <= inputTable.Columns.Count - 1; rCount++)
                {
                    DataRow newRow = outputTable.NewRow();

                    // First column is inputTable's Header row's second column
                    newRow[0] = inputTable.Columns[rCount].ColumnName.ToString();
                    for (int cCount = 0; cCount <= inputTable.Rows.Count - 1; cCount++)
                    {
                        string colValue = inputTable.Rows[cCount][rCount].ToString();
                        newRow[cCount + 1] = colValue;
                    }
                    outputTable.Rows.Add(newRow);
                }

            }
            catch (Exception ec)
            {
            }
            return outputTable;
        }
        /*
         * Function Name        : XLConnectionString
         * Input Parameter      : string(filepath)
         * Return Type          : string
         * Author & Time Stamp  : Vijaykumar Kagne
         * Description          : To get connection string of excel file
         */
        public string XLConnectionString(string path)
        {
            string str = "";
            System.Data.DataTable myTable = new System.Data.DataTable();
            try
            {
                string fileExtension = System.IO.Path.GetExtension(path);
                string filePath = System.IO.Path.GetFullPath(path);
                string HDR = "";
                if (true)
                    HDR = "HDR=yes;";
                else
                    HDR = "HDR=no;";


                //if (fileExtension == ".xls" || fileExtension == ".XLS")
                //    str = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + path +
                //        ";Extended Properties=Excel 8.0;";
                if (fileExtension == ".xls" || fileExtension == ".XLS")
                    str = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + path +
                        ";Extended Properties=\"Excel 8.0;" + HDR + "IMEX=1;TypeGuessRows=0;ImportMixedTypes=Text\";";
                else if (fileExtension == ".xlsx" || fileExtension == ".XLSX")
                    str = "Provider=Microsoft.ACE.OLEDB.12.0;Data Source=" + path +
                        ";Extended Properties=\"Excel 12.0 Xml;" + HDR + "IMEX=1;TypeGuessRows=0;ImportMixedTypes=Text\";";
                else if (fileExtension.ToLower() == ".csv" || fileExtension.ToLower() == ".txt" || fileExtension.ToLower() == ".tsv" || fileExtension.ToLower() == ".log")
                {
                    string sourceDirectory = Path.GetDirectoryName(path);
                    str = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=" + sourceDirectory +
                        ";Extended Properties=\"text;HDR=Yes;FMT=Delimited('" + (_delim == "" ? "," : _delim) + "')\";";
                }
                else
                    str = "";
            }
            catch (Exception ex)
            {
            }
            return str;
        }
        /*
         * Function Name        : XLConnectionString
         * Input Parameter      : string(filepath)
         * Return Type          : string
         * Author & Time Stamp  : Vijaykumar Kagne
         * Description          : To get connection string of excel file
        */
        public ObservableCollection<string> GetSheetFromExcel(string fileName, out bool isErr, out string respmsg, string filepath)
        {
            isErr = false;
            respmsg = "";
            try
            {
                _lstSheetNames = new ObservableCollection<string>();
                _connectionString = XLConnectionString(filepath +"/"+ fileName);
                _conn = new OleDbConnection(_connectionString);
                _conn.InitializeLifetimeService();// Obtains a lifetime service object to keep connectionto excel sheet alive through the lifetime of the program******************
                _conn.Open();
                OleDbCommand cmd = new OleDbCommand();
                cmd.Connection = _conn;

                // Get all Sheets in Excel File and select the sheet that appears alphabetically first*****************************************************************************

                System.Data.DataTable dtSheet = _conn.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, null);
                _conn.Close();

                // Loop through all Sheets to get sheet names
                foreach (System.Data.DataRow dr in dtSheet.Rows)
                {
                    string sheetName = dr["TABLE_NAME"].ToString();
                    if (Regex.IsMatch(sheetName, "^'.*?'$"))
                        sheetName = sheetName.Replace("\'", "");
                    sheetName = Regex.Replace(sheetName, "^'|'$", "");

                    if (!sheetName.EndsWith("$"))
                        continue;
                    _lstSheetNames.Add(Regex.Replace(Regex.Replace(sheetName, "[$]$", ""), "[\"]", "\\\""));
                }
            }
            catch (Exception ex)
            {

                if (fileName.ToLower().EndsWith(".xls") || fileName.ToLower().EndsWith(".xlsx"))
                {
                    isErr = true;
                    respmsg = "There is something wrong with file name/format.";
                }
            }
            return _lstSheetNames;
        }

        public static DataTable ToDataTable<T>(List<T> items)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);

            //Get all the properties
            PropertyInfo[] Props = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo prop in Props)
            {
                //Setting column names as Property names
                dataTable.Columns.Add(prop.Name);
            }
            foreach (T item in items)
            {
                var values = new object[Props.Length];
                for (int i = 0; i < Props.Length; i++)
                {
                    //inserting property values to datatable rows
                    values[i] = Props[i].GetValue(item, null);
                }
                dataTable.Rows.Add(values);
            }
            //put a breakpoint here and check datatable
            return dataTable;
        }

        // ashok added////
        public void WriteLog(string Message, string fileName)
        {
            //StreamWriter sw = null;
            try
            {
                //date added 6-july-2017

                string location = HttpContext.Current.Server.MapPath("~/Content/LogFile/");
                string path = location + fileName + "." + "txt";
                string str = "";
                if (File.Exists(path))
                {
                    using (StreamReader sreader = new StreamReader(path))
                    {
                        str = sreader.ReadToEnd();
                    }

                    File.Delete(path);
                }


                using (StreamWriter sw = new StreamWriter(path, true))
                {
                    str = DateTime.Now.ToString("yyyy/MM/dd hh:mm:ss tt") + " " + " [ Info] " + Message + Environment.NewLine + str;
                    // str = DateTime.Now.ToString() + " : " + Message + Environment.NewLine + str;
                    sw.Write(str);
                    sw.Flush();
                    sw.Close();
                }


                //end
                //sw = new StreamWriter(AppDomain.CurrentDomain.BaseDirectory + "\\Logs\\" + DateTime.Now.ToString("M-d-yyyy") + fileName + ".txt", true);


                //sw.WriteLine(DateTime.Now.ToString() + " : " + Message);
                //sw.Flush();
                //sw.Close();
            }
            catch (Exception ex)
            {
                 //genObj.addExceptionLog(ex, "Equipment_Creation", "Equipment_Creation.HelperLiberary.WriteLog()");
                // modGlobal.writeInLog("Exception in WriteLog() :: " + ex.Message);
            }
        }

    }

  
}