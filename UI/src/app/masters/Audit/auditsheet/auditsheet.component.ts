import { Component } from '@angular/core';
import { SubmitAuditComponent } from './submit-audit/submit-audit.component';
import { MatDialog } from '@angular/material/dialog';
import { AuditService } from '../audit.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SubmitAudit } from './submit-audit/submit.model';
import { Model } from 'src/app/shared/models/model.model';
import { FormControl } from '@angular/forms';
import { CommonService } from '../../common/common.service';
import { DeletePlanlogComponent } from './delete-planlog/delete-planlog.component';

@Component({
  selector: 'app-auditsheet',
  templateUrl: './auditsheet.component.html',
  styleUrls: ['./auditsheet.component.css'],
})
export class AuditsheetComponent {
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
  isManager: boolean = false;
  searchInput: string = '';
  shopid: any;
  modifyFlag: boolean = false;
  auditdate: any;
  assignedPlanList: any[] = [];
  CompletedPlanList: any[] = [];
  filteredAssignedPlan: any[] = [];
  filteredCompletedPlan: any[] = [];

  inProgressCount: number = 0;

  User_Filters: any[] = [];
  public UserFilter: FormControl = new FormControl();
  selectedUserID: number = 0;
  Timeline_Filters: any[] = [
    {
      ID: 0,
      Name: 'All',
      Selected: true,
    },
    {
      ID: 1,
      Name: 'Over Due',
      Selected: false,
    },
    {
      ID: 2,
      Name: 'Due',
      Selected: false,
    },
    {
      ID: 3,
      Name: 'Up Next',
      Selected: false,
    },
  ];

  // Model
  selectedModel: Model;
  modelList: Model[];

  constructor(
    private dialog: MatDialog,
    private auditService: AuditService,
    private router: Router,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private commonService: CommonService,
  ) {}
  ngOnInit() {
    $('#ngslide').hide();
    $('.sidebar-mini').addClass('sidebar-collapse');
    this.allshops = localStorage.getItem('isallshops') === '1';
    this.plantid = parseInt(localStorage.getItem('plantid'));
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.selectedUserID = this.userid = parseInt(
      localStorage.getItem('userid'),
    );
    this.auditdate = localStorage.getItem('Audit_Date');
    this.hostname = localStorage.getItem('hostname');
    this.shopid = localStorage.getItem('shopid');
    this.isManager = localStorage.getItem('Department_ID') === '2';
    localStorage.removeItem('Audit_Plan_ID');
    localStorage.removeItem('Audit_Plan_Log_ID');
    this.getModelList();
  }

  // ********************************** Model Section Start *******************************//
  getModelList() {
    if (this.shopid) {
      if (!this.modifyFlag) {
        this.selectedModel = null;
        this.modelList = [];
      }
      this.commonService
        .getModelTableData(
          this.plantid,
          this.audittypeid,
          this.shopid,
          this.allshops,
        )
        .subscribe((res) => {
          this.modelList = res;
        });
    }
  }

  selectModel(model: any) {
    if (model) {
      this.selectedModel = model.value;
      this.getAssignedPlan();
      this.getCompletedPlan();
    }
  }
  // ********************************** Model Section End *******************************//
  // ********************************** Get Section Start *******************************//
  getAssignedPlan() {
    this.assignedPlanList = [];
    this.filteredAssignedPlan = [];
    this.inProgressCount = 0;
    this.auditService
      .getAssignedPlan(
        this.plantid,
        this.audittypeid,
        this.selectedModel.Model_ID,
        this.selectedUserID,
      )
      .subscribe((data) => {
        console.log(data);
        this.assignedPlanList = data.sort((a, b) => a.Day_Diff - b.Day_Diff);
        this.filterPendingData();
      });
  }

  getCompletedPlan() {
    this.CompletedPlanList = [];
    this.auditService
      .getCompletedPlan(
        this.plantid,
        this.audittypeid,
        this.selectedModel.Model_ID,
        this.selectedUserID,
      )
      .subscribe((data) => {
        console.log(data);
        this.CompletedPlanList = data.sort(
          (a, b) => b.CompletionDate - a.CompletionDate,
        );
      });
  }

  // ********************************** Filters Section Start *******************************//
  onUserFilterSelect(index: any) {
    this.getAssignedPlan();
    this.getCompletedPlan();
  }

  filterPendingData() {
    const selectedTimelineFilter = this.Timeline_Filters.find(
      (filter) => filter.Selected,
    );

    let filteredPlans = this.assignedPlanList;

    if (selectedTimelineFilter) {
      switch (selectedTimelineFilter.ID) {
        case 1:
          filteredPlans = filteredPlans.filter((plan) => plan.Day_Diff < 0);
          break;
        case 2:
          filteredPlans = filteredPlans.filter(
            (plan) => plan.Day_Diff >= 0 && plan.Day_Diff <= 5,
          );
          break;
        case 3:
          filteredPlans = filteredPlans.filter((plan) => plan.Day_Diff > 5);
          break;
      }
    }

    this.filteredAssignedPlan = filteredPlans;
    this.inProgressCount = filteredPlans.filter((d) => d.VIN_No != null).length;
  }

  filterByTimeLine(index: any) {
    this.Timeline_Filters.forEach((d) => (d.Selected = false));
    this.Timeline_Filters[index.value].Selected = true;
    this.filterPendingData();
  }

  // ********************************** Filters Section End *******************************//
  // ********************************** CRUD Section Start *******************************//
  onCreateAudit(data) {
    console.log(data);
    localStorage.setItem('Audit_Plan_ID', data.Audit_Plan_ID);
    localStorage.setItem('Audit_Plan_Log_ID', data.Audit_Plan_Log_ID);
    localStorage.setItem('Audit_Type', data.Audit_Type_Id);
    localStorage.setItem('Model_ID', data.Model_ID);
    const url = '/configmaster/audit/auditsheet';
    this.router.navigate([url], {
      relativeTo: this.route,
    });
  }
  onSubmit(item: any) {
    debugger;
    const data = {
      Audit_Plan_ID: item.Audit_Plan_ID,
      Audit_Plan_Log_ID: item.Audit_Plan_Log_ID,
      Updated_User_ID: this.userid,
      Updated_Host: this.hostname,
      IS_Audit_Completed: item.IS_Audit_Completed,
      Model_ID: item.Model_ID
    };
    const dialogRef = this.dialog.open(SubmitAuditComponent, {
      data: data,
      width: '250px',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed' + result);
      if (result) {
        console.log(result);
        if (result.submit == 1) {
          this.sendMail(data);
        }
        this.getAssignedPlan();
        this.getCompletedPlan();
      }
    });
  }

  reOpen(plandata) {
    debugger;
    const saveData: SubmitAudit = {
      Status: 0,
      StatusRemark: '',
      Updated_Host: this.hostname,
      Updated_User_ID: this.userid,
    };

    this.auditService
      .updateStatus(
        plandata.Audit_Plan_ID,
        plandata.Audit_Plan_Log_ID,
        saveData,
      )
      .subscribe(
        (data) => {
          if (data.isErrorMessage) {
            this.toaster.error(data.messageDetail, data.messageTitle);
          } else if (data.isSuccessMessage) {
            this.onCreateAudit(plandata);
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
        },
      );
  }

  deletePlanLog(Audit_Plan_Log_ID: number) {
    const dialogRef = this.dialog.open(DeletePlanlogComponent, {
      width: '250px',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed' + result);
      if (result.confirmed) {
        const data = {
          Reason: result.reason,
          Audit_Plan_Log_ID: Audit_Plan_Log_ID,
          Deleted_User_ID: this.userid,
          Deleted_Host: this.hostname,
        };
        this.auditService.deletePlanLog(data).subscribe((res) => {
          if (res !== null && res !== undefined) {
            if (res.isErrorMessage) {
              this.toaster.error(res.messageDetail, res.messageTitle);
            } else if (res.isSuccessMessage) {
              this.getAssignedPlan();
              this.getCompletedPlan();
              this.toaster.success(res.messageDetail, res.messageTitle);
            } else if (res.isAlertMessage) {
              this.toaster.warning(res.messageDetail, res.messageTitle);
            } else {
              this.toaster.error('Something went wrong');
            }
          }
        });
      }
    });
  }
  // ********************************** CRUD Section End *******************************//
  sendMail(data) {
    debugger;
    this.auditService
      .sendAuditMail(data.Audit_Plan_Log_ID, data.Model_ID)
      .subscribe((res) => {

        if (res.isErrorMessage) {
          this.toaster.error(res.messageDetail, res.messageTitle);
        } else if (res.isSuccessMessage) {
          this.toaster.success(res.messageDetail, res.messageTitle);
        } else if (res.isAlertMessage) {
          this.toaster.warning(res.messageDetail, res.messageTitle);
        } else {
          this.toaster.error('Something went wrong');
        }
      });
  }
  daysDiff(days: number) {
    if (days < 0) {
      return 'red';
    }
    if (days >= 0 && days <= 5) {
      return 'orange';
    }
    return '';
  }

  // sendMail(data) {
  //   const mailData = {
  //     Audit_Plan_Log_ID: data.Audit_Plan_Log_ID,
  //     Audit_Type_Id: data.Audit_Type_Id,
  //     VIN_Number: data.VIN_No,
  //     Model_ID: data.Model_ID,
  //     Model_Name: data.Model_Name,
  //     Plant_ID: localStorage.getItem('plantid'),
  //     Audit_Type: data.Audit_Type,
  //     Audit_ID: data.Audit_ID,
  //     Audit_Date: data.Audit_Date,
  //     Total_PIST: data.Total_PIST,
  //     Total_Checked: data.Total_Checked,
  //     Total_OK: data.Gap_Ok,
  //     Total_NOK: data.Gap_Nok,
  //     Total_NA: data.Gap_NA,
  //   }
  //   this.auditService.sendMail(mailData);
  // }
  // daysDiff(days: number) {
  //   if (days < 0) {
  //     return 'red';
  //   }
  //   if (days >= 0 && days <= 5) {
  //     return 'orange';
  //   }
  //   return '';
  // }

  // audittypeid: number;
  // AuditName: string;
  // plantid: number;
  // plantname: string;
  // userid: number;
  // username: string;
  // hostname: string;
  // loading: boolean = false;
  // selectedBIW: any;
  // allshops: boolean;
  // targetDate: any;
  // canCreate: boolean = true;
  // shopid: any;
  // modifyFlag: boolean = false;
  // assignedPlanList: any[] = [];
  // CompletedPlanList: any[] = [];
  // constructor(
  //   private dialog: MatDialog,
  //   private auditService: AuditService,
  //   private router: Router,
  //   private route: ActivatedRoute,
  //   private toaster: ToastrService
  // ) { }
  // ngOnInit() {
  //   $('#ngslide').hide();
  //   this.allshops = localStorage.getItem('isallshops') === '1';
  //   this.plantid = parseInt(localStorage.getItem('plantid'));
  //   this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
  //   this.userid = parseInt(localStorage.getItem('userid'));
  //   this.hostname = localStorage.getItem('hostname');
  //   this.shopid = localStorage.getItem('shopid');
  //   localStorage.removeItem('Audit_Plan_ID');
  //   localStorage.removeItem('Audit_Plan_Log_ID');
  //   localStorage.removeItem('Audit_Type');
  //   this.getAssignedPlan();
  //   this.getCompletedPlan();
  // }
  // // ********************************** Get Section Start *******************************//
  // getAssignedPlan() {
  //   this.auditService
  //     .getAssignedPlan(this.plantid, this.audittypeid, this.shopid, this.userid)
  //     .subscribe((data) => {
  //       console.log(data);
  //       this.assignedPlanList = data.sort((a, b) => a.Day_Diff - b.Day_Diff);
  //     });
  // }

  // getCompletedPlan() {
  //   this.auditService
  //     .getCompletedPlan(
  //       this.plantid,
  //       this.audittypeid,
  //       this.shopid,
  //       this.userid
  //     )
  //     .subscribe((data) => {
  //       console.log(data);
  //       this.CompletedPlanList = data.sort(
  //         (a, b) => b.CompletionDate - a.CompletionDate
  //       );
  //     });
  // }
  // // ********************************** Get Section End *******************************//
  // // ********************************** CRUD Section Start *******************************//
  // onCreateAudit(data) {
  //   console.log(data);
  //   localStorage.setItem('Audit_Plan_ID', data.Audit_Plan_ID);
  //   localStorage.setItem('Audit_Plan_Log_ID', data.Audit_Plan_Log_ID);
  //   localStorage.setItem('Audit_Type', data.Audit_Type_Id);
  //   localStorage.setItem('Model_ID', data.Model_ID);
  //   const url = '/configmaster/audit/auditsheet'
  //   this.router.navigate([url], {
  //     relativeTo: this.route,
  //   });
  // }
  // onSubmit(Plan_ID, Plan_Log_ID, IS_Audit_Completed) {
  //   const data = {
  //     Audit_Plan_ID: Plan_ID,
  //     Audit_Plan_Log_ID: Plan_Log_ID,
  //     Updated_User_ID: this.userid,
  //     Updated_Host: this.hostname,
  //     IS_Audit_Completed: IS_Audit_Completed,
  //   };
  //   const dialogRef = this.dialog.open(SubmitAuditComponent, {
  //     data: data,
  //     width: '250px',
  //     enterAnimationDuration: '0ms',
  //     exitAnimationDuration: '0ms',
  //   });
  //   dialogRef.afterClosed().subscribe((result) => {
  //     console.log('The dialog was closed' + result);
  //     if (result) {
  //       console.log(result);
  //       this.getAssignedPlan();
  //       this.getCompletedPlan();
  //     }
  //   });
  // }

  // reOpen(plandata) {
  //   const saveData: SubmitAudit = {
  //     Status: 0,
  //     StatusRemark: '',
  //     Updated_Host: this.hostname,
  //     Updated_User_ID: this.userid,
  //   };

  //   this.auditService
  //     .updateStatus(
  //       plandata.Audit_Plan_ID,
  //       plandata.Audit_Plan_Log_ID,
  //       saveData
  //     )
  //     .subscribe(
  //       (data) => {
  //         if (data.isErrorMessage) {
  //           this.toaster.error(data.messageDetail, data.messageTitle);
  //         } else if (data.isSuccessMessage) {
  //           this.onCreateAudit(plandata);
  //           this.toaster.success(data.messageDetail, data.messageTitle);
  //         } else if (data.isAlertMessage) {
  //           this.toaster.warning(data.messageDetail, data.messageTitle);
  //         } else {
  //           this.toaster.error('Something went wrong');
  //         }
  //       },
  //       (err) => {
  //         console.log(err);
  //         this.toaster.error(err);
  //       }
  //     );
  // }
  // // ********************************** CRUD Section End *******************************//
  // daysDiff(days: number) {
  //   if (days < 0) {
  //     return 'red';
  //   }
  //   if (days >= 0 && days <= 5) {
  //     return 'orange';
  //   }
  //   return '';
  // }
  // trackByFn(index, item) {
  //   console.log('TrackBy:', item.Audit_Plan_Log_ID, 'at index', index);
  //   return item.Audit_Plan_Log_ID;
  // }
}
