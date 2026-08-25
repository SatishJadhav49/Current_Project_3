import { Component, NgZone, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Model } from 'src/app/shared/models/model.model';
import { CommonService } from '../../common/common.service';
import { ToastrService } from 'ngx-toastr';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { AuditService } from '../../Audit/audit.service';
import { DeletePopupComponent } from 'src/app/shared/components/delete-popup/delete-popup.component';
import { DigitalGapgunService } from '../digital-gapgun.service';
declare var $: any;

@Component({
  selector: 'app-digital-gapgun',
  templateUrl: './digital-gapgun.component.html',
  styleUrls: ['./digital-gapgun.component.css']
})
export class DigitalGapgunComponent {
  selectedModel: Model;
  modellist: Model[];

  shopid: number;
  plantid: number;
  audittypeid: number;
  allshops: boolean = false;

  AuditName: string;
  userid: number;
  hostname: string;
  plantname: string;
  excelToUpload: File[] = [];

  loading: boolean = false;
  auditId: number;
  tabledata: any[];
  selectedForDelete: number;
  firstVisit = true;

  isLoading: boolean = false;
  vinLoading: boolean = false;

  vinInput: string = '';
  vinData: any[] = [];



  @ViewChild('select') select: MatSelect;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private toaster: ToastrService,
    private dialog: MatDialog,
    private digitalService: DigitalGapgunService,
    private auditService: AuditService,
    private ngZone: NgZone,
  ) { }

  ngOnInit() {
    $('#ngslide').hide();
    $('.sidebar-mini').addClass('sidebar-collapse');
    this.plantid = parseInt(localStorage.getItem('plantid'));
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.userid = parseInt(localStorage.getItem('userid'));
    this.hostname = localStorage.getItem('hostname');
    this.allshops = localStorage.getItem('isallshops') === '1'; // 1= true,0=false
    this.shopid = 24;
    this.allshops = false;
    this.getModelList();
    this.commonService.getAuditTypeList().subscribe((data) => {
      this.AuditName = data.find(
        (a) => a.Audit_Type_Id == this.audittypeid
      ).Audit_Type;
    });

    this.commonService.getPlantname(this.plantid).subscribe((data) => {
      this.plantname = data.toLowerCase();
    });
  }

  // ************************************ model Section Start *****************************//
  onSelectModel(event: MatSelectChange) {
    this.selectedModel = event.value as Model;
  }

  getModelList() {
    if (this.shopid) {
      this.commonService
        .getModelTableData(
          this.plantid,
          this.audittypeid,
          this.shopid,
          this.allshops
        )
        .subscribe((res) => {
          console.log('Model list:', res);
          this.modellist = res;
        });
    } else {
      this.router.navigate(['/']);
    }
  }

  // ************************************ Start Search Vin no ********************************//

  searchVin() {
    if (!this.vinInput) {
      this.toaster.warning("Please enter VIN No");
      return;
    }

    this.vinLoading = true;

    this.digitalService.getByVin(this.vinInput)
      .subscribe(
        (res: any) => {
          this.vinLoading = false;

          if (res?.isErrorMessage) {
            this.toaster.error(res.messageDetail);
            return;
          }

          this.vinData = res.dataList || [];

          if (this.vinData.length > 0) {

            // SET AUDIT ID
            this.auditId = this.vinData[0].Audit_ID;

            // SET MODEL
            const modelId = this.vinData[0].Model_ID;

            this.selectedModel = this.modellist.find(
              x => x.Model_ID === modelId
            );

            console.log("AuditId:", this.auditId);
            console.log("Model:", this.selectedModel);
          }

          if ($.fn.DataTable.isDataTable('#shopmodeltable')) {
            $('#shopmodeltable').DataTable().clear().destroy();
          }

          this.LoadTable(this.vinData);
        },
        () => {
          this.vinLoading = false;
          this.toaster.error("Error fetching data");
        }
      );
  }
  // ************************************ End Search Vin no ********************************//

  // ************************************ model Section End ****************************//

  onFileChange(event: any) {
    const files = event?.target?.files as FileList;
    this.excelToUpload = files ? Array.from(files) : [];
  }

  uploadExcel() {

    if (!this.selectedModel) {
      this.toaster.warning('Please select Model');
      return;
    }

    if (!this.excelToUpload || this.excelToUpload.length === 0) {
      this.toaster.warning('Please choose Excel file');
      return;
    }

    this.isLoading = true;

    const file = this.excelToUpload[0];

    this.digitalService
      .gapgunExcelUpload(file, {
        modelid: this.selectedModel.Model_ID,
        shopid: this.shopid
      })
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          if (res?.isErrorMessage) {
            this.toaster.error(res.messageDetail);
            return;
          }
          if (res?.isSuccessMessage) {
            this.toaster.success(res.messageDetail);
            this.auditId = res.auditId;
            this.getTableData();
            this.selectedModel = null;
            this.excelToUpload = [];
            const fileInput = document.getElementById('fileInput') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          }
        },
        () => {
          this.isLoading = false;
          this.toaster.error('Upload failed');
        }
      );
  }

  DeleteRecord() {
    if (this.selectedForDelete) {

      this.auditService.deleteRecord(this.selectedForDelete).subscribe(
        (data) => {

          if (data.isSuccessMessage) {

            this.toaster.success(data.messageDetail);

            this.selectedForDelete = null;

            if ($.fn.DataTable.isDataTable('#shopmodeltable')) {
              $('#shopmodeltable').DataTable().clear().destroy();
            }

            if (this.auditId) {
              this.getTableData();
            } else if (this.vinInput) {
              this.searchVin();
            }
          }
          else {
            this.toaster.error(data.messageDetail);
          }

        },
        () => {
          this.toaster.error('Delete failed');
        }
      );
    }
  }




  // ******************************Table  Section End ******************************//
  getTableData() {

    this.loading = true;

    if (this.plantid && this.auditId) {

      this.auditService
        .getTableData(this.plantid, this.auditId, this.audittypeid)
        .subscribe(
          (data) => {
            this.tabledata = data;
            if ($.fn.DataTable.isDataTable('#shopmodeltable')) {
              $('#shopmodeltable').DataTable().clear().destroy();
            }
            setTimeout(() => {
              this.LoadTable(this.tabledata);
            }, 0);

            this.loading = false;
          },
          (err) => {
            this.loading = false;
            this.toaster.error(err.message);
          }
        );
    }
  }


  LoadTable(jsondatas) {
    if ($.fn.DataTable.isDataTable('#shopmodeltable')) {
      $('#shopmodeltable').DataTable().clear();
      $('#shopmodeltable').DataTable().destroy();
    }

    <any>$('#shopmodeltable').DataTable({
      destroy: true,

      lengthMenu: [
        [-1, 50, 25, 10, 5],
        ['All', 50, 25, 10, 5],
      ],
      data: jsondatas,
      columnDefs: [
        { title: 'Parameter', targets: 0 },
        { title: 'Area', targets: 1 },
        { title: 'Part Name', targets: 2 },
        { title: 'Checkpoint', targets: 3 },
        { title: 'Location', targets: 4 },
        { title: 'Specification', targets: 5 },
        { title: 'Reading', targets: 6 },
        { title: 'Action', targets: 7 },
      ],

      columns: [
        { data: 'Type' },
        { data: 'Area_Name' },
        {
          data: 'Part_Name',
        },
        { data: 'Checkpoint_Name' },
        { data: 'Location_Name' },
        { data: 'Specification_Name' },
        {
          data: 'Reading',
          render: function (data, type, row) {
            var isOutOfRange = data < row.MinVal || data > row.MaxVal;
            var color = isOutOfRange ? 'red' : 'black';

            return `<span style="color: ${color};">${data}</span>`;
          },
        },
        {
          data: null,
          render: function (data, type, row) {
            if (row.Is_NA) {
              return `<div class="text-center" style="text-align:center;"> <span id="deleteaudit" class="btn fa fa-trash-o deletebutton" style="border-radius: 50%!important;
        background-color: #0b9494;
        color: black!important;"   title = "Delete"
               data-element-id="${data.Track_Sheet_ID}"></span> </div>`;
            }

            return `  <div class="text-center" style="text-align:center;">

      <span id="deleteaudit" class="btn fa fa-trash-o deletebutton" style="border-radius: 50%!important;
      background-color: #0b9494;
      color: black!important;"  title = "Delete"
             data-element-id="${data.Track_Sheet_ID}"></span> </div> `;
          },
          createdCell: (cell, cellData, rowData, rowIndex, colIndex) => {


            $(cell).on('click', '#deleteaudit', () => {
              this.ngZone.run(() => {
                const dialogRef = this.dialog.open(DeletePopupComponent, {
                  width: '250px',
                  enterAnimationDuration: '0ms',
                  exitAnimationDuration: '0ms',
                });
                dialogRef.afterClosed().subscribe((result) => {
                  console.log('The dialog was closed' + result);
                  if (result) {
                    this.selectedForDelete = rowData.Track_Sheet_ID;
                    this.DeleteRecord();
                  }
                });
              });
            });
          },
        },
      ],
      ordering: false, // Disable sorting
    });
  }
  // ******************************Table  Section End ******************************//
  // ****************************** Auto mail *************************************//

  // sendAutoMail() {
  //   if (!this.auditId || !this.selectedModel) {
  //     this.toaster.warning("Missing audit or model");
  //     return;
  //   }

  //   this.digitalService.sendMail(
  //     '2026-09-05',
  //     this.selectedModel.Model_ID
  //   ).subscribe(
  //     (res: any) => {
  //       if (res.isSuccessMessage) {
  //         this.toaster.success(res.messageDetail);
  //       } else {
  //         this.toaster.error(res.messageDetail);
  //       }
  //     },
  //     () => this.toaster.error("Mail failed")
  //   );
  // }

}
