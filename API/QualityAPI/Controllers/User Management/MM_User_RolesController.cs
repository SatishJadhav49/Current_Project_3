using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Description;
using QualityAPI.Helper;
using QualityAPI.Models;

namespace QualityAPI.Controllers
{
    public class MM_User_RolesController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();
        // GET: api/MM_User_Roles
        public IQueryable<MM_User_Roles> GetMM_User_Roles()
        {
            return db.MM_User_Roles;
        }

        // GET: api/MM_User_Roles/5
        [ResponseType(typeof(MM_User_Roles))]
        public IHttpActionResult GetMM_User_Roles(decimal id)
        {
            try
            { 
            MM_User_Roles mM_User_Roles = db.MM_User_Roles.Find(id);
            if (mM_User_Roles == null)
            {
                return NotFound();
            }
                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = mM_User_Roles;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_User_Roles", "GetMM_User_Roles(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }


        [Route("api/MM_User_Roles/GetRoles/{plantid},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetRoles")]
        public IHttpActionResult GetRoles(decimal plantid, decimal Audit_Type_Id)
        {
            try
            { 
            object chkpt = null;
            var chkpt_obj = (from r in db.MM_Roles
                             where r.Plant_ID == plantid && r.Is_Active == true && r.Audit_Type_Id == Audit_Type_Id
                             select new
                             {
                                 r.Role_ID,
                                 r.Role_Name,
                                 r.Role_Description
                             }).ToList();

            if (chkpt_obj == null)
            {
                    chkpt = null;
                
            }
            else
            {
                chkpt = chkpt_obj;
                
            }
                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = chkpt;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_User_Roles", "GetRoles(" + plantid + ","+Audit_Type_Id+")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_User_Roles/getExistEmployee/{empid}")]
        [HttpGet]
        [ActionName("getExistEmployee")]
        public IHttpActionResult getExistEmployee(decimal empid)
        {
            try
            { 
            var existemp = (from ur in db.MM_Employee

                            where ur.Employee_ID == empid
                            select new
                            {
                                ur.Employee_ID,
                                ur.Employee_Name
                            }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = existemp;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_User_Roles", "getExistEmployee(" + empid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }



        [Route("api/MM_User_Roles/GetExistRoles/{PlantID},{empid}")]
        [HttpGet]
        [ActionName("GetExistRoles")]
        public IHttpActionResult GetExistRoles(decimal PlantID, decimal empid)
        {
            try
            { 
            var existroles = (from ur in db.MM_User_Roles

                              where ur.Plant_ID == PlantID && ur.Employee_ID == empid
                              select new
                              {
                                  ur.Employee_ID,
                                  ur.MM_Roles.Role_Name,
                                  ur.Is_Create,
                                  ur.Is_Delete,
                                  ur.Is_Edit,
                                  ur.Role_ID,
                                  ur.Plant_ID
                              }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = existroles;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_User_Roles", "GetExistRoles("+PlantID+"," + empid + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_User_Roles/GetEmpRoles/{plantid},{Audit_Type_Id},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetEmpRoles")]
        public IHttpActionResult GetEmpRoles(decimal plantid, decimal Audit_Type_Id, int Shop_ID, bool Is_AllShops)
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

            object emprole = null;
            var ur_obj = (from ur in db.MM_User_Roles
                          join
                              emp in db.MM_Employee on
                              ur.Employee_ID equals emp.Employee_ID
                          join
                             role in db.MM_Roles on
                             ur.Role_ID equals role.Role_ID
                          where role.Plant_ID == plantid && role.Is_Active == true && role.Audit_Type_Id == Audit_Type_Id
                          && Shop_ids.Contains(emp.Shop_ID ?? 0)
                          select new
                          {
                              Description = ur.Description,
                              ur.User_Role_Key,
                              ur.Employee_ID,
                              ur.Role_ID,
                              ur.Is_Create,
                              ur.Is_Delete,
                              ur.Is_Edit,
                              Employee_Name = emp.Employee_Name,
                              Role_Name = role.Role_Name
                          }).ToList();

            
                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = ur_obj;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_User_Roles", "GetEmpRoles(" + plantid + "," + Audit_Type_Id + "," + Shop_ID + "," + Is_AllShops + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        // PUT: api/MM_User_Roles/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutMM_User_Roles(decimal id, MM_User_Roles mM_User_Roles)
        {
            decimal user_id = 0;
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            try
            {
                if (db.MM_User_Roles.Any(m => m.Role_ID == mM_User_Roles.Role_ID && m.Plant_ID == mM_User_Roles.Plant_ID && m.User_Role_Key != id && m.Employee_ID == mM_User_Roles.Employee_ID))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }


                MM_User_Roles obj1 = new MM_User_Roles();
                user_id = obj1.Updated_User_ID ?? 0;
                obj1.Role_ID = mM_User_Roles.Role_ID;
                obj1.Employee_ID = mM_User_Roles.Employee_ID;
                obj1.Plant_ID = mM_User_Roles.Plant_ID;
                obj1.Is_Create = mM_User_Roles.Is_Create;
                obj1.Is_Edit = true;
                obj1.Is_Delete = mM_User_Roles.Is_Delete;
                obj1.Audit_Type_Id = mM_User_Roles.Audit_Type_Id;
                obj1.Updated_User_ID = mM_User_Roles.Updated_User_ID;
                obj1.Updated_Date = System.DateTime.Now;

                db.Entry(mM_User_Roles).State = EntityState.Modified;
                db.SaveChanges();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.UpdateMessage;
                messageDataObj.messageTitle = messageDataObj.UpdateTitle;


                return Ok(messageDataObj);
            }
            catch (DbUpdateException dbe)
            {
                generalLogObj.addControllerException(dbe, "MM_User_Roles", "PostMM_User_Roles()", user_id);
                messageDataObj.isErrorMessage = true;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isAlertMessage = false;
                messageDataObj.messageDetail = dbe.ToString();
                messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;

                return Ok(messageDataObj);

            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_User_Roles", "PostMM_User_Roles()", user_id);
                messageDataObj.isErrorMessage = true;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isAlertMessage = false;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
                return Ok(messageDataObj);
            }

        }

        [ResponseType(typeof(MM_User_Roles))]
        public IHttpActionResult PostMM_User_Roles(MM_User_Roles[] mM_User_Roles)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal user_id = 0;
            try
            {
                foreach (var item in mM_User_Roles)
                {
                    if (!db.MM_User_Roles.Any(m => m.Role_ID == item.Role_ID && m.Employee_ID == item.Employee_ID && m.Plant_ID == item.Plant_ID && m.Audit_Type_Id == item.Audit_Type_Id))
                    {
                        user_id = item.Inserted_User_ID ?? 0;
                        MM_User_Roles obj = new MM_User_Roles();

                        obj.Employee_ID = item.Employee_ID;
                        obj.Role_ID = item.Role_ID;
                        obj.Description = item.Description;
                        obj.Is_Create = item.Is_Create;
                        obj.Is_Edit = item.Is_Edit;
                        obj.Is_Delete = item.Is_Delete;
                        obj.Inserted_User_ID = item.Inserted_User_ID;
                        obj.Inserted_Date = DateTime.Now;
                        obj.Inserted_Host = item.Inserted_Host;
                        obj.Plant_ID = item.Plant_ID;
                        obj.Audit_Type_Id = item.Audit_Type_Id;

                        db.MM_User_Roles.Add(obj);
                        db.SaveChanges();

                        messageDataObj.isSuccessMessage = true;
                        messageDataObj.isAlertMessage = false;
                        messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                        messageDataObj.messageTitle = messageDataObj.SuccessTitle;
                    }
                    else
                    {
                        messageDataObj.isAlertMessage = true;
                        messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                        messageDataObj.messageTitle = messageDataObj.DuplicateTitle;
                    }
                }
            }

            catch (DbUpdateException dbe)
            {
                generalLogObj.addControllerException(dbe, "MM_User_Roles", "PostMM_User_Roles()", user_id);
                messageDataObj.isErrorMessage = true;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isAlertMessage = false;
                messageDataObj.messageDetail = dbe.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_User_Roles", "PostMM_User_Roles()", user_id);
                messageDataObj.isErrorMessage = true;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isAlertMessage = false;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;

            }
            return Ok(messageDataObj);
        }


        [ResponseType(typeof(MM_User_Roles))]
        public IHttpActionResult DeleteMM_User_Roles(decimal id)
        {
            MM_User_Roles mM_User_Roles = db.MM_User_Roles.Find(id);
            if (mM_User_Roles == null)
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
                    db.MM_User_Roles.Remove(mM_User_Roles);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                    messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                }
                catch (DbUpdateException dbe)
                {
                    generalLogObj.addControllerException(dbe, "MM_User_Roles", "DeleteMM_User_Roles(" + id + ")", 1);
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
                    generalLogObj.addControllerException(e, "MM_User_Roles", "DeleteMM_User_Roles(" + id + ")", 1);
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

        private bool MM_User_RolesExists(decimal id)
        {
            return db.MM_User_Roles.Count(e => e.User_Role_Key == id) > 0;
        }

        public partial class MM_User_Roles_Rights
        {
            public decimal User_Role_Key { get; set; }
            public decimal Employee_ID { get; set; }
            public decimal Role_ID { get; set; }
            public string Description { get; set; }
            public Nullable<bool> Is_Deleted { get; set; }
            public Nullable<bool> Is_Transfered { get; set; }
            public Nullable<bool> Is_Purgeable { get; set; }
            public Nullable<bool> Is_Edited { get; set; }
            public Nullable<decimal> Inserted_User_ID { get; set; }
            public Nullable<System.DateTime> Inserted_Date { get; set; }
            public string Inserted_Host { get; set; }
            public Nullable<decimal> Updated_User_ID { get; set; }
            public Nullable<System.DateTime> Updated_Date { get; set; }
            public string Updated_Host { get; set; }
            public decimal Plant_ID { get; set; }
            public Nullable<decimal> Audit_Type_Id { get; set; }

            public virtual MM_Roles MM_Roles { get; set; }
            public decimal User_Right_Key { get; set; }
            public decimal Right_ID { get; set; }
        }
    }
}