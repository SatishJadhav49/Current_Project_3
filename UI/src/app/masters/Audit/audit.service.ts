import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Tracksheet } from 'src/app/shared/models/tracksheet.model';
import { ApirequestService } from 'src/app/shared/services/apirequest.service';
import { ReportsService } from '../Reports/reports.service';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  constructor(
    private apirequest: ApirequestService,
    private datePipe: DatePipe
  ) { }
  reportService = inject(ReportsService);
  toaster = inject(ToastrService)
  // -------------------- Audit Plan Configuration Sheet Start----------------------//

  getTableDataAuditPlan(plantid, auditid, shopid, isallshops) {
    return this.apirequest.get(
      'api/MM_Audit_Plan_Master/GetauditPlanData/' +
      plantid +
      ',' +
      auditid +
      ',' +
      shopid +
      ',' +
      isallshops
    );
  }

  savePlan(data: any) {
    return this.apirequest.post('api/MM_Audit_Plan_Master/SaveData', data);
  }

  deleteAuditPlan(id: number) {
    return this.apirequest.delete(
      'api/MM_Audit_Plan_Master/DeleteData/' + id,
      id
    );
  }
  updateAuditPlan(Audit_ID: number, data: any) {
    return this.apirequest.post(
      'api/MM_Audit_Plan_Master/EditData/' + Audit_ID,
      data
    );
  }

  getScheduleTypeList() {
    return this.apirequest.get('api/MasterAPIS/GetScheduleType');
  }

  // -------------------- Audit Plan Configuration  Sheet End----------------------//

  // -------------------- Audit   Sheet Start----------------------//

  getAssignedPlan(
    plantid: number,
    audittypeid: number,
    shopid: number,
    assigneduser: number
  ): Observable<any> {
    return this.apirequest
      .get(
        'api/MM_Audit_Plan_Master/GetPendingAuditList/' +
        plantid +
        ',' +
        audittypeid +
        ',' +
        shopid +
        ',' +
        assigneduser
      )
      .pipe(
        map((response: any[]) => {
          return response.map((data) => {
            const auditDueDate = new Date(data.Due_Date);
            const currentDate = new Date();
            return {
              ...data,
              //Due_Date: this.nextDueDate(data.Schedule_Type, auditDueDate),
              Day_Diff: this.calculateDateDifference(auditDueDate, new Date()),
            };
          });
        })
      );
  }

  getCompletedPlan(plantid, audittypeid, shopid, assigneduser) {
    return this.apirequest.get(
      'api/MM_Audit_Plan_Master/GetCompletedAuditList/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      shopid +
      ',' +
      assigneduser
    );
  }

  updateStatus(Audit_Plan_ID, Audit_Plan_Log_ID, data) {
    return this.apirequest.post(
      'api/AuditSheetController/UpdateStatus/' + Audit_Plan_ID + ',' + Audit_Plan_Log_ID,
      data
    );
  }

  deletePlanLog(data) {
    return this.apirequest.post('api/MM_Audit_Plan_Master/DeletePlanLog', data)
  }

  
  // -------------------- Audit   Sheet End----------------------//
  // ---------- Audit Start---------------------------//
  GetAllDataFromVIN(vinno, biwno) {
    return this.apirequest.get(
      'api/MM_Vehicle_Audit/GetAllDataFromVIN/' + vinno + ',' + biwno
    );
  }
  GetAllDataFromBIW(vinno: any, BIWNo: any) {
    return this.apirequest.get(
      'api/MM_Vehicle_Audit/GetAllDataFromVIN/' + vinno + ',' + BIWNo
    );
  }
  saveAudit(temp: any) {
    return this.apirequest.post(
      'api/MM_Vehicle_Audit/PostMM_Vehicle_Audit',
      temp
    );
  }
  getDataByAuditID(auditid: any) {
    return this.apirequest.get(
      'api/MM_Vehicle_Audit/GetDataByAuditID/' + auditid
    );
  }
  updateAudit(temp: any, Audit_ID: number) {
    return this.apirequest.put(
      'api/MM_Vehicle_Audit/UpdateAudit/',
      Audit_ID,
      temp
    );
  }
  deleteAudit(selectedForDelete: number) {
    return this.apirequest.delete(
      'api/MM_Vehicle_Audit/DeleteVehicle_Audit/' + selectedForDelete,
      selectedForDelete
    );
  }
  deleteFullAudit(selectedForDelete: number) {
    return this.apirequest.post(
      'api/MM_Vehicle_Audit/DeleteAudit/' + selectedForDelete,
      selectedForDelete
    );
  }
  getAuditTableData(
    plantid: number,
    audittypeid: number,
    shopid: number,
    allshops: boolean
  ) {
    return this.apirequest.get(
      'api/MM_Vehicle_Audit/GetAuditTableData/' +
      plantid +
      ',' +
      audittypeid +
      ',' +
      shopid +
      ',' +
      allshops
    );
  }
  getRecordsByPlan(Plan_ID: number, Plan_Log_ID: number) {
    return this.apirequest.get('api/MM_Audit_Plan_Master/GetAuditedPlanData/' + Plan_ID + ',' + Plan_Log_ID);
  }

  


  // ---------- Audit End---------------------------//
  // ---------- Tracksheet Start---------------------------//

  getTrackDataByVinNo(vinno, audit) {
    return this.apirequest.get(
      'api/MM_Track_Sheet/GetData_By_VIN_Or_BIW/' +
      vinno +
      ',' +
      0 +
      ',' +
      audit
    );
  }

  getTrackDataByBIW(biwno, audit) {
    return this.apirequest.get(
      'api/MM_Track_Sheet/GetData_By_VIN_Or_BIW/' +
      0 +
      ',' +
      biwno +
      ',' +
      audit
    );
  }
  getAreaList(Model_ID, Audit_Type_Id, auditId) {
    return this.apirequest.get(
      'api/MM_Track_Sheet/GetAreaList/' +
      Model_ID +
      ',' +
      Audit_Type_Id +
      ',' +
      auditId
    );
  }
  getPartList(paraid, areaid, audittypeid, auditId) {
    return this.apirequest.get(
      'api/MM_Track_Sheet/GetPartList/' +
      paraid +
      ',' +
      areaid +
      ',' +
      audittypeid +
      ',' +
      auditId
    );
  }

  getPartById(partid) {
    return this.apirequest.get('api/MM_PartMaster/GetPartByID/' + partid);
  }

  getCPList(paraid, partid, audittypeid, auditid) {
    return this.apirequest.get(
      'api/MM_Track_Sheet/GetCheckPointList/' +
      paraid +
      ',' +
      partid +
      ',' +
      audittypeid +
      ',' +
      auditid
    );
  }

  getCPByID(ckid: number) {
    return this.apirequest.get(
      'api/MM_CheckpointMaster/GetCheckpointByID/' + ckid
    );
  }

  getLocationList(paraid, cpid, audittypeid, auditid) {
    return this.apirequest.get(
      'api/MM_Track_Sheet/GetLocationList/' +
      paraid +
      ',' +
      cpid +
      ',' +
      audittypeid +
      ',' +
      auditid
    );
  }

  getLocByID(locid: number) {
    return this.apirequest.get(
      'api/MM_LocationMaster/GetLocationByID/' + locid
    );
  }

  getSpecificationList(paraid, locid, audittypeid) {
    return this.apirequest.get(
      'api/MM_Track_Sheet/GetSpecificationList/' +
      paraid +
      ',' +
      locid +
      ',' +
      audittypeid
    );
  }

  getPartWiseImage(partid, audittypeid) {
    return this.apirequest.get(
      'api/MM_Track_Sheet/GetPartWiseImage/' + partid + ',' + audittypeid
    );
  }

  saveRecord(data: Tracksheet) {
    return this.apirequest.post('api/MM_Track_Sheet/SaveTrackSheet', data);
  }

  // updateRecord(data: Tracksheet, id) {
  //   return this.apirequest.put('api/MM_Track_Sheet/EditTrackSheet/', id, data);
  // }

  updateRecord(ID: number, temp: any) {
    return this.apirequest.put('api/MM_Track_Sheet/EditTrackSheet', ID, temp);
  }

  updateNA(data) {
    return this.apirequest.post('api/MM_Track_Sheet/UpdateNAData', data);
  }

  deleteRecord(id: number) {
    return this.apirequest.delete('api/MM_Track_Sheet/DeleteData/' + id, id);
  }

  getTableData(plantid, auditid, audittypeid) {
    return this.apirequest.get(
      'api/MM_Track_Sheet/GetTrackSheetData/' +
      plantid +
      ',' +
      auditid +
      ',' +
      audittypeid
    );
  }

  updateCalculations(Audit_ID: number, data: any) {
    return this.apirequest.put(
      'api/MM_Track_Sheet/UpdateCalculation/',
      Audit_ID,
      data
    );
  }

  // ---------- Tracksheet End---------------------------//

   sendAuditSubmissionMail(data: any) {
    return this.apirequest.post('api/Track_SheetController/SendAuditSubmissionEmail', data);
  }

  calculateDateDifference(dueDate: Date, currentDate: Date): number {
    // return differenceInDays(dueDate, currentDate);
    const diffInMs = dueDate.getTime() - currentDate.getTime();
    // Convert milliseconds to days
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    return diffInDays;
  }

   sendAuditMail(Audit_Plan_Log_ID: number, Model_ID: number) {
    return this.apirequest.post(
      'api/MM_Audit_MailController/SendAuditMail/' + Audit_Plan_Log_ID+','+Model_ID,{Audit_Plan_Log_ID,Model_ID}
    );
  }

  sendMail(DataToSendMail: any) {
    debugger;
    let MailIds: any[] = [];
    this.apirequest.get('api/MasterAPIS/GetMailIdsByModel/' + DataToSendMail.Model_ID )
    .subscribe((modeldata) => {
      if (modeldata.length <= 0 || modeldata[0].Email_Addresses.length <= 0) {
        return;
      }
      MailIds = modeldata[0].Email_Addresses;
      this.getDefectsData(DataToSendMail, MailIds);
    })
  }

   getDefectsData(DataToSendMail, MailIds) {
    debugger;
    this.apirequest
    .get('api/Track_SheetController/GetDefectsForMail/'
       + DataToSendMail.Audit_Plan_Log_ID + ',' 
       + DataToSendMail.Audit_Type_Id)
       .subscribe((data) => {
        
      if (data.length > 0) {
        this.mapMailBody(DataToSendMail, MailIds, data);
      }
    });
  }

 mapMailBody(DataToSendMail, MailIds, defectData) {
  debugger;
    let body = '';
    let reportUrl = this.getReportUrl(DataToSendMail);

    body = `
<p>Dear Team,</p>
<p>Please find ${DataToSendMail.Audit_Type} audit report dated: 
<strong>${DataToSendMail.Audit_Date}</strong>. Audit was performed for  
<strong>${DataToSendMail.Model_Name} - ${DataToSendMail.VIN_Number}</strong>.</p>
<a href="${reportUrl}">Click Here To View/Download Detail Report</a>
<br/><br/>

<h4>Audit Summary Report</h4>
<table border="1" cellpadding="10" cellspacing="0" 
style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; margin-top: 10px;">
   <tr style="background-color: #008b8b; color: #ffffff;">
      <th style="font-size:12px;">Vin No</th>
      <th style="font-size:12px;">Model Name</th>
      <th style="font-size:12px;">Variant</th>
      <th style="font-size:12px;">Audit Date</th>
      <th style="font-size:12px;">Total PIST</th>
      <th style="font-size:12px;">Total Checked</th>
      <th style="font-size:12px;">Total OK</th>
      <th style="font-size:12px;">Total NOK</th>
      <th style="font-size:12px;">Total NA</th>
   </tr>
   <tr style="text-align: center;">
      <td style="font-size:12px;">${DataToSendMail.VIN_Number}</td>
      <td style="font-size:12px;">${defectData[0].Model_Name}</td>
      <td style="font-size:12px;">${defectData[0].Variant_Name}</td>
      <td style="font-size:12px;">${defectData[0].Audit_Date}</td>
      <td style="font-size:12px;">${defectData[0].Total_PIST}</td>
      <td style="font-size:12px;">${defectData[0].Total_Checked}</td>
      <td style="font-size:12px;">${defectData[0].Total_OK}</td>
      <td style="font-size:12px;">${defectData[0].Total_NOK}</td>
      <td style="font-size:12px;">${defectData[0].Total_NA}</td>

   </tr>
</table>

<br/>
<h4>Concern Details</h4>
<table border="1" cellpadding="10" cellspacing="0" 
style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
<tr style="background-color: #008b8b; color: #ffffff; text-align: center;">
   <th style="font-size:12px;">Type</th>
   <th style="font-size:12px;">Part</th>
   <th style="font-size:12px;">Checkpoint</th>
   <th style="font-size:12px;">Location</th>
   <th style="font-size:12px;">Specification</th>
   <th style="font-size:12px;">Reading</th>
   <th style="font-size:12px;">Remark</th>
</tr>
${defectData.map(item => `
<tr style="text-align: center;">
   <td style="font-size:12px;">${item.Type}</td>
   <td style="font-size:12px;">${item.Part_Name}</td>
   <td style="font-size:12px;">${item.Checkpoint_Name}</td>
   <td style="font-size:12px;">${item.Location_Name}</td>
   <td style="font-size:12px;">${item.Specification_Name}</td>
   <td style="font-size:12px;">${item.Reading}</td>
   <td style="font-size:12px;">${item.Remark}</td>
</tr>`).join('')}
</table>

<p>Best Regards,<br>${localStorage.getItem('Name')}</p>
`;

    this.transferMail(body, MailIds, DataToSendMail);
}



  transferMail(body, MailIds, DataToSendMail) {
    debugger;
    const mailData = {
      FromEmail: localStorage.getItem('Email'),
      ToEmailList: MailIds.split(','),
      Subject: this.getSubject(DataToSendMail),
      MessageBody: body,
      CcList: [],
      BccList: []
    };

    console.log(mailData);
    debugger;
    this.apirequest.post('api/Track_SheetController/SendReportMail', mailData).subscribe((res) => {
      if (res) {
        this.toaster.success("Mail sended to respective model managers");
      } else {
        this.toaster.error('Something went wrong.');
      }
    })
  }

  getSubject(data) {
    return `${data.Model_Name} ${data.Audit_Type} report of ${data.VIN_Number} : - ${data.Audit_Date} `;
  }

  getReportUrl(DataToSendMail) {

    let reportUrl = '';

    switch (localStorage.getItem('Plant_Code')) {
      case 'A003':
        let url = this.reportService.getStartreportlink() +
          this.getFilePath(DataToSendMail.Audit_Type_Id) +
          '&VIN_Number=' +
          DataToSendMail.VIN_Number +
          '&Plant_ID=' +
          DataToSendMail.Plant_ID +
          '&Audit_Type_Id=' +
          DataToSendMail.Audit_Type_Id
        return url


      case 'CK01':
        let url2 = this.reportService.getChakanReportUrl() +
          this.getFilePath(DataToSendMail.Audit_Type_Id) +
          '&VIN_Number=' +
          DataToSendMail.VIN_Number +
          '&Plant_ID=' +
          DataToSendMail.Plant_ID +
          '&Audit_Type_Id=' +
          DataToSendMail.Audit_Type_Id
        return url2;

        case 'A002':
        let url3 = this.reportService.getKNDReportUrl() +
          this.getFilePath(DataToSendMail.Audit_Type_Id) +
          '&VIN_Number=' +
          DataToSendMail.VIN_Number +
          '&Plant_ID=' +
          DataToSendMail.Plant_ID +
          '&Audit_Type_Id=' +
          DataToSendMail.Audit_Type_Id
        return url3;

        case 'A010':
        let url4 = this.reportService.getHaridwarReportUrl() +
          this.getFilePath(DataToSendMail.Audit_Type_Id) +
          '&VIN_Number=' +
          DataToSendMail.VIN_Number +
          '&Plant_ID=' +
          DataToSendMail.Plant_ID +
          '&Audit_Type_Id=' +
          DataToSendMail.Audit_Type_Id
        return url4;

      default:
        alert('Plant name error !!! plant name not found');
        return '';
    }
  }
  getFilePath(auditTypeId: number): string {
  
    return '%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK';
}

getAuditedRecords(audittypeid, auditdate, endDate, modelid) {
    const userid = localStorage.getItem('userid');
    return this.apirequest.get(
      'api/Track_SheetController/GetAuditedRecords/' +
      audittypeid +
      ',' +
      auditdate +
      ',' +
      endDate + ',' + modelid + ',' + userid
    )
      .pipe(
        map((response) => {
          return response.map((data) => ({
            ...data,
            VIN_Number: data.VIN_No,
            Audit_Date: this.datePipe.transform(
              data.Audit_Date,
              'dd-MMM-yyyy'
            ),
            Audit_Due_Date: this.datePipe.transform(
              data.Audit_Due_Date,
              'dd-MMM-yyyy'
            ),
          })
          )
        })
      );;
  }
}
