import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SubmitAudit } from './submit.model';
import { AuditService } from '../../audit.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-submit-audit',
  templateUrl: './submit-audit.component.html',
  styleUrls: ['./submit-audit.component.css'],
})
export class SubmitAuditComponent {
  selectedOption: any = 1;
  optionsList: any[] = [
    {
      ID: 1,
      title: 'Completed',
    },
    {
      ID: 2,
      title: 'Holiday/Shut Down',
    },
    {
      ID: 3,
      title: 'Other',
    },
  ];
  remark: string;
  constructor(
    public dialogRef: MatDialogRef<SubmitAuditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private auditService: AuditService,
    private toaster: ToastrService
  ) { }

  onSubmit(): void {
    if (this.selectedOption === 1 && !this.data.IS_Audit_Completed) {
      this.toaster.warning(
        'Please completed Audit first ',
        'Audit Not Completed'
      );
      return;
    }
    const saveData: SubmitAudit = {
      Status: this.selectedOption,
      StatusRemark: this.remark,
      Updated_Host: this.data.Updated_Host,
      Updated_User_ID: this.data.Updated_User_ID,
    };

    this.auditService
      .updateStatus(
        this.data.Audit_Plan_ID,
        this.data.Audit_Plan_Log_ID,
        saveData
      )
      .subscribe(
        (data) => {
          if (data.isErrorMessage) {
            this.toaster.error(data.messageDetail, data.messageTitle);
          } else if (data.isSuccessMessage) {
            // this.sendMail();
            this.dialogRef.close({ status: true, submit: this.selectedOption });
            this.toaster.success(data.messageDetail, data.messageTitle);
          } else if (data.isAlertMessage) {
            this.toaster.warning(data.messageDetail, data.messageTitle);
          } else {
            this.toaster.error('Something went wrong');
          }
        },
        (err) => {
          console.log(err);
          this.toaster.error(err);
        }
      );
  }
  sendMail() {
    debugger;
    const data = {
      Employee_Name: localStorage.getItem('Name'),
      Employee_Email: localStorage.getItem('Email'),
      Model_Name: this.data.Model_Name,
      Status: this.selectedOption,
      Reason: this.remark,
      Manager_ID: localStorage.getItem('Manager_ID'),
      Audit_Due_Date: this.data.Audit_Due_Date,
      Plan_Log_ID: this.data.Audit_Plan_Log_ID,
      Plant_ID: localStorage.getItem('plantid'),
      Audit_Type: this.data.Audit_Type,
      Plant_Code: localStorage.getItem('Plant_Code')
    }
    this.auditService
      .sendAuditSubmissionMail(data)
      .subscribe(
        (res) => {
          if (res) {
            this.toaster.success("Mail send to manager");
          } else {
            this.toaster.error('Something went wrong');
          }
        },
        (err) => {
          console.log(err);
          this.toaster.error(err);
        }
      );
  }

  closefalse(): void {
    this.dialogRef.close(false);
  }
}
