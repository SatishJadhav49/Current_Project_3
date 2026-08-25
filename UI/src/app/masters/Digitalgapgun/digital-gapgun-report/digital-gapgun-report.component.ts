import { Component, ViewChild } from '@angular/core';
declare var $: any;
import * as _moment from 'moment';
import { Model } from 'src/app/shared/models/model.model';
import { Router } from '@angular/router';
import { CommonService } from '../../common/common.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { ReportsService } from '../../Reports/reports.service';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { DigitalGapgunService } from '../digital-gapgun.service';


export interface No {
  no: string;
}

@Component({
  selector: 'app-digital-gapgun-report',
  templateUrl: './digital-gapgun-report.component.html',
  styleUrls: ['./digital-gapgun-report.component.css']
})
export class DigitalGapgunReportComponent {

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
  allshops: boolean = false;

  auditId: number;
  mailPreview: any;
  mailHtml: string;
  auditdate: string;


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
    private datePipe: DatePipe,
    private digitalService: DigitalGapgunService,
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
      this.auditdate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    }
  }
  // ************************************ Date Section End *******************************//

  // ************************************ Report generate Section Start ***************************//
  viewReport() {

    this.viewReportTCF();
  }

  viewReportTCF() {

    if (!this.selectedModel) {
      this.toaster.warning('Please select model');
      return;
    }
    console.log('auditdate=', this.auditdate);

    if (!this.auditdate) {
      this.toaster.warning('Please select audit date');
      return;
    }

    this.loading = true;

    this.digitalService
      .getMailPreview(
        this.auditdate,
        this.selectedModel.Model_ID
      )
      .subscribe(
        (res: any) => {

          this.loading = false;

          if (res.isSuccessMessage || res.IsSuccessMessage) {

            this.auditId = res.audit_ID || res.Audit_ID;

            this.mailHtml =
              res.htmlBody || res.HtmlBody;

            this.mailPreview =
              this.sanitizer.bypassSecurityTrustHtml(
                this.mailHtml
              );

            this.Show_Report = true;

          } else {

            this.toaster.error(
              res.messageDetail || res.MessageDetail
            );
          }

        },
        () => {

          this.loading = false;
          this.toaster.error(
            'Failed to load report'
          );
        }
      );
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

  // ****************************** Auto mail *************************************//

  sendAutoMail() {
    if (!this.auditId || !this.selectedModel) {
      this.toaster.warning("Missing audit or model");
      return;
    }

    this.digitalService.sendMail(
      this.auditdate,
      this.selectedModel.Model_ID
    ).subscribe(
      (res: any) => {
        if (res.isSuccessMessage) {
          this.toaster.success(res.messageDetail);
        } else {
          this.toaster.error(res.messageDetail);
        }
      },
      () => this.toaster.error("Mail failed")
    );
  }

}
