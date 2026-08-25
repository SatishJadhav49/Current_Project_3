import { DatePipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Model } from 'src/app/shared/models/model.model';
import { CommonService } from '../../common/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Shift } from 'src/app/shared/models/shift.model';
import { MatDatepicker } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
import { ReportsService } from '../reports.service';
import { MatInput } from '@angular/material/input';
@Component({
  selector: 'app-monthly-report',
  templateUrl: './monthly-report.component.html',
  styleUrls: ['./monthly-report.component.css'],
})
export class MonthlyReportComponent {
  audittypeid: number;
  AuditName: string;
  plantid: number;
  hostname: string;
  loading: boolean = false;
  modellist: Model[];
  selectedModel: Model;
  Show_Report: boolean = false;
  reportUrl: any;
  audit: string;
  shopid: number;
  allshops: boolean;

  // date
  
  startdate: any;
  enddate: any;
  actualStartDate: Date;
  
  @ViewChild('startdatepicker1', {
    read: MatInput,
  })
  startdatepicker1: MatInput;
  @ViewChild('enddatepicker1', {
    read: MatInput,
  })
  enddatepicker1: MatInput;
  constructor(
    private commonService: CommonService,
    private reportService: ReportsService,
    private sanitizer: DomSanitizer,
    private toster: ToastrService,
    private datePipe:DatePipe
  ) { }
  ngOnInit() {
    $('#ngslide').hide();
    $('.sidebar-mini').addClass('sidebar-collapse');
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.allshops = localStorage.getItem('isallshops') === '1';
    this.plantid = parseInt(localStorage.getItem('plantid'));
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.hostname = localStorage.getItem('hostname');
    this.commonService.getAuditTypeList().subscribe((data) => {
      this.AuditName = data.find(
        (a) => a.Audit_Type_Id == this.audittypeid
      ).Audit_Type;
    });
    this.getModelList();
  }

  // ************************************ model Section Start *****************************//
  onSelectModel(model) {
    if (model) {
      this.selectedModel = model.value;
      if (this.startdate && this.enddate) {
        this.getReport();
      }
    }
  }

  getModelList() {
    if (this.shopid) {
      this.selectedModel = null;
      this.commonService
      .getModelTableData(this.plantid, this.audittypeid,this.shopid,this.allshops)
      .subscribe((res) => {
        this.modellist = res;
      });
    }
  }

  // ************************************ model Section End ****************************//
  // ************************************ Date  Section Start ****************************//

  onStartDateChange(event: any) {
    if (event.value) {
      this.actualStartDate = event.value;
      this.startdate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
      if (this.enddate) {
        // this.enddatepicker1.value = '';
        if (this.startdate && this.enddate && this.selectedModel) {
          this.getReport();
        }
      }
    }
  }

  onEndDateChange(event: any) {
    if (event.value) {
      this.enddate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
      if (this.startdate && this.enddate && this.selectedModel) {
        this.getReport();
      }
    }
  }

  // ************************************ Date Section End *******************************//

  // ************************************ Report Section Start **************************************//

  // http://mmnsk1drsv/reports/report/PQ%20Dashboard/1D_BIW_TCF/1D_Monthly_Report
  getReport() {
    if (!this.selectedModel) {
      this.toster.warning('Please select Model');
      return;
    }
    switch (localStorage.getItem("Plant_Code").toUpperCase()) {
      case 'A003':
        this.Show_Report = true;
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.reportService.getStartreportlink() +
          '%2f1D_BIW_TCF%2f1D_Monthly_Report' +
          '&Audit_Type_Id=' +
          this.audittypeid +
          '&Model_ID=' +
          this.selectedModel.Model_ID +
          '&Start_Date=' +
          this.startdate +
          '&End_Date=' +
          this.enddate
        );
        console.log(this.reportUrl);
        break;
      case 'CK01':
        this.Show_Report = true;
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.reportService.getChakanReportUrl() +
          '%2f1D_BIW_TCF%2f1D_Monthly_Report' +
          '&Audit_Type_Id=' +
          this.audittypeid +
          '&Model_ID=' +
          this.selectedModel.Model_ID +
          '&Start_Date=' +
          this.startdate +
          '&End_Date=' +
          this.enddate
        );
        console.log(this.reportUrl);
        break;
      case 'A002':
        this.Show_Report = true;
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.reportService.getKNDReportUrl() +
          '%2f1D_BIW_TCF%2f1D_Monthly_Report&rs:Command=Render&rs:embed=true' +
          '&Audit_Type_Id=' +
          this.audittypeid +
          '&Model_ID=' +
          this.selectedModel.Model_ID +
          '&Start_Date=' +
          this.startdate +
          '&End_Date=' +
          this.enddate
        );
        console.log(this.reportUrl);
        break;
        case 'A010':
        this.Show_Report = true;
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          this.reportService.getHaridwarReportUrl() +
          '%2f1D_BIW_TCF%2f1D_Monthly_Report' +
          '&Audit_Type_Id=' +
          this.audittypeid +
          '&Model_ID=' +
          this.selectedModel.Model_ID +
          '&Start_Date=' +
          this.startdate +
          '&End_Date=' +
          this.enddate
        );
        console.log(this.reportUrl);
        break;
      default:
        alert('Plant name error !!! plant name not found');
        break;
    }
  }
  // ************************************ Report Section End **************************************//
}
