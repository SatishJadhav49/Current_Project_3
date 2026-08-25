import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { plant } from 'src/app/shared/models/plant.model';
import { CommonService } from '../common.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { BuildPhase } from 'src/app/shared/models/buildphase.model';
declare var $: any;

@Component({
  selector: 'app-buildphasemaster',
  templateUrl: './buildphasemaster.component.html',
  styleUrls: ['./buildphasemaster.component.css'],
})
export class BuildphasemasterComponent {
  buildphasemasterForm: FormGroup;
  showtable: boolean;
  show_table: boolean;

  plantnameobj: plant;
  buildphasemodel = new BuildPhase();
  buildphaselist: BuildPhase[] = new Array();
  selectedPlantID: number;
  selectedName: string;
  selectedbuilddesc: string;
  modify: boolean;
  deleteid: any;
  selectid: any;
  duplicatename: string;
  duplicatedesc: string;
  duplicate: boolean;
  duplicateplantname: any;
  duplicateplantid: number;
  editData: BuildPhase;
  link: string;
  PlantID: number;
  seletedForDelete: number;
  splitValue: any;
  selectedvalue: any;
  RoleName: string;
  userid: number;
  hostname: string;
  auditypeid: number;
  loading: boolean = true;
  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private _toastr: ToastrService,
    private ngZone: NgZone,
    private dialog: MatDialog,
    private cdref: ChangeDetectorRef
  ) {
    this.buildphasemasterForm = new FormGroup({
      buildname: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9-_ ]+$'),
        Validators.minLength(2),
        Validators.maxLength(30),
      ]),
      builddesc: new FormControl(null, [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9-_ ]+$'),
        Validators.minLength(2),
        Validators.maxLength(30),
      ]),
    });
  }

  ngOnInit() {
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    let currentUrl = this.router.url;
    this.userid = this.commonService.getUserID();
    this.hostname = this.commonService.getHostData();
    this.auditypeid = this.commonService.getAuditType();
    this.splitValue = currentUrl.split('/');
    this.selectedvalue = this.splitValue[2];
    $('#ngslide').hide();
    this.show_table = true;
    this.showtable = true;

    this.link = 'configmaster/buildphasemaster';

    this.getplantID();
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

  DeleteRecord() {
    debugger;
    var myVal = this.seletedForDelete;
    if (myVal > 0) {
      this.deleteSelected(this.seletedForDelete);
      $('.close').click();
      this.seletedForDelete = 0;
    }
  }
  closeDeleteRecord() {
    this.seletedForDelete = 0;
    $('.close').click();
  }

  getplantID() {
    this.PlantID = parseInt(localStorage.getItem('plantid'));
    this.bindmodel();
  }

  LoadCurrentReport(
    jsondatas //this method call after update,delete and add record ?.
  ) {
    // this.RoleName =(localStorage.getItem('rolename'));

    debugger;

    if (<any>$.fn.DataTable.isDataTable('#buildphasemaster')) {
      $('#buildphasemaster').dataTable().fnDestroy();
    }

    <any>$('#buildphasemaster').DataTable({
      destroy: true,

      lengthMenu: [
        [-1, 50, 25, 10, 5],
        ['All', 50, 25, 10, 5],
      ],

      data: jsondatas,

      columnDefs: [
        { title: 'Build Name', targets: 0 },

        { title: 'Build Description', targets: 1 },

        { title: 'Action', targets: 2 },
      ],

      columns: [
        { data: 'Build_Phase_Name' },

        { data: 'Build_Phase_Description' },
        {
          data: null,
          render: function (data, type, row) {
            const canUpdate = localStorage.getItem('canUpdate') === '1'; //1=true
            const canDelete = localStorage.getItem('canDelete') === '1';

            const editButton = `
              <span id="modifyebtn" class="btn fa fa-pencil modifycheckBtn modifybtn" data-toggle="modal" title="Edit"
                style="border-radius: 50%!important; background-color: #0b9494; color: black;"
                data-target="#mymodal" data-element-obj="${data.Build_Phase_ID}"></span>`;

            const deleteButton = `
              <span id="deletebtn" class="btn fa fa-trash deletebutton deletesbtn" title="Delete"
                style="border-radius: 50%!important; background-color: #0b9494; color: black!important;"
                data-element-id="${data.Build_Phase_ID}"></span>`;

            if (canUpdate && canDelete) {
              return `${editButton}${deleteButton}`;
            } else if (canUpdate) {
              return editButton;
            } else if (canDelete) {
              return deleteButton;
            }

            return '';
          },
          createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
            // Add an event listener for the "Edit" button
            $(cell).on('click', '#modifyebtn', () => {
              this.ngZone.run(() => {
                this.modifySelected(rowData.Build_Phase_ID);
              });
            });
            $(cell).on('click', '#deletebtn', () => {
              this.ngZone.run(() => {
                const dialogRef = this.dialog.open(DeletePopupComponent, {
                  width: '250px',
                  enterAnimationDuration: '0ms',
                  exitAnimationDuration: '0ms',
                });
                dialogRef.afterClosed().subscribe((result) => {
                  console.log('The dialog was closed' + result);
                  if (result) {
                    this.seletedForDelete = rowData.Build_Phase_ID;
                    this.DeleteRecord();
                  }
                });
              });
            });
          },
        },
      ],
    });
  }
  onDropdownChange(e) {
    if (e) {
      this.selectedPlantID = e;
    }
  }
  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }
  refresh() {
    this.buildphasemasterForm.reset();
    this.bindmodel();
    this.duplicate = null;
    this.modify = null;
    this.getplantID();
  }
  checkDuplicate() {
    this.duplicate = false;
    this.duplicatename = this.buildphasemasterForm.get('buildname').value;
    this.duplicateplantid = this.selectedPlantID;
    this.buildphaselist.forEach((item) => {
      debugger;
      if (
        item.Build_Phase_Name.toLowerCase() ==
        this.duplicatename.toLowerCase() &&
        item.Plant_ID == this.PlantID &&
        item.Build_Phase_ID != this.selectid
      ) {
        {
          //this.refresh();
          this.duplicate = true;
          this._toastr.error(
            'Duplicate record found',
            'Record is Already Existed'
          );
        }
      }
    });
  }
  onSave() {
    if (this.buildphasemasterForm.invalid) {
      this._toastr.error('All fields are required...');
    } else {
      if (this.modify === true) {
        this.checkDuplicate();
        if (this.duplicate === false) {
          this.buildphasemodel = new BuildPhase();
          this.buildphasemodel.Build_Phase_ID = this.selectid;
          this.buildphasemodel.Build_Phase_Name = this.selectedName;
          this.buildphasemodel.Build_Phase_Description = this.selectedbuilddesc;
          this.buildphasemodel.Plant_ID = this.selectedPlantID;
          this.buildphasemodel.Updated_User_ID = this.userid;
          this.buildphasemodel.Updated_Host = this.hostname;
          this.buildphasemodel.Audit_Type_Id = this.auditypeid;
          this.buildphasemodel.Plant_Code = localStorage.getItem('Plant_Code')
          this.commonService
            .updateBuildphase(this.selectid, this.buildphasemodel)
            .subscribe((data) => {
              this.buildphasemodel = data;

              if (data.IsSuccessAlert) {
                this.refresh();
                this._toastr.success(data.IsMassege, data.IsTitle);
              } else if (data.IsErrorAlert) {
                this._toastr.error(data.IsTitle);
              } else if (data.isExceptionMessage) {
                this._toastr.error(data.IsMassege);
              } else if (data.isExceptionMessage) {
                this._toastr.error(data.IsMassege);
              } else if (data.IsErrorAlertDuplicate) {
                this._toastr.warning(data.IsTitle);
              }
              //   this._toastr.success(
              //   'Record Modify successfully !',
              //   'Modify Record Success '
              // );
            });
        }
      } else {
        debugger;
        this.checkDuplicate();
        if (this.duplicate === false) {
          this.buildphasemodel = new BuildPhase();
          this.buildphasemodel.Plant_ID = this.PlantID;
          this.buildphasemodel.Inserted_User_ID = this.userid;
          this.buildphasemodel.Inserted_Host = this.hostname;
          this.buildphasemodel.Audit_Type_Id = this.auditypeid;
          this.buildphasemodel.Build_Phase_Name =
            this.buildphasemasterForm.get('buildname').value;
          this.buildphasemodel.Build_Phase_Description =
            this.buildphasemasterForm.get('builddesc').value;
          this.buildphasemodel.Plant_Code = localStorage.getItem('Plant_Code')
          this.commonService
            .saveBuildphase(this.buildphasemodel)
            .subscribe((data) => {
              debugger;
              this.buildphasemodel = data;
              if (data.IsSuccessAlert) {
                this.refresh();
                this._toastr.success(data.IsTitle, data.IsMassege);
              } else if (data.IsErrorAlertDuplicate) {
                this._toastr.error(data.IsTitle, data.IsMassege);
              } else if (data.isExceptionMessage) {
                this._toastr.error(data.IsMassege);
              } else if (data.isErrorDbupdate) {
                this._toastr.error(data.IsMassege);
              }
            });
        }
      }
    }
  }
  modifySelected(id) {
    this.modify = true;
    this.editData = new BuildPhase();
    this.editData = this.buildphaselist.find((b) => b.Build_Phase_ID == id);
    this.selectid = this.editData.Build_Phase_ID;
    this.selectedName = this.editData.Build_Phase_Name;
    this.selectedbuilddesc = this.editData.Build_Phase_Description;
    this.selectedPlantID = this.editData.Plant_ID;
  }
  deleteSelected(id) {
    this.deleteid = id;
    this.commonService.deleteBuildphase(this.deleteid).subscribe((data) => {
      this.buildphasemodel = data;
      if (data.IsErrorAlertNotFound) {
        this._toastr.warning(data.IsTitle);
      } else if (data.IsErrorAlert) {
        this.refresh();
        this._toastr.error(data.IsMassege, data.IsTitle);
      } else if (data.IsErrorAlertRef) {
        this._toastr.warning(data.IsMassege, data.IsTitle);
      }
    });
  }
  bindmodel() {
    this.loading = true;
    this.commonService
      .getBuildphaseTableData(this.PlantID)
      .subscribe((data) => {
        this.buildphaselist = data;
        this.LoadCurrentReport(this.buildphaselist);
        this.loading = false;
      });
  }
}
