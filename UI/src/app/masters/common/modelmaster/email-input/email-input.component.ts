import { Component, inject, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from '../../common.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-email-input',
  templateUrl: './email-input.component.html',
  styleUrls: ['./email-input.component.css']
})
export class EmailInputComponent {
  EmailList: string = '';

  commonService = inject(CommonService);
  toaster = inject(ToastrService);
  constructor(
    public dialogRef: MatDialogRef<EmailInputComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,

  ) {
    console.log(data);
    this.EmailList = data.Email_Addresses
  }
  validateEmails(emails: string): boolean {
    if (!emails) return true; // allow empty email field
    
    // Remove any whitespace and check if ends with comma
    const trimmedEmails = emails.trim();
    if (trimmedEmails.endsWith(',')) {
      this.toaster.warning('Email list should not end with comma');
      return false;
    }

    // Split emails by comma and validate each
    const emailList = trimmedEmails.split(',');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    for (const email of emailList) {
      const trimmedEmail = email.trim();
      if (!emailRegex.test(trimmedEmail)) {
        this.toaster.warning(`Invalid email format: ${trimmedEmail}`);
        return false;
      }
    }

    return true;
  }
  onSave() {
     if (!this.validateEmails(this.EmailList)) {
      this.toaster.warning('Please check EmailList Mails format');
      return;
    }
    this.data.Email_Addresses = this.EmailList;
    this.data.Updated_Host = localStorage.getItem('hostname');
    this.data.Updated_User_ID = localStorage.getItem('userid');
    this.commonService.updateModel(this.data.Model_ID, this.data).subscribe((res) => {
      console.log(res);
      if (res !== null && res !== undefined) {
        if (res.isErrorMessage) {
          this.toaster.error(res.messageDetail, res.messageTitle);
        } else if (res.isSuccessMessage) {
          this.onDismiss(true);
          this.toaster.success(res.messageDetail, res.messageTitle);
        } else if (res.isAlertMessage) {
          this.toaster.warning(res.messageDetail, res.messageTitle);
        } else {
          this.toaster.error('Something went wrong');
        }
      }
    })
    console.log(this.EmailList);
  }

  onDismiss(status) {
    this.dialogRef.close(status);
  }
  
}
