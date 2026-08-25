import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigRoutingModule } from './config-routing.module';
import { MaterialModule } from '../modules/material.module';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ConfigmasterComponent } from './configmaster/configmaster.component';
import { SlidesComponent } from '../components/slides/slides.component';



@NgModule({
  declarations: [
    ConfigmasterComponent,
    SlidesComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    ConfigRoutingModule
  ]
})
export class ConfigModule { }
