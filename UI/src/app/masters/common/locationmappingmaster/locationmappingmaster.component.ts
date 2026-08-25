import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { shop } from 'src/app/shared/models/shop.model';
import { CommonService } from '../common.service';
import { Model } from 'src/app/shared/models/model.model';
import { Area } from 'src/app/shared/models/area.model';
import { Part } from 'src/app/shared/models/part.model';
import { CheckPoint } from 'src/app/shared/models/checkpoint.model';
import { Location } from 'src/app/shared/models/location.model';
import { LocationMapping } from 'src/app/shared/models/locationmapping.model';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';

@Component({
  selector: 'app-locationmappingmaster',
  templateUrl: './locationmappingmaster.component.html',
  styleUrls: ['./locationmappingmaster.component.css']
})
export class LocationmappingmasterComponent {

  //TCF Shop
  shoplistTCF: shop[];
  selectedShopTCF: shop;

  //TCF Mode
  selectedmodelTCF: Model;
  modelListTCF: Model[];
  ModelFilterTCF: FormControl = new FormControl();

  //TCF Area
  selectedAreaTCF: Area;
  AreaListTCF: Area[] = [];
  AreaFilterTCF: FormControl = new FormControl();

  //TCF Part
  selectedpartTCF: Part;
  partlistTCF: Part[] = [];
  PartFilterTCF: FormControl = new FormControl();

  //TCF CP
  selectedCPTCF: CheckPoint;
  cpListTCF: CheckPoint[] = [];
  CPFilterTCF: FormControl = new FormControl();

  //BIW Shop
  shoplistBIW: shop[];
  selectedShopBIW: shop;

  //BIW Model
  selectedmodelBIW: Model;
  modelListBIW: Model[];
  ModelFilterBIW: FormControl = new FormControl();

  //BIW Area
  selectedAreaBIW: Area;
  AreaListBIW: Area[] = [];
  AreaFilterBIW: FormControl = new FormControl();

  //BIW Part
  selectedpartBIW: Part;
  partlistBIW: Part[] = [];
  PartFilterBIW: FormControl = new FormControl();

  //BIW CP
  selectedCPBIW: CheckPoint;
  cpListBIW: CheckPoint[] = [];
  CPFilterBIW: FormControl = new FormControl();

  userid: number;
  hostname: string;
  plantid: number;
  lmid: number;
  audittypeid: number;
  modifyFlag: boolean = false;
  searchshopInput: string;
  searchModelInput: string;
  searchAreaInput: string;
  Is_Gap: boolean;
  Is_Flushness: boolean;
  createLocationForm: FormGroup;
  searchPartInput: string;
  searchcpInput: string;

  //Location TCF
  locationObject: Location[] = [];
  LocationListTCF: Location[] = [];
  selectedLocationTCF: Location;


  //Location BIW
  LocationListBIW: Location[] = [];
  selectedLocationBIW: Location;

  //other
  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;
  TotalData: Location[] = [];
  loading: boolean = false;
  searchInput: string = '';
  selectedMappingID: number;
  locationMappings: LocationMapping[] = [];

  constructor(
    private commonService: CommonService,
    private toaster: ToastrService,
    private router: Router,
    private ngZone: NgZone,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private cdref: ChangeDetectorRef
  ) { }

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
    this.getShopListTCF();
    this.getShopListBIW();
  }

  // ************************************ TCF start ***************************************//
  // ************************************ Shop Section Start **************************************//

  getShopListTCF() {
    this.shoplistTCF = [];
    this.commonService
      .getShopListForPlant(
        this.plantid,
        1,
        this.shopid,
        this.allshops
      )
      .subscribe((data) => {
        this.shoplistTCF = data;
      });
  }
  selectShopTCF(shopTCF: shop) {
    if (shopTCF) {
      // this.selectedshopid = shop.Shop_ID;
      this.selectedShopTCF = shopTCF;
      this.getModelListTCF();
    }
  }

  isCurrentShopTCF(shopTCF: shop) {
    if (this.selectedShopTCF) {
      return this.selectedShopTCF.Shop_ID == shopTCF.Shop_ID;
    } else {
      return false;
    }

  }

  // ************************************ Shop Section End **************************************//
  // ********************************** Model Section Start *******************************//
  getModelListTCF() {
    if (this.selectedShopTCF) {
      if (!this.modifyFlag) {
        this.selectedmodelTCF = null;
      }
      this.commonService
        .getModelList(this.selectedShopTCF.Shop_ID, 1)
        .subscribe((res) => {
          this.modelListTCF = res;
        });
    }
  }

  selectModelTCF(modelTCF: Model) {
    if (modelTCF) {
      this.selectedmodelTCF = modelTCF;
      this.getAreaListTCF();

    }
  }
  isCurrentModelTCF(modelTCF: Model) {
    if (this.selectedmodelTCF) {
      return this.selectedmodelTCF.Model_ID == modelTCF.Model_ID;
    } else {
      return false;
    }
  }

  // ********************************** Model Section End *******************************//
  // ********************************** Area Section Start *******************************//
  getAreaListTCF() {
    if (this.selectedmodelTCF) {
      this.selectedAreaTCF = null;
      this.selectedpartTCF = null;
      this.partlistTCF = null;
      this.commonService
        .getAreaList(this.selectedmodelTCF.Model_ID, 1)
        .subscribe((res) => {
          this.AreaListTCF = res;
        });
    }
  }
  selectAreaTCF(areaTCF: Area) {
    if (areaTCF) {
      this.selectedAreaTCF = areaTCF;
      this.getPartListTCF();

    }
  }
  isCurrentAreaTCF(areaTCF: Area) {
    if (this.selectedAreaTCF) {
      return this.selectedAreaTCF.Area_ID == areaTCF.Area_ID;
    } else {
      return false;
    }
  }
  // ********************************** Area Section End *******************************//
  // ********************************** Part Section Start *******************************//
  getPartListTCF() {
    if (this.selectedAreaTCF) {
      this.selectedpartTCF = null;
      this.commonService
        .getPartList(this.selectedAreaTCF.Area_ID, 1)
        .subscribe((res) => {
          this.partlistTCF = res;
        });
    }
  }

  selectPartTCF(partTCF: Part) {
    this.selectedCPTCF = null;
    if (partTCF) {
      this.selectedpartTCF = partTCF;
      this.getCPListTCF();

    }
  }
  isCurrentPartTCF(PartTCF: Part) {
    if (this.selectedpartTCF) {
      return this.selectedpartTCF.Part_ID == PartTCF.Part_ID;
    } else {
      return false;
    }
  }
  // ********************************** Part Section End *******************************//

  // ********************************** Check Point Section Start *********************//
  getCPListTCF() {
    if (this.selectedAreaTCF) {
      this.selectedCPTCF = null;
      this.cpListTCF = [];
      this.commonService
        .getCPList(this.selectedpartTCF.Part_ID, 1)
        .subscribe((res) => {
          if (res) {
            this.cpListTCF = res;
          }
        });
    }
  }

  selectCPTCF(areaTCF: CheckPoint) {
    if (areaTCF) {
      this.selectedCPTCF = areaTCF;
      this.getLocationListTCF();
    }
  }
  isCurrentCPTCF(cpTCF: CheckPoint) {
    if (this.selectedCPTCF) {
      return this.selectedCPTCF.Checkpoint_ID == cpTCF.Checkpoint_ID;
    } else {
      return false;
    }
  }
  // ********************************** Check Point Section End *******************************//

  // ********************************* location Start *****************************//
  getLocationListTCF() {
    this.commonService
      .getLocationList(this.selectedCPTCF.Checkpoint_ID, 1)
      .subscribe((res) => {
        this.LocationListTCF = res;
      });
  }
  onSelectLocationTCF(event: any) {
    this.selectedLocationTCF = event.value;
    console.log("TCF Location selected:", this.selectedLocationTCF);
    this.getTableData();
  }
  // ********************************* location end *****************************//

  // ************************************ TCF END ***************************************//

  // ************************************ BIW start ***************************************//

  // ************************************ Shop Section Start **************************************//

  getShopListBIW() {
    this.shoplistBIW = [];
    this.commonService
      .getShopListForPlant(
        this.plantid,
        2,
        this.shopid,
        this.allshops
      )
      .subscribe((data) => {
        this.shoplistBIW = data;
      });
  }
  selectShopBIW(shopBIW: shop) {
    if (shopBIW) {
      // this.selectedshopid = shop.Shop_ID;
      this.selectedShopBIW = shopBIW;
      this.getModelListBIW();
    }
  }

  isCurrentShopBIW(shopBIW: shop) {
    if (this.selectedShopBIW) {
      return this.selectedShopBIW.Shop_ID == shopBIW.Shop_ID;
    } else {
      return false;
    }
  }

  // ************************************ Shop Section End **************************************//
  // ********************************** Model Section Start *******************************//
  getModelListBIW() {
    if (this.selectedShopBIW) {
      if (!this.modifyFlag) {
        this.selectedmodelBIW = null;
      }
      this.commonService
        .getModelList(this.selectedShopBIW.Shop_ID, 2)
        .subscribe((res) => {
          this.modelListBIW = res;
        });
    }
  }

  selectModelBIW(modelBIW: Model) {
    if (modelBIW) {
      this.selectedmodelBIW = modelBIW;
      this.getAreaListBIW();

    }
  }
  isCurrentModelBIW(modelBIW: Model) {
    if (this.selectedmodelBIW) {
      return this.selectedmodelBIW.Model_ID == modelBIW.Model_ID;
    } else {
      return false;
    }
  }

  // ********************************** Model Section End *******************************//
  // ********************************** Area Section Start *******************************//
  getAreaListBIW() {
    if (this.selectedmodelBIW) {
      this.selectedAreaBIW = null;
      this.selectedpartBIW = null;
      this.partlistBIW = null;
      this.commonService
        .getAreaList(this.selectedmodelBIW.Model_ID, 2)
        .subscribe((res) => {
          this.AreaListBIW = res;
        });
    }
  }
  selectAreaBIW(areaBIW: Area) {
    if (areaBIW) {
      this.selectedAreaBIW = areaBIW;
      this.getPartListBIW();

    }
  }
  isCurrentAreaBIW(areaBIW: Area) {
    if (this.selectedAreaBIW) {
      return this.selectedAreaBIW.Area_ID == areaBIW.Area_ID;
    } else {
      return false;
    }
  }
  // ********************************** Area Section End *******************************//
  // ********************************** Part Section Start *******************************//
  getPartListBIW() {
    if (this.selectedAreaBIW) {
      this.selectedpartBIW = null;
      this.commonService
        .getPartList(this.selectedAreaBIW.Area_ID, 2)
        .subscribe((res) => {
          this.partlistBIW = res;
        });
    }
  }

  selectPartBIW(partBIW: Part) {
    this.selectedCPBIW = null;
    if (partBIW) {
      this.selectedpartBIW = partBIW;
      this.getCPListBIW();

    }
  }
  isCurrentPartBIW(PartBIW: Part) {
    if (this.selectedpartBIW) {
      return this.selectedpartBIW.Part_ID == PartBIW.Part_ID;
    } else {
      return false;
    }
  }
  // ********************************** Part Section End *******************************//

  // ********************************** Check Point Section Start *********************//
  getCPListBIW() {
    if (this.selectedAreaBIW) {
      this.selectedCPBIW = null;
      this.cpListBIW = [];
      this.commonService
        .getCPList(this.selectedpartBIW.Part_ID, 2)
        .subscribe((res) => {
          if (res) {
            this.cpListBIW = res;
          }
        });
    }
  }

  selectCPBIW(areaBIW: CheckPoint) {
    if (areaBIW) {
      this.selectedCPBIW = areaBIW;
      this.getLocationListBIW();
    }
  }
  isCurrentCPBIW(cpBIW: CheckPoint) {
    if (this.selectedCPBIW) {
      return this.selectedCPBIW.Checkpoint_ID == cpBIW.Checkpoint_ID;
    } else {
      return false;
    }
  }
  // ********************************** Check Point Section End *******************************//

  // ********************************* location Start *****************************//
  getLocationListBIW() {
    this.commonService
      .getLocationList(this.selectedCPBIW.Checkpoint_ID, 2)
      .subscribe((res) => {
        this.LocationListBIW = res;
      });
  }
  onSelectLocationBIW(event: any) {
    this.selectedLocationBIW = event.value;
    console.log("BIW Location selected:", this.selectedLocationBIW);
  }
  // ********************************* location end *****************************//

  // ************************************ BIW END ***************************************//

  saveLocationMapping() {
    if (!this.selectedLocationTCF || !this.selectedLocationBIW) {
      this.toaster.error("Please select both TCF and BIW locations before saving.");
      return;
    }

    const payload = {
      TCF_Location_ID: this.selectedLocationTCF.Location_ID,
      BIW_Location_ID: this.selectedLocationBIW.Location_ID,
      Plant_Code: this.plantid,
      Inserted_User_ID: this.userid,
      Inserted_Host: this.hostname,
      Is_Purgeable: false,
      Is_Edited: false,
      Is_Transferred: false,
      Is_Deleted: false
    };

    this.commonService.saveLocationMapping(payload).subscribe(
      (res: any) => {
        if (res.isSuccessMessage) {
          this.toaster.success("Location mapping saved successfully!");
          this.refresh();
        } else if (res.isAlertMessage) {
          this.toaster.warning(res.messageDetail);
        } else {
          this.toaster.error("Failed to save location mapping.");
        }
      },
      (err) => {
        this.toaster.error("Error occurred while saving mapping.");
        console.error(err);
      }
    );
  }
  // ****************************************************************************//
  updateMapping() {
  if (!this.selectedLocationTCF) {
    this.toaster.warning('Please select TCF Location.');
    return;
  }
  if (!this.selectedLocationBIW) {
    this.toaster.warning('Please select BIW Location.');
    return;
  }

  if (this.modifyFlag) {
    const temp: any = {
      LM_ID: this.selectedMappingID,
      TCF_Location_ID: this.selectedLocationTCF.Location_ID,
      BIW_Location_ID: this.selectedLocationBIW.Location_ID,
      Plant_Code: this.plantid,
      Updated_Host: this.hostname,
      Updated_User_ID: this.userid,
      Is_Purgeable: false,
      Is_Edited: true,
      Is_Transferred: false,
      Is_Deleted: false
    };

    this.commonService.updateLocationMapping(this.selectedMappingID, temp).subscribe((data: any) => {
      if (data !== null && data !== undefined) {
        if (data.isErrorMessage) {
          this.toaster.error(data.messageDetail, data.messageTitle);
        } else if (data.isSuccessMessage) {
          // this.refresh();
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

DeleteMapping(id: number) {
  const dialogRef = this.dialog.open(DeletePopupComponent, {
    width: '250px',
    enterAnimationDuration: '0ms',
    exitAnimationDuration: '0ms',
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result) {
      this.commonService.deleteLocationMapping(id).subscribe((data: any) => {
        if (data == null || data == undefined || data == '') {
          this.toaster.error('Cannot delete record', 'Unable to connect to server!');
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

modifySelectedMapping(lmId: number) {
  const temp = this.locationMappings.find((map) => map.LM_ID == lmId);
  if (temp) {
    this.modifyFlag = true;
    this.selectedMappingID = temp.LM_ID;

    // Pre-fill dropdowns with existing mapping values
    this.selectedLocationTCF = this.LocationListTCF.find(
      (loc) => loc.Location_ID === temp.TCF_Location_ID
    );
    this.selectedLocationBIW = this.LocationListBIW.find(
      (loc) => loc.Location_ID === temp.BIW_Location_ID
    );

    $(window).scrollTop(0);
  }
}

onMappingStatusChange(data: any) {
  data.Updated_User_ID = this.userid;
  data.Updated_Host = this.hostname;

  this.commonService.updateLocationMapping(data.LM_ID, data).subscribe((res: any) => {
    if (res !== null && res !== undefined) {
      if (res.isErrorMessage) {
        this.toaster.error(res.messageDetail, res.messageTitle);
      } else if (res.isSuccessMessage) {
        // this.refresh();
        this.toaster.success(res.messageDetail, res.messageTitle);
      } else if (res.isAlertMessage) {
        this.toaster.warning(res.messageDetail, res.messageTitle);
      } else {
        this.toaster.error('Something went wrong');
      }
    }
  });
}


   // ********************************** Table Section Start *******************************//
  
  getTableData() {
    debugger;
    this.loading = true;
    this.locationMappings = [];
      this.commonService
        .getLocationMappingTableData(
          this.plantid,
          this.audittypeid,
          this.selectedLocationTCF.Location_ID
        )
        .subscribe((data) => {
          if (data) {
            this.locationMappings = data;
            
            this.loading = false;
          }
        });
  }
  trackForLoop(index, item) {
    return item.LM_ID;
  }
  // ********************************** Table Section End *******************************//

  refresh() {
    this.getTableData();
  // reload shops
  // this.getShopListTCF();
  // this.getShopListBIW();

  // clear selections and lists
//   this.selectedShopTCF = null;
//   this.selectedShopBIW = null;
//   this.selectedmodelTCF = null;
//   this.selectedmodelBIW = null;
//   this.selectedAreaTCF = null;
//   this.selectedAreaBIW = null;
//   this.selectedpartTCF = null;
//   this.selectedpartBIW = null;
//   this.selectedCPTCF = null;
//   this.selectedCPBIW = null;
//   this.selectedLocationTCF = null;
//   this.selectedLocationBIW = null;

//   this.modelListTCF = [];
//   this.modelListBIW = [];
//   this.AreaListTCF = [];
//   this.AreaListBIW = [];
//   this.partlistTCF = [];
//   this.partlistBIW = [];
//   this.cpListTCF = [];
//   this.cpListBIW = [];
//   this.LocationListTCF = [];
//   this.LocationListBIW = [];
}





}

