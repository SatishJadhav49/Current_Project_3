import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MenuList } from 'src/app/shared/models/menulist.model';
import { MenuRoleList } from 'src/app/shared/models/menurolelist.model';
import { RoleList } from 'src/app/shared/models/rolelist.model';
import { SubMenuList } from 'src/app/shared/models/submenulist.model';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from '../user.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';
declare var $: any;

@Component({
  selector: 'app-createrole',
  templateUrl: './createrole.component.html',
  styleUrls: ['./createrole.component.css'],
})
export class CreateroleComponent {
  modifyflag: boolean;
  menudropdownsetting = {};
  selectedMenus: any;
  employee = new User();
  selectedSubMenusTemp: SubMenuList[];
  isSubmenuChecked: any;
  link: string;
  menuRoleModelList: MenuRoleList[] = new Array();
  tempRoleMenu = new MenuRoleList();
  selectedMenuId: number;
  selectedDesc: string;
  selectedRoleName: string;
  menuRoleModelcount: number;
  flag: boolean;
  currentMenuid: any;
  i: boolean;
  myobj: any;
  duplicateRole: any;
  menulistObj: MenuList[] = new Array();
  tempMenu: MenuList[] = new Array();
  submenulistObj: SubMenuList[] = new Array();
  selectedSubMenus: SubMenuList[] = new Array();
  roleModel = new RoleList();
  loading: boolean = true;
  menuRoleModel = new MenuRoleList();
  roleList: RoleList[];
  createroleForm: FormGroup;
  limitSelection = false;
  dropdownSettings = {};
  tokenNumber: string;
  token_Id: any;
  selectedroleId: number;
  editData: RoleList;
  plantid: number;
  userid: number;
  hostid: string;
  seletedForDelete: number;
  RoleName: string;
  menus = new FormControl();
  audittypeid: number;
  constructor(
    private userService: UserService,
    private router: Router,
    private _toastr: ToastrService,
    private ngZone: NgZone,
    private dialog: MatDialog
  ) {
    this.createroleForm = new FormGroup({
      rolename: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9-_ ]+$'),
        Validators.minLength(2),
        Validators.maxLength(100),
      ]),
      roleDesc: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ]),
      menuName: new FormControl(null, [Validators.required]),
      submenuName: new FormControl(null, [Validators.required]),
    });
  }

  refresh() {
    this.createroleForm.reset();
    this.submenulistObj.length = 0;

    this.modifyflag = false;
    this.selectedMenus = [];
    this.getRoleList();
  }

  ngOnInit() {
    this.RoleName = localStorage.getItem('rolename');
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.userid = this.userService.getUserID();
    this.hostid = this.userService.getHostData();
    this.modifyflag = false;
    this.dropdownSettings = {
      singleSelection: false,
      text: 'Select Sub-menu',
      labelKey: 'LinkName',
      primaryKey: 'Sub_Menu_ID',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      showCheckbox: true,
      maxHeight: '150',
      classes: 'myclass custom-class',
    };

    this.menudropdownsetting = {
      singleSelection: false,
      text: 'Select Menu',
      labelKey: 'LinkName',
      primaryKey: 'Menu_ID',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      showCheckbox: true,
      maxHeight: '150',
      classes: 'myclass custom-class',
    };
    $('#ngslide').hide();
    this.tokenNumber = localStorage.getItem('user');
    this.plantid = this.userService.getplantID();
    this.token_Id = this.userService.getUserID();

    this.getMenuList();
    this.getRoleList();

    $(document).on('click', '#modifyCreateRoleButtonClick', ($event) => {
      var myVal = $event.target.dataset.elemntObj;
      this.ngZone.run(() => {
        this.modifySelected(myVal);
      });
    });

    $(document).on('click', '#deleteCreateRoleButtonClick', ($event) => {
      var myVal = $event.target.dataset.elementId;
      this.seletedForDelete = myVal;
    });
  }
  onItemSelect(item: any) {
    // console.log(item);
    this.selectedSubMenus = [];
    this.selectedSubMenus = item.value;
    // console.log(this.selectedSubMenus);
  }

  onmenuSelect(item: any) {
    this.onDropdownMenuChange(item.value);
    if (this.selectedSubMenus) {
      this.selectedSubMenus = this.selectedSubMenus.filter(
        (c) => c.Menu_ID != item.Menu_ID
      );
    }
  }
  DeleteRecord() {
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

  LoadCreateRoleTable(
    jsondatas //this method call after update,delete and add record
  ) {
    if (<any>$.fn.DataTable.isDataTable('#createRoleTable')) {
      $('#createRoleTable').dataTable().fnDestroy();
    }

    <any>$('#createRoleTable').DataTable({
      destroy: true,
      lengthMenu: [
        [-1, 50, 25, 10, 5],
        ['All', 50, 25, 10, 5],
      ],
      data: jsondatas,
      columnDefs: [
        { title: 'Role Name', targets: 0 },
        { title: 'Role Description', targets: 1 },
        { title: 'Date', targets: 2 },
        { title: 'Action', targets: 3 },
      ],

      columns: [
        { data: 'Role_Name' },
        { data: 'Role_Description' },
        {
          data: 'Inserted_Date',
          render: function (data, type, row) {
            if (type === 'display' || type === 'filter') {
              const date = new Date(data);
              const day = date.getDate().toString().padStart(2, '0');
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              const year = date.getFullYear();
              return `${day}/${month}/${year}`;
            }
            return data;
          },
        },
        {
          data: null,
          render: function (data, type, row) {
            return ` <div style="text-align:center" >
           <span id="modifyCreateRoleButtonClick" class="btn fa fa-pencil" data-toggle="modal" title="Edit" 
                   data-target="#mymodal"  style="border-radius: 50%!important;
                   background-color: #0b9494;
                   color: black;"
                   data-elemnt-obj="${data.Role_ID}"></span>  
          <span id="deleteCreateRoleButtonClick" style="border-radius: 50%!important;
          background-color: #0b9494;
          color: black!important;" class="btn fa fa-trash deletebutton" title = "Delete"  data-toggle="modal" data-target="#myModal"
                   data-element-id="${data.Role_ID}"></span> </div>`;
          },
          createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
            $(cell).on('click', '#modifyCreateRoleButtonClick', () => {
              this.ngZone.run(() => {
                this.modifySelected(rowData.Role_ID);
              });
            });
            $(cell).on('click', '#deleteCreateRoleButtonClick', () => {
              this.ngZone.run(() => {
                const dialogRef = this.dialog.open(DeletePopupComponent, {
                  width: '250px',
                  enterAnimationDuration: '0ms',
                  exitAnimationDuration: '0ms',
                });
                dialogRef.afterClosed().subscribe((result) => {
                  console.log('The dialog was closed' + result);
                  if (result) {
                    this.seletedForDelete = rowData.Role_ID;
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

  getMenuList() {
    this.submenulistObj.length = 0;

    this.userService.getMenus(this.audittypeid).subscribe((data) => {
      this.menulistObj = data;
    });
  }
  deleteSelected(id) {
    this.userService.deleteRole(id).subscribe((data) => {
      if (data === null || data === undefined) {
        this._toastr.error(
          'Can not delete',
          'Record can not Deleted(Reference to User to Role)! ',
          {}
        );
      } else {
        this._toastr.error(
          'Delete Record Sucess ',
          'Record Deleted sucessfully! ',
          {}
        );
      }
      this.refresh();
    });
  }
  compareMenuObjects(object1: any, object2: any) {
    return object1 && object2 && object1.Menu_ID == object2.Menu_ID;
  }
  compareSubMenuObjects(object1: any, object2: any) {
    return object1 && object2 && object1.Sub_Menu_ID == object2.Sub_Menu_ID;
  }
  modifySelected(id) {
    this.modifyflag = false;
    this.editData = new RoleList();

    this.selectedSubMenus = [];
    this.selectedMenus = [];

    this.editData = this.roleList.find((r) => r.Role_ID == id);
    // console.log(this.editData);
    if (this.editData) {
      this.selectedroleId = this.editData.Role_ID;
      this.createroleForm.get('rolename').setValue(this.editData.Role_Name);
      this.createroleForm
        .get('roleDesc')
        .setValue(this.editData.Role_Description);

      this.userService
        .getMenusID(this.editData.Role_ID, this.audittypeid)
        .subscribe((data) => {
          // console.log(data);
          this.createroleForm.get('menuName').setValue(data);
          // Satish Logic
          this.modifyflag = true;
          data.forEach((m) => {
            this.getSubMenuList(m.Menu_ID);
            this.userService
              .getSubMenusID(m.Menu_ID, this.editData.Role_ID)
              .subscribe((data1) => {
                if (data1 !== null && data1 !== undefined) {
                  for (let j = 0; j < data1.length; j++) {
                    this.selectedSubMenus.push(data1[j]);
                  }
                  this.createroleForm
                    .get('submenuName')
                    .setValue(this.selectedSubMenus);
                  // console.log(data1);
                }
              });
          });
        });
    } else {
      this._toastr.error(' ', ' ! ', {});
    }
  }

  getSubMenuList(menuid: number) {
    if (this.modifyflag) {
      this.submenulistObj = [];
    }

    this.userService.getSubMenus(menuid, this.audittypeid).subscribe((data) => {
      if (data !== null && data !== undefined) {
        for (let i = 0; i < data.length; i++) {
          this.submenulistObj.push(data[i]);
        }
      }
    });
    if (this.submenulistObj) {
      this.submenulistObj = this.submenulistObj.filter(
        (c) => c.Menu_ID !== menuid
      );
    }
  }
  getRoleList() {
    this.loading = true;
    this.userService
      .getRolesByPlantID(this.plantid, this.audittypeid)
      .subscribe((data) => {
        this.roleList = data;
        this.LoadCreateRoleTable(this.roleList);
        this.loading = false;
      });
  }

  onSave() {
    this.i = false;
    this.duplicateRole = this.createroleForm.get('rolename').value;
    this.roleModel.Inserted_User_ID = this.token_Id;
    this.roleModel.Plant_ID = this.plantid;
    this.roleModel.Role_Name = this.createroleForm.get('rolename').value;
    this.roleModel.Role_Description = this.createroleForm.get('roleDesc').value;
    this.userService.getRoles().subscribe((data) => {
      this.roleList = data;
      this.roleList.forEach((item, index) => {
        if (
          item.Role_Name.toLowerCase() === this.duplicateRole.toLowerCase() &&
          item.Plant_ID === this.plantid
        ) {
          if (this.modifyflag === true) {
          } else {
            this.i = true;
            this._toastr.error(
              'Duplicate record found',
              'Role is Already Exist.'
            );
          }
        }
      });
      if (this.i === false) {
        this.menuRoleModelcount = 0;
        if (this.modifyflag === true) {
          for (let i = 0; i < this.selectedSubMenus.length; i++) {
            if (this.selectedSubMenus[i].LinkName !== null) {
              this.menuRoleModel = new MenuRoleList();
              this.menuRoleModel.Role_Name = this.roleModel.Role_Name;
              this.menuRoleModel.Role_ID = this.selectedroleId;
              this.menuRoleModel.Plant_ID = this.plantid;
              this.menuRoleModel.Role_Description =
                this.roleModel.Role_Description;
              this.menuRoleModel.Menu_ID = this.selectedSubMenus[i].Menu_ID;
              this.menuRoleModel.Audit_Type_Id = this.audittypeid;
              this.menuRoleModel.Updated_User_ID = this.token_Id;
              this.menuRoleModel.Sub_Menu_ID =
                this.selectedSubMenus[i].Sub_Menu_ID;
              this.menuRoleModel.Sucess = this.menuRoleModelcount;
              this.menuRoleModelList[this.menuRoleModelcount] =
                this.menuRoleModel;
              this.menuRoleModelcount++;
            }
          }
          this.userService
            .putNewRole(this.menuRoleModel.Role_ID, this.menuRoleModelList)
            .subscribe((data) => {
              this._toastr.success(
                'Modify Record sucessfully!',
                'Record Modified.. '
              );
              this.refresh();
            });
        } else {
          for (let i = 0; i < this.selectedSubMenus.length; i++) {
            if (this.selectedSubMenus[i].LinkName !== null) {
              this.menuRoleModel = new MenuRoleList();
              this.menuRoleModel.Role_Name = this.createroleForm.value.rolename;
              this.menuRoleModel.Role_Description =
                this.createroleForm.value.roleDesc;
              this.menuRoleModel.Menu_ID = this.selectedSubMenus[i].Menu_ID;
              this.menuRoleModel.Inserted_User_ID = this.token_Id;
              this.menuRoleModel.Plant_ID = this.plantid;
              this.menuRoleModel.Audit_Type_Id = this.audittypeid;
              this.menuRoleModel.Sub_Menu_ID =
                this.selectedSubMenus[i].Sub_Menu_ID;
              this.menuRoleModel.Sucess = this.menuRoleModelcount;
              this.menuRoleModelList[this.menuRoleModelcount] =
                this.menuRoleModel;
              this.menuRoleModelcount++;
            }
          }
          this.userService
            .saveNewRole(this.menuRoleModelList)
            .subscribe((data) => {
              if (data === null || data === undefined) {
                this._toastr.error(
                  'Error While Adding Plant Record!',
                  'Unable to Connect to server! '
                );
              } else if (data.isErrorMessage) {
                this._toastr.error(data.messageDetail, data.messageTitle);
              } else if (data.isAlertMessage) {
                this._toastr.warning(data.messageDetail, data.messageTitle);
              } else if (data.isSuccessMessage) {
                this.refresh();
                this._toastr.success(data.messageDetail, data.messageTitle);
              }
            });
        }
        this.selectedSubMenusTemp = this.selectedSubMenus;
        this.menuRoleModelcount = 0;

        this.menuRoleModelList.length = 0;
      } else {
        this.refresh();
      }
    });
  }

  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }

  onDropdownMenuChange(menuObject: any) {
    if (menuObject) {
      var existsubmenu = this.submenulistObj.filter(
        (c) => c.Menu_ID == menuObject.Menu_ID
      );
      if (existsubmenu.length !== 0) {
      } else {
        this.submenulistObj = [];
        menuObject.forEach((menu) => {
          this.getSubMenuList(menu.Menu_ID);
        });
      }
    }
  }
}
