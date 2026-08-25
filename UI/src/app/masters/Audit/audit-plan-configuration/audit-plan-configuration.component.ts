import { AfterViewChecked, Component, NgZone, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Model } from 'src/app/shared/models/model.model';
import { CommonService } from '../../common/common.service';
import { shop } from 'src/app/shared/models/shop.model';
import { User } from 'src/app/shared/models/user.model';
import { AuditService } from '../audit.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { ScheduleType } from 'src/app/shared/models/scheduleType.model';
import { MatInput } from '@angular/material/input';
import { DatePipe } from '@angular/common';
import { AuditPlan } from './auditplan.model';
import { AuditType } from 'src/app/shared/models/audittype.model';
import { MailService } from 'src/app/shared/services/mail.service';
declare var $: any;

@Component({
  selector: 'app-audit-plan-configuration',
  templateUrl: './audit-plan-configuration.component.html',
  styleUrls: ['./audit-plan-configuration.component.css']
})
export class AuditPlanConfigurationComponent implements AfterViewChecked {
  audittypeid: number;
  AuditName: string;
  plantid: number;
  plantname: string;
  userid: number;
  username: string;
  hostname: string;
  loading: boolean = false;
  selectedBIW: any;
  allshops: boolean;
  targetDate: any;
  canCreate: boolean = true;
  shopid: any;
  modifyFlag: boolean = false;
  // Shop
  selectedShop: shop;
  ShopList: shop[];
  // Model
  selectedModel: Model;
  modelList: Model[];
  // User
  selectedUser: User;
  UserList: User[];

  // Schedule
  selectedSchedule: ScheduleType;
  ScheduleList: ScheduleType[] = [];
  //Schedule
  selectedAuditType: AuditType;
  auditTypeList: AuditType[] = [];

  // other
  isActive: boolean = true;
  auditPlanList: any[] = [];
  editData: any;

  // Date
  startdate: any;
  enddate: any;
  selectedShift: number;
  @ViewChild('startdatepicker1', {
    read: MatInput,
  })
  startdatepicker1: MatInput;
  @ViewChild('enddatepicker1', {
    read: MatInput,
  })
  enddatepicker1: MatInput;
  minDate: Date;
  realstartDate: Date;
  todayDate: Date = new Date();
  frequency: number = 1;

  constructor(
    private commonService: CommonService,
    private auditService: AuditService,
    private toaster: ToastrService,
    private ngZone: NgZone,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private mail: MailService
  ) {
    this.minDate = new Date();
  }
  ngOnInit() {
    $('#ngslide').hide();
    this.allshops = localStorage.getItem('isallshops') === '1';
    this.plantid = parseInt(localStorage.getItem('plantid'));
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.userid = parseInt(localStorage.getItem('userid'));
    this.hostname = localStorage.getItem('hostname');
    this.shopid = localStorage.getItem('shopid');
    this.getTableData();
    this.getShopList();
    // this.getaudittypelist();
    this.getScheduleTypeList();
  }

  ngAfterViewChecked() {
    this.commonService.getUserRights();
    this.canCreate = this.commonService.canCreate();
    localStorage.setItem(
      'canCreate',
      this.commonService.canCreate() ? '1' : '0'
    );
    localStorage.setItem(
      'canUpdate',
      this.commonService.canUpdate() ? '1' : '0'
    );
    localStorage.setItem(
      'canDelete',
      this.commonService.canDelete() ? '1' : '0'
    );
  }

  // ********************************** Declaration Section End *******************************//
  // ************************************ Get Section Start **************************************//
  getScheduleTypeList() {
    this.auditService.getScheduleTypeList().subscribe((data) => {
      this.ScheduleList = data;
    });
  }
  // ********************************** Get Section End *******************************//
  // ********************************** AuditType Section Start *******************************//
  // getaudittypelist() {
  //   this.selectedAuditType = null;
  //   this.auditTypeList = [];
  //   this.commonService.getAuditTypeList().subscribe((res) => {
  //     this.auditTypeList = res;
  //   });
  // }
  // onSelectAuditType(AuditType: any) {
  //   if (AuditType) {
  //     this.selectedAuditType = AuditType.value;
  //   }
  // }
  // ********************************** AuditType Section End *******************************//
  // ************************************ Shop Section Start **************************************//

  getShopList() {
    if (!this.ShopList) {
      this.commonService
        .getShopListForPlant(
          this.plantid,
          this.audittypeid,
          this.shopid,
          this.allshops
        )
        .subscribe((data) => {
          this.ShopList = data;
          if (!this.modifyFlag && this.ShopList.length === 1) {
            this.selectShop(this.ShopList[0]);
          }
        });
    }
  }

  selectShop(shop: any) {
    if (shop) {
      this.selectedShop = shop.value;
      this.getModelList();
      // this.getUserList();
    }
  }

  // ************************************ Shop Section End **************************************//

  // ********************************** Model Section Start *******************************//
  getModelList() {
    if (this.selectedShop) {
      if (!this.modifyFlag) {
        this.selectedModel = null;
        this.modelList = [];
      }
      this.commonService
        .getModelList(this.selectedShop.Shop_ID, this.audittypeid)
        .subscribe((res) => {
          this.modelList = res;
        });
    }
  }

  selectModel(model: any) {
    if (model) {
      this.selectedModel = model.value;
    }
  }
  // ********************************** Model Section End *******************************//
  // ************************************ Date  Section Start ****************************//
  onStartDateChange(event: any) {
    if (event.value) {
      this.realstartDate = event.value;
      this.startdate = this.datePipe.transform(event.value, 'MM/dd/yyyy');
    }
  }

  onEndDateChange(event: any) {
    if (event.value) {
      this.enddate = this.datePipe.transform(event.value, 'MM/dd/yyyy');
      // if (this.startdate > this.enddate) {
      //   this.toaster.warning('End date should be more that start date');
      //   this.enddate = null;
      //   this.enddatepicker1.value = '';
      //   return;
      // }
    }
  }

  // ************************************ Date Section End *******************************//
  // ********************************** User Section Start *******************************//
  getUserList() {
    if (this.selectedShop) {
      if (!this.modifyFlag) {
        this.selectedUser = null;
        this.UserList = [];
      }
      this.commonService
        .getEmployeeList(this.plantid, this.audittypeid)
        .subscribe((res) => {
          this.UserList = res;
        });
    }
  }

  selectUser(User: any) {
    if (User) {
      this.selectedUser = User.value;
    }
  }
  // ********************************** User Section End *******************************//
  // ********************************** CRUD Section Start *******************************//
  onSave() {
    if (!this.startdate) {
      this.toaster.warning('Please select Start Date ');
      return;
    }
    if (!this.enddate) {
      this.toaster.warning('Please select End Date ');
      return;
    }
    if (!this.selectedShop) {
      this.toaster.warning('Please select Shop ');
      return;
    }
    if (!this.selectedModel) {
      this.toaster.warning('Please select Model ');
      return;
    }
    if (!this.selectedSchedule) {
      this.toaster.warning('Please select Schedule Type ');
      return;
    }
    // if (!this.selectedAuditType) {
    //   this.toaster.warning('Please select Audit Type ');
    //   return;
    // }
    // if (!this.selectedUser) {
    //   this.toaster.warning('Please select Assigned To ');
    //   return;
    // }
    const saveData: AuditPlan = {
      Audit_Plan_ID: this.editData?.Audit_Plan_ID,
      Model_ID: this.selectedModel.Model_ID,
      Shop_ID: this.selectedShop.Shop_ID,
      Schedule_Type_ID: this.selectedSchedule.Schedule_Type_ID,
      Assign_User_ID: this.selectedUser?.Employee_ID,
      IS_Active: this.isActive,
      Plant_ID: this.plantid,
      Plant_Code: localStorage.getItem('Plant_Code') ?? '',
      Audit_Type_Id: this.audittypeid,
      Inserted_Host: this.hostname,
      Inserted_User_ID: this.userid,
      Updated_Host: this.hostname,
      Updated_User_ID: this.userid,
      Audit_Start_Date: this.startdate,
      Audit_End_Date: this.enddate,
      Frequency: this.frequency

    };
    if (this.modifyFlag) {
      this.updateRecord(saveData);
      return;
    }
    this.auditService.savePlan(saveData).subscribe((data) => {
      if (data !== null && data !== undefined) {
        if (data.isErrorMessage) {
          this.toaster.error(data.messageDetail, data.messageTitle);
        } else if (data.isSuccessMessage) {
          this.refresh();
          this.toaster.success(data.messageDetail, data.messageTitle);
        } else if (data.isAlertMessage) {
          this.toaster.warning(data.messageDetail, data.messageTitle);
        } else {
          this.toaster.error('Something went wrong');
        }
      }
    });
  }

  updateRecord(data) {
    this.auditService
      .updateAuditPlan(this.editData.Audit_Plan_ID, data)
      .subscribe((data) => {
        if (data !== null && data !== undefined) {
          if (data.isErrorMessage) {
            this.toaster.error(data.messageDetail, data.messageTitle);
          } else if (data.isSuccessMessage) {
            this.refresh();
            this.toaster.success(data.messageDetail, data.messageTitle);
          } else if (data.isAlertMessage) {
            this.toaster.warning(data.messageDetail, data.messageTitle);
          } else {
            this.toaster.error('Something went wrong');
          }
        }
      });
  }

  modifySelected(Audit_Plan_ID) {
    debugger;
    this.editData = this.auditPlanList.find(
      (p) => p.Audit_Plan_ID === Audit_Plan_ID
    );
    if (this.editData) {
      this.selectedShop = this.ShopList.find(
        (s) => s.Shop_ID === this.editData.Shop_ID
      );
      this.commonService
        .getModelList(this.editData.Shop_ID, this.audittypeid)
        .subscribe((res) => {
          this.modelList = res;
          this.selectedModel = this.modelList.find(
            (m) => m.Model_ID === this.editData.Model_ID
          );
        });
      this.selectedSchedule = this.ScheduleList.find(
        (s) => s.Schedule_Type_ID === this.editData.Schedule_Type_ID
      );
      // this.commonService
      //   .getEmployeeList(this.plantid, this.audittypeid)
      //   .subscribe((res) => {
      //     this.UserList = res;
      //     this.selectedUser = this.UserList.find(
      //       (u) => u.Employee_ID === this.editData.Assign_User_ID
      //     );
      //   });
      // this.selectedAuditType = this.auditTypeList.find((a) => a.Audit_Type_Id === this.editData.Audit_Type_Id);
      this.isActive = this.editData.IS_Active;
      this.startdate = this.editData.Audit_Start_Date;
      this.enddate = this.editData.Audit_End_Date;
      this.startdatepicker1.value = this.editData.Audit_Start_Date;
      this.enddatepicker1.value = this.editData.Audit_End_Date;
      this.modifyFlag = true;
      this.frequency = this.editData.Frequency;

    }
  }


  DeleteRecord(Audit_ID) {
    this.auditService.deleteAuditPlan(Audit_ID).subscribe(
      (data) => {
        if (data.isErrorMessage) {
          this.toaster.error(data.messageDetail, data.messageTitle);
        } else if (data.isSuccessMessage) {
          this.refresh();
          this.toaster.success(data.messageDetail, data.messageTitle);
        } else if (data.isAlertMessage) {
          this.toaster.warning(data.messageDetail, data.messageTitle);
        } else {
          this.toaster.error('Something went wrong');
        }
      },
      (err) => {
        console.log(err);
        this.toaster.error(err);
      }
    );
  }

  // ********************************** CRUD Section End *******************************//
  // ********************************** Table Section Start *******************************//

  getTableData() {
    if (this.plantid && this.audittypeid) {
      this.loading = true;
      this.auditService
        .getTableDataAuditPlan(
          this.plantid,
          this.audittypeid,
          this.shopid,
          this.allshops
        )
        .subscribe((data) => {
          if (data) {
            this.LoadTable(data);
            this.auditPlanList = data;
            this.loading = false;
          }
        });
    }
  }
  LoadTable(jsondatas) {
    if (<any>$.fn.DataTable.isDataTable('#shopmodeltable')) {
      $('#shopmodeltable').dataTable().fnDestroy();
    }

    <any>$('#shopmodeltable').DataTable({
      destroy: true,
      lengthMenu: [
        [-1, 50, 25, 10, 5],
        ['All', 50, 25, 10, 5],
      ],
      data: jsondatas,
      columnDefs: [
        // { title: 'Audit Type', targets: 0 },
        { title: 'Shop', targets: 0 },
        { title: 'Model ', targets: 1 },
        { title: 'Start Date ', targets: 2 },
        { title: 'End Date ', targets: 3 },
        { title: 'Schedule Type', targets: 4 },
        { title: 'Frequency', targets: 5 },
        { title: 'Created By', targets: 6 },
        { title: 'Status  ', targets: 7 },
        { title: 'Action', targets: 8 },
      ],

      columns: [
        {
          data: 'Shop_Name',
        },
        { data: 'Model_Name' },
        {
          data: 'Audit_Start_Date',
          render: function (data) {
            return new Date(data).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
          },
        },
        {
          data: 'Audit_End_Date',
          render: function (data) {
            return new Date(data).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            });
          },
        },
        {
          data: 'Schedule_Type',
        },
        {
          data: 'Frequency',
        },
        { data: 'Employee_Name' },
        {
          data: null,
          render: function (data, type, row) {
            if (data.IS_Active) {
              return '<span style="color: green;font-weight: bold;">Active</span>';
            }
            return '<span style="color: red;">In Active</span>';
          },
        },
        {
          data: null,
          render: function (data, type, row) {
            const canUpdate = localStorage.getItem('canUpdate') === '1';
            const canDelete = localStorage.getItem('canDelete') === '1';

            const editButton = `
             <span id="modifymodelbtn" class="btn fa fa-pencil" data-toggle="modal" title="Edit"
                   data-target="#mymodal"  style="border-radius: 50%!important;
                   background-color: #0b9494;
                   color: black;"
                   data-elemnt-obj="${data.SHIFT_NO}"></span>`;

            const deleteButton = `
             
            <span id="deletemodelbtn" style="border-radius: 50%!important;
          background-color: #d74f4f;
          color: black!important;" class="btn fa fa-trash deletebutton" title = "Delete"  
                   data-element-id="${data.SHIFT_NO}"></span> `;

            if (canUpdate && canDelete) {
              return `<div style="text-align:center" >${editButton}${deleteButton}</div>`;
            } else if (canUpdate) {
              return `<div style="text-align:center" >${editButton}</div>`;
            } else if (canDelete) {
              return `<div style="text-align:center" >${deleteButton}</div>`;
            }

            return '';
          },
          createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
            $(cell).on('click', '#modifymodelbtn', () => {
              this.ngZone.run(() => {
                this.modifySelected(rowData.Audit_Plan_ID);
              });
            });
            $(cell).on('click', '#deletemodelbtn', () => {
              this.ngZone.run(() => {
                const dialogRef = this.dialog.open(DeletePopupComponent, {
                  width: '250px',
                  enterAnimationDuration: '0ms',
                  exitAnimationDuration: '0ms',
                });
                dialogRef.afterClosed().subscribe((result) => {
                  console.log('The dialog was closed' + result);
                  if (result) {
                    this.DeleteRecord(rowData.Audit_Plan_ID);
                  }
                });
              });
            });
          },
        },
      ],
    });
  }
  // ********************************** Table Section End *******************************//
  // ********************************** Other Section Start *******************************//
  refresh() {
    this.selectedShop = null;
    this.selectedModel = null;
    this.selectedSchedule = null;
    // this.selectedAuditType = null;
    this.selectedUser = null;
    this.isActive = true;
    this.modifyFlag = false;
    this.startdate = null;
    this.enddate = null;
    this.frequency = 1;

    this.getTableData();
  }
  // ********************************** Other Section End *******************************//
  // ********************************** Email Section Start *******************************//

  getEmailBody() {
    const start = this.datePipe.transform(this.startdate, 'dd-MMM-yyyy');
    const end = this.datePipe.transform(this.enddate, 'dd-MMM-yyyy');
    let appUrl = '';
    switch (localStorage.getItem('Plant_Code')) {
      case 'A003':
        appUrl = 'http://10.3.48.39:2428/PQDIM/configmaster/audit/auditsheet';
        break;
      case 'CK01':
        appUrl = 'http://10.192.68.77:2428/PQDIM/configmaster/audit/auditsheet';
        break;
      case 'A002':
        appUrl = 'http://10.2.148.96:2428/PQDIM/configmaster/audit/auditsheet';
        break;
      case 'A010':
        appUrl = 'http://10.62.7.50:2428/PQDIM/configmaster/audit/auditsheet';
        break;
      default:
        this.toaster.warning(
          'No such plant code configured :' + localStorage.getItem('Plant_Code')
        );
        break;
    }
    // const appUrl = 'http://localhost:4200/configmaster/audit/auditsheet';

    if (this.modifyFlag && !this.isActive) {
      return `
        <p>Dear ${this.selectedUser.Employee_Name},</p>
        <p>This is to inform you that the ${
          this.selectedAuditType.Audit_Type
        } audit task assigned to you by ${localStorage.getItem(
        'Name'
      )} has been canceled.</p>
        <p>The canceled task was a <strong>${
          this.selectedSchedule.Schedule_Type
        }(${this.frequency}) -${
        this.selectedAuditType.Audit_Type
      } </strong> audit <strong>${
        this.selectedModel.Model_Name
      }</strong>, which was originally scheduled from ${start} to ${end}.</p>
        
        <a href="${appUrl}" 
          style="display: inline-block; text-decoration: none; background-color: #dc3545; color: white; font-size: 14px; font-weight: bold; padding: 12px 24px; border-radius: 5px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);"
          target="_blank">
          View My Tasks
        </a>
        
        <p>Best regards,<br>
         Audit Notification System</p>
           <p>Note: This is an auto-generated email; please do not reply.</p>
      `;
    }
    if (this.modifyFlag) {
      return `
          <p>Dear ${this.selectedUser.Employee_Name},</p>
          <p>${localStorage.getItem(
            'Name'
          )} has updated a task assigned to you.</p>
          <p>You are now required to conduct a <strong>${
            this.selectedSchedule.Schedule_Type
          }(${this.frequency}) -${
        this.selectedAuditType.Audit_Type
      } </strong> audit for <strong>${
        this.selectedModel.Model_Name
      }</strong> from ${start} to ${end}.</p>
          
          <a href="${appUrl}" 
            style="display: inline-block; text-decoration: none; background-color: #28a745; color: white; font-size: 14px; font-weight: bold; padding: 12px 24px; border-radius: 5px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);"
            target="_blank">
            View My Tasks
          </a>
          
          <p>Best regards,<br>
          Audit Notification System</p>
           <p>Note: This is an auto-generated email; please do not reply.</p>
        `;
    } else {
      return `
            <p>Dear ${this.selectedUser.Employee_Name},</p>
            <p>${localStorage.getItem(
              'Name'
            )} has assigned a new task to you.</p>
            <p>You are required to perform a <strong>${
              this.selectedSchedule.Schedule_Type
            }(${this.frequency}) -${
        this.selectedAuditType.Audit_Type
      } </strong> audit for <strong>${
        this.selectedModel.Model_Name
      }</strong>  from ${start} to ${end}.</p>
            
            <a href="${appUrl}" 
              style="display: inline-block; text-decoration: none; background-color: #28a745; color: white; font-size: 14px; font-weight: bold; padding: 12px 24px; border-radius: 5px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);"
              target="_blank">
              View My Tasks
            </a>
            
            <p>Best regards,<br>
            Audit Notification System</p>
             <p>Note: This is an auto-generated email; please do not reply.</p>
          `;
    }
  }
  getEmailSubject() {
    const start = this.datePipe.transform(this.startdate, 'dd-MMM-yyyy');
    const end = this.datePipe.transform(this.enddate, 'dd-MMM-yyyy');
    if (this.modifyFlag && !this.isActive) {
      return `Your Audit Task of ${this.selectedModel.Model_Name} - ${this.selectedAuditType.Audit_Type} has been canceled `;
    }
    if (this.modifyFlag) {
      return `Your ${this.selectedAuditType.Audit_Type} Audit Task Has Been Modified`;
    } else {
      return `New Audit Task : ${this.selectedAuditType.Audit_Type} Audit from ${start} to ${end}.`;
    }
  }

  sendMail() {
    debugger;
    const toEmails = this.selectedUser.Email_Address;

    const mailData = {
      FromEmail: "DIMENSIONModule@mahindra.com",
      ToEmailList: toEmails.split(','),
      Subject: this.getEmailSubject(),
      MessageBody: this.getEmailBody(),
      CcList: [],
      BccList: [],
    };
    this.mail.sendMail(mailData).subscribe((res) => {
      if (res) {
        this.toaster.success(
          'Task mail send to respective auditor',
          ' Mail Send Successful '
        );
      } else {
        this.toaster.error('Error while sending mail ', 'Email Not Send');
      }
    });
  }
  // ********************************** Email Section End *******************************//
}