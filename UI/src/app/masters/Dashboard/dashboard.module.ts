import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PowerbiComponent } from './powerbi/powerbi.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', redirectTo: 'powerbi', pathMatch: 'full'
  },
  {
    path: 'powerbi', component: PowerbiComponent
  }
]

@NgModule({
  declarations: [PowerbiComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }
