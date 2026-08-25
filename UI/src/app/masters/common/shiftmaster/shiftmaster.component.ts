import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Model } from 'src/app/shared/models/model.model';
import { CommonService } from '../common.service';
import { shop } from 'src/app/shared/models/shop.model';
import { Shift } from 'src/app/shared/models/shift.model';
import { MatDialog } from '@angular/material/dialog';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
declare var $: any;

@Component({
  selector: 'app-shiftmaster',
  templateUrl: './shiftmaster.component.html',
  styleUrls: ['./shiftmaster.component.css'],
})
export class ShiftmasterComponent {
  //Developer = Satish Jadhav
  // Token No.= 50005817
  // New Development
  // ********************************** Declaration Section Start *******************************//
  audittypeid: number;
  userid: number;
  hostname: string;
  plantid: number;
  newShift: boolean;
  selectedshiftid: number;
  searchshopInput: string;
  shoplist: shop[];
  modelList: Model[];
  shiftobject: Shift[] = [];
  shiftlist: Shift[] = [];
  selectedForDelete: number;
  modifyFlag: boolean;
  selectedShop: shop;
  searchModelInput: string;
  selectedmodel: Model;
  loading: boolean = true;
  createshiftform: FormGroup;

  // other
  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;
  filteredTableData: Shift[] = [];

  constructor(
    private commonService: CommonService,
    private toaster: ToastrService,
    private router: Router,
    private ngZone: NgZone,
    private dialog: MatDialog,
    private cdref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    $('#ngslide').hide();
    // $('.sidebar-mini').addClass('sidebar-collapse');
    $(window).scrollTop(0);
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.audittypeid = this.commonService.getAuditType();
    this.userid = this.commonService.getUserID();
    this.plantid = this.commonService.getplantID();
    this.hostname = this.commonService.getHostData();
    this.newShift = false;
    this.modifyFlag = false;
    this.getShopList();
    // this.getTableData();
    this.createshiftform = new FormGroup({
      shiftname: new FormControl('', [
        Validators.required,
        Validators.maxLength(10),
      ]),
      starttime: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^([0-1]?[0-9]|[2][0-3]):([0-5][0-9])(:[0-5][0-9])?$'
        ),
      ]),
      endtime: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^([0-1]?[0-9]|[2][0-3]):([0-5][0-9])(:[0-5][0-9])?$'
        ),
      ]),
      isactive: new FormControl(true, [Validators.required]),
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
  // ********************************** Declaration Section End *******************************//

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
  selectShop(shop: shop) {
    if (shop) {
      this.selectedShop = shop;
      // this.getModelList();
      this.onnewShift();
      this.getTableData();
    }
  }

  isCurrentShop(shop: shop) {
    if (this.selectedShop) {
      return this.selectedShop.Shop_ID == shop.Shop_ID;
    } else {
      return false;
    }
  }

  // ************************************ Shop Section End **************************************//

  // ********************************** Part Section Start *******************************//

  onnewShift() {
    if (!this.selectedShop) {
      this.toaster.warning('Please select shop first .');
    } else {
      this.newShift = true;
    }

    // else if (!this.selectedmodel) {
    //   this.toaster.warning('Please select Model first .');
    // }
  }

  onAddShift() {
    if (this.createshiftform.valid) {
      let duplicate = false;
      this.shiftobject.forEach((shift) => {
        if (
          shift.SHIFT_DESC == this.createshiftform.value.shiftname &&
          shift.START_TIME == this.createshiftform.value.starttime &&
          shift.END_TIME == this.createshiftform.value.endtime &&
          shift.Shop_ID == this.selectedShop.Shop_ID
        ) {
          duplicate = true;
        }
      });

      this.shiftlist.forEach((shift) => {
        if (
          shift.SHIFT_DESC == this.createshiftform.value.shiftname &&
          shift.START_TIME == this.createshiftform.value.starttime &&
          shift.END_TIME == this.createshiftform.value.endtime &&
          shift.WORKING == this.createshiftform.value.isactive &&
          shift.Shop_ID == this.selectedShop.Shop_ID
        ) {
          duplicate = true;
        }
      });
      if (duplicate) {
        this.toaster.warning('Duplicate Record found !!');
      } else {
        const temp: Shift = {
          Plant_ID: this.plantid,
          Inserted_Host: this.hostname,
          Inserted_User_ID: this.userid,
          Shop_ID: this.selectedShop.Shop_ID,
          SHIFT_DESC: this.createshiftform.value.shiftname,
          START_TIME: this.createshiftform.value.starttime,
          END_TIME: this.createshiftform.value.endtime,
          WORKING: this.createshiftform.value.isactive ? 'Y' : 'N',
          Is_Active: this.createshiftform.value.isactive,
          Audit_Type_Id: this.audittypeid,

        };
        this.shiftobject.push(temp);
        this.createshiftform.reset();
        this.createshiftform.get('isactive').setValue(true);
      }
    } else {
      this.toaster.warning('All fields are required !');
    }
  }
  removeObject(index: number) {
    this.shiftobject.splice(index, 1);
  }

  onPartsSave() {
    if (this.shiftobject.length > 0) {
      this.commonService.saveShift(this.shiftobject).subscribe((data) => {
        if (data !== null && data !== undefined) {
          if (data.isErrorDbupdate || data.isExceptionMessage) {
            this.toaster.error(data.IsMassege, data.IsTitle);
          } else if (data.IsSuccessAlert) {
            this.refresh();
            this.toaster.success(data.IsMassege, data.IsTitle);
          } else if (data.IsErrorAlertDuplicate) {
            this.toaster.warning(data.IsMassege, data.IsTitle);
          } else {
            this.toaster.error('Something went wrong');
          }
        }
      });
    }
  }

  updateShift() {
    if (this.selectedShop) {
      if (this.modifyFlag) {
        const temp: Shift = {
          SHIFT_NO: this.selectedshiftid,
          Updated_Host: this.hostname,
          Updated_User_ID: this.userid,
          Plant_ID: this.plantid,
          Shop_ID: this.selectedShop.Shop_ID,
          SHIFT_DESC: this.createshiftform.value.shiftname,
          START_TIME: this.createshiftform.value.starttime,
          END_TIME: this.createshiftform.value.endtime,
          WORKING: this.createshiftform.value.isactive ? 'Y' : 'N',
          Is_Active: this.createshiftform.value.isactive,
          Audit_Type_Id: this.audittypeid,
        };

        this.commonService
          .updateShift(this.selectedshiftid, temp)
          .subscribe((data) => {
            if (data !== null && data !== undefined) {
              if (data.isErrorDbupdate) {
                this.toaster.error(data.IsMassege, data.IsTitle);
              } else if (data.IsSuccessAlert) {
                this.refresh();
                this.toaster.success(data.IsMassege, data.IsTitle);
              } else if (data.IsErrorAlertDuplicate) {
                this.toaster.warning(data.IsMassege, data.IsTitle);
              } else {
                this.toaster.error('Something went wrong');
              }
            }
          });
      }
    } else {
      this.toaster.error('Please select shop  ...');
    }
  }

  DeleteRecord() {
    if (this.selectedForDelete) {
      this.commonService
        .deleteShift(this.selectedForDelete)
        .subscribe((data) => {
          if (data !== null && data !== undefined) {
            if (data.IsErrorAlertNotFound || data.IsErrorAlert) {
              this.toaster.error(data.IsMassege, data.IsTitle);
            } else if (data.IsSuccessAlert) {
              this.refresh();
              this.toaster.success(data.IsMassege, data.IsTitle);
            } else if (data.IsErrorAlertDuplicate) {
              this.toaster.warning(data.IsMassege, data.IsTitle);
            } else {
              this.toaster.error('Something went wrong');
            }
          }
        });
    }
  }
  closeDeleteRecord() {
    this.selectedForDelete = null;
    $('.close').click();
  }

  modifySelected(shiftid) {
    const temp = this.shiftlist.find((shift) => shift.SHIFT_NO == shiftid);
    if (temp) {
      this.modifyFlag = true;
      this.selectedshiftid = temp.SHIFT_NO;
      this.createshiftform.get('shiftname').setValue(temp.SHIFT_DESC);
      this.createshiftform.get('starttime').setValue(temp.START_TIME);
      this.createshiftform.get('endtime').setValue(temp.END_TIME);
      this.createshiftform.get('isactive').setValue(temp.WORKING === 'Y');

      this.selectedShop = this.shoplist.find(
        (shop) => shop.Shop_ID === temp.Shop_ID
      );

      $(window).scrollTop(0);
    }
  }

  // ********************************** Part Section End *******************************//

  // ********************************** Table Section Start *******************************//
  getTableData() {
    this.loading = true;
    if (this.plantid) {
      this.commonService
        .getShiftTableData(
          this.plantid,
          this.audittypeid,
          this.shopid,
          this.allshops
        )
        .subscribe((data) => {
          if (data) {
            this.shiftlist = data;
            // this.LoadTable(data);
            this.loading = false;
            this.filterData();
          }
        });
    }
  }

  filterData() {
    if (this.selectedShop) {
      this.filteredTableData = this.shiftlist.filter((d) => d.Shop_ID === this.selectedShop.Shop_ID);
      this.LoadTable(this.filteredTableData);
      return;
    }

    this.filteredTableData = this.shiftlist;
    this.LoadTable(this.filteredTableData);
  }

  LoadTable(jsondatas) {
    if (<any>$.fn.DataTable.isDataTable('#varianttable')) {
      $('#varianttable').dataTable().fnDestroy();
    }

    <any>$('#varianttable').DataTable({
      destroy: true,
      lengthMenu: [
        [-1, 50, 25, 10, 5],
        ['All', 50, 25, 10, 5],
      ],
      data: jsondatas,
      columnDefs: [
        { title: 'Shop', targets: 0 },
        { title: 'Shift Name', targets: 1 },
        { title: 'Start Time', targets: 2 },
        { title: 'End time', targets: 3 },
        { title: 'Active', targets: 4 },
        { title: 'Action', targets: 5 },
      ],

      columns: [
        {
          data: 'Shop_Name',
        },
        { data: 'SHIFT_DESC' },
        { data: 'START_TIME' },
        { data: 'END_TIME' },
        { data: 'WORKING' },
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
        background-color: #0b9494;
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
                this.modifySelected(rowData.SHIFT_NO);
              });
            });

            $(cell).on('click', '#deletemodelbtn', () => {
              this.ngZone.run(() => {
                // this.DeleteRecord();
                const dialogRef = this.dialog.open(DeletePopupComponent, {
                  width: '250px',
                  enterAnimationDuration: '0ms',
                  exitAnimationDuration: '0ms',
                });
                dialogRef.afterClosed().subscribe((result) => {
                  if (result) {
                    this.selectedForDelete = rowData.SHIFT_NO;
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
  // ********************************** Table Section End *******************************//

  // ********************************** Other Section Start *******************************//
  refresh() {
    this.shiftobject = [];
    this.modelList = [];
    this.newShift = false;
    this.searchshopInput = null;
    this.createshiftform.reset();
    this.createshiftform.get('isactive').setValue(true);
    this.selectedShop = null;
    this.selectedmodel = null;
    this.searchModelInput = null;
    // this.revertModelSearch();
    this.getTableData();
    if (this.selectedForDelete || this.modifyFlag) {
      this.selectedForDelete = null;
      this.modifyFlag = false;
    } else {
      this.getShopList();
    }
    $(window).scrollTop(0);
  }
  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }

  // ********************************** Other Section End *******************************//
}
