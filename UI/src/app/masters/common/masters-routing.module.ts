import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocationmasterComponent } from './locationmaster/locationmaster.component';
import { ShopmasterComponent } from './shopmaster/shopmaster.component';
import { TestingComponent } from './testing/testing.component';
import { ModelmasterComponent } from './modelmaster/modelmaster.component';
import { ShiftmasterComponent } from './shiftmaster/shiftmaster.component';
import { BuildphasemasterComponent } from './buildphasemaster/buildphasemaster.component';
import { AreamasterComponent } from './areamaster/areamaster.component';
import { PartmasterComponent } from './partmaster/partmaster.component';
import { CheckpointmasterComponent } from './checkpointmaster/checkpointmaster.component';
import { SpecificationmasterComponent } from './specificationmaster/specificationmaster.component';
import { ImagemasterComponent } from './imagemaster/imagemaster.component';
import { LocationmappingmasterComponent } from './locationmappingmaster/locationmappingmaster.component';
import { VehicleimagemasterComponent } from './vehicleimagemaster/vehicleimagemaster.component';

const routes: Routes = [
  {
    path: 'modelmaster',
    component: ModelmasterComponent,
  },
  {
    path: 'testing',
    component: TestingComponent,
  },
  {
    path: 'shopmaster',
    component: ShopmasterComponent,
  },
  {
    path: 'shiftmaster',
    component: ShiftmasterComponent,
  },
  {
    path: 'buildphasemaster',
    component: BuildphasemasterComponent,
  },
  {
    path: 'areamaster',
    component: AreamasterComponent,
  },
  {
    path: 'partmaster',
    component: PartmasterComponent,
  },
  {
    path:'checkpointmaster',
    component:CheckpointmasterComponent
  },
  {
    path:'locationmaster',
    component:LocationmasterComponent
  },
  {
    path:'specificationmaster',
    component:SpecificationmasterComponent
  },
  {
    path:'imagemaster',
    component:ImagemasterComponent
  },
  {
    path:'locationmappingmaster',
    component:LocationmappingmasterComponent
  },
  {
    path:'vehicleimagemaster',
    component:VehicleimagemasterComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MastersRoutingModule {}
