import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
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
  ApexMarkers,
} from 'ng-apexcharts';
import { ReportsService } from '../../reports.service';

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
  markers: ApexMarkers;
  legend: any; // ApexLegend is not used anywhere else in the project
  colors: string[];
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-reading-charts',
  templateUrl: './reading-charts.component.html',
  styleUrls: ['./reading-charts.component.css'],
  providers: [DatePipe],
})
export class ReadingChartsComponent {
  //Developer = Satish Jadhav
  // Token No.= 50005817
  // New Development
  // ********************************** Declaration Section Start *******************************//
  // parameters available on the clicked location ( Gap / Flushness )
  parameterList: any[] = [];
  selectedParameterId: number;

  readings: number[] = [];
  labels: string[] = []; // audit date , this is what the x axis shows
  vinLabels: string[] = []; // VIN / BIW number , shown inside the tooltip
  LSL: number = null;
  USL: number = null;
  loading: boolean = true;

  // what is written on the top of the popup
  rangeText: string = '';

  stats = {
    count: 0,
    min: 0,
    max: 0,
    mean: 0,
    median: 0,
    stdDev: 0,
    cp: null,
    cpk: null,
    lsl: null,
    usl: null,
  };

  xbarOptions: Partial<ChartOptions> = {};
  histogramOptions: Partial<ChartOptions> = {};
  mrOptions: Partial<ChartOptions> = {};

  // Individuals ( X ) and Moving Range constants for a subgroup of one.
  // One audit gives one reading for a location , so this is an I-MR pair.
  private readonly E2 = 2.66; // X chart  : CL +/- 2.66 x MRbar
  private readonly D4 = 3.267; // MR chart : UCL = 3.267 x MRbar

  constructor(
    public dialogRef: MatDialogRef<ReadingChartsComponent>,
    private reportsService: ReportsService,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.parameterList = this.data.parameters ? this.data.parameters : [];
    this.selectedParameterId = this.parameterList.length
      ? this.parameterList[0].Parameter_ID
      : null;

    if (this.data.topn > 0) {
      this.rangeText = 'Last ' + this.data.topn + ' readings';
    } else {
      this.rangeText = this.data.fromdate + ' to ' + this.data.todate;
    }

    this.loadReadings();
  }
  // ********************************** Declaration Section End *******************************//

  // ********************************** Data Section Start *******************************//
  selectParameter(parameterid: number) {
    this.selectedParameterId = parameterid;
    this.loadReadings();
  }

  isCurrentParameter(parameterid: number) {
    return this.selectedParameterId == parameterid;
  }

  loadReadings() {
    this.loading = true;
    this.readings = [];
    this.labels = [];
    this.vinLabels = [];
    if (!this.selectedParameterId) {
      this.loading = false;
      return;
    }

    this.reportsService
      .getLocationReadings(
        this.data.plantid,
        this.data.audittypeid,
        this.data.modelid,
        this.data.locationid,
        this.selectedParameterId,
        this.data.fromdate,
        this.data.todate,
        this.data.topn
      )
      .subscribe(
        (rows) => {
          const list = rows ? rows : [];
          this.readings = list.map((r) => Number(r.Reading));
          this.labels = list.map((r) =>
            r.Audit_Date
              ? this.datePipe.transform(r.Audit_Date, 'dd-MMM-yy')
              : ''
          );
          this.vinLabels = list.map((r) => {
            const no = r.VIN_No ? r.VIN_No : r.Body_No;
            return no ? no : 'Audit ' + r.Audit_ID;
          });
          if (list.length) {
            this.LSL =
              list[0].MinVal === null || list[0].MinVal === undefined
                ? null
                : Number(list[0].MinVal);
            this.USL =
              list[0].MaxVal === null || list[0].MaxVal === undefined
                ? null
                : Number(list[0].MaxVal);
          } else {
            this.LSL = null;
            this.USL = null;
          }
          this.buildAll();
          this.loading = false;
        },
        () => {
          this.loading = false;
        }
      );
  }

  buildAll() {
    this.calculateStats();
    this.buildXbarChart();
    this.buildHistogram();
    this.buildMrChart();
  }
  // ********************************** Data Section End *******************************//

  // ********************************** Calculation Section Start *******************************//
  private mean(data: number[]): number {
    if (!data.length) {
      return 0;
    }
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  private stdDev(data: number[], mean: number): number {
    if (!data.length) {
      return 0;
    }
    const variance =
      data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    return Math.sqrt(variance);
  }

  // |x2 - x1| , |x3 - x2| ...  used by the MR chart and by the control limits
  private movingRanges(): number[] {
    const mr: number[] = [];
    for (let i = 1; i < this.readings.length; i++) {
      mr.push(Math.abs(this.readings[i] - this.readings[i - 1]));
    }
    return mr;
  }

  calculateStats() {
    const n = this.readings.length;
    if (!n) {
      this.stats = {
        count: 0,
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        stdDev: 0,
        cp: null,
        cpk: null,
        lsl: this.LSL,
        usl: this.USL,
      };
      return;
    }

    const sorted = [...this.readings].sort((a, b) => a - b);
    const mean = this.mean(this.readings);
    const sd = this.stdDev(this.readings, mean);

    let median: number;
    if (n % 2 === 0) {
      median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    } else {
      median = sorted[Math.floor(n / 2)];
    }

    // Cp / Cpk need both the limits and a spread , otherwise they are not defined
    let cp = null;
    let cpk = null;
    if (
      this.LSL !== null &&
      this.USL !== null &&
      sd > 0 &&
      this.USL > this.LSL
    ) {
      cp = (this.USL - this.LSL) / (6 * sd);
      cpk = Math.min((this.USL - mean) / (3 * sd), (mean - this.LSL) / (3 * sd));
    }

    this.stats = {
      count: n,
      min: sorted[0],
      max: sorted[n - 1],
      mean: mean,
      median: median,
      stdDev: sd,
      cp: cp,
      cpk: cpk,
      lsl: this.LSL,
      usl: this.USL,
    };
  }

  round(value: number, digits: number = 3): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '-';
    }
    const factor = Math.pow(10, digits);
    return (Math.round(value * factor) / factor).toString();
  }

  // a small colour hint on the Cpk box
  cpkClass(): string {
    if (this.stats.cpk === null) {
      return '';
    }
    if (this.stats.cpk >= 1.33) {
      return 'rc-good';
    }
    if (this.stats.cpk >= 1) {
      return 'rc-warn';
    }
    return 'rc-bad';
  }
  // ********************************** Calculation Section End *******************************//

  // ********************************** X bar Chart Section Start *******************************//
  buildXbarChart() {
    const mean = this.stats.mean;
    const mr = this.movingRanges();
    const mrBar = mr.length ? this.mean(mr) : 0;
    // for readings taken one at a time the control limits come from the
    // average moving range , this is the standard Individuals chart
    const ucl = mean + this.E2 * mrBar;
    const lcl = mean - this.E2 * mrBar;

    // only the control limits are drawn here , the specification lines
    // ( LSL / USL ) are shown on the histogram instead
    const annotations: any = { yaxis: [] };
    annotations.yaxis.push(this.line(mean, '#1976d2', 'CL ' + this.round(mean)));
    annotations.yaxis.push(this.line(ucl, '#f57c00', 'UCL ' + this.round(ucl)));
    annotations.yaxis.push(this.line(lcl, '#f57c00', 'LCL ' + this.round(lcl)));

    this.xbarOptions = {
      series: [{ name: 'Reading', type: 'line', data: this.readings }],
      chart: {
        height: 340,
        type: 'line',
        toolbar: { show: true },
        animations: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: 'straight' },
      colors: ['#1976d2'],
      markers: {
        size: 4,
        // the chart now carries the control limits only , so a point is
        // marked red when it falls outside those limits
        discrete: this.readings.map((value, index) => {
          if (value > ucl || value < lcl) {
            return {
              seriesIndex: 0,
              dataPointIndex: index,
              fillColor: '#d32f2f',
              strokeColor: '#fff',
              size: 6,
            };
          }
          return null;
        }).filter((m) => m !== null),
      },
      xaxis: {
        categories: this.labels,
        labels: { rotate: -45, style: { fontSize: '9px' } },
        tickAmount: 12,
      },
      yaxis: { labels: { formatter: (val) => this.round(val, 2) } },
      grid: { borderColor: '#e7e7e7' },
      // the axis carries the date , so the VIN / BIW is put in the tooltip
      tooltip: {
        shared: false,
        custom: (opt) => {
          const value = opt.series[opt.seriesIndex][opt.dataPointIndex];
          const date = this.esc(this.labels[opt.dataPointIndex]);
          const vin = this.esc(this.vinLabels[opt.dataPointIndex]);
          return (
            '<div class="rc-tt">' +
            '<div class="rc-tt-head">' + date + '</div>' +
            '<div>' + vin + '</div>' +
            '<div><b>Reading : ' + this.round(value) + '</b></div>' +
            '</div>'
          );
        },
      },
      legend: { show: false },
      annotations: annotations,
      title: { text: 'X Chart ( Individual Readings )', align: 'center' },
    };
  }

  private line(y: number, color: string, text: string) {
    return {
      y: y,
      borderColor: color,
      strokeDashArray: 4,
      label: {
        text: text,
        style: { color: '#fff', background: color, fontSize: '10px' },
      },
    };
  }
  // ********************************** X bar Chart Section End *******************************//

  // ********************************** Histogram Section Start *******************************//
  buildHistogram() {
    if (!this.readings.length) {
      this.histogramOptions = {};
      return;
    }
    // the bins are stretched to cover LSL / USL as well , otherwise a
    // specification line outside the data range would have nowhere to sit
    const bins = this.generateHistogramData(this.readings, this.LSL, this.USL);
    const curve = this.generateNormalCurve(
      bins.categories,
      this.stats.mean,
      this.stats.stdDev,
      this.readings.length,
      bins.binWidth
    );

    // vertical specification lines
    const annotations: any = { xaxis: [] };
    if (this.LSL !== null) {
      annotations.xaxis.push(
        this.vline(
          this.findClosestBin(bins.categories, this.LSL),
          '#d32f2f',
          'LSL ' + this.LSL
        )
      );
    }
    if (this.USL !== null) {
      annotations.xaxis.push(
        this.vline(
          this.findClosestBin(bins.categories, this.USL),
          '#d32f2f',
          'USL ' + this.USL
        )
      );
    }

    this.histogramOptions = {
      series: [
        { name: 'Frequency', type: 'column', data: bins.data },
        { name: 'Normal Distribution', type: 'line', data: curve },
      ],
      chart: {
        height: 330,
        type: 'line',
        toolbar: { show: true },
        animations: { enabled: false },
      },
      plotOptions: { bar: { columnWidth: '99%' } },
      dataLabels: { enabled: false },
      stroke: { width: [1, 3], colors: ['#fff', '#1976d2'], curve: 'smooth' },
      colors: ['#7cb5ec', '#1976d2'],
      xaxis: {
        categories: bins.categories,
        labels: { style: { fontSize: '9px' } },
      },
      // the normal curve is a fraction , without this the axis prints
      // a long tail of decimals
      yaxis: {
        title: { text: 'Frequency' },
        labels: { formatter: (val) => this.round(val, 2) },
      },
      grid: { borderColor: '#e7e7e7' },
      legend: { show: true, position: 'top' },
      markers: { size: 0 },
      tooltip: { shared: true },
      annotations: annotations,
      title: { text: 'Histogram with Normal Curve', align: 'center' },
    };
  }

  private generateHistogramData(
    data: number[],
    lsl: number,
    usl: number
  ): {
    categories: string[];
    data: number[];
    binWidth: number;
  } {
    let min = Math.min(...data);
    let max = Math.max(...data);
    // stretch the range so that the specification always falls inside the chart
    if (lsl !== null && lsl < min) {
      min = lsl;
    }
    if (usl !== null && usl > max) {
      max = usl;
    }
    const binCount = 15;
    let binWidth = (max - min) / binCount;
    if (binWidth <= 0) {
      // every reading is the same value , keep one readable bin
      binWidth = 1;
    }

    const bins: number[] = new Array(binCount).fill(0);
    const categories: string[] = [];
    for (let i = 0; i < binCount; i++) {
      categories.push((min + i * binWidth).toFixed(2));
    }

    data.forEach((value) => {
      const index = Math.min(
        Math.floor((value - min) / binWidth),
        binCount - 1
      );
      bins[index]++;
    });

    return { categories, data: bins, binWidth };
  }

  // vertical line on a category axis , it must sit on one of the bins
  private vline(x: string, color: string, text: string) {
    return {
      x: x,
      borderColor: color,
      strokeDashArray: 4,
      label: {
        text: text,
        orientation: 'horizontal',
        position: 'top',
        style: { color: '#fff', background: color, fontSize: '10px' },
      },
    };
  }

  // the x axis holds the bin start values , so the specification is
  // drawn on the bin which is nearest to it
  private findClosestBin(categories: string[], value: number): string {
    if (!categories.length) {
      return '';
    }
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

  private generateNormalCurve(
    categories: string[],
    mean: number,
    stdDev: number,
    totalCount: number,
    binWidth: number
  ): number[] {
    if (!stdDev) {
      return categories.map(() => 0);
    }
    return categories.map((cat) => {
      const x = parseFloat(cat);
      // (1 / (sd * sqrt(2pi))) * e^(-((x - mean)^2 / (2 sd^2)))
      const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
      const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
      // scaled so that the curve sits on the same axis as the frequency
      return coefficient * Math.exp(exponent) * totalCount * binWidth;
    });
  }
  // ********************************** Histogram Section End *******************************//

  // ********************************** MR Chart Section Start *******************************//
  buildMrChart() {
    const mr = this.movingRanges();
    const mrBar = mr.length ? this.mean(mr) : 0;
    const ucl = this.D4 * mrBar;

    const annotations: any = { yaxis: [] };
    annotations.yaxis.push(
      this.line(mrBar, '#1976d2', 'MR ' + this.round(mrBar))
    );
    annotations.yaxis.push(this.line(ucl, '#f57c00', 'UCL ' + this.round(ucl)));

    this.mrOptions = {
      series: [{ name: 'Moving Range', type: 'line', data: mr }],
      chart: {
        height: 330,
        type: 'line',
        toolbar: { show: true },
        animations: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: 'straight' },
      colors: ['#0b9494'],
      markers: { size: 4 },
      // the first reading has no moving range , so the labels start from the second
      xaxis: {
        categories: this.labels.slice(1),
        labels: { rotate: -45, style: { fontSize: '9px' } },
        tickAmount: 12,
      },
      yaxis: {
        min: 0,
        labels: { formatter: (val) => this.round(val, 2) },
      },
      grid: { borderColor: '#e7e7e7' },
      legend: { show: false },
      tooltip: { shared: false },
      annotations: annotations,
      title: { text: 'Moving Range ( MR ) Chart', align: 'center' },
    };
  }
  // ********************************** MR Chart Section End *******************************//

  // the tooltip is raw html , so whatever comes from the database is escaped
  private esc(text: string): string {
    if (!text) {
      return '';
    }
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  close() {
    this.dialogRef.close();
  }
}
