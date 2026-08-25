import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../common/common.service';
import { ReportsService } from '../reports.service';

import * as _moment from 'moment';
declare var $: any;

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexYAxis,
  ApexMarkers,
} from 'ng-apexcharts';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  markers: ApexMarkers;
  colors: string[];
};

@Component({
  selector: 'app-trendchart',
  templateUrl: './trendchart.component.html',
  styleUrls: ['./trendchart.component.css'],
})
export class TrendchartComponent {
  @Input() startdate: string;
  @Input() enddate: string;
  @Input() audittypeid: any;
  @Input() locationId: any;
  @Input() parameterId: any;

  @Input() Model_ID: any;
  @Input() Area_ID: any;
  @Input() Part_ID: any;
  @Input() Checkpoint_ID: any;
  @Input() Part_Name: any;

  @Output() messageEvent = new EventEmitter<any>();
  // Sample readings data
  private readings: number[] = [];

  // Control limits - you can set these to your actual LSL and USL values
  private LSL: number = 0; // Lower Control Limit
  private USL: number = 0; // Upper Control Limit

  sendData() {
    this.messageEvent.emit({
      Readings: this.readings,
      LSL: this.LSL,
      USL: this.USL,
    });
  }
  // audittypeid: number;
  // AuditName: string;
  // plantid: number;
  // plantname: string;
  // shopid: number;
  // userid: number;
  // username: string;
  // hostname: string;
  // loading: boolean = false;
  // modellist: Model[];
  // selectedModel: Model;
  Show_Report: boolean = false;
  // reportUrl: any;
  // // Date
  // startdate: any;
  // enddate: any;
  // actualStartDate: Date;
  // selectedShift: number;
  // shiftList: Shift[];
  // AuditDateList: any[];
  // @ViewChild('startdatepicker1', {
  //   read: MatInput,
  // })
  // startdatepicker1: MatInput;
  // @ViewChild('enddatepicker1', {
  //   read: MatInput,
  // })
  // enddatepicker1: MatInput;
  // currentDate: Date = new Date();
  // selectedMonth: number = this.currentDate.getMonth() + 1; // Months are zero-based
  // selectedYear: number = this.currentDate.getFullYear();

  // // AuditType
  // selectedAuditType: AuditType;
  // AuditTypelist: any[];

  // // Area
  // AreaList: Area[];
  // selectedArea: Area;
  // AreaFilter: FormControl = new FormControl();
  // // Part
  // PartList: Part[];
  // selectedPart: Part;
  // PartFilter: FormControl = new FormControl();

  // // CheckPoint
  // CheckPointList: CheckPoint[];
  // selectedCheckPoint: CheckPoint;
  // CheckPointFilter: FormControl = new FormControl();

  // // Location
  // locationList: Location[];
  // selectedLocation: Location;
  // locationFilter: FormControl = new FormControl();

  // // Parameter
  // ParameterList: Parameter[];
  // selectedParameter: Parameter;

  // Trends
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  data: any[] = [];
  allshops: boolean = false;
  constructor(
    private router: Router,
    private commonService: CommonService,
    private toaster: ToastrService,
    private reportService: ReportsService,
    private datePipe: DatePipe
  ) {}
  ngOnInit() {
    this.viewTrendReport();
    // $('#ngslide').hide();
    // $('.sidebar-mini').addClass('sidebar-collapse');
    // this.plantid = parseInt(localStorage.getItem('plantid'));
    // this.shopid = parseInt(localStorage.getItem('shopid'));
    // this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    // this.userid = parseInt(localStorage.getItem('userid'));
    // this.allshops = localStorage.getItem('isallshops') === '1';
    // this.hostname = localStorage.getItem('hostname');
    // if (!this.plantid || !this.shopid || !this.userid) {
    //   this.router.navigate(['']);
    // }
    // this.getaudittypelist();
    // this.getModelList();
    // this.commonService.getParameter().subscribe((data) => {
    //   this.ParameterList = data;
    // });

    // this.commonService.getPlantname(this.plantid).subscribe((data) => {
    //   this.plantname = data.toLowerCase();
    // });
  }

  ngOnChanges(changes: SimpleChanges) {
    const watched = [
      'startdate',
      'enddate',
      'locationId',
      'parameterId',
      'Checkpoint_ID',
      'Part_ID',
      'Area_ID',
      'Model_ID',
    ];
    const anyChanged = watched.some((k) => !!changes[k]);

    if (anyChanged) {
      this.viewTrendReport();
    }
  }

  // // ********************************** AuditType Section Start *******************************//
  // getaudittypelist() {
  //   this.selectedAuditType = null;
  //   this.AuditTypelist = [];
  //   this.commonService.getAuditTypeList().subscribe((res) => {
  //     this.AuditTypelist = res;
  //     this.AuditName = this.AuditTypelist.find(
  //       (a) => a.Audit_Type_Id === this.audittypeid
  //     ).Audit_Type;
  //   });
  // }
  // // ********************************** AuditType Section End *******************************//

  // // ************************************ model Section Start *****************************//
  // onSelectModel(model) {
  //   if (model) {
  //     this.selectedModel = model.value;
  //     this.getAreaList();
  //   }
  // }

  // getModelList() {
  //   if (this.shopid) {
  //     this.commonService
  //       .getModelTableData(
  //         this.plantid,
  //         this.audittypeid,
  //         this.shopid,
  //         this.allshops
  //       )
  //       .subscribe((res) => {
  //         this.modellist = res;
  //       });
  //   } else {
  //     this.router.navigate(['/']);
  //   }
  // }

  // // ************************************ model Section End ****************************//

  // // ************************************ Date  Section Start ****************************//

  // onStartDateChange(event: any) {
  //   if (event.value) {
  //     this.actualStartDate = event.value;
  //     this.startdate = this.datePipe.transform(event.value, 'yyyy-MM-dd');
  //     if (this.enddate) {
  //       // this.enddatepicker1.value = '';
  //       if (this.startdate && this.enddate && this.selectedShift) {
  //         this.viewReport();
  //       }
  //     }
  //   }
  // }

  // onEndDateChange(event: any) {
  //   if (event.value) {
  //     this.enddate = this.datePipe.transform(event.value, 'yyyy-MM-dd');

  //     if (!this.shiftList) {
  //       this.getAreaList();
  //       return;
  //     }
  //     if (this.startdate && this.enddate && this.selectedShift) {
  //       this.viewReport();
  //     }
  //   }
  // }

  // // ************************************ Date Section End *******************************//

  // // ************************************ Area Section Start ***************************//
  // getAreaList() {
  //   this.AreaList = [];
  //   this.commonService
  //     .getAreaList(this.selectedModel.Model_ID, this.audittypeid)
  //     .subscribe((data) => {
  //       this.AreaList = data;
  //     });
  // }

  // selectArea(Area: any) {
  //   if (Area) {
  //     this.selectedArea = Area.value;
  //     this.getPartList();
  //   }
  // }
  // // ********************************** Area Section End *******************************//

  // // ************************************ Part Section Start ***************************//
  // getPartList() {
  //   this.PartList = [];
  //   this.commonService
  //     .getPartList(this.selectedArea.Area_ID, this.audittypeid)
  //     .subscribe((data) => {
  //       this.PartList = data;
  //     });
  // }

  // selectPart(Part: any) {
  //   if (Part) {
  //     this.selectedPart = Part.value;
  //     this.getCPList();
  //   }
  // }
  // // ********************************** Part Section End *******************************//

  // // ************************************ CP Section Start ***************************//
  // getCPList() {
  //   this.CheckPointList = [];
  //   this.commonService
  //     .getCPList(this.selectedPart.Part_ID, this.audittypeid)
  //     .subscribe((data) => {
  //       this.CheckPointList = data;
  //     });
  // }

  // selectCP(CP: any) {
  //   if (CP) {
  //     this.selectedCheckPoint = CP.value;
  //     this.getLocationList();
  //   }
  // }
  // // ********************************** CP Section End *******************************//

  // // ************************************ Location Section Start ***************************//
  // getLocationList() {
  //   this.locationList = [];
  //   this.commonService
  //     .getLocationList(this.selectedCheckPoint.Checkpoint_ID, this.audittypeid)
  //     .subscribe((data) => {
  //       console.log(data);
  //       this.locationList = data;
  //     });
  // }

  // onSelectLocation(Location: any) {
  //   if (Location) {
  //     this.selectedLocation = Location.value;
  //     if (this.selectedLocation.Is_Gap && this.selectedLocation.Is_Flushness) {
  //       this.selectedParameter = null;
  //       return;
  //     }
  //     if (this.selectedLocation.Is_Gap && !this.selectedLocation.Is_Flushness) {
  //       this.selectedParameter = this.ParameterList.find(
  //         (p) => p.Type.toLowerCase() === 'gap'
  //       );
  //       this.viewReport();
  //     } else {
  //       this.selectedParameter = this.ParameterList.find(
  //         (p) => p.Type.toLowerCase() === 'flushness'
  //       );
  //       this.viewReport();
  //     }
  //   }
  // }
  // // ********************************** Parameter Section End *******************************//
  // onSelectParameter(e) {
  //   this.viewReport();
  // }
  // // ************************************ Report generate Section Start ***************************//

  // viewReport() {
  //   if (!this.selectedModel) {
  //     this.toaster.warning('Please select Model');
  //     return;
  //   }
  //   // if (!this.selectedMonth && !this.selectedYear) {
  //   //   this.toaster.warning('Please select Month');
  //   //   return;
  //   // }

  //   if (!this.startdate) {
  //     this.toaster.warning('Please select Start Date');
  //     return;
  //   }
  //   if (!this.enddate) {
  //     this.toaster.warning('Please select End Date');
  //     return;
  //   }
  //   if (!this.selectedArea) {
  //     this.toaster.warning('Please select Area');
  //     return;
  //   }
  //   if (!this.selectedPart) {
  //     this.toaster.warning('Please select part');
  //     return;
  //   }
  //   if (!this.selectedCheckPoint) {
  //     this.toaster.warning('Please select check point');
  //     return;
  //   }
  //   if (!this.selectedLocation) {
  //     this.toaster.warning('Please select Location');
  //     return;
  //   }
  //   if (!this.selectedParameter) {
  //     this.toaster.warning('Please select parameter');
  //     return;
  //   }
  //   this.viewTrendReport();
  // }

  //http://mmnsk1drsv/reports/report/PQ%20Dashboard/1D_BIW_TCF/1D_Graphics_Audit

  viewTrendReport() {
    debugger;
    this.reportService
      .getXbarData(
        this.startdate,
        this.enddate,
        this.Model_ID,
        this.Area_ID,
        this.Part_ID,
        this.Checkpoint_ID,
        this.locationId,
        this.parameterId
      )
      .subscribe((res) => {
        // this.reportService.getXbarData('2025-01-01', '2025-01-31', 3, 31, 101, 0).subscribe((res) => {

        this.data = res;
        this.readings = res.map((s) => s.Average);
        this.LSL = res[0].LSL;
        this.USL = res[0].USL;
        this.sendData();

        if (res.length > 0) {
          this.chartOptions = {
            series: [
              {
                name: 'Actual Reading',
                data: res.map((s) => s.Average),
              },
              {
                name: 'USL',
                data: res.map((s) => s.USL),
              },
              {
                name: 'LSL',
                data: res.map((s) => s.LSL),
              },
            ],
            chart: {
              height: 500,
              type: 'line',
              zoom: {
                enabled: true,
              },
            },
            colors: ['#008FFB', '#ff0000', '#ff0000'],
            stroke: {
              width: 4, // Thickness of the lines
            },
            dataLabels: {
              enabled: true,
              formatter: (value, opts) => {
                const { seriesIndex, dataPointIndex, w } = opts;
                // Show labels only for the first and last points of "USL" and "LSL"
                if (
                  (seriesIndex === 1 || seriesIndex === 2) &&
                  dataPointIndex !== 0 &&
                  dataPointIndex !== w.globals.series[seriesIndex].length - 1
                ) {
                  return '';
                }
                return value.toString();
              },
            },
            markers: {
              size: 0, // Default marker size (invisible for other points)
              discrete: [
                ...res
                  .map((_, i) => {
                    if (i === 0 || i === res.length - 1) {
                      return {
                        seriesIndex: 1, // USL
                        dataPointIndex: i,
                        size: 6,
                      };
                    }
                    return null;
                  })
                  .filter(Boolean),
                ...res
                  .map((_, i) => {
                    if (i === 0 || i === res.length - 1) {
                      return {
                        seriesIndex: 2, // LSL
                        dataPointIndex: i,
                        size: 6,
                      };
                    }
                    return null;
                  })
                  .filter(Boolean),
              ],
              hover: {
                size: 10,
              },
            },
            title: {
              text: 'Trend Chart : ' + this.Part_Name,
              align: 'center',
            },
            grid: {
              row: {
                colors: ['transparent'], // takes an array which will be repeated on columns
                opacity: 0,
              },
            },
            xaxis: {
              categories: res.map((s) => s.Audit_Date),
              title: {
                text: 'Audit Date',
              },
            },
            yaxis: {
              title: {
                text: 'Actual Reading',
              },
            },
          };

          this.Show_Report = true;
        } else {
          this.data = [];
          this.Show_Report = false;
        }
      });
  }

  // ************************************ Report generate Section End **********************//
}
