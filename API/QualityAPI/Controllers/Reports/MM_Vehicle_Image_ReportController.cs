using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Web.Http;
using QualityAPI.Helper;
using QualityAPI.Models;

namespace QualityAPI.Controllers.Reports
{
    /*  Vehicle Image Report
     *  Developer : Satish Jadhav ( 50005817 )
     *
     *  Shows the actual audit readings on the same picture on which the locations
     *  were mapped in the Vehicle Image Master.
     *
     *  Three modes :
     *      1) VIN / BIW wise   - reading of that one vehicle
     *      2) Date range wise  - average of every reading taken between two dates
     *      3) Last N audits    - average of the readings of the last N audits
     *
     *  One mapped location can have a Gap reading and a Flushness reading , so one
     *  row is returned per Location + Parameter. The UI groups them back per location
     *  and colours the point by the worst status of the two.
     *
     *  Reading is kept as text in MM_Track_Sheet , so TRY_CONVERT is used everywhere
     *  ( needs SQL Server 2012 or above ). A reading which is not a number , or which
     *  is marked Is_NA , is not counted.
     */
    public class MM_Vehicle_Image_ReportController : ApiController
    {
        private General generalLogObj = new General();

        private string ConnectionString
        {
            get { return ConfigurationManager.ConnectionStrings["OneD_DB"].ConnectionString; }
        }

        // ********************************** Audited Vehicle Section Start *******************************//

        // GET : vehicles audited for this model in the given range
        //       used for the VIN / BIW dropdown and for the " vehicles audited " count
        //  topn > 0 -> the last N audits of the model , the two dates are ignored
        //  topn = 0 -> every audit between the two dates
        [Route("api/MM_Vehicle_Image_Report/GetAuditedVehicles/{plantid},{audittypeid},{modelid},{fromdate},{todate},{topn}")]
        [HttpGet]
        [ActionName("GetAuditedVehicles")]
        public IHttpActionResult GetAuditedVehicles(decimal plantid, decimal audittypeid, decimal modelid, DateTime fromdate, DateTime todate, int topn)
        {
            try
            {
                string sql = topn > 0
                    ? @"
                    SELECT   TOP (@TopN) va.Audit_ID , va.VIN_No , va.Body_No , va.Audit_Date
                    FROM     MM_Vehicle_Audit va
                    WHERE    va.Plant_ID         = @Plant_ID
                             AND va.Audit_Type_Id = @Audit_Type_Id
                             AND va.Model_ID      = @Model_ID
                             AND ISNULL(va.Is_Deleted , 0) = 0
                    ORDER BY va.Audit_Date DESC , va.Audit_ID DESC"
                    : @"
                    SELECT   va.Audit_ID , va.VIN_No , va.Body_No , va.Audit_Date
                    FROM     MM_Vehicle_Audit va
                    WHERE    va.Plant_ID         = @Plant_ID
                             AND va.Audit_Type_Id = @Audit_Type_Id
                             AND va.Model_ID      = @Model_ID
                             AND va.Audit_Date   >= @FromDate
                             AND va.Audit_Date    < @ToDate
                             AND ISNULL(va.Is_Deleted , 0) = 0
                    ORDER BY va.Audit_Date DESC , va.Audit_ID DESC";

                var list = new List<AuditedVehicleRow>();

                using (SqlConnection con = new SqlConnection(ConnectionString))
                using (SqlCommand cmd = new SqlCommand(sql, con))
                {
                    cmd.Parameters.AddWithValue("@Plant_ID", plantid);
                    cmd.Parameters.AddWithValue("@Audit_Type_Id", audittypeid);
                    cmd.Parameters.AddWithValue("@Model_ID", modelid);
                    if (topn > 0)
                    {
                        cmd.Parameters.AddWithValue("@TopN", topn);
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("@FromDate", fromdate.Date);
                        cmd.Parameters.AddWithValue("@ToDate", todate.Date.AddDays(1));
                    }
                    con.Open();
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            list.Add(new AuditedVehicleRow
                            {
                                Audit_ID = Dec(dr, "Audit_ID"),
                                VIN_No = Str(dr, "VIN_No"),
                                Body_No = Str(dr, "Body_No"),
                                Audit_Date = Date(dr, "Audit_Date")
                            });
                        }
                    }
                }
                return Ok(list);
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Report", "GetAuditedVehicles(" + plantid + "," + audittypeid + "," + modelid + ")");
                return Ok(new List<AuditedVehicleRow>());
            }
        }
        // ********************************** Audited Vehicle Section End *******************************//

        // ********************************** Report Section Start *******************************//

        // GET : readings of ONE vehicle ( VIN / BIW wise report )
        [Route("api/MM_Vehicle_Image_Report/GetVinReport/{plantid},{audittypeid},{vehicleimageid},{auditid}")]
        [HttpGet]
        [ActionName("GetVinReport")]
        public IHttpActionResult GetVinReport(decimal plantid, decimal audittypeid, decimal vehicleimageid, decimal auditid)
        {
            try
            {
                return Ok(GetReportRows(vehicleimageid, plantid, audittypeid, auditid, null, null));
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Report", "GetVinReport(" + vehicleimageid + "," + auditid + ")");
                return Ok(new List<ImageReportRow>());
            }
        }

        // GET : average of every reading taken in the range ( date range wise report )
        [Route("api/MM_Vehicle_Image_Report/GetRangeReport/{plantid},{audittypeid},{vehicleimageid},{fromdate},{todate}")]
        [HttpGet]
        [ActionName("GetRangeReport")]
        public IHttpActionResult GetRangeReport(decimal plantid, decimal audittypeid, decimal vehicleimageid, DateTime fromdate, DateTime todate)
        {
            try
            {
                return Ok(GetReportRows(vehicleimageid, plantid, audittypeid, 0, fromdate, todate));
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Report", "GetRangeReport(" + vehicleimageid + ")");
                return Ok(new List<ImageReportRow>());
            }
        }

        // GET : average of the readings of the LAST N audits of this model
        [Route("api/MM_Vehicle_Image_Report/GetLastNReport/{plantid},{audittypeid},{vehicleimageid},{modelid},{topn}")]
        [HttpGet]
        [ActionName("GetLastNReport")]
        public IHttpActionResult GetLastNReport(decimal plantid, decimal audittypeid, decimal vehicleimageid, decimal modelid, int topn)
        {
            try
            {
                return Ok(GetReportRows(vehicleimageid, plantid, audittypeid, 0, null, null, modelid, topn));
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Report", "GetLastNReport(" + vehicleimageid + "," + topn + ")");
                return Ok(new List<ImageReportRow>());
            }
        }

        /*  Same query for all the three reports , only the filter on the audit changes :
         *      auditid > 0  -> that one vehicle
         *      topn    > 0  -> the last N audits of this model
         *      otherwise    -> every vehicle of this model audited between the two dates
         *
         *  It is a LEFT JOIN from the mapping , so a mapped location which has no
         *  reading at all still comes back ( with Reading NULL ) and is shown as
         *  " No Data " on the picture instead of quietly disappearing.
         */
        private List<ImageReportRow> GetReportRows(decimal vehicleimageid, decimal plantid, decimal audittypeid,
                                                   decimal auditid, DateTime? fromdate, DateTime? todate,
                                                   decimal modelid = 0, int topn = 0)
        {
            string auditFilter;
            if (auditid > 0)
            {
                auditFilter = " AND va.Audit_ID = @Audit_ID ";
            }
            else if (topn > 0)
            {
                auditFilter = @" AND va.Audit_ID IN (
                                     SELECT TOP (@TopN) x.Audit_ID
                                     FROM   MM_Vehicle_Audit x
                                     WHERE  x.Plant_ID         = @Plant_ID
                                            AND x.Audit_Type_Id = @Audit_Type_Id
                                            AND x.Model_ID      = @Model_ID
                                            AND ISNULL(x.Is_Deleted , 0) = 0
                                     ORDER BY x.Audit_Date DESC , x.Audit_ID DESC ) ";
            }
            else
            {
                auditFilter = " AND va.Audit_Date >= @FromDate AND va.Audit_Date < @ToDate ";
            }

            string sql = @"
                SELECT   mp.Mapping_ID , mp.Location_ID , mp.X_Coordinate , mp.Y_Coordinate ,
                         mp.Area_ID , mp.Part_ID , mp.Checkpoint_ID ,
                         a.Area_Name , p.Part_Name , c.Checkpoint_Name , l.Location_Name ,
                         ts.Parameter_ID , g.Type AS Parameter_Type ,
                         AVG(TRY_CONVERT(decimal(18,4) , ts.Reading))                     AS Reading ,
                         MIN(sp.MinVal)                                                   AS MinVal ,
                         MAX(sp.MaxVal)                                                   AS MaxVal ,
                         COUNT(TRY_CONVERT(decimal(18,4) , ts.Reading))                   AS Reading_Count ,
                         SUM(CASE WHEN TRY_CONVERT(decimal(18,4) , ts.Reading) IS NOT NULL
                                       AND sp.MinVal IS NOT NULL AND sp.MaxVal IS NOT NULL
                                       AND ( TRY_CONVERT(decimal(18,4) , ts.Reading) < sp.MinVal
                                          OR TRY_CONVERT(decimal(18,4) , ts.Reading) > sp.MaxVal )
                                  THEN 1 ELSE 0 END)                                      AS Nok_Count ,
                         COUNT(DISTINCT va.Audit_ID)                                      AS Vehicle_Count
                FROM     MM_Vehicle_Image_Mapping mp
                         LEFT JOIN MM_AreaMaster       a ON a.Area_ID       = mp.Area_ID
                         LEFT JOIN MM_PartMaster       p ON p.Part_ID       = mp.Part_ID
                         LEFT JOIN MM_CheckpointMaster c ON c.Checkpoint_ID = mp.Checkpoint_ID
                         LEFT JOIN MM_LocationMaster   l ON l.Location_ID   = mp.Location_ID
                         LEFT JOIN MM_Vehicle_Audit   va ON va.Model_ID      = mp.Model_ID
                                                        AND va.Plant_ID      = @Plant_ID
                                                        AND va.Audit_Type_Id = @Audit_Type_Id
                                                        AND ISNULL(va.Is_Deleted , 0) = 0
                                                        " + auditFilter + @"
                         LEFT JOIN MM_Track_Sheet     ts ON ts.Audit_ID    = va.Audit_ID
                                                        AND ts.Location_ID = mp.Location_ID
                                                        AND ISNULL(ts.Is_NA , 0) = 0
                                                        AND ISNULL(ts.Is_Deleted , 0) = 0
                         LEFT JOIN MM_SpecificationMaster sp ON sp.Specification_ID = ts.Specification_ID
                         LEFT JOIN MM_Gap_And_FlushMaster  g ON g.ID = ts.Parameter_ID
                WHERE    mp.Vehicle_Image_ID = @Vehicle_Image_ID
                GROUP BY mp.Mapping_ID , mp.Location_ID , mp.X_Coordinate , mp.Y_Coordinate ,
                         mp.Area_ID , mp.Part_ID , mp.Checkpoint_ID ,
                         a.Area_Name , p.Part_Name , c.Checkpoint_Name , l.Location_Name ,
                         ts.Parameter_ID , g.Type
                ORDER BY p.Part_Name , c.Checkpoint_Name , l.Location_Name , g.Type";

            var list = new List<ImageReportRow>();

            using (SqlConnection con = new SqlConnection(ConnectionString))
            using (SqlCommand cmd = new SqlCommand(sql, con))
            {
                cmd.Parameters.AddWithValue("@Vehicle_Image_ID", vehicleimageid);
                cmd.Parameters.AddWithValue("@Plant_ID", plantid);
                cmd.Parameters.AddWithValue("@Audit_Type_Id", audittypeid);
                if (auditid > 0)
                {
                    cmd.Parameters.AddWithValue("@Audit_ID", auditid);
                }
                else if (topn > 0)
                {
                    cmd.Parameters.AddWithValue("@TopN", topn);
                    cmd.Parameters.AddWithValue("@Model_ID", modelid);
                }
                else
                {
                    cmd.Parameters.AddWithValue("@FromDate", (fromdate ?? DateTime.Today).Date);
                    cmd.Parameters.AddWithValue("@ToDate", (todate ?? DateTime.Today).Date.AddDays(1));
                }

                con.Open();
                using (SqlDataReader dr = cmd.ExecuteReader())
                {
                    while (dr.Read())
                    {
                        list.Add(new ImageReportRow
                        {
                            Mapping_ID = Dec(dr, "Mapping_ID"),
                            Location_ID = Dec(dr, "Location_ID"),
                            X_Coordinate = Dec(dr, "X_Coordinate"),
                            Y_Coordinate = Dec(dr, "Y_Coordinate"),
                            Area_ID = Dec(dr, "Area_ID"),
                            Part_ID = Dec(dr, "Part_ID"),
                            Checkpoint_ID = Dec(dr, "Checkpoint_ID"),
                            Area_Name = Str(dr, "Area_Name"),
                            Part_Name = Str(dr, "Part_Name"),
                            Checkpoint_Name = Str(dr, "Checkpoint_Name"),
                            Location_Name = Str(dr, "Location_Name"),
                            Parameter_ID = NullDec(dr, "Parameter_ID"),
                            Parameter_Type = Str(dr, "Parameter_Type"),
                            Reading = NullDec(dr, "Reading"),
                            MinVal = NullDec(dr, "MinVal"),
                            MaxVal = NullDec(dr, "MaxVal"),
                            Reading_Count = (int)Dec(dr, "Reading_Count"),
                            Nok_Count = (int)Dec(dr, "Nok_Count"),
                            Vehicle_Count = (int)Dec(dr, "Vehicle_Count")
                        });
                    }
                }
            }
            return list;
        }
        // ********************************** Chart Section Start *******************************//

        /*  Every individual reading of ONE mapped location + ONE parameter , in the
         *  order in which the vehicles were audited. The charts ( X bar , Histogram ,
         *  MR ) and the Cp / Cpk box are all drawn from this one series.
         *
         *  topn > 0 -> the last N readings , the two dates are ignored
         *  topn = 0 -> every reading between the two dates
         */
        [Route("api/MM_Vehicle_Image_Report/GetLocationReadings/{plantid},{audittypeid},{modelid},{locationid},{parameterid},{fromdate},{todate},{topn}")]
        [HttpGet]
        [ActionName("GetLocationReadings")]
        public IHttpActionResult GetLocationReadings(decimal plantid, decimal audittypeid, decimal modelid,
                                                     decimal locationid, decimal parameterid,
                                                     DateTime fromdate, DateTime todate, int topn)
        {
            try
            {
                string baseSelect = @"
                    SELECT   " + (topn > 0 ? "TOP (@TopN)" : "") + @"
                             va.Audit_ID , va.Audit_Date , va.VIN_No , va.Body_No ,
                             TRY_CONVERT(decimal(18,4) , ts.Reading) AS Reading ,
                             sp.MinVal , sp.MaxVal , sp.LCL , sp.UCL , sp.UCLR
                    FROM     MM_Vehicle_Audit va
                             INNER JOIN MM_Track_Sheet ts
                                     ON ts.Audit_ID      = va.Audit_ID
                                    AND ts.Location_ID   = @Location_ID
                                    AND ts.Parameter_ID  = @Parameter_ID
                                    AND ISNULL(ts.Is_NA , 0) = 0
                                    AND ISNULL(ts.Is_Deleted , 0) = 0
                             LEFT JOIN MM_SpecificationMaster sp
                                    ON sp.Specification_ID = ts.Specification_ID
                    WHERE    va.Plant_ID         = @Plant_ID
                             AND va.Audit_Type_Id = @Audit_Type_Id
                             AND va.Model_ID      = @Model_ID
                             AND ISNULL(va.Is_Deleted , 0) = 0
                             AND TRY_CONVERT(decimal(18,4) , ts.Reading) IS NOT NULL "
                    + (topn > 0 ? "" : " AND va.Audit_Date >= @FromDate AND va.Audit_Date < @ToDate ");

                /*  The charts must read left to right by audit date.
                 *
                 *  Last N : the newest N rows are taken first and are then put back
                 *           into audit order by the outer query. The derived table is
                 *           allowed here only because it carries TOP - without TOP ,
                 *           SQL Server rejects an ORDER BY inside a derived table.
                 *  Range  : no TOP is needed , so it is ordered directly and no
                 *           derived table is used at all.
                 */
                string sql = topn > 0
                    ? "SELECT * FROM ( " + baseSelect +
                      " ORDER BY va.Audit_Date DESC , va.Audit_ID DESC ) t " +
                      " ORDER BY t.Audit_Date , t.Audit_ID"
                    : baseSelect + " ORDER BY va.Audit_Date , va.Audit_ID";

                var list = new List<LocationReadingRow>();

                using (SqlConnection con = new SqlConnection(ConnectionString))
                using (SqlCommand cmd = new SqlCommand(sql, con))
                {
                    cmd.Parameters.AddWithValue("@Plant_ID", plantid);
                    cmd.Parameters.AddWithValue("@Audit_Type_Id", audittypeid);
                    cmd.Parameters.AddWithValue("@Model_ID", modelid);
                    cmd.Parameters.AddWithValue("@Location_ID", locationid);
                    cmd.Parameters.AddWithValue("@Parameter_ID", parameterid);
                    if (topn > 0)
                    {
                        cmd.Parameters.AddWithValue("@TopN", topn);
                    }
                    else
                    {
                        cmd.Parameters.AddWithValue("@FromDate", fromdate.Date);
                        cmd.Parameters.AddWithValue("@ToDate", todate.Date.AddDays(1));
                    }
                    con.Open();
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            list.Add(new LocationReadingRow
                            {
                                Audit_ID = Dec(dr, "Audit_ID"),
                                Audit_Date = Date(dr, "Audit_Date"),
                                VIN_No = Str(dr, "VIN_No"),
                                Body_No = Str(dr, "Body_No"),
                                Reading = Dec(dr, "Reading"),
                                MinVal = NullDec(dr, "MinVal"),
                                MaxVal = NullDec(dr, "MaxVal"),
                                LCL = NullDec(dr, "LCL"),
                                UCL = NullDec(dr, "UCL"),
                                UCLR = NullDec(dr, "UCLR")
                            });
                        }
                    }
                }
                return Ok(list);
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Report",
                    "GetLocationReadings(" + locationid + "," + parameterid + ")");
                return Ok(new List<LocationReadingRow>());
            }
        }
        // ********************************** Chart Section End *******************************//

        // ********************************** Report Section End *******************************//

        // ********************************** Helper Section Start *******************************//
        private static decimal Dec(SqlDataReader dr, string col)
        {
            int i = dr.GetOrdinal(col);
            return dr.IsDBNull(i) ? 0 : Convert.ToDecimal(dr.GetValue(i));
        }

        private static Nullable<decimal> NullDec(SqlDataReader dr, string col)
        {
            int i = dr.GetOrdinal(col);
            return dr.IsDBNull(i) ? (decimal?)null : Convert.ToDecimal(dr.GetValue(i));
        }

        private static string Str(SqlDataReader dr, string col)
        {
            int i = dr.GetOrdinal(col);
            return dr.IsDBNull(i) ? null : Convert.ToString(dr.GetValue(i));
        }

        private static Nullable<DateTime> Date(SqlDataReader dr, string col)
        {
            int i = dr.GetOrdinal(col);
            return dr.IsDBNull(i) ? (DateTime?)null : Convert.ToDateTime(dr.GetValue(i));
        }
        // ********************************** Helper Section End *******************************//
    }

    // ********************************** Models Section Start *******************************//
    public class AuditedVehicleRow
    {
        public decimal Audit_ID { get; set; }
        public string VIN_No { get; set; }
        public string Body_No { get; set; }
        public Nullable<DateTime> Audit_Date { get; set; }
    }

    public class LocationReadingRow
    {
        public decimal Audit_ID { get; set; }
        public Nullable<DateTime> Audit_Date { get; set; }
        public string VIN_No { get; set; }
        public string Body_No { get; set; }
        public decimal Reading { get; set; }
        // specification limits
        public Nullable<decimal> MinVal { get; set; }
        public Nullable<decimal> MaxVal { get; set; }
        // control limits kept in the Specification Master ( Calculations screen )
        public Nullable<decimal> LCL { get; set; }
        public Nullable<decimal> UCL { get; set; }
        public Nullable<decimal> UCLR { get; set; }
    }

    public class ImageReportRow
    {
        public decimal Mapping_ID { get; set; }
        public decimal Location_ID { get; set; }
        public decimal X_Coordinate { get; set; }
        public decimal Y_Coordinate { get; set; }
        public decimal Area_ID { get; set; }
        public decimal Part_ID { get; set; }
        public decimal Checkpoint_ID { get; set; }
        public string Area_Name { get; set; }
        public string Part_Name { get; set; }
        public string Checkpoint_Name { get; set; }
        public string Location_Name { get; set; }
        public Nullable<decimal> Parameter_ID { get; set; }
        public string Parameter_Type { get; set; }
        public Nullable<decimal> Reading { get; set; }
        public Nullable<decimal> MinVal { get; set; }
        public Nullable<decimal> MaxVal { get; set; }
        public int Reading_Count { get; set; }
        public int Nok_Count { get; set; }
        public int Vehicle_Count { get; set; }
    }
    // ********************************** Models Section End *******************************//
}
