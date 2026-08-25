import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexStroke,
  ApexGrid,
  ApexAnnotations,
  ApexTooltip,
  ApexTitleSubtitle,
} from 'ng-apexcharts';
import { ReportsService } from '../reports.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  grid: ApexGrid;
  annotations: ApexAnnotations;
  tooltip: ApexTooltip;
  colors: string[];
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-histogram',
  templateUrl: './histogram.component.html',
  styleUrls: ['./histogram.component.css'],
})
export class HistogramComponent {
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

  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  // Sample readings data
  private readings: number[] = [];

  // Control limits - you can set these to your actual LSL and USL values
  private LSL: number = 0; // Lower Control Limit
  private USL: number = 0; // Upper Control Limit

  constructor(private reportService: ReportsService) {}

  ngOnInit() {
    $('#ngslide').hide();
    this.getDataForHistogram();
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
      this.getDataForHistogram();
    }
  }

  sendData() {
    this.messageEvent.emit({Readings: this.readings, LSL: this.LSL, USL: this.USL});
  }

  getDataForHistogram() {
    this.reportService
      .getSPCRulesData(
        this.startdate,
        this.enddate,
        this.Area_ID,
        this.Model_ID,
        1, //plant id
        this.Part_ID,
        this.Checkpoint_ID,
        this.locationId,
        this.parameterId
      )
      .subscribe((res) => {
        if (res?.length > 0) {
          this.readings = res.map((r: any) => r.Average);
          this.LSL = res[0].LSL;
          this.USL = res[0].USL;
          this.sendData();
          this.plotHistogram();
        }
      });
  }

  plotHistogram() {
    const histogramData = this.generateHistogramData(this.readings);
    const mean = this.calculateMean(this.readings);
    const stdDev = this.calculateStdDev(this.readings, mean);
    const curveData = this.generateNormalCurve(
      histogramData.categories,
      mean,
      stdDev,
      this.readings.length,
      histogramData.binWidth
    );

    this.chartOptions = {
      series: [
        {
          name: 'Frequency',
          type: 'column',
          data: histogramData.data,
        },
        {
          name: 'Normal Distribution',
          type: 'line',
          data: curveData,
        },
      ],
      chart: {
        height: 450,
        type: 'line',
        toolbar: {
          show: true,
        },
      },
      plotOptions: {
        bar: {
          columnWidth: '99%',
          distributed: false,
          dataLabels: {
            position: 'top',
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: [1, 3],
        colors: ['#fff', '#1976D2'],
        curve: 'smooth',
      },
      title: {
        text: this.Part_Name + ', LSL : ' + this.LSL + ', USL : ' + this.USL,
        align: 'center',
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: histogramData.categories,
        title: {
          text: '',
        },
        labels: {
          rotate: 0,
        },
      },
      yaxis: {
        title: {
          text: 'Frequency',
        },
        decimalsInFloat: 2,
      },
      colors: ['#90CAF9', '#1976D2'],
      tooltip: {
        y: {
          formatter: function (val) {
            return val.toFixed(2);
          },
        },
      },
      annotations: {
        xaxis: [
          {
            x: this.findClosestBin(histogramData.categories, this.LSL),
            borderColor: '#FF4560',
            strokeDashArray: 4,
            label: {
              borderColor: '#FF4560',
              style: {
                color: '#fff',
                background: '#FF4560',
              },
              text: 'LSL',
            },
          },
          {
            x: this.findClosestBin(histogramData.categories, this.USL),
            borderColor: '#3F51B5',
            strokeDashArray: 4,
            label: {
              borderColor: '#3F51B5',
              style: {
                color: '#fff',
                background: '#3F51B5',
              },
              text: 'USL',
            },
          },
        ],
      },
    };
  }

  private generateHistogramData(data: number[]): {
    categories: string[];
    data: number[];
    binWidth: number;
  } {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binCount = 15;
    const binWidth = (max - min) / binCount;

    const bins: number[] = new Array(binCount).fill(0);
    const categories: string[] = [];

    // Create bin ranges
    for (let i = 0; i < binCount; i++) {
      const binStart = min + i * binWidth;
      const binEnd = binStart + binWidth;
      categories.push(binStart.toFixed(1));
    }

    // Count data points in each bin
    data.forEach((value) => {
      const binIndex = Math.min(
        Math.floor((value - min) / binWidth),
        binCount - 1
      );
      bins[binIndex]++;
    });

    // Return frequency (counts), not density
    return { categories, data: bins, binWidth };
  }

  private calculateMean(data: number[]): number {
    if (data.length === 0) return 0;
    const numericData = data.map((val) =>
      typeof val === 'string' ? parseFloat(val) : val
    );
    const value =
      numericData.reduce((sum, val) => sum + val, 0) / numericData.length;
    return value;
  }

  private calculateStdDev(data: number[], mean: number): number {
    const variance =
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  private generateNormalCurve(
    categories: string[],
    mean: number,
    stdDev: number,
    totalCount: number,
    binWidth: number
  ): number[] {
    return categories.map((cat) => {
      const x = parseFloat(cat);
      // Normal distribution formula: (1 / (σ * √(2π))) * e^(-((x - μ)² / (2σ²)))
      const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
      const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
      const probability = coefficient * Math.exp(exponent);
      // Scale to match frequency: multiply by total count and bin width
      return probability * totalCount * binWidth;
    });
  }

  private findClosestBin(categories: string[], value: number): string {
    let closest = categories[0];
    let minDiff = Math.abs(parseFloat(categories[0]) - value);

    for (let i = 1; i < categories.length; i++) {
      const diff = Math.abs(parseFloat(categories[i]) - value);
      if (diff < minDiff) {
        minDiff = diff;
        closest = categories[i];
      }
    }

    return closest;
  }
}
