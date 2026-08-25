import { ChangeDetectorRef, Component, NgZone, Type } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Model } from 'src/app/shared/models/model.model';
import { shop } from 'src/app/shared/models/shop.model';
import { CommonService } from '../common.service';
import { Area } from 'src/app/shared/models/area.model';
import { Image } from 'src/app/shared/models/image.model';
import { Part } from 'src/app/shared/models/part.model';
import { NgxImageCompressService } from 'ngx-image-compress';
import { PopupImageComponent } from 'src/app/shared/components/popup-image/popup-image.component';
import { MatDialog } from '@angular/material/dialog';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { UploadImageComponent  } from 'src/app/masters/common/imagemaster/upload-image/upload-image.component';
declare var $: any;

@Component({
  selector: 'app-imagemaster',
  templateUrl: './imagemaster.component.html',
  styleUrls: ['./imagemaster.component.css'],
})
export class ImagemasterComponent {
  //Developer = Satish Jadhav
  // Token No.= 50005817
  // New Development
  // ********************************** Declaration Section Start *******************************//
  audittypeid: number;
  userid: number;
  plantid: number;
  newDefect: boolean;
  createDefectForm: FormGroup;
  selectedForDelete: number;
  modifyFlag: boolean;
  loading: boolean = true;
  // Shop
  shoplist: shop[];
  searchshopInput: string;
  selectedShop: shop;
  // Model
  modelList: Model[];
  searchModelInput: string;
  selectedmodel: Model;
  // Area
  AreaList: Area[] = [];
  searchAreaInput: string;
  selectedArea: Area;
  hostname: string;

  // Part
  partList: Part[] = [];
  selectedPart: Part;
  searchPartInput: string;
  // Image
  imagelist: Image[];
  selectedColumns: number;
  ImageToUpload: File;
  errorMessage: string;
  imagePath: any;
  imagename: string;
  imageContent: any;
  imageDataUrl: string;
  imgResultBeforeCompression: string = '';
  imgResultAfterCompression: string = '';
  uploadingImage: boolean = false;

  shopid: number;
  allshops: boolean;
  canCreate: boolean = true;

  filteredTableData: Image[]=[];

  constructor(
    private commonService: CommonService,
    private toaster: ToastrService,
    private router: Router,
    private ngZone: NgZone,
    private imageCompress: NgxImageCompressService,
    private dialog: MatDialog,
    private cdref: ChangeDetectorRef
  ) {
    this.createDefectForm = new FormGroup({
      defectname: new FormControl('', [Validators.required]),
      defectdesc: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit() {
    $('#ngslide').hide();
    // $('.sidebar-mini').addClass('sidebar-collapse');
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.audittypeid = this.commonService.getAuditType();
    this.userid = this.commonService.getUserID();
    this.plantid = this.commonService.getplantID();
    this.hostname = this.commonService.getHostData();
    this.newDefect = false;
    this.modifyFlag = false;
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
        this.getTableData();
      });
  }
  selectShop(shop: shop) {
    if (!this.modifyFlag) {
      this.AreaList = [];
      this.modelList = [];
    }
    if (shop) {
      // this.selectedshopid = shop.Shop_ID;
      this.selectedShop = shop;
      this.selectedmodel = null;
      this.selectedArea = null;
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
      this.selectedArea = null;
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
      this.commonService
        .getAreaList(this.selectedmodel.Model_ID, this.audittypeid)
        .subscribe((data) => {
          this.AreaList = data;
        });
    }
  }

  selectArea(check: Area) {
    if (check) {
      this.selectedArea = check;
      this.getPartList();
      this.filterData();
    }
  }
  isCurrentArea(check: Area) {
    if (this.selectedArea) {
      return this.selectedArea.Area_ID == check.Area_ID;
    } else {
      return false;
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

  selectPart(Part: Part) {
    if (Part) {
      const temp = this.imagelist.find(
        (img) =>
          img.Shop_ID == this.selectedShop.Shop_ID &&
          img.Model_ID == this.selectedmodel.Model_ID &&
          img.Area_ID == this.selectedArea.Area_ID &&
          img.Part_ID == Part.Part_ID
      );
      if (temp) {
        this.toaster.warning(
          '',
          'Image is alredy uploaded for : ' + Part.Part_Name
        );
        return;
      }
      this.selectedPart = Part;
      this.imagename = Part.Part_Name;
    }
  }
  isCurrentPart(Part: Part) {
    if (this.selectedPart) {
      return this.selectedPart.Part_ID == Part.Part_ID;
    } else {
      return false;
    }
  }

  // ********************************** Part Section End *******************************//
  // ********************************** Image Section Start *******************************//

  // this function not using now
  handleFileInput(event: any) {
    // const file: FileList = (event.target as HTMLInputElement).files;
    // this.ImageToUpload = file.item(0);
    if (
      this.ImageToUpload.type == 'image/png' ||
      this.ImageToUpload.type == 'image/jpeg'
    ) {
      const reader = new FileReader();

      reader.onload = (e) => {
        this.imageDataUrl = e.target.result as string;

        console.log('Image Uploaded');
      };
      reader.readAsDataURL(this.ImageToUpload);
      // });
    } else {
      this.toaster.error('You can upload only Image file!...');
      $('input[type=file]').val(null);
      this.ImageToUpload = null;
      this.imageDataUrl = null;
    }
    if (this.ImageToUpload.size > 3.5 * 1024 * 1024) {
      this.errorMessage = 'File size should be below 3.5 MB.';
      this.ImageToUpload = null;
      this.imageDataUrl = null;
      $('input[type=file]').val(null);
      return;
    }
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.indexOf(this.ImageToUpload.type) === -1) {
      // Check file type
      this.errorMessage = 'Only JPEG and PNG images are allowed.';
      this.ImageToUpload = null;
      this.imageDataUrl = null;

      $('input[type=file]').val(null);
      return;
    }
    this.errorMessage = '';
  }

  saveImage() {
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
    if (!this.selectedPart) {
      this.toaster.warning('Please select Part .');
      return;
    }
    if (!this.imagename) {
      this.toaster.error('Please Enter Image Name');
    } else {
      const imageModel: Image = {
        Inserted_Host: this.hostname,
        Inserted_User_ID: this.userid,
        Plant_ID: this.plantid,
        Audit_Type_Id: this.audittypeid,
        Shop_ID: this.selectedShop.Shop_ID,
        Model_ID: this.selectedmodel.Model_ID,
        Area_ID: this.selectedArea.Area_ID,
        Part_ID: this.selectedPart.Part_ID,
        ImageName: this.imagename,
      };

      this.commonService
        .saveImage(this.ImageToUpload, imageModel)
        .subscribe((data) => {
          if (data !== null && data !== undefined) {
            if (data.isErrorMessage || data.isExceptionMessage) {
              this.toaster.error(data.IsMassege, data.messageTitle);
            } else if (data.IsSuccessAlert) {
              this.refreshImage();
              this.getTableData();
              this.toaster.success(data.IsMassege, data.IsTitle);
            } else if (data.IsErrorAlertDuplicate) {
              this.toaster.warning(data.IsMassege, data.messageTitle);
            } else {
              this.toaster.error('Something went wrong');
            }
          }
        });
    }
  }

  DeleteRecord() {
    if (this.selectedForDelete) {
      this.commonService
        .deleteImage(this.selectedForDelete)
        .subscribe((data) => {
          if (data == null || data == undefined || data == '') {
            this.toaster.error(
              'Can not delete  Record  ',
              'Unable to Connect to server! '
            );
          } else if (
            data.isErrorMessage ||
            data.IsErrorAlertNotFound ||
            data.IsErrorAlert ||
            data.IsErrorAlertRef
          ) {
            this.toaster.error(data.messageDetail, data.IsTitle);
          } else if (data.IsSuccessAlert) {
            this.refreshImage();
            this.toaster.success(data.messageDetail, data.IsTitle);
          } else if (data.isAlertMessage) {
            this.toaster.warning(data.messageDetail, data.IsTitle);
          }
        });
    }
  }
  closeDeleteRecord() {
    this.selectedForDelete = null;
    $('.close').click();
  }

  showImage(id) {
    const temp = this.imagelist.find((img) => img.Image_ID == id);
    {
      if (temp) {
        this.imageContent = temp.FileContent;
        this.dialog.open(PopupImageComponent, {
          data: this.imageContent,
        });
      }
    }
  }

  compressFile() {
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
              { type: `image/png` }
            );
            console.log(imgFile);
            if (imgFile) {
              this.ImageToUpload = imgFile;
              if (this.ImageToUpload.size > 3.5 * 1024 * 1024) {
                this.errorMessage = 'File size should be below 3.5 MB.';
                this.ImageToUpload = null;
                this.imageDataUrl = null;
                $('input[type=file]').val(null);
                return;
              }
              const reader = new FileReader();
              this.uploadingImage = false;
              reader.onload = (e) => {
                this.imageDataUrl = e.target.result as string;
                console.log('Image Uploaded');
              };
              reader.readAsDataURL(this.ImageToUpload);
            } else {
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

  // ********************************** Image Section End *******************************//
  // ********************************** Table Section Start *******************************//
  getTableData() {
    if (this.plantid) {
      this.commonService
        .getImageTableData(
          this.plantid,
          this.audittypeid,
          this.shopid,
          this.allshops
        )
        .subscribe((data) => {
          if (data) {
            // this.LoadTable(data);
            this.imagelist = data;
            this.loading = false;
            this.filterData();
            console.log(data);
          }
        });
    }
  }

  filterData() {
    if (this.selectedShop && this.selectedmodel && this.selectedArea) {
      this.filteredTableData = this.imagelist.filter((d) => d.Shop_ID === this.selectedShop.Shop_ID && d.Model_ID === this.selectedmodel.Model_ID && d.Area_ID === this.selectedArea.Area_ID);
      this.LoadTable(this.filteredTableData);
      return;
    }

    if (this.selectedShop && this.selectedmodel) {
      this.filteredTableData = this.imagelist.filter((d) => d.Shop_ID === this.selectedShop.Shop_ID && d.Model_ID === this.selectedmodel.Model_ID);
      this.LoadTable(this.filteredTableData);
      return;
    }

    if (this.selectedShop) {
      this.filteredTableData = this.imagelist.filter((d) => d.Shop_ID === this.selectedShop.Shop_ID);
      this.LoadTable(this.filteredTableData);
      return;
    }

    this.filteredTableData = this.imagelist;
    this.LoadTable(this.filteredTableData);
  }

  LoadTable(jsondatas) {
    const dataTable = $('#shopmodeltable');

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
        { title: 'Shop', targets: 0 },
        { title: 'Model Code', targets: 1 },
        { title: 'Area Name', targets: 2 },
        { title: 'Part Name', targets: 3 },
        { title: 'Image Name', targets: 4 },
        { title: 'Image', targets: 5 },
        { title: 'Action', targets: 6 },
      ],
      columns: [
        { data: 'Shop_Name' },
        { data: 'Model_Name' },
        { data: 'Area_Name' },
        { data: 'Part_Name' },
        { data: 'ImageName' },
        {
          data: 'FileContent',
          render: function (data, type, JsonResultRow) {
            return `<img
                      id="imageclick"
                      
                      src="data:image/jpg;base64,${JsonResultRow.FileContent}"
                      style="height:40px;width:40px;object-fit:contain;"
                    >`;
          },
          createdCell: (cell, cellData, rowData) => {
            $(cell).on('click', '#imageclick', () => {
              this.ngZone.run(() => {
                this.showImage(rowData.Image_ID);
              });
            });
          },
        },
        {
          data: null,
          render: function (data) {
            const canDelete = localStorage.getItem('canDelete') === '1';
            if (canDelete) {
              return `<div class='action-btn'>
                    <span id="modifyebtn" class="btn fa fa-pencil modifycheckBtn modifybtn" data-toggle="modal" title="Edit"
                style="border-radius: 50%!important; background-color: #0b9494; color: black;"
                data-target="#mymodal" data-element-obj="${data.Image_ID}"></span>

                <span id="deletemodelbtn" class="btn fa fa-trash deletebutton"
                        title="Delete"  style="border-radius: 50%!important;
          background-color: #0b9494;
          color: black!important;"
                        data-element-id="${data.Image_ID}"></span>
              </div>`;
            }
            return '';
          },
          createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {
            $(cell).on('click', '#modifyebtn', () => {
              const dialogRef = this.dialog.open(UploadImageComponent, {
                width: '250px',
                enterAnimationDuration: '0ms',
                exitAnimationDuration: '0ms',
                data: {
                  imageId: rowData.Image_ID  
                }
                
              });
              dialogRef.afterClosed().subscribe((result) => {
                console.log('The dialog was closed' + result);
                if (result) {
                  this.getTableData();
                }
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
                    this.selectedForDelete = rowData.Image_ID;
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
    this.modelList = [];
    this.newDefect = false;
    this.searchshopInput = null;
    this.modifyFlag = false;
    this.selectedForDelete = null;
    this.createDefectForm.reset();
    this.selectedShop = null;
    this.selectedmodel = null;
    this.searchModelInput = null;
    this.AreaList = null;
    this.selectedArea = null;
    this.selectedColumns = null;
    this.imagename = null;
    this.ImageToUpload = null;
    this.imageDataUrl = null;
    this.partList = [];
    this.AreaList = [];
    this.modelList = [];
    this.selectedPart = null;
    this.searchModelInput = null;
    this.searchAreaInput = null;
    this.searchPartInput = null;
    this.uploadingImage = false;
    // this.getShopList();
    $('input[type=file]').val(null);
    $('#imgid').val(null);
  }
  refreshImage() {
    this.selectedColumns = null;
    this.imagename = null;
    this.ImageToUpload = null;
    this.imageDataUrl = null;
    this.selectedPart = null;
    $('input[type=file]').val(null);
    $('#imgid').val(null);
    this.getTableData();
  }
  exit() {
    $('#ngslide').show();
    this.router.navigate(['/configmaster']);
  }

  // ********************************** Other Section End *******************************//
}
// this.imgResultBeforeCompression = image;
// console.log(
//   'Size in bytes of the uploaded image was:',
//   this.imageCompress.byteCount(image)
// );
// this.imgResultAfterCompression = compressedImage;
// console.log(
//   'Size in bytes after compression is now:',
//   this.imageCompress.byteCount(compressedImage)
// );
