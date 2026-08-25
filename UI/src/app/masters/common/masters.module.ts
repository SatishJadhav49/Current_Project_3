import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/shared/modules/material.module';
import { LocationmasterComponent } from './locationmaster/locationmaster.component';
import { MastersRoutingModule } from './masters-routing.module';
import { ModelmasterComponent } from './modelmaster/modelmaster.component';
import { ShopmasterComponent } from './shopmaster/shopmaster.component';
import { TestingComponent } from './testing/testing.component';
import { ShiftmasterComponent } from './shiftmaster/shiftmaster.component';
import { BuildphasemasterComponent } from './buildphasemaster/buildphasemaster.component';
import { AreamasterComponent } from './areamaster/areamaster.component';
import { PartmasterComponent } from './partmaster/partmaster.component';
import { CheckpointmasterComponent } from './checkpointmaster/checkpointmaster.component';
import { SpecificationmasterComponent } from './specificationmaster/specificationmaster.component';
import { ImagemasterComponent } from './imagemaster/imagemaster.component';
import { NgxImageCompressService } from 'ngx-image-compress';
import { SharedModule } from 'src/app/shared/modules/shared.module';
import { CalculationsComponent } from './specificationmaster/calculations/calculations.component';
import { UploadImageComponent } from './imagemaster/upload-image/upload-image.component';
import { EmailInputComponent } from './modelmaster/email-input/email-input.component';
import { LocationmappingmasterComponent } from './locationmappingmaster/locationmappingmaster.component';
import { VehicleimagemasterComponent } from './vehicleimagemaster/vehicleimagemaster.component';

@NgModule({
  declarations: [
    ModelmasterComponent,
    ShopmasterComponent,
    LocationmasterComponent,
    TestingComponent,
    ShiftmasterComponent,
    BuildphasemasterComponent,
    AreamasterComponent,
    PartmasterComponent,
    CheckpointmasterComponent,
    SpecificationmasterComponent,
    ImagemasterComponent,
    CalculationsComponent,
    UploadImageComponent,
    EmailInputComponent,
    LocationmappingmasterComponent,
    VehicleimagemasterComponent
  ],
  providers: [NgxImageCompressService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MastersRoutingModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
    SharedModule
  ]
})
export class MastersModule { }
