import { DatePipe } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonService } from '../../common.service';
import { ToastrService } from 'ngx-toastr';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-calculations',
  templateUrl: './calculations.component.html',
  styleUrls: ['./calculations.component.css'],
})
export class CalculationsComponent {
  calculatedLCL: number = 0;
  calculatedUCL: number = 0;
  calculatedUCLR: number = 0;
  startdate: any;
  enddate: any;
  @ViewChild('enddatepicker1', {
    read: MatInput,
  })
  enddatepicker1: MatInput;

  @ViewChild('startdatepicker1', {
    read: MatInput,
  })
  startdatepicker1: MatInput;
  constructor(
    public dialogRef: MatDialogRef<CalculationsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datePipe: DatePipe,
    private commonService: CommonService,
    private toster: ToastrService
  ) { }

  onStartDateChange(event: any) {
    if (event.value) {
      this.startdate = event.value;
      if (this.enddate) {
        this.getCalculations();
      }
    }
  }
  onEndDateChange(event: any) {
    if (event.value) {
      this.enddate = event.value;
    }
    if (this.startdate && this.enddate) {
      var date1 = new Date(this.startdate);
      var date2 = new Date(this.enddate);
      var diffDays = date2.getDate() - date1.getDate();
      console.log(diffDays);
      this.getCalculations();
    }
  }

  getCalculations() {
    this.calculatedLCL = null;
    this.calculatedUCL = null;
    this.calculatedUCLR = null;
    const temp1 = this.datePipe
      .transform(this.startdate, 'dd-MM-yyyy')
      .toString();
    const temp2 = this.datePipe
      .transform(this.enddate, 'dd-MM-yyyy')
      .toString();
    this.commonService
      .getCalculations(
        temp1,
        temp2,
        this.data.rowData.Audit_Type_Id,
        this.data.rowData.Location_ID,
        this.data.rowData.Is_Gap ? 1 : 2
      )
      .subscribe((res) => {
        console.log(res);
        if (res.length > 0) {
          this.calculatedLCL = res[0].LCL;
          this.calculatedUCL = res[0].UCL;
          this.calculatedUCLR = res[0].UCLR;
        } else {
          this.toster.warning('Could not calculate Control Limits !!');
        }
      });
  }

  onSave(): void {
    this.data.rowData.UCLR = this.calculatedUCLR;
    this.data.rowData.UCL = this.calculatedUCL;
    this.data.rowData.LCL = this.calculatedLCL;
    this.commonService
      .updateCalculations(this.data.rowData.Specification_ID, this.data.rowData)
      .subscribe((res) => {
        if (res.isSuccessMessage) {
          this.dialogRef.close('saved');
        } else {
          this.dialogRef.close('error');
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close('canceled');
  }
}
