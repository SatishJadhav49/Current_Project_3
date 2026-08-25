import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Model } from 'src/app/shared/models/model.model';
import { Part } from 'src/app/shared/models/part.model';
import { shop } from 'src/app/shared/models/shop.model';
import { CommonService } from '../common.service';
import { Area } from 'src/app/shared/models/area.model';
import { Parameter } from 'src/app/shared/models/parameter.model';
import { MatDialog } from '@angular/material/dialog';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
declare var $: any;

@Component({
  selector: 'app-partmaster',
  templateUrl: './partmaster.component.html',
  styleUrls: ['./partmaster.component.css'],
})
export class PartmasterComponent {
  //Developer = Satish Jadhav
  // Token No.= 50005817
  // New Development
  // ********************************** Declaration Section Start *******************************//
  audittypeid: number;
  userid: number;
  hostname: string;
  plantid: number;
  newPart: boolean;
  selectedpartid: number;
  searchshopInput: string;
  shoplist: shop[];
  modelList: Model[];
  partObject: Part[] = [];
  partlist: Part[] = [];
  TotalData: Part[] = [];
  selectedForDelete: number;
  modifyFlag: boolean;
  selectedShop: shop;
  searchModelInput: string;
  selectedmodel: Model;
  loading: boolean = false;
  createPartForm: FormGroup;
  ParameterList: Parameter[] = [];
  searchInput: string = '';
  // area
  searchAreaInput: string;
  AreaList: Area[] = [];
  selectedArea: Area;

  // other
  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;

  constructor(
    private commonService: CommonService,
    private toaster: ToastrService,
    private router: Router,
    private ngZone: NgZone,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    $('#ngslide').hide();
    // $('.sidebar-mini').addClass('sidebar-collapse');
    $(window).scrollTop(0);
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.userid = this.commonService.getUserID();
    this.plantid = this.commonService.getplantID();
    this.hostname = this.commonService.getHostData();
    this.newPart = false;
    this.modifyFlag = false;
    this.getShopList();
    // this.getTableData();

    this.createPartForm = this.fb.group({
      partname: new FormControl('', [Validators.required]),
      partdesc: new FormControl(''),
      sortorder: new FormControl(''),
    });

    this.commonService.getParameter().subscribe((data) => {
      if (data) {
        this.ParameterList = data;
        this.ParameterList.forEach((para) => {
          const newControl = this.fb.control(true, Validators.required);
          this.createPartForm.addControl(para.Type, newControl);
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
      // this.selectedshopid = shop.Shop_ID;
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
      this.getAreaList();
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
  getAreaList() {
    if (this.selectedmodel) {
      this.selectedArea = null;
      this.commonService
        .getAreaList(this.selectedmodel.Model_ID, this.audittypeid)
        .subscribe((res) => {
          this.AreaList = res;
        });
    }
  }
  selectArea(area: Area) {
    if (area) {
      this.selectedArea = area;
      this.filterData();
      // Logic to get max sort order in perticular area
      const temp = this.partlist.reduce((max, current) => {
        if (
          current.Area_ID === this.selectedArea.Area_ID &&
          current.SORTORDER > max
        ) {
          return current.SORTORDER;
        }
        return max;
      }, 0);
      this.createPartForm.get('sortorder').setValue(temp + 1);
      this.onNewPart();
    }
  }
  isCurrentArea(area: Area) {
    if (this.selectedArea) {
      return this.selectedArea.Area_ID == area.Area_ID;
    } else {
      return false;
    }
  }

  // ********************************** Area Section End *******************************//
  // ********************************** Part Section Start *******************************//

  onNewPart() {
    if (!this.selectedShop) {
      this.toaster.warning('Please select shop  .');
    } else if (!this.selectedmodel) {
      this.toaster.warning('Please select Model  .');
    } else if (!this.selectedArea) {
      this.toaster.warning('Please select Area .');
    } else {
      this.newPart = true;
    }
  }

  onAddPart() {
    if (this.createPartForm.valid) {
      let duplicate = false;
      this.partObject.forEach((part) => {
        if (
          part.Part_Name == this.createPartForm.value.partname &&
          part.Part_Desc == this.createPartForm.value.partname &&
          part.Area_ID == this.selectedArea.Area_ID
        ) {
          duplicate = true;
        }
      });

      this.partlist.forEach((part) => {
        if (
          part.Part_Name == this.createPartForm.value.partname &&
          part.Part_Desc == this.createPartForm.value.partname &&
          part.Area_ID == this.selectedArea.Area_ID
        ) {
          duplicate = true;
        }
      });
      if (duplicate) {
        this.toaster.warning('Duplicate Record found !!');
      } else {
        const temp: Part = {
          Plant_ID: this.plantid,
          Inserted_Host: this.hostname,
          Inserted_User_ID: this.userid,
          Audit_Type_Id: this.audittypeid,
          Shop_ID: this.selectedShop.Shop_ID,
          Model_ID: this.selectedmodel.Model_ID,
          Part_Name: this.createPartForm.value.partname,
          Part_Desc: this.createPartForm.value.partname,
          Area_ID: this.selectedArea.Area_ID,
          SORTORDER: this.createPartForm.get('sortorder').value,
          Is_Active: true,
          Plant_Code: localStorage.getItem('Plant_Code'),
        };
        this.ParameterList.forEach((para, index) => {
          temp[`Is_${para.Type}`] = para.Type;
          temp[`Is_${para.Type}`] = this.createPartForm.get(para.Type).value;
        });

        if (temp.Is_Gap != true && temp.Is_Flushness != true) {
          this.toaster.warning(
            'Please select at least one Type Gap or Flushness'
          );
          return;
        } else {
          this.partObject.push(temp);
          const tempsort = this.createPartForm.get('sortorder').value;
          this.createPartForm.reset();
          this.ParameterList.forEach((para) => {
            this.createPartForm.get(para.Type).setValue(true);
          });
          this.createPartForm.get('sortorder').setValue(tempsort + 1);
        }
      }
    } else {
      this.toaster.warning('All fields are required !');
    }
  }
  removeObject(index: number) {
    this.partObject.splice(index, 1);
  }

  onPartsSave() {
    if (this.partObject.length > 0) {
      this.commonService.savePart(this.partObject).subscribe((data) => {
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

  updatePart() {
    if (this.selectedArea) {
      if (this.modifyFlag) {
        const temp: Part = {
          Part_ID: this.selectedpartid,
          Plant_ID: this.plantid,
          Shop_ID: this.selectedShop.Shop_ID,
          Model_ID: this.selectedmodel.Model_ID,
          Part_Name: this.createPartForm.value.partname,
          Part_Desc: this.createPartForm.value.partname,
          Updated_Host: this.hostname,
          Updated_User_ID: this.userid,
          Audit_Type_Id: this.audittypeid,
          Area_ID: this.selectedArea.Area_ID,
          SORTORDER: this.createPartForm.value.sortorder,
          Is_Active: true,
          Plant_Code: localStorage.getItem('Plant_Code'),
        };
        this.ParameterList.forEach((para, index) => {
          temp[`Is_${para.Type}`] = para.Type;
          temp[`Is_${para.Type}`] = this.createPartForm.get(para.Type).value;
        });
        this.commonService
          .updatePart(this.selectedpartid, temp)
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
    } else {
      if (!this.selectedShop) {
        this.toaster.warning('Please select shop  .');
        return;
      }
      if (!this.selectedmodel) {
        this.toaster.warning('Please select Model  .');
        return;
      }
      if (!this.selectedArea) {
        this.toaster.warning('Please select Area .');
        return;
      }
    }
  }

  DeleteRecord(Part_ID) {
    this.ngZone.run(() => {
      const dialogRef = this.dialog.open(DeletePopupComponent, {
        width: '250px',
        enterAnimationDuration: '0ms',
        exitAnimationDuration: '0ms',
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log('The dialog was closed' + result);
        if (result) {
          this.commonService.deletePart(Part_ID).subscribe((data) => {
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
        }
      });
    });
  }
  closeDeleteRecord() {
    this.selectedForDelete = null;
    $('.close').click();
  }

  modifySelected(partid) {
    const temp = this.partlist.find((part) => part.Part_ID == partid);
    if (temp) {
      if (!temp.Is_Active) {
        this.toaster.warning('This part is inactive, please activate it first');
        return;
      }
      this.modifyFlag = true;
      this.selectedpartid = temp.Part_ID;
      this.createPartForm.get('partname').setValue(temp.Part_Name);
      this.createPartForm.get('partdesc').setValue(temp.Part_Desc);
      this.createPartForm.get('sortorder').setValue(temp.SORTORDER);
      this.createPartForm.get('Gap').setValue(temp.Is_Gap);
      this.createPartForm.get('Flushness').setValue(temp.Is_Flushness);
      this.selectedShop = this.shoplist.find(
        (shop) => shop.Shop_ID === temp.Shop_ID
      );
      this.commonService
        .getModelList(temp.Shop_ID, this.audittypeid)
        .subscribe((res) => {
          this.modelList = res;
          this.selectedmodel = this.modelList.find(
            (model) => model.Model_ID === temp.Model_ID
          );
        });
      this.commonService
        .getAreaList(temp.Model_ID, this.audittypeid)
        .subscribe((data) => {
          if (data) {
            this.AreaList = data;
            this.selectedArea = this.AreaList.find(
              (area) => area.Area_ID == temp.Area_ID
            );
          }
        });
      $(window).scrollTop(0);
    }
  }

  onStatusChange(data) {
    // data.Is_Active = !data.Is_Active;
    data.Updated_User_ID = this.userid;
    data.Updated_Host = this.hostname;
    this.commonService
      .updatePart(data.Part_ID, data)
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
            this.toaster.error(data.messageDetail, data.messageTitle);
          }
        }
      });
  }

  // ********************************** Part Section End *******************************//

  // ********************************** Table Section Start *******************************//
  filterData() {
    if (this.selectedShop && this.selectedmodel && this.selectedArea) {
      this.partlist = this.TotalData.filter((part) => {
        return (
          part.Shop_ID == this.selectedShop.Shop_ID &&
          part.Model_ID == this.selectedmodel.Model_ID &&
          part.Area_ID == this.selectedArea.Area_ID
        );
      });
      return;
    }
    if (this.selectedShop && this.selectedmodel) {
      this.partlist = this.TotalData.filter((part) => {
        return (
          part.Shop_ID == this.selectedShop.Shop_ID &&
          part.Model_ID == this.selectedmodel.Model_ID
        );
      });
      return;
    }
    this.partlist = this.TotalData;
    return;
  }
  getTableData() {
    this.loading = true;
    if (this.plantid) {
      this.commonService
        .getPartTableData(
          this.plantid,
          this.audittypeid,
          this.selectedShop.Shop_ID,
          this.allshops
        )
        .subscribe((data) => {
          if (data) {
            this.TotalData = data;
            this.filterData();
            // this.LoadTable(data);
            this.loading = false;
          }
        });
    }
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
  //       { title: 'Area ', targets: 2 },
  //       { title: 'Part Name', targets: 3 },
  //       { title: 'Type', targets: 4 },
  //       { title: 'Sort Order', targets: 5 },
  //       { title: 'Status', targets: 6 },
  //       { title: 'Action', targets: 7 },
  //     ],

  //     columns: [
  //       {
  //         data: 'Shop_Name',
  //       },
  //       { data: 'Model_Name' },
  //       { data: 'Area_Name' },
  //       { data: 'Part_Name' },
  //       {
  //         data: null,
  //         render: function (data, type, row) {
  //           if (data.Is_Gap && data.Is_Flushness) {
  //             return `<div  >Gap/Flush</div>`;
  //           }
  //           if (data.Is_Gap) {
  //             return `<div  >Gap</div>`;
  //           }
  //           if (data.Is_Flushness) {
  //             return `<div  >Flushness</div>`;
  //           }
  //           return '';
  //         },
  //       },
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
  //                 .updatePart(rowData.Part_ID, rowData)
  //                 .subscribe((data) => {
  //                   if (data !== null && data !== undefined) {
  //                     if (data.isErrorMessage) {
  //                       this.toaster.error(
  //                         data.messageDetail,
  //                         data.messageTitle
  //                       );
  //                     } else if (data.isSuccessMessage) {
  //                       this.refresh();
  //                       this.toaster.success(
  //                         data.messageDetail,
  //                         data.messageTitle
  //                       );
  //                     } else if (data.isAlertMessage) {
  //                       this.toaster.warning(
  //                         data.messageDetail,
  //                         data.messageTitle
  //                       );
  //                     } else {
  //                       this.toaster.error(
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
  //           const canUpdate = localStorage.getItem('canUpdate') === '1'; //1=true
  //           const canDelete = localStorage.getItem('canDelete') === '1';
  //           // <span id="modifyebtn" class="btn fa fa-pencil modifycheckBtn modifybtn" data - toggle="modal" title = "Edit"
  //           // style = "border-radius: 50%!important; background-color: #0b9494; color: black;"
  //           // data - target="#mymodal" data - element - obj="${data.Part_ID}" > </span>
  //           const editButton = `
  //          `;

  //           const deleteButton = `
  //             <span id="deletebtn" class="btn fa fa-trash deletebutton deletesbtn" title="Delete"
  //               style="border-radius: 50%!important; background-color: #0b9494; color: black!important;"
  //               data-element-id="${data.Part_ID}"></span>`;

  //           if (canUpdate && canDelete) {
  //             return `${editButton}${deleteButton}`;
  //           } else if (canUpdate) {
  //             return editButton;
  //           } else if (canDelete) {
  //             return deleteButton;
  //           }

  //           return '';
  //         },
  //         createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
  //           // Add an event listener for the "Edit" button
  //           $(cell).on('click', '#modifyebtn', () => {
  //             this.ngZone.run(() => {
  //               this.modifySelected(rowData.Part_ID);
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
  //                   this.selectedForDelete = rowData.Part_ID;
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
    this.partObject = [];
    this.selectedArea = null;
    this.newPart = false;
    this.searchshopInput = null;
    this.createPartForm.reset();
    this.searchModelInput = null;
    this.searchAreaInput = null;
    this.getTableData();
    if (this.selectedForDelete || this.modifyFlag) {
      this.selectedForDelete = null;
      this.modifyFlag = false;
    } else {
      // this.getShopList();
    }
    this.ParameterList.forEach((para) => {
      this.createPartForm.get(para.Type).setValue(true);
    });
    $(window).scrollTop(0);
  }
  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }
  trackForLoop(index, item) {
    return item.Part_ID;
  }
  // ********************************** Other Section End *******************************//
}
