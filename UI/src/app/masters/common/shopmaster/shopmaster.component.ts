import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { plant } from 'src/app/shared/models/plant.model';
import { shop } from 'src/app/shared/models/shop.model';
import { CommonService } from '../common.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';
declare var $: any;

@Component({
  selector: 'app-shopmaster',
  templateUrl: './shopmaster.component.html',
  styleUrls: ['./shopmaster.component.css'],
})
export class ShopmasterComponent {
  shopForm: FormGroup;
  editData = new shop();
  // selectedPlantId: number;
  selectedShopName: string;
  selectedShopDescription: string;
  selectedSapCode: number;
  shopList: shop[];
  shopModelObj = new shop();
  shopModelObjObj = new plant();
  plantList: plant[];
  link: string;
  modify: boolean;
  editedShopId: number;
  duplicateDataFound: boolean;
  drpPlantValue: number;
  deleteShopID: number;
  duplicateShopName: string;
  duplicatePlantID: number;
  isActive: boolean;
  selectedActive: boolean = true;
  plant: string;
  PlantID: number;
  userid: number;
  hostid: string;
  seletedForDelete: number;
  audittypeid: number;
  loading: boolean = true;
  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;
  constructor(
    private commonservice: CommonService,
    private router: Router,
    private _toastr: ToastrService,
    private ngZone: NgZone,
    private dialog: MatDialog,
    private cdref: ChangeDetectorRef
  ) {
    this.shopForm = new FormGroup({
      textboxShopName: new FormControl(null, [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(80),
        Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9-_ ]+$'),
      ]),
      textboxShopDescription: new FormControl(null),
      textboxSapCode: new FormControl(null),
      active: new FormControl(null),
    });
  }

  refresh() {
    this.shopForm.reset();
    this.modify = false;
    this.bindTableData();
  }

  ngOnInit() {
    $('#ngslide').hide();
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.userid = this.commonservice.getUserID();
    this.hostid = this.commonservice.getHostData();
    this.PlantID = this.commonservice.getplantID();
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.bindTableData();

    //this.show_table = true;
  }

  ngAfterViewChecked() {
    this.commonservice.getUserRights();
    this.canCreate = this.commonservice.canCreate();
    localStorage.setItem(
      'canCreate',
      this.commonservice.canCreate() ? '1' : '0'
    );
    localStorage.setItem(
      'canUpdate',
      this.commonservice.canUpdate() ? '1' : '0'
    );
    localStorage.setItem(
      'canDelete',
      this.commonservice.canDelete() ? '1' : '0'
    );
    this.cdref.detectChanges();
  }

  DeleteRecord() {
    // alert(this.seletedForDelete);

    var myVal = this.seletedForDelete;
    if (myVal > 0) {
      this.deleteShop(this.seletedForDelete);
      $('.close').click();
      this.seletedForDelete = 0;
    }
  }
  closeDeleteRecord() {
    this.seletedForDelete = 0;
    $('.close').click();
  }

  LoadShopTable(
    jsondatas //this method call after update,delete and add record ?.
  ) {
    // console.log(jsondatas);
    if (<any>$.fn.DataTable.isDataTable('#shopTable')) {
      $('#shopTable').dataTable().fnDestroy();
    }

    <any>$('#shopTable').DataTable({
      destroy: true,
      lengthMenu: [
        [-1, 50, 25, 10, 5],
        ['All', 50, 25, 10, 5],
      ],
      data: jsondatas,
      columnDefs: [
        // { title: 'Plant Name', targets: 0 },
        { title: 'Shop Name', targets: 0 },
        { title: 'Shop Description', targets: 1 },
        { title: 'SAP Code', targets: 2 },
        { title: 'Action', targets: 3 },
      ],

      columns: [
        // { data: 'Plant_Name' },
        { data: 'Shop_Name' },
        { data: 'Description' },
        { data: 'Sap_Code' },

        {
          data: null,
          render: function (data, type, row) {
            const canCreate = localStorage.getItem('canCreate') === '1';
            const canUpdate = localStorage.getItem('canUpdate') === '1';
            const canDelete = localStorage.getItem('canDelete') === '1';

            const editButton = `
             <span id="modifyShopBtn" class="btn fa fa-pencil" data-toggle="modal" title="Edit" 
                   data-target="#mymodal" style="border-radius: 50%!important;
                   background-color: #0b9494;
                   color: black;"
                   data-elemnt-obj="${data.Shop_ID}"></span>`;

            const deleteButton = `
              <span id="deleteShopBtn" class="btn fa fa-trash-o deletebutton" style="border-radius: 50%!important;
          background-color: #0b9494;
          color: black!important;" title = "Delete" 
                   data-element-id="${data.Shop_ID}"></span>`;

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
            // Add an event listener for the "Edit" button
            $(cell).on('click', '#modifyShopBtn', () => {
              this.ngZone.run(() => {
                // console.log(rowData.Shop_ID);
                this.modifySelected(rowData.Shop_ID);
              });
            });
            $(cell).on('click', '#deleteShopBtn', () => {
              this.ngZone.run(() => {
                const dialogRef = this.dialog.open(DeletePopupComponent, {
                  width: '250px',
                  enterAnimationDuration: '0ms',
                  exitAnimationDuration: '0ms',
                });
                dialogRef.afterClosed().subscribe((result) => {
                  console.log('The dialog was closed' + result);
                  if (result) {
                    this.seletedForDelete = rowData.Shop_ID;
                    this.DeleteRecord();
                  }
                });
              });
            });
          },
        },
      ],
      ordering: false, // Disable sorting
    });
  }

  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }

  modifySelected(editDataid) {
    // console.log('Hello');
    this.editData = new shop();
    this.editData = this.shopList.find((c) => c.Shop_ID == editDataid);
    if (this.editData !== null) {
      this.modify = true;
      (this.editedShopId = this.editData.Shop_ID),
        (this.selectedShopName = this.editData.Shop_Name);
      this.selectedShopDescription = this.editData.Description;
      this.selectedSapCode = this.editData.Sap_Code;
      // this.PlantID = this.editData.Plant_ID;
      this.selectedActive = this.editData.IS_Active;
    } else {
      this._toastr.error('Error while editing Shop', 'Error !');
    }
  }

  activeChecked(e): void {
    this.isActive = e.target.checked;
    // console.log('reportchecked ' + this.isActive);
  }

  bindTableData() {
    this.loading = true;
    this.commonservice
      .getShopListForPlant(
        this.PlantID,
        this.audittypeid,
        this.shopid,
        this.allshops
      )
      .subscribe((data) => {
        if (data !== null && data !== undefined) {
          this.shopList = data;
          this.LoadShopTable(this.shopList);
          this.loading = false;
        }
      });
  }

  onSave() {
    if (!this.selectedShopName || !this.selectedShopDescription) {
      this._toastr.error('Please enter all fields ');
    } else {
      this.checkDuplicate();
      if (this.modify === true) {
        this.editShopData();
      } else {
        //this.checkDuplicate();
        if (this.duplicateDataFound === false) {
          this.shopModelObj.Shop_Name =
            this.shopForm.get('textboxShopName').value;
          this.shopModelObj.Description = this.shopForm.get(
            'textboxShopDescription'
          ).value;
          this.shopModelObj.Sap_Code =
            this.shopForm.get('textboxSapCode').value;
          this.shopModelObj.Plant_ID = this.PlantID;
          this.shopModelObj.Inserted_Host = this.hostid;
          this.shopModelObj.Inserted_User_ID = this.userid;
          this.shopModelObj.Audit_Type_Id = this.audittypeid;
          this.shopModelObj.Plant_Code = localStorage.getItem('Plant_Code')
          if (this.isActive === true) {
            this.shopModelObj.IS_Active = this.isActive;
          } else if (this.isActive === false) {
            this.shopModelObj.IS_Active = false;
          }

          this.commonservice.save_shop(this.shopModelObj).subscribe((data) => {
            if (data !== null && data !== undefined) {
              if (data.isErrorMessage) {
                this._toastr.error(data.messageDetail, data.messageTitle);
              } else if (data.isSuccessMessage) {
                this.refresh();

                this.bindTableData();
                this._toastr.success(data.messageDetail, data.messageTitle);
              } else if (data.isAlertMessage) {
                this.bindTableData();
                this._toastr.warning(data.messageDetail, data.messageTitle);
              }
            }
          });
        }
      }
    }
  }

  // onDropdownChange(e) {
  //   this.drpPlantValue = e;
  // }

  deleteShop(shopData) {
    $('.close').click();

    this.deleteShopID = shopData;
    // alert(this.deleteShopID);
    this.commonservice.deleteShop(this.deleteShopID).subscribe((data) => {
      if (data == null || data == undefined || data == '') {
        this._toastr.error(
          'Can not delete  Record  ',
          'Unable to Connect to server! '
        );
      } else if (data.isErrorMessage) {
        this._toastr.error(data.messageDetail, data.messageTitle);
      } else if (data.isSuccessMessage) {
        this.bindTableData();
        this.refresh();
        this._toastr.success(data.messageDetail, data.messageTitle);
      } else if (data.isAlertMessage) {
        this.bindTableData();
        this._toastr.warning(data.messageDetail, data.messageTitle);
      }
    });
  }

  editShopData() {
    this.shopModelObj = new shop();
    this.shopModelObj.Shop_ID = this.editedShopId;
    this.shopModelObj.Shop_Name = this.shopForm.get('textboxShopName').value;
    this.shopModelObj.Description = this.shopForm.get(
      'textboxShopDescription'
    ).value;
    this.shopModelObj.Sap_Code = this.shopForm.get('textboxSapCode').value;
    this.shopModelObj.Plant_ID = this.PlantID;
    this.shopModelObj.Updated_Host = this.hostid;
    this.shopModelObj.Updated_User_ID = this.userid;
    this.shopModelObj.Audit_Type_Id = this.audittypeid;
    this.shopModelObj.Plant_Code = localStorage.getItem('Plant_Code')
    if (this.selectedActive === true) {
      this.shopModelObj.IS_Active = this.isActive;
    } else if (this.selectedActive === false) {
      this.shopModelObj.IS_Active = false;
    }

    this.commonservice
      .editShop(this.editedShopId, this.shopModelObj)
      .subscribe((data) => {
        this.shopModelObj = data;
        if (data == null || data == undefined || data == '') {
          this._toastr.error(
            'Error While Updating Shop Record!',
            'Unable to Connect to server! '
          );
        } else if (data.isErrorMessage) {
          this._toastr.error(data.messageDetail, data.messageTitle);
        } else if (data.isAlertMessage) {
          this.bindTableData();
          this._toastr.warning(data.messageDetail, data.messageTitle);
        } else if (data.isSuccessMessage) {
          this.refresh();
          // this.bindTableData();

          this._toastr.success(data.messageDetail, data.messageTitle);
        }
      });
  }

  checkDuplicate() {
    this.duplicateDataFound = false;
    this.duplicateShopName = this.shopForm.get('textboxShopName').value;
    this.duplicatePlantID = this.PlantID;

    this.shopList.forEach((item, index) => {
      if (
        item.Shop_Name.toLowerCase() === this.duplicateShopName.toLowerCase() &&
        item.Plant_ID === this.duplicatePlantID &&
        item.Shop_ID !== this.editedShopId
      ) {
        this.duplicateDataFound = true;

        this._toastr.error(
          'Duplicate record ?.ound',
          'The Shop name is already added for Plant.'
          // 'Please check again.'
        );
        //this.refresh();
      }
    });
  }
}
