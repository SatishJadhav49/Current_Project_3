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
using QualityAPI.Helper;
using QualityAPI.Models;

namespace QualityAPI.Controllers
{
    public class MM_ShopController : ApiController
    {
        private OneD_DB_Entity db = new OneD_DB_Entity();
        private General generalLogObj = new General();


        GlobalData messageDataObj = new GlobalData();
        GlobalOperations gbOperation = new GlobalOperations();
        [Route("api/MM_Shop/Getshop/{plantId},{Audit_Type_Id},{Shop_ID},{Is_AllShops}")]
        [HttpGet]
        [ActionName("GetShop")]
        public IHttpActionResult GetShop(decimal plantId,decimal Audit_Type_Id, int Shop_ID, bool Is_AllShops)
        {
            try
            {
                IEnumerable<decimal> Shop_ids;

                if (Is_AllShops == true)
                {
                    Shop_ids = (from shop in db.MM_Shop
                                where shop.Audit_Type_Id == Audit_Type_Id && shop.Plant_ID == plantId
                                select (decimal)shop.Shop_ID).ToList();
                }
                else
                {
                    Shop_ids = new List<decimal> { Shop_ID };
                }

                var obj = (from sh in db.MM_Shop
                           join audit in db.Audit_Type_Master on sh.Audit_Type_Id equals audit.Audit_Type_Id
                           where sh.Plant_ID == plantId && sh.Audit_Type_Id == Audit_Type_Id
                           && Shop_ids.Contains(sh.Shop_ID)
                           orderby sh.Inserted_Date descending
                           select new
                           {
                               sh.Shop_ID,
                               sh.Shop_Name,
                               sh.Description,
                               sh.Sap_Code,
                               sh.IS_Active,
                               audit.Audit_Type_Id
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
                generalLogObj.addControllerException(e, "MM_Shop", "Getshop(" + plantId + ","+Audit_Type_Id+", " + Shop_ID + "," + Is_AllShops + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        [Route("api/MM_Shop/GetshopByPlantUser/{plantId},{userId}")]
        [HttpGet]
        [ActionName("GetshopByPlantUser")]
        public IHttpActionResult GetshopByPlantUser(decimal plantId,decimal userId)
        {
            try
            {
                var obj = (from sh in db.MM_Shop
                           where sh.Plant_ID == plantId
                           select new
                           {
                               sh.Shop_ID,
                               sh.Shop_Name,
                               sh.Description,
                               sh.Sap_Code,
                               sh.IS_Active
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
                generalLogObj.addControllerException(e, "MM_Shop", "GetshopByPlantUser(" + plantId + ","+userId+")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }
        // GET: api/MM_Shop
        public IQueryable<MM_Shop> GetMM_Shop()
        {
            return db.MM_Shop;
        }

        [Route("api/MM_Shop/GetShoptList")]
        [HttpGet]
        [ActionName("GetShopList")]
        public IHttpActionResult GetShopList()
        {
            try
            {
                var shoplist = (from shop in db.MM_Shop
                                join plant in db.MM_Plant
                                on shop.Plant_ID equals plant.Plant_ID
                                select new
                                {
                                    shop.Shop_Name,
                                    shop.Description,
                                    shop.Sap_Code,
                                    shop.Plant_ID,
                                    plant.Plant_Name,
                                    shop.Shop_ID,
                                    shop.IS_Active
                                }).ToList();
                
                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = shoplist;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Shop", "GetShopList()");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        // GET: api/MM_Shop/5
        [ResponseType(typeof(MM_Shop))]
        public IHttpActionResult GetMM_Shop(decimal id)
        {
            try
            {
                MM_Shop mM_Shop = db.MM_Shop.Find(id);
                if (mM_Shop == null)
                {
                    return NotFound();
                }

                messageDataObj.isSuccessMessage = true;
                messageDataObj.isErrorMessage = false;
                var dataList = mM_Shop;
                return Ok(new { messageDataObj, dataList });
            }
            catch (Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_Shop", "GetMM_Shop(" + id + ")");
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.ExceptionTitle;
                messageDataObj.isSuccessMessage = false;
                messageDataObj.isErrorMessage = true;
                return Ok(new { messageDataObj, e });
            }
        }

        // PUT: api/MM_Shop/5
        [ResponseType(typeof(void))]
        public IHttpActionResult PutMM_Shop(decimal id, MM_Shop mM_Shop)
        {
            DateTime currentDatetime = DateTime.Now;

            MM_Shop obj = db.MM_Shop.Find(id);

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != mM_Shop.Shop_ID)
            {
                return BadRequest();
            }

            decimal userid = Convert.ToDecimal(mM_Shop.Updated_User_ID);

            try
            {

                if (db.MM_Shop.Any(m => m.Plant_ID == mM_Shop.Plant_ID && m.Shop_Name == mM_Shop.Shop_Name 
                && m.Shop_ID != mM_Shop.Shop_ID))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = "Shop record already exits";
                    messageDataObj.messageTitle = "Duplicate Record Found";

                    return Ok(messageDataObj);
                }
                obj.Shop_Name = mM_Shop.Shop_Name;
                obj.Audit_Type_Id = mM_Shop.Audit_Type_Id;
                obj.Sap_Code = mM_Shop.Sap_Code;
                obj.Plant_Code = mM_Shop.Plant_Code;
                obj.Description = mM_Shop.Description;
                obj.IS_Active = mM_Shop.IS_Active;
                obj.Updated_Date = currentDatetime;
                obj.Updated_User_ID = userid;
                obj.Is_Edited = true;

                obj.Updated_Host = mM_Shop.Updated_Host;

                db.Entry(obj).State = EntityState.Modified;
                //mM_Shop.Inserted_Date = currentDatetime;
                db.SaveChanges();
            }

            catch (DbUpdateException e)
            {
                if (!MM_ShopExists(id))
                {
                    generalLogObj.addControllerException(e, "MM_Shop", "PutMM_Shop", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = "Shop record does not exits";
                    messageDataObj.messageTitle = "Record Not Found";

                    return Ok(messageDataObj);
                }
               
            }

            messageDataObj.isSuccessMessage = true;
            messageDataObj.messageDetail = "Shop Record Modified Successfully";
            messageDataObj.messageTitle = "Record Modified Successfully!";
            return Ok(messageDataObj);
        }
        [Route("api/MasterAPIS/UpdateShopName/{shopId}")]
        [HttpPut]
        public IHttpActionResult UpdateShopName(decimal shopId, [FromBody] string newShopName)
        {
            try
            {
                // Retrieve the shop to be updated
                var shopToUpdate = db.MM_Shop.FirstOrDefault(s => s.Shop_ID == shopId);

                if (shopToUpdate == null)
                {
                    return NotFound(); // Return 404 if the shop is not found
                }

                // Check for duplicate Shop_Name
                var isDuplicate = db.MM_Shop.Any(s => s.Shop_Name == newShopName && s.Shop_ID != shopId);

                if (isDuplicate)
                {
                    return BadRequest("Duplicate Shop_Name. Please choose a different name.");
                }

                // Update the Shop_Name
                shopToUpdate.Shop_Name = newShopName;

                // Save changes to the database
                db.SaveChanges();

                return Ok("Shop_Name updated successfully");
            }
            catch (Exception ex)
            {
                // Log the exception or handle it appropriately
                return InternalServerError(ex);
            }
        }


        // POST: api/MM_Shop
        [ResponseType(typeof(MM_Shop))]
        public IHttpActionResult PostMM_Shop(MM_Shop mM_Shop)
        {
            DateTime currentDatetime = DateTime.Now;

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            decimal userid = Convert.ToDecimal(mM_Shop.Inserted_User_ID);

            try
            {
                if (db.MM_Shop.Any(m => m.Shop_Name == mM_Shop.Shop_Name && m.Plant_ID == mM_Shop.Plant_ID))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }

                mM_Shop.Inserted_Date = currentDatetime;
                db.MM_Shop.Add(mM_Shop);
                db.SaveChanges();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.SuccessMessage;
                messageDataObj.messageTitle = messageDataObj.SuccessTitle;
            }
            
            catch (DbUpdateException dbe)
            {
                generalLogObj.addControllerException(dbe, "MM_Shop", "PostMM_Shop", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = dbe.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            catch (Exception e)
            {
                while (e.InnerException != null)
                {
                    e = e.InnerException;
                }

                generalLogObj.addControllerException(e, "MM_Shop", "PostMM_Shop", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.SaveErrorTitle;
            }
            return Ok(messageDataObj);
        }

        // DELETE: api/MM_Shop/5
        [ResponseType(typeof(MM_Shop))]
        public IHttpActionResult DeleteMM_Shop(decimal id)
        {
            MM_Shop mM_Shop = db.MM_Shop.Find(id);
            if (mM_Shop == null)
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
                    db.MM_Shop.Remove(mM_Shop);
                    db.SaveChanges();

                    messageDataObj.isSuccessMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DeletionMessage;
                    messageDataObj.messageTitle = messageDataObj.DeletionTitle;
                }
                catch (DbUpdateException dbe)
                {
                    generalLogObj.addControllerException(dbe, "MM_Shop", "DeleteMM_Shop(" + id + ")", 1);

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
                    generalLogObj.addControllerException(e, "MM_Shop", "DeleteMM_Shop(" + id + ")", 1);
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.DeletionErrorTitle;
                    messageDataObj.isErrorMessage = true;
                }
                return Ok(messageDataObj);
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool MM_ShopExists(decimal id)
        {
            return db.MM_Shop.Count(e => e.Shop_ID == id) > 0;
        }

        [Route("api/MM_Shop/Update_ShopName/{Shop_ID}")]
        [HttpPost]
        [ActionName("Update_ShopName")]
        public IHttpActionResult Update_ShopName(decimal Shop_ID, MM_Shop mM_Shop)
        {
            DateTime currentDatetime = DateTime.Now;

            MM_Shop obj = db.MM_Shop.Where(s => s.Shop_ID == Shop_ID).FirstOrDefault();

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            decimal userid = Convert.ToDecimal(mM_Shop.Updated_User_ID);
            try
            {
                if (db.MM_Shop.Any(m => m.Plant_ID == mM_Shop.Plant_ID && m.Shop_Name == mM_Shop.Shop_Name && m.Shop_ID != mM_Shop.Shop_ID))
                {
                    messageDataObj.isAlertMessage = true;
                    messageDataObj.messageDetail = messageDataObj.DuplicateMessage;
                    messageDataObj.messageTitle = messageDataObj.DuplicateTitle;

                    return Ok(messageDataObj);
                }
                obj.Shop_Name = mM_Shop.Shop_Name;
                obj.Updated_Date = currentDatetime;
                obj.Updated_User_ID = userid;
                obj.Is_Edited = true;
                obj.Updated_Host = mM_Shop.Updated_Host;
                db.Entry(obj).State = EntityState.Modified;
                db.SaveChanges();

                messageDataObj.isSuccessMessage = true;
                messageDataObj.messageDetail = messageDataObj.UpdateMessage;
                messageDataObj.messageTitle = messageDataObj.UpdateTitle;
            }

            catch (DbUpdateException e)
            {
                if (!MM_ShopExists(Shop_ID))
                {
                    generalLogObj.addControllerException(e, "MM_ShopController", "Update_ShopName", userid);
                    messageDataObj.isErrorMessage = true;
                    messageDataObj.messageDetail = e.ToString();
                    messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
                }
            }
            catch(Exception e)
            {
                if (e.InnerException != null)
                {
                    e = e.InnerException;
                }
                generalLogObj.addControllerException(e, "MM_ShopController", "Update_ShopName", userid);
                messageDataObj.isErrorMessage = true;
                messageDataObj.messageDetail = e.ToString();
                messageDataObj.messageTitle = messageDataObj.UpdateErrorTitle;
            }
            return Ok(messageDataObj);
        }
    }
}