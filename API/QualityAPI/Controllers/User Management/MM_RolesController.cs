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
using System.Threading;
using QualityAPI.Helper;

namespace QualityAPI.Controllers
{
    [AllowCrossSiteJson]
    public class MM_RolesController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        GlobalData messageDataObj = new GlobalData();
        private General generalLogObj = new General();

        [Route("api/MM_Roles/GetMM_RoleList")]
        [HttpGet]
        [ActionName("GetMM_RoleList")]
        public IHttpActionResult GetMM_RoleList()
        {
            try
            { 
            var result = (from sm in db.MM_Roles
                          select new
                          {
                              sm.Role_ID,
                              sm.Role_Name,
                              sm.Role_Description,
                              sm.Inserted_Date
                          }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = result;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Roles", "GetMM_RoleList()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Roles/GetMM_RoleListByPlantID/{plantid},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetMM_RoleListByPlantID")]
        public IHttpActionResult GetMM_RoleListByPlantID(decimal plantid, decimal Audit_Type_Id)
        {
            try
            { 
            var result = (from sm in db.MM_Roles
                          where sm.Plant_ID == plantid && sm.Audit_Type_Id == Audit_Type_Id
                          select new
                          {
                              sm.Role_ID,
                              sm.Role_Name,
                              sm.Role_Description,
                              sm.Inserted_Date
                          }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = result;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Roles", "GetMM_RoleListByPlantID("+plantid+","+Audit_Type_Id+")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        //get sub-menus againts role for Edit
        [HttpGet]
        [Route("api/MM_Roles/GetSubMenu/{MenuId},{roleId}")]

        [ActionName("GetSubMenu")]
        public IHttpActionResult GetSubMenu(int MenuId, int roleId)
        {
            try
            { 
            var result = (from sm in db.MM_Menu_Role
                          join
                          submenu in db.MM_Sub_Menus
                           on sm.Sub_Menu_ID equals submenu.Sub_Menu_ID
                          join mn in db.MM_Menus
                          on sm.Menu_ID equals mn.Menu_ID
                          where sm.Menu_ID == MenuId && sm.Role_ID == roleId
                          select new
                          {
                              sm.Menu_ID,
                              sm.Sub_Menu_ID,
                              LinkName = submenu.LinkName + " (" + mn.LinkName + ")",
                              submenu.ActionName,

                          }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = result;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Roles", "GetSubMenu(" + MenuId + ","+roleId+")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        // get menus againts role for Edit
        [Route("api/MM_Roles/GetMenu/{id},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetMenu")]
        public IHttpActionResult GetMenu(int id, decimal Audit_Type_Id)
        {
            try
            { 
            var result = (from s in db.MM_Menu_Role
                          join sm in db.MM_Menus
                          on s.Menu_ID equals sm.Menu_ID
                          where s.Role_ID == id && s.Audit_Type_Id == Audit_Type_Id
                          select new
                          {
                              s.Menu_ID,
                              sm.LinkName,
                              sm.Inserted_Host,
                              sm.ActionName

                          }).ToList().Distinct();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = result;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Roles", "GetMenu(" + id + "," + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }


        // GET: api/MM_Roles
        public IQueryable<MM_Roles> GetMM_Roles()
        {
            return db.MM_Roles;
        }

        //Get Menu List
        [Route("api/MM_Roles/GetMenuList/{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("GetMenuList")]
        public IHttpActionResult GetMenuList(decimal Audit_Type_Id)
        {
            try
            { 
            var resultMenuList = (from sm in db.MM_Menus
                                  where sm.Audit_Type_Id == Audit_Type_Id && sm.Is_Active == true
                                  select new
                                  {
                                      sm.Menu_ID,
                                      sm.LinkName,
                                      sm.Inserted_Host,
                                      sm.ActionName
                                  }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = resultMenuList;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Roles", "GetMenuList(" + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        //Get Sub-Menu List
        [Route("api/MM_Roles/SubMenuList/{id},{Audit_Type_Id}")]
        [HttpGet]
        [ActionName("SubMenuList")]
        public IHttpActionResult SubMenuList(int id, int Audit_Type_Id)
        {
            try
            { 
            var result = (from sm in db.MM_Sub_Menus
                          join mn in db.MM_Menus
                          on sm.Menu_ID equals mn.Menu_ID
                          where sm.Menu_ID == id && sm.Is_Active == true && sm.Audit_Type_Id == Audit_Type_Id
                          select new
                          {
                              sm.Menu_ID,
                              LinkName = sm.LinkName + " (" + mn.LinkName + ")",
                              sm.Sub_Menu_ID,
                              sm.ActionName
                          }).ToList();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = result;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Roles", "SubMenuList(" + id + "," + Audit_Type_Id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        // GET: api/MM_Roles/5
        [ResponseType(typeof(MM_Roles))]
        public IHttpActionResult GetMM_Roles(decimal id)
        {
            try
            { 
            MM_Roles mM_Roles = db.MM_Roles.Find(id);
            if (mM_Roles == null)
            {
                return NotFound();
            }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = mM_Roles;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Roles", "GetMM_Roles(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        // PUT: api/MM_Roles/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutMM_Roles(decimal id, MenuRoles[] mM_Roles)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            int count = 0;
            foreach (var item in mM_Roles)
            {
                if (count == 0)
                {
                    MM_Roles role = new MM_Roles();
                    role = db.MM_Roles.Find(id);
                    role.Role_Name = item.Role_Name;
                    role.Role_Description = item.Role_Description;
                    role.Updated_Date = System.DateTime.Now;
                    role.Is_Edited = true;
                    db.Entry(role).State = EntityState.Modified;
                    db.SaveChanges();
                }

                if (item.Menu_ID == 0)
                {
                    item.Menu_ID = (long)db.MM_Sub_Menus.Find(item.Sub_Menu_ID).Menu_ID;
                    //item.Menu_ID = db.MM_Sub_Menus.Where(c => c.Sub_Menu_ID == item.Sub_Menu_ID).Select(c => c.Menu_ID).FirstOrDefault();
                }
                var Existlist = db.MM_Menu_Role.Where(c => c.Role_ID == item.Role_ID && c.Menu_ID == item.Menu_ID && c.Sub_Menu_ID == item.Sub_Menu_ID).ToList();

                if (Existlist.Count == 0) //For Newly Added
                {
                    MM_Menu_Role obj1 = new MM_Menu_Role();
                    obj1.Inserted_Date = System.DateTime.Now;
                    obj1.Role_ID = id;
                    obj1.Menu_ID = item.Menu_ID;
                    obj1.Sub_Menu_ID = item.Sub_Menu_ID;
                    obj1.Plant_ID = item.Plant_ID;
                    obj1.Audit_Type_Id = item.Audit_Type_Id;
                    // obj1.Is_Qdms =true;
                    obj1.Inserted_User_ID = item.Inserted_User_ID;
                    obj1.Inserted_Host = item.Inserted_Host;

                    db.MM_Menu_Role.Add(obj1);
                    db.SaveChanges();
                }
                count++;

            }
            int menu_id = Convert.ToInt32(mM_Roles[0].Menu_ID);
            int role_id = Convert.ToInt32(mM_Roles[0].Role_ID);
            var menuroleList = db.MM_Menu_Role.Where(m => m.Menu_ID == menu_id && m.Role_ID == role_id).ToList();

            foreach (var item1 in menuroleList) //Delete Unchecked item
            {
                var deleteitem = mM_Roles.Where(a => a.Role_ID == item1.Role_ID && a.Sub_Menu_ID == item1.Sub_Menu_ID && a.Menu_ID == item1.Menu_ID).FirstOrDefault();
                if (deleteitem == null)
                {
                    MM_Menu_Role delete = new MM_Menu_Role();
                    delete = db.MM_Menu_Role.Find(item1.Menu_Role_ID);
                    db.MM_Menu_Role.Remove(delete);
                    db.SaveChanges();
                }


            }
            return Ok(mM_Roles);
        }

        //Save In Role Table
        [Route("api/MM_Roles/SaveRole")]
        [HttpPost]
        [ActionName("SaveRole")]
        public IHttpActionResult SaveRole(MM_Roles mM_Roles)
        {

            MM_Roles obj = new MM_Roles();
            obj.Inserted_Date = System.DateTime.Now;
            obj.Role_Name = mM_Roles.Role_Name;
            obj.Role_Description = mM_Roles.Role_Description;
            db.MM_Roles.Add(obj);
            db.SaveChanges();
            return Ok();
        }

        // POST: api/MM_Roles
        [Route("api/MM_Roles/SaveAll")]
        [HttpPost]
        [ActionName("SaveAll")]
        public IHttpActionResult SaveAll(MenuRoles[] mM_Roles)
        {
            decimal roleids = 0;
            string rolename = mM_Roles[0].Role_Name;
            decimal plantid = mM_Roles[0].Plant_ID;
            decimal userid = Convert.ToDecimal(mM_Roles[0].Inserted_User_ID);
            decimal Audit_Type_Id = Convert.ToDecimal(mM_Roles[0].Audit_Type_Id);
            try
            {
                if (db.MM_Roles.Where(c => c.Role_Name.ToLower() == rolename.ToLower() && c.Plant_ID == plantid && c.Audit_Type_Id == Audit_Type_Id).ToList().Count() != 0)
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = "Role name already exits";
                    messageDataObj.messageTitle = "Duplicate Record Found";
                    return Ok(messageDataObj);
                }

                else
                {
                    foreach (var item in mM_Roles)
                    {
                        MM_Menu_Role obj1 = new MM_Menu_Role();

                        if (db.MM_Roles.Where(c => c.Role_Name.ToLower() == item.Role_Name.ToLower() && c.Plant_ID == item.Plant_ID && c.Audit_Type_Id == Audit_Type_Id).ToList().Count() == 0)
                        {
                            MM_Roles obj = new MM_Roles();
                            obj.Inserted_Date = System.DateTime.Now;
                            obj.Role_Name = item.Role_Name;
                            //obj.Is_Qdms = true;
                            obj.Plant_ID = item.Plant_ID;
                            obj.Audit_Type_Id = item.Audit_Type_Id;
                            obj.Role_Description = item.Role_Description;
                            db.MM_Roles.Add(obj);
                            db.SaveChanges();
                            roleids = obj.Role_ID;
                        }
                        obj1.Inserted_Date = System.DateTime.Now;
                        // var roleid = db.MM_Roles.Where(c => c.Role_ID==roleids).Select(c => c.Role_ID).FirstOrDefault();
                        obj1.Role_ID = Convert.ToInt32(roleids);
                        if (item.Menu_ID == 0)
                        {
                            item.Menu_ID = (long)db.MM_Sub_Menus.Find(item.Sub_Menu_ID).Menu_ID;
                        }
                        obj1.Menu_ID = item.Menu_ID;
                        obj1.Sub_Menu_ID = item.Sub_Menu_ID;
                        obj1.Plant_ID = item.Plant_ID;
                        obj1.Audit_Type_Id = item.Audit_Type_Id;
                        obj1.Inserted_User_ID = userid;
                        // obj1.Is_Qdms = true;

                        obj1.Inserted_Host = item.Inserted_Host;

                        db.MM_Menu_Role.Add(obj1);
                        db.SaveChanges();

                    }
                    // int count = mM_Roles.Sucess;
                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = "Record Added Successfully!";
                    messageDataObj.messageTitle = "Added Record.";

                    return Ok(messageDataObj);
                }

            }

            catch (DbUpdateException dbe)
            {
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = "Error While Adding Plant Record!";
                messageDataObj.messageTitle = "Can Not Add New Record ";

                return Ok(messageDataObj);

            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }

                generalLogObj.addControllerException(e, "MM_Roles", "SaveAll", userid);

                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = "Error While Adding Plant Record!";
                messageDataObj.messageTitle = "Can Not Add New Record ";
                //string error = e.Message;
                return Ok(messageDataObj);
            }

            return Ok(mM_Roles);
        }

        // DELETE: api/MM_Roles/5
        [ResponseType(typeof(MM_Roles))]
        public IHttpActionResult DeleteMM_Roles(decimal id)
        {
            MM_Roles mM_Roles = db.MM_Roles.Find(id);
            var menurole = mM_Roles.MM_Menu_Role.ToList();
            foreach (var item in menurole)
            {
                MM_Menu_Role mmmenurole = new MM_Menu_Role();
                mmmenurole = db.MM_Menu_Role.Find(item.Menu_Role_ID);
                db.MM_Menu_Role.Remove(mmmenurole);
                db.SaveChanges();
            }

            if (mM_Roles == null)
            {
                return NotFound();
            }
            try
            {
                db.MM_Roles.Remove(mM_Roles);
                db.SaveChanges();
            }
            catch (Exception e)
            {
                mM_Roles = null;
            }


            return Ok(mM_Roles);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool MM_RolesExists(decimal id)
        {
            return db.MM_Roles.Count(e => e.Role_ID == id) > 0;
        }
    }
}