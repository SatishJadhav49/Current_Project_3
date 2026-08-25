import { Component, ViewChild } from '@angular/core';
declare var $: any;
import * as _moment from 'moment';
import { Model } from 'src/app/shared/models/model.model';
import { Router } from '@angular/router';
import { CommonService } from '../../common/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { ReportsService } from '../reports.service';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';

export interface No {
  no: string;
}
@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent {
  audittypeid: number;
  AuditName: string;
  plantid: number;
  plantname: string;
  shopid: number;
  userid: number;
  username: string;
  hostname: string;
  loading: boolean = false;
  modellist: Model[];
  selectedModel: Model;
  selectedBIW: any;
  biwlist: any[];
  Show_Report: boolean = false;
  reportUrl: any;
  byNumber: boolean = false;
  biwnumber: any;
  BIWNos = new FormControl([]);
  audit: string;
  // Date
  selectedDates: any;
  startdate: any;
  enddate: any;
  allshops: boolean = false;;

  @ViewChild('select') select: MatSelect;
  allSelected = false;
  addOnBlur = true;
  selected: any;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  NOs: No[] = [];
  concNos: string;
  constructor(
    private router: Router,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private toaster: ToastrService,
    private reportService: ReportsService,
    private datePipe: DatePipe
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
    this.getModelList();
    this.commonService.getAuditTypeList().subscribe((data) => {
      this.AuditName = data.find(
        (a) => a.Audit_Type_Id == this.audittypeid
      ).Audit_Type;
    });

    this.commonService.getPlantname(this.plantid).subscribe((data) => {
      this.plantname = data.toLowerCase();
    });
    if (this.audittypeid == 1) {
      this.audit = 'VIN';
    } else {
      this.audit = 'BIW';
    }
  }

  // ************************************ model Section Start *****************************//
  onSelectModel(model) {
    if (model) {
      this.selectedModel = model.value;
    }
  }

  getModelList() {
    if (this.shopid) {
      this.commonService
        .getModelTableData(this.plantid, this.audittypeid, this.shopid, this.allshops)
        .subscribe((res) => {
          this.modellist = res;
        });
    } else {
      this.router.navigate(['/']);
    }
  }

  // ************************************ model Section End ****************************//
  // ************************************ Date  Section Start ****************************//

  onStartDateChange(event: any) {
    if (event.value) {
      this.startdate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
      if (this.enddate) {
        this.getBIWNo();
      }
    }
  }
  onEndDateChange(event: any) {
    if (event.value) {
      this.select.options.forEach((item: MatOption) => item.deselect());
      this.allSelected = false;
      this.enddate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
      this.getBIWNo();
    }
  }

  // ************************************ Date Section End *******************************//
  // ************************************ BIW Section Start *****************************//
  getBIWNo() {
    if (this.selectedModel && this.enddate) {
      this.biwlist = [];
      this.reportService
        .getBiwList(
          this.selectedModel.Model_ID,
          this.startdate,
          this.enddate,
          this.audittypeid
        )
        .subscribe((data) => {
          this.biwlist = data;
        });
    }
  }

  toggleAllSelection() {
    if (this.allSelected) {
      this.select.options.forEach((item: MatOption) => item.select());
    } else {
      this.select.options.forEach((item: MatOption) => item.deselect());
    }
  }
  optionClick(event) {
    this.selected = event;
  }

  // ************************************ BIW Section End **************************************//
  // ************************************ Report generate Section Start ***************************//
  viewReport() {

    this.viewReportTCF();
  }

  viewReportTCF() {
    // this.concNos = this.select.value.join(',');
    console.log(this.concNos);
    if (this.select) {
      switch (localStorage.getItem("Plant_Code").toUpperCase()) {
        case 'A003':
          this.Show_Report = true;
          this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.reportService.getStartreportlink() +
            '%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK' +
            '&VIN_Number=' +
            this.selected +
            '&Plant_ID=' +
            this.plantid +
            '&Audit_Type_Id=' +
            this.audittypeid
          );
          console.log(this.reportUrl);
          break;
        case 'CK01':
          this.Show_Report = true;
          this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.reportService.getChakanReportUrl() +
            '%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK' +
            '&VIN_Number=' +
            this.selected +
            '&Plant_ID=' +
            this.plantid +
            '&Audit_Type_Id=' +
            this.audittypeid
          );
          console.log(this.reportUrl);
          break;
        case 'A002':
          this.Show_Report = true;
          this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.reportService.getKNDReportUrl() +
            '%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK&rs:Command=Render&rs:embed=true' +
            '&VIN_Number=' +
            this.selected +
            '&Plant_ID=' +
            this.plantid +
            '&Audit_Type_Id=' +
            this.audittypeid
          );
          console.log(this.reportUrl);
          break;
        case 'A010':
          this.Show_Report = true;
          this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            this.reportService.getHaridwarReportUrl() +
            '%2f1D_BIW_TCF%2f1D_TCF_MIS_REPORT_NSK' +
            '&VIN_Number=' +
            this.selected +
            '&Plant_ID=' +
            this.plantid +
            '&Audit_Type_Id=' +
            this.audittypeid
          );
          console.log(this.reportUrl);
          break;
        default:
          alert('Plant name error !!! plant name not found');
          break;
      }
    } else {
      this.toaster.warning('BIW number is required');
    }
  }

  // ************************************ Report generate Section End **********************//
  // ************************************ Second Tab Section Start **********************//

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.NOs.push({ no: value });
    }
    event.chipInput!.clear();
  }

  remove(No: No): void {
    const index = this.NOs.indexOf(No);

    if (index >= 0) {
      this.NOs.splice(index, 1);
    }
  }

  edit(No: No, event: MatChipEditedEvent) {
    const value = event.value.trim();
    if (!value) {
      this.remove(No);
      return;
    }
    const index = this.NOs.indexOf(No);
    if (index >= 0) {
      this.NOs[index].no = value;
    }
  }
  // ************************************ Second Tab Section End **********************//
}
