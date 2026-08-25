import { DatePipe } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Department } from 'src/app/shared/models/department.model';
import { Plant_List } from 'src/app/shared/models/plantlist.model';
import { shop } from 'src/app/shared/models/shop.model';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from '../user.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';
declare var $: any;
@Component({
    selector: 'app-createuser',
    templateUrl: './createuser.component.html',
    styleUrls: ['./createuser.component.css'],
})
export class CreateuserComponent {
    link: string;
    plantSettings = {};
    shopSettings = {};
    duplicateEmailAddress: any;
    selectedEmailAddress: string;
    selectedPassword: string;
    selectedContactNo: number;
    selectedBloodGrp: string;
    selectedEmpNo: string;
    selectedEmpName: string;
    editEmpID: number;
    modify: boolean;
    employee = new User();
    empList: User[];
    selectedGederID: any;
    selectedDob: any;
    selectedGender: any;
    userList: User[];
    duplicateloginID: any;
    i: boolean;
    plantlist: Plant_List[] = new Array();
    selectedplants: any[] = new Array();

    shoplist: shop[] = new Array();
    selectedshops: any[] = new Array();
    editRowId: any;
    createUserModel: any;
    deptListObj: Department[];
    typelist: any[];
    selectedDeptID: any;
    selectedValue: any;
    createUserForm: FormGroup;
    tokenNumber: string;
    token_Id: any;
    duplicateEmployeeName: any;
    gender: boolean;
    duplicateMobile: any;
    duplicateDOB: any;
    duplicateBG: any;
    namesearch: string;
    tokensearch: string;
    mailsearch: string;
    contactsearch: string;
    editData: User;
    empGender: string;
    plantid: number;
    userid: number;
    hostid: string;
    seletedForDelete: number;
    RoleName: string;
    selectedtypetype: any;
    loading: boolean = true;
    Audit_Type_Id: number;
    allShops: boolean;
    shopid: number;
    constructor(
        private userService: UserService,
        private router: Router,
        private _toastr: ToastrService,
        private ngZone: NgZone,
        private dialog: MatDialog
    ) {
        this.createUserForm = new FormGroup({
            employeeName: new FormControl(null, [
                Validators.required,
                Validators.pattern('^[a-zA-Z][a-zA-Z-_ ]+$'),
                Validators.minLength(3),
                Validators.maxLength(40),
            ]),
            deptName: new FormControl(null, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(20),
            ]),
            // gender: new FormControl(null, [Validators.required]),
            gender: new FormControl(null),
            // mobileno: new FormControl(null, [
            //     Validators.required,
            //     Validators.pattern('^[0-9][0-9-_ ]+$'),
            //     Validators.minLength(10),
            //     Validators.maxLength(10),
            // ]),
            mobileno: new FormControl(null),
            employeeno: new FormControl(null, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(20),
                Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9-_ ]+$'),
            ]),
            emailId: new FormControl(null, [
                Validators.pattern(
                    '^([a-zA-Z0-9_.+-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$'
                ),
            ]),
            // dob: new FormControl(null, [Validators.required]),
            dob: new FormControl(null),
            plantname: new FormControl(null, [Validators.required]),
            shopname: new FormControl(null, [Validators.required]),
            auditype: new FormControl(null, [Validators.required]),
            isallshops: new FormControl(false),
        });
    }

    ngOnInit() {
        const currentRoute = this.router.url;
        this.allShops = localStorage.getItem('isallshops') === '1';
        this.shopid = parseInt(localStorage.getItem('shopid'));

        this.RoleName = localStorage.getItem('rolename');
        this.Audit_Type_Id = parseInt(localStorage.getItem('audittypeid'));
        $('.selected-list .c-btn').css('height', 'auto');
        this.userid = this.userService.getUserID();
        this.hostid = this.userService.getHostData();
        this.plantid = this.userService.getplantID();
        $('#ngslide').hide();

        this.getDeptList();
        this.getUserList();
        this.getplantlist();
        this.getAuditType();
        this.tokenNumber = localStorage.getItem('user');

        $(document).on('click', '#createUserDeleteButtonClick', ($event) => {
            var myVal = $event.target.dataset.elementId;
            this.seletedForDelete = myVal;
        });

        this.token_Id = localStorage.getItem('userid');
    }
    onAuditTypeChange() {
        if (this.createUserForm.get('plantname').value) {
            this.getShopList();
        }
    }
    onPlantSelect(plantid: any) {
        if (this.createUserForm.get('auditype').value) {
            this.getShopList();
        }
    }
    onShopselet() { }

    onItemSelectPlant(item: any) { }

    getShopList() {
        this.shoplist = [];
        this.selectedshops = [];
        this.createUserForm.get('shopname').setValue(null);
        debugger;
        if (this.createUserForm.get('plantname').value && this.createUserForm.get('auditype').value) {
            this.userService.getShopListByAudit(this.createUserForm.get('plantname').value, this.createUserForm.get('auditype').value).subscribe((data) => {
                if (data !== undefined && data !== null) {
                    this.shoplist = data;
                }
            });
        }

        //  this.userService
        //    .getShopListByAudit(plantid, this.Audit_Type_Id)
        //    .subscribe((data) => {
        //      if (data !== undefined && data !== null) {
        //        this.shoplist = data;
        //      }
        //    });
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
        // console.log('Hello');
    }
    getplantlist() {
        this.userService.getPlantList().subscribe((data) => {
            if (data !== undefined && data !== null) {
                this.plantlist = data;
            }
        });
    }

    getAuditType() {
        this.userService.getAuditType().subscribe((res) => {
            // console.log(res);
            this.typelist = res;
        });
    }
    LoadCreateTable(jsondatas) {
        if (<any>$.fn.DataTable.isDataTable('#createUserTable')) {
            $('#createUserTable').dataTable().fnDestroy();
        }

        <any>$('#createUserTable').DataTable({
            destroy: true,
            lengthMenu: [
                [-1, 50, 25, 10, 5],
                ['All', 50, 25, 10, 5],
            ],
            data: jsondatas,
            columnDefs: [
                { title: 'Employee Name', targets: 0 },
                { title: 'Employee No', targets: 1 },
                { title: 'Email Address', targets: 2 },
                // { title: 'Contact', targets: 3 },
                // { title: 'DOB', targets: 4 },
                // { title: 'Gender', targets: 5 },
                { title: 'Action', targets: 3 },
            ],

            columns: [
                { data: 'Employee_Name' },
                { data: 'Employee_No' },
                { data: 'Email_Address' },
                // { data: 'Contact_No' },
                // {
                //     data: 'DOB',
                //     render: function (data, type, row) {
                //         // Format the date in dd/mm/yyyy format
                //         if (type === 'display' || type === 'filter') {
                //             return new Date(data).toLocaleDateString('en-GB');
                //         }
                //         return data;
                //     },
                // },
                // { data: 'EmpGender' },

                {
                    data: null,
                    render: function (data, type, row) {
                        return ` 
           <span id="createUserModifyButtonClick" class="btn fa fa-pencil"  style="border-radius: 50%!important;
           background-color: #0b9494;
           color: black;"data-toggle="modal" title="Edit" 
                   
                   data-elemnt-obj="${data.Employee_ID}"></span>  
          <span id="createUserDeleteButtonClick" style="border-radius: 50%!important;
          background-color: #0b9494;
          color: black!important;" class="btn fa fa-trash deletebutton" title = "Delete" 
                   data-element-id="${data.Employee_ID}"></span> `;
                    },
                    createdCell: (cell, cellData, rowData) => {
                        $(cell).on('click', '#createUserModifyButtonClick', () => {
                            this.ngZone.run(() => {
                                this.modifySelected(rowData.Employee_ID);
                            });
                        });
                        $(cell).on('click', '#createUserDeleteButtonClick', () => {
                            this.ngZone.run(() => {
                                const dialogRef = this.dialog.open(DeletePopupComponent, {
                                    width: '250px',
                                    enterAnimationDuration: '0ms',
                                    exitAnimationDuration: '0ms',
                                });
                                dialogRef.afterClosed().subscribe((result) => {
                                    console.log('The dialog was closed' + result);
                                    if (result) {
                                        this.seletedForDelete = rowData.Employee_ID;
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

    onGenderChange(e) {
        if (e) {
            // console.log(e); // you will get the id
            this.selectedGederID = e;
        }
    }
    onDepartmentChange(e) {
        if (e) {
            this.selectedValue = e;
            // console.log('Selected cat' + this.selectedDeptID);
        }
    }
    getDeptList() {
        this.userService.getDeptList(this.plantid).subscribe((data) => {
            // console.log(data);
            this.deptListObj = data;
        });
        // console.log('getDeptList drop down' + this.deptListObj);
    }
    checkDuplicate() {
        //
        this.i = false;
        this.getUserList();
        this.duplicateloginID = this.createUserForm.get('employeeno').value;
        this.duplicateEmailAddress = this.createUserForm.get('emailId').value;

        for (let i = 0; i < this.empList.length; i++) {
            if (
                this.empList[i].Employee_No === this.duplicateloginID &&
                this.empList[i].Email_Address.toLowerCase() ===
                this.duplicateEmailAddress.toLowerCase()
            ) {
                this.i = true;
                //  this.refresh();
                // console.log('duplicateDefect');
                this._toastr.error(
                    'Duplicate record found',
                    'The employee is already added.Please check email address and employee number.'
                );
                break;
            } else if (this.empList[i].Employee_No === this.duplicateloginID) {
                this.i = true;
                //     this.refresh();
                // console.log('duplicateDefect');
                this._toastr.error(
                    'Duplicate record found',
                    'The Token is already added.Please check Token number.'
                );
                break;
            } else if (
                this.empList[i].Email_Address.toLowerCase() ===
                this.duplicateEmailAddress.toLowerCase()
            ) {
                this.i = true;
                // this.refresh();
                // console.log('duplicateDefect');
                this._toastr.error(
                    'Duplicate record found',
                    'The employee address is already added.Please check email address and employee number.'
                );
                break;
            }
        }
    }
    checkDuplicatemodify() {
        this.i = false;
        this.getUserList();
        this.duplicateloginID = this.createUserForm.get('employeeno').value;
        this.duplicateEmailAddress = this.createUserForm.get('emailId').value;
        this.duplicateEmployeeName = this.createUserForm.get('employeeName').value;
        this.duplicateMobile = this.createUserForm.get('mobileno').value;
        // this.duplicateDOB = this.createUserForm.get('dob').value;
        // this.duplicateBG = this.createUserForm.get('bloodgroup').value;

        for (let i = 0; i < this.empList.length; i++) {
            if (
                this.empList[i].Employee_No === this.duplicateloginID &&
                this.empList[i].Email_Address.toLowerCase() ===
                this.duplicateEmailAddress.toLowerCase() &&
                this.empList[i].Employee_Name.toLowerCase() ===
                this.duplicateEmployeeName.toLowerCase()
            ) {
                // this.i = true;
                // this.refresh();
                // console.log('duplicateDefect');
                //  this._toastr.success(
                //   'Record Modify sucessfully!',
                //   'Modify Record Sucess '
                // );
                break;
            }
        }
    }
    exit() {
        $('#ngslide').show();
        this.router.navigate(['/configmaster']);
    }
    getUserList() {
        this.loading = true;
        this.userService
            .getUserList(this.plantid, this.shopid, this.Audit_Type_Id, this.allShops)
            .subscribe((data) => {
                this.empList = data;
                for (let i = 0; i < this.empList.length; i++) {
                    if (this.empList[i].Gender == true) {
                        this.empGender = 'Female';
                        this.empList[i].EmpGender = this.empGender;
                    } else {
                        this.empGender = 'Male';
                        this.empList[i].EmpGender = this.empGender;
                    }
                }

                this.LoadCreateTable(this.empList);
                this.loading = false;
            });
    }
    refresh() {
        this.createUserForm.reset();
        this.editEmpID = null;
        this.modify = null;
        this.getUserList();
        $('.close').click();
    }

    deleteSelected(id) {
        $('.close').click();
        this.userService.deleteUser(id).subscribe((data) => {
            if (data !== null && data !== undefined) {
                if (data.isErrorMessage) {
                    this.refresh();
                    this._toastr.error(data.messageDetail, data.messageTitle);
                } else if (data.isSuccessMessage) {
                    this.refresh();
                    this._toastr.success(data.messageDetail, data.messageTitle);
                } else if (data.isAlertMessage) {
                    this._toastr.warning(data.messageDetail, data.messageTitle);
                }
            }
        });
    }
    modifySelected(id) {
        this.modify = true;
        this.editData = new User();
        this.editData = this.empList.find((e) => e.Employee_ID == id);
        console.log(this.editData);
        this.editEmpID = this.editData.Employee_ID;
        this.createUserForm.get('plantname').setValue(this.editData.Plant_ID);

        this.createUserForm
            .get('employeeName')
            .setValue(this.editData.Employee_Name);
        this.createUserForm.get('employeeno').setValue(this.editData.Employee_No);
        this.createUserForm.get('deptName').setValue(this.editData.Department_ID);
        this.createUserForm.get('mobileno').setValue(this.editData.Contact_No);
        this.createUserForm.get('emailId').setValue(this.editData.Email_Address);
        this.createUserForm.get('dob').setValue(this.editData.DOB);
        this.createUserForm.get('auditype').setValue(this.editData.Audit_Type_Id);
        if (this.editData.Gender) {
            this.createUserForm.get('gender').setValue('Female');
        } else {
            this.createUserForm.get('gender').setValue('Male');
        }
        this.createUserForm.get('shopname').setValue(this.editData.Shop_ID);
        this.createUserForm.get('isallshops').setValue(this.editData.Is_AllShops);
        this.userService.getShopListByAudit(this.editData.Plant_ID, this.createUserForm.get('auditype').value).subscribe((data) => {
            if (data !== undefined && data !== null) {
                this.shoplist = data;
            }
        });
    }
    onSave() {
        if (this.createUserForm.get('plantname') === null) {
            this._toastr.error('Select At least one plant!', 'Please Select Plant ');
        } else if (this.createUserForm.get('shopname') === null) {
            this._toastr.error('Select At least one shop!', 'Please Select shop ');
        } else {
            const temp = this.selectedplants;
            this.selectedplants = [];
            this.selectedplants.push(temp);

            const temp2 = this.selectedshops;
            this.selectedshops = [];
            this.selectedshops.push(temp2);
            if (!this.createUserForm.valid) {
                this._toastr.error('All fileds are required');
            } else {
                this.getUserList();
                if (this.modify === true) {
                    this.checkDuplicatemodify();
                    if (this.i === false) {
                        const tempData = {
                            Employee_ID: this.editEmpID,
                            Updated_User_ID: localStorage.getItem('userid'),
                            Updated_Host: this.hostid,
                            Department_ID: this.createUserForm.get('deptName').value,
                            Employee_Name: this.createUserForm.get('employeeName').value,
                            Employee_No: this.createUserForm.get('employeeno').value,
                            Email_Address: this.createUserForm.get('emailId').value,
                            Contact_No: this.createUserForm.get('mobileno').value,
                            Country_Code: 91,
                            DOB: this.createUserForm.get('dob').value,
                            Plant_ID: this.createUserForm.get('plantname').value,
                            Shop_ID: this.createUserForm.get('shopname').value,
                            Audit_Type_Id: this.createUserForm.get('auditype').value,
                            Is_AllShops: this.createUserForm.get('isallshops').value,

                            Gender: null,
                        };
                        if (this.selectedGederID === 'Male') {
                            tempData['Gender'] = false;
                        }
                        if (this.selectedGederID === 'Female') {
                            tempData['Gender'] = true;
                        }
                        this.userService
                            .editUser(this.editEmpID, tempData)
                            .subscribe((data) => {
                                if (data !== null && data !== undefined) {
                                    if (data.isErrorMessage) {
                                        this._toastr.error(data.messageDetail, data.messageTitle);
                                    } else if (data.isAlertMessage) {
                                        this._toastr.warning(data.messageDetail, data.messageTitle);
                                    } else if (data.isSuccessMessage) {
                                        this._toastr.success(data.messageDetail, data.messageTitle);
                                        this.refresh();
                                    }
                                }
                            });
                    }
                } else {
                    this.checkDuplicate();
                    if (this.i === false) {
                        // console.log(localStorage.getItem('userid'));
                        const tempData = {
                            Inserted_User_ID: localStorage.getItem('userid'),
                            Inserted_Host: this.hostid,
                            Department_ID: this.createUserForm.get('deptName').value,
                            Employee_Name: this.createUserForm.get('employeeName').value,
                            Employee_No: this.createUserForm.get('employeeno').value,
                            Email_Address: this.createUserForm.get('emailId').value,
                            Contact_No: this.createUserForm.get('mobileno').value,
                            Country_Code: 91,
                            DOB: this.createUserForm.get('dob').value,
                            Plant_ID: this.createUserForm.get('plantname').value,
                            Shop_ID: this.createUserForm.get('shopname').value,
                            Audit_Type_Id: this.createUserForm.get('auditype').value,
                            Is_AllShops: this.createUserForm.get('isallshops').value,
                            Gender: null,
                        };
                        if (this.selectedGederID === 'Male') {
                            tempData['Gender'] = false;
                        }
                        if (this.selectedGederID === 'Female') {
                            tempData['Gender'] = true;
                        }
                        // console.log(tempData);
                        // console.log(this.createUserForm.value);
                        this.userService.saveUser(tempData).subscribe((data) => {
                            // console.log(data);
                            if (data !== null && data !== undefined) {
                                if (data.isErrorMessage) {
                                    this._toastr.error(data.messageDetail, data.messageTitle);
                                } else if (data.isAlertMessage) {
                                    this._toastr.warning(data.messageDetail, data.messageTitle);
                                } else if (data.isSuccessMessage) {
                                    this._toastr.success(data.messageDetail, data.messageTitle);
                                    this.refresh();
                                }
                            }
                        });
                    }
                }
            }
        }
    }

    selectShop(data) {
        // console.log(data);
    }
    namesrlist(Emp_name: string) {
        this.namesearch = Emp_name;
    }

    tokensrlist(token_no: string) {
        this.tokensearch = token_no;
    }

    mailsrlist(mail_id: string) {
        this.mailsearch = mail_id;
    }

    contactsrlist(contact_no: string) {
        this.contactsearch = contact_no;
    }

    resetserach() {
        this.contactsearch = null;
        this.mailsearch = null;
        this.tokensearch = null;
        this.namesearch = null;
        this.getUserList();
    }
}
