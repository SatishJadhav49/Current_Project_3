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
import { Location } from 'src/app/shared/models/location.model';
import { MatDialog } from '@angular/material/dialog';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
declare var $: any;
@Component({
  selector: 'app-locationmaster',
  templateUrl: './locationmaster.component.html',
  styleUrls: ['./locationmaster.component.css'],
})
export class LocationmasterComponent {
  audittypeid: number;
  userid: number;
  hostname: string;
  plantid: number;
  newCP: boolean;
  selectedLocID: number;
  searchshopInput: string;
  shoplist: shop[];
  modelList: Model[];
  selectedForDelete: number;
  modifyFlag: boolean = false;;
  selectedShop: shop;
  searchModelInput: string;
  selectedmodel: Model;
  loading: boolean = false;
  createLocationForm: FormGroup;
  ParameterList: Parameter[] = [];
  isParallelism: boolean = false;
  Is_Flushness: boolean;
  Is_Gap: boolean;
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
  locationObject: Location[] = [];
  LocationList: Location[] = [];

  // other
  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;
  searchInput: string = '';
  TotalData: Location[] = [];
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
    this.getShopList();
   

    this.createLocationForm = this.fb.group({
      locationname: new FormControl('', [Validators.required]),
      locationdesc: new FormControl(''),
      sortorder: new FormControl(''),
      // parallelism: new FormControl(''),
    });

    this.commonService.getParameter().subscribe((data) => {
      if (data) {
        this.ParameterList = data;
        this.ParameterList.forEach((para) => {
          const newControl = this.fb.control(Validators.required);
          this.createLocationForm.addControl(para.Type, newControl);
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
    this.selectedCP = null;
    if (part) {
      this.selectedpart = part;
      this.getCPList();
      this.filterData();

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
      this.Is_Gap = this.selectedCP.Is_Gap;
      this.Is_Flushness = this.selectedCP.Is_Flushness;
      this.createLocationForm.get('Gap').setValue(this.Is_Gap);
      this.createLocationForm.get('Flushness').setValue(this.Is_Flushness);

      const temp = this.LocationList.reduce((max, current) => {
        if (
          current.Checkpoint_ID === this.selectedCP.Checkpoint_ID &&
          current.SORTORDER > max
        ) {
          return current.SORTORDER;
        }
        return max;
      }, 0);
      this.createLocationForm.get('sortorder').setValue(temp + 1);
      this.onNewLocation();
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
  onNewLocation() {
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
    {
      this.newCP = true;
      return;
    }
  }

  onAddLocation() {
    if (this.createLocationForm.valid) {
      let duplicate = false;
      this.locationObject.forEach((CP) => {
        if (
          CP.Location_Name == this.createLocationForm.value.locationname &&
          CP.Location_Desc == this.createLocationForm.value.locationname &&
          CP.Area_ID == this.selectedArea.Area_ID &&
          CP.Part_ID == this.selectedpart.Part_ID &&
          CP.Checkpoint_ID == this.selectedCP.Checkpoint_ID
        ) {
          duplicate = true;
        }
      });

      this.LocationList.forEach((CP) => {
        if (
          CP.Location_Name == this.createLocationForm.value.locationname &&
          CP.Location_Desc == this.createLocationForm.value.locationname &&
          CP.Area_ID == this.selectedArea.Area_ID &&
          CP.Part_ID == this.selectedpart.Part_ID &&
          CP.Checkpoint_ID == this.selectedCP.Checkpoint_ID
        ) {
          duplicate = true;
        }
      });
      if (duplicate) {
        this.toaster.warning('Duplicate Record found !!');
      } else {
        const temp: Location = {
          Plant_ID: this.plantid,
          Inserted_Host: this.hostname,
          Inserted_User_ID: this.userid,
          Audit_Type_Id: this.audittypeid,
          Shop_ID: this.selectedShop.Shop_ID,
          Model_ID: this.selectedmodel.Model_ID,
          Location_Name: this.createLocationForm.value.locationname,
          Location_Desc: this.createLocationForm.value.locationname,
          Area_ID: this.selectedArea.Area_ID,
          Part_ID: this.selectedpart.Part_ID,
          SORTORDER: this.createLocationForm.get('sortorder').value,
          Checkpoint_ID: this.selectedCP.Checkpoint_ID,
          Plant_Code: localStorage.getItem('Plant_Code'),
          Is_Active: true,
        };
        this.ParameterList.forEach((para, index) => {
          temp[`Is_${para.Type}`] = para.Type;
          temp[`Is_${para.Type}`] = this.createLocationForm.get(
            para.Type
          ).value;
        });
        if (temp.Is_Gap != true && temp.Is_Flushness != true) {
          this.toaster.warning(
            'Please select at least one Type Gap or Flushness'
          );
          return;
        } else {
          this.locationObject.push(temp);
          const tempsort = this.createLocationForm.get('sortorder').value;
          this.createLocationForm.reset();
          this.createLocationForm.get('Gap').setValue(temp.Is_Gap);
          this.createLocationForm.get('Flushness').setValue(temp.Is_Flushness);
          this.createLocationForm.get('sortorder').setValue(tempsort + 1);
        }
      }
    } else {
      this.toaster.warning('All fields are required !');
    }
  }
  removeObject(index: number) {
    this.locationObject.splice(index, 1);
  }

  onSave() {
    if (this.locationObject.length > 0) {
      this.commonService.saveLocation(this.locationObject).subscribe((data) => {
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
    if (this.selectedpart) {
      if (this.modifyFlag) {
        const temp: Location = {
          Location_ID: this.selectedLocID,
          Plant_ID: this.plantid,
          Audit_Type_Id: this.audittypeid,
          Shop_ID: this.selectedShop.Shop_ID,
          Model_ID: this.selectedmodel.Model_ID,
          Updated_Host: this.hostname,
          Updated_User_ID: this.userid,
          Area_ID: this.selectedArea.Area_ID,
          Part_ID: this.selectedpart.Part_ID,
          Location_Name: this.createLocationForm.value.locationname,
          Location_Desc: this.createLocationForm.value.locationname,
          SORTORDER: this.createLocationForm.value.sortorder,
          Checkpoint_ID: this.selectedCP.Checkpoint_ID,
          Is_Active: true,
          Plant_Code: localStorage.getItem('Plant_Code'),
        };
        this.ParameterList.forEach((para, index) => {
          temp[`Is_${para.Type}`] = para.Type;
          temp[`Is_${para.Type}`] = this.createLocationForm.get(
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
          .updateLocation(this.selectedLocID, temp)
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
        this.commonService.deleteLocation(ID).subscribe((data) => {
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

  modifySelected(locid) {
    const temp = this.LocationList.find((part) => part.Location_ID == locid);
    if (temp) {
      this.modifyFlag = true;
      this.selectedLocID = temp.Location_ID;
      this.createLocationForm.get('locationname').setValue(temp.Location_Name);
      this.createLocationForm.get('locationdesc').setValue(temp.Location_Desc);
      this.createLocationForm.get('sortorder').setValue(temp.SORTORDER);
      this.createLocationForm.get('Gap').setValue(temp.Is_Gap);
      this.createLocationForm.get('Flushness').setValue(temp.Is_Flushness);
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
          this.Is_Gap = this.selectedCP.Is_Gap;
          this.Is_Flushness = this.selectedCP.Is_Flushness;
        });
      $(window).scrollTop(0);
    }
  }

  onStatusChange(data) {
    data.Updated_User_ID = this.userid;
    data.Updated_Host = this.hostname;
    this.commonService
      .updateLocation(data.Location_ID, data)
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
      this.selectedCP 
    ) {
      this.LocationList = this.TotalData.filter((part) => {
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
      this.LocationList = this.TotalData.filter((part) => {
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
      this.LocationList = this.TotalData.filter((part) => {
        return (
          part.Shop_ID == this.selectedShop.Shop_ID &&
          part.Model_ID == this.selectedmodel.Model_ID &&
          part.Area_ID == this.selectedArea.Area_ID
        );
      });
      return;
    }
    if (this.selectedShop && this.selectedmodel) {
      this.LocationList = this.TotalData.filter((part) => {
        return (
          part.Shop_ID == this.selectedShop.Shop_ID &&
          part.Model_ID == this.selectedmodel.Model_ID
        );
      });
      return;
    }
    this.LocationList = this.TotalData;
    return;
  }
  getTableData() {
    this.loading = true;
    this.LocationList = [];
    if (this.selectedmodel) {
      this.commonService
        .getLocationTableData(
          this.plantid,
          this.audittypeid,
          this.selectedShop?.Shop_ID,
          this.selectedmodel?.Model_ID
        )
        .subscribe((data) => {
          if (data) {
            this.TotalData = data;
            this.filterData();
            this.loading = false;
          }
        });
    }
  }

  // ********************************** Table Section End *******************************//

  // ********************************** Other Section Start *******************************//
  refresh() {
    this.locationObject = [];
    this.newCP = false;
    this.searchshopInput = null;
    this.createLocationForm.reset();
    this.searchModelInput = null;
    this.Is_Gap = null;
    this.Is_Flushness = null;
    this.searchModelInput = null;
    this.searchAreaInput = null;
    this.searchPartInput = null;
    this.searchcpInput = null;
    this.getTableData();
    if (this.selectedForDelete || this.modifyFlag) {
      this.selectedForDelete = null;
      this.modifyFlag = false;
    } else {
      this.getShopList();
    }
    this.ParameterList.forEach((para) => {
      this.createLocationForm.get(para.Type).setValue(true);
    });
    $(window).scrollTop(0);
  }
  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }

  // parallelismChange(e) {
  //   if (e.checked) {
  //     this.isParallelism = true;
  //     $('#parrallelism').focus();
  //   } else {
  //     this.isParallelism = false;
  //   }
  // }

  trackForLoop(index, item) {
    return item.Location_ID;
  }

  // ********************************** Other Section End *******************************//
}
