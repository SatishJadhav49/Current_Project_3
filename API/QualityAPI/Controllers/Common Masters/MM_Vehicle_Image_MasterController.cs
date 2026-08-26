using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Http;
using QualityAPI.Helper;
using QualityAPI.Models;

namespace QualityAPI.Controllers.Common_Masters
{
    /*  Vehicle Image Master
     *  Developer : Satish Jadhav ( 50005817 )
     *
     *  Tables    : MM_Vehicle_Image_Master , MM_Vehicle_Image_Mapping
     *
     *  This controller talks to the database with plain ADO.NET instead of the
     *  OneD_DB_Entity context , because that context is generated from the edmx file and
     *  adding these two new tables in it would need the model to be regenerated in
     *  Visual Studio. Same approach is already used in MM_Audit_Plan_MasterController.
     *
     *  X_Coordinate / Y_Coordinate are kept in PERCENTAGE of the image ( 0 to 100 ) ,
     *  so the mapped location always points to the same spot of the vehicle on any
     *  screen size and on any image resolution.
     */
    public class MM_Vehicle_Image_MasterController : ApiController
    {
        GlobalData messageDataObj = new GlobalData();
        ValidationModel validobj = new ValidationModel();
        private General generalLogObj = new General();

        private string ConnectionString
        {
            get { return ConfigurationManager.ConnectionStrings["OneD_DB"].ConnectionString; }
        }

        // ********************************** Vehicle Image Section Start *******************************//

        // GET : images uploaded for one Shop + Model
        [Route("api/MM_Vehicle_Image_Master/GetVehicleImages/{plantid},{audittypeid},{shopid},{modelid}")]
        [HttpGet]
        [ActionName("GetVehicleImages")]
        public IHttpActionResult GetVehicleImages(decimal plantid, decimal audittypeid, decimal shopid, decimal modelid)
        {
            try
            {
                const string sql = @"
                    SELECT  v.Vehicle_Image_ID , v.Image_Name , v.FileContent , v.FileName ,
                            v.Shop_ID , v.Model_ID , v.Plant_ID , v.Audit_Type_Id , v.Inserted_Date ,
                            s.Shop_Name , m.Model_Code AS Model_Name ,
                            ISNULL(( SELECT COUNT(1) FROM MM_Vehicle_Image_Mapping mp
                                     WHERE mp.Vehicle_Image_ID = v.Vehicle_Image_ID ), 0) AS Mapping_Count
                    FROM    MM_Vehicle_Image_Master v
                            LEFT JOIN MM_Shop  s ON s.Shop_ID  = v.Shop_ID
                            LEFT JOIN MM_Model m ON m.Model_ID = v.Model_ID
                    WHERE   v.Plant_ID = @Plant_ID
                            AND v.Shop_ID  = @Shop_ID
                            AND v.Model_ID = @Model_ID
                            AND ( v.Audit_Type_Id = @Audit_Type_Id OR v.Audit_Type_Id IS NULL )
                            AND ISNULL(v.Is_Deleted , 0) = 0
                    ORDER BY v.Inserted_Date DESC";

                var list = new List<VehicleImageRow>();

                using (SqlConnection con = new SqlConnection(ConnectionString))
                using (SqlCommand cmd = new SqlCommand(sql, con))
                {
                    cmd.Parameters.AddWithValue("@Plant_ID", plantid);
                    cmd.Parameters.AddWithValue("@Shop_ID", shopid);
                    cmd.Parameters.AddWithValue("@Model_ID", modelid);
                    cmd.Parameters.AddWithValue("@Audit_Type_Id", audittypeid);
                    con.Open();
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            list.Add(new VehicleImageRow
                            {
                                Vehicle_Image_ID = Dec(dr, "Vehicle_Image_ID"),
                                Image_Name = Str(dr, "Image_Name"),
                                FileContent = Bytes(dr, "FileContent"),
                                FileName = Str(dr, "FileName"),
                                Shop_ID = Dec(dr, "Shop_ID"),
                                Model_ID = Dec(dr, "Model_ID"),
                                Plant_ID = Dec(dr, "Plant_ID"),
                                Audit_Type_Id = Dec(dr, "Audit_Type_Id"),
                                Shop_Name = Str(dr, "Shop_Name"),
                                Model_Name = Str(dr, "Model_Name"),
                                Mapping_Count = (int)Dec(dr, "Mapping_Count"),
                                Inserted_Date = Date(dr, "Inserted_Date")
                            });
                        }
                    }
                }
                return Ok(list);
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Master", "GetVehicleImages(" + plantid + "," + audittypeid + "," + shopid + "," + modelid + ")");
                return Ok(new List<VehicleImageRow>());
            }
        }

        // POST : upload a new vehicle image  ( multipart : Image + imagemodel )
        [Route("api/MM_Vehicle_Image_Master/ImageUpload")]
        [HttpPost]
        [ActionName("ImageUpload")]
        public IHttpActionResult ImageUpload()
        {
            decimal userid = 0;
            try
            {
                var httpRequest = HttpContext.Current.Request;
                HttpFileCollection uploadFiles = httpRequest.Files;

                if (uploadFiles == null || uploadFiles.Count == 0 || uploadFiles[0] == null || uploadFiles[0].ContentLength == 0)
                {
                    validobj.IsErrorAlert = true;
                    validobj.IsTitle = messageDataObj.SaveErrorTitle;
                    validobj.IsMassege = "Please choose an image.";
                    return Ok(validobj);
                }

                HttpPostedFile postedFile = uploadFiles[0];
                VehicleImageModel obj = Newtonsoft.Json.JsonConvert.DeserializeObject<VehicleImageModel>(httpRequest.Params["imagemodel"]);
                userid = obj.Inserted_User_ID ?? 0;

                if (IsDuplicateImageName(obj.Plant_ID, obj.Shop_ID, obj.Model_ID, obj.Image_Name, 0))
                {
                    validobj.IsErrorAlertDuplicate = true;
                    validobj.IsTitle = messageDataObj.DuplicateTitle;
                    validobj.IsMassege = messageDataObj.DuplicateMessage;
                    return Ok(validobj);
                }

                byte[] content;
                using (var reader = new System.IO.BinaryReader(postedFile.InputStream))
                {
                    content = reader.ReadBytes(postedFile.ContentLength);
                }

                const string sql = @"
                    INSERT INTO MM_Vehicle_Image_Master
                        ( Image_Name , FileContent , FileName , FileType , ContentType ,
                          Shop_ID , Model_ID , Plant_ID , Audit_Type_Id ,
                          Is_Active , Is_Deleted , Inserted_Host , Inserted_User_ID , Inserted_Date )
                    VALUES
                        ( @Image_Name , @FileContent , @FileName , @FileType , @ContentType ,
                          @Shop_ID , @Model_ID , @Plant_ID , @Audit_Type_Id ,
                          1 , 0 , @Inserted_Host , @Inserted_User_ID , GETDATE() );
                    SELECT CAST(SCOPE_IDENTITY() AS numeric(18,0));";

                using (SqlConnection con = new SqlConnection(ConnectionString))
                using (SqlCommand cmd = new SqlCommand(sql, con))
                {
                    cmd.Parameters.AddWithValue("@Image_Name", (object)obj.Image_Name ?? DBNull.Value);
                    cmd.Parameters.Add("@FileContent", SqlDbType.VarBinary, -1).Value = content;
                    cmd.Parameters.AddWithValue("@FileName", (object)System.IO.Path.GetFileName(postedFile.FileName) ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@FileType", (object)System.IO.Path.GetExtension(postedFile.FileName) ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@ContentType", (object)postedFile.ContentType ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Shop_ID", obj.Shop_ID);
                    cmd.Parameters.AddWithValue("@Model_ID", obj.Model_ID);
                    cmd.Parameters.AddWithValue("@Plant_ID", obj.Plant_ID);
                    cmd.Parameters.AddWithValue("@Audit_Type_Id", (object)obj.Audit_Type_Id ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Inserted_Host", (object)obj.Inserted_Host ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@Inserted_User_ID", (object)obj.Inserted_User_ID ?? DBNull.Value);
                    con.Open();
                    cmd.ExecuteScalar();
                }

                validobj.IsSuccessAlert = true;
                validobj.IsTitle = messageDataObj.SuccessTitle;
                validobj.IsMassege = messageDataObj.SuccessMessage;
                return Ok(validobj);
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Master", "ImageUpload()", userid);
                validobj.isExceptionMessage = true;
                validobj.IsTitle = messageDataObj.ExceptionTitle;
                validobj.IsMassege = e.Message;
                return Ok(validobj);
            }
        }

        // POST : replace the picture of an existing vehicle image
        //        keepmapping = 1  -> the mapped locations are kept as they are ( co-ordinates are in % )
        //        keepmapping = 0  -> all the mapped locations of this image are removed
        [Route("api/MM_Vehicle_Image_Master/ChangeImage/{id},{keepmapping}")]
        [HttpPost]
        [ActionName("ChangeImage")]
        public IHttpActionResult ChangeImage(decimal id, bool keepmapping)
        {
            decimal userid = 0;
            try
            {
                var httpRequest = HttpContext.Current.Request;
                HttpFileCollection uploadFiles = httpRequest.Files;

                if (uploadFiles == null || uploadFiles.Count == 0 || uploadFiles[0] == null || uploadFiles[0].ContentLength == 0)
                {
                    validobj.IsErrorAlert = true;
                    validobj.IsTitle = messageDataObj.UpdateErrorTitle;
                    validobj.IsMassege = "Please choose an image.";
                    return Ok(validobj);
                }

                HttpPostedFile postedFile = uploadFiles[0];
                VehicleImageModel obj = new VehicleImageModel();
                if (!string.IsNullOrEmpty(httpRequest.Params["imagemodel"]))
                {
                    obj = Newtonsoft.Json.JsonConvert.DeserializeObject<VehicleImageModel>(httpRequest.Params["imagemodel"]);
                }
                userid = obj.Updated_User_ID ?? 0;

                byte[] content;
                using (var reader = new System.IO.BinaryReader(postedFile.InputStream))
                {
                    content = reader.ReadBytes(postedFile.ContentLength);
                }

                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    con.Open();
                    using (SqlTransaction tran = con.BeginTransaction())
                    {
                        try
                        {
                            const string checkSql = "SELECT COUNT(1) FROM MM_Vehicle_Image_Master WHERE Vehicle_Image_ID = @id";
                            using (SqlCommand chk = new SqlCommand(checkSql, con, tran))
                            {
                                chk.Parameters.AddWithValue("@id", id);
                                if (Convert.ToInt32(chk.ExecuteScalar()) == 0)
                                {
                                    tran.Rollback();
                                    validobj.IsErrorAlertNotFound = true;
                                    validobj.IsTitle = messageDataObj.RecordnotFoundTitle;
                                    validobj.IsMassege = messageDataObj.RecordNotFoundMessage;
                                    return Ok(validobj);
                                }
                            }

                            const string updSql = @"
                                UPDATE MM_Vehicle_Image_Master
                                SET    FileContent = @FileContent ,
                                       FileName    = @FileName ,
                                       FileType    = @FileType ,
                                       ContentType = @ContentType ,
                                       Is_Edited   = 1 ,
                                       Updated_Host    = @Updated_Host ,
                                       Updated_User_ID = @Updated_User_ID ,
                                       Updated_Date    = GETDATE()
                                WHERE  Vehicle_Image_ID = @id";

                            using (SqlCommand cmd = new SqlCommand(updSql, con, tran))
                            {
                                cmd.Parameters.Add("@FileContent", SqlDbType.VarBinary, -1).Value = content;
                                cmd.Parameters.AddWithValue("@FileName", (object)System.IO.Path.GetFileName(postedFile.FileName) ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@FileType", (object)System.IO.Path.GetExtension(postedFile.FileName) ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@ContentType", (object)postedFile.ContentType ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@Updated_Host", (object)obj.Updated_Host ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@Updated_User_ID", (object)obj.Updated_User_ID ?? DBNull.Value);
                                cmd.Parameters.AddWithValue("@id", id);
                                cmd.ExecuteNonQuery();
                            }

                            if (!keepmapping)
                            {
                                using (SqlCommand del = new SqlCommand("DELETE FROM MM_Vehicle_Image_Mapping WHERE Vehicle_Image_ID = @id", con, tran))
                                {
                                    del.Parameters.AddWithValue("@id", id);
                                    del.ExecuteNonQuery();
                                }
                            }

                            tran.Commit();
                        }
                        catch
                        {
                            tran.Rollback();
                            throw;
                        }
                    }
                }

                validobj.IsSuccessAlert = true;
                validobj.IsTitle = messageDataObj.UpdateTitle;
                validobj.IsMassege = keepmapping
                    ? "Image changed successfully , mapped locations are kept."
                    : "Image changed successfully , mapped locations are removed.";
                return Ok(validobj);
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Master", "ChangeImage(" + id + "," + keepmapping + ")", userid);
                validobj.isExceptionMessage = true;
                validobj.IsTitle = messageDataObj.ExceptionTitle;
                validobj.IsMassege = e.Message;
                return Ok(validobj);
            }
        }

        // DELETE : remove the vehicle image together with every location mapped on it
        [Route("api/MM_Vehicle_Image_Master/DeleteImage/{id}")]
        [HttpDelete]
        [ActionName("DeleteImage")]
        public IHttpActionResult DeleteImage(decimal id)
        {
            try
            {
                int mappingRemoved = 0;

                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    con.Open();
                    using (SqlTransaction tran = con.BeginTransaction())
                    {
                        try
                        {
                            using (SqlCommand del = new SqlCommand("DELETE FROM MM_Vehicle_Image_Mapping WHERE Vehicle_Image_ID = @id", con, tran))
                            {
                                del.Parameters.AddWithValue("@id", id);
                                mappingRemoved = del.ExecuteNonQuery();
                            }

                            int rows;
                            using (SqlCommand del = new SqlCommand("DELETE FROM MM_Vehicle_Image_Master WHERE Vehicle_Image_ID = @id", con, tran))
                            {
                                del.Parameters.AddWithValue("@id", id);
                                rows = del.ExecuteNonQuery();
                            }

                            if (rows == 0)
                            {
                                tran.Rollback();
                                validobj.IsErrorAlertNotFound = true;
                                validobj.IsTitle = messageDataObj.RecordnotFoundTitle;
                                validobj.IsMassege = messageDataObj.RecordNotFoundMessage;
                                return Ok(validobj);
                            }

                            tran.Commit();
                        }
                        catch
                        {
                            tran.Rollback();
                            throw;
                        }
                    }
                }

                validobj.IsSuccessAlert = true;
                validobj.IsTitle = messageDataObj.DeletionTitle;
                validobj.IsMassege = "Image deleted successfully along with " + mappingRemoved + " mapped location(s).";
                return Ok(validobj);
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Master", "DeleteImage(" + id + ")");
                validobj.isExceptionMessage = true;
                validobj.IsTitle = messageDataObj.ExceptionTitle;
                validobj.IsMassege = e.Message;
                return Ok(validobj);
            }
        }
        // ********************************** Vehicle Image Section End *******************************//

        // ********************************** Mapping Section Start *******************************//

        // GET : all the locations mapped on one vehicle image
        [Route("api/MM_Vehicle_Image_Master/GetMapping/{plantid},{audittypeid},{vehicleimageid}")]
        [HttpGet]
        [ActionName("GetMapping")]
        public IHttpActionResult GetMapping(decimal plantid, decimal audittypeid, decimal vehicleimageid)
        {
            try
            {
                const string sql = @"
                    SELECT  mp.Mapping_ID , mp.Vehicle_Image_ID , mp.Shop_ID , mp.Model_ID ,
                            mp.Area_ID , mp.Part_ID , mp.Checkpoint_ID , mp.Location_ID ,
                            mp.X_Coordinate , mp.Y_Coordinate ,
                            a.Area_Name , p.Part_Name , c.Checkpoint_Name , l.Location_Name
                    FROM    MM_Vehicle_Image_Mapping mp
                            LEFT JOIN MM_AreaMaster       a ON a.Area_ID       = mp.Area_ID
                            LEFT JOIN MM_PartMaster       p ON p.Part_ID       = mp.Part_ID
                            LEFT JOIN MM_CheckpointMaster c ON c.Checkpoint_ID = mp.Checkpoint_ID
                            LEFT JOIN MM_LocationMaster   l ON l.Location_ID   = mp.Location_ID
                    WHERE   mp.Vehicle_Image_ID = @Vehicle_Image_ID
                    ORDER BY mp.Mapping_ID";

                var list = new List<VehicleImageMappingRow>();

                using (SqlConnection con = new SqlConnection(ConnectionString))
                using (SqlCommand cmd = new SqlCommand(sql, con))
                {
                    cmd.Parameters.AddWithValue("@Vehicle_Image_ID", vehicleimageid);
                    con.Open();
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            list.Add(new VehicleImageMappingRow
                            {
                                Mapping_ID = Dec(dr, "Mapping_ID"),
                                Vehicle_Image_ID = Dec(dr, "Vehicle_Image_ID"),
                                Shop_ID = Dec(dr, "Shop_ID"),
                                Model_ID = Dec(dr, "Model_ID"),
                                Area_ID = Dec(dr, "Area_ID"),
                                Part_ID = Dec(dr, "Part_ID"),
                                Checkpoint_ID = Dec(dr, "Checkpoint_ID"),
                                Location_ID = Dec(dr, "Location_ID"),
                                X_Coordinate = Dec(dr, "X_Coordinate"),
                                Y_Coordinate = Dec(dr, "Y_Coordinate"),
                                Area_Name = Str(dr, "Area_Name"),
                                Part_Name = Str(dr, "Part_Name"),
                                Checkpoint_Name = Str(dr, "Checkpoint_Name"),
                                Location_Name = Str(dr, "Location_Name")
                            });
                        }
                    }
                }
                return Ok(list);
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Master", "GetMapping(" + vehicleimageid + ")");
                return Ok(new List<VehicleImageMappingRow>());
            }
        }

        // POST : map one location on the image
        [Route("api/MM_Vehicle_Image_Master/SaveMapping")]
        [HttpPost]
        [ActionName("SaveMapping")]
        public IHttpActionResult SaveMapping([FromBody] VehicleImageMappingModel obj)
        {
            decimal userid = 0;
            try
            {
                if (obj == null)
                {
                    validobj.IsErrorAlert = true;
                    validobj.IsTitle = messageDataObj.SaveErrorTitle;
                    validobj.IsMassege = messageDataObj.SaveErrorMessage;
                    return Ok(validobj);
                }
                userid = obj.Inserted_User_ID ?? 0;

                // one location can be mapped only once on one image
                const string dupSql = @"SELECT COUNT(1) FROM MM_Vehicle_Image_Mapping
                                        WHERE Vehicle_Image_ID = @Vehicle_Image_ID AND Location_ID = @Location_ID";

                const string insSql = @"
                    INSERT INTO MM_Vehicle_Image_Mapping
                        ( Vehicle_Image_ID , Shop_ID , Model_ID , Area_ID , Part_ID , Checkpoint_ID , Location_ID ,
                          X_Coordinate , Y_Coordinate , Plant_ID , Audit_Type_Id ,
                          Is_Active , Is_Deleted , Inserted_Host , Inserted_User_ID , Inserted_Date )
                    VALUES
                        ( @Vehicle_Image_ID , @Shop_ID , @Model_ID , @Area_ID , @Part_ID , @Checkpoint_ID , @Location_ID ,
                          @X_Coordinate , @Y_Coordinate , @Plant_ID , @Audit_Type_Id ,
                          1 , 0 , @Inserted_Host , @Inserted_User_ID , GETDATE() );
                    SELECT CAST(SCOPE_IDENTITY() AS numeric(18,0));";

                using (SqlConnection con = new SqlConnection(ConnectionString))
                {
                    con.Open();

                    using (SqlCommand dup = new SqlCommand(dupSql, con))
                    {
                        dup.Parameters.AddWithValue("@Vehicle_Image_ID", obj.Vehicle_Image_ID);
                        dup.Parameters.AddWithValue("@Location_ID", obj.Location_ID);
                        if (Convert.ToInt32(dup.ExecuteScalar()) > 0)
                        {
                            validobj.IsErrorAlertDuplicate = true;
                            validobj.IsTitle = messageDataObj.DuplicateTitle;
                            validobj.IsMassege = "This location is already mapped on the selected image.";
                            return Ok(validobj);
                        }
                    }

                    using (SqlCommand cmd = new SqlCommand(insSql, con))
                    {
                        cmd.Parameters.AddWithValue("@Vehicle_Image_ID", obj.Vehicle_Image_ID);
                        cmd.Parameters.AddWithValue("@Shop_ID", obj.Shop_ID);
                        cmd.Parameters.AddWithValue("@Model_ID", obj.Model_ID);
                        cmd.Parameters.AddWithValue("@Area_ID", obj.Area_ID);
                        cmd.Parameters.AddWithValue("@Part_ID", obj.Part_ID);
                        cmd.Parameters.AddWithValue("@Checkpoint_ID", obj.Checkpoint_ID);
                        cmd.Parameters.AddWithValue("@Location_ID", obj.Location_ID);
                        cmd.Parameters.AddWithValue("@X_Coordinate", obj.X_Coordinate);
                        cmd.Parameters.AddWithValue("@Y_Coordinate", obj.Y_Coordinate);
                        cmd.Parameters.AddWithValue("@Plant_ID", (object)obj.Plant_ID ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@Audit_Type_Id", (object)obj.Audit_Type_Id ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@Inserted_Host", (object)obj.Inserted_Host ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("@Inserted_User_ID", (object)obj.Inserted_User_ID ?? DBNull.Value);
                        cmd.ExecuteScalar();
                    }
                }

                validobj.IsSuccessAlert = true;
                validobj.IsTitle = messageDataObj.SuccessTitle;
                validobj.IsMassege = messageDataObj.SuccessMessage;
                return Ok(validobj);
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Master", "SaveMapping()", userid);
                validobj.isExceptionMessage = true;
                validobj.IsTitle = messageDataObj.ExceptionTitle;
                validobj.IsMassege = e.Message;
                return Ok(validobj);
            }
        }

        // DELETE : remove one mapped location
        [Route("api/MM_Vehicle_Image_Master/DeleteMapping/{id}")]
        [HttpDelete]
        [ActionName("DeleteMapping")]
        public IHttpActionResult DeleteMapping(decimal id)
        {
            try
            {
                int rows;
                using (SqlConnection con = new SqlConnection(ConnectionString))
                using (SqlCommand cmd = new SqlCommand("DELETE FROM MM_Vehicle_Image_Mapping WHERE Mapping_ID = @id", con))
                {
                    cmd.Parameters.AddWithValue("@id", id);
                    con.Open();
                    rows = cmd.ExecuteNonQuery();
                }

                if (rows == 0)
                {
                    validobj.IsErrorAlertNotFound = true;
                    validobj.IsTitle = messageDataObj.RecordnotFoundTitle;
                    validobj.IsMassege = messageDataObj.RecordNotFoundMessage;
                    return Ok(validobj);
                }

                validobj.IsSuccessAlert = true;
                validobj.IsTitle = messageDataObj.DeletionTitle;
                validobj.IsMassege = messageDataObj.DeletionMessage;
                return Ok(validobj);
            }
            catch (Exception e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Image_Master", "DeleteMapping(" + id + ")");
                validobj.isExceptionMessage = true;
                validobj.IsTitle = messageDataObj.ExceptionTitle;
                validobj.IsMassege = e.Message;
                return Ok(validobj);
            }
        }
        // ********************************** Mapping Section End *******************************//

        // ********************************** Helper Section Start *******************************//
        private bool IsDuplicateImageName(decimal plantid, decimal shopid, decimal modelid, string name, decimal excludeId)
        {
            const string sql = @"SELECT COUNT(1) FROM MM_Vehicle_Image_Master
                                 WHERE Plant_ID = @Plant_ID AND Shop_ID = @Shop_ID AND Model_ID = @Model_ID
                                       AND Image_Name = @Image_Name
                                       AND Vehicle_Image_ID <> @ExcludeId
                                       AND ISNULL(Is_Deleted , 0) = 0";

            using (SqlConnection con = new SqlConnection(ConnectionString))
            using (SqlCommand cmd = new SqlCommand(sql, con))
            {
                cmd.Parameters.AddWithValue("@Plant_ID", plantid);
                cmd.Parameters.AddWithValue("@Shop_ID", shopid);
                cmd.Parameters.AddWithValue("@Model_ID", modelid);
                cmd.Parameters.AddWithValue("@Image_Name", (object)name ?? DBNull.Value);
                cmd.Parameters.AddWithValue("@ExcludeId", excludeId);
                con.Open();
                return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
            }
        }

        private static decimal Dec(SqlDataReader dr, string col)
        {
            int i = dr.GetOrdinal(col);
            return dr.IsDBNull(i) ? 0 : Convert.ToDecimal(dr.GetValue(i));
        }

        private static string Str(SqlDataReader dr, string col)
        {
            int i = dr.GetOrdinal(col);
            return dr.IsDBNull(i) ? null : Convert.ToString(dr.GetValue(i));
        }

        private static byte[] Bytes(SqlDataReader dr, string col)
        {
            int i = dr.GetOrdinal(col);
            return dr.IsDBNull(i) ? null : (byte[])dr.GetValue(i);
        }

        private static DateTime? Date(SqlDataReader dr, string col)
        {
            int i = dr.GetOrdinal(col);
            return dr.IsDBNull(i) ? (DateTime?)null : Convert.ToDateTime(dr.GetValue(i));
        }
        // ********************************** Helper Section End *******************************//
    }

    // ********************************** Models Section Start *******************************//
    // kept in this file on purpose , so that only one file has to be added in the project

    public class VehicleImageModel
    {
        public decimal Vehicle_Image_ID { get; set; }
        public string Image_Name { get; set; }
        public decimal Shop_ID { get; set; }
        public decimal Model_ID { get; set; }
        public decimal Plant_ID { get; set; }
        public Nullable<decimal> Audit_Type_Id { get; set; }
        public string Inserted_Host { get; set; }
        public Nullable<decimal> Inserted_User_ID { get; set; }
        public string Updated_Host { get; set; }
        public Nullable<decimal> Updated_User_ID { get; set; }
    }

    public class VehicleImageMappingModel
    {
        public decimal Vehicle_Image_ID { get; set; }
        public decimal Shop_ID { get; set; }
        public decimal Model_ID { get; set; }
        public decimal Area_ID { get; set; }
        public decimal Part_ID { get; set; }
        public decimal Checkpoint_ID { get; set; }
        public decimal Location_ID { get; set; }
        public decimal X_Coordinate { get; set; }
        public decimal Y_Coordinate { get; set; }
        public Nullable<decimal> Plant_ID { get; set; }
        public Nullable<decimal> Audit_Type_Id { get; set; }
        public string Inserted_Host { get; set; }
        public Nullable<decimal> Inserted_User_ID { get; set; }
    }

    public class VehicleImageRow
    {
        public decimal Vehicle_Image_ID { get; set; }
        public string Image_Name { get; set; }
        public byte[] FileContent { get; set; }
        public string FileName { get; set; }
        public decimal Shop_ID { get; set; }
        public decimal Model_ID { get; set; }
        public decimal Plant_ID { get; set; }
        public decimal Audit_Type_Id { get; set; }
        public string Shop_Name { get; set; }
        public string Model_Name { get; set; }
        public int Mapping_Count { get; set; }
        public Nullable<DateTime> Inserted_Date { get; set; }
    }

    public class VehicleImageMappingRow
    {
        public decimal Mapping_ID { get; set; }
        public decimal Vehicle_Image_ID { get; set; }
        public decimal Shop_ID { get; set; }
        public decimal Model_ID { get; set; }
        public decimal Area_ID { get; set; }
        public decimal Part_ID { get; set; }
        public decimal Checkpoint_ID { get; set; }
        public decimal Location_ID { get; set; }
        public decimal X_Coordinate { get; set; }
        public decimal Y_Coordinate { get; set; }
        public string Area_Name { get; set; }
        public string Part_Name { get; set; }
        public string Checkpoint_Name { get; set; }
        public string Location_Name { get; set; }
    }
    // ********************************** Models Section End *******************************//
}
