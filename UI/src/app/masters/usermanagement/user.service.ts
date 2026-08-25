import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Userrole } from 'src/app/shared/models/userrole.model';
import { ApirequestService } from 'src/app/shared/services/apirequest.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private apiRequest: ApirequestService, private router: Router) {}

  // ---------- Common Start-----------------------//
  getUserID(): number {
    if (parseInt(localStorage.getItem('userid'))) {
      return parseInt(localStorage.getItem('userid'));
    } else {
      this.router.navigate(['']);
      return null;
    }
  }
  getHostData(): string {
   
      return localStorage.getItem('hostname') ?? "";
   
  }
  getplantID(): number {
    if (parseInt(localStorage.getItem('plantid'))) {
      return parseInt(localStorage.getItem('plantid'));
    } else {
      this.router.navigate(['']);
      return null;
    }
  }
  getPlantList(): Observable<any> {
    return this.apiRequest.get('api/MasterAPIS/GetPlantList');
  }
  getAuditType() {
    return this.apiRequest.get('api/MasterAPIS/GetAudit_Type_list');
  }
  getDeptList(plantId: number): Observable<any> {
    return this.apiRequest.get('api/MM_Employee/GetDepartmentList/' + plantId);
  }

  getShopListByID(shopID: number): Observable<any> {
    return this.apiRequest.get('api/MM_Plant/GetPlantListByID/' + shopID);
  }

  getShopListByAudit(plantid, audittypeid) {
    return this.apiRequest.get(
      'api/MasterAPIS/Get_Audit_wise_Shoplist/' + plantid + ',' + audittypeid
    );
  }
  getAuditTypeList() {
    return this.apiRequest.get('api/MasterAPIS/GetAudit_Type_list');
  }
  getShopList(plantid) {
    return this.apiRequest.get('api/MasterAPIS/GetShoplist/' + plantid);
  }
  getEmployeeList(plantid, audittypeid) {
    return this.apiRequest.get(
      'api/MasterAPIS/GetEmployee/' + plantid + ',' + audittypeid
    );
  }
  getUserList(
    plantID: number,
    shopid: number,
    audittypeid: number,
    allshops: boolean
  ) {
    return this.apiRequest.get(
      'api/MM_Employee/GetEmployeeList/' +
        plantID +
        ',' +
        shopid +
        ',' +
        audittypeid +
        ',' +
        allshops
    );
  }

  // ---------- Common End-----------------------//
  // ---------- Create User  Start-----------------------//

  editUser(userID: number, editUser: any): Observable<any> {
    return this.apiRequest.put('api/MM_Employee', userID, editUser);
  }
  saveUser(userObject: Object) {
    return this.apiRequest.post('api/MM_Employee', userObject);
  }

  // ---------- Create User  End-----------------------//
  // ---------- Create Role  Start-----------------------//

  getMenus(auditype: number): Observable<any> {
    return this.apiRequest.get('api/MM_Roles/GetMenuList/' + auditype);
  }
  deleteRole(deleteRole: number): Observable<any> {
    return this.apiRequest.delete('api/MM_Roles/' + deleteRole, deleteRole);
  }

  getMenusID(RoleID: number, Audit_Type_Id: number): Observable<any> {
    return this.apiRequest.get(
      'api/MM_Roles/GetMenu/' + RoleID + ',' + Audit_Type_Id
    );
  }
  getSubMenusID(menuID: number, roleId: number): Observable<any> {
    return this.apiRequest.get(
      'api/MM_Roles/GetSubMenu/' + menuID + ',' + roleId
    );
  }
  getSubMenus(menuid: number, audittypeid: number): Observable<any> {
    return this.apiRequest.get(
      'api/MM_Roles/SubMenuList/' + menuid + ',' + audittypeid
    );
  }
  getRolesByPlantID(plantID: number, audittype: number): Observable<any> {
    return this.apiRequest.get(
      'api/MM_Roles/GetMM_RoleListByPlantID/' + plantID + ',' + audittype
    );
  }

  getRoles(): Observable<any> {
    return this.apiRequest.get('api/MM_Roles/GetMM_RoleList');
  }

  saveNewRole(roleObj: Object[]) {
    return this.apiRequest.post('api/MM_Roles/SaveAll', roleObj);
  }
  putNewRole(id: number, roleObj: Object[]) {
    return this.apiRequest.put('api/MM_Roles', id, roleObj);
  }
  getRoleList(plantid: number, audittypeid: number): Observable<any> {
    return this.apiRequest.get(
      'api/MM_User_Roles/GetRoles/' + plantid + ',' + audittypeid
    );
  }
  // ---------- Create Role  End-----------------------//
  // ---------- User to Role  start-----------------------//
  getUserListUserRole(
    plantid: number,
    Audit_Type_Id: number,
    shopid,
    allshops
  ): Observable<any> {
    return this.apiRequest.get(
      'api/MM_Employee/GetEmployeeListUserRole/' +
        plantid +
        ',' +
        Audit_Type_Id +
        ',' +
        shopid +
        ',' +
        allshops
    );
  }
  getEmpRoleList(
    plantId: number,
    audittypeid: number,
    shopid,
    allshops
  ): Observable<any> {
    return this.apiRequest.get(
      'api/MM_User_Roles/GetEmpRoles/' +
        plantId +
        ',' +
        audittypeid +
        ',' +
        shopid +
        ',' +
        allshops
    );
  }

  getRightsList(plantid) {
    return this.apiRequest.get('api/MasterAPIS/GetRightlist/' + plantid);
  }

  saveEmpRole(userObject: Object[]) {
    return this.apiRequest.post('api/MM_User_Roles', userObject);
  }
  editEmpRole(userID: number, editUser: any): Observable<any> {
    return this.apiRequest.put('api/MM_User_Roles/', userID, editUser);
    // return this.apiRequest.post('api/MM_User_Roles/UpdateUserRoles', editUser);
    // return this.apiRequest.put('api/MM_User_Roles', userID, editUser);
  }
  deleteEmpRole(deleteUser: number): Observable<any> {
    return this.apiRequest.delete(
      'api/MM_User_Roles/' + deleteUser,
      deleteUser
    );
  }
  deleteUser(deleteUser: number): Observable<any> {
    return this.apiRequest.delete('api/MM_Employee/' + deleteUser, deleteUser);
  }
  getExistRoles(plantid: number, empid: number): Observable<any> {
    return this.apiRequest.get(
      'api/MM_User_Roles/GetExistRoles/' + plantid + ',' + empid
    );
  }

  getExistEmployees(empid: number): Observable<any> {
    return this.apiRequest.get('api/MM_User_Roles/getExistEmployee/' + empid);
  }
  // ---------- User to Role  End-----------------------//
}
