import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  NgZone,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RoleList } from 'src/app/shared/models/rolelist.model';
import { User } from 'src/app/shared/models/user.model';
import { Userrole } from 'src/app/shared/models/userrole.model';
import { UserService } from '../user.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from '../../common/common.service';
import { UserRights } from 'src/app/shared/models/rights.model';
declare var $: any;
@Component({
  selector: 'app-usertorole',
  templateUrl: './usertorole.component.html',
  styleUrls: ['./usertorole.component.css'],
})
export class UsertoroleComponent implements AfterViewChecked {
  link: string;
  time: Date;
  empRoleModel = new Userrole();
  empRoleModelobj: Userrole[] = new Array();
  selectedRoleID: any;
  i: boolean;
  empRoleList: Userrole[] = new Array();
  selectedEmpID: number;
  // selectedemp: User[] = new Array();
  selectedRole = new FormControl([]);
  deleteRoles: RoleList[] = new Array();
  selectedEmpName: string;
  roleList: RoleList[] = new Array();
  modify: any;
  editEmpRoleID: any;
  empList: User[] = new Array();
  employee = new User();
  token_Id: number;
  employeesearch: string;
  editData: Userrole;
  plantid: number;
  userid: number;
  hostid: string;
  selectedForDelete: number;
  Audit_Type_Id: number;
  loading: boolean = true;
  shopid: number;
  allshops: boolean;
  rightsList: any[] = [];
  selectedRight: any[];
  empRightsModelobj: UserRights[] = new Array();
  canCreate: boolean = true;

  constructor(
    private userService: UserService,
    private _toastr: ToastrService,
    private router: Router,
    private ngZone: NgZone,
    private dialog: MatDialog,
    private commonService: CommonService,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.Audit_Type_Id = parseInt(localStorage.getItem('audittypeid'));
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1';
    this.userid = this.userService.getUserID();
    this.hostid = this.userService.getHostData();
    this.plantid = this.userService.getplantID();

    $('#ngslide').hide();
    this.getEmployeeList();
    this.getRoleList();
    this.getEmpRoleList();
    this.getRightList();

    this.token_Id = this.userService.getUserID();
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

  //  Get Data

  getEmployeeList() {
    this.userService
      .getUserListUserRole(
        this.plantid,
        this.Audit_Type_Id,
        this.shopid,
        this.allshops
      )
      .subscribe((data) => {
        if (data !== null && data !== undefined) {
          data.sort();
          this.empList = data;
        }
      });
  }

  getRoleList() {
    this.userService
      .getRoleList(this.plantid, this.Audit_Type_Id)
      .subscribe((data) => {
        this.roleList = data;
      });
  }

  getRightList() {
    this.userService.getRightsList(this.plantid).subscribe((data) => {
      this.rightsList = data;
    });
  }

  getEmpRoleList() {
    this.loading = true;
    this.userService
      .getEmpRoleList(
        this.plantid,
        this.Audit_Type_Id,
        this.shopid,
        this.allshops
      )
      .subscribe((data) => {
        this.empRoleList = data;
        this.LoadRoleUserTable(this.empRoleList);
        this.loading = false;
      });
  }

  LoadRoleUserTable(employeeroledatas) {
    if (<any>$.fn.DataTable.isDataTable('#createRoleTable')) {
      $('#createRoleTable').dataTable().fnDestroy();
    }

    <any>$('#createRoleTable').DataTable({
      destroy: true,
      lengthMenu: [
        [-1, 50, 25, 10, 5],
        ['All', 50, 25, 10, 5],
      ],
      data: employeeroledatas,
      columnDefs: [
        { title: 'Employee Name', targets: 0 },

        { title: 'Role Name', targets: 1 },

        { title: 'Action', targets: 2 },
      ],

      columns: [
        { data: 'Employee_Name' },

        { data: 'Role_Name' },

        {
          data: null,
          render: function (data, type, row) {
            const canUpdate = localStorage.getItem('canUpdate') === '1'; //1=true
            const canDelete = localStorage.getItem('canDelete') === '1';

            const editButton = `
             <span id="modifyRoleBtn" class="btn fa fa-pencil" data-toggle="modal" title="Edit" 
                   data-target="#mymodal"  style="border-radius: 50%!important;
                   background-color: #0b9494;
                   color: black;"
                   data-elemnt-obj="${data.User_Role_Key}"></span>   `;

            const deleteButton = `
              <span id="deleteRoleBtn" style="border-radius: 50%!important;
          background-color: #0b9494;
          color: black!important;" class="btn fa fa-trash deletebutton" title = "Delete"  
                   data-element-id="${data.User_Role_Key}"></span>`;

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
            $(cell).on('click', '#modifyRoleBtn', () => {
              this.ngZone.run(() => {
                this.modifySelected(rowData.User_Role_Key);
              });
            });
            $(cell).on('click', '#deleteRoleBtn', () => {
              this.ngZone.run(() => {
                const dialogRef = this.dialog.open(DeletePopupComponent, {
                  width: '250px',
                  enterAnimationDuration: '0ms',
                  exitAnimationDuration: '0ms',
                });
                dialogRef.afterClosed().subscribe((result) => {
                  console.log('The dialog was closed' + result);
                  if (result) {
                    this.selectedForDelete = rowData.User_Role_Key;
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

  checkDuplicate() {
    this.i = false;
    this.getEmpRoleList();
    this.empRoleList.forEach((item, index) => {
      if (item.Employee_ID === this.selectedEmpID) {
        this.i = true;
        this.refresh();
        this._toastr.warning(
          'Duplicate record found',
          'The employee is already assigned to role.Please check employee name and assigned role.'
        );
      }
    });
  }

  onSave() {
    if (!this.selectedEmpID) {
      this._toastr.warning('Please select Employee !!');
      return;
    }
    if (!this.selectedRoleID) {
      this._toastr.warning('Please select Role !!');
      return;
    }
    if (!this.selectedRight) {
      this._toastr.warning('Please select Rights !!');
      return;
    }
    this.empRoleModelobj = [];
    this.empRightsModelobj = [];
    this.i = false;
    if (this.modify === true) {
      this.updateRecord();
    } else {
      var count = 0;
      // console.log(this.selectedRoles);
      for (let i = 0; i < this.selectedRoleID.length; i++) {
        this.empRoleModel = new Userrole();
        this.empRoleModel.Plant_ID = this.plantid;
        this.empRoleModel.Role_ID = parseInt(this.selectedRoleID[i]);
        this.empRoleModel.Employee_ID = this.selectedEmpID;
        this.empRoleModel.Audit_Type_Id = this.Audit_Type_Id;
        this.empRoleModel.Inserted_User_ID = this.token_Id;
        this.empRoleModel.Inserted_Host = this.hostid;

        this.empRoleModel.Is_Create = this.selectedRight.find(
          (a) => a.toLowerCase() === 'create'
        )
          ? true
          : false;
        this.empRoleModel.Is_Edit = this.selectedRight.find(
          (a) => a.toLowerCase() === 'update'
        )
          ? true
          : false;
        this.empRoleModel.Is_Delete = this.selectedRight.find(
          (a) => a.toLowerCase() === 'delete'
        )
          ? true
          : false;
        this.empRoleModelobj[count] = this.empRoleModel;
        count++;
      }
      this.userService.saveEmpRole(this.empRoleModelobj).subscribe((data) => {
        if (data == null || data == undefined || data == '') {
          this._toastr.error(
            'Error While Adding Role!',
            'Unable to Connect to server! '
          );
        } else if (data.isSuccessMessage) {
          this.getEmpRoleList();
          this.refresh();
          this._toastr.success(data.messageDetail, data.messageTitle);
        } else if (data.isErrorMessage) {
          this._toastr.error(data.messageDetail, data.messageTitle);
        } else if (data.isAlertMessage) {
          this._toastr.warning(data.messageDetail, data.messageTitle);
        }
      });
    }
  }
  onRoleChange(e) {
    console.log(this.selectedRoleID);
  }
  onRightChange(e) {
    console.log(e.value);
    console.log(this.selectedRight);
  }
  updateRecord() {
    const data: Userrole = {
      User_Role_Key: this.editEmpRoleID,
      Employee_ID: this.selectedEmpID,
      Plant_ID: this.plantid,
      Role_ID: this.selectedRoleID[0],
      Description: '',
      Is_Deleted: false,
      Is_Transfered: false,
      Is_Purgeable: false,
      Is_Edited: false,
      Inserted_User_ID: 0,
      Inserted_Date: undefined,
      Inserted_Host: '',
      Updated_User_ID: this.userid,
      Updated_Date: undefined,
      Updated_Host: this.hostid,
      Employee_Name: '',
      Role_Name: '',
      Audit_Type_Id: this.Audit_Type_Id,
      Right_ID: 0,
      Is_Create: this.selectedRight.find((a) => a.toLowerCase() === 'create')
        ? true
        : false,
      Is_Edit: this.selectedRight.find((a) => a.toLowerCase() === 'update')
        ? true
        : false,
      Is_Delete: this.selectedRight.find((a) => a.toLowerCase() === 'delete')
        ? true
        : false,
    };
    this.userService.editEmpRole(this.editEmpRoleID, data).subscribe((data) => {
      if (data == null || data == undefined || data == '') {
        this._toastr.error(
          'Error While Adding Role!',
          'Unable to Connect to server! '
        );
      } else if (data.isSuccessMessage) {
        this.getEmpRoleList();
        this.refresh();
        this._toastr.success(data.messageDetail, data.messageTitle);
      } else if (data.isErrorMessage) {
        this._toastr.error(data.messageDetail, data.messageTitle);
      } else if (data.isAlertMessage) {
        this._toastr.warning(data.messageDetail, data.messageTitle);
      }
    });
  }

  DeleteRecord() {
    if (this.selectedForDelete > 0) {
      this.userService
        .deleteEmpRole(this.selectedForDelete)
        .subscribe((data) => {
          if (data == null || data == undefined || data == '') {
            this._toastr.error(
              'Can not delete  Record  ',
              'Unable to Connect to server! '
            );
          } else if (data.isErrorMessage) {
            this._toastr.error(data.messageDetail, data.messageTitle);
          } else if (data.isSuccessMessage) {
            this.getEmpRoleList();
            this._toastr.error(data.messageDetail, data.messageTitle);
          } else if (data.isAlertMessage) {
            this._toastr.warning(data.messageDetail, data.messageTitle);
          }
        });
      $('.close').click();
      this.selectedForDelete = 0;
    }
  }

  modifySelected(id) {
    this.modify = true;
    this.editData = this.empRoleList.find((e) => e.User_Role_Key == id);
    this.editEmpRoleID = this.editData.User_Role_Key;
    this.selectedEmpID = this.editData.Employee_ID;
    this.selectedRoleID = [];
    this.selectedRoleID.push(this.editData.Role_ID);
    this.selectedRight = [];
    if (this.editData.Is_Create) {
      this.selectedRight.push('Create');
    }
    if (this.editData.Is_Edit) {
      this.selectedRight.push('Update');
    }

    if (this.editData.Is_Delete) {
      this.selectedRight.push('Delete');
    }

    // this.userService
    //   .getExistRoles(this.plantid, this.editData.Employee_ID)
    //   .subscribe((data) => {
    //     console.log(data);
    //     if (data !== null && data !== undefined) {
    //       this.selectedRoles = data.ExistRoles;
    //       this.selectedRoleID = data.ExistRoles.map((obj) => obj.Role_ID);
    //       this.selectedRight = data.ExistRights.map((obj) => obj.Right_ID);
    //     }
    //   });
  }

  closeDeleteRecord() {
    this.selectedForDelete = 0;
    $('.close').click();
  }

  refresh() {
    this.editEmpRoleID = null;
    this.modify = null;
    this.selectedEmpID = null;
    this.selectedRoleID = null;
    this.selectedRight = null;
  }

  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }
}
