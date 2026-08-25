import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { CommonService } from '../common.service';
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
import { Parameter } from 'src/app/shared/models/parameter.model';
import { Area } from 'src/app/shared/models/area.model';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';
declare var $: any;
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
@Component({
  selector: 'app-areamaster',
  templateUrl: './areamaster.component.html',
  styleUrls: ['./areamaster.component.css'],
})
export class AreamasterComponent {
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
  selectedmodel: Model;
  searchModelInput: string;
  // Area
  newArea: boolean;
  areaObject: Area[] = [];
  selectedAreaId: number;
  selectedForDelete: number;
  //Other
  modifyFlag: boolean;
  createAreaForm: FormGroup;
  ParameterList: Parameter[] = [];
  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;
  allTableData: any[] = [];
  filteredTableData: any[] = [];
  searchInput: string;

  constructor(
    private commonService: CommonService,
    private router: Router,
    private ngZone: NgZone,
    private toster: ToastrService,
    private fb: FormBuilder,
    private cdref: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}
  ngOnInit() {
    $('#ngslide').hide();
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.audittypeid = this.commonService.getAuditType();
    this.userid = this.commonService.getUserID();
    this.plantid = this.commonService.getplantID();
    this.hostname = this.commonService.getHostData();
    this.loading = false;
    this.getTableData();
    this.getShopList();

    this.createAreaForm = this.fb.group({
      areaname: new FormControl('', [Validators.required]),
      areadesc: new FormControl(''),
      sortorder: new FormControl('', [Validators.required]),
    });

    this.commonService.getParameter().subscribe((data) => {
      if (data) {
        this.ParameterList = data;
        this.ParameterList.forEach((para) => {
          const newControl = this.fb.control(true);

          this.createAreaForm.addControl(para.Type, newControl);
        });
      }
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
        });
    }
  }
  selectShop(shop: shop) {
    if (shop) {
      this.selectedShop = shop;
      this.getModelList();
      this.filterData();
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
        this.selectedmodel = null;
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
      this.selectedmodel = model;
      this.onNewArea();
      this.filterData();

    }
  }
  isCurrentModel(model: Model) {
    if (this.selectedmodel) {
      return this.selectedmodel.Model_ID == model.Model_ID;
    } else {
      return false;
    }
  }

  // ********************************** Model Section End *******************************//
  // ********************************** Area Section Start *******************************//
  onNewArea() {
    if (!this.selectedShop) {
      this.toster.warning('Please select shop first .');
    } else if (!this.selectedmodel) {
      this.toster.warning('Please select Model first .');
    } else {
      this.newArea = true;
    }
  }

  onAddArea() {
    console.log(this.createAreaForm.value);

    if (this.createAreaForm.valid) {
      let duplicate = false;
      this.areaObject.forEach((part) => {
        if (
          part.Area_Name == this.createAreaForm.value.areaname &&
          part.Area_Desc == this.createAreaForm.value.partdesc
        ) {
          duplicate = true;
        }
      });

      this.allTableData.forEach((part) => {
        if (
          part.Area_Name == this.createAreaForm.value.areaname &&
          part.Area_Desc == this.createAreaForm.value.areadesc &&
          part.Model_ID == this.selectedmodel.Model_ID
        ) {
          duplicate = true;
        }
      });
      if (duplicate) {
        this.toster.warning('Duplicate Record found !!');
      } else {
        const temp: Area = {
          Plant_ID: this.plantid,
          Shop_ID: this.selectedShop.Shop_ID,
          Model_ID: this.selectedmodel.Model_ID,
          Area_Name: this.createAreaForm.value.areaname,
          Area_Desc: this.createAreaForm.value.areadesc,
          Inserted_Host: this.hostname,
          Inserted_User_ID: this.userid,
          Audit_Type_Id: this.audittypeid,
          SORTORDER: this.createAreaForm.value.sortorder,
          Is_Active: true,
          Plant_Code: localStorage.getItem('Plant_Code'),
        };

        // this.ParameterList.forEach((para, index) => {
        //   temp[`Is_${para.Type}`] = para.Type;
        //   temp[`Is_${para.Type}`] = this.createAreaForm.get(para.Type).value;
        // });

        // if (temp.Is_Gap != true && temp.Is_Flushness != true) {
        //   this.toster.warning(
        //     'Please select at least one Type Gap or Flushness'
        //   );
        //   return;
        // } else {
        this.areaObject.push(temp);
        const tempsort = this.createAreaForm.get('sortorder').value;
        this.createAreaForm.reset();
        // this.ParameterList.forEach((para) => {
        //   this.createAreaForm.get(para.Type).setValue(true);
        // });
        this.createAreaForm.get('sortorder').setValue(tempsort + 1);
        // }
      }
    } else {
      this.toster.warning('All fields are required !');
    }
  }
  removeObject(index: number) {
    this.areaObject.splice(index, 1);
  }

  onSave() {
    if (this.areaObject.length > 0) {
      this.commonService.saveArea(this.areaObject).subscribe((data) => {
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
  updateArea() {
    if (this.selectedmodel) {
      if (this.modifyFlag) {
        const temp: Area = {
          Area_ID: this.selectedAreaId,
          Plant_ID: this.plantid,
          Shop_ID: this.selectedShop.Shop_ID,
          Model_ID: this.selectedmodel.Model_ID,
          Area_Name: this.createAreaForm.value.areaname,
          Area_Desc: this.createAreaForm.value.areadesc,
          Updated_Host: this.hostname,
          Updated_User_ID: this.userid,
          Audit_Type_Id: this.audittypeid,
          SORTORDER: this.createAreaForm.value.sortorder,
          Is_Active: true,
          Plant_Code: localStorage.getItem('Plant_Code'),
        };

        // this.ParameterList.forEach((para, index) => {
        //   temp[`Is_${para.Type}`] = para.Type;
        //   temp[`Is_${para.Type}`] = this.createAreaForm.get(para.Type).value;
        // });
        this.commonService
          .updateArea(this.selectedAreaId, temp)
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
                this.toster.error('Something went wrong');
              }
            }
          });
      }
    } else {
      this.toster.error('Please select shop and model ...');
    }
  }

   changeStatus(rowData) {
    // rowData.Is_Active = !rowData.Is_Active;
    rowData.Updated_User_ID = this.userid;
    rowData.Updated_Host = this.hostname;
    rowData.Plant_Code = localStorage.getItem('Plant_Code');
    this.commonService
      .updateArea(rowData.Area_ID, rowData)
      .subscribe((data) => {
        if (data !== null && data !== undefined) {
          if (data.isErrorMessage) {
            this.toster.error(
              data.messageDetail,
              data.messageTitle
            );
          } else if (data.isSuccessMessage) {
            this.getTableData();
            this.toster.success(
              data.messageDetail,
              data.messageTitle
            );
          } else if (data.isAlertMessage) {
            this.toster.warning(
              data.messageDetail,
              data.messageTitle
            );
          } else {
            this.toster.error(
              data.messageDetail,
              data.messageTitle
            );
          }
        }
      });
  }

  DeleteRecord(ID:any) {
    if (ID) {
      this.commonService
        .deleteArea(ID)
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

  modifySelected(areaid) {
    const temp = this.allTableData.find((area) => area.Area_ID == areaid);
    if (temp) {
      this.modifyFlag = true;
      this.selectedAreaId = temp.Area_ID;
      this.createAreaForm.get('areaname').setValue(temp.Area_Name);
      this.createAreaForm.get('areadesc').setValue(temp.Area_Desc);
      this.createAreaForm.get('sortorder').setValue(temp.SORTORDER);
      // this.createAreaForm.get('Gap').setValue(temp.Is_Gap);
      // this.createAreaForm.get('Flushness').setValue(temp.Is_Flushness);
      this.selectedShop = this.shoplist.find(
        (shop) => shop.Shop_ID === temp.Shop_ID
      );
      this.commonService
        .getModelList(this.selectedShop.Shop_ID, this.audittypeid)
        .subscribe((res) => {
          this.modelList = res;
          this.selectedmodel = this.modelList.find(
            (model) => model.Model_ID === temp.Model_ID
          );
        });
      $(window).scrollTop(0);
    }
  }
  // ********************************** Area Section End *******************************//
  // ********************************** Table Section Start *******************************//

  getTableData() {
    if (this.plantid && this.audittypeid) {
      this.loading = true;
      this.commonService
        .getAreaTableData(
          this.plantid,
          this.audittypeid,
          this.shopid,
          this.allshops
        )
        .subscribe((data) => {
          if (data) {
            this.filterData();
            this.allTableData = data;
            this.loading = false;
            
          }
        });
    } else {
      this.router.navigate(['']);
      this.toster.error("Can't find Audit Type and Plant");
    }
  }

   // It filters data based on selection
  filterData() {
    if (this.selectedShop && this.selectedmodel ) {
      this.filteredTableData = this.allTableData.filter((d) => d.Shop_ID === this.selectedShop.Shop_ID && d.Model_ID === this.selectedmodel.Model_ID);
      return;
    }
    if (this.selectedShop) {
      this.filteredTableData = this.allTableData.filter((d) => d.Shop_ID === this.selectedShop.Shop_ID);
      return;
    }
    // this.filteredTableData = this.allTableData;
  }

  trackForLoop(index, item) {
    return item.Parameter_ID;
  }
  // LoadTable(jsondatas) {
  //   if (<any>$.fn.DataTable.isDataTable('#shopmodeltable')) {
  //     $('#shopmodeltable').dataTable().fnDestroy();
  //   }

  //   <any>$('#shopmodeltable').DataTable({
  //     destroy: true,
  //     lengthMenu: [
  //       [-1, 50, 25, 10, 5],
  //       ['All', 50, 25, 10, 5],
  //     ],
  //     data: jsondatas,
  //     columnDefs: [
  //       { title: 'Shop', targets: 0 },
  //       { title: 'Model Code', targets: 1 },
  //       { title: 'Area Name', targets: 2 },
  //       { title: 'Area Description', targets: 3 },
  //       { title: 'Sort Order', targets: 4 },
  //       { title: 'Status', targets: 5 },
  //       { title: 'Action', targets: 6 },
  //     ],

  //     columns: [
  //       {
  //         data: 'Shop_Name',
  //       },
  //       { data: 'Model_Name' },
  //       { data: 'Area_Name' },
  //       { data: 'Area_Desc' },
  //       { data: 'SORTORDER' },
  //       {
  //         data: null,
  //         render: function (data, type, row) {
  //           const canUpdate = localStorage.getItem('canUpdate') === '1';
  //           if (canUpdate) {
  //             if (data.Is_Active) {
  //               return '<span id="checkbox" class="checkbox" style="color: green;font-weight: bold;text-align:center"> <input type="checkbox" checked> Active</span>';
  //             }
  //             return '<span id="checkbox" class="checkbox" style="color: red;text-align:center"><input type="checkbox" > In Active</span>';
  //           } else {
  //             if (data.Is_Active) {
  //               return '<span  class="checkbox" style="color: green;font-weight: bold;text-align:center">  Active</span>';
  //             }
  //             return '<span class="checkbox" style="color: red;text-align:center"> In Active</span>';
  //           }
  //         },
  //         createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
  //           $(cell).on('click', '#checkbox', () => {
  //             this.ngZone.run(() => {
  //               console.log(rowData);
  //               rowData.Is_Active = !rowData.Is_Active;
  //               rowData.Updated_User_ID = this.userid;
  //               rowData.Updated_Host = this.hostname;
  //               this.commonService
  //                 .updateArea(rowData.Area_ID, rowData)
  //                 .subscribe((data) => {
  //                   if (data !== null && data !== undefined) {
  //                     if (data.isErrorMessage) {
  //                       this.toster.error(
  //                         data.messageDetail,
  //                         data.messageTitle
  //                       );
  //                     } else if (data.isSuccessMessage) {
  //                       this.refresh();
  //                       this.toster.success(
  //                         data.messageDetail,
  //                         data.messageTitle
  //                       );
  //                     } else if (data.isAlertMessage) {
  //                       this.toster.warning(
  //                         data.messageDetail,
  //                         data.messageTitle
  //                       );
  //                     } else {
  //                       this.toster.error(
  //                         data.messageDetail,
  //                         data.messageTitle
  //                       );
  //                     }
  //                   }
  //                 });
  //             });
  //           });
  //         },
  //       },
  //       {
  //         data: null,
  //         render: function (data, type, row) {
  //           const canUpdate = localStorage.getItem('canUpdate') === '1';
  //           const canDelete = localStorage.getItem('canDelete') === '1';

  //           // <span id="modifymodelbtn" class="btn fa fa-pencil" data - toggle="modal" title = "Edit"
  //           // data - target="#mymodal"  style = "border-radius: 50%!important;
  //           // background - color: #0b9494;
  //           // color: black; "
  //           // data - elemnt - obj="${data.Area_ID}" > </span>
  //           const editButton = `
  //           `;

  //           const deleteButton = `
  //             <span id="deletebtn" style="border-radius: 50%!important;
  //         background-color: #0b9494;
  //         color: black!important;" class="btn fa fa-trash deletebutton" title = "Delete"  
  //                  data-element-id="${data.Area_ID}"></span>`;

  //           if (canUpdate && canDelete) {
  //             return `<div style="text-align:center" >${editButton}${deleteButton}</div>`;
  //           } else if (canUpdate) {
  //             return `<div style="text-align:center" >${editButton}</div>`;
  //           } else if (canDelete) {
  //             return `<div style="text-align:center" >${deleteButton}</div>`;
  //           }

  //           return '';
  //         },
  //         createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
  //           $(cell).on('click', '#modifymodelbtn', () => {
  //             this.ngZone.run(() => {
  //               // console.log(rowData.Area_ID);
  //               this.modifySelected(rowData.Area_ID);
  //             });
  //           });
  //           $(cell).on('click', '#deletebtn', () => {
  //             this.ngZone.run(() => {
  //               const dialogRef = this.dialog.open(DeletePopupComponent, {
  //                 width: '250px',
  //                 enterAnimationDuration: '0ms',
  //                 exitAnimationDuration: '0ms',
  //               });
  //               dialogRef.afterClosed().subscribe((result) => {
  //                 console.log('The dialog was closed' + result);
  //                 if (result) {
  //                   this.selectedForDelete = rowData.Area_ID;
  //                   this.DeleteRecord();
  //                 }
  //               });
  //             });
  //           });
  //         },
  //       },
  //     ],
  //   });
  // }
  // ********************************** Table Section End *******************************//
  // ********************************** Other Section Start *******************************//
  refresh() {
    this.areaObject = [];
    this.modelList = [];
    this.newArea = false;
    this.searchshopInput = null;
    this.createAreaForm.reset();
    // this.ParameterList.forEach((para) => {
    //   this.createAreaForm.get(para.Type).setValue(true);
    // });
    this.selectedShop = null;
    this.selectedmodel = null;
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

  async downloadExcel() {
    if (this.filteredTableData) {
      const desiredSequence = [
        'Shop_Name',
        'Model_Name',
        'Category',
        'Parameter_Name',
        'Para_Type_Name',
        'SORTORDER',
      ];
      const reorderObject = (obj, keys) =>
        Object.fromEntries(keys.map((key) => [key, obj[key]]));
      const reorderedArray = await this.filteredTableData.map((obj) =>
        reorderObject(obj, desiredSequence)
      );
      const arrayOfValues = await reorderedArray.map((obj) =>
        Object.values(obj)
      );
      this.generateExcel(arrayOfValues);
    }
  }

  async generateExcel(data) {
    // Excel Title, Header, Data
    const title = 'Parameter Master';
    const header = ['Shop', 'Model', 'Category', 'Parameter', 'Parameter Type', 'SORTORDER'];

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Parameter Master');

    // Add Row and formatting
    const titleRow = worksheet.addRow([title]);
    titleRow.font = {
      size: 16,
      // underline: 'double',
      bold: true,
    };
    titleRow.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A1:F1');
    const headerRow = worksheet.addRow(header);
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' },
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
    headerRow.alignment = { horizontal: 'center' };

    data.forEach((d) => {
      const row = worksheet.addRow(d);
      row.alignment = { horizontal: 'center' };
    });

    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 40;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;

    worksheet.addRow([]);

    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, 'Parameter_Master_Data' + '.xlsx');
    });
  }

}
