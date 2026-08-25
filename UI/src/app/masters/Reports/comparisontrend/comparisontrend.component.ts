
import {
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Component } from '@angular/core';
import { ViewChild } from '@angular/core';
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
  selector: 'app-comparisontrend',
  templateUrl: './comparisontrend.component.html',
  styleUrls: ['./comparisontrend.component.css']
})
export class ComparisontrendComponent {
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

  private readings: number[] = [];

  private TCF_Reading: any;
  private BIW_Reading: any;

  // Control limits - you can set these to your actual LSL and USL values
  private LSL: number = 0; // Lower Control Limit
  private USL: number = 0; // Upper Control Limit


  sendData() {
    this.messageEvent.emit({
      TCF_Reading: [],
      BIW_Reading: [],
      LSL: this.LSL,
      USL: this.USL,
    });
  }

  Show_Report: boolean = false;

  // Trends
  @ViewChild('chart') chart: ChartComponent;
  public chartOptionsTCF: Partial<ChartOptions>;
  public chartOptionsBIW: Partial<ChartOptions>;
  data: any[] = [];
  allshops: boolean = false;
  constructor(

    private reportService: ReportsService,
  ) { }

  ngOnInit() {
    // this.viewTrendReport();
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

  viewTrendReport() {
    debugger;
    this.reportService
      .getMappingData(
        this.startdate,
        this.enddate,
        this.Model_ID,
        this.Area_ID,
        this.Part_ID,
        this.Checkpoint_ID,
        this.locationId,
        this.parameterId,
        this.audittypeid

      )
      .subscribe((res) => {
        debugger;
        this.data = res;
        this.TCF_Reading = res.tcfReadings ?? [];
        this.BIW_Reading = res.biwReadings ?? [];
        // this.LSL = res[0].LSL;
        // this.USL = res[0].USL;
        if (this.TCF_Reading.length > 0) { 
          this.LSL = this.TCF_Reading[0].LSL; 
          this.USL = this.TCF_Reading[0].USL; 
        } else if (this.BIW_Reading.length > 0) { 
          this.LSL = this.BIW_Reading[0].LSL; 
          this.USL = this.BIW_Reading[0].USL; 
        }

        // const tcfDates = this.TCF_Reading.map(r => r.Audit_Date);
        // const biwDates = this.BIW_Reading.map(r => r.Audit_Date);
        // const auditDates = Array.from(new Set([...tcfDates, ...biwDates]));

        this.sendData();

        if (this.TCF_Reading.length || this.BIW_Reading.length) {
          //TCF
          this.chartOptionsTCF = {
            series: [
              {
                name: 'TCF Location',
                data: this.TCF_Reading.map((s: any) => s.Reading),
              },
              {
                name: 'USL',
                data: this.TCF_Reading.map((s: any) => s.USL),
              },
              {
                name: 'LSL',
                data: this.TCF_Reading.map((s: any) => s.LSL),
              },
            ],
            chart: {
              height: 500,
              type: 'line',
              zoom: { enabled: true },
            },
            colors: ['#008FFB', '#ff0000', '#ff0000'], // Blue for TCF, Red for BIW
            stroke: { width: 4 },
            dataLabels: { enabled: true },
            markers: { size: 4, hover: { size: 8 } },
            title: {
              text: 'Trend Chart : ' + this.Part_Name,
              align: 'center',
            },
            grid: {
              row: { colors: ['transparent'], opacity: 0 },
            },
             xaxis: {
              categories: this.TCF_Reading.map((s: any) => s.Audit_Date),
              title: {
                text: 'Audit Date',
              },
            },
            yaxis: {
              title: { text: 'Reading Value' },
            },
          };

          //BIW
          this.chartOptionsBIW = {
            series: [

              {
                name: 'BIW Location',
                data: this.BIW_Reading.map((s: any) => s.Reading),
              },
              {
                name: 'USL',
                data: this.BIW_Reading.map((s: any) => s.USL),
              },
              {
                name: 'LSL',
                data: this.BIW_Reading.map((s: any) => s.LSL),
              },
            ],
            chart: {
              height: 500,
              type: 'line',
              zoom: { enabled: true },
            },
            colors: ['#008FFB', '#ff0000', '#ff0000'], 
            stroke: { width: 4 },
            dataLabels: { enabled: true },
            markers: { size: 4, hover: { size: 8 } },
            title: {
              text: 'Trend Chart : ' + this.Part_Name,
              align: 'center',
            },
            grid: {
              row: { colors: ['transparent'], opacity: 0 },
            },
            xaxis: {
              categories: this.BIW_Reading.map((s: any) => s.Audit_Date),
              title: {
                text: 'Audit Date',
              },
            },
            yaxis: {
              title: { text: 'Reading Value' },
            },
          };



          this.Show_Report = true;
        } else {
          this.data = [];
          this.Show_Report = false;
        }
      });
  }

}
