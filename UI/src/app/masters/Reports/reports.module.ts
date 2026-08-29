import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { ReportComponent } from './report/report.component';
import { GraphicalreportComponent } from './graphicalreport/graphicalreport.component';
import { SharedModule } from "../../shared/modules/shared.module";
import { MonthlyReportComponent } from './monthly-report/monthly-report.component';
import { BoxplotComponent } from './boxplot/boxplot.component';
import { SpcrulesComponent } from './spcrules/spcrules.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GraphicalreportCalculatedLimitsComponent } from './graphicalreport-calculated-limits/graphicalreport-calculated-limits.component';
import { HistogramComponent } from './histogram/histogram.component';
import { TrendchartComponent } from './trendchart/trendchart.component';
import { StatisticalreportsComponent } from './statisticalreports/statisticalreports.component';
import { ComparisontrendComponent } from './comparisontrend/comparisontrend.component';
import { VehicleimagereportComponent } from './vehicleimagereport/vehicleimagereport.component';
import { ReadingChartsComponent } from './vehicleimagereport/reading-charts/reading-charts.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
  declarations: [ReportComponent, GraphicalreportComponent, MonthlyReportComponent,BoxplotComponent,SpcrulesComponent, GraphicalreportCalculatedLimitsComponent, HistogramComponent,TrendchartComponent, StatisticalreportsComponent, ComparisontrendComponent, VehicleimagereportComponent, ReadingChartsComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    SharedModule,
    NgApexchartsModule,
    NgxSkeletonLoaderModule
  ]
})
export class ReportsModule { }
