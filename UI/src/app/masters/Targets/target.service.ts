import { Injectable } from '@angular/core';

import { FYTarget } from 'src/app/shared/models/fytarget.model';
import { ApirequestService } from 'src/app/shared/services/apirequest.service';
import { FQTarget } from 'src/app/shared/models/FQTarget.model';

@Injectable({
  providedIn: 'root',
})
export class TargetService {
  constructor(private apiRequest: ApirequestService) {}

  // ---------- FYTarget start---------------------------//

  getFYTargetTableData(plantid, audittypeid, shopid, allshops) {
    return this.apiRequest.get(
      'api/MM_FY_Target_Master/GetFY_Target/' +
        plantid +
        ',' +
        audittypeid +
        ',' +
        shopid +
        ',' +
        allshops
    );
  }
  saveFYTarget(data: FYTarget[]) {
    return this.apiRequest.post(
      'api/MM_FY_Target_Master/SaveMM_FY_Target_Master',
      data
    );
  }
  updateFYTarget(FYTargetid, data: FYTarget) {
    return this.apiRequest.put(
      'api/MM_FY_Target_Master/EditFY_Target/',
      FYTargetid,
      data
    );
  }
  deleteFYTarget(targetid) {
    return this.apiRequest.delete(
      'api/MM_FY_Target_Master/DeleteMM_FY_Target_Master/' + targetid,
      targetid
    );
  }
  // ---------- FYTarget end---------------------------//
  // ---------- FQTarget start---------------------------//

  getFQTargetTableData(plantid, audittypeid, shopid, allshops) {
    return this.apiRequest.get(
      'api/MM_FQ_Target_Master/GetFQ_Target/' +
        plantid +
        ',' +
        audittypeid +
        ',' +
        shopid +
        ',' +
        allshops
    );
  }
  saveFQTarget(data: FQTarget[]) {
    return this.apiRequest.post(
      'api/MM_FQ_Target_Master/SaveMM_FQ_Target_Master',
      data
    );
  }
  updateFQTarget(FQTargetid, data: FQTarget) {
    return this.apiRequest.put(
      'api/MM_FQ_Target_Master/EditFQ_Target/',
      FQTargetid,
      data
    );
  }
  deleteFQTarget(targetid) {
    return this.apiRequest.delete(
      'api/MM_FQ_Target_Master/DeleteMM_FQ_Target_Master/' + targetid,
      targetid
    );
  }
  // ---------- FQTarget end---------------------------//
}
