import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { CreateauditComponent } from './createaudit/createaudit.component';
import { WriteupsheetComponent } from './writeupsheet/writeupsheet.component';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { AuditPlanConfigurationComponent } from './audit-plan-configuration/audit-plan-configuration.component';
import { AuditsheetComponent } from './auditsheet/auditsheet.component';
import { SubmitAuditComponent } from './auditsheet/submit-audit/submit-audit.component';
import { AudithistoryComponent } from './audithistory/audithistory.component';
import { DeletePlanlogComponent } from './auditsheet/delete-planlog/delete-planlog.component';

const routes: Routes = [
  {
    path: 'auditsheet', component: CreateauditComponent
  },
  {
    path: 'createaudit',
    component: AuditsheetComponent,
  },
  {
    path: 'writeupsheet',
    component: WriteupsheetComponent,
  },
  {
    path: 'auditplan',
    component: AuditPlanConfigurationComponent
  },
  {
    path: 'audithistory',
    component: AudithistoryComponent
  },
  {
    path: '',
    redirectTo: 'createaudit',
    pathMatch: 'full',
  },
];
@NgModule({
  declarations: [CreateauditComponent, WriteupsheetComponent, AuditPlanConfigurationComponent, AuditsheetComponent, SubmitAuditComponent, AudithistoryComponent,DeletePlanlogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    SharedModule
  ],
})
export class AuditModule { }
