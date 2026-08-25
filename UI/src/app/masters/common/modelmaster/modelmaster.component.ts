import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { shop } from 'src/app/shared/models/shop.model';
import { CommonService } from '../common.service';
import { Model } from 'src/app/shared/models/model.model';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';
import { EmailInputComponent } from './email-input/email-input.component';
declare var $: any;

@Component({
  selector: 'app-modelmaster',
  templateUrl: './modelmaster.component.html',
  styleUrls: ['./modelmaster.component.css'],
})
export class ModelmasterComponent implements OnInit {
  //Developer = Satish Jadhav
  // Token No.= 50005817
  // New Development

  // ********************************** Declaration Section Start *******************************//
  audittypeid: number;
  userid: number;
  plantid: number;
  newModel: boolean;
  searchshopInput: string;
  modelcode = new FormControl('', [Validators.required]);
  Email_Addresses = new FormControl('');
  modeldescription = new FormControl('');
  vehicleType = new FormControl('', [Validators.required]);
  shoplist: shop[];
  selectedshopcode: number;
  modelObjet: Model[] = [];
  modelList: Model[];
  selectedshopname: string;
  editshopflag: boolean;
  selectedForDelete: number;
  modifyFlag: boolean;
  selectedmodelid: number;
  loading: boolean = true;
  vehicleTypeList = ['Personal Vehicle', 'Commercial Vehicle'];

  // other
  shopid: number;
  allshops: boolean;
  canCreate: boolean = false;

  constructor(
    private toaster: ToastrService,
    private router: Router,
    private commonService: CommonService,
    private ngZone: NgZone,
    private cdref: ChangeDetectorRef,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    $('#ngslide').hide();
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.audittypeid = this.commonService.getAuditType();
    this.userid = this.commonService.getUserID();
    if (this.userid==1) {
      this.canCreate =true;
    }
    this.plantid = this.commonService.getplantID();
    this.newModel = false;
    this.editshopflag = false;
    this.modifyFlag = false;
    this.getShopList();
    this.getModelList();

    $(document).on('click', '#deletemodelbtn', ($event) => {
      var myVal = $event.target.dataset.elementId;

      this.selectedForDelete = myVal;
    });
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

  // ************************************ Declaration Section End **********************************//

  // ************************************ Shop Section Start **************************************//

  getShopList() {
    this.shoplist = [];
    this.commonService
      .getShopListForPlant(
        this.plantid,
        this.audittypeid,
        this.shopid,
        this.allshops
      )
      .subscribe((data) => {
        this.shoplist = data;
      });
  }
  onShopSave() {
    if (this.searchshopInput) {
      if (this.editshopflag) {
        const temp = {
          Plant_ID: this.plantid,
          Shop_ID: this.selectedshopcode,
          Shop_Name: this.searchshopInput,
          Updated_User_ID: this.userid,
          Updated_Host: this.userid,
        };
        this.commonService
          .updateShopName(this.selectedshopcode, temp)
          .subscribe((data) => {
            if (data !== null && data !== undefined) {
              if (data.isErrorMessage) {
                this.toaster.error(data.messageDetail, data.messageTitle);
              } else if (data.isSuccessMessage) {
                this.refresh();
                this.toaster.success(data.messageDetail, data.messageTitle);
              } else if (data.isAlertMessage) {
                this.getShopList();
                this.toaster.warning(data.messageDetail, data.messageTitle);
              }
            }
          });
      } else {
        const temp = {
          Audit_Type_Id: this.audittypeid,
          Shop_Name: this.searchshopInput,
          Plant_ID: this.plantid,
          IS_Active: true,
          Inserted_User_ID: this.userid,
        };
        this.commonService.save_shop(temp).subscribe((data) => {
          if (data !== null && data !== undefined) {
            if (data.isErrorMessage) {
              this.toaster.error(data.messageDetail, data.messageTitle);
            } else if (data.isSuccessMessage) {
              this.refresh();
              this.getShopList();
              this.toaster.success(data.messageDetail, data.messageTitle);
            } else if (data.isAlertMessage) {
              this.getShopList();
              this.toaster.warning(data.messageDetail, data.messageTitle);
            }
          }
        });
      }
    }
  }

  selectShop(shop: shop) {
    if (shop) {
      this.selectedshopname = shop.Shop_Name;
      this.selectedshopcode = shop.Shop_ID;
      this.onNewModel();
    }
  }

  editShop(shop: shop) {
    if (shop) {
      this.editshopflag = true;
      this.searchshopInput = shop.Shop_Name;
    }
  }

  isCurrentShop(shop: shop) {
    if (this.selectedshopcode) {
      return this.selectedshopcode == shop.Shop_ID;
    } else {
      return false;
    }
  }

  // ************************************ Shop Section End **************************************//

  // ************************************ Model Section Start **************************************//
  getModelList() {
    this.loading = true;
    this.commonService
      .getModelTableData(
        this.plantid,
        this.audittypeid,
        this.shopid,
        this.allshops
      )
      .subscribe((res) => {
        this.LoadTable(res);
        this.modelList = res;
        this.loading = false;
      });
  }

  onNewModel() {
    if (this.selectedshopname) {
      this.newModel = true;
    } else {
      this.toaster.warning('Please select shop first .');
    }
  }
  //Adding model to array object locally
  addModel() {
    if (!this.modelcode.value) {
      this.toaster.warning('Please Enter Model Code ...');
    } else {
      if (!this.vehicleType.value) {
        this.toaster.warning('Please Select Vehicle Type..');
      } else {
        let duplicate = false;
        this.modelObjet.forEach((model) => {
          if (
            model.Model_Code == this.modelcode.value &&
            model.Model_Description == this.modeldescription.value
          ) {
            duplicate = true;
          }
        });

        this.modelList.forEach((model) => {
          if (
            model.Model_Code == this.modelcode.value &&
            model.Model_Description == this.modeldescription.value
          ) {
            duplicate = true;
          }
        });
        if (duplicate) {
          this.toaster.warning('Duplicate Record found !!');
        } else {
          const temp: Model = {
            Model_Name: this.modelcode.value,
            Model_Code: this.modelcode.value,
            Model_Description: this.modeldescription.value,
            Vehicle_Type: this.vehicleType.value,
            Shop_ID: this.selectedshopcode,
            Plant_ID: this.plantid,
            Inserted_User_ID: this.userid,
            Audit_Type_Id: this.audittypeid,
            Plant_Code: localStorage.getItem('Plant_Code')??'',
            Email_Addresses: ''
          };
          this.modelObjet.push(temp);
          this.modelcode.reset();
          this.modeldescription.reset();
          this.vehicleType.reset();
        }
      }
    }
  }

  //Remove from local
  removeObject(id: number) {
    if (id >= 0 && id < this.modelObjet.length) {
      this.modelObjet.splice(id, 1);
    } else {
      console.error('Invalid index to remove');
    }
  }

  onModelSave() {
    if (this.modelObjet.length > 0) {
      this.commonService.saveModel(this.modelObjet).subscribe((data) => {
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
  }
  modifySelected(modelid) {
    const temp = this.modelList.find((model) => model.Model_ID == modelid);
    if (temp) {
      this.modifyFlag = true;
      // console.log(temp);
      this.selectedmodelid = temp.Model_ID;
      this.selectedshopcode = temp.Shop_ID;
      this.modelcode.setValue(temp.Model_Code);
      this.modeldescription.setValue(temp.Model_Description);
      this.vehicleType.setValue(temp.Vehicle_Type);
      this.Email_Addresses.setValue(temp.Email_Addresses);
    }
  }

  updateModel() {
    if (this.modifyFlag) {
      const temp: Model = {
        Model_ID: this.selectedmodelid,
        Model_Name: this.modelcode.value,
        Model_Code: this.modelcode.value,
        Model_Description: this.modeldescription.value,
        Vehicle_Type: this.vehicleType.value,
        Shop_ID: this.selectedshopcode,
        Plant_ID: this.plantid,
        Audit_Type_Id: this.audittypeid,
        Updated_User_ID: this.userid,
        Plant_Code: localStorage.getItem('Plant_Code'),
        Email_Addresses: this.Email_Addresses.value
      };

      this.commonService
        .updateModel(this.selectedmodelid, temp)
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
  }

  DeleteRecord() {
    if (this.selectedForDelete > 0) {
      this.commonService
        .deleteModel(this.selectedForDelete)
        .subscribe((data) => {
          if (data == null || data == undefined || data == '') {
            this.toaster.error(
              'Can not delete  Record  ',
              'Unable to Connect to server! '
            );
          } else if (data.isErrorMessage) {
            this.toaster.error(data.messageDetail, data.messageTitle);
          } else if (data.isSuccessMessage) {
            this.refresh();
            this.toaster.success(data.messageDetail, data.messageTitle);
          } else if (data.isAlertMessage) {
            this.toaster.warning(data.messageDetail, data.messageTitle);
          }
        });
      $('.close').click();
    }
  }

  closeDeleteRecord() {
    this.selectedForDelete = null;
    $('.close').click();
  }
  // ************************************ Model Section End **************************************//

  // ************************************ Other Section Start **************************************//

  refresh() {
    this.modelObjet = [];
    this.newModel = false;
    this.modelcode.reset();
    this.modeldescription.reset();
    this.Email_Addresses.reset();
    this.vehicleType.reset();
    this.selectedshopname = null;
    this.selectedshopcode = null;
    this.searchshopInput = null;
    this.modifyFlag = false;
    this.selectedForDelete = null;
    this.getModelList();
    this.getShopList();
  }
  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
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
        { title: 'Shop', targets: 0 },
        { title: 'Model Code', targets: 1 },
        { title: 'Model Description', targets: 2 },
        { title: 'Vehicle Type', targets: 3 },
        { title: 'Action', targets: 4 },
      ],

      columns: [
        {
          data: 'Shop_Name',
        },
        { data: 'Model_Name' },
        { data: 'Model_Description' },
        { data: 'Vehicle_Type' },
        {
          data: null,
          render: function (data, type, row) {
            // const canUpdate = localStorage.getItem('canUpdate') === '1'; //1=true
            const canUpdate = localStorage.getItem('userid')== '1' ? true : false;
            const canDelete = localStorage.getItem('userid') === '1';

            const editButton = `
              <span id="email" class="btn fa fa-pencil modifycheckBtn modifybtn" data-toggle="modal" title="Edit"
                style="border-radius: 50%!important; background-color: #0b9494; color: black;"
                data-target="#mymodal" data-element-obj="${data.Model_ID}"></span>`;

            const deleteButton = `
              <span id="deletebtn" class="btn fa fa-trash deletebutton deletesbtn" title="Delete"
                style="border-radius: 50%!important; background-color: #0b9494; color: black!important;"
                data-element-id="${data.Model_ID}"></span>`;

            if (canUpdate && canDelete) {
              return `${editButton}${deleteButton}`;
            } else if (canUpdate) {
              return editButton;
            } else if (canDelete) {
              return deleteButton;
            }

            return `<span id="email" class="btn fa fa-envelope" data-toggle="modal" title="Edit"
                   data-target="#mymodal"  style="border-radius: 50%!important;
                   background-color: #fcba03;
                   color: black;"
                   data-elemnt-obj="${data.Model_ID}"></span>`;
          },
          createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
            // Add an event listener for the "Edit" button
            $(cell).on('click', '#email', () => {
              this.ngZone.run(() => {
                this.onMail(rowData);
              });
            });
            $(cell).on('click', '#modifymodelbtn', () => {
              this.ngZone.run(() => {
                // console.log(rowData.Model_ID);
                this.modifySelected(rowData.Model_ID);
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
                    this.selectedForDelete = rowData.Model_ID;
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

  onMail(data) {
    const dialogRef = this.dialog.open(EmailInputComponent, {
      width: '600px',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
      data: data
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed' + result);
      if (result) {
        console.log(result);
        this.getModelList();
      }
    });
  }

  // ************************************ Other Section End **************************************//
}
