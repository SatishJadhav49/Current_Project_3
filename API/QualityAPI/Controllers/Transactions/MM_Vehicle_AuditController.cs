using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Core.Objects;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using QualityAPI.Models;
using QualityAPI.Helper;
using QualityAPI.Controllers;
using System.Data.SqlClient;
using System.Data.Entity.Validation;

namespace QualityAPI.Controllers.Transactions
{
    public class MM_Vehicle_AuditController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        ValidationModel validobj = new ValidationModel();
        GlobalData messageDataObj = new GlobalData();
        GlobalOperations global = new GlobalOperations();
        private General generalLogObj = new General();
        // GET: api/MM_Vehicle_Audit
        public IQueryable<MM_Vehicle_Audit> GetMM_Vehicle_Audit()
        {
            return db.MM_Vehicle_Audit;
        }

        // GET: api/MM_Vehicle_Audit/5
        [ResponseType(typeof(MM_Vehicle_Audit))]
        public IHttpActionResult GetMM_Vehicle_Audit(decimal id)
        {
            try
            { 
            MM_Vehicle_Audit MM_Vehicle_Audit = db.MM_Vehicle_Audit.Find(id);
            if (MM_Vehicle_Audit == null)
            {
                return NotFound();
            }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = MM_Vehicle_Audit;
                return Ok(new { messageDataObj, dataList });
            }

            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "GetMM_Vehicle_Audit(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        public class GettableData
        {
            public string BIW_No { get; set; }
            public string VIN_Number { get; set; }
            public string Model_Code { get; set; }
            public string Model_Description { get; set; }
            public string Variant_Name { get; set; }
            public string Variant_ID { get; set; }
            public string Color_ID { get; set; }
            public string Color_Name { get; set; }
            public string Platform_Name { get; set; }
        }

        [Route("api/MM_Vehicle_Audit/GetAllDataFromVIN/{VIN_Number},{BIW_Number}")]
        [HttpGet]
        [ActionName("GetAllDataFromVIN")]
        public IHttpActionResult GetAllDataFromVIN(string VIN_Number, string BIW_Number)
        {
            try
            { 

            SQLConnection sc = new SQLConnection();
            List<GettableData> OP_List = new List<GettableData>();
            if (VIN_Number.Length == 8)
            {
                    VIN_Number = '%' + VIN_Number;
            }
                DataSet ds_Tran = new DataSet();
            List<SqlParameter> objParam = new List<SqlParameter>();
            objParam.Add(new SqlParameter("@VIN_Number", VIN_Number));
            objParam.Add(new SqlParameter("@BIW_Number", BIW_Number));

            ds_Tran = sc.GetDataSet_SQL("SP_GetDataFrom_Vin_Number", CommandType.StoredProcedure, objParam.ToArray(), null);
                if (ds_Tran.Tables[0].Rows.Count > 0)
                {

                    for (int i = 0; i < ds_Tran.Tables[0].Rows.Count; i++)
                    {

                        OP_List.AddRange(new List<GettableData> {
                                        new GettableData
                                        {
                                            VIN_Number = ds_Tran.Tables[0].Rows[i]["VIN_Number"].ToString(),
                                            BIW_No = ds_Tran.Tables[0].Rows[i]["BIW_No"].ToString(),
                                            Model_Code = ds_Tran.Tables[0].Rows[i]["Model_Code"].ToString(),
                                            Model_Description = ds_Tran.Tables[0].Rows[i]["Model_Description"].ToString(),
                                            Color_ID = ds_Tran.Tables[0].Rows[i]["colorCode"].ToString(),
                                            Color_Name = ds_Tran.Tables[0].Rows[i]["Colour_Desc"].ToString(),
                                            Variant_ID = ds_Tran.Tables[0].Rows[i]["Variant"].ToString(),
                                            Variant_Name = ds_Tran.Tables[0].Rows[i]["Variant_name"].ToString(),
                                            Platform_Name = ds_Tran.Tables[0].Rows[i]["Platform_Name"].ToString(),
                                        }
                                    });
                    }
                    var result = OP_List;
                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.isErrorMessage = false;
                    var dataList = result;
                    return Ok(new { messageDataObj, dataList });
                }
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "GetAllDataFromVIN("+VIN_Number+","+BIW_Number+")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
            return NotFound();
        }

        [Route("api/MM_Vehicle_Audit/buildphaseobj/{plantid}")]
        [HttpGet]
        [ActionName("BuildPhaseList")]
        public IHttpActionResult BuildPhaseList(decimal plantid)
        {
            try
            { 
            var buildphaselist = (from b in db.MM_Audit_BuildPhase_Mstr
                                  where b.Plant_ID == plantid
                                  select new
                                  {
                                      b.Build_Phase_ID,
                                      b.Build_Phase_Name
                                  }

                           ).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = buildphaselist;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "BuildPhaseList(" + plantid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        
        
        [Route("api/MM_Vehicle_Audit/GetVinNOList/{plantid},{auditdate},{modelid}")]
        [HttpGet]
        [ActionName("GetVinNOList")]
        public IHttpActionResult GetVinNOList(decimal plantid, DateTime auditdate, decimal modelid)
        {
            try
            { 
            var curvinlist = (from vinno in db.MM_Vehicle_Audit
                              where (vinno.Audit_Date.Year == auditdate.Year && vinno.Audit_Date.Month == auditdate.Month && vinno.Audit_Date.Day == auditdate.Day) && vinno.Plant_ID == plantid && vinno.Model_ID == modelid && vinno.Active == true
                              select new
                              {
                                  vinno.VIN_No
                              }).ToList();


                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = curvinlist;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "GetVinNOList(" + plantid + ","+auditdate+","+modelid+")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        [Route("api/MM_Vehicle_Audit/EmployeeList/{plantid}")]
        [HttpGet]
        [ActionName("EmployeeList")]
        public IHttpActionResult EmployeeList(decimal plantid)
        {
            try
            { 
            var employeelistobj = (from e in db.MM_Employee
                                   where e.Plant_ID == plantid
                                   select new
                                   {
                                       e.Employee_ID,
                                       e.Employee_Name
                                   }

                           ).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = employeelistobj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "EmployeeList(" + plantid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        
        [Route("api/MM_Vehicle_Audit/GetPlantList/{tokenno}")]
        [HttpGet]
        [ActionName("GetPlantList")]
        public IHttpActionResult GetPlantList(string tokenno)
        {
            try
            { 
            EncryptDecrypt encDecobj = new EncryptDecrypt();
            var decrypt = encDecobj.DecryptString(tokenno);
            var contrylistobj = (from e in db.MM_Employee
                                 join
                                 p in db.MM_Plant
                                 on e.Plant_ID equals p.Plant_ID
                                 where e.Employee_No == decrypt
                                 select new
                                 {
                                     p.Plant_ID,
                                     p.Plant_Name

                                 }

                           ).FirstOrDefault();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = contrylistobj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "GetPlantList(" + tokenno + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        
        [Route("api/MM_Vehicle_Audit/GetAuditTypelist")]
        [HttpGet]
        [ActionName("GetAuditTypelist")]
        public IHttpActionResult GetAuditTypelist()
        {
            try
            { 
            var auditlistobj = (from m in db.Audit_Type_Master
                                select new
                                {
                                    m.Audit_Type_Id,
                                    m.Audit_Type
                                }

                           ).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = auditlistobj;
                return Ok(new { messageDataObj, dataList });
            }

            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "GetAuditTypelist()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        
        [Route("api/MM_Vehicle_Audit/GetCurrentRunningShiftByShopID/{shopId}")]
        [HttpGet]
        [ActionName("GetCurrentRunningShiftByShopID")]
        public IHttpActionResult GetCurrentRunningShiftByShopID(int shopId)
        {
            try
            { 
            MM_Shift currentshift = global.getCurrentRunningShiftByShopID(shopId);
            var shiftlistobj = (from s in db.MM_Shift
                                where s.SHIFT_NO == currentshift.SHIFT_NO && s.Is_Active == true
                                select new
                                {
                                    s.SHIFT_NO,
                                    s.SHIFT_DESC

                                }

                           ).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = shiftlistobj;
                return Ok(new { messageDataObj, dataList });
            }

            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "GetCurrentRunningShiftByShopID(" + shopId + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }


        [Route("api/MM_Vehicle_Audit/ConfigureModelList/{plantid}")]
        [HttpGet]
        [ActionName("ConfigureModelList")]
        public IHttpActionResult ConfigureModelList(decimal plantid)
        {
            try
            { 
            var filtermodel = (from model in db.MM_Model
                               where model.Plant_ID == plantid
                               select new
                               {
                                   model.Model_Code,
                                   model.Model_ID
                               }
                           ).Distinct().ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = filtermodel;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "ConfigureModelList(" + plantid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        [Route("api/MM_Vehicle_Audit/InActiveRecord/{auditid}")]
        [HttpPost]
        public IHttpActionResult InActiveRecord(decimal auditid)
        {
            try
            {
                MM_Vehicle_Audit obj = db.MM_Vehicle_Audit.Find(auditid);
                obj.Active = false;

                db.SaveChanges();
                this.messageDataObj.isSuccessMessage = true;
                this.messageDataObj.messageDetail = "Record InActive successfully";
                //this.messageDataObj.messageTitle = "Record Added!";
                return Ok(messageDataObj);

            }
            catch (Exception ex)
            {
                while (ex.InnerException != null)
                {
                    ex = ex.InnerException;
                    messageDataObj.isDBErrorMessage = true;
                    messageDataObj.messageDetail = "Can Not Modified Recorf";
                    return Ok(messageDataObj);
                }
            }

            return Ok();



        }
        [Route("api/MM_Vehicle_Audit/GetCreateAuditData/{plantid},{Shop_Id},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetCreateAuditData")]
        public IHttpActionResult GetCreateAuditData(decimal plantid,decimal Shop_Id, decimal Audit_Type_Id)
        {
            try
            { 
            var audit = (from au in db.MM_Vehicle_Audit
                         join model in db.MM_Model
                         on au.Model_ID equals model.Model_ID
                         join
                        employee in db.MM_Employee
                        on au.Auditor1_ID equals employee.Employee_ID
                         join
                           employee1 in db.MM_Employee
                           on au.Auditor2_ID equals employee1.Employee_ID
                         join shift in db.MM_Shift
                          on au.Shift_ID equals shift.SHIFT_NO
                         join type in db.Audit_Type_Master
                         on au.Audit_Type_Id equals type.Audit_Type_Id
                         join buildphase in db.MM_Audit_BuildPhase_Mstr on au.Build_Phase_ID equals buildphase.Build_Phase_ID
                         where au.Plant_ID == plantid && au.Shop_ID == Shop_Id && au.Audit_Type_Id == Audit_Type_Id
                         orderby au.Audit_Date descending
                         select new
                         {
                             au.VIN_No,
                             au.Body_No,
                             au.Audit_Date,
                             type.Audit_Type,
                             au.Audit_ID,
                             au.Model_ID,
                             model.Model_Name,
                             employee.Employee_Name,
                             au.Auditor1_ID,
                             au.Auditor2_ID,
                             shift.SHIFT_DESC,
                             au.Variant_Name,
                             au.Build_Phase_ID,
                             au.Shift_ID,
                             au.Audit_Type_Id,
                             au.Color_Name,
                             buildphase.Build_Phase_Name
                         }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = audit;
                return Ok(new { messageDataObj, dataList });
            }

            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "GetCreateAuditData("+plantid+","+Shop_Id+","+Audit_Type_Id+")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        

        [Route("api/MM_Vehicle_Audit/CreateAuditlist")]
        [HttpGet]
        [ActionName("CreateAuditlist")]
        public IHttpActionResult CreateAuditlist()
        {
            try
            { 
            var contrylistobj = (from c in db.MM_Vehicle_Audit
                                 select new
                                 {
                                     c.Body_No,
                                     c.Audit_ID,
                                     c.VIN_No
                                 }

                           ).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = contrylistobj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "CreateAuditlist()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Vehicle_Audit/UpdateAudit/{Audit_ID}")]
        [HttpPut]
        [ActionName("UpdateAudit")]
        public IHttpActionResult UpdateAudit(decimal Audit_ID, MM_Vehicle_Audit mM_Vehicle_Audit)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = Convert.ToDecimal(mM_Vehicle_Audit.Updated_User_ID);
            try
            {
                MM_Vehicle_Audit temp = db.MM_Vehicle_Audit.Find(Audit_ID);
                if (temp == null)
                {
                    this.validobj.IsErrorAlert = true;
                    this.validobj.IsTitle = messageDataObj.RecordnotFoundTitle;
                    this.validobj.IsMassege = messageDataObj.RecordNotFoundMessage;
                    return Ok(validobj);
                }
                MM_Vehicle_Audit obj = db.MM_Vehicle_Audit.Where(p => p.Audit_ID == Audit_ID).FirstOrDefault();
                if (obj != null)
                {
                    
                    obj.Model_ID = mM_Vehicle_Audit.Model_ID;
                    obj.Build_Phase_ID = mM_Vehicle_Audit.Build_Phase_ID;
                    obj.Auditor1_ID = mM_Vehicle_Audit.Auditor1_ID;
                    obj.Auditor2_ID = mM_Vehicle_Audit.Auditor2_ID;
                    obj.Shift_ID = GetShift_Id(mM_Vehicle_Audit.Plant_ID, mM_Vehicle_Audit.Shop_ID??0);
                    obj.Is_Edited = true;
                    obj.Updated_Host = mM_Vehicle_Audit.Updated_Host;
                    obj.Updated_User_ID = mM_Vehicle_Audit.Updated_User_ID;
                    obj.Updated_Date = DateTime.Now;
                    db.Entry(obj).State = EntityState.Modified;
                    db.SaveChanges();

                    this.validobj.IsSuccessAlert = true;
                    this.validobj.IsTitle = messageDataObj.UpdateTitle;
                    this.validobj.IsMassege = messageDataObj.UpdateMessage;
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "UpdateAudit", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.UpdateErrorTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "UpdateAudit", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.UpdateErrorTitle;
            }
            return Ok(validobj);
        }

        [Route("api/MM_Vehicle_Audit/GetAuditTableData/{Plant_ID},{Audit_Type_ID},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetAuditTableData")]
        public IHttpActionResult GetAuditTableData(int Plant_ID, int Audit_Type_ID, int Shop_ID, bool Is_AllShops)
        {
            try
            { 
            IEnumerable<decimal> Shop_ids;

            if (Is_AllShops == true)
            {
                Shop_ids = (from shop in db.MM_Shop
                            where shop.Audit_Type_Id == Audit_Type_ID && shop.Plant_ID == Plant_ID
                            select (decimal)shop.Shop_ID).ToList();
            }
            else
            {
                Shop_ids = new List<decimal> { Shop_ID };
            }
            var obj = (from audit in db.MM_Vehicle_Audit
                       join model in db.MM_Model
                       on audit.Model_ID equals model.Model_ID
                       where audit.Plant_ID == Plant_ID && audit.Audit_Type_Id == Audit_Type_ID
                       && Shop_ids.Contains(audit.Shop_ID ?? 0)
                       orderby audit.Audit_ID descending
                       select new
                       {
                           audit.Audit_ID,
                           audit.Body_No,
                           audit.VIN_No,
                           audit.Audit_Date,
                           model.Model_Code,
                           audit.Model_Name,
                           audit.Gap_PIST,
                           audit.Flush_PIST,
                           audit.Total_PIST
                       }).ToList();

               
                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = obj;
                return Ok(new { messageDataObj, dataList });
            }
            
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "GetAuditTableData(" + Plant_ID+","+Audit_Type_ID+","+Shop_ID+","+Is_AllShops+")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e});
            }
        }

        [Route("api/MM_Vehicle_Audit/PostMM_Vehicle_Audit")]
        [HttpPost]
        [ActionName("PostMM_Vehicle_Audit")]
        public IHttpActionResult PostMM_Vehicle_Audit(MM_Vehicle_Audit mM_Vehicle_Audit)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = mM_Vehicle_Audit.Inserted_User_ID??0;
            try
            {
                if (mM_Vehicle_Audit.Audit_Type_Id == 1)
                {
                    if (db.MM_Vehicle_Audit.Any(m => m.VIN_No.ToLower().Trim() == mM_Vehicle_Audit.VIN_No.ToLower().Trim() && m.Plant_ID == mM_Vehicle_Audit.Plant_ID && m.Audit_Type_Id == mM_Vehicle_Audit.Audit_Type_Id))
                    {
                        this.validobj.IsErrorAlertDuplicate = true;
                        this.validobj.IsTitle = messageDataObj.DuplicateTitle;
                        this.validobj.IsMassege = messageDataObj.DuplicateMessage;
                        return Ok(validobj);
                    }
                }
                else if (mM_Vehicle_Audit.Audit_Type_Id == 2)
                {
                    if (db.MM_Vehicle_Audit.Any(m => m.Body_No.ToLower().Trim() == mM_Vehicle_Audit.Body_No.ToLower().Trim() && m.Plant_ID == mM_Vehicle_Audit.Plant_ID && m.Audit_Type_Id == mM_Vehicle_Audit.Audit_Type_Id))
                    {
                        this.validobj.IsErrorAlertDuplicate = true;
                        this.validobj.IsTitle = messageDataObj.DuplicateTitle;
                        this.validobj.IsMassege = messageDataObj.DuplicateMessage;
                        return Ok(validobj);
                    }
                }

                mM_Vehicle_Audit.Inserted_Date = DateTime.Now;
                mM_Vehicle_Audit.Shift_ID = GetShift_Id(mM_Vehicle_Audit.Plant_ID, mM_Vehicle_Audit.Shop_ID??0);
                db.MM_Vehicle_Audit.Add(mM_Vehicle_Audit);
                db.SaveChanges();

                this.validobj.IsSuccessAlert = true;
                this.validobj.IsTitle = messageDataObj.SuccessTitle;
                this.validobj.IsMassege = messageDataObj.SuccessMessage;
            }
            catch (DbUpdateException dbe)
            {
                generalLogObj.addControllerException(dbe, "MM_Vehicle_Audit", "PostMM_Vehicle_Audit()", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = dbe.ToString();
                this.validobj.IsTitle = messageDataObj.SaveErrorTitle;
            }
            catch (DbEntityValidationException ex)
            {
                foreach
                      (var validationErrors in ex.EntityValidationErrors)
                {
                    foreach (var validationError in validationErrors.ValidationErrors)
                    {
                        Console.WriteLine($"Property: {validationError.PropertyName} Error: " +
                          $"{validationError.ErrorMessage}");
                    }
                }
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "PostMM_Vehicle_Audit()", userid);
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = e.ToString();
                this.validobj.IsTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(validobj);
        }

        [Route("api/MM_Vehicle_Audit/DeleteVehicle_Audit/{Audit_ID}")]
        [HttpDelete]
        [ActionName("DeleteVehicle_Audit")]
        public IHttpActionResult DeleteVehicle_Audit(decimal Audit_ID)
        {
            MM_Vehicle_Audit mM_Vehicle_Audit = db.MM_Vehicle_Audit.Find(Audit_ID);
            if (mM_Vehicle_Audit == null)
            {
                this.validobj.IsErrorAlertNotFound = true;
                this.validobj.IsTitle = messageDataObj.RecordnotFoundTitle + "For Audit Id" + Audit_ID;
                this.validobj.IsMassege = messageDataObj.RecordNotFoundMessage;
                return Ok(validobj);
            }
            try
            {
                db.MM_Vehicle_Audit.Remove(mM_Vehicle_Audit);
                db.SaveChanges();

                // Delete records from MM_Track_Sheet
                var tracksToDelete = db.MM_Track_Sheet.Where(trackSheet => trackSheet.Audit_ID == Audit_ID);
                db.MM_Track_Sheet.RemoveRange(tracksToDelete);
                db.SaveChanges();

                this.validobj.IsSuccessAlert = true;
                this.validobj.IsTitle = messageDataObj.DeletionTitle;
                this.validobj.IsMassege = messageDataObj.DeletionMessage;

            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "MM_Vehicle_Audit(" + Audit_ID + ")");
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = messageDataObj.DeleteConflictMessage;
                this.validobj.IsTitle = messageDataObj.DeleteConflictTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "MM_Vehicle_Audit(" + Audit_ID + ")");
                this.validobj.IsMassege = messageDataObj.DeleteConflictMessage;
                this.validobj.IsTitle = messageDataObj.DeletionErrorTitle;
                this.validobj.isErrorMessage = true;
            }
            return Ok(validobj);
        }


        [Route("api/MM_Vehicle_Audit/DeleteAudit/{Audit_ID}")]
        [HttpPost]
        [ActionName("DeleteAudit")]
        public IHttpActionResult DeleteAudit(decimal Audit_ID)
        {
            try
            {
                MM_Vehicle_Audit obj = db.MM_Vehicle_Audit.Find(Audit_ID);
                if (obj == null)
                {
                    return NotFound();
                }

                // Start a transaction
                using (var transaction = db.Database.BeginTransaction())
                {
                    try
                    {
                        // Delete records from MM_Audit_Sheet_Datails
                        var recordsToDelete = db.MM_Track_Sheet.Where(s => s.Audit_ID == Audit_ID);
                        db.MM_Track_Sheet.RemoveRange(recordsToDelete);
                        db.SaveChanges(); // Save changes after deletion

                        // Remove the audit record from MM_Vehicle_Audit
                        db.MM_Vehicle_Audit.Remove(obj);
                        db.SaveChanges(); // Save changes after deletion

                        // Commit the transaction if all steps succeed
                        transaction.Commit();

                        // Set success message
                        this.validobj.IsSuccessAlert = true;
                        this.validobj.IsTitle = messageDataObj.DeletionTitle;
                        this.validobj.IsMassege = messageDataObj.DeletionMessage;
                    }
                    catch (Exception ex)
                    {
                        // Rollback the transaction in case of any error
                        transaction.Rollback();

                        // Log exception and prepare error response
                        generalLogObj.addControllerException(ex, "MM_Vehicle_Audit", "DeleteAudit()");
                        this.validobj.IsMassege = messageDataObj.DeleteConflictMessage;
                        this.validobj.IsTitle = messageDataObj.DeletionErrorTitle;
                        this.validobj.isErrorMessage = true;
                    }
                }
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "MM_Vehicle_Audit(" + Audit_ID + ")");
                this.validobj.isErrorMessage = true;
                this.validobj.IsMassege = messageDataObj.DeleteConflictMessage;
                this.validobj.IsTitle = messageDataObj.DeleteConflictTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "MM_Vehicle_Audit(" + Audit_ID + ")");
                this.validobj.IsMassege = messageDataObj.DeleteConflictMessage;
                this.validobj.IsTitle = messageDataObj.DeletionErrorTitle;
                this.validobj.isErrorMessage = true;
            }

            return Ok(validobj);
        }


        [Route("api/MM_Vehicle_Audit/GetDataByAuditID/{Audit_ID}")]
        [HttpGet]
        [ActionName("GetDataByAuditID")]
        public IHttpActionResult GetDataByAuditID(int Audit_ID)
        {
            try
            { 
            var obj = (from audit in db.MM_Vehicle_Audit
                       join plant in db.MM_Plant
                       on audit.Plant_ID equals plant.Plant_ID
                       where audit.Audit_ID == Audit_ID
                       select new
                       {
                           audit.Audit_ID,
                           audit.Body_No,
                           audit.VIN_No,
                           plant.Plant_ID,
                           plant.Plant_Name,
                           audit.Audit_Date,
                           audit.Model_Name,
                           audit.Variant_Name,
                           audit.Model_ID,
                           audit.Build_Phase_ID,
                           audit.Auditor1_ID,
                           audit.Auditor2_ID,
                           audit.Audit_Type_Id,
                           audit.Shift_ID,
                           audit.Color_Name,
                       }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = obj;
                return Ok(new { messageDataObj, dataList });
            }

            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Vehicle_Audit", "GetDataByAuditID(" + Audit_ID + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/AuditSheetController/UpdateStatus/{Audit_Plan_ID},{Audit_Plan_Log_ID}")]
        [HttpPost]
        [ActionName("UpdateStatus")]
        public IHttpActionResult UpdateStatus(decimal Audit_Plan_ID, decimal Audit_Plan_Log_ID, UpdateStatusData statusData)
        {
            try
            {
                MM_Audit_Plan_Log_Details obj = db.MM_Audit_Plan_Log_Details.Where(audit => audit.Audit_Plan_ID == Audit_Plan_ID && audit.Audit_Plan_Log_ID == Audit_Plan_Log_ID).FirstOrDefault();
                obj.Status = statusData.Status;
                obj.StatusRemark = statusData.StatusRemark;
                obj.Updated_Host = statusData.Updated_Host;
                obj.Updated_User_ID = statusData.Updated_User_ID;
                obj.Updated_Date = DateTime.Now;
                obj.Is_Edited = true;
                db.Entry(obj).State = EntityState.Modified;
                db.SaveChanges();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.UpdateMessage;
                messageDataObj.messageTitle = messageDataObj.UpdateTitle;
            }
            catch (DbUpdateException e)
            {
                generalLogObj.addControllerException(e, "AuditSheetController", "UpdateStatus(" + Audit_Plan_ID + "," + Audit_Plan_Log_ID + ")", statusData.Updated_User_ID);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "AuditSheetController", "UpdateStatus(" + Audit_Plan_ID + "," + Audit_Plan_Log_ID + ")", statusData.Updated_User_ID);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(messageDataObj);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool MM_Vehicle_AuditExists(decimal id)
        {
            return db.MM_Vehicle_Audit.Count(e => e.Audit_ID == id) > 0;
        }
        public int GetShift_Id(decimal Plant_ID, decimal Shop_ID)
        {
            SQLConnection sc = new SQLConnection();
            int shit_Id = 0;
            string sqlQuery2 = "";

            sqlQuery2 = " SELECT SHIFT_NO FROM MM_Shift WHERE Plant_ID = " + Plant_ID + " AND Shop_ID = " + Shop_ID + "";
            sqlQuery2 += " AND CAST(GETDATE() AS TIME) BETWEEN START_TIME AND END_TIME";

            DataSet ds_Tran = new DataSet();
            ds_Tran = sc.SQLDataSet(sqlQuery2);
            if (ds_Tran.Tables[0].Rows.Count > 0)
            {
                shit_Id = Convert.ToInt32(ds_Tran.Tables[0].Rows[0]["SHIFT_NO"]);
            }

            return shit_Id;
        }



        



        public class UpdateStatusData
        {
            public int Status { get; set; }
            public string StatusRemark { get; set; }
            public string Updated_Host { get; set; }
            public decimal Updated_User_ID { get; set; }
        }
    }
}