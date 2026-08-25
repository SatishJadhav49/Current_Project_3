import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  ViewChild,
} from '@angular/core';
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
import { CheckPoint } from 'src/app/shared/models/checkpoint.model';
import { Location } from 'src/app/shared/models/location.model';
import { Specification } from 'src/app/shared/models/specification.model';
import { Parameter } from 'src/app/shared/models/parameter.model';
import { MatDialog } from '@angular/material/dialog';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { ExcelUploadComponent } from 'src/app/shared/components/excel-upload/excel-upload.component';
import { CalculationsComponent } from './calculations/calculations.component';
declare var $: any;
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
@Component({
  selector: 'app-specificationmaster',
  templateUrl: './specificationmaster.component.html',
  styleUrls: ['./specificationmaster.component.css'],
})
export class SpecificationmasterComponent {
  audittypeid: number;
  userid: number;
  hostname: string;
  plantid: number;
  newCP: boolean;
  selectedSpecsID: number;
  searchshopInput: string;
  shoplist: shop[];
  modelList: Model[];
  selectedForDelete: number;
  modifyFlag: boolean;
  selectedShop: shop;
  searchModelInput: string;
  selectedmodel: Model;
  loading: boolean = false;
  createSpecificationForm: FormGroup;
  isParallelism: boolean = false;
  // area
  searchAreaInput: string;
  AreaList: Area[] = [];
  selectedArea: Area;

  // Part
  searchPartInput: string;
  selectedpart: Part;
  partlist: Part[] = [];

  // Check Point
  searchcpInput: string;
  cpList: CheckPoint[] = [];
  selectedCP: CheckPoint;

  // Location
  selectedlocation: Location;
  LocationList: Location[] = [];
  selectedLocInput: string;

  // Specification
  specsObj: Specification[] = [];
  specsList: Specification[] = [];

  // Parameter
  ParameterList: Parameter[] = [];
  Is_Flushness: boolean;
  Is_Gap: boolean;

  // other
  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;
  searchInput: string = '';
  TotalData: Specification[] = [];
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
    $(window).scrollTop(0);
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.userid = this.commonService.getUserID();
    this.plantid = this.commonService.getplantID();
    this.hostname = this.commonService.getHostData();
    this.newCP = false;
    this.modifyFlag = false;
    this.getShopList();
    

    this.createSpecificationForm = this.fb.group({
      specsname: new FormControl('', [Validators.required]),
      specsdesc: new FormControl(''),
      minval: new FormControl('', [Validators.required]),
      maxval: new FormControl('', [Validators.required]),
      lcl: new FormControl('', [Validators.required]),
      ucl: new FormControl('', [Validators.required]),
      uclr: new FormControl('', [Validators.required]),
      sortorder: new FormControl(''),
      Is_Gap: new FormControl(true, Validators.required),
      Is_Flushness: new FormControl(true, Validators.required),
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
      this.getTableData();
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
      this.getCPList();
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

  // ********************************** Check Point Section Start *********************//
  getCPList() {
    if (this.selectedArea) {
      this.selectedCP = null;
      this.cpList = [];
      this.commonService
        .getCPList(this.selectedpart.Part_ID, this.audittypeid)
        .subscribe((res) => {
          if (res) {
            this.cpList = res;
          }
        });
    }
  }

  selectCP(area: CheckPoint) {
    if (area) {
      this.selectedCP = area;
      this.filterData();
      this.getLocationList();
    }
  }
  isCurrentCP(cp: CheckPoint) {
    if (this.selectedCP) {
      return this.selectedCP.Checkpoint_ID == cp.Checkpoint_ID;
    } else {
      return false;
    }
  }
  // ********************************** Check Point Section End *******************************//

  // ********************************** Location Section Start *******************************//
  getLocationList() {
    if (this.selectedArea) {
      this.selectedlocation = null;
      this.LocationList = [];
      this.commonService
        .getLocationList(this.selectedCP.Checkpoint_ID, this.audittypeid)
        .subscribe((res) => {
          if (res) {
            this.LocationList = res;
          }
        });
    }
  }

  selectLocation(area: Location) {
    if (area) {
      this.selectedlocation = area;
      this.filterData();

      this.Is_Gap = this.selectedlocation.Is_Gap;
      this.Is_Flushness = this.selectedlocation.Is_Flushness;
      if (this.Is_Gap && this.Is_Flushness) {
        this.createSpecificationForm.get('Is_Gap').setValue(false);
        this.createSpecificationForm.get('Is_Flushness').setValue(false);
      } else {
        this.createSpecificationForm.get('Is_Gap').setValue(this.Is_Gap);
        this.createSpecificationForm
          .get('Is_Flushness')
          .setValue(this.Is_Flushness);
      }
      const temp = this.specsList.reduce((max, current) => {
        if (
          current.Location_ID === this.selectedlocation.Location_ID &&
          current.SORTORDER > max
        ) {
          return current.SORTORDER;
        }
        return max;
      }, 0);
      this.createSpecificationForm.get('sortorder').setValue(temp + 1);
      this.onNewSpecification();
    }
  }
  isCurrentLoc(loc: Location) {
    if (this.selectedlocation) {
      return this.selectedlocation.Location_ID == loc.Location_ID;
    } else {
      return false;
    }
  }
  // ********************************** Location Section End *******************************//

  // ********************************** Location Section Start *******************************//
  onNewSpecification() {
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
    if (!this.selectedCP) {
      this.toaster.warning('Please select Check Point .');
      return;
    }
    if (!this.selectedlocation) {
      this.toaster.warning('Please selected Location .');
      return;
    }
    {
      this.newCP = true;
      return;
    }
  }

  onAddLocation() {
    if (this.createSpecificationForm.valid) {
      let duplicate = false;
      this.specsObj.forEach((CP) => {
        if (
          CP.Specification_Name ==
            this.createSpecificationForm.value.specsname &&
          CP.Specification_Desc ==
            this.createSpecificationForm.value.specsdesc &&
          CP.Area_ID == this.selectedArea.Area_ID &&
          CP.Part_ID == this.selectedpart.Part_ID &&
          CP.Checkpoint_ID == this.selectedCP.Checkpoint_ID &&
          CP.Location_ID == this.selectedlocation.Location_ID
        ) {
          duplicate = true;
        }
      });

      this.specsList.forEach((CP) => {
        if (
          CP.Specification_Name ==
            this.createSpecificationForm.value.specsname &&
          CP.Specification_Desc ==
            this.createSpecificationForm.value.specsdesc &&
          CP.Area_ID == this.selectedArea.Area_ID &&
          CP.Part_ID == this.selectedpart.Part_ID &&
          CP.Checkpoint_ID == this.selectedCP.Checkpoint_ID &&
          CP.Location_ID == this.selectedlocation.Location_ID
        ) {
          duplicate = true;
        }
      });
      if (
        this.createSpecificationForm.value.minval >
        this.createSpecificationForm.value.maxval
      ) {
        this.toaster.warning(
          'USL  should be greater than or equal to LSL Value'
        );
        return;
      }
      if (
        !this.createSpecificationForm.value.Is_Gap &&
        !this.createSpecificationForm.value.Is_Flushness
      ) {
        this.toaster.warning('Please select at least one parameter ');
        return;
      }
      if (duplicate) {
        this.toaster.warning('Duplicate Record found !!');
      } else {
        const temp: Specification = {
          Plant_ID: this.plantid,
          Inserted_Host: this.hostname,
          Inserted_User_ID: this.userid,
          Audit_Type_Id: this.audittypeid,
          Shop_ID: this.selectedShop.Shop_ID,
          Model_ID: this.selectedmodel.Model_ID,
          Specification_Name: this.createSpecificationForm.value.specsname,
          Specification_Desc: this.createSpecificationForm.value.specsdesc,
          MinVal: this.createSpecificationForm.value.minval,
          MaxVal: this.createSpecificationForm.value.maxval,
          Area_ID: this.selectedArea.Area_ID,
          Part_ID: this.selectedpart.Part_ID,
          SORTORDER: this.createSpecificationForm.get('sortorder').value,
          Checkpoint_ID: this.selectedCP.Checkpoint_ID,
          Location_ID: this.selectedlocation.Location_ID,
          Is_Gap: this.createSpecificationForm.value.Is_Gap,
          Is_Flushness: this.createSpecificationForm.value.Is_Flushness,
          Is_Active: true,
          LCL: this.createSpecificationForm.value.lcl,
          UCL: this.createSpecificationForm.value.ucl,
          UCLR: this.createSpecificationForm.value.uclr,
          Plant_Code: localStorage.getItem('Plant_Code'),
        };
        this.specsObj.push(temp);
        const tempsort = this.createSpecificationForm.get('sortorder').value;
        this.createSpecificationForm.reset();
        if (this.Is_Gap && this.Is_Flushness) {
          this.createSpecificationForm.get('Is_Gap').setValue(false);
          this.createSpecificationForm.get('Is_Flushness').setValue(false);
        } else {
          this.createSpecificationForm.get('Is_Gap').setValue(this.Is_Gap);
          this.createSpecificationForm
            .get('Is_Flushness')
            .setValue(this.Is_Flushness);
        }
        this.createSpecificationForm.get('sortorder').setValue(tempsort + 1);
      }
    } else {
      this.toaster.warning('All fields are required !');
    }
  }
  removeObject(index: number) {
    this.specsObj.splice(index, 1);
  }

  onSave() {
    if (this.specsObj.length > 0) {
      this.commonService.saveSpecs(this.specsObj).subscribe((data) => {
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
        if (
          this.createSpecificationForm.value.minval >
          this.createSpecificationForm.value.maxval
        ) {
          this.toaster.warning(
            'Max Val should be greater than or equal Min Value'
          );
          return;
        }

        if (
          !this.createSpecificationForm.value.Is_Gap &&
          !this.createSpecificationForm.value.Is_Flushness
        ) {
          this.toaster.warning('Please Select at least one Parameter');
          return;
        }
        const temp: Specification = {
          Specification_ID: this.selectedSpecsID,
          Plant_ID: this.plantid,
          Audit_Type_Id: this.audittypeid,
          Shop_ID: this.selectedShop.Shop_ID,
          Model_ID: this.selectedmodel.Model_ID,
          Updated_Host: this.hostname,
          Updated_User_ID: this.userid,
          Area_ID: this.selectedArea.Area_ID,
          Part_ID: this.selectedpart.Part_ID,
          Location_ID: this.selectedlocation.Location_ID,
          Specification_Name: this.createSpecificationForm.value.specsname,
          Specification_Desc: this.createSpecificationForm.value.specsdesc,
          MinVal: this.createSpecificationForm.value.minval,
          MaxVal: this.createSpecificationForm.value.maxval,
          SORTORDER: this.createSpecificationForm.value.sortorder,
          Checkpoint_ID: this.selectedCP.Checkpoint_ID,
          Is_Gap: this.createSpecificationForm.value.Is_Gap,
          Is_Flushness: this.createSpecificationForm.value.Is_Flushness,
          Is_Active: true,
          LCL: this.createSpecificationForm.value.lcl,
          UCL: this.createSpecificationForm.value.ucl,
          UCLR: this.createSpecificationForm.value.uclr,
          Plant_Code: localStorage.getItem('Plant_Code'),
        };

        this.commonService
          .updateSpecs(this.selectedSpecsID, temp)
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
    if (ID) {
      const dialogRef = this.dialog.open(DeletePopupComponent, {
        width: '250px',
        enterAnimationDuration: '0ms',
        exitAnimationDuration: '0ms',
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log('The dialog was closed' + result);
        if (result) {
          this.commonService.deleteSpecs(ID).subscribe((data) => {
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
  }

  closeDeleteRecord() {
    this.selectedForDelete = null;
    $('.close').click();
  }

  modifySelected(specid) {
    const temp = this.specsList.find((part) => part.Specification_ID == specid);
    if (temp) {
      this.modifyFlag = true;
      this.selectedSpecsID = temp.Specification_ID;
      this.createSpecificationForm
        .get('specsname')
        .setValue(temp.Specification_Name);
      this.createSpecificationForm
        .get('specsdesc')
        .setValue(temp.Specification_Desc);
      this.createSpecificationForm.get('minval').setValue(temp.MinVal);
      this.createSpecificationForm.get('maxval').setValue(temp.MaxVal);
      this.createSpecificationForm.get('sortorder').setValue(temp.SORTORDER);
      this.createSpecificationForm.get('Is_Gap').setValue(temp.Is_Gap);
      this.createSpecificationForm
        .get('Is_Flushness')
        .setValue(temp.Is_Flushness);
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
        });
      this.commonService
        .getCPList(temp.Part_ID, this.audittypeid)
        .subscribe((cp) => {
          this.cpList = cp;
          this.selectedCP = this.cpList.find(
            (area) => area.Checkpoint_ID == temp.Checkpoint_ID
          );
        });
      this.commonService
        .getLocationList(temp.Checkpoint_ID, this.audittypeid)
        .subscribe((cp) => {
          this.LocationList = cp;
          this.selectedlocation = this.LocationList.find(
            (area) => area.Location_ID == temp.Location_ID
          );
          this.Is_Gap = this.selectedlocation.Is_Gap;
          this.Is_Flushness = this.selectedlocation.Is_Flushness;
        });
      this.newCP = true;
      $(window).scrollTop(0);
    }
  }

  calculateLimits(rowData) {
    const dialogRef = this.dialog.open(CalculationsComponent, {
      width: '500px',
      data: { rowData },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'saved') {
        this.toaster.success('Control limits updated Successfully ...');
        this.getTableData();
      } else if (result === 'canceled') {
        // Handle cancel action
      } else if (result === 'error') {
        this.toaster.error('Error while updating Control Limits');
      }
    });
  }

   onStatusChange(data) {
    data.Updated_User_ID = this.userid;
    data.Updated_Host = this.hostname;
    this.commonService
      .updateSpecs(data.Specification_ID, data)
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

  // ********************************** Location Section End *******************************//

  // ********************************** Table Section Start *******************************//

   filterData() {
    if (
      this.selectedShop &&
      this.selectedmodel &&
      this.selectedArea &&
      this.selectedpart &&
      this.selectedCP  &&
      this.selectedlocation
    ) {
      this.specsList = this.TotalData.filter((part) => {
        return (
          part.Shop_ID == this.selectedShop.Shop_ID &&
          part.Model_ID == this.selectedmodel.Model_ID &&
          part.Area_ID == this.selectedArea.Area_ID &&
          part.Part_ID == this.selectedpart.Part_ID &&
          part.Checkpoint_ID == this.selectedCP.Checkpoint_ID &&
          part.Location_ID == this.selectedlocation.Location_ID
        );
      });
      return;
    }
    if (
      this.selectedShop &&
      this.selectedmodel &&
      this.selectedArea &&
      this.selectedpart &&
      this.selectedCP 
    ) {
      this.specsList = this.TotalData.filter((part) => {
        return (
          part.Shop_ID == this.selectedShop.Shop_ID &&
          part.Model_ID == this.selectedmodel.Model_ID &&
          part.Area_ID == this.selectedArea.Area_ID &&
          part.Part_ID == this.selectedpart.Part_ID &&
          part.Checkpoint_ID == this.selectedCP.Checkpoint_ID
        );
      });
      return;
    }
    if (
      this.selectedShop &&
      this.selectedmodel &&
      this.selectedArea &&
      this.selectedpart
    ) {
      this.specsList = this.TotalData.filter((part) => {
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
      this.specsList = this.TotalData.filter((part) => {
        return (
          part.Shop_ID == this.selectedShop.Shop_ID &&
          part.Model_ID == this.selectedmodel.Model_ID &&
          part.Area_ID == this.selectedArea.Area_ID
        );
      });
      return;
    }
    if (this.selectedShop && this.selectedmodel) {
      this.specsList = this.TotalData.filter((part) => {
        return (
          part.Shop_ID == this.selectedShop.Shop_ID &&
          part.Model_ID == this.selectedmodel.Model_ID
        );
      });
      return;
    }
    this.specsList = this.TotalData;
    return;
  }
  getTableData() {
    this.specsList = [];
    this.TotalData =[];
    // this.LoadTable(this.specsList);
    this.loading = true;
    if (this.selectedmodel) {
      this.commonService
        .getSpecsTableData(
          this.plantid,
          this.audittypeid,
          this.selectedShop.Shop_ID,
          this.selectedmodel.Model_ID
        )
        .subscribe((data) => {
          if (data) {
            this.TotalData = data;
            // this.LoadTable(data);
            this.filterData();
            this.loading = false;
          }
        });
    }
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
        { title: 'Area ', targets: 2 },
        { title: 'Part', targets: 3 },
        { title: 'Checkpoint ', targets: 4 },
        { title: 'Location ', targets: 5 },
        { title: 'Specification ', targets: 6 },
        { title: 'LSL', targets: 7 },
        { title: 'USL', targets: 8 },
        { title: 'LCL', targets: 9 },
        { title: 'UCL', targets: 10 },
        { title: 'UCLR', targets: 11 },
        { title: 'Type ', targets: 12 },
        { title: 'Status', targets: 13 },
        { title: 'Action', targets: 14 },
      ],

      columns: [
        {
          data: 'Shop_Name',
        },
        { data: 'Model_Name' },
        { data: 'Area_Name' },
        { data: 'Part_Name' },
        { data: 'Checkpoint_Name' },
        { data: 'Location_Name' },
        { data: 'Specification_Name' },
        { data: 'MinVal' },
        { data: 'MaxVal' },
        { data: 'LCL' },
        { data: 'UCL' },
        { data: 'UCLR' },
        {
          data: null,
          render: function (data, type, row) {
            if (data.Is_Gap) {
              return `<div  >Gap</div>`;
            }
            if (data.Is_Flushness) {
              return `<div  >Flushness</div>`;
            }
            return '';
          },
        },
        {
          data: null,
          render: function (data, type, row) {
            const canUpdate = localStorage.getItem('canUpdate') === '1';
            if (canUpdate) {
              if (data.Is_Active) {
                return '<span id="checkbox" class="checkbox" style="color: green;font-weight: bold;text-align:center"> <input type="checkbox" checked> Active</span>';
              }
              return '<span id="checkbox" class="checkbox" style="color: red;text-align:center"><input type="checkbox" > In Active</span>';
            } else {
              if (data.Is_Active) {
                return '<span  class="checkbox" style="color: green;font-weight: bold;text-align:center">  Active</span>';
              }
              return '<span class="checkbox" style="color: red;text-align:center"> In Active</span>';
            }
          },
          createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
            $(cell).on('click', '#checkbox', () => {
              this.ngZone.run(() => {
                console.log(rowData);
                rowData.Is_Active = !rowData.Is_Active;
                rowData.Updated_User_ID = this.userid;
                rowData.Updated_Host = this.hostname;
                this.commonService
                  .updateSpecs(rowData.Specification_ID, rowData)
                  .subscribe((data) => {
                    if (data !== null && data !== undefined) {
                      if (data.isErrorMessage) {
                        this.toaster.error(
                          data.messageDetail,
                          data.messageTitle
                        );
                      } else if (data.isSuccessMessage) {
                        this.refresh();
                        this.toaster.success(
                          data.messageDetail,
                          data.messageTitle
                        );
                      } else if (data.isAlertMessage) {
                        this.toaster.warning(
                          data.messageDetail,
                          data.messageTitle
                        );
                      } else {
                        this.toaster.error(
                          data.messageDetail,
                          data.messageTitle
                        );
                      }
                    }
                  });
              });
            });
          },
        },
        {
          data: null,
          render: function (data, type, row) {
            const canCreate = localStorage.getItem('canCreate') === '1';
            const canUpdate = localStorage.getItem('canUpdate') === '1';
            const canDelete = localStorage.getItem('canDelete') === '1';

            // <span id="modifyShopBtn" class="btn fa fa-pencil" data - toggle="modal" title = "Edit"
            // data - target="#mymodal" style = "border-radius: 50%!important;
            // background - color: #0b9494;
            // color: black; "
            // data - elemnt - obj="${data.Specification_ID}" > </span>
            const editButton = `
            </span> <span id="calculator" class="btn fa fa-calculator" data-toggle="modal" title="Edit"
                 data-target="#mymodal"  style="border-radius: 50%!important;
                 background-color: aquamarine;
                 color: black;"
                 data-elemnt-obj="${data.Location_ID}"></span>
           `;

            const deleteButton = `
              <span id="deleteShopBtn" class="btn fa fa-trash-o deletebutton" style="border-radius: 50%!important;
          background-color: #0b9494;
          color: black!important;" title = "Delete" 
                   data-element-id="${data.Specification_ID}"></span>`;

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
                // console.log(rowData.Specification_ID);
                this.modifySelected(rowData.Specification_ID);
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
                    this.selectedForDelete = rowData.Specification_ID;
                    // this.DeleteRecord();
                  }
                });
              });
            });
            $(cell).on('click', '#calculator', () => {
              this.ngZone.run(() => {});
            });
          },
        },
      ],
    });
  }
  // ********************************** Table Section End *******************************//

  // ********************************** Other Section Start *******************************//
  refresh() {
    this.specsObj = [];
    this.newCP = false;
    this.searchshopInput = null;
    this.createSpecificationForm.reset();
    this.searchModelInput = null;
    this.selectedLocInput = null;
    // this.isParallelism = false;
    this.searchModelInput = null;
    this.searchAreaInput = null;
    this.searchPartInput = null;
    this.searchcpInput = null;
    this.selectedLocInput = null;
    this.getTableData();
    if (this.selectedForDelete || this.modifyFlag) {
      this.selectedForDelete = null;
      this.modifyFlag = false;
    }
    $(window).scrollTop(0);
  }
  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }

  uploadExcel() {
    if (!this.selectedShop) {
      this.toaster.warning('Please select Shop');
      return;
    }
    if (!this.selectedmodel) {
      this.toaster.warning('Please select Model');
      return;
    }
    const result = this.dialog.open(ExcelUploadComponent, {
      data: {
        title: 'Specification Master',
        master: 'specification',
        shopid: this.selectedShop.Shop_ID,
        modelid: this.selectedmodel.Model_ID,
      },
      width: '400px',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
      disableClose: true,
    });

    result.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result) {
        this.getTableData();
      }
    });
  }
  // ********************************** Other Section End *******************************//

  async downloadExcel() {
    if (this.specsList) {
      const desiredSequence = [
        'Shop_Name',
        'Model_Name',
        'Area_Name',
        'Part_Name',
        'Checkpoint_Name',
        'Location_Name',
        'Specification_Name',
        'MinVal',
        'MaxVal',
        'LCL',
        'UCL',
        'UCLR',
        'Is_Gap',
        'Is_Flushness',
        'Is_Active',
      ];
      const reorderObject = (obj, keys) =>
        Object.fromEntries(keys.map((key) => [key, obj[key]]));
      const reorderedArray = await this.specsList.map((obj) =>
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
    const title = 'Specification Master';
    const header = [
      'Shop_Name',
      'Model_Name',
      'Area_Name',
      'Part_Name',
      'Checkpoint_Name',
      'Location_Name',
      'Specification_Name',
      'MinVal',
      'MaxVal',
      'LCL',
      'UCL',
      'UCLR',
      'Is_Gap',
      'Is_Flushness',
      'Is_Active',
    ];

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Specification Master');

    // Add Row and formatting
    const titleRow = worksheet.addRow([title]);
    titleRow.font = {
      size: 16,
      // underline: 'double',
      bold: true,
    };
    titleRow.alignment = { horizontal: 'center' };

    worksheet.mergeCells('A1:O1');
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
    worksheet.getColumn(4).width = 30;
    worksheet.getColumn(5).width = 25;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 20;
    worksheet.getColumn(12).width = 20;
    worksheet.getColumn(13).width = 20;
    worksheet.getColumn(14).width = 20;
    worksheet.getColumn(15).width = 20;

    worksheet.addRow([]);

    // Generate Excel File with given name
    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, 'Specification_Master' + '.xlsx');
    });
  }
  
  
  trackForLoop(index, item) {
    return item.Specification_ID;
  }
}
