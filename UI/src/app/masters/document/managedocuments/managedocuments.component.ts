import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonService } from '../../common/common.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-managedocuments',
  templateUrl: './managedocuments.component.html',
  styleUrls: ['./managedocuments.component.css']
})
export class ManagedocumentsComponent {
  //Developer = Satish Jadhav
  // Token No.= 50005817
  // New Development
  // ********************************** Declaration Section Start *******************************//
  allshops: boolean = false;
  audittypeid: number;
  userid: number;
  shopid: number;
  loading: boolean = false;
  canCreate: boolean = false;
  canDelete: boolean = false;

  // files
  selectedFile: File | null = null;
  FileTitle: string = null;

  // Table
  TableData: any[] = [];
  documentUrl: SafeResourceUrl;

  // Dependency 
  readonly commonService = inject(CommonService);
  readonly cdref = inject(ChangeDetectorRef);
  readonly http = inject(HttpClient);
  readonly toastr = inject(ToastrService);
  readonly dialog = inject(MatDialog);
  // ********************************** Declaration Section End *******************************//

  ngOnInit() {
    $('#ngslide').hide();
    // $('.sidebar-mini').addClass('sidebar-collapse');
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1';
    this.audittypeid = localStorage.getItem('audittypeid') ? parseInt(localStorage.getItem('audittypeid')) : 0;
    this.userid = localStorage.getItem('userid') ? parseInt(localStorage.getItem('userid')) : 0;
    this.getTableData();

    this.commonService.getUserRights();
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
    this.canCreate = this.commonService.canCreate();
    this.canDelete = this.commonService.canDelete();
  }



  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onUpload() {
    if (!this.selectedFile) {
      this.toastr.warning('Please select a file to upload');
      return;
    }
    if (!this.FileTitle) {
      this.toastr.warning('Please select File Title');
      return;
    }

    const saveData = {
      Document_Title: this.FileTitle,
      Inserted_User_ID: this.userid,
      Plant_Code: localStorage.getItem('Plant_Code'),
      Inserted_Host: localStorage.getItem('hostname')
    }
    this.commonService.saveDocument(this.selectedFile, saveData).subscribe(
      (data) => {
        if (data !== null && data !== undefined) {
          if (data.isErrorMessage || data.isExceptionMessage) {
            this.toastr.error(data.messageDetail, data.messageTitle);
          } else if (data.messageDetail) {
            this.toastr.success(data.SuccessMessage, data.IsTitle);
            this.selectedFile = null;
            this.FileTitle = null;
            this.getTableData();
          } else if (data.IsErrorAlertDuplicate) {
            this.toastr.warning(data.messageDetail, data.messageTitle);
          } else {
            this.toastr.error(data.messageDetail, data.messageTitle);
          }
        }
      },
      (error) => {
        this.toastr.error('File upload failed');
        console.error(error);
      }
    );

  }

  getTableData() {
    this.commonService.getDocumentTableData().subscribe(res => {
      console.log(res);
      this.TableData = res;
    })
  }
  downloadFile(fileName: string, documentTitle: string) {
    this.commonService.downloadDocument(fileName).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
        a.download = documentTitle + fileExtension;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      (error) => {
        this.toastr.error('File download failed');
        console.error(error);
      }
    );
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
          .deleteDocument(ID)
          .subscribe((data) => {
            if (data == null || data == undefined || data == '') {
              this.toastr.error(
                'Can not delete  Record  ',
                'Unable to Connect to server! '
              );
            } else if (
              data.isErrorMessage ||
              data.IsErrorAlertNotFound ||
              data.IsErrorAlert ||
              data.IsErrorAlertRef
            ) {
              this.toastr.error(data.messageDetail, data.IsTitle);
            } else if (data.isSuccessMessage) {
              this.toastr.success(data.messageDetail, data.IsTitle);
              this.getTableData();
            } else if (data.isAlertMessage) {
              this.toastr.warning(data.messageDetail, data.IsTitle);
            }
          });
      }
    });
  }

}
