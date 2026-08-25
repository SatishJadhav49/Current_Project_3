import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateroleComponent } from './createrole/createrole.component';
import { CreateuserComponent } from './createuser/createuser.component';
import { UsertoroleComponent } from './usertorole/usertorole.component';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MaterialModule } from 'src/app/shared/modules/material.module';

const routes: Routes = [
  { path: 'createuser', component: CreateuserComponent },
  { path: 'createrole', component: CreateroleComponent },
  { path: 'usertorole', component: UsertoroleComponent },
];

@NgModule({
  declarations: [CreateroleComponent, CreateuserComponent, UsertoroleComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    NgxSkeletonLoaderModule,
  ],
})
export class UserModule {}
