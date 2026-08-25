import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { ExcelUploadService } from '../../services/excel-upload.service';
import { ToastrService } from 'ngx-toastr';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-excel-upload',
  templateUrl: './excel-upload.component.html',
  styleUrls: ['./excel-upload.component.css'],
})
export class ExcelUploadComponent {
  master: string;
  excelToUpload: File;
  loading: boolean = false;
  constructor(
    public dialogRef: MatDialogRef<ExcelUploadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private excelService: ExcelUploadService,
    private _toastr: ToastrService,
    public router: Router
  ) {
    this.findMaster();
  }
  ngOnInit() {
    this.router.events
      .pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.id === 1 && event.url === event.urlAfterRedirects) {
          alert('Want to refresh page');
        }
      });
  }

  findMaster() {
    this.master = this.data.master.toLowerCase();
  }
  onCancel() {
    this.dialogRef.close(false);
  }

  downloadTemplate() {
    switch (this.master.toLowerCase()) {
      case 'specification':
        this.specificationTemplate();
        break;
      default:
        break;
    }
  }

  onFileChange(event: any) {
    this.excelToUpload = event.target.files[0];
  }

  onUpload() {
    if (!this.excelToUpload) {
      this._toastr.warning('Please upload Excel File');
      return;
    }
    switch (this.master.toLowerCase()) {
      case 'specification':
        this.specificationExcelUpload();
        break;
      default:
        break;
    }
  }

  // ********************************** Parameter  Section Start *******************************//

  async specificationTemplate() {
    const header = [
      'Area',
      'Part',
      'Checkpoint',
      'Parallelism (Number)',
      'Location',
      'Specification',
      'Gap (true/false)',
      'Gap Min (Number)',
      'Gap Max (Number)',
      'Gap LCL (Number)',
      'Gap UCL (Number)',
      'Gap UCLR (Number)',
      'Flushness (true/false)',
      'Flushness Min (Number)',
      'Flushness Max (Number)',
      'Flushness LCL (Number)',
      'Flushness UCL (Number)',
      'Flushness UCLR (Number)',
      'Sort Order (Number)',
    ];

    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Parameter ');

    const headerRow = worksheet.addRow(header);

    headerRow.alignment = { horizontal: 'center' };

    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 20;
    worksheet.getColumn(4).width = 25;
    worksheet.getColumn(5).width = 30;
    worksheet.getColumn(6).width = 20;
    worksheet.getColumn(7).width = 20;
    worksheet.getColumn(8).width = 20;
    worksheet.getColumn(9).width = 20;
    worksheet.getColumn(10).width = 20;
    worksheet.getColumn(11).width = 22;
    worksheet.getColumn(12).width = 22;
    worksheet.getColumn(13).width = 22;
    worksheet.getColumn(14).width = 22;
    worksheet.getColumn(15).width = 22;
    worksheet.getColumn(16).width = 22;
    worksheet.getColumn(17).width = 22;
    worksheet.getColumn(18).width = 22;
    worksheet.getColumn(19).width = 20;

    worksheet.addRow([
      'Front side',
      'Hood',
      'Hood to Fender LH',
      9,
      'LH1',
      ' 4+-2',
      true,
      2,
      6,
      3,
      4,
      5,
      false,
      '',
      '',
      '',
      '',
      '',
      1,
    ]);
    worksheet.addRow([
      'Front side',
      'Hood',
      'Hood to Fender LH',
      9,
      'LH2',
      ' 4+-2',
      false,
      '',
      '',
      '',
      '',
      '',
      true,
      2,
      9,
      4,
      6,
      7,
      2,
    ]);

    worksheet.addRow([]);
    worksheet.addRow([]);
    const msgRow = worksheet.addRow([
      'Please make sure Area and Part Names should be same as per respective masters (if added) .And Delete this line before uploading file ',
    ]);
    msgRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCFFE5' },
    };
    worksheet.mergeCells(`A${msgRow.number}:K${msgRow.number}`);
    worksheet.getRow(2).alignment = { horizontal: 'center' };
    worksheet.getRow(3).alignment = { horizontal: 'center' };
    worksheet.getRow(4).alignment = { horizontal: 'center' };

    workbook.xlsx.writeBuffer().then((data: any) => {
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      fs.saveAs(blob, 'Specification Excel template');
    });
  }

  specificationExcelUpload() {
    this.loading = true;
    this.excelService
      .specificationExcelUpload(this.excelToUpload, this.data)
      .subscribe(
        (data) => {
          if (data !== null && data !== undefined) {
            if (data.isErrorMessage) {
              this._toastr.error(data.messageDetail, data.messageTitle);
            } else if (data.isSuccessMessage) {
              this._toastr.success(data.messageDetail, data.messageTitle);
              this.dialogRef.close(true);
            } else if (data.isAlertMessage) {
              this._toastr.warning(data.messageDetail, data.messageTitle);
            }
          }
          this.loading = false;
        },
        (err) => {
          this._toastr.error('Something went wrong , please try again');
          this.loading = false;
        }
      );
  }

  // ********************************** Parameter  Section End *******************************//

}
