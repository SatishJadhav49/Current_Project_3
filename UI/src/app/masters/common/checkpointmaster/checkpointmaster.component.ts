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
import { CheckPoint } from 'src/app/shared/models/checkpoint.model';
import { MatDialog } from '@angular/material/dialog';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
declare var $: any;
@Component({
  selector: 'app-checkpointmaster',
  templateUrl: './checkpointmaster.component.html',
  styleUrls: ['./checkpointmaster.component.css'],
})
export class CheckpointmasterComponent {
  //Developer = Satish Jadhav
  // Token No.= 50005817
  // New Development
  // ********************************** Declaration Section Start *******************************//
  audittypeid: number;
  userid: number;
  hostname: string;
  plantid: number;
  newCP: boolean;
  selectedckpid: number;
  searchshopInput: string;
  shoplist: shop[];
  modelList: Model[];
  selectedForDelete: number;
  modifyFlag: boolean;
  selectedShop: shop;
  searchModelInput: string;
  selectedmodel: Model;
  loading: boolean = false;
  createCheckPointForm: FormGroup;
  ParameterList: Parameter[] = [];
  isParallelism: boolean = false;
  isAClass: boolean = false; // A class check point : yes / no
  // area
  searchAreaInput: string;
  AreaList: Area[] = [];
  selectedArea: Area;

  // Part
  searchPartInput: string;
  selectedpart: Part;
  partlist: Part[] = [];
  Is_Flushness: boolean;
  Is_Gap: boolean;

  // Check Point
  cpObject: CheckPoint[] = [];
  cpList: CheckPoint[] = [];

  // other
  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;
  searchInput: string = '';
  TotalData: CheckPoint[] = [];

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
    $('.sidebar-mini').addClass('sidebar-collapse');
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    $(window).scrollTop(0);
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.userid = this.commonService.getUserID();
    this.plantid = this.commonService.getplantID();
    this.hostname = this.commonService.getHostData();
    this.newCP = false;
    this.modifyFlag = false;
    this.getShopList();
    // this.getTableData();

    this.createCheckPointForm = this.fb.group({
      checkpoint: new FormControl('', [Validators.required]),
      cpdesc: new FormControl(''),
      sortorder: new FormControl(''),
      parallelism: new FormControl(''),
    });

    this.commonService.getParameter().subscribe((data) => {
      if (data) {
        this.ParameterList = data;
        this.ParameterList.forEach((para) => {
          const newControl = this.fb.control(true, Validators.required);
          this.createCheckPointForm.addControl(para.Type, newControl);
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
      this.selectedpart = null;
      this.partlist = null;
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
      this.getPartList();
      this.filterData();

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
  getPartList() {
    if (this.selectedArea) {
      this.selectedpart = null;
      this.commonService
        .getPartList(this.selectedArea.Area_ID, this.audittypeid)
        .subscribe((res) => {
          this.partlist = res;
        });
    }
  }

  selectPart(part: Part) {
    if (part) {
      this.selectedpart = part;
      this.filterData();
      this.Is_Gap = this.selectedpart.Is_Gap;
      this.Is_Flushness = this.selectedpart.Is_Flushness;
      this.createCheckPointForm.get('Gap').setValue(this.Is_Gap);
      this.createCheckPointForm.get('Flushness').setValue(this.Is_Flushness);

      const temp = this.cpList.reduce((max, current) => {
        if (
          current.Part_ID === this.selectedpart.Part_ID &&
          current.SORTORDER > max
        ) {
          return current.SORTORDER;
        }
        return max;
      }, 0);
      this.createCheckPointForm.get('sortorder').setValue(temp + 1);
      this.onnewCP();
    }
  }
  isCurrentPart(Part: Part) {
    if (this.selectedpart) {
      return this.selectedpart.Part_ID == Part.Part_ID;
    } else {
      return false;
    }
  }
  // ********************************** Part Section End *******************************//

  // ********************************** Check Point Section Start *******************************//
  onnewCP() {
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
    if (!this.selectedpart) {
      this.toaster.warning('Please select Part .');
      return;
    }
    {
      this.newCP = true;
      return;
    }
  }

  onAddCP() {
    if (this.createCheckPointForm.valid) {
      let duplicate = false;
      this.cpObject.forEach((CP) => {
        if (
          CP.Checkpoint_Name == this.createCheckPointForm.value.checkpoint &&
          CP.Checkpoint_Desc == this.createCheckPointForm.value.checkpoint &&
          CP.Area_ID == this.selectedArea.Area_ID &&
          CP.Part_ID == this.selectedpart.Part_ID
        ) {
          duplicate = true;
        }
      });

      this.cpList.forEach((CP) => {
        if (
          CP.Checkpoint_Name == this.createCheckPointForm.value.checkpoint &&
          CP.Checkpoint_Desc == this.createCheckPointForm.value.checkpoint &&
          CP.Area_ID == this.selectedArea.Area_ID &&
          CP.Part_ID == this.selectedpart.Part_ID
        ) {
          duplicate = true;
        }
      });
      if (this.isParallelism && !this.createCheckPointForm.value.parallelism) {
        this.toaster.warning('Please Enter Parallelism Value !');
        return;
      }
      if (duplicate) {
        this.toaster.warning('Duplicate Record found !!');
      } else {
        const temp: CheckPoint = {
          Plant_ID: this.plantid,
          Inserted_Host: this.hostname,
          Inserted_User_ID: this.userid,
          Audit_Type_Id: this.audittypeid,
          Shop_ID: this.selectedShop.Shop_ID,
          Plant_Code: localStorage.getItem('Plant_Code'),
          Model_ID: this.selectedmodel.Model_ID,
          Checkpoint_Name: this.createCheckPointForm.value.checkpoint,
          Checkpoint_Desc: this.createCheckPointForm.value.checkpoint,
          Area_ID: this.selectedArea.Area_ID,
          Part_ID: this.selectedpart.Part_ID,
          Is_Active: true,
          Is_A_Class: this.isAClass,
          SORTORDER: this.createCheckPointForm.get('sortorder').value,
          Parallelism: this.isParallelism
            ? this.createCheckPointForm.value.parallelism
            : null,
        };
        this.ParameterList.forEach((para, index) => {
          temp[`Is_${para.Type}`] = para.Type;
          temp[`Is_${para.Type}`] = this.createCheckPointForm.get(
            para.Type
          ).value;
        });
        if (temp.Is_Gap != true && temp.Is_Flushness != true) {
          this.toaster.warning(
            'Please select at least one Type Gap or Flushness'
          );
          return;
        } else {
          this.cpObject.push(temp);
          const tempsort = this.createCheckPointForm.get('sortorder').value;
          this.createCheckPointForm.reset();
          this.isAClass = false;
          this.ParameterList.forEach((para) => {
            this.createCheckPointForm.get(para.Type).setValue(true);
          });
          this.createCheckPointForm.get('sortorder').setValue(tempsort + 1);
        }
      }
    } else {
      this.toaster.warning('All fields are required !');
    }
  }
  removeObject(index: number) {
    this.cpObject.splice(index, 1);
  }

  onSave() {
    if (this.cpObject.length > 0) {
      this.commonService.saveCP(this.cpObject).subscribe((data) => {
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

  updateCP() {
    if (this.selectedpart) {
      if (this.modifyFlag) {
        const temp: CheckPoint = {
          Checkpoint_ID: this.selectedckpid,
          Plant_ID: this.plantid,
          Audit_Type_Id: this.audittypeid,
          Shop_ID: this.selectedShop.Shop_ID,
          Model_ID: this.selectedmodel.Model_ID,
          Updated_Host: this.hostname,
          Plant_Code: localStorage.getItem('Plant_Code'),
          Updated_User_ID: this.userid,
          Area_ID: this.selectedArea.Area_ID,
          Part_ID: this.selectedpart.Part_ID,
          Checkpoint_Name: this.createCheckPointForm.value.checkpoint,
          Checkpoint_Desc: this.createCheckPointForm.value.checkpoint,
          SORTORDER: this.createCheckPointForm.value.sortorder,
          Parallelism: this.isParallelism
            ? this.createCheckPointForm.value.parallelism
            : null,
          Is_Active: true,
          Is_A_Class: this.isAClass,
        };
        this.ParameterList.forEach((para, index) => {
          temp[`Is_${para.Type}`] = para.Type;
          temp[`Is_${para.Type}`] = this.createCheckPointForm.get(
            para.Type
          ).value;
        });
        if (temp.Is_Gap != true && temp.Is_Flushness != true) {
          this.toaster.warning(
            'Please select at least one Type Gap or Flushness'
          );
          return;
        }
        this.commonService
          .updateCP(this.selectedckpid, temp)
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
      if (!this.selectedpart) {
        this.toaster.warning('Please select Part .');
        return;
      }
    }
  }

  DeleteRecord(ID) {
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '250px',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed' + result);
      if (result) {
        this.commonService
          .deleteCP(ID)
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
      }
    });
  }
  closeDeleteRecord() {
    this.selectedForDelete = null;
    $('.close').click();
  }

  modifySelected(cpid) {
    const temp = this.cpList.find((part) => part.Checkpoint_ID == cpid);
    if (temp) {
      this.modifyFlag = true;
      this.selectedckpid = temp.Checkpoint_ID;
      this.createCheckPointForm
        .get('checkpoint')
        .setValue(temp.Checkpoint_Name);
      this.createCheckPointForm.get('cpdesc').setValue(temp.Checkpoint_Desc);
      this.createCheckPointForm.get('sortorder').setValue(temp.SORTORDER);
      this.createCheckPointForm
        .get('parallelism')
        .setValue(temp.Parallelism ? temp.Parallelism : null);
      this.createCheckPointForm.get('Gap').setValue(temp.Is_Gap);
      this.createCheckPointForm.get('Flushness').setValue(temp.Is_Flushness);
      this.isParallelism = temp.Parallelism ? true : false;
      this.isAClass = temp.Is_A_Class ? true : false;
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

      this.commonService
        .getPartList(temp.Area_ID, this.audittypeid)
        .subscribe((part) => {
          this.partlist = part;
          this.selectedpart = this.partlist.find(
            (area) => area.Part_ID == temp.Part_ID
          );

          this.Is_Gap = this.selectedpart.Is_Gap;
          this.Is_Flushness = this.selectedpart.Is_Flushness;
        });
      $(window).scrollTop(0);
    }
  }

  // A Class toggle of the table , works the same way as the Status toggle
  onAClassChange(data) {
    data.Updated_User_ID = this.userid;
    data.Updated_Host = this.hostname;
    this.commonService.updateCP(data.Checkpoint_ID, data).subscribe((data) => {
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

  onStatusChange(data) {
    // data.Is_Active = !data.Is_Active;
    data.Updated_User_ID = this.userid;
    data.Updated_Host = this.hostname;
    this.commonService.updateCP(data.Checkpoint_ID, data).subscribe((data) => {
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
  // ********************************** Check-Point Section End *******************************//

  // ********************************** Table Section Start *******************************//

  filterData() {
    if (this.selectedShop && this.selectedmodel && this.selectedArea && this.selectedpart) {
      this.cpList = this.TotalData.filter((part) => {
        return (
          part.Shop_ID == this.selectedShop.Shop_ID &&
          part.Model_ID == this.selectedmodel.Model_ID &&
          part.Area_ID == this.selectedArea.Area_ID &&
          part.Part_ID == this.selectedpart.Part_ID
        );
      });
      return;
    }
     if (this.selectedShop && this.selectedmodel && this.selectedArea) {
      this.cpList = this.TotalData.filter((part) => {
        return (
          part.Shop_ID == this.selectedShop.Shop_ID &&
          part.Model_ID == this.selectedmodel.Model_ID &&
          part.Area_ID == this.selectedArea.Area_ID
        );
      });
      return;
    }
    if (this.selectedShop && this.selectedmodel) {
      this.cpList = this.TotalData.filter((part) => {
        return (
          part.Shop_ID == this.selectedShop.Shop_ID &&
          part.Model_ID == this.selectedmodel.Model_ID
        );
      });
      return;
    }
    this.cpList = this.TotalData;
    return;
  }

  getTableData() {
    this.loading = true;
    if (this.plantid) {
      this.commonService
        .getCPTableData(
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
            this.cpList.sort((a, b) => a.SORTORDER - b.SORTORDER);
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
  //       { title: 'Part', targets: 3 },
  //       { title: 'Checkpoint Name', targets: 4 },
  //       { title: 'Type', targets: 5 },
  //       { title: 'Sort Order', targets: 6 },
  //       { title: 'Action', targets: 7 },
  //     ],

  //     columns: [
  //       {
  //         data: 'Shop_Name',
  //       },
  //       { data: 'Model_Name' },
  //       { data: 'Area_Name' },
  //       { data: 'Part_Name' },
  //       { data: 'Checkpoint_Name' },
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
  //                 .updateCP(rowData.Checkpoint_ID, rowData)
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
  //           // data - target="#mymodal" data - element - obj="${data.Checkpoint_ID}" > </span>
  //           const editButton = `
  //            `;

  //           const deleteButton = `
  //             <span id="deletebtn" class="btn fa fa-trash deletebutton deletesbtn" title="Delete"
  //               style="border-radius: 50%!important; background-color: #0b9494; color: black!important;"
  //               data-element-id="${data.Checkpoint_ID}"></span>`;

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
  //               this.modifySelected(rowData.Checkpoint_ID);
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
  //                   this.selectedForDelete = rowData.Checkpoint_ID;
  //                   // this.DeleteRecord();
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
    this.cpObject = [];
    this.newCP = false;
    this.searchshopInput = null;
    this.createCheckPointForm.reset();
    this.searchModelInput = null;
    this.isParallelism = false;
    this.isAClass = false;
    this.getTableData();
    if (this.selectedForDelete || this.modifyFlag) {
      this.selectedForDelete = null;
      this.modifyFlag = false;
    }
    this.ParameterList.forEach((para) => {
      this.createCheckPointForm.get(para.Type).setValue(true);
    });
    $(window).scrollTop(0);
  }
  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }

  parallelismChange(e) {
    if (e.checked) {
      this.isParallelism = true;
      $('#parrallelism').focus();
    } else {
      this.isParallelism = false;
    }
  }

  trackForLoop(index, item) {
    return item.CheckPoint_ID;
  }

  // ********************************** Other Section End *******************************//
}
