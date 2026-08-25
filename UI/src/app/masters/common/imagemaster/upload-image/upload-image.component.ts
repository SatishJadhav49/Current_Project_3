import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { CommonService } from '../../../common/common.service';
import { CommonService } from '../../common.service'
import { NgxImageCompressService } from 'ngx-image-compress';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css']
})
export class UploadImageComponent {
  uploadForm: FormGroup;
  selectedFile: File | null = null;
  isLoading: boolean = false;
  data: any;
  uploadingImage: boolean = false;
  imgToUpdate: string;
  ImageToUpload: File;
  imagename: string;
  errorMessage: string;
  imageDataUrl: string;
 
  constructor(
    private fb: FormBuilder,
    private commonService: CommonService,
    private dialogRef: MatDialogRef<UploadImageComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private imageCompress: NgxImageCompressService,
    private toaster: ToastrService,
    private _toastr: ToastrService
  ) {}
 
  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      file: [null, Validators.required]
    });
 
    this.data = this.dialogData;
    if (!this.data || !this.data.imageId) {
      console.error('Image ID is missing');
    }
  }
 
  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      this.uploadForm.patchValue({
        file: this.selectedFile
      });
    }
  }
 
  compressFile() {
    this.uploadingImage = true;
    // This callback function return image in DataUrl (String ) format image
    this.imageCompress.uploadFile().then(
      ({ image, orientation }) => {
        this.imgToUpdate = null;
        this.ImageToUpload = null;
        // This function compress image as per given quality, max height and width and returns string (Bytes)
        // Compress Image only if its size is greater that 270 KB
        if (image.length > 270000) {
          this.imageCompress
            .compressFile(image, orientation, 70, 100)
            .then((compressedImage) => {
              // This convert Bytes image to file format
              const imgFile = new File(
                [this.convertDataUrlToBlob(compressedImage)],
                this.imagename,
                { type: `image/png` }
              );
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
        } else {
          const imgFile = new File(
            [this.convertDataUrlToBlob(image)],
            this.imagename,
            { type: `image/png` }
          );
          // console.log(imgFile);
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
              this.onSubmit()
              console.log('Image Uploaded');
            };
            reader.readAsDataURL(this.ImageToUpload);
          } else {
            this.toaster.error('Error while uploading image');
          }
        }
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
  onSubmit(): void {
    console.log("this.data",this.data.imageId);
    console.log(" this.ImageToUpload",  this.ImageToUpload)
    if ( this.ImageToUpload) {
      
      if (!this.data || !this.data.imageId) {
        console.error('Image ID is missing');
        this.toaster.error("Image ID Missing");
        return;
      }
     
      this.isLoading = true;
 
      // Create a FormData object to send the image
      const formData = new FormData();
      formData.append('Image', this.ImageToUpload, this.ImageToUpload.name);
      formData.append('imagemodel', JSON.stringify({ imageId: this.data.imageId }));
 
      // Call the service method to upload the image
      this.commonService.editImage(this.data.imageId, formData).subscribe(
        response => {
          if (response.isSuccessMessage) {
            this._toastr.success(response.messageDetail, response.messageTitle);
            this.dialogRef.close(true);
          } else if (response.isErrorMessage) {
            this._toastr.error(response.messageTitle);
          } else if (response.isExceptionMessage) {
            this._toastr.error(response.messageDetail);
          } else if (response.IsErrorAlertDuplicate) {
            this._toastr.warning(response.messageTitle);
          }
          this.isLoading = false;
        },
        error => {
          console.error('Error updating image', error);
          this.isLoading = false;
        }
      );
    } else {
      console.log('No file selected or form is invalid');
    }
  }
}
