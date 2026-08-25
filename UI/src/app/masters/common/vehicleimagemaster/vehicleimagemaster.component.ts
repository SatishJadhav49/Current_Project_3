import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxImageCompressService } from 'ngx-image-compress';
import { shop } from 'src/app/shared/models/shop.model';
import { Model } from 'src/app/shared/models/model.model';
import { Area } from 'src/app/shared/models/area.model';
import { Part } from 'src/app/shared/models/part.model';
import { CheckPoint } from 'src/app/shared/models/checkpoint.model';
import { Location } from 'src/app/shared/models/location.model';
import {
  VehicleImage,
  VehicleImageMapping,
} from 'src/app/shared/models/vehicleimage.model';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { CommonService } from '../common.service';
declare var $: any;

@Component({
  selector: 'app-vehicleimagemaster',
  templateUrl: './vehicleimagemaster.component.html',
  styleUrls: ['./vehicleimagemaster.component.css'],
})
export class VehicleimagemasterComponent {
  //Developer = Satish Jadhav
  // Token No.= 50005817
  // New Development
  // ********************************** Declaration Section Start *******************************//
  audittypeid: number;
  userid: number;
  plantid: number;
  hostname: string;
  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;
  loading: boolean = true;
  modifyFlag: boolean = false;

  // Shop
  shoplist: shop[] = [];
  selectedShop: shop;

  // Model
  modelList: Model[] = [];
  selectedmodel: Model;

  // Vehicle Image
  modelImageList: VehicleImage[] = [];
  selectedImage: VehicleImage;
  uploadMode: boolean = false;
  uploadingImage: boolean = false;
  imagename: string;
  ImageToUpload: File;
  imageDataUrl: string;
  errorMessage: string;

  // Area
  AreaList: Area[] = [];
  selectedArea: Area;

  // Part
  partList: Part[] = [];
  selectedPart: Part;

  // Check Point
  cpList: CheckPoint[] = [];
  selectedCP: CheckPoint;

  // Location
  LocationList: Location[] = [];
  unmappedLocations: Location[] = [];
  selectedLocation: Location;

  // Mapping
  imageMappings: VehicleImageMapping[] = [];
  filteredMappings: VehicleImageMapping[] = [];
  selectedMapping: VehicleImageMapping;
  selectedForDelete: number;
  pending: { x: number; y: number } = null;
  readonly MAX_MAPPING_PER_IMAGE = 100;
  private readonly COLORS = [
    '#1c84c6',
    '#0b9494',
    '#d97706',
    '#7c3aed',
    '#059669',
    '#e11d48',
  ];

  //****************** TEMP LOCAL STORE ( replace with API in next phase ) ******************//
  // Both the lists below are kept in memory only. Once the API is ready,
  // getVehicleImages() / saveImage() / saveMapping() / DeleteRecord() have to call
  // the commonService methods exactly like the other masters are doing.
  vehicleImageStore: VehicleImage[] = [];
  mappingStore: VehicleImageMapping[] = [];
  private tempImageID: number = 0;
  private tempMappingID: number = 0;
  //****************** TEMP LOCAL STORE End ******************//

  constructor(
    private commonService: CommonService,
    private toaster: ToastrService,
    private router: Router,
    private ngZone: NgZone,
    private imageCompress: NgxImageCompressService,
    private dialog: MatDialog,
    private cdref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    $('#ngslide').hide();
    $('.sidebar-mini').addClass('sidebar-collapse');
    $(window).scrollTop(0);
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.audittypeid = this.commonService.getAuditType();
    this.userid = this.commonService.getUserID();
    this.plantid = this.commonService.getplantID();
    this.hostname = this.commonService.getHostData();
    this.getShopList();
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
        this.loading = false;
      });
  }

  selectShop(shop: shop) {
    if (shop) {
      this.selectedShop = shop;
      this.selectedmodel = null;
      this.modelList = [];
      this.clearModelData();
      this.getModelList();
    }
  }
  // ************************************ Shop Section End **************************************//

  // ********************************** Model Section Start *******************************//
  getModelList() {
    if (this.selectedShop) {
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
      this.clearModelData();
      this.getVehicleImages();
      this.getAreaList();
    }
  }

  // clears everything which is below the model in the hierarchy
  clearModelData() {
    this.modelImageList = [];
    this.selectedImage = null;
    this.uploadMode = false;
    this.AreaList = [];
    this.selectedArea = null;
    this.partList = [];
    this.selectedPart = null;
    this.cpList = [];
    this.selectedCP = null;
    this.LocationList = [];
    this.unmappedLocations = [];
    this.selectedLocation = null;
    this.imageMappings = [];
    this.filteredMappings = [];
    this.selectedMapping = null;
    this.pending = null;
    this.refreshImage();
    this.LoadTable([]);
  }
  // ********************************** Model Section End *******************************//

  // ********************************** Vehicle Image Section Start *******************************//
  // TEMP : reading from the local store. Replace with
  // this.commonService.getVehicleImages(plantid,audittypeid,shopid,modelid).subscribe(...)
  getVehicleImages() {
    this.modelImageList = [];
    if (!this.selectedmodel) {
      return;
    }
    this.modelImageList = this.vehicleImageStore.filter(
      (img) =>
        img.Model_ID == this.selectedmodel.Model_ID &&
        img.Shop_ID == this.selectedShop.Shop_ID
    );
    this.modelImageList.forEach((img) => this.setImageUrl(img));
  }

  // API sends the image as base64, the locally uploaded one is already a data url
  setImageUrl(img: VehicleImage) {
    if (!img.FileContent) {
      img.FileUrl = null;
    } else if (String(img.FileContent).indexOf('data:') === 0) {
      img.FileUrl = img.FileContent;
    } else {
      img.FileUrl = 'data:image/jpg;base64,' + img.FileContent;
    }
  }

  selectImage(img: VehicleImage) {
    if (img) {
      this.selectedImage = img;
      this.uploadMode = false;
      this.pending = null;
      this.selectedMapping = null;
      this.getMappingData();
    }
  }

  isCurrentImage(img: VehicleImage) {
    if (this.selectedImage) {
      return this.selectedImage.Vehicle_Image_ID == img.Vehicle_Image_ID;
    } else {
      return false;
    }
  }

  newImage() {
    if (!this.selectedShop) {
      this.toaster.warning('Please select Shop .');
      return;
    }
    if (!this.selectedmodel) {
      this.toaster.warning('Please select Model .');
      return;
    }
    this.uploadMode = true;
    this.selectedImage = null;
    this.pending = null;
    this.refreshImage();
  }

  cancelUpload() {
    this.uploadMode = false;
    this.refreshImage();
  }

  compressFile() {
    if (!this.imagename) {
      this.toaster.error('Please Enter Image Name');
      return;
    }
    this.uploadingImage = true;
    // This callback function return image in DataUrl (String ) format
    this.imageCompress.uploadFile().then(
      ({ image, orientation }) => {
        // This function compress image as per given quality, max height and width and returns string (Bytes)
        this.imageCompress
          .compressFile(image, orientation, 70, 100)
          .then((compressedImage) => {
            // This convert Bytes image to file format
            const imgFile = new File(
              [this.convertDataUrlToBlob(compressedImage)],
              this.imagename,
              { type: 'image/png' }
            );
            if (imgFile) {
              this.ImageToUpload = imgFile;
              if (this.ImageToUpload.size > 3.5 * 1024 * 1024) {
                this.errorMessage = 'File size should be below 3.5 MB.';
                this.ImageToUpload = null;
                this.imageDataUrl = null;
                this.uploadingImage = false;
                $('input[type=file]').val(null);
                return;
              }
              this.errorMessage = '';
              const reader = new FileReader();
              this.uploadingImage = false;
              reader.onload = (e) => {
                this.imageDataUrl = e.target.result as string;
              };
              reader.readAsDataURL(this.ImageToUpload);
            } else {
              this.uploadingImage = false;
              this.toaster.error('Error while uploading image');
            }
          });
      },
      (err) => {
        this.uploadingImage = false;
        console.log(err);
        this.toaster.error('Something went wrong , Please try later');
      }
    );
  }

  convertDataUrlToBlob(dataUrl): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  // TEMP : pushing in the local store. Replace with
  // this.commonService.saveVehicleImage(this.ImageToUpload,imageModel).subscribe(...)
  saveImage() {
    if (!this.selectedShop) {
      this.toaster.warning('Please select Shop .');
      return;
    }
    if (!this.selectedmodel) {
      this.toaster.warning('Please select Model .');
      return;
    }
    if (!this.imagename) {
      this.toaster.error('Please Enter Image Name');
      return;
    }
    if (!this.ImageToUpload || !this.imageDataUrl) {
      this.toaster.error('Please Choose Image');
      return;
    }
    const duplicate = this.vehicleImageStore.find(
      (img) =>
        img.Model_ID == this.selectedmodel.Model_ID &&
        img.Shop_ID == this.selectedShop.Shop_ID &&
        img.Image_Name.toLowerCase() == this.imagename.trim().toLowerCase()
    );
    if (duplicate) {
      this.toaster.warning(
        'Image Name is already used for : ' + this.selectedmodel.Model_Code,
        'Duplicate Record'
      );
      return;
    }

    this.tempImageID = this.tempImageID + 1;
    const imageModel: VehicleImage = {
      Vehicle_Image_ID: this.tempImageID,
      Image_Name: this.imagename.trim(),
      FileContent: this.imageDataUrl,
      FileName: this.ImageToUpload.name,
      FileType: '.png',
      ContentType: this.ImageToUpload.type,
      Shop_ID: this.selectedShop.Shop_ID,
      Model_ID: this.selectedmodel.Model_ID,
      Plant_ID: this.plantid,
      Audit_Type_Id: this.audittypeid,
      Is_Active: true,
      Inserted_Host: this.hostname,
      Inserted_User_ID: this.userid,
      Inserted_Date: new Date(),
      Shop_Name: this.selectedShop.Shop_Name,
      Model_Name: this.selectedmodel.Model_Code,
    };
    this.vehicleImageStore.push(imageModel);
    console.log('Vehicle image object :', imageModel);
    this.toaster.success('Image saved successfully', 'Success');
    this.uploadMode = false;
    this.refreshImage();
    this.getVehicleImages();
    this.selectImage(imageModel);
  }
  // ********************************** Vehicle Image Section End *******************************//

  // ********************************** Area Section Start *******************************//
  getAreaList() {
    if (this.selectedmodel) {
      this.commonService
        .getAreaList(this.selectedmodel.Model_ID, this.audittypeid)
        .subscribe((data) => {
          this.AreaList = data;
        });
    }
  }

  selectArea(area: Area) {
    if (area) {
      this.selectedArea = area;
      this.selectedPart = null;
      this.partList = [];
      this.selectedCP = null;
      this.cpList = [];
      this.selectedLocation = null;
      this.LocationList = [];
      this.unmappedLocations = [];
      this.pending = null;
      this.getPartList();
      this.filterMappings();
    }
  }
  // ********************************** Area Section End *******************************//

  // ********************************** Part Section Start *******************************//
  getPartList() {
    if (this.selectedArea) {
      this.commonService
        .getPartList(this.selectedArea.Area_ID, this.audittypeid)
        .subscribe((data) => {
          this.partList = data;
        });
    }
  }

  selectPart(part: Part) {
    if (part) {
      this.selectedPart = part;
      this.selectedCP = null;
      this.cpList = [];
      this.selectedLocation = null;
      this.LocationList = [];
      this.unmappedLocations = [];
      this.pending = null;
      this.getCPList();
      this.filterMappings();
    }
  }
  // ********************************** Part Section End *******************************//

  // ********************************** Check Point Section Start *******************************//
  getCPList() {
    if (this.selectedPart) {
      this.cpList = [];
      this.commonService
        .getCPList(this.selectedPart.Part_ID, this.audittypeid)
        .subscribe((data) => {
          if (data) {
            this.cpList = data;
          }
        });
    }
  }

  selectCP(cp: CheckPoint) {
    if (cp) {
      this.selectedCP = cp;
      this.selectedLocation = null;
      this.LocationList = [];
      this.unmappedLocations = [];
      this.pending = null;
      this.getLocationList();
      this.filterMappings();
    }
  }
  // ********************************** Check Point Section End *******************************//

  // ********************************** Location Section Start *******************************//
  getLocationList() {
    if (this.selectedCP) {
      this.commonService
        .getLocationList(this.selectedCP.Checkpoint_ID, this.audittypeid)
        .subscribe((data) => {
          this.LocationList = data;
          this.filterLocations();
        });
    }
  }

  // one location can be mapped only once on one image ,
  // so the already mapped locations are removed from the dropdown
  filterLocations() {
    if (!this.LocationList) {
      this.unmappedLocations = [];
      return;
    }
    this.unmappedLocations = this.LocationList.filter(
      (loc) =>
        !this.imageMappings.some((map) => map.Location_ID == loc.Location_ID)
    );
  }
  // ********************************** Location Section End *******************************//

  // ********************************** Mapping Section Start *******************************//
  // click on the image = start a new mapping on that exact point
  onImageClick(ev: MouseEvent) {
    if (!this.canCreate) {
      return;
    }
    if (!this.selectedImage) {
      this.toaster.warning('Please select Vehicle Image .');
      return;
    }
    if (!this.selectedArea) {
      this.toaster.warning('Please select Area .');
      return;
    }
    if (!this.selectedPart) {
      this.toaster.warning('Please select Part .');
      return;
    }
    if (!this.selectedCP) {
      this.toaster.warning('Please select Check Point .');
      return;
    }
    if (this.imageMappings.length >= this.MAX_MAPPING_PER_IMAGE) {
      this.toaster.warning(
        'Maximum ' +
          this.MAX_MAPPING_PER_IMAGE +
          ' locations can be mapped on one image.'
      );
      return;
    }
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    this.selectedLocation = null;
    this.selectedMapping = null;
    this.pending = {
      x: +(((ev.clientX - rect.left) / rect.width) * 100).toFixed(2),
      y: +(((ev.clientY - rect.top) / rect.height) * 100).toFixed(2),
    };
  }

  // TEMP : pushing in the local store. Replace with
  // this.commonService.saveVehicleImageMapping(mappingObj).subscribe(...)
  saveMapping() {
    if (!this.pending) {
      return;
    }
    if (!this.selectedLocation) {
      this.toaster.error('Please select Location');
      return;
    }
    const duplicate = this.imageMappings.find(
      (map) => map.Location_ID == this.selectedLocation.Location_ID
    );
    if (duplicate) {
      this.toaster.warning(
        'Location is already mapped on this image : ' +
          this.selectedLocation.Location_Name,
        'Duplicate Record'
      );
      return;
    }

    this.tempMappingID = this.tempMappingID + 1;
    const mappingObj: VehicleImageMapping = {
      Mapping_ID: this.tempMappingID,
      Vehicle_Image_ID: this.selectedImage.Vehicle_Image_ID,
      Shop_ID: this.selectedShop.Shop_ID,
      Model_ID: this.selectedmodel.Model_ID,
      Area_ID: this.selectedArea.Area_ID,
      Part_ID: this.selectedPart.Part_ID,
      Checkpoint_ID: this.selectedCP.Checkpoint_ID,
      Location_ID: this.selectedLocation.Location_ID,
      X_Coordinate: this.pending.x,
      Y_Coordinate: this.pending.y,
      Plant_ID: this.plantid,
      Audit_Type_Id: this.audittypeid,
      Is_Active: true,
      Inserted_Host: this.hostname,
      Inserted_User_ID: this.userid,
      Inserted_Date: new Date(),
      Area_Name: this.selectedArea.Area_Name,
      Part_Name: this.selectedPart.Part_Name,
      Checkpoint_Name: this.selectedCP.Checkpoint_Name,
      Location_Name: this.selectedLocation.Location_Name,
    };
    this.mappingStore.push(mappingObj);
    console.log('Vehicle image mapping object :', mappingObj);
    this.toaster.success(
      this.selectedLocation.Location_Name + ' mapped successfully',
      'Success'
    );
    this.pending = null;
    this.selectedLocation = null;
    this.getMappingData();
  }

  cancelMapping() {
    this.pending = null;
    this.selectedLocation = null;
  }

  selectMapping(map: VehicleImageMapping, ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    this.pending = null;
    this.selectedMapping = map;
  }

  isCurrentMapping(map: VehicleImageMapping) {
    if (this.selectedMapping) {
      return this.selectedMapping.Mapping_ID == map.Mapping_ID;
    } else {
      return false;
    }
  }

  // TEMP : removing from the local store. Replace with
  // this.commonService.deleteVehicleImageMapping(id).subscribe(...)
  DeleteRecord() {
    if (this.selectedForDelete) {
      this.mappingStore = this.mappingStore.filter(
        (map) => map.Mapping_ID != this.selectedForDelete
      );
      this.selectedForDelete = null;
      this.selectedMapping = null;
      this.toaster.success('Record deleted successfully', 'Success');
      this.getMappingData();
    }
  }

  deleteMapping(id: number, ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '250px',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedForDelete = id;
        this.DeleteRecord();
      }
    });
  }

  colorOf(map: VehicleImageMapping): string {
    return this.COLORS[map.Checkpoint_ID % this.COLORS.length];
  }
  // ********************************** Mapping Section End *******************************//

  // ********************************** Table Section Start *******************************//
  // TEMP : reading from the local store. Replace with
  // this.commonService.getVehicleImageMapping(plantid,audittypeid,imageid).subscribe(...)
  getMappingData() {
    this.imageMappings = [];
    if (!this.selectedImage) {
      this.filteredMappings = [];
      this.LoadTable([]);
      return;
    }
    this.imageMappings = this.mappingStore.filter(
      (map) => map.Vehicle_Image_ID == this.selectedImage.Vehicle_Image_ID
    );
    this.filterMappings();
  }

  // markers are shown only for the selected Area / Part / Check Point
  filterMappings() {
    let data = this.imageMappings;
    if (this.selectedArea) {
      data = data.filter((map) => map.Area_ID === this.selectedArea.Area_ID);
    }
    if (this.selectedPart) {
      data = data.filter((map) => map.Part_ID === this.selectedPart.Part_ID);
    }
    if (this.selectedCP) {
      data = data.filter(
        (map) => map.Checkpoint_ID === this.selectedCP.Checkpoint_ID
      );
    }
    this.filteredMappings = data;
    this.filterLocations();
    this.LoadTable(this.filteredMappings);
  }

  LoadTable(jsondatas) {
    const dataTable = $('#vehicleimagetable');

    if ($.fn.DataTable.isDataTable(dataTable)) {
      dataTable.DataTable().destroy();
    }

    dataTable.DataTable({
      destroy: true,
      lengthMenu: [
        [-1, 50, 25, 10, 5],
        ['All', 50, 25, 10, 5],
      ],
      data: jsondatas,
      columnDefs: [
        { title: 'Area Name', targets: 0 },
        { title: 'Part Name', targets: 1 },
        { title: 'Check Point', targets: 2 },
        { title: 'Location', targets: 3 },
        { title: 'X ( % )', targets: 4 },
        { title: 'Y ( % )', targets: 5 },
        { title: 'Action', targets: 6 },
      ],
      columns: [
        { data: 'Area_Name' },
        { data: 'Part_Name' },
        { data: 'Checkpoint_Name' },
        { data: 'Location_Name' },
        { data: 'X_Coordinate' },
        { data: 'Y_Coordinate' },
        {
          data: null,
          render: function (data) {
            const canDelete = localStorage.getItem('canDelete') === '1';
            if (canDelete) {
              return (
                "<div class='action-btn'>" +
                '<span id="deletemappingbtn" class="btn fa fa-trash deletebutton" title="Delete" ' +
                'style="border-radius: 50%!important; background-color: #0b9494; color: black!important;" ' +
                'data-element-id="' +
                data.Mapping_ID +
                '"></span></div>'
              );
            }
            return '';
          },
          createdCell: (cell, cellData, rowData) => {
            $(cell).on('click', '#deletemappingbtn', () => {
              this.ngZone.run(() => {
                this.deleteMapping(rowData.Mapping_ID);
              });
            });
          },
        },
      ],
    });
  }
  // ********************************** Table Section End *******************************//

  // ********************************** Other Section Start *******************************//
  refreshImage() {
    this.imagename = null;
    this.ImageToUpload = null;
    this.imageDataUrl = null;
    this.errorMessage = null;
    this.uploadingImage = false;
    $('input[type=file]').val(null);
  }

  refresh() {
    this.selectedShop = null;
    this.selectedmodel = null;
    this.modelList = [];
    this.modifyFlag = false;
    this.selectedForDelete = null;
    this.clearModelData();
  }

  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }
  // ********************************** Other Section End *******************************//
}
