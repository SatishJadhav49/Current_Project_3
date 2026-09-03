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
  remarks: string[] = []; // 'OK' / 'NA' / status of every reading
  LSL: number = null;
  USL: number = null;

  /*  Control limits are worked out from the readings on the screen every time ,
   *  using the same formula as the Calculations screen of the Specification
   *  Master ( MM_SpecificationMaster / UpdateCalculation ) :
   *
   *      X Bar  = average of the OK readings
   *      MR     = | this reading - previous reading | , a zero MR is left out
   *      MR Bar = average of those MR values , rounded to 2
   *      UCL    = X Bar + 3 x ( MR Bar / 1.13 )
   *      LCL    = X Bar - 3 x ( MR Bar / 1.13 )
   *      UCL R  = 3.27 x MR Bar
   */
  xDoubleBar: number = null;
  mrBar: number = null;
  calcUCL: number = null;
  calcLCL: number = null;
  calcUCLR: number = null;
  limitNote: string = '';
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

  // the same constants which the Calculations screen uses
  private readonly D2 = 1.13; // X chart  : X Bar +/- 3 x ( MR Bar / 1.13 )
  private readonly D4 = 3.27; // MR chart : UCL R = 3.27 x MR Bar

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
    this.remarks = [];
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
          this.remarks = list.map((r) => (r.Remark ? String(r.Remark) : ''));
          if (list.length) {
            this.LSL = this.num(list[0].MinVal);
            this.USL = this.num(list[0].MaxVal);
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
    this.calculateControlLimits();
    this.buildXbarChart();
    this.buildHistogram();
    this.buildMrChart();
  }
  // ********************************** Data Section End *******************************//

  // ********************************** Calculation Section Start *******************************//
  // null / undefined stay null , everything else becomes a number
  private num(value: any): number {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const n = Number(value);
    return isNaN(n) ? null : n;
  }

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

  // |x2 - x1| , |x3 - x2| ...  this is what the MR chart plots
  private movingRanges(): number[] {
    const mr: number[] = [];
    for (let i = 1; i < this.readings.length; i++) {
      mr.push(Math.abs(this.readings[i] - this.readings[i - 1]));
    }
    return mr;
  }

  /*  Control limits , worked out from the readings which are on the screen.
   *  Same formula as MM_SpecificationMaster / UpdateCalculation :
   *      - only the readings marked OK are used
   *      - a moving range of zero is left out of the average
   *      - MR Bar is rounded to 2 decimals before the limits are built
   */
  calculateControlLimits() {
    this.xDoubleBar = null;
    this.mrBar = null;
    this.calcUCL = null;
    this.calcLCL = null;
    this.calcUCLR = null;
    this.limitNote = '';

    const okReadings: number[] = [];
    this.readings.forEach((value, index) => {
      const remark = this.remarks[index];
      if (!remark || remark.toUpperCase() === 'OK') {
        okReadings.push(value);
      }
    });

    if (!okReadings.length) {
      this.limitNote =
        'No reading is marked OK in this range , so the control limits can not be worked out.';
      return;
    }

    this.xDoubleBar = this.mean(okReadings);

    // moving ranges of the OK readings , a zero difference is not counted
    const ranges: number[] = [];
    for (let i = 1; i < okReadings.length; i++) {
      const diff = Math.abs(okReadings[i] - okReadings[i - 1]);
      if (diff !== 0) {
        ranges.push(diff);
      }
    }

    if (!ranges.length) {
      this.limitNote =
        okReadings.length < 2
          ? 'Control limits need at least two OK readings.'
          : 'Every OK reading is the same value , so there is no moving range to build the control limits from.';
      return;
    }

    this.mrBar = Math.round(this.mean(ranges) * 100) / 100;
    this.calcUCL = this.xDoubleBar + 3 * (this.mrBar / this.D2);
    this.calcLCL = this.xDoubleBar - 3 * (this.mrBar / this.D2);
    this.calcUCLR = this.D4 * this.mrBar;
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
    // X Bar is the centre line of the limits , so the same value is used
    const mean = this.xDoubleBar !== null ? this.xDoubleBar : this.stats.mean;
    const ucl = this.calcUCL;
    const lcl = this.calcLCL;

    const yRange = this.axisRange(this.readings, [ucl, lcl]);

    // only the control limits are drawn here , the specification lines
    // ( LSL / USL ) are shown on the histogram instead
    const annotations: any = { yaxis: [] };
    annotations.yaxis.push(
      this.line(mean, '#1976d2', 'X Bar ' + this.round(mean))
    );
    if (ucl !== null) {
      annotations.yaxis.push(
        this.line(ucl, '#f57c00', 'UCL ' + this.round(ucl))
      );
    }
    if (lcl !== null) {
      annotations.yaxis.push(
        this.line(lcl, '#f57c00', 'LCL ' + this.round(lcl))
      );
    }

    this.xbarOptions = {
      series: [{ name: 'Reading', type: 'line', data: this.readings }],
      chart: {
        height: 330,
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
          const high = ucl !== null && value > ucl;
          const low = lcl !== null && value < lcl;
          if (high || low) {
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
      /*  The y axis is fixed on purpose. It normally scales to the readings
       *  only , and ApexCharts hides a y axis annotation which falls outside
       *  the axis , so UCL / LCL were being drawn off the plot and looked
       *  missing. The range below always covers the limit lines.
       */
      yaxis: {
        min: yRange.min,
        max: yRange.max,
        labels: { formatter: (val) => this.round(val, 2) },
      },
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

  /*  Range for a chart axis which has to hold the plotted values and the
   *  limit lines together , with a little padding on both sides.
   *  Returns undefined when there is nothing to measure , which leaves
   *  ApexCharts on its own automatic scale.
   */
  private axisRange(
    values: number[],
    extras: number[]
  ): { min: number; max: number } {
    const all = (values ? values : []).slice();
    (extras ? extras : []).forEach((v) => {
      if (v !== null && v !== undefined && !isNaN(v)) {
        all.push(v);
      }
    });
    if (!all.length) {
      return { min: undefined, max: undefined };
    }
    let min = Math.min(...all);
    let max = Math.max(...all);
    const pad = max - min > 0 ? (max - min) * 0.1 : Math.abs(max) * 0.1 || 1;
    min = min - pad;
    max = max + pad;
    return { min: min, max: max };
  }

  // horizontal line , used for X Bar / UCL / LCL / MR Bar / UCL R
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

  // vertical line on a category axis , used for LSL / USL on the histogram.
  // x has to be one of the group labels , not a number.
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
      bins.centers,
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
          this.findClosestBin(bins.centers, bins.categories, this.LSL),
          '#d32f2f',
          'LSL ' + this.LSL
        )
      );
    }
    if (this.USL !== null) {
      annotations.xaxis.push(
        this.vline(
          this.findClosestBin(bins.centers, bins.categories, this.USL),
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
      plotOptions: { bar: { columnWidth: '95%' } },
      dataLabels: { enabled: false },
      stroke: { width: [1, 3], colors: ['#fff', '#1976d2'], curve: 'smooth' },
      colors: ['#7cb5ec', '#1976d2'],
      xaxis: {
        categories: bins.categories,
        labels: { rotate: -45, style: { fontSize: '9px' } },
        // there can be up to 25 groups , so only some labels are printed
        tickAmount: bins.categories.length > 10 ? 10 : undefined,
        title: { text: 'Reading group' },
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

  /*  A round step near the value asked for : 1 , 2 , 2.5 or 5 times a
   *  power of ten. 0.05 instead of 0.043 , 0.2 instead of 0.18 , and so on.
   */
  private niceStep(raw: number): number {
    if (!raw || raw <= 0) {
      return 1;
    }
    const power = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / power;
    let nice = 10;
    if (norm <= 1) {
      nice = 1;
    } else if (norm <= 2) {
      nice = 2;
    } else if (norm <= 2.5) {
      nice = 2.5;
    } else if (norm <= 5) {
      nice = 5;
    }
    return nice * power;
  }

  /*  Grouping for the histogram.
   *
   *  When the location has a tolerance ( USL - LSL ) the group width is tied
   *  to it : about ten groups inside the tolerance , snapped to a round step
   *  and started on a round value. A tolerance of 0.5 gives groups of 0.05 ,
   *  so the bars are narrow and the shape of the readings is visible.
   *  The step is doubled if the readings are spread so wide that it would
   *  make more than 25 bars.
   *
   *  Without a tolerance there is nothing to tie the width to , so it falls
   *  back to Sturges rule  k = ceil( log2(n) ) + 1 , between 3 and 12.
   *
   *  Either way the range is stretched to cover LSL / USL , so the
   *  specification lines always have a group to sit on.
   */
  private generateHistogramData(
    data: number[],
    lsl: number,
    usl: number
  ): {
    categories: string[];
    centers: number[];
    data: number[];
    binWidth: number;
  } {
    let min = Math.min(...data);
    let max = Math.max(...data);
    if (lsl !== null && lsl < min) {
      min = lsl;
    }
    if (usl !== null && usl > max) {
      max = usl;
    }

    const tolerance =
      lsl !== null && usl !== null && usl > lsl ? usl - lsl : 0;

    let binWidth: number;
    let start: number;

    if (tolerance > 0) {
      binWidth = this.niceStep(tolerance / 10);
      let guard = 0;
      while (
        binWidth > 0 &&
        (max - min) / binWidth > 25 &&
        guard < 10
      ) {
        binWidth = this.niceStep(binWidth * 2);
        guard++;
      }
      // start on a round multiple of the step
      start = Math.floor(min / binWidth) * binWidth;
    } else {
      let k = Math.ceil(Math.log2(data.length > 1 ? data.length : 2)) + 1;
      if (k < 3) {
        k = 3;
      }
      if (k > 12) {
        k = 12;
      }
      binWidth = (max - min) / k;
      start = min;
    }

    if (!binWidth || binWidth <= 0) {
      // every reading is the same value , keep one readable group
      binWidth = 1;
      start = min - 0.5;
    }

    let binCount = Math.ceil((max - start) / binWidth + 0.000000001);
    if (binCount < 3) {
      binCount = 3;
    }

    // how many decimals the labels need , taken from the step itself
    let decimals = Math.max(0, -Math.floor(Math.log10(binWidth)));
    if (decimals > 3) {
      decimals = 3;
    }

    const bins: number[] = new Array(binCount).fill(0);
    const categories: string[] = [];
    const centers: number[] = [];
    for (let i = 0; i < binCount; i++) {
      const from = start + i * binWidth;
      const to = from + binWidth;
      categories.push(from.toFixed(decimals) + ' - ' + to.toFixed(decimals));
      centers.push(from + binWidth / 2);
    }

    data.forEach((value) => {
      let index = Math.floor((value - start) / binWidth);
      if (index < 0) {
        index = 0;
      }
      if (index > binCount - 1) {
        index = binCount - 1;
      }
      bins[index]++;
    });

    return { categories, centers, data: bins, binWidth };
  }

  // the specification line is drawn on the group whose middle is nearest to it
  private findClosestBin(
    centers: number[],
    categories: string[],
    value: number
  ): string {
    if (!centers.length) {
      return '';
    }
    let best = 0;
    let minDiff = Math.abs(centers[0] - value);
    for (let i = 1; i < centers.length; i++) {
      const diff = Math.abs(centers[i] - value);
      if (diff < minDiff) {
        minDiff = diff;
        best = i;
      }
    }
    return categories[best];
  }

  // the curve is taken at the middle of every group , so it lines up with the bars
  private generateNormalCurve(
    centers: number[],
    mean: number,
    stdDev: number,
    totalCount: number,
    binWidth: number
  ): number[] {
    if (!stdDev) {
      return centers.map(() => 0);
    }
    return centers.map((x) => {
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
    const mrBar = this.mrBar;
    const ucl = this.calcUCLR;

    const mrRange = this.axisRange(mr, [ucl, mrBar]);

    const annotations: any = { yaxis: [] };
    if (mrBar !== null) {
      annotations.yaxis.push(
        this.line(mrBar, '#1976d2', 'MR Bar ' + this.round(mrBar))
      );
    }
    if (ucl !== null) {
      annotations.yaxis.push(
        this.line(ucl, '#f57c00', 'UCL R ' + this.round(ucl))
      );
    }

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
      // fixed for the same reason as the X chart , so that UCL R stays visible
      yaxis: {
        min: 0,
        max: mrRange.max,
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
