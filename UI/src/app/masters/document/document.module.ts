import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagedocumentsComponent } from './managedocuments/managedocuments.component';
import { Route } from '@angular/router';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
const routes: Route[] = [
  {
    path: 'manage',
    component: ManagedocumentsComponent,
  }
];

@NgModule({
  declarations: [
    ManagedocumentsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class DocumentModule { }
