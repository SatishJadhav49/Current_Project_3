using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using QualityAPI.Models;
using System.Web;
using System.Web.Security;
using QualityAPI.Helper;

namespace QualityAPI.Controllers
{
    [AllowCrossSiteJson]
    public class MM_EmployeeController : ApiController
    {

        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();



        // GET: api/MM_Employee
        public IQueryable<MM_Employee> GetMM_Employee()
        {
            return db.MM_Employee;
        }
        [Route("api/MM_Employee/GetPlantNameandSapcode/{plantid}")]
        [HttpGet]
        [ActionName("GetPlantNameandSapcode")]
        public IHttpActionResult GetPlantNameandSapcode(decimal plantid)
        {
            try
            {
                var sapobj = (from code in db.MM_Plant
                              where code.Plant_ID == plantid
                              select new
                              {
                                  code.Sap_Code,
                                  code.Plant_Name

                              }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = sapobj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Employee", "GetPlantNameandSapcode(" + plantid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        [Route("api/MM_Employee/GetEmployeeListUserRole/{plantid},{Audit_Type_Id},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetEmployeeListUserRole")]
        public IHttpActionResult GetEmployeeListUserRole(decimal plantid, decimal Audit_Type_Id, int Shop_ID, bool Is_AllShops)
        {
            try
            {
                IEnumerable<decimal> Shop_ids;

                if (Is_AllShops == true)
                {
                    Shop_ids = (from shop in db.MM_Shop
                                where shop.Audit_Type_Id == Audit_Type_Id && shop.Plant_ID == plantid
                                select (decimal)shop.Shop_ID).ToList();
                }
                else
                {
                    Shop_ids = new List<decimal> { Shop_ID };
                }

                object employee = null;
                var emp_obj = (from emp in db.MM_Employee
                               where emp.Plant_ID == plantid && emp.Audit_Type_Id == Audit_Type_Id
                               && Shop_ids.Contains(emp.Shop_ID ?? 0)
                               select new
                               {
                                   emp.Employee_ID,
                                   emp.Employee_Name,
                               }).ToList();

                if (emp_obj == null)
                {
                    employee = null;
                }
                else
                {
                    employee = emp_obj;
                }
                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = employee;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Employee", "GetEmployeeListUserRole(" + plantid + "," + Audit_Type_Id + "," + Shop_ID + "," + Is_AllShops + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        [Route("api/MM_Employee/GetEmployeeList/{plantid},{Shop_ID},{Audit_Type_Id},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetEmployeeList")]
        public IHttpActionResult GetEmployeeList(decimal plantid, int Shop_ID, int Audit_Type_Id, bool Is_AllShops)
        {
            try
            {
                IEnumerable<decimal> Shop_ids;

                if (Is_AllShops == true)
                {
                    Shop_ids = (from shop in db.MM_Shop
                                where shop.Audit_Type_Id == Audit_Type_Id && shop.Plant_ID == plantid
                                select (decimal)shop.Shop_ID).ToList();
                }
                else
                {
                    Shop_ids = new List<decimal> { Shop_ID };
                }

                object employee = null;
                var emp_obj = (from emp in db.MM_Employee
                               join userplant in db.MM_Plant
                               on emp.Plant_ID equals userplant.Plant_ID
                               join userShop in db.MM_Shop
                               on emp.Shop_ID equals userShop.Shop_ID
                               join dept in db.MM_Department on
                               emp.Department_ID equals dept.Department_ID
                               join audit in db.Audit_Type_Master on
                               emp.Audit_Type_Id equals audit.Audit_Type_Id
                               where userplant.Plant_ID == plantid && emp.Audit_Type_Id == Audit_Type_Id
                               && Shop_ids.Contains(emp.Shop_ID ?? 0)
                               select new
                               {
                                   emp.Employee_ID,
                                   emp.Email_Address,
                                   emp.Department_ID,
                                   emp.DOB,
                                   emp.Contact_No,
                                   emp.Employee_Name,
                                   emp.Employee_No,
                                   emp.Gender,
                                   emp.Employee_Password,
                                   dept.Department_Name,
                                   emp.Audit_Type_Id,
                                   emp.Shop_ID,
                                   userShop.Shop_Name,
                                   userplant.Plant_ID,
                                   userplant.Plant_Name,
                                   audit.Audit_Type,
                                   emp.Is_AllShops,
                               }).ToList();

                if (emp_obj == null)
                {
                    employee = null;
                }
                else
                {
                    employee = emp_obj;
                }
                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = employee;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Employee", "GetEmployeeList(" + plantid + "," + Shop_ID + "," + Audit_Type_Id + "," + Is_AllShops + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        // GET: api/MM_Employee/5
        [ResponseType(typeof(MM_Employee))]
        public IHttpActionResult GetMM_Employee(string id)
        {
            try
            {
                var emp_obj = (from emp in db.MM_Employee
                               where emp.Employee_No == id
                               select new
                               {
                                   emp.Employee_No,
                                   emp.Employee_ID

                               }).ToList();
                if (emp_obj.Count == 0)
                {
                    emp_obj = null;
                    return Ok(emp_obj);
                }
                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = emp_obj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Employee", "GetMM_Employee(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Employee/GetTokenCurrent")]
        [HttpGet]
        [ActionName("GetTokenCurrent")]
        public IHttpActionResult GetTokenCurrent()
        {


            try
            {
                //MembershipUser mp = Membership.GetUser();
                //string s3 = mp.UserName.ToString();
                EncryptDecrypt encDecobj = new EncryptDecrypt();
                string tyuio = HttpContext.Current.Request.LogonUserIdentity.Name;
                // string Username = System.Security.Principal.WindowsIdentity.GetCurrent().Name.ToString();
                //string tyuio= System.Security.Principal.WindowsIdentity.GetCurrent().Name.ToString();

                string[] tokenNumber = tyuio.Split(new char[] { '\\' });
                //  string tokenNumber = "Jitu";
                string tok = tokenNumber.ToString();
                //string enc,decr;
                // enc=cr.Encrypt(tok.ToString(), "10");
                // decr=cr.Decrypt(enc.ToString(), "10");
                var encrypt = encDecobj.EnryptString(tokenNumber[1]);

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = encrypt;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Employee", "GetTokenCurrent()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Employee/GetUserID/{token}")]
        [HttpGet]
        [ActionName("GetUserID")]
        public IHttpActionResult GetUserID(string token)
        {
            try
            {
                EncryptDecrypt encDecobj = new EncryptDecrypt();
                var decrypt = encDecobj.DecryptString(token);
                var userid = (from emp in db.MM_Employee
                              where emp.Employee_No == decrypt
                              select new
                              {
                                  emp.Employee_ID,
                                  emp.Employee_No,
                                  emp.Employee_Name,
                                  emp.Plant_ID,
                                  emp.Shop_ID,
                                  emp.Audit_Type_Id
                              }).FirstOrDefault();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = userid;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Employee", "GetUserID(" + token + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        ////[Route("api/MM_Employee/GetIPAddress/{ip}")]
        ////[HttpGet]
        ////[ActionName("GetIPAddress")]
        ////public IHttpActionResult GetIPAddress(string ip)
        ////{

        ////    var reportlinklist = (from rp in db.MM_Qlty_ReportLink
        ////                  where rp.IP_Address.Trim() == ip.Trim()
        ////                  select new
        ////                  {
        ////                      rp.Row_ID,
        ////                      rp.IP_Address,
        ////                      rp.Report_Start_Link,
        ////                      rp.Is_Active
        ////                  }).FirstOrDefault();
        ////    return Ok(reportlinklist);
        ////}

        [Route("api/MM_Employee/SaveLogoutUserData")]
        [HttpPost]
        [ActionName("SaveLogoutUserData")]
        public IHttpActionResult SaveLogoutUserData(MM_User_Log token)
        {
            MM_User_Log obj = new MM_User_Log();
            var lastlogin = db.MM_User_Log.Where(c => c.Log_In_User == token.Log_In_User).OrderByDescending(c => c.Log_In_Time).FirstOrDefault();
            var res = db.MM_User_Log.Find(lastlogin.Row_ID);
            res.Log_out_Time = DateTime.Now;
            res.Log_In = false;
            db.Entry(res).State = EntityState.Modified;
            db.SaveChanges();
            return Ok(obj);
        }

        [Route("api/MM_Employee/SaveLoginUserData")]
        [HttpPost]
        [ActionName("SaveLoginUserData")]
        public IHttpActionResult SaveLoginUserData(MM_User_Log token)
        {
            MM_User_Log obj = new MM_User_Log();
            obj.Log_In_User = token.Log_In_User;
            obj.Log_In_Time = System.DateTime.Now;
            obj.Log_In = token.Log_In;
            obj.Inserted_Date = System.DateTime.Now;
            db.MM_User_Log.Add(obj);
            db.SaveChanges();
            return Ok(obj);
        }

        [Route("api/MM_Employee/GetDepartmentList/{plantid}")]
        [HttpGet]
        [ActionName("GetDepartmentList")]
        public IHttpActionResult GetDepartmentList(decimal plantid)
        {
            try
            {
                var obj = (from dep in db.MM_Department
                           where dep.Plant_ID == plantid
                           select new
                           {
                               dep.Department_ID,
                               dep.Department_Name,
                               dep.Plant_ID,
                               dep.Shop_ID,
                               dep.Supervisor_Flag
                           }).ToList();
                //db.MM_Department.Where(c => c.Plant_ID == plantid).ToList();
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
                generalLogObj.addControllerException(e, "MM_Employee", "GetDepartmentList(" + plantid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        [Route("api/MM_Employee/GetEmpDetails/{empid},{Audit_Type_Id}")]
        [HttpGet]
        //[ActionName("GetDepartmentList")]
        public IHttpActionResult GetEmpDetails(decimal empid, decimal Audit_Type_Id)
        {
            try
            {
                var obj = (from emp in db.MM_Employee
                           join dep in db.MM_Department
                           on emp.Department_ID equals dep.Department_ID
                           where emp.Employee_ID == empid && emp.Audit_Type_Id == Audit_Type_Id
                           select new
                           {
                               emp.Employee_ID,
                               dep.Department_Name,
                               emp.Plant_ID,
                               dep.Supervisor_Flag
                           }).FirstOrDefault();
                //db.MM_Department.Where(c => c.Plant_ID == plantid).ToList();
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
                generalLogObj.addControllerException(e, "MM_Employee", "GetEmpDetails(" + empid + "," + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }//
        [Route("api/MM_Employee/GetUsername/{empid}")]
        [HttpGet]
        [ActionName("GetUsername")]
        public IHttpActionResult GetUsername(decimal empid)
        {
            try
            {
                var empidobj = db.MM_Employee.Find(empid).Employee_Name;

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = empidobj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Employee", "GetUsername(" + empid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Employee/GetPlantName/{plantid}")]
        [HttpGet]
        [ActionName("GetPlantName")]
        public IHttpActionResult GetPlantName(decimal plantid)
        {
            try
            {
                var plantname = db.MM_Plant.Find(plantid).Plant_Name;

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = plantname;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Employee", "GetPlantName(" + plantid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        [Route("api/MM_Employee/UserAthentication/{id},{plantid},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("UserAthentication")]
        public IHttpActionResult UserAthentication(string id, decimal plantid, decimal Audit_Type_Id)
        {

            try
            {
                EncryptDecrypt encDecobj = new EncryptDecrypt();
                var decrypt = encDecobj.DecryptString(id);
                var userCredObj = (from emp in db.MM_Employee
                                   join
                                     userRole in db.MM_User_Roles on new
                                     { emp.Employee_ID, emp.Audit_Type_Id } equals new { userRole.Employee_ID, userRole.Audit_Type_Id }
                                   join
                                   menuRole in db.MM_Menu_Role on
                                   userRole.Role_ID equals menuRole.Role_ID
                                   join
                                   menu in db.MM_Menus on
                                   menuRole.Menu_ID equals menu.Menu_ID
                                   join
                                role in db.MM_Roles on
                                userRole.Role_ID equals role.Role_ID
                                   where emp.Employee_No == decrypt && role.Plant_ID == plantid && menu.Is_Active == true && emp.Audit_Type_Id == Audit_Type_Id
                                   select new
                                   {
                                       Menu_ID = menuRole.Menu_ID,
                                       menu.Sort_Order,
                                       Employee_ID = emp.Employee_ID,
                                       Employee_Name = emp.Employee_Name,
                                       Employee_No = emp.Employee_No,
                                       emp.Audit_Type_Id,
                                       emp.Shop_ID,
                                       Role_ID = userRole.Role_ID,
                                       Role_Name = role.Role_Name,
                                       emp.Is_AllShops,
                                       userRole.Is_Create,
                                       userRole.Is_Edit,
                                       userRole.Is_Delete,
                                       SubMenuList = (db.MM_Menu_Role.Where(a => a.Role_ID == userRole.Role_ID && a.MM_Sub_Menus.Is_Active == true).Select(a => new { a.MM_Sub_Menus.ActionName, a.MM_Sub_Menus.LinkName, a.MM_Sub_Menus.Sort_Order }).Distinct().OrderBy(a => a.Sort_Order).ToList())

                                   }).ToList();
                var userCred = userCredObj.GroupBy(a => a.Role_ID)
                  .Select(g => g.First())
                  .ToList().OrderBy(c => c.Sort_Order);
                //var s = p.Distinct();

                if (userCred == null)
                {
                    object obj = null;
                    return Ok(obj);
                }
                else
                {
                    return Ok(userCred);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                return null;
            }
        }

        [Route("api/MM_Employee/GetCurrentMenu")]
        [HttpGet]
        [ActionName("GetTokenCurrent")]
        public IHttpActionResult GetCurrentMenu()
        {
            try
            {
                var getmenu = (from menu in db.MM_Menus
                               select new
                               {
                                   menu.ActionName
                               }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = getmenu;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Employee", "GetCurrentMenu()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Employee/getCurrentHostName")]
        [HttpGet]
        [ActionName("getCurrentHostName")]
        public IHttpActionResult GetCurrentHostName()
        {
            string hostAddress;
            object Machine = null;
            Machine = null;
            var ErrorMsg = string.Empty;

            try
            {
                hostAddress = (((System.Web.HttpRequestWrapper)this.RequestContext.GetType().Assembly.GetType("System.Web.Http.WebHost.WebHostHttpRequestContext").GetProperty("WebRequest").GetMethod.Invoke(this.RequestContext, null))).UserHostName;
                string entry = Dns.GetHostEntry(hostAddress).HostName;
                string entry12 = Dns.GetHostName();
                string[] entry1 = entry.Split(new char[] { '.' });
                string hostname = entry1[0].ToLower();

                if (hostname != null && hostname != " ")
                {
                    Machine = hostname;
                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.isErrorMessage = false;
                    var dataList = Machine;
                    return Ok(new { messageDataObj, dataList });
                }

            }
            catch (Exception e)
            {

                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                ErrorMsg = "HOSTNAME: " + e.Message;

                generalLogObj.addControllerException(e, "MM_Employee", "GetCurrentHostName()");
                messageDataObj.messageDetail = ErrorMsg.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }

            try
            {
                string clientAddress = ((System.Web.HttpContextWrapper)this.Request.Properties["MS_HttpContext"]).Request.UserHostAddress;

                if (Machine == null)
                {

                    if (clientAddress.Length > 0)
                    {
                        if (clientAddress != null && clientAddress != " ")
                        {
                            Machine = clientAddress;
                            messageDataObj.isSuccessMessage = true;
                            messageDataObj.isErrorMessage = false;
                            var dataList = Machine;
                            return Ok(new { messageDataObj, dataList });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                while (ex.InnerException != null)
                {
                    ex = ex.InnerException;
                }
                ErrorMsg = ErrorMsg + " IPADDRESS: " + ex.Message;
                generalLogObj.addControllerException(ex, "MM_Employee", "GetCurrentHostName()");
                messageDataObj.messageDetail = ErrorMsg.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, ex });
            }

            return Ok(Machine + " " + ErrorMsg);
        }
        [Route("api/MM_Employee/GetPlantListForUser/{token}")]
        [HttpGet]
        [ActionName("GetPlantListForUser")]
        public IHttpActionResult GetPlantListForUser(string token)
        {
            try
            {
                EncryptDecrypt encDecobj = new EncryptDecrypt();
                var decrypt = encDecobj.DecryptString(token);
                var emp_obj = (from employee in db.MM_Employee
                               join pl in db.MM_Plant
                              on employee.Plant_ID equals pl.Plant_ID
                               where employee.Employee_No.ToLower() == decrypt.ToLower()
                               select new
                               {
                                   employee.Employee_ID,
                                   employee.Employee_No,
                                   employee.Plant_ID,
                                   employee.MM_Plant.Plant_Code,
                                   employee.Audit_Type_Id,
                                   pl.Plant_Name
                               }).Distinct().ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = emp_obj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Employee", "GetPlantListForUser(" + token + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Employee/SearchToken/{id}")]
        [HttpGet]
        [ActionName("SearchToken")]
        public IHttpActionResult SearchToken(string id)
        {
            EncryptDecrypt encDecobj = new EncryptDecrypt();
            var decrypt = encDecobj.DecryptString(id);
            var emp_obj = (from emp in db.MM_Employee
                           join role in db.MM_User_Roles
                           on emp.Employee_ID equals role.Employee_ID
                           where emp.Employee_No.ToLower() == decrypt.ToLower()
                           select new
                           {
                               emp.Employee_ID,
                               emp.Employee_No,
                               emp.Department_ID,
                               emp.Employee_Name,
                               emp.Shop_ID,
                               emp.Plant_ID,
                               emp.MM_Plant.Plant_Code,
                               emp.Audit_Type_Id,
                               emp.Is_AllShops,
                               role.Is_Create,
                               role.Is_Delete,
                               role.Is_Edit,
                               emp.Email_Address,
                               emp.MM_Shop.Shop_Name
                           }).ToList();

            if (emp_obj == null)
            {
                object obj = null;
                return Ok(obj);
            }
            MM_User_Activity_Logs act = new MM_User_Activity_Logs();
            act.Audit_Type = emp_obj[0].Audit_Type_Id==1 ?"1D TCF":"1D BIW";
            act.Shop_Name = emp_obj[0].Shop_Name;
            act.User_Name = emp_obj[0].Employee_Name;
            act.User_Token_No = emp_obj[0].Employee_No;
            act.Plant_Code = emp_obj[0].Plant_Code;
            act.Logged_In_Time = DateTime.Now;
            db.MM_User_Activity_Logs.Add(act);
            db.SaveChanges();

            return Ok(emp_obj);
          

        }

        // PUT: api/MM_Employee/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutMM_Employee(decimal id, MM_Employee mM_Employee)
        {
            DateTime currentDatetime = DateTime.Now;

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != mM_Employee.Employee_ID)
            {
                return BadRequest();
            }

            decimal userid = Convert.ToDecimal(mM_Employee.Inserted_User_ID);

            try
            {
                if (db.MM_Employee.Any(m => m.Employee_ID != mM_Employee.Employee_ID &&
                    m.Email_Address == mM_Employee.Email_Address && m.Employee_No == mM_Employee.Employee_No))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                mM_Employee.Updated_Date = currentDatetime;
                mM_Employee.Is_Edited = true;
                db.MM_Employee.Add(mM_Employee);
                db.Entry(mM_Employee).State = EntityState.Modified;
                db.SaveChanges();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.UpdateMessage;
                messageDataObj.messageTitle = messageDataObj.UpdateTitle;
            }
            catch (Exception e)
            {
                if (!MM_EmployeeExists(id))
                {
                    generalLogObj.addControllerException(e, "MM_EmployeeController", "PutMM_Employee(" + id + ")", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                    messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;
                }
            }
            return Ok(messageDataObj);
        }

        // POST: api/MM_Employee
        [ResponseType(typeof(MM_Employee))]
        public IHttpActionResult PostMM_Employee(MM_Employee mM_Employee)
        {
            DateTime currentDatetime = DateTime.Now;

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            decimal userid = Convert.ToDecimal(mM_Employee.Inserted_User_ID);
            try
            {
                if (db.MM_Employee.Any(m => m.Employee_No == mM_Employee.Employee_No))
                {
                    if (db.MM_Employee.Any(e => e.Email_Address == mM_Employee.Email_Address))
                    {
                        messageDataObj.isAlertMessage = true;
                        messageDataObj.messageDetail = "Email address already exits";
                        messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                        return Ok(messageDataObj);
                    }

                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = "Employee Number record already exits";
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                mM_Employee.Inserted_Date = currentDatetime;
                db.MM_Employee.Add(mM_Employee);
                db.SaveChanges();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                messageDataObj.messageTitle = messageDataObj.SuccessTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }

                generalLogObj.addControllerException(e, "MM_EmployeeController", "PostMM_Employee", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(messageDataObj);
        }

        // DELETE: api/MM_Employee/5
        [ResponseType(typeof(MM_Employee))]
        public IHttpActionResult DeleteMM_Employee(decimal id)
        {

            MM_Employee mM_Employee = db.MM_Employee.Find(id);
            if (mM_Employee == null)
            {
                messageDataObj.isAlertMessage = true;
                messageDataObj.messageDetail = messageDataObj.RecordNotFoundMessage;
                messageDataObj.messageTitle = messageDataObj.RecordnotFoundTitle;

                return Ok(messageDataObj);
            }
            else
            {

                try
                {
                    db.MM_Employee.Remove(mM_Employee);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                    messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                }
                catch (DbUpdateException dbe)
                {
                    generalLogObj.addControllerException(dbe, "MM_EmployeeController", "DeleteMM_Employee(" + id + ")", 1);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeleteConflictMessage;
                    messageDataObj.messageTitle = messageDataObj.DeleteConflictTitle;
                }
                catch (Exception e)
                {
                    while (e.InnerException != null)
                    {
                        e = e.InnerException;
                    }
                    generalLogObj.addControllerException(e, "MM_EmployeeController", "DeleteMM_Employee(" + id + ")", 1);

                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.DeletionErrorTitle;
                    messageDataObj.isErrorMessage = true;
                }
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

        private bool MM_EmployeeExists(decimal id)
        {
            return db.MM_Employee.Count(e => e.Employee_ID == id) > 0;
        }
    }
}