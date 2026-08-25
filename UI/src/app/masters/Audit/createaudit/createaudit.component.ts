declare var $: any;
import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Color } from 'exceljs';
import { ToastrService } from 'ngx-toastr';
import { BuildPhase } from 'src/app/shared/models/buildphase.model';
import { Employee } from 'src/app/shared/models/employee.model';
import { Model } from 'src/app/shared/models/model.model';
import { Shift } from 'src/app/shared/models/shift.model';
import { User } from 'src/app/shared/models/user.model';
import { CommonService } from '../../common/common.service';
import { AuditType } from 'src/app/shared/models/audittype.model';
import { AuditService } from '../audit.service';
import { Audit } from 'src/app/shared/models/audit.model';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-createaudit',
  templateUrl: './createaudit.component.html',
  styleUrls: ['./createaudit.component.css'],
})
export class CreateauditComponent {
  // ************************************Declaration  Section Start **************************************//
  audittypeid: number;
  AuditName: string;
  plantid: number;
  plantname: string;
  shopid: number;
  userid: number;
  hostname: string;
  userObj: User;
  isTCF: boolean;
  createauditform: FormGroup;
  disabled = true;
  selectedForDelete: number;
  Audit_ID: number;
  BIWNo: string;
  VINNO: string;
  isModify: boolean = false;
  tabledata: Audit[];
  modellist: Model[];
  Buildphaselist: BuildPhase[];
  Colorlist: Color[];
  emplist: Employee[];
  audittypelist: AuditType[];
  shiftlist: Shift[];
  vehicletypelist: any[] = [
    { id: 1, name: 'RHD' },
    { id: 2, name: 'LHD' },
  ];
  data: any;

  loading: boolean = false;
  loadingTable: boolean = false;
  // other
  allshops: boolean;
  canCreate: boolean = true;

  // Plan
  Audit_Plan_Log_ID: number = 0;
  Audit_Plan_ID: number = 0;
  Model_ID: number = 0;
  constructor(
    private commonService: CommonService,
    private router: Router,
    private _toastr: ToastrService,
    private ngZone: NgZone,
    private auditService: AuditService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private cdref: ChangeDetectorRef
  ) {
    this.createauditform = new FormGroup({
      biwno: new FormControl(null, [Validators.required]),
      vinno: new FormControl(null),
      auditdate: new FormControl('', [Validators.required]),
      model: new FormControl(null, [Validators.required]),
      vehiclemodel: new FormControl(null, [Validators.required]),
      variant: new FormControl(null),
      buildphase: new FormControl(null, [Validators.required]),
      color: new FormControl(null),
      auditor1: new FormControl(null),
      auditor2: new FormControl(null),
      vehicletype: new FormControl(null),
      audittype: new FormControl(null),
      // shift: new FormControl(null),
    });
  }
  ngOnInit() {
    $('#ngslide').hide();
    this.plantid = parseInt(localStorage.getItem('plantid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false`
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.userid = parseInt(localStorage.getItem('userid'));
    this.hostname = localStorage.getItem('hostname');
    this.Audit_Plan_ID = parseInt(localStorage.getItem('Audit_Plan_ID'));
    this.Audit_Plan_Log_ID = parseInt(localStorage.getItem('Audit_Plan_Log_ID'));
    this.Model_ID = parseInt(localStorage.getItem('Model_ID'));
    this.commonService.getEmployeeDetails().subscribe((data) => {
      this.userObj = data;

    });

    if (this.plantid) {
      this.getRequired();
    } else {
      this.router.navigate(['']);
    }

    if (!this.audittypeid) {
      this.router.navigate(['/NotAccess']);
      this._toastr.error('Audit Type Not Found');
    }
    this.setdefaultValues();
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
    this.cdref.detectChanges();
  }
  // ************************************Declaration  Section End **************************************//

  // ************************************Selection Section Start **************************************//
  onVinChange() {
    this.VINNO = this.createauditform.get('vinno').value;
    this.refresh();
    if (this.VINNO?.length == 17 || this.VINNO?.length == 8) {
      const isexist = this.tabledata.find((data) => data.VIN_No == this.VINNO);
      if (isexist) {
        this.loading = false;
        $('#existvin').click();
      } else {
        this.loading = true;
        this.auditService.GetAllDataFromVIN(this.VINNO, 0).subscribe(
          (data) => {
            this.loading = false;
            if (data.length > 0) {
              data = data[0];
              this.data = data;
              this.createauditform.patchValue({
                biwno: data.BIW_No,
                vinno: data.VIN_Number,
                model: data.Model_Description,
                variant: data.Variant_Name,
                color: data.Color_Name,
                vehiclemodel: this.Model_ID
              });
              this.setdefaultValues();
              this.getModel();

            } else {
              this._toastr.error(
                'VIN No - ' + this.VINNO + ' Is not available in DRONA'
              );
            }
          },
          (err) => {
            this._toastr.error(
              'VIN No - ' +
              this.VINNO +
              ' Is not available in DRONA or Something went wrong'
            );
            this.loading = false;
          }
        );
      }
    }
  }
  onBIWChange() {
    this.BIWNo = this.createauditform.get('biwno').value;
    if (this.BIWNo?.length > 0) {
      this.loading = true;
      const isexist = this.tabledata.find((data) => data.Body_No == this.BIWNo);
      if (isexist) {
        this.loading = false;
        $('#existbiw').click();
      } else {
        this.auditService.GetAllDataFromBIW(0, this.BIWNo).subscribe(
          (data) => {
            if (data.length > 0 && data != null) {
              data = data[0];
              this.data = data;
              this.createauditform.patchValue({
                biwno: data.BIW_No,
                vinno: data.VIN_Number ? data.VIN_Number : '',
                model: data.Model_Description,
                variant: data.Variant_Name,
                color: data.Color_Name,
                vehiclemodel: this.Model_ID
              });
              this.setdefaultValues();
              this.getModel();
              this.loading = false;
            } else {
              this._toastr.error(
                'BIW No - ' + this.BIWNo + ' Is not available in DRONA'
              );
            }
          },
          (err) => {
            this._toastr.error(
              'BIW No - ' +
              this.BIWNo +
              ' Is not available in DRONA or Something went wrong'
            );
            this.loading = false;
          }
        );
      }
    }
  }
  onSelectModel(modelid) {
    if (modelid) {
      const temp = this.modellist.find(
        (model) => model.Model_ID == modelid
      );
      this.createauditform.get('vehicletype').setValue(temp.Vehicle_Type);
    }
  }
  // ************************************ Selection Section End **************************************//

  // ************************************ Get Data Section Start **************************************//
  getRequired() {
    this.getBuildPhase();
    this.getEmployee();
    this.getAuditType();
    // this.getShift();
    this.getTableData();
  }
  getModel() {
    this.commonService
      .getModelTableData(
        this.plantid,
        this.audittypeid,
        this.userObj.Shop_ID,
        this.allshops
      )
      .subscribe((res) => {
        this.modellist = res;
        this.onSelectModel(this.Model_ID)
      });
  }

  // getVariant(modelid) {
  //   this.commonService.getVariantList(modelid).subscribe((data) => {
  //     console.log(data);
  //     this.variantlist = data;
  //   });
  // }

  getBuildPhase() {
    this.commonService
      .getBuildphaseTableData(this.plantid)
      .subscribe((data) => {
        // console.log(data);
        if (data) {
          this.Buildphaselist = data;
          this.createauditform
            .get('buildphase')
            .setValue(data[0].Build_Phase_ID);
        }
      });
  }
  getEmployee() {
    if (this.plantid) {
      this.commonService
        .getEmployeeList(this.plantid, this.audittypeid)
        .subscribe((data) => {
          this.emplist = data;
        });
    }
  }
  getAuditType() {
    this.commonService.getAuditTypeList().subscribe((data) => {
      this.audittypelist = data;
      this.AuditName = this.audittypelist.find(
        (a) => a.Audit_Type_Id == this.audittypeid
      ).Audit_Type;

      if (
        this.AuditName.toLowerCase() == '1d tcf' ||
        this.AuditName.toLowerCase() == '1d-tcf'
      ) {
        this.isTCF = true;
        this.createauditform.get('biwno').disable();
      } else {
        this.createauditform.get('vinno').disable();
      }
    });
  }

  // getShift() {
  //   this.commonService.getShift(this.plantid, this.shopid).subscribe((data) => {
  //     this.shiftlist = data;
  //   });
  // }

  // ************************************ Get Data Section End **************************************//
  // ************************************ Save , Update , Delete Section Start *****************************//

  onSave() {
    if (
      (!this.createauditform.get('biwno').value ||
        this.createauditform.get('biwno').value == '') &&
      !this.isTCF
    ) {
      this._toastr.warning('Please Enter BIW No. ');
      return;
    }
    if (
      (!this.createauditform.get('vinno').value ||
        this.createauditform.get('vinno').value == '') &&
      this.isTCF
    ) {
      this._toastr.warning('Please Enter VIN No. ');
      return;
    }
    if (!this.createauditform.get('model').value) {
      this._toastr.warning("Model Can't be empty. ");
      return;
    }

    if (!this.Model_ID) {
      this._toastr.warning('Please select Vehicle Model. ');
      return;
    }

    if (!this.createauditform.get('buildphase').value) {
      this._toastr.warning('Please Select Build phase. ');
      return;
    }

    // if (!this.createauditform.get('shift').value) {
    //   this._toastr.warning('Please Select shift. ');
    //   return;
    // }

    if (this.isModify) {
      this.updateRecord();
    } else {
      if (this.createauditform.valid) {
        const temp: Audit = {
          Audit_Type_Id: this.audittypeid,
          Plant_ID: this.plantid,
          Shop_ID: this.modellist.find((m) => m.Model_ID === this.Model_ID).Shop_ID,
          Updated_User_ID: this.userid,
          Updated_Host: this.hostname,
          Body_No: this.createauditform.get('biwno').value
            ? this.createauditform.get('biwno').value
            : null,
          VIN_No: this.createauditform.get('vinno').value
            ? this.createauditform.get('vinno').value
            : null,
          Model_Name: this.createauditform.get('model').value,
          Variant_Name: this.createauditform.get('variant').value,
          Model_ID: this.Model_ID,
          Build_Phase_ID: this.createauditform.get('buildphase').value,
          Auditor1_ID: this.createauditform.get('auditor1').value,
          Auditor2_ID: this.createauditform.get('auditor2').value,
          // Shift_ID: this.createauditform.get('shift').value,
          Audit_Date: this.createauditform.get('auditdate').value,
          Active: true,
          Is_Edited: false,
          Model_Code: this.data.Model_Code,
          Color_Name: this.createauditform.get('color').value,
          Plant_Code: localStorage.getItem('Plant_Code'),
          Audit_Plan_ID: this.Audit_Plan_ID,
          Audit_Plan_Log_ID: this.Audit_Plan_Log_ID
        };
        this.auditService.saveAudit(temp).subscribe(
          (data) => {
            debugger;
            if (data !== null && data !== undefined) {
              if (data.isErrorMessage) {
                this._toastr.error(data.IsMassege, data.IsTitle);
              } else if (data.isSuccessMessage || data.IsSuccessAlert) {
                sessionStorage.setItem(
                  'vinno',
                  this.createauditform.get('vinno').value
                );
                sessionStorage.setItem(
                  'biwno',
                  this.createauditform.get('biwno').value
                );
                this.refresh();
                this._toastr.success(data.IsMassege, data.IsTitle);

                this.router.navigate(['/configmaster/audit/writeupsheet'], {
                  relativeTo: this.route,
                });
              } else if (data.isAlertMessage || data.IsErrorAlertDuplicate) {
                this._toastr.warning(data.IsMassege, data.IsTitle);
              }
            }
          }
          // (err) => {
          //   this._toastr.error('Opps !!! Something went wrong ...');
          //   debugger;
          // }
        );
      } else {
        this._toastr.error('Please fill Required Values.');
      }
    }
  }

  modifySelected(auditid) {
    if (auditid) {
      this.auditService.getDataByAuditID(auditid).subscribe((data: Audit) => {
        if (data) {
          data = data[0];
          this.Audit_ID = data.Audit_ID;
          this.createauditform.get('biwno').setValue(data.Body_No);
          this.createauditform.get('vinno').setValue(data.VIN_No);
          this.createauditform.get('auditdate').setValue(data.Audit_Date);
          this.createauditform.get('model').setValue(data.Model_Name);
          this.createauditform.get('variant').setValue(data.Variant_Name);
          this.createauditform.get('vehiclemodel').setValue(data.Model_ID);
          this.createauditform.get('buildphase').setValue(data.Build_Phase_ID);
          this.createauditform.get('color').setValue(data.Color_Name);
          this.createauditform.get('auditor1').setValue(data.Auditor1_ID);
          this.createauditform.get('auditor2').setValue(data.Auditor2_ID);
          this.createauditform.get('audittype').setValue(data.Audit_Type_Id);
          this.isModify = true;
          this.createauditform.get('biwno').disable();
          this.createauditform.get('vinno').disable();
          this.createauditform.get('auditdate').disable();
          this.createauditform.get('model').disable();
          this.createauditform.get('variant').disable();
          this.createauditform.get('color').disable();
          this.createauditform.get('vehicletype').disable();
          if (this.modellist?.length > 0) {
            const temp = this.modellist.find(
              (model) => model.Model_ID == data.Model_ID
            );
            this.createauditform.get('vehicletype').setValue(temp.Vehicle_Type);
          } else {
            this.getModel();
          }
        } else {
          this._toastr.error('Something went wrong...');
        }
      });
    }
  }

  updateRecord() {
    if (this.createauditform.valid) {
      const temp: Audit = {
        Audit_ID: this.Audit_ID,
        Audit_Type_Id: this.audittypeid,
        Plant_ID: this.plantid,
        Shop_ID: this.modellist.find((m) => m.Model_ID === this.Model_ID).Shop_ID,
        Updated_User_ID: this.userid,
        Updated_Host: this.hostname,
        Body_No: this.createauditform.get('biwno').value,
        VIN_No: this.createauditform.get('vinno').value
          ? this.createauditform.get('vinno').value
          : 0,
        Model_Name: this.createauditform.get('model').value,
        Variant_Name: this.createauditform.get('variant').value,
        Model_ID: this.Model_ID,
        Build_Phase_ID: this.createauditform.get('buildphase').value,
        Color_Name: this.createauditform.get('color').value
          ? this.createauditform.get('color').value
          : '',
        Auditor1_ID: this.createauditform.get('auditor1').value,
        Auditor2_ID: this.createauditform.get('auditor2').value,
        // Shift_ID: this.createauditform.get('shift').value,
        Audit_Date: this.createauditform.get('auditdate').value,
        Plant_Code: localStorage.getItem('Plant_Code'),
        Audit_Plan_ID: this.Audit_Plan_ID,
        Audit_Plan_Log_ID: this.Audit_Plan_Log_ID
      };
      this.auditService.updateAudit(temp, this.Audit_ID).subscribe(
        (data) => {
          debugger;

          if (data !== null && data !== undefined) {
            if (data.isErrorMessage || data.IsErrorAlertNotFound) {
              this._toastr.error(data.IsMassege, data.IsTitle);
            } else if (data.isSuccessMessage || data.IsSuccessAlert) {
              sessionStorage.setItem(
                'vinno',
                this.createauditform.get('vinno').value
              );
              sessionStorage.setItem(
                'biwno',
                this.createauditform.get('biwno').value
              );
              this.refresh();
              this._toastr.success(data.IsMassege, data.IsTitle);
              this.router.navigate(['/configmaster/audit/writeupsheet'], {
                relativeTo: this.route,
              });
            } else if (data.isAlertMessage || data.IsErrorAlertDuplicate) {
              this._toastr.warning(data.IsMassege, data.IsTitle);
            }
          }
        },
        (err) => {
          debugger;
          this._toastr.error('Opps !!! Something went wrong ...');
        }
      );
    } else {
      this._toastr.error('Please fill Required Values.');
    }
  }

  confirmDeleteAudit() {
    this.ngZone.run(() => {
      const dialogRef = this.dialog.open(DeletePopupComponent, {
        width: '250px',
        enterAnimationDuration: '0ms',
        exitAnimationDuration: '0ms',
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log('The dialog was closed' + result);
        if (result) {
          this.selectedForDelete = this.Audit_ID;
          this.DeleteRecord();
        }
      });
    });
  }
  DeleteRecord() {
    if (this.selectedForDelete) {
      this.auditService
        .deleteFullAudit(this.selectedForDelete)
        .subscribe((data) => {
          if (data == null || data == undefined || data == '') {
            this._toastr.error(
              'Can not delete  Record  ',
              'Unable to Connect to server! '
            );
          } else if (
            data.isErrorMessage ||
            data.IsErrorAlertNotFound ||
            data.IsErrorAlert ||
            data.IsErrorAlertRef
          ) {
            this._toastr.error(data.IsMassege, data.IsTitle);
          } else if (data.IsSuccessAlert) {
            this.refresh();
            this._toastr.success(data.IsMassege, data.IsTitle);
          } else if (data.isAlertMessage) {
            this._toastr.warning(data.IsMassege, data.IsTitle);
          }
        });
    }
  }

  closeDeleteRecord() {
    this.selectedForDelete = 0;
    $('.close').click();
  }
  // ************************************ Save , Update , Delete Section End **************************************//
  // ************************************ Other Section Start **************************************//
  setdefaultValues() {
    this.createauditform.get('audittype').setValue(this.audittypeid);

    this.createauditform.get('auditdate').setValue(new Date());
    console.log(this.createauditform.get('auditdate').value);
    this.createauditform.get('auditor1').setValue(this.userid);
    this.createauditform.get('auditdate').disable();
    this.createauditform.get('audittype').disable();
    this.createauditform.get('variant').disable();
    this.createauditform.get('model').disable();
    this.createauditform.get('color').disable();
    this.createauditform.get('vehicletype').disable();
    this.createauditform.get('vehiclemodel').disable();
    if (this.Buildphaselist && this.Buildphaselist.length > 0) {
      this.createauditform
        .get('buildphase')
        .setValue(this.Buildphaselist[0]?.Build_Phase_ID);
    }

    if (this.isTCF) {
      this.createauditform.get('vinno').enable();
      this.createauditform.get('biwno').disable();
    } else {
      this.createauditform.get('biwno').enable();
      // this.createauditform.get('vinno').disable();
    }

  }
  refresh() {
    this.createauditform.reset();
    this.setdefaultValues();
    this.Audit_ID = null;
    this.selectedForDelete = null;
    if (this.isModify) {
      this.isModify = false;
    }
    this.getTableData();
    if (this.isTCF) {
      this.createauditform.get('vinno').enable();
      this.createauditform.get('biwno').disable();
    } else {
      this.createauditform.get('biwno').enable();
      this.createauditform.get('vinno').disable();
    }

  }

  continue() {
    sessionStorage.setItem(
      'vinno',
      this.createauditform.get('vinno').value
    );
    sessionStorage.setItem(
      'biwno',
      this.createauditform.get('biwno').value
    );
    this.router.navigate(['/configmaster/audit/writeupsheet'], {
      relativeTo: this.route,
    });
  }
  exit() {
    // this.router.navigate(['/configmaster']);
    this.router.navigate(['/configmaster/audit/createaudit'], {
      relativeTo: this.route,
    });
  }

  // ************************************ Other Section End **************************************//
  // ************************************ Table Section Start **************************************//
  getTableData() {
    this.auditService.getRecordsByPlan(this.Audit_Plan_ID, this.Audit_Plan_Log_ID).subscribe((data) => {
      if (data) {
        this.tabledata = data;
        if (data.length > 0) {
          this.modifySelected(data[0].Audit_ID);
        }
      }
    })
    // this.loadingTable = true;
    // if (this.plantid) {
    //   this.auditService
    //     .getAuditTableData(
    //       this.plantid,
    //       this.audittypeid,
    //       this.shopid,
    //       this.allshops
    //     )
    //     .subscribe((data) => {
    //       this.tabledata = data;
    //       this.LoadAuditTable(data);
    //       this.loadingTable = false;
    //     });
    // }
  }

  // LoadAuditTable(jsondatas) {
  //   if (<any>$.fn.DataTable.isDataTable('#AuditTable')) {
  //     $('#AuditTable').dataTable().fnDestroy();
  //   }
  //   if (this.isTCF) {
  //     <any>$('#AuditTable').DataTable({
  //       destroy: true,
  //       lengthMenu: [
  //         [-1, 50, 25, 10, 5],
  //         ['All', 50, 25, 10, 5],
  //       ],
  //       data: jsondatas,
  //       columnDefs: [
  //         { title: 'Vin No', targets: 0 },
  //         { title: 'BIW No.', targets: 1 },
  //         { title: 'Audit Date', targets: 2 },
  //         { title: 'Model', targets: 3 },
  //         { title: 'Action', targets: 4 },
  //       ],

  //       columns: [
  //         { data: 'VIN_No' },
  //         { data: 'Body_No' },
  //         {
  //           data: 'Audit_Date',
  //           render: function (data, type, row) {
  //             if (type === 'display' || type === 'filter') {
  //               const date = new Date(data);
  //               const day = date.getDate().toString().padStart(2, '0');
  //               const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //               const year = date.getFullYear();
  //               return `${day}/${month}/${year}`;
  //             }
  //             return data;
  //           },
  //         },
  //         { data: 'Model_Code' },

  //         {
  //           data: null,
  //           render: function (data, type, row) {
  //             return ` 
  //        <span id="modifyaudit" class="btn fa fa-pencil" data-toggle="modal" title="Edit" 
  //                data-target="#mymodal" style="border-radius: 50%!important;
  //                background-color: #0b9494;
  //                color: black;"
  //                data-elemnt-obj="${data.Audit_ID}"></span>  
  //       <span id="deleteaudit" class="btn fa fa-trash-o deletebutton" style="border-radius: 50%!important;
  //       background-color: #0b9494;
  //       color: black!important;" title = "Delete" 
  //                data-element-id="${data.Audit_ID}"></span> `;
  //           },
  //           createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
  //             // Add an event listener for the "Edit" button
  //             $(cell).on('click', '#modifyaudit', () => {
  //               this.ngZone.run(() => {
  //                 this.modifySelected(rowData.Audit_ID);
  //               });
  //             });

  //             $(cell).on('click', '#deleteaudit', () => {
  //               this.ngZone.run(() => {
  //                 // this.DeleteRecord();
  //                 const dialogRef = this.dialog.open(DeletePopupComponent, {
  //                   width: '250px',
  //                   enterAnimationDuration: '0ms',
  //                   exitAnimationDuration: '0ms',
  //                 });
  //                 dialogRef.afterClosed().subscribe((result) => {
  //                   console.log('The dialog was closed' + result);
  //                   if (result) {
  //                     this.selectedForDelete = rowData.Audit_ID;
  //                     this.DeleteRecord();
  //                   }
  //                 });
  //               });
  //             });
  //           },
  //         },
  //       ],
  //       ordering: false, // Disable sorting
  //     });
  //   } else {
  //     <any>$('#AuditTable').DataTable({
  //       destroy: true,
  //       lengthMenu: [
  //         [-1, 50, 25, 10, 5],
  //         ['All', 50, 25, 10, 5],
  //       ],
  //       data: jsondatas,
  //       columnDefs: [
  //         { title: 'BIW No.', targets: 0 },
  //         { title: 'Vin No', targets: 1 },
  //         { title: 'Audit Date', targets: 2 },
  //         { title: 'Model', targets: 3 },
  //         { title: 'Overall PIST', targets: 4 },
  //         { title: 'Gap PIST', targets: 5 },
  //         { title: 'Flushness PIST', targets: 6 },
  //         { title: 'Action', targets: 7 },
  //       ],

  //       columns: [
  //         { data: 'Body_No' },
  //         { data: 'VIN_No' },
  //         {
  //           data: 'Audit_Date',
  //           render: function (data, type, row) {
  //             if (type === 'display' || type === 'filter') {
  //               const date = new Date(data);
  //               const day = date.getDate().toString().padStart(2, '0');
  //               const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //               const year = date.getFullYear();
  //               return `${day}/${month}/${year}`;
  //             }
  //             return data;
  //           },
  //         },
  //         { data: 'Model_Code' },
  //         { data: 'Total_PIST' },
  //         { data: 'Gap_PIST' },
  //         { data: 'Flush_PIST' },

  //         {
  //           data: null,
  //           render: function (data, type, row) {
  //             return ` 
  //            <span id="modifyaudit" class="btn fa fa-pencil" data-toggle="modal" title="Edit" 
  //                    data-target="#mymodal" style="border-radius: 50%!important;
  //                    background-color: #0b9494;
  //                    color: black;"
  //                    data-elemnt-obj="${data.Audit_ID}"></span>  
  //           <span id="deleteaudit" class="btn fa fa-trash-o deletebutton" style="border-radius: 50%!important;
  //           background-color: #0b9494;
  //           color: black!important;" title = "Delete" 
  //                    data-element-id="${data.Audit_ID}"></span> `;
  //           },
  //           createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
  //             $(cell).on('click', '#modifyaudit', () => {
  //               this.ngZone.run(() => {
  //                 this.modifySelected(rowData.Audit_ID);
  //               });
  //             });

  //             $(cell).on('click', '#deleteaudit', () => {
  //               this.ngZone.run(() => {
  //                 const dialogRef = this.dialog.open(DeletePopupComponent, {
  //                   width: '250px',
  //                   enterAnimationDuration: '0ms',
  //                   exitAnimationDuration: '0ms',
  //                 });
  //                 dialogRef.afterClosed().subscribe((result) => {
  //                   console.log('The dialog was closed' + result);
  //                   if (result) {
  //                     this.selectedForDelete = rowData.Audit_ID;
  //                     this.DeleteRecord();
  //                   }
  //                 });
  //               });
  //             });
  //           },
  //         },
  //       ],
  //       ordering: false, // Disable sorting
  //     });
  //   }
  // }
  // ************************************ Table Section End **************************************//
  closeAlredyExist() {
    $('.close').click();
    this.refresh();
    $('body').animate({ scrollTop: 0 }, 'slow');
    $('#biwno').focus();
  }
}
