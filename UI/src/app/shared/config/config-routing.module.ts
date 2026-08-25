import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigmasterComponent } from './configmaster/configmaster.component';
import { AuthGuard } from 'src/app/authentication/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: ConfigmasterComponent,
    data: { link: 'configmaster' },
    children: [
      {
        path: 'usermanagement',
        canActivate: [AuthGuard],
        data: { link: 'usermanagement' },
        loadChildren: () =>
          import('../../masters/usermanagement/user.module').then(
            (m) => m.UserModule
          ),
      },
      {
        path: 'masters',
        canActivate: [AuthGuard],
        data: { link: 'masters' },
        loadChildren: () =>
          import('../../masters/common/masters.module').then((m) => m.MastersModule),
      },
      {
        path: 'report',
        canActivate: [AuthGuard],
        data: { link: 'report' },
        loadChildren: () =>
          import('../../masters/Reports/reports.module').then(
            (m) => m.ReportsModule
          ),
      },
      {
        path: 'audit',
        canActivate: [AuthGuard],
        data: { link: 'audit' },
        loadChildren: () => import('../../masters/Audit/audit.module').then((m) => m.AuditModule)
      },
      {
        path: 'targets',
        canActivate: [AuthGuard],
        data: { link: 'targets' },
        loadChildren: () =>
          import('../../masters/Targets/targets.module').then(
            (m) => m.TargetsModule
          ),
      },
      {
        path: 'documents',
        canActivate: [AuthGuard],
        data: { link: 'documents' },
        loadChildren: () =>
          import('../../masters/document/document.module').then(
            (m) => m.DocumentModule
          ),
      },
      {
        path: 'dashboard',
        canActivate: [AuthGuard],
        data: { link: 'dashboard' },
        loadChildren: () =>
          import('../../masters/Dashboard/dashboard.module').then(
            (m) => m.DashboardModule
          ),
      },
      {
        path: 'digitalgapgun',
        canActivate: [AuthGuard],
        data: { link: 'digitalgapgun' },
        loadChildren: () =>
          import('../../masters/Digitalgapgun/digitalgapgun.module').then(
            (m) => m.DigitalGapgunModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigRoutingModule { }
