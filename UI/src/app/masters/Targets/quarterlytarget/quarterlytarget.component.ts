import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  NgZone,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Model } from 'src/app/shared/models/model.model';
import { shop } from 'src/app/shared/models/shop.model';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';
declare var $: any;

import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { MatDatepicker } from '@angular/material/datepicker';
import { CommonService } from '../../common/common.service';
import { TargetService } from '../target.service';
import { FQTarget } from 'src/app/shared/models/FQTarget.model';
export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-quarterlytarget',
  templateUrl: './quarterlytarget.component.html',
  styleUrls: ['./quarterlytarget.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS,
    },
  ],
})
export class QuarterlytargetComponent implements AfterViewChecked {
  //Developer = Satish Jadhav
  // Token No.= 50005817
  // New Development
  // ********************************** Declaration Section Start *******************************//
  audittypeid: number;
  userid: number;
  plantid: number;
  hostname: string;
  loading: boolean;

  // Shop
  shoplist: shop[];
  selectedShop: shop;
  searchshopInput: string;
  // Model
  modelList: Model[];
  selectedmodel: Model[];
  searchModelInput: string;
  // fy
  newFQTarget: boolean;
  targetObj: FQTarget[] = [];
  targetList: FQTarget[] = [];
  selectedTargetID: number;
  selectedForDelete: number;
  //Other
  modifyFlag: boolean;
  createStageForm: FormGroup;
  filteredTableData: FQTarget[] = [];
  //
  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;
  // year
  selectYear: any;
  @ViewChild('picker', { static: false })
  private picker!: MatDatepicker<Date>;

  quarterList = ['Q1', 'Q2', 'Q3', 'Q4'];
  chosenYearHandler(ev, input) {
    let { _d } = ev;
    this.selectYear = _d;
    this.picker.close();
  }
  constructor(
    private commonService: CommonService,
    private router: Router,
    private ngZone: NgZone,
    private toster: ToastrService,
    private fb: FormBuilder,
    private cdref: ChangeDetectorRef,
    private dialog: MatDialog,
    private targetService: TargetService
  ) { }
  ngOnInit() {
    $('#ngslide').hide();
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1';
    this.audittypeid = this.commonService.getAuditType();
    this.userid = this.commonService.getUserID();
    this.plantid = this.commonService.getplantID();
    this.hostname = this.commonService.getHostData();
    this.loading = false;
    // this.getTableData();
    this.getShopList();

    this.createStageForm = this.fb.group({
      quarter: new FormControl('', [Validators.required]),
      l3: new FormControl('', [Validators.required]),
      l4: new FormControl('', [Validators.required]),
    });
  }

  ngAfterViewChecked() {
    this.commonService.getUserRights();
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
    this.canCreate = this.commonService.canCreate();

    this.cdref.detectChanges();
  }
  // ********************************** Declaration Section End *******************************//

  // ************************************ Shop Section Start **************************************//

  getShopList() {
    if (!this.shoplist) {
      this.commonService
        .getShopListForPlant(
          this.plantid,
          this.audittypeid,
          this.shopid,
          this.allshops
        )
        .subscribe((data) => {
          this.shoplist = data;
          if (!this.modifyFlag && this.shoplist.length === 1) {
            this.selectShop(this.shoplist[0]);
          }
        });
    }
  }

  selectShop(shop: shop) {
    if (shop) {
      this.selectedShop = shop;
      this.getModelList();
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
  // ********************************** Model Section Start *******************************//
  getModelList() {
    if (this.selectedShop) {
      if (!this.modifyFlag) {
        this.selectedmodel = [];
      }
      this.commonService
        .getModelList(this.selectedShop.Shop_ID, this.audittypeid)
        .subscribe((res) => {
          this.modelList = res;
        });
    }
  }

  selectModel(model: Model) {
    if (model) {
      this.selectedmodel = [];
      this.selectedmodel.push(model);
      this.onnewFQTarget();
      this.filterData();
    }
  }
  isCurrentModel(model: Model) {
    const temp = this.selectedmodel?.find((m) => m.Model_ID === model.Model_ID);
    if (temp) {
      return true;
    }
    return false;
  }

  // ********************************** Model Section End *******************************//
  // ********************************** Area Section Start *******************************//
  onnewFQTarget() {
    if (!this.selectedShop) {
      this.toster.warning('Please select shop first .');
      this.newFQTarget = false;
    } else if (this.selectedmodel.length <= 0) {
      this.toster.warning('Please select Model first .');
      this.newFQTarget = false;
    } else {
      this.newFQTarget = true;
    }
  }

  onAddArea() {
    if (!this.selectYear) {
      this.toster.warning('Please select Year');
      return;
    }
    if (this.createStageForm.valid) {
      let duplicate = false;
      this.targetObj.forEach((part) => {
        if (part.FY_Name == this.selectYear) {
          duplicate = true;
        }
      });

      this.targetList.forEach((part) => {
        if (part.FY_Name == this.selectYear) {
          duplicate = true;
        }
      });
      if (duplicate) {
        this.toster.warning('Duplicate Record found !!');
      } else {
        const temp: FQTarget = {
          Plant_ID: this.plantid,
          Shop_ID: this.selectedShop.Shop_ID,
          Model_ID: this.selectedmodel[0].Model_ID,
          FY_Name: this.selectYear.getFullYear(),
          Inserted_Host: this.hostname,
          Inserted_User_ID: this.userid,
          Audit_Type_Id: this.audittypeid,
          FQ_Target_L3: this.createStageForm.value.l3,
          FQ_Target_L4: this.createStageForm.value.l4,
          FQ_Name: this.createStageForm.value.quarter,
          Plant_Code: localStorage.getItem('Plant_Code')
        };
        this.selectYear = null;
        this.targetObj.push(temp);
        this.createStageForm.reset();
      }
    } else {
      this.toster.warning('All fields are required !');
    }
  }
  removeObject(index: number) {
    this.targetObj.splice(index, 1);
  }

  onSave() {
    if (this.targetObj.length > 0) {
      const temp: FQTarget[] = [];
      for (let i = 0; i < this.selectedmodel.length; i++) {
        for (let j = 0; j < this.targetObj.length; j++) {
          const t = { ...this.targetObj[j] }; // Create a copy of the targetObj[j] object
          t.Model_ID = this.selectedmodel[i].Model_ID;
          temp.push(t);
        }
      }
      this.targetService.saveFQTarget(temp).subscribe((data) => {
        if (data !== null && data !== undefined) {
          if (data.isErrorMessage) {
            this.toster.error(data.messageDetail, data.messageTitle);
          } else if (data.isSuccessMessage) {
            this.refresh();
            this.toster.success(data.messageDetail, data.messageTitle);
          } else if (data.isAlertMessage) {
            this.toster.warning(data.messageDetail, data.messageTitle);
          } else {
            this.toster.error('Something went wrong');
          }
        }
      });
    }
  }
  updateStage() {
    if (this.selectedmodel.length >= 0) {
      if (this.modifyFlag) {
        const temp: FQTarget = {
          FQ_Target_ID: this.selectedTargetID,
          Plant_ID: this.plantid,
          Shop_ID: this.selectedShop.Shop_ID,
          Model_ID: this.selectedmodel[0].Model_ID,
          FY_Name: this.selectYear.getFullYear(),
          Updated_Host: this.hostname,
          Updated_User_ID: this.userid,
          Audit_Type_Id: this.audittypeid,
          FQ_Target_L3: this.createStageForm.value.l3,
          FQ_Target_L4: this.createStageForm.value.l4,
          FQ_Name: this.createStageForm.value.quarter,
          Plant_Code: localStorage.getItem('Plant_Code')
        };

        this.targetService
          .updateFQTarget(this.selectedTargetID, temp)
          .subscribe((data) => {
            if (data !== null && data !== undefined) {
              if (data.isErrorMessage) {
                this.toster.error(data.messageDetail, data.messageTitle);
              } else if (data.isSuccessMessage) {
                this.refresh();
                this.toster.success(data.messageDetail, data.messageTitle);
              } else if (data.isAlertMessage) {
                this.toster.warning(data.messageDetail, data.messageTitle);
              } else {
                this.toster.error(data.messageDetail, data.messageTitle);
              }
            }
          });
      }
    } else {
      this.toster.error('Please select shop and model ...');
    }
  }

  DeleteRecord(id) {
    this.selectedForDelete = id;
    if (this.selectedForDelete) {
      this.targetService
        .deleteFQTarget(this.selectedForDelete)
        .subscribe((data) => {
          if (data == null || data == undefined || data == '') {
            this.toster.error(
              'Can not delete  Record  ',
              'Unable to Connect to server! '
            );
          } else if (data.isErrorMessage) {
            this.toster.error(data.messageDetail, data.messageTitle);
          } else if (data.isSuccessMessage) {
            this.refresh();
            this.toster.success(data.messageDetail, data.messageTitle);
          } else if (data.isAlertMessage) {
            this.toster.warning(data.messageDetail, data.messageTitle);
          }
        });
    }
  }
  modifySelected(targetid) {
    const temp = this.targetList.find(
      (target) => target.FQ_Target_ID == targetid
    );
    if (temp) {
      this.modifyFlag = true;
      this.selectedTargetID = temp.FQ_Target_ID;
      this.selectYear = temp.FY_Name;
      this.selectYear = new Date(temp.FY_Name, 0, 1);
      this.createStageForm.get('l3').setValue(temp.FQ_Target_L3);
      this.createStageForm.get('l4').setValue(temp.FQ_Target_L4);
      this.createStageForm.get('quarter').setValue(temp.FQ_Name);

      this.selectedShop = this.shoplist.find(
        (shop) => shop.Shop_ID === temp.Shop_ID
      );
      this.commonService
        .getModelList(this.selectedShop.Shop_ID, this.audittypeid)
        .subscribe((res) => {
          this.modelList = res;
          const model = this.modelList.find(
            (model) => model.Model_ID === temp.Model_ID
          );
          this.selectedmodel = [];
          this.selectedmodel.push(model);
        });
      $(window).scrollTop(0);
    }
  }
  // ********************************** Area Section End *******************************//
  // ********************************** Table Section Start *******************************//

  getTableData() {
    if (this.plantid && this.audittypeid) {
      this.loading = true;
      this.targetService
        .getFQTargetTableData(
          this.plantid,
          this.audittypeid,
          this.shopid,
          this.allshops
        )
        .subscribe((data) => {
          if (data) {
            // this.LoadTable(data);
            this.targetList = data;
            this.loading = false;
            this.filterData();
          }
        }, err => {
          console.log(err);
          this.toster.error(err.message)
        });
    } else {
      this.router.navigate(['']);
      this.toster.error("Can't find Audit Type and Plant");
    }
  }

  filterData() {
    if (this.selectedShop && this.selectedmodel && this.selectedmodel.length > 0) {
      this.filteredTableData = this.targetList.filter((d) => d.Shop_ID === this.selectedShop.Shop_ID && d.Model_ID === this.selectedmodel[0].Model_ID);
      this.LoadTable(this.filteredTableData);
      return;
    }

    if (this.selectedShop) {
      this.filteredTableData = this.targetList.filter((d) => d.Shop_ID === this.selectedShop.Shop_ID);
      this.LoadTable(this.filteredTableData);
      return;
    }

    this.filteredTableData = this.targetList;
    this.LoadTable(this.filteredTableData);
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
        { title: 'Model', targets: 1 },
        { title: 'Year', targets: 2 },
        { title: 'Quarter', targets: 3 },
        { title: 'L3 Target', targets: 4 },
        { title: 'L4 Target', targets: 5 },
        { title: 'Action', targets: 6 },
      ],
      columns: [
        { data: 'Shop_Name' },
        { data: 'Model_Name' },
        { data: 'FY_Name' },
        { data: 'FQ_Name' },
        { data: 'FQ_Target_L3' },
        { data: 'FQ_Target_L4' },
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
                     data-elemnt-obj="${data.FQ_Target_ID}"></span>`;
            const deleteButton = `
            <span id="deletemodelbtn" style="border-radius: 50%!important;
            background-color: #d74f4f;
            color: black!important;" class="btn fa fa-trash deletebutton" title = "Delete"
                     data-element-id="${data.FQ_Target_ID}"></span> `;
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
                // console.log(rowData.FQ_Target_ID);
                this.modifySelected(rowData.FQ_Target_ID);
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
                    this.selectedForDelete = rowData.FQ_Target_ID;
                    this.DeleteRecord(rowData.FQ_Target_ID);
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
    this.targetObj = [];

    this.searchshopInput = null;
    this.selectedmodel = [];
    this.selectYear = null;
    this.createStageForm.reset();
    this.newFQTarget = false;
    if (!this.shoplist || this.shoplist.length != 1) {
      this.selectedShop = null;
      this.modelList = [];
    }

    this.searchModelInput = null;
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
