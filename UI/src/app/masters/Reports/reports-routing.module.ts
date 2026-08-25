import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report/report.component';
import { GraphicalreportComponent } from './graphicalreport/graphicalreport.component';
import { MonthlyReportComponent } from './monthly-report/monthly-report.component';
import { BoxplotComponent } from './boxplot/boxplot.component';
import { SpcrulesComponent } from './spcrules/spcrules.component';
import { GraphicalreportCalculatedLimitsComponent } from './graphicalreport-calculated-limits/graphicalreport-calculated-limits.component';
import { HistogramComponent } from './histogram/histogram.component';
import { TrendchartComponent } from './trendchart/trendchart.component';
import { StatisticalreportsComponent } from './statisticalreports/statisticalreports.component';
import { ComparisontrendComponent } from './comparisontrend/comparisontrend.component';

const routes: Routes = [
  {
    path: '', component: ReportComponent
  },
  {
    path: 'report',
    component: ReportComponent,
    // component: HistogramComponent
  },
  {
    path: 'monthlyreport',
    component: MonthlyReportComponent,
  },
  {
    path: 'graphicalreport',
    component: GraphicalreportComponent
  },
  {
    path: 'graphicalreportlimits',
    component: GraphicalreportCalculatedLimitsComponent,
  },
  {
    path:'boxplot',
    component:BoxplotComponent
  },
  {
    path:'spcrules',
    component:SpcrulesComponent
  },
  {
    path:'trendchart',
    component:TrendchartComponent
  },
  {
    path: 'statisticalreport',
    component: StatisticalreportsComponent,
  },
  {
    path: 'comparisontrend',
    component: ComparisontrendComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule { }
