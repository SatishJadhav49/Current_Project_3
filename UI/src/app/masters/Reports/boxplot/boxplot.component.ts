import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuditType } from 'src/app/shared/models/audittype.model';
import { Model } from 'src/app/shared/models/model.model';
import { Parameter } from 'src/app/shared/models/parameter.model';
import { CommonService } from '../../common/common.service';
import { DatePipe } from '@angular/common';
import { ReportsService } from '../reports.service';

import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexPlotOptions,
  ApexTooltip,
} from 'ng-apexcharts';
import { MatDatepicker } from '@angular/material/datepicker';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';
import { Part } from 'src/app/shared/models/part.model';
import { CheckPoint } from 'src/app/shared/models/checkpoint.model';
import { Location } from 'src/app/shared/models/location.model';
import { Area } from 'src/app/shared/models/area.model';

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY',
  },
  display: {
    dateInput: 'YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};
export type BoxOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  xaxis: ApexXAxis;
  tooltip: ApexTooltip;
  plotOptions: ApexPlotOptions;
  colors: string[];
  annotations?: any;
};

@Component({
  selector: 'app-boxplot',
  templateUrl: './boxplot.component.html',
  styleUrls: ['./boxplot.component.css'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS,
    },
  ],
})
export class BoxplotComponent {
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
  // allshops: boolean = false;
  // showReport: boolean = false;
  showBoxPlot: boolean = false;
  // modellist: Model[];
  // selectedModel: Model;

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

  // // Other
  // public parameterFilter: FormControl = new FormControl();
  // protected _onDestroy = new Subject<void>();
  // data: any[] = [];

  // selectYear: any;

  // @ViewChild('picker', { static: false })
  // private picker!: MatDatepicker<Date>;

  // Box plot
  @ViewChild('box') box: ChartComponent;
  public boxOptions: Partial<BoxOptions>;

  readonly router = inject(Router);
  readonly commonService = inject(CommonService);
  readonly datePipe = inject(DatePipe);
  readonly reportService = inject(ReportsService);
  readonly toaster = inject(ToastrService);
  ngOnInit() {
    // $('#ngslide').hide();
    // $('.sidebar-mini').addClass('sidebar-collapse');
    // this.allshops = localStorage.getItem('isallshops') === '1';
    // this.plantid = parseInt(localStorage.getItem('plantid'));
    // this.shopid = parseInt(localStorage.getItem('shopid'));
    // this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    // this.userid = parseInt(localStorage.getItem('userid'));
    // this.hostname = localStorage.getItem('hostname');
    // if (!this.plantid || !this.shopid || !this.userid) {
    //   this.router.navigate(['']);
    // }
    // this.getModelList();
    // this.commonService.getParameter().subscribe((data) => {
    //   this.ParameterList = data;
    // });
    this.viewBoxPlot();
    this.sendData();
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
      this.viewBoxPlot();
    }
  }

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

  // chosenYearHandler(ev, input) {
  //   let { _d } = ev;
  //   this.selectYear = _d;
  //   this.picker.close();
  //   if (this.selectedParameter && this.selectedModel) {
  //     this.viewBoxPlot();
  //   }
  // }

  // // ************************************ Date Section End *******************************//
  // // ************************************ Parameter Section Start ***************************//
  // getParameterList() {
  //   // this.reportService
  //   //   .getAllParameterList(this.plantid,this.selectedModel.Model_ID)
  //   //   .subscribe((data) => {
  //   //     this.parameterList = data;
  //   //   });
  // }

  // selectParameter(Parameter: any) {
  //   if (Parameter) {
  //     this.selectedParameter = Parameter.value;
  //     this.showBoxPlot = false;
  //   }
  // }
  // // ********************************** Parameter Section End *******************************//

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
  //       this.viewBoxPlot();
  //     } else {
  //       this.selectedParameter = this.ParameterList.find(
  //         (p) => p.Type.toLowerCase() === 'flushness'
  //       );
  //       this.viewBoxPlot();
  //     }
  //   }
  // }
  // // ********************************** Location Section End *******************************//
  // // ********************************** Parameter Section End *******************************//
  // CheckboxRequiredValidator() {
  //   if (!this.selectedModel) {
  //     this.toaster.warning('Please select Model');
  //     return false;
  //   }
  //   if (!this.selectYear) {
  //     this.toaster.warning('Please select Year');
  //     return false;
  //   }

  //   if (!this.selectedPart) {
  //     this.toaster.warning('Please select Part');
  //     return false;
  //   }
  //   if (!this.selectedCheckPoint) {
  //     this.toaster.warning('Please select Checkpoint');
  //     return false;
  //   }
  //   if (!this.selectedLocation) {
  //     this.toaster.warning('Please select Location');
  //     return false;
  //   }
  //   if (!this.selectedParameter) {
  //     this.toaster.warning('Please select Parameter');
  //     return false;
  //   }

  //   return true;
  // }

  viewBoxPlot() {
    // if (!this.CheckboxRequiredValidator()) {
    //   return;
    // }
    this.showBoxPlot = false;
    this.reportService
      .getBoxPlotDataByDates(
        this.startdate,
        this.enddate,
        this.Part_ID,
        this.Checkpoint_ID,
        this.locationId,
        this.parameterId
      )
      .subscribe((res) => {
        if (res.length > 0) {
          let axisData = [];
          let annotations = {
            points: [],
          };
          debugger;
          for (let index = 0; index < res.length; index++) {
            if (res[index].Data.length <= 1) {
              continue;
            }
            const monthNames = [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ];

            // If month is a number (1-12), convert it to string month
            if (typeof res[index].Month === 'number') {
              res[index].Month = monthNames[res[index].Month - 1]; // Correctly map the number to the month name
            }
            console.log(res[index].Month);
            console.log(res[index].Data);
            // convert Data to float format
            res[index].Data = res[index].Data.map((item) => {
              if (typeof item === 'string') {
                return parseFloat(item.replace(/,/g, ''));
              }
              return item;
            });

            // Box plot data
            const temp = {
              x: res[index].Month, // Ensure Month is a string like 'Jan', 'Feb', etc.
              y: [
                this.reportService.findLowerWhisker(res[index].Data),
                this.reportService.findQ1(res[index].Data).toFixed(2),
                this.reportService.findMedian(res[index].Data).toFixed(2),
                this.reportService.findQ3(res[index].Data).toFixed(2),
                this.reportService.findUpperWhisker(res[index].Data),
              ],
            };
            axisData.push(temp);

            // Find outliers for the current month and log them for debugging
            const monthOutliers = this.reportService.findOutliers(
              res[index].Data
            );

            // Log to ensure the outliers are correct for the current month
            console.log(
              `Month: ${res[index].Month}, Outliers: ${JSON.stringify(
                monthOutliers
              )}`
            );

            // Ensure the outliers are associated correctly with the month
            monthOutliers.forEach((outlier) => {
              annotations.points.push({
                x: res[index].Month, // Associate outlier with the correct month
                y: outlier,
                marker: {
                  size: 6,
                  fillColor: '#FEB019',
                  strokeColor: '#FEB019',
                  radius: 2,
                },
                label: {
                  borderColor: '#FEB019',
                  offsetY: 0,
                  style: {
                    color: '#fff',
                    background: '#FEB019',
                  },
                },
              });
            });
          }

          // Custom sort function to sort months in the desired order
          const customMonthOrder = [
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
            'Jan',
            'Feb',
            'Mar',
          ];
          axisData.sort(
            (a, b) =>
              customMonthOrder.indexOf(a.x) - customMonthOrder.indexOf(b.x)
          );
          annotations.points.sort(
            (a, b) =>
              customMonthOrder.indexOf(a.x) - customMonthOrder.indexOf(b.x)
          );

          // Log the final data being passed to the chart
          console.log('Axis Data:', JSON.stringify(axisData));
          console.log('Annotations:', JSON.stringify(annotations));

          // Plotting logic for box plot and outliers
          this.boxOptions = {
            series: [
              {
                name: 'box',
                type: 'boxPlot',
                data: axisData,
              },
            ],
            chart: {
              height: 500,
              type: 'boxPlot',
            },
            colors: ['#008FFB', '#FEB019'],
            title: {
              text: 'BoxPlot - ' + this.Part_Name,
              align: 'center',
            },
            dataLabels: {
              enabled: true,
              formatter: function (val, opt) {
                // val is array of values for each boxplot
                // get median value (index 2)
                const median =
                  opt.w.config.series[0].data[opt.dataPointIndex].y[2];
                if (typeof median === 'string') {
                  return parseFloat(median.replace(/,/g, ''));
                }
                return median.toFixed(2);
              },
            },
            xaxis: {
              type: 'category',
              labels: {
                rotate: -45,
              },
            },
            tooltip: {
              shared: false,
              intersect: true,
              custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                if (seriesIndex === 0) {
                  // Box plot series
                  const median = w.config.series[0].data[dataPointIndex].y[2];
                  return `<div class="tooltip-box">
                <span>Median: ${median.toFixed(2)}</span>
              </div>`;
                }
                return undefined; // Default tooltip for other series
              },
            },
            annotations: annotations,
          };

          this.showBoxPlot = true;
        }
      });
  }
}
