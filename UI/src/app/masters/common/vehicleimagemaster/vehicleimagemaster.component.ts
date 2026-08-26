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
import { ChangeImagePopupComponent } from 'src/app/shared/components/change-image-popup/change-image-popup.component';
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
  canUpdate: boolean = true;
  canDelete: boolean = true;
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
    this.canUpdate = this.commonService.canUpdate();
    this.canDelete = this.commonService.canDelete();
    localStorage.setItem('canCreate', this.canCreate ? '1' : '0');
    localStorage.setItem('canUpdate', this.canUpdate ? '1' : '0');
    localStorage.setItem('canDelete', this.canDelete ? '1' : '0');
    this.cdref.detectChanges();
  }

  // common handler for every save / update / delete response ( ValidationModel )
  private handleResponse(data: any, onSuccess: () => void) {
    if (data === null || data === undefined || data === '') {
      this.toaster.error('Unable to Connect to server !');
      return;
    }
    if (data.IsSuccessAlert) {
      this.toaster.success(data.IsMassege, data.IsTitle);
      onSuccess();
    } else if (data.IsErrorAlertDuplicate) {
      this.toaster.warning(data.IsMassege, data.IsTitle);
    } else if (
      data.IsErrorAlertNotFound ||
      data.IsErrorAlert ||
      data.IsErrorAlertRef
    ) {
      this.toaster.error(data.IsMassege, data.IsTitle);
    } else if (data.isExceptionMessage || data.isErrorMessage) {
      this.toaster.error(data.IsMassege, data.IsTitle);
    } else {
      this.toaster.error('Something went wrong');
    }
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
  getVehicleImages(selectImageId?: number) {
    this.modelImageList = [];
    if (!this.selectedShop || !this.selectedmodel) {
      return;
    }
    this.commonService
      .getVehicleImages(
        this.plantid,
        this.audittypeid,
        this.selectedShop.Shop_ID,
        this.selectedmodel.Model_ID
      )
      .subscribe((data) => {
        this.modelImageList = data ? data : [];
        this.modelImageList.forEach((img) => this.setImageUrl(img));

        // user has already opened the upload panel , do not pull him out of it
        if (this.uploadMode) {
          return;
        }

        // keep the same image selected after a save / change / reload
        if (this.modelImageList.length) {
          const keepId = selectImageId
            ? selectImageId
            : this.selectedImage
            ? this.selectedImage.Vehicle_Image_ID
            : null;
          const temp = keepId
            ? this.modelImageList.find((i) => i.Vehicle_Image_ID == keepId)
            : null;
          this.selectImage(temp ? temp : this.modelImageList[0]);
        } else {
          this.selectedImage = null;
          this.getMappingData();
        }
      });
  }

  // API sends the image as base64 , the locally selected one is already a data url
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
    // come back to the image which was open before
    this.getVehicleImages();
  }

  // opens the file browser and returns the compressed file
  private pickAndCompress(filename: string): Promise<File> {
    return new Promise<File>((resolve, reject) => {
      this.imageCompress.uploadFile().then(
        ({ image, orientation }) => {
          // This function compress image as per given quality, max height and width and returns string (Bytes)
          this.imageCompress
            .compressFile(image, orientation, 70, 100)
            .then((compressedImage) => {
              // This convert Bytes image to file format
              const imgFile = new File(
                [this.convertDataUrlToBlob(compressedImage)],
                filename,
                { type: 'image/png' }
              );
              if (!imgFile) {
                reject('Error while uploading image');
                return;
              }
              if (imgFile.size > 3.5 * 1024 * 1024) {
                reject('File size should be below 3.5 MB.');
                return;
              }
              resolve(imgFile);
            }, reject);
        },
        (err) => reject(err)
      );
    });
  }

  compressFile() {
    if (!this.imagename) {
      this.toaster.error('Please Enter Image Name');
      return;
    }
    this.uploadingImage = true;
    this.pickAndCompress(this.imagename).then(
      (imgFile) => {
        this.ImageToUpload = imgFile;
        this.errorMessage = '';
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageDataUrl = e.target.result as string;
          this.uploadingImage = false;
        };
        reader.readAsDataURL(imgFile);
      },
      (err) => {
        this.uploadingImage = false;
        this.ImageToUpload = null;
        this.imageDataUrl = null;
        $('input[type=file]').val(null);
        if (typeof err === 'string') {
          this.errorMessage = err;
        } else {
          console.log(err);
          this.toaster.error('Something went wrong , Please try later');
        }
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
    if (!this.ImageToUpload) {
      this.toaster.error('Please Choose Image');
      return;
    }

    const imageModel: VehicleImage = {
      Image_Name: this.imagename.trim(),
      Shop_ID: this.selectedShop.Shop_ID,
      Model_ID: this.selectedmodel.Model_ID,
      Plant_ID: this.plantid,
      Audit_Type_Id: this.audittypeid,
      Inserted_Host: this.hostname,
      Inserted_User_ID: this.userid,
    };

    this.commonService
      .saveVehicleImage(this.ImageToUpload, imageModel)
      .subscribe(
        (data) => {
          this.handleResponse(data, () => {
            this.uploadMode = false;
            this.refreshImage();
            // newest image comes first from the API , so it gets selected
            this.selectedImage = null;
            this.getVehicleImages();
          });
        },
        (err) => {
          console.log(err);
          this.toaster.error('Unable to Connect to server !');
        }
      );
  }

  // Change the picture of the selected image .
  // The user decides whether the already mapped locations should stay or go.
  changeImage() {
    if (!this.selectedImage) {
      this.toaster.warning('Please select Vehicle Image .');
      return;
    }
    this.pickAndCompress(this.selectedImage.Image_Name).then(
      (imgFile) => {
        if (this.imageMappings.length) {
          const dialogRef = this.dialog.open(ChangeImagePopupComponent, {
            width: '420px',
            enterAnimationDuration: '0ms',
            exitAnimationDuration: '0ms',
            data: { mappingCount: this.imageMappings.length },
          });
          dialogRef.afterClosed().subscribe((result) => {
            if (result === 'keep' || result === 'remove') {
              this.uploadChangedImage(imgFile, result === 'keep');
            }
          });
        } else {
          this.uploadChangedImage(imgFile, true);
        }
      },
      (err) => {
        if (typeof err === 'string') {
          this.toaster.error(err);
        } else {
          console.log(err);
          this.toaster.error('Something went wrong , Please try later');
        }
      }
    );
  }

  private uploadChangedImage(imgFile: File, keepMapping: boolean) {
    const imageModel: VehicleImage = {
      Vehicle_Image_ID: this.selectedImage.Vehicle_Image_ID,
      Image_Name: this.selectedImage.Image_Name,
      Shop_ID: this.selectedImage.Shop_ID,
      Model_ID: this.selectedImage.Model_ID,
      Plant_ID: this.plantid,
      Audit_Type_Id: this.audittypeid,
      Updated_Host: this.hostname,
      Updated_User_ID: this.userid,
    };

    const imageid = this.selectedImage.Vehicle_Image_ID;

    this.commonService
      .changeVehicleImage(imageid, keepMapping, imgFile, imageModel)
      .subscribe(
        (data) => {
          this.handleResponse(data, () => {
            this.pending = null;
            this.selectedMapping = null;
            this.getVehicleImages(imageid);
          });
        },
        (err) => {
          console.log(err);
          this.toaster.error('Unable to Connect to server !');
        }
      );
  }

  // Deleting the image removes every location mapped on it as well
  deleteImage() {
    if (!this.selectedImage) {
      this.toaster.warning('Please select Vehicle Image .');
      return;
    }
    const imageid = this.selectedImage.Vehicle_Image_ID;
    const dialogRef = this.dialog.open(DeletePopupComponent, {
      width: '250px',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.commonService.deleteVehicleImage(imageid).subscribe(
          (data) => {
            this.handleResponse(data, () => {
              this.selectedImage = null;
              this.pending = null;
              this.selectedMapping = null;
              this.getVehicleImages();
            });
          },
          (err) => {
            console.log(err);
            this.toaster.error('Unable to Connect to server !');
          }
        );
      }
    });
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

  // the event is stopped here itself , because *ngIf removes this popup
  // as soon as pending becomes null and after that the click was reaching
  // the image and was creating one more point on the save / close button
  saveMapping(ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
    if (!this.pending) {
      return;
    }
    if (!this.selectedLocation) {
      this.toaster.error('Please select Location');
      return;
    }

    const mappingObj: VehicleImageMapping = {
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
      Inserted_Host: this.hostname,
      Inserted_User_ID: this.userid,
    };

    this.commonService.saveVehicleImageMapping(mappingObj).subscribe(
      (data) => {
        this.handleResponse(data, () => {
          this.pending = null;
          this.selectedLocation = null;
          this.getMappingData();
        });
      },
      (err) => {
        console.log(err);
        this.toaster.error('Unable to Connect to server !');
      }
    );
  }

  cancelMapping(ev?: Event) {
    if (ev) {
      ev.stopPropagation();
    }
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

  DeleteRecord() {
    if (this.selectedForDelete) {
      this.commonService
        .deleteVehicleImageMapping(this.selectedForDelete)
        .subscribe(
          (data) => {
            this.handleResponse(data, () => {
              this.selectedForDelete = null;
              this.selectedMapping = null;
              this.getMappingData();
            });
          },
          (err) => {
            console.log(err);
            this.toaster.error('Unable to Connect to server !');
          }
        );
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
  getMappingData() {
    this.imageMappings = [];
    if (!this.selectedImage) {
      this.filteredMappings = [];
      this.filterLocations();
      this.LoadTable([]);
      return;
    }
    this.commonService
      .getVehicleImageMapping(
        this.plantid,
        this.audittypeid,
        this.selectedImage.Vehicle_Image_ID
      )
      .subscribe((data) => {
        this.imageMappings = data ? data : [];
        this.filterMappings();
      });
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
