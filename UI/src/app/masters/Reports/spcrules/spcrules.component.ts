import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../common/common.service';
import { ReportsService } from '../reports.service';
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
  selector: 'app-spcrules',
  templateUrl: './spcrules.component.html',
  styleUrls: ['./spcrules.component.css'],
})
export class SpcrulesComponent {
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

  // SPC Rules
  RulesList = [
    {
      Rule: 'Rule 1',
      Rule_Name: 'Beyond Limits',
      Description: 'One or more points beyond control limits',
      Result: 3,
    },
    {
      Rule: 'Rule 2',
      Rule_Name: 'Zone A',
      Description: '2 out of 3 consecutive points in Zone A or beyond',
      Result: 3,
    },
    {
      Rule: 'Rule 3',
      Rule_Name: 'Zone B',
      Description: '4 out of 5 consecutive points in Zone B or beyond',
      Result: 3,
    },
    {
      Rule: 'Rule 4',
      Rule_Name: 'Zone C',
      Description:
        '7 or more consecutive points on the one side of the average ( in zone C or beyond )',
      Result: 3,
    },
    {
      Rule: 'Rule 5',
      Rule_Name: 'Trend',
      Description: '7 consecutive points trending up or trending down',
      Result: 3,
    },
    {
      Rule: 'Rule 6',
      Rule_Name: 'Mixture',
      Description: '8 consecutive points with no points in Zone C',
      Result: 3,
    },
    {
      Rule: 'Rule 7',
      Rule_Name: 'Stratification',
      Description: '15 consecutive points in Zone C',
      Result: 3,
    },
    {
      Rule: 'Rule 8',
      Rule_Name: 'Over-control',
      Description: '14 consecutive points alternating up and down',
      Result: 3,
    },
  ];
  showSPCRules: boolean = false;

  // Trends
  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  data: any[] = [];

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
  // allshops: boolean = false;
  // // Date
  // startdate: any;
  // enddate: any;
  // actualStartDate: Date;
  // @ViewChild('startdatepicker1', {
  //   read: MatInput,
  // })
  // startdatepicker1: MatInput;
  // @ViewChild('enddatepicker1', {
  //   read: MatInput,
  // })
  // enddatepicker1: MatInput;
  // currentDate: Date = new Date();

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

  // // Co-ordinates
  // CoordinatesList: string[] = ['X', 'Y', 'Z'];
  // selectedCoordinate: string;
  constructor(
    private router: Router,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private toaster: ToastrService,
    private reportService: ReportsService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {

    this.calculateSPC();
    // $('#ngslide').hide();
    // $('.sidebar-mini').addClass('sidebar-collapse');
    // this.plantid = parseInt(localStorage.getItem('plantid'));
    // this.shopid = parseInt(localStorage.getItem('shopid'));
    // this.allshops = localStorage.getItem('isallshops') === '1';
    // this.audittypeid = parseInt(localStorage.getItem('audittypeid'));
    // this.userid = parseInt(localStorage.getItem('userid'));
    // this.hostname = localStorage.getItem('hostname');
    // if (!this.plantid || !this.shopid || !this.audittypeid || !this.userid) {
    //   this.router.navigate(['']);
    // }
    // this.getModelList();
    // this.commonService.getAuditTypeList().subscribe((data) => {
    //   this.AuditName = data.find(
    //     (a) => a.Audit_Type_Id == this.audittypeid
    //   ).Audit_Type;
    // });
    // this.commonService.getParameter().subscribe((data) => {
    //   this.ParameterList = data;
    // });
    // this.commonService.getPlantname(this.plantid).subscribe((data) => {
    //   this.plantname = data.toLowerCase();
    // });
  }

  
ngOnChanges(changes: SimpleChanges) {
    const watched = ['startdate', 'enddate', 'locationId', 'parameterId', 'Checkpoint_ID', 'Part_ID', 'Area_ID', 'Model_ID'];
    const anyChanged = watched.some(k => !!changes[k]);

    if (anyChanged) {
      this.calculateSPC();
  
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
  // onStartDateChange(event: any) {
  //   if (event.value) {
  //     this.actualStartDate = event.value;
  //     this.startdate = this.datePipe.transform(event.value, 'MM/dd/yyyy');
  //     if (this.enddate) {
  //       // this.enddatepicker1.value = '';
  //       if (this.startdate && this.enddate) {
  //         this.calculateSPC();
  //       }
  //     }
  //   }
  // }

  // onEndDateChange(event: any) {
  //   if (event.value) {
  //     this.enddate = this.datePipe.transform(event.value, 'MM/dd/yyyy');
  //     if (this.startdate && this.enddate) {
  //       this.calculateSPC();
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
  //       this.calculateSPC();
  //     } else {
  //       this.selectedParameter = this.ParameterList.find(
  //         (p) => p.Type.toLowerCase() === 'flushness'
  //       );
  //       this.calculateSPC();
  //     }
  //   }
  // }
  // // ********************************** Location Section End *******************************//
  // // ********************************** Parameter Section End *******************************//
  // onSelectParameter() {
  //   if (this.selectedParameter) {
  //     this.calculateSPC();
  //   }
  // }
  calculateSPC() {
    // const startdate = this.datePipe.transform(this.startdate, 'yyyy-MM-dd');
    // const enddate = this.datePipe.transform(this.enddate, 'yyyy-MM-dd');
    this.reportService
      .getSPCRulesData(
        this.startdate,
        this.enddate,
        this.Area_ID,
        this.Model_ID,
        1,
        this.Part_ID,
        this.Checkpoint_ID,
        this.locationId,
        this.parameterId
      )
      .subscribe((res) => {
         this.readings = res.map((s) => s.Average);
        this.LSL = res[0].LSL;
        this.USL = res[0].USL;
        this.sendData();
        this.CheckRules(res);
      });
  }
  viewTrendChart(res, sigma1, sigma1Minus, sigma2, sigma2Minus,sigma3,sigma3Minus, MailAverage) {
    if (res.length > 0) {
      const sigma1Array = new Array(res.length).fill(Number(sigma1.toFixed(2)));
      const sigma1MinusArray = new Array(res.length).fill(
        Number(sigma1Minus.toFixed(2))
      );
      const sigma2Array = new Array(res.length).fill(Number(sigma2.toFixed(2)));
      const sigma2MinusArray = new Array(res.length).fill(
        Number(sigma2Minus.toFixed(2))
      );
      const sigma3Array = new Array(res.length).fill(Number(sigma3.toFixed(2)));
      const sigma3MinusArray = new Array(res.length).fill(
        Number(sigma3Minus.toFixed(2))
      );
      const Average = new Array(res.length).fill(
        Number(MailAverage.toFixed(2))
      );
      this.chartOptions = {
        series: [
          {
            name: 'A+',
            data: sigma3Array,
          },
          {
            name: 'B+',
            data: sigma2Array,
          },
          {
            name: 'C+',
            data: sigma1Array,
          },
          {
            name: 'Actual Reading',
            data: res.map((s) => s.Average),
          },
          {
            name: 'Average',
            data: Average,
          },
          {
            name: 'C-',
            data: sigma1MinusArray,
          },
          {
            name: 'B-',
            data: sigma2MinusArray,
          },
          {
            name: 'A-',
            data: sigma3MinusArray,
          },
        ],
        chart: {
          height: 700,
          type: 'line',
          zoom: {
            enabled: true,
          },
        },
        colors: [
          '#ff0000',
          '#ff00fb',
          '#00e1ff',
          '#008FFB',
          '#003cff',
          '#00e1ff',
          '#ff00fb',
          '#ff0000',
        ],
        stroke: {
          width: 3, // Thickness of the lines
        },
        dataLabels: {
          enabled: true,
          formatter: (value, opts) => {
            const { seriesIndex, dataPointIndex, w } = opts;
            // Show labels only for the first and last points of "USL" and "LSL"
            if (
              (seriesIndex === 1 ||
                seriesIndex === 2 ||
                seriesIndex === 0 ||
                seriesIndex === 4 ||
                seriesIndex === 5 ||
                seriesIndex === 6 ||
                seriesIndex === 7) &&
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
            ...[1, 2, 3, 4, 5, 6].flatMap((seriesIndex) =>
              res.length > 0
                ? [
                    { seriesIndex, dataPointIndex: 0, size: 6 },
                    { seriesIndex, dataPointIndex: res.length - 1, size: 6 },
                  ]
                : []
            ),
          ],
          hover: { size: 10 },
        },
        title: {
          text: 'X Bar Chart : '+ this.Part_Name,
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
  }

  CheckRules(data) {
    let Readings = data.map((s) => s.Average);
    Readings = Readings.map((item) => {
      if (typeof item === 'string') {
        return parseFloat(item.replace(/,/g, ''));
      }
      return item;
    });
    const Average = this.calculateAverage(Readings);
    console.log(Average);
    const StandardDeviation = this.calculateStandardDeviation(
      Readings,
      Average
    );
    console.log(StandardDeviation);

    const sigma1 = this.calculateSignma1(Average, StandardDeviation);
    const sigma2 = this.calculateSigma2(Average, StandardDeviation);
    const sigma3 = this.calculateSigma3(Average, StandardDeviation);
    const sigma1Minus = this.calculateSigma1Minus(Average, StandardDeviation);
    const sigma2Minus = this.calculateSigma2Minus(Average, StandardDeviation);
    const sigma3Minus = this.calculateSigma3Minus(Average, StandardDeviation);

    console.log('Sigma 1:', sigma1);
    console.log('Sigma 2:', sigma2);
    console.log('Sigma 3:', sigma3);
    console.log('Sigma 1 Minus:', sigma1Minus);
    console.log('Sigma 2 Minus:', sigma2Minus);
    console.log('Sigma 3 Minus:', sigma3Minus);

    for (let index = 0; index < this.RulesList.length; index++) {
      switch (index + 1) {
        case 1:
          this.RulesList[index].Result = this.checkRule1(
            Readings,
            sigma3,
            sigma3Minus
          );
          break;
        case 2:
          this.RulesList[index].Result = this.checkRule2(
            Readings,
            sigma2,
            sigma2Minus
          );
          break;
        case 3:
          this.RulesList[index].Result = this.checkRule3(
            Readings,
            sigma1,
            sigma1Minus
          );
          break;
        case 4:
          this.RulesList[index].Result = this.checkRule4(Readings, Average);
          break;
        case 5:
          this.RulesList[index].Result = this.checkRule5(Readings, Average);
          break;
        case 6:
          this.RulesList[index].Result = this.checkRule6(
            Readings,
            sigma1,
            sigma1Minus
          );
          break;
        case 7:
          this.RulesList[index].Result = this.checkRule7(
            Readings,
            sigma1,
            sigma1Minus
          );
          break;
        case 8:
          this.RulesList[index].Result = this.checkRule8(Readings);
          break;
      }
    }
    this.showSPCRules = true;

    this.viewTrendChart(
      data,
      sigma1,
      sigma1Minus,
      sigma2,
      sigma2Minus,
      sigma3,
      sigma3Minus,
      Average
    );
  }

  calculateStandardDeviation(data: any[], Average: number) {
    let sum = 0;
    data.forEach((element) => {
      sum += Math.pow(element - Average, 2);
    });
    return Math.sqrt(sum / data.length);
  }

  calculateAverage(data: any[]) {
    let sum = 0;
    data.forEach((element) => {
      sum += element;
    });
    return sum / data.length;
  }

  calculateSignma1(Average: number, StandardDeviation: number) {
    return Average + StandardDeviation;
  }
  calculateSigma2(Average: number, StandardDeviation: number) {
    return Average + 2 * StandardDeviation;
  }

  calculateSigma3(Average: number, StandardDeviation: number) {
    return Average + 3 * StandardDeviation;
  }
  calculateSigma1Minus(Average: number, StandardDeviation: number) {
    return Average - StandardDeviation;
  }

  calculateSigma2Minus(Average: number, StandardDeviation: number) {
    return Average - 2 * StandardDeviation;
  }

  calculateSigma3Minus(Average: number, StandardDeviation: number) {
    return Average - 3 * StandardDeviation;
  }

  // Check Rule 1 : Beyond Limits - One or more points beyond control limits
  checkRule1(Readings: any[], sigma3: number, sigma3Minus: number): number {
    if (Readings.length < 1) {
      return 3; // readings not enough for check rule
    }
    const outOfRange = Readings.filter((reading) => {
      return reading < sigma3Minus || reading > sigma3;
    });
    console.log('Out of Range:', outOfRange);
    if (outOfRange.length > 0) {
      // this.toaster.error('Rule 1 Fired');
      return 1;
    }
    return 2;
  }

  // Check Rule 2 : Zone A - Two out of three consecutive points in Zone A
  checkRule2(Readings: any[], sigma2: number, sigma2Minus: number): number {
    if (Readings.length < 3) {
      return 3; // readings not enough for check rule
    }
    let count = 0;
    for (let index = 0; index < Readings.length - 2; index++) {
      if (Readings[index] > sigma2 || Readings[index] < sigma2Minus) {
        count++;
      }
      if (Readings[index + 1] > sigma2 || Readings[index + 1] < sigma2Minus) {
        count++;
      }
      if (Readings[index + 2] > sigma2 || Readings[index + 2] < sigma2Minus) {
        count++;
      }

      if (count >= 2) {
        console.log('Values');
        console.log('Sigma 2 :', sigma2);
        console.log('Sigma 2 Minus:', sigma2Minus);
        console.log(Readings[index]);
        console.log(Readings[index + 1]);
        console.log(Readings[index + 2]);

        // this.toaster.error('Rule 2 Fired');
        return 1; // Found pattern
      } else {
        count = 0;
      }
    }
    return 2; // not found patterns
  }

  // Check Rule 3 : Zone B - Four out of five consecutive points in Zone B
  checkRule3(Readings: any[], sigma1: number, sigma1Minus: number): number {
    if (Readings.length < 5) {
      return 3; // readings not enough for check rule
    }

    let count = 0;
    for (let index = 0; index < Readings.length - 4; index++) {
      if (Readings[index] > sigma1 || Readings[index] < sigma1Minus) {
        count++;
      }
      if (Readings[index + 1] > sigma1 || Readings[index + 1] < sigma1Minus) {
        count++;
      }
      if (Readings[index + 2] > sigma1 || Readings[index + 2] < sigma1Minus) {
        count++;
      }
      if (Readings[index + 3] > sigma1 || Readings[index + 3] < sigma1Minus) {
        count++;
      }
      if (Readings[index + 4] > sigma1 || Readings[index + 4] < sigma1Minus) {
        count++;
      }

      if (count >= 4) {
        // this.toaster.error('Rule 3 Fired');
        return 1;
      } else {
        count = 0;
      }
    }
    return 2;
  }

  // Check Rule 4 : Zone C - Seven consecutive points on the same side of the center line
  checkRule4(Readings: any[], Average: number): number {
    if (Readings.length < 7) {
      return 3; // readings not enough for check rule
    }
    let count = 0;
    for (let index = 0; index < Readings.length - 6; index++) {
      if (Readings[index] > Average) {
        count++;
      }
      if (Readings[index + 1] > Average) {
        count++;
      }
      if (Readings[index + 2] > Average) {
        count++;
      }
      if (Readings[index + 3] > Average) {
        count++;
      }
      if (Readings[index + 4] > Average) {
        count++;
      }
      if (Readings[index + 5] > Average) {
        count++;
      }
      if (Readings[index + 6] > Average) {
        count++;
      }

      if (count >= 7) {
        // this.toaster.error('Rule 4 Fired');
        return 1;
      } else {
        count = 0;
      }
    }
    for (let index = 0; index < Readings.length - 6; index++) {
      if (Readings[index] > Average) {
        count++;
      }
      if (Readings[index + 1] < Average) {
        count++;
      }
      if (Readings[index + 2] < Average) {
        count++;
      }
      if (Readings[index + 3] < Average) {
        count++;
      }
      if (Readings[index + 4] < Average) {
        count++;
      }
      if (Readings[index + 5] < Average) {
        count++;
      }
      if (Readings[index + 6] < Average) {
        count++;
      }

      if (count >= 7) {
        // this.toaster.error('Rule 4 Fired');
        return 1;
      } else {
        count = 0;
      }
    }
    return 2;
  }

  // Check Rule 5 : Zone C - Seven consecutive points on the same side of the center line
  checkRule5(Readings: any[], Average: number): number {
    if (Readings.length < 7) {
      return 3; // readings not enough for check rule
    }
    let count = 0;
    for (let index = 0; index < Readings.length - 6; index++) {
      if (
        Readings[index] < Readings[index + 1] &&
        Readings[index + 1] < Readings[index + 2] &&
        Readings[index + 2] < Readings[index + 3] &&
        Readings[index + 3] < Readings[index + 4] &&
        Readings[index + 4] < Readings[index + 5] &&
        Readings[index + 5] < Readings[index + 6]
      ) {
        count++;
      }
      if (
        Readings[index] > Readings[index + 1] &&
        Readings[index + 1] > Readings[index + 2] &&
        Readings[index + 2] > Readings[index + 3] &&
        Readings[index + 3] > Readings[index + 4] &&
        Readings[index + 4] > Readings[index + 5] &&
        Readings[index + 5] > Readings[index + 6]
      ) {
        count++;
      }

      if (count >= 1) {
        // this.toaster.error('Rule 5 Fired');
        return 1;
      } else {
        count = 0;
      }
    }
    return 2;
  }

  // Check Rule 6 : Mixture - eight consecutive points with no points in Zone C
  checkRule6(Readings: any[], sigma1: number, sigma1Minus: number): number {
    if (Readings.length < 8) {
      return 3; // readings not enough for check rule
    }
    for (let index = 0; index < Readings.length - 7; index++) {
      if (Readings[index] < sigma1 && Readings[index] > sigma1Minus) {
        return 2; // return not found pattern
      }
    }
    // this.toaster.error('Rule 6 Fired');
    return 1;
  }

  // Check Rule 7 : Stratification - Fifteen consecutive points in Zone C
  checkRule7(Readings: any[], sigma1: number, sigma1Minus): number {
    if (Readings.length < 15) {
      return 3; // readings not enough for check rule
    }
    let count = 0;
    for (let index = 0; index < Readings.length - 14; index++) {
      if (Readings[index] < sigma1 && Readings[index] < sigma1Minus) {
        count++;
      }
      if (Readings[index + 1] < sigma1 && Readings[index + 1] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 2] < sigma1 && Readings[index + 2] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 3] < sigma1 && Readings[index + 3] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 4] < sigma1 && Readings[index + 4] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 5] < sigma1 && Readings[index + 5] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 6] < sigma1 && Readings[index + 6] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 7] < sigma1 && Readings[index + 7] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 8] < sigma1 && Readings[index + 8] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 9] < sigma1 && Readings[index + 9] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 10] < sigma1 && Readings[index + 10] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 11] < sigma1 && Readings[index + 11] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 12] < sigma1 && Readings[index + 12] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 13] < sigma1 && Readings[index + 13] > sigma1Minus) {
        count++;
      }
      if (Readings[index + 14] < sigma1 && Readings[index + 14] > sigma1Minus) {
        count++;
      }
      if (count >= 15) {
        // this.toaster.error('Rule 7 Fired');
        return 1;
      } else {
        count = 0;
      }
    }
    return 2;
  }

  // Check Rule 8 : Over-control - 14 points in a row alternating up and down
  checkRule8(Readings: any[]): number {
    if (Readings.length < 14) {
      return 3; // readings not enough for check rule
    }
    let count = 0;
    for (let index = 0; index < Readings.length - 13; index++) {
      if (
        Readings[index] < Readings[index + 1] &&
        Readings[index + 1] > Readings[index + 2] &&
        Readings[index + 2] < Readings[index + 3] &&
        Readings[index + 3] > Readings[index + 4] &&
        Readings[index + 4] < Readings[index + 5] &&
        Readings[index + 5] > Readings[index + 6] &&
        Readings[index + 6] < Readings[index + 7] &&
        Readings[index + 7] > Readings[index + 8] &&
        Readings[index + 8] < Readings[index + 9] &&
        Readings[index + 9] > Readings[index + 10] &&
        Readings[index + 10] < Readings[index + 11] &&
        Readings[index + 11] > Readings[index + 12] &&
        Readings[index + 12] < Readings[index + 13]
      ) {
        count++;
      }
      if (
        Readings[index] > Readings[index + 1] &&
        Readings[index + 1] < Readings[index + 2] &&
        Readings[index + 2] > Readings[index + 3] &&
        Readings[index + 3] < Readings[index + 4] &&
        Readings[index + 4] > Readings[index + 5] &&
        Readings[index + 5] < Readings[index + 6] &&
        Readings[index + 6] > Readings[index + 7] &&
        Readings[index + 7] < Readings[index + 8] &&
        Readings[index + 8] > Readings[index + 9] &&
        Readings[index + 9] < Readings[index + 10] &&
        Readings[index + 10] > Readings[index + 11] &&
        Readings[index + 11] < Readings[index + 12] &&
        Readings[index + 12] > Readings[index + 13]
      ) {
        count++;
      }
      if (count >= 1) {
        // this.toaster.error('Rule 8 Fired');
        return 1;
      } else {
        count = 0;
      }
    }
    return 2;
  }

  // ************************************ Golden Rules Section End **********************//
}
