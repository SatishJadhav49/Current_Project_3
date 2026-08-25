import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Model } from 'src/app/shared/models/model.model';
import { Area } from 'src/app/shared/models/area.model';
import { CommonService } from '../../common/common.service';
import { ReportsService } from '../reports.service';
import { MatInput } from '@angular/material/input';
import { Shift } from 'src/app/shared/models/shift.model';
import { Part } from 'src/app/shared/models/part.model';
import { Location } from 'src/app/shared/models/location.model';

import * as _moment from 'moment';
import { FormControl } from '@angular/forms';

declare var $: any;
import { CheckPoint } from 'src/app/shared/models/checkpoint.model';
import { Parameter } from 'src/app/shared/models/parameter.model';
import { AuditType } from 'src/app/shared/models/audittype.model';
import { AuditService } from '../../Audit/audit.service';
import { PopupImageComponent } from 'src/app/shared/components/popup-image/popup-image.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-statisticalreports',
  templateUrl: './statisticalreports.component.html',
  styleUrls: ['./statisticalreports.component.css'],
})
export class StatisticalreportsComponent {
  audittypeid: number;
  AuditName: string;
  plantid: number;
  shopid: number;
  hostname: string;
  loading: boolean = false;
  modellist: Model[];
  selectedModel: Model;
  Show_Report: boolean = false;
  // Date
  startdate: any;
  enddate: any;
  actualStartDate: Date;
  selectedShift: number;
  shiftList: Shift[];
  AuditDateList: any[];
  @ViewChild('startdatepicker1', {
    read: MatInput,
  })
  startdatepicker1: MatInput;
  @ViewChild('enddatepicker1', {
    read: MatInput,
  })
  enddatepicker1: MatInput;
  currentDate: Date = new Date();
  // AuditType
  selectedAuditType: AuditType;
  AuditTypelist: any[];

  // Area
  AreaList: Area[];
  selectedArea: Area;
  AreaFilter: FormControl = new FormControl();
  // Part
  PartList: Part[];
  selectedPart: Part;
  PartFilter: FormControl = new FormControl();

  // CheckPoint
  CheckPointList: CheckPoint[];
  selectedCheckPoint: CheckPoint;
  CheckPointFilter: FormControl = new FormControl();

  // Location
  locationList: Location[];
  selectedLocation: Location;
  selectedLocationTCF: Location;
  locationFilter: FormControl = new FormControl();

  // Parameter
  ParameterList: Parameter[];
  selectedParameter: Parameter;

  Readings: number[] = [];
  LSL: number;
  USL: number;
  allshops: boolean = false;

  // Statistical Data
  statisticalData: any = {
    sampleSize: 0,
    min: 0,
    max: 0,
    mean: 0,
    median: 0,
    stdDev: 0,
    lsl: 0,
    usl: 0,
    cp: 0,
    cpk: 0,
  };

  // Reports List
  reportsList: any[] = [];
  selectedReport: number;

  // Image
  imagePath: string;
  imageid: number;
  constructor(
    private router: Router,
    private commonService: CommonService,
    private toaster: ToastrService,
    private reportService: ReportsService,
    private datePipe: DatePipe,
    private auditService: AuditService,
    public dialog: MatDialog
  ) { }
  ngOnInit() {
    $('#ngslide').hide();
    $('.sidebar-mini').addClass('sidebar-collapse');
    this.plantid = parseInt(localStorage.getItem('plantid'));
    this.shopid = parseInt(localStorage.getItem('shopid'));
    this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    this.allshops = localStorage.getItem('isallshops') === '1';
    this.hostname = localStorage.getItem('hostname');
    if (!this.plantid || !this.shopid) {
      this.router.navigate(['']);
    }
    this.getaudittypelist();
    this.getModelList();
    this.commonService.getParameter().subscribe((data) => {
      this.ParameterList = data;
    });

    this.reportService.getReportsList().subscribe((res) => {
      this.reportsList = res;
    });
  }

  // ********************************** AuditType Section Start *******************************//
  getaudittypelist() {
    this.selectedAuditType = null;
    this.AuditTypelist = [];
    this.commonService.getAuditTypeList().subscribe((res) => {
      this.AuditTypelist = res;
      this.AuditName = this.AuditTypelist.find(
        (a) => a.Audit_Type_Id === this.audittypeid
      ).Audit_Type;
    });
  }
  // ********************************** AuditType Section End *******************************//

  // ************************************ model Section Start *****************************//
  onSelectModel(model) {
    if (model) {
      this.selectedModel = model.value;
      this.getAreaList();
    }
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
      this.actualStartDate = event.value;
      this.startdate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
      if (this.enddate) {
        // this.enddatepicker1.value = '';
        if (
          this.startdate &&
          this.enddate &&
          this.selectedCheckPoint &&
          this.selectedReport &&
          this.selectedLocation &&
          this.selectedParameter
        ) {
          this.viewReport();
        }
      }
    }
  }

  onEndDateChange(event: any) {
    if (event.value) {
      this.enddate = this.datePipe.transform(event.value, 'yyyy-MM-dd');

      if (
        this.startdate &&
        this.enddate &&
        this.selectedCheckPoint &&
        this.selectedReport &&
        this.selectedLocation &&
        this.selectedParameter
      ) {
        this.viewReport();
      }
    }
  }

  // ************************************ Date Section End *******************************//

  // ************************************ Area Section Start ***************************//
  getAreaList() {
    this.AreaList = [];
    this.commonService
      .getAreaList(this.selectedModel.Model_ID, this.audittypeid)
      .subscribe((data) => {
        this.AreaList = data;
      });
  }

  selectArea(Area: any) {
    if (Area) {
      this.selectedArea = Area.value;
      this.getPartList();
    }
  }
  // ********************************** Area Section End *******************************//

  // ************************************ Part Section Start ***************************//
  getPartList() {
    this.PartList = [];
    this.commonService
      .getPartList(this.selectedArea.Area_ID, this.audittypeid)
      .subscribe((data) => {
        this.PartList = data;
      });
  }

  selectPart(Part: any) {
    if (Part) {
      this.selectedPart = Part.value;
      this.getCPList();
      this.getImage();
    }
  }

  getImage() {
    this.auditService
      .getPartWiseImage(this.selectedPart.Part_ID, this.audittypeid)
      .subscribe((data) => {
        if (data.length > 0) {
          this.imagePath = data[0].FileContent;
          this.imageid = data[0].Image_ID;
        }
      });
  }

  openDialog() {
    const dialogRef = this.dialog.open(PopupImageComponent, {
      data: this.imagePath,
    });
  }
  // ********************************** Part Section End *******************************//

  // ************************************ CP Section Start ***************************//
  getCPList() {
    this.CheckPointList = [];
    this.commonService
      .getCPList(this.selectedPart.Part_ID, this.audittypeid)
      .subscribe((data) => {
        this.CheckPointList = data;
      });
  }

  selectCP(CP: any) {
    if (CP) {
      this.selectedCheckPoint = CP.value;
      this.getLocationList();
    }
  }
  // ********************************** CP Section End *******************************//

  // ************************************ Location Section Start ***************************//
  getLocationList() {
    this.locationList = [];
    this.commonService
      .getLocationList(this.selectedCheckPoint.Checkpoint_ID, this.audittypeid)
      .subscribe((data) => {
        console.log(data);
        this.locationList = data;
      });
  }

  onSelectLocation(Location: any) {
    if (Location) {
      this.selectedLocation = Location.value;
      // if (this.selectedLocation.Is_Gap && this.selectedLocation.Is_Flushness) {
      //   this.selectedParameter = null;
      //   return;
      // }
      if (this.selectedLocation.Is_Gap && !this.selectedLocation.Is_Flushness) {
        this.selectedParameter = this.ParameterList.find(
          (p) => p.Type.toLowerCase() === 'gap'
        );
      }
      if (!this.selectedLocation.Is_Gap && this.selectedLocation.Is_Flushness) {
        this.selectedParameter = this.ParameterList.find(
          (p) => p.Type.toLowerCase() === 'flushness'
        );
      }
      if (this.selectedParameter) {
        this.viewReport();
      }
    }
  }
  // ********************************** Location Section End *******************************//
  // ********************************** Report Section Start *******************************//
  onSelectParameter(e) {
    if (this.selectedReport) {
      this.viewReport();
    }
  }

  viewReport() {
    if (!this.selectedModel) {
      this.toaster.warning('Please select Model');
      return;
    }
    if (!this.selectedArea) {
      this.toaster.warning('Please select Area');
      return;
    }
    if (!this.selectedPart) {
      this.toaster.warning('Please select part');
      return;
    }
    if (!this.selectedCheckPoint) {
      this.toaster.warning('Please select check point');
      return;
    }
    if (!this.selectedLocation) {
      this.toaster.warning('Please select Location');
      return;
    }
    if (!this.selectedParameter) {
      this.toaster.warning('Please select parameter');
      return;
    }
    if (!this.startdate) {
      this.toaster.warning('Please select start date');
      return;
    }
    if (!this.enddate) {
      this.toaster.warning('Please select end date');
      return;
    }
    if (!this.selectedReport) {
      this.toaster.warning('Please select report');
      return;
    }

    this.Show_Report = true;
  }

  onSelectReport(event) {
    if (event) {
      this.viewReport();
    }
  }
  // ********************************** Report Section End *******************************//

  receiveData($event) {
    this.Readings = $event.Readings;
    this.LSL = $event.LSL;
    this.USL = $event.USL;
    this.calculateStatistics();
  }

  calculateStatistics() {
    if (!this.Readings || this.Readings.length === 0) {
      this.Readings = [];
      this.statisticalData = {
        sampleSize: 0,
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        stdDev: 0,
        lsl: 0,
        usl: 0,
        cp: 0,
        cpk: 0,
      };
      return;
    }

    this.Readings = this.Readings.map((val) =>
      typeof val === 'string' ? parseFloat(val) : val
    );

    const n = this.Readings.length;
    const sorted = [...this.Readings].sort((a, b) => a - b);

    // Min and Max
    const min = Math.min(...this.Readings);
    const max = Math.max(...this.Readings);

    // Mean
    const mean = this.Readings.reduce((sum, val) => sum + val, 0) / n;

    // Median
    let median: number;
    if (n % 2 === 0) {
      median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    } else {
      median = sorted[Math.floor(n / 2)];
    }

    // Standard Deviation
    const variance =
      this.Readings.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    // Filter readings within LSL and USL for Cp/Cpk calculations
    const inRangeReadings = this.Readings.filter(
      (val) => val >= this.LSL && val <= this.USL
    );

    // Calculate mean and std dev for in-range readings only
    let cpStdDev = stdDev;
    let cpMean = mean;
    if (inRangeReadings.length > 0) {
      cpMean = inRangeReadings.reduce((sum, val) => sum + val, 0) / inRangeReadings.length;
      const cpVariance =
        inRangeReadings.reduce((sum, val) => sum + Math.pow(val - cpMean, 2), 0) /
        inRangeReadings.length;
      cpStdDev = Math.sqrt(cpVariance);
    }

    // Cp (Process Capability) - using in-range readings
    // Cp = (USL - LSL) / (6 * σ)
    const cp = (this.USL - this.LSL) / (6 * cpStdDev);

    // Cpk (Process Capability Index) - using in-range readings
    // Cpk = min((USL - μ) / (3 * σ), (μ - LSL) / (3 * σ))
    const cpupper = (this.USL - cpMean) / (3 * cpStdDev);
    const cplower = (cpMean - this.LSL) / (3 * cpStdDev);
    const cpk = Math.min(cpupper, cplower);

    this.statisticalData = {
      sampleSize: n,
      min: min,
      max: max,
      mean: mean,
      median: median,
      stdDev: stdDev,
      lsl: this.LSL,
      usl: this.USL,
      cp: cp,
      cpk: cpk,
    };
  }

  copyReadings() {
    const readingsText = this.Readings.join(', ');
    navigator.clipboard.writeText(readingsText).then(
      () => {
        this.toaster.success('Readings copied to clipboard!');
      },
      (err) => {
        console.error('Failed to copy readings: ', err);
        this.toaster.error('Failed to copy readings');
      }
    );
  }
}
