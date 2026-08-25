import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { YearlytargetComponent } from './yearlytarget/yearlytarget.component';
import { QuarterlytargetComponent } from './quarterlytarget/quarterlytarget.component';
import { SharedModule } from '../../shared/modules/shared.module';

const routes: Routes = [
  { path: 'yearlytarget', component: YearlytargetComponent },
  { path: 'quarterlytarget', component: QuarterlytargetComponent },
];

@NgModule({
  declarations: [YearlytargetComponent, QuarterlytargetComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    SharedModule,
  ],
})
export class TargetsModule {}
