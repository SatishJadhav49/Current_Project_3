import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DigitalGapgunComponent } from './digital-gapgun/digital-gapgun.component';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatOptionModule } from "@angular/material/core";
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { DigitalGapgunReportComponent } from './digital-gapgun-report/digital-gapgun-report.component';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
const routes: Route[] = [
  {
    path: 'digitalgapgun',
    component: DigitalGapgunComponent,
  },
  {
    path: 'digitalgapgunreport',
    component: DigitalGapgunReportComponent,
  }
];

@NgModule({
  declarations: [
    DigitalGapgunComponent,
    DigitalGapgunReportComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatFormFieldModule,
    MatOptionModule,
    MatSelectModule,
    MatDialogModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    MatProgressSpinnerModule
]
})
export class DigitalGapgunModule { }
