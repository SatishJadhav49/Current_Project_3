import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AppConfig } from 'src/app/appConfig';
import { Area } from 'src/app/shared/models/area.model';
import { BuildPhase } from 'src/app/shared/models/buildphase.model';
import { CheckPoint } from 'src/app/shared/models/checkpoint.model';
import { Image } from 'src/app/shared/models/image.model';
import { Location } from 'src/app/shared/models/location.model';
import { LocationMapping } from 'src/app/shared/models/locationmapping.model';
import { Part } from 'src/app/shared/models/part.model';
import { Shift } from 'src/app/shared/models/shift.model';
import { shop } from 'src/app/shared/models/shop.model';
import { Specification } from 'src/app/shared/models/specification.model';
import { ApirequestService } from 'src/app/shared/services/apirequest.service';
export interface UserMenuRight {
  Menu_ID: number;
  Role_Name: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class CommonService {
  currentRights: UserMenuRight[] = [];
  constructor(
    private apiRequest: ApirequestService,
    private http: HttpClient,
    private router: Router,
    private appConfig: AppConfig
  ) { }

  // ---------- User Rights section Start ---------------------------//
  getUserRights() {
    const allrights = sessionStorage.getItem('rights')
      ? JSON.parse(sessionStorage.getItem('rights'))
      : [];
    this.currentRights = allrights;
    localStorage.removeItem('canCreate');
    localStorage.removeItem('canUpdate');
    localStorage.removeItem('canDelete');
  }

  canCreate() {
    const rolename = localStorage.getItem('rolename');
    return this.currentRights.find(
      (r) => r.Role_Name.toLowerCase() === rolename.toLowerCase()
    ).canCreate;
  }
  canUpdate() {
    const rolename = localStorage.getItem('rolename');
    return this.currentRights.find(
      (r) => r.Role_Name.toLowerCase() === rolename.toLowerCase()
    ).canUpdate;
  }
  canDelete() {
    const rolename = localStorage.getItem('rolename');
    return this.currentRights.find(
      (r) => r.Role_Name.toLowerCase() === rolename.toLowerCase()
    ).canDelete;
  }
  // ---------- User Rights section End ---------------------------//

  getUserID(): number {
    if (parseInt(localStorage.getItem('userid'))) {
      return parseInt(localStorage.getItem('userid'));
    } else {
      this.router.navigate(['']);
      return null;
    }
  }
  getplantID(): number {
    if (parseInt(localStorage.getItem('plantid'))) {
      return parseInt(localStorage.getItem('plantid'));
    } else {
      this.router.navigate(['']);
      return null;
    }
  }
  getPlantname(plantid: number): Observable<any> {
    return this.apiRequest.get('api/MM_Employee/GetPlantName/' + plantid);
  }

  getusername(empid: number) {
    return this.apiRequest.get('api/MM_Employee/GetUsername/' + empid);
  }
  getHostData(): string {

    return localStorage.getItem('hostname') ?? "";

  }
  getHostNameData(): Observable<any> {
    return this.apiRequest.get('api/MM_Employee/getCurrentHostName');
  }
  getAuditType() {
    if (localStorage.getItem('audittypeid').length > 0) {
      return parseInt(localStorage.getItem('audittypeid'));
    } else {
      this.router.navigate(['']);
      return null;
    }
  }
  getAuditTypeList() {
    return this.apiRequest.get('api/MasterAPIS/GetAudit_Type_list');
  }

  getEmployeeList(plantid, audittypeid) {
    return this.apiRequest.get(
      'api/MasterAPIS/GetEmployee/' + plantid + ',' + audittypeid
    );
  }
  getEmployeeDetails(): Observable<any> {
    const token = localStorage.getItem('user');
    if (token) {
      return this.apiRequest.get('api/MM_Employee/GetUserID/' + token);
    } else {
      this.router.navigate(['']);
      return null;
    }
  }

  getPointerList(shopid, audittypeid) {
    return this.apiRequest.get(
      'api/MasterAPIS/GetSeverity/' + shopid + ',' + audittypeid
    );
  }

  getParameter() {
    return this.apiRequest.get('api/MasterAPIS/GetGapAndFlush');
  }
  // ---------- shop data---------------------------//

  getShopListForPlant(
    plantID: number,
    Audit_Type_Id: number,
    shopid,
    allshops
  ): Observable<any> {
    return this.apiRequest.get(
      'api/MM_Shop/Getshop/' +
      plantID +
      ',' +
      Audit_Type_Id +
      ',' +
      shopid +
      ',' +
      allshops
    );
  }
  save_shop(shopdataObject: object) {
    return this.apiRequest.post('api/MM_Shop', shopdataObject);
  }

  getShopList(): Observable<any> {
    return this.apiRequest.get('api/MM_Shop/GetShoptList');
  }

  getShopListByAudit(plantid, audittypeid) {
    return this.apiRequest.get(
      'api/MasterAPIS/Get_Audit_wise_Shoplist/' + plantid + ',' + audittypeid
    );
  }

  getShopListByID(shopID: number): Observable<any> {
    return this.apiRequest.get('api/MM_Plant/GetPlantListByID/' + shopID);
  }

  deleteShop(shopID: number): Observable<any> {
    return this.apiRequest.delete('api/MM_Shop/' + shopID, shopID);
  }

  editShop(shopID: number, editShopList: shop): Observable<any> {
    return this.apiRequest.put('api/MM_Shop', shopID, editShopList);
  }

  updateShopName(id: number, shopobj) {
    return this.apiRequest.post('api/MM_Shop/Update_ShopName/' + id, shopobj);
  }
  // ---------- shop data end---------------------------//
  // ---------- Model data Start---------------------------//

  getModelTableData(
    plantid: number,
    Audit_Type_Id: number,
    shopid: number,
    allshops: boolean
  ) {
    return this.apiRequest.get(
      'api/MM_Master_Model/GetModels/' +
      plantid +
      ',' +
      Audit_Type_Id +
      ',' +
      shopid +
      ',' +
      allshops
    );
  }

  getModelList(shopid, audittypeid) {
    return this.apiRequest.get(
      'api/MasterAPIS/GetModelByShop/' + shopid + ',' + audittypeid
    );
  }
  getModelByPlant(plantid) {
    return this.apiRequest.get('api/MasterAPIS/GetModelByPlant/' + plantid);
  }

  getModelByShopAudit(shopid, audittype) {
    return this.apiRequest.get('');
  }

  saveModel(modelarray: any[]) {
    return this.apiRequest.post(
      'api/MM_Master_Model/PostMM_Model_Master',
      modelarray
    );
  }

  deleteModel(id: number) {
    return this.apiRequest.delete(
      'api/MM_Model/DeleteMM_Model_Master/' + id,
      id
    );
  }

  updateModel(modelid, modelobject) {
    return this.apiRequest.put(
      'api/MM_Model/PutMM_Model_Master',
      modelid,
      modelobject
    );
  }
  // ---------- Model data end---------------------------//

  // ---------- Color Start---------------------------//
  getColorTableData() {
    return this.apiRequest.get('api/MM_Master_Color/GetColors');
  }

  getColorByPlant(plantid) {
    return this.apiRequest.get('api/MasterAPIS/GetColors/' + plantid);
  }

  saveColor(data) {
    return this.apiRequest.post('api/MM_Color/PostMM_Color_Master', data);
  }

  editColor(id, data) {
    return this.apiRequest.put('api/MM_Color/PutMM_Color_Master', id, data);
  }

  deleteColor(id) {
    return this.apiRequest.delete(
      'api/MM_Color/DeleteMM_Color_Master/' + id,
      id
    );
  }
  // ---------- Color end---------------------------//

  // ---------- Location Start---------------------------//

  getLocationList(ckpid, Audit_Type_Id) {
    return this.apiRequest.get(
      'api/MasterAPIS/GetLocationByCheckpoint/' + ckpid + ',' + Audit_Type_Id
    );
  }

  getLocationTableData(
    plantid,
    audittypeid,
    shopid: number,
    modelid: number
  ) {
    return this.apiRequest.get(
      'api/MM_LocationMaster/GetLocation/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      shopid +
      ',' +
      modelid
    );
  }
  getLocationMappingTableData(
    plantid,
    audittypeid,
    lmid: number
  ) {
    return this.apiRequest.get(
      'api/MM_LocationMapping/GetLocationMapping/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      lmid
    );
  }

  updateLocationMapping(id: number, payload: any) {
    return this.apiRequest.put(
      'api/MM_LocationMapping/EditLocationMapping/',
      id,
      payload
    );
  }

  deleteLocationMapping(id: number) {
    return this.apiRequest.delete(
      'api/MM_LocationMapping/DeleteLocationMapping/' + id,
      id
    );
  }

  saveLocation(data: Location[]) {
    return this.apiRequest.post(
      'api/MM_LocationMaster/SaveMM_LocationMaster',
      data
    );
  }
  saveLocationMapping(payload) {
    return this.apiRequest.post(
      'api/MM_LocationMapping/SaveMM_LocationMapping',
      [payload]
    );
  }
  updateLocation(id, data: Location) {
    return this.apiRequest.put(
      'api/MM_LocationMaster/EditLocationMaster/',
      id,
      data
    );
  }
  deleteLocation(id) {
    return this.apiRequest.delete(
      'api/MM_LocationMaster/DeleteMM_LocationMaster/' + id,
      id
    );
  }
  // ---------- Location end---------------------------//
  // ---------- Shift Start---------------------------//
  getShift(plantid, shopid) {
    return this.apiRequest.get(
      'api/MasterAPIS/GetShift/' + plantid + ',' + shopid
    );
  }
  getShiftTableData(plantid, audittypeid, shopid: number, allshops: boolean) {
    return this.apiRequest.get(
      'api/MM_Shift_Master/GetShiftData/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      shopid +
      ',' +
      allshops
    );
  }
  saveShift(data: Shift[]) {
    return this.apiRequest.post('api/MM_Shift_Master/Save_MM_Shift', data);
  }
  updateShift(id, data: Shift) {
    return this.apiRequest.post(
      'api/MM_Shift_Master/Edit_MM_Shift/' + id,
      data
    );
  }
  deleteShift(id) {
    return this.apiRequest.delete(
      'api/MM_Shift_Master/Delete_MM_Shift/' + id,
      id
    );
  }
  // ---------- Shift end---------------------------//

  // ---------- Build phase start---------------------------//

  getBuildphaseTableData(plantid) {
    return this.apiRequest.get(
      'api/MM_Audit_BuildPhase_Mstr/GetBuildData/' + plantid
    );
  }
  saveBuildphase(data: BuildPhase) {
    return this.apiRequest.post(
      'api/MM_Audit_BuildPhase_Mstr/PostMM_Audit_BuildPhase_Mstr',
      data
    );
  }
  updateBuildphase(severityid, data: BuildPhase) {
    return this.apiRequest.put(
      'api/MM_Audit_BuildPhase_Mstr/PostMM_Audit_BuildPhase_Mstr',
      severityid,
      data
    );
  }
  deleteBuildphase(sevrityid) {
    return this.apiRequest.delete(
      'api/MM_Audit_BuildPhase_Mstr/PostMM_Audit_BuildPhase_Mstr/' + sevrityid,
      sevrityid
    );
  }
  // ---------- Build phase end---------------------------//
  // ---------- Area start---------------------------//

  getAreaList(modelid, audittypeid) {
    return this.apiRequest.get(
      'api/MasterAPIS/GetAreaByModel/' + modelid + ',' + audittypeid
    );
  }

  getAreaTableData(plantid, audittypeid, shopid, allshops) {
    return this.apiRequest.get(
      'api/MM_AreaMaster/GetArea/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      shopid +
      ',' +
      allshops
    );
  }
  saveArea(data: any) {
    return this.apiRequest.post('api/MM_AreaMaster/SaveMM_AreaMaster', data);
  }
  updateArea(areaid, data: Area) {
    return this.apiRequest.put(
      'api/MM_AreaMaster/EditAreaMaster/',
      areaid,
      data
    );
  }
  deleteArea(sevrityid) {
    return this.apiRequest.delete(
      'api/MM_AreaMaster/DeleteMM_AreaMaster/' + sevrityid,
      sevrityid
    );
  }
  // ---------- Area end---------------------------//
  // ---------- Part Start---------------------------//
  getPartList(areaid, audittypeid) {
    return this.apiRequest.get(
      'api/MasterAPIS/GetPartByArea/' + areaid + ',' + audittypeid
    );
  }
  getPartTableData(plantid, audittypeid, shopid: number, allshops: boolean) {
    return this.apiRequest.get(
      'api/MM_PartMaster/GetPart/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      shopid +
      ',' +
      allshops
    );
  }

  savePart(partObj: Part[]) {
    return this.apiRequest.post('api/MM_PartMaster/SaveMM_PartMaster', partObj);
  }

  updatePart(partid: number, partobj: Part) {
    return this.apiRequest.put(
      'api/MM_PartMaster/EditPartMaster/',
      partid,
      partobj
    );
  }

  deletePart(id) {
    return this.apiRequest.delete(
      'api/MM_PartMaster/DeleteMM_PartMaster/' + id,
      id
    );
  }

  // ---------- Part end---------------------------//
  // ---------- Check Point Start------------------//
  getCPList(partid, audittypeid) {
    return this.apiRequest.get(
      'api/MasterAPIS/GetCheckpointByPart/' + partid + ',' + audittypeid
    );
  }
  getCPTableData(plantid, audittypeid, shopid: number, allshops: boolean) {
    return this.apiRequest.get(
      'api/MM_CheckpointMaster/GetCheckpoint/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      shopid +
      ',' +
      allshops
    );
  }

  saveCP(partObj: CheckPoint[]) {
    return this.apiRequest.post(
      'api/MM_CheckpointMaster/SaveMM_CheckpointMaster',
      partObj
    );
  }

  updateCP(partid: number, partobj: CheckPoint) {
    return this.apiRequest.put(
      'api/MM_CheckpointMaster/EditCheckpointMaster/',
      partid,
      partobj
    );
  }

  deleteCP(id) {
    return this.apiRequest.delete(
      'api/MM_CheckpointMaster/DeleteMM_CheckpointMaster/' + id,
      id
    );
  }
  // ---------- Check Point end--------------------//
  // ---------- Specification Start------------------//
  getSpecificationList(partid, audittypeid) {
    return this.apiRequest.get(
      'api/MasterAPIS/GetCheckpointByPart/' + partid + ',' + audittypeid
    );
  }
  getSpecsTableData(plantid, audittypeid, shopid: number, modelid: number) {
    return this.apiRequest.get(
      'api/MM_SpecificationMaster/GetSpecification/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      shopid +
      ',' +
      modelid
    );
  }

  saveSpecs(partObj: Specification[]) {
    return this.apiRequest.post(
      'api/MM_SpecificationMaster/SaveMM_SpecificationMaster',
      partObj
    );
  }

  updateSpecs(partid: number, partobj: Specification) {
    return this.apiRequest.put(
      'api/MM_SpecificationMaster/EditSpecificationMaster/',
      partid,
      partobj
    );
  }



  deleteSpecs(id) {
    return this.apiRequest.delete(
      'api/MM_SpecificationMaster/DeleteMM_SpecificationMaster/' + id,
      id
    );
  }


  getCalculations(startdate, enddate, audittypeid, Location_ID, Parameter_ID) {
    const plantid = localStorage.getItem('plantid');

    return this.apiRequest.get(
      'api/MM_SpecificationMaster/UpdateCalculation/' +
      startdate +
      ',' +
      enddate +
      ',' +
      audittypeid +
      ',' +
      plantid +
      ',' +
      Location_ID +
      ',' +
      Parameter_ID
    );
  }

  updateCalculations(specid: number, specData: Specification) {
    return this.apiRequest.put(
      'api/MM_SpecificationMaster/SaveUpdatedCalculation/',
      specid,
      specData
    );
  }
  // ---------- Specification end--------------------//

  // ---------- Image Start---------------------------//

  getImageTableData(plantid, audittypeid, shopid: number, allshops: boolean) {
    return this.apiRequest.get(
      'api/MM_Image_Master/GetImageData/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      shopid +
      ',' +
      allshops
    );
  }
  saveImage(fileToUpload: File, imagemodel: any): any {
    const endpoint =
      this.appConfig.baseApiPath + 'api/MM_Image_Master/ImageUpload';
    const formData: FormData = new FormData();
    formData.append('Image', fileToUpload, fileToUpload.name);
    formData.append('imagemodel', JSON.stringify(imagemodel));
    return this.http.post(endpoint, formData);
  }

  deleteImage(id: number) {
    return this.apiRequest.delete('api/MM_Image_Master/' + id, id);
  }

  editImage(imageId: string, formData: FormData): Observable<any> {
    console.log("Service data", imageId, formData)
    const url = `${this.appConfig.baseApiPath}api/MM_Image_Master/UpdateImage/${imageId}`;
    return this.http.post<any>(url, formData, {
    });
  }
  // ---------- Image end---------------------------//
  // ---------- Document Start---------------------------//
  getDocumentTableData() {
    return this.apiRequest.get(
      'api/MM_Documents_Master/GetTableData'
    );
  }
  saveDocument(fileToUpload: File, Documentmodel: any): any {
    const endpoint =
      this.appConfig.baseApiPath + 'api/MM_Documents_Master/DocumentUpload';
    const formData: FormData = new FormData();
    formData.append('Document', fileToUpload, fileToUpload.name);
    formData.append('Documentmodel', JSON.stringify(Documentmodel));
    return this.http.post(endpoint, formData);
  }

  deleteDocument(id: number) {
    return this.apiRequest.delete('api/MM_Documents_Master/DeleteFile/' + id, id);
  }

  downloadDocument(fileName: string): Observable<Blob> {
    const url = `${this.appConfig.baseApiPath}/api/MM_Documents_Master/DownloadDocument?fileName=${fileName}`;
    return this.http.get(url, { responseType: 'blob' });
  }
  // ---------- Image end---------------------------//
}
