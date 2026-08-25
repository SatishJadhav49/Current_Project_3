import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlantloginComponent } from './authentication/plantlogin/plantlogin.component';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApirequestService } from './shared/services/apirequest.service';
import { AppConfig } from './appConfig';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthguardComponent } from './authentication/authguard/authguard.component';
import { NotaccessComponent } from './shared/components/notaccess/notaccess.component';
import { DatePipe } from '@angular/common';
import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { NointernetconnectionComponent } from './shared/components/nointernetconnection/nointernetconnection.component';
 
@NgModule({
  declarations: [
    AppComponent,
    PlantloginComponent,
    AuthguardComponent,
    NotaccessComponent,
    NotfoundComponent,
    NointernetconnectionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    // ToastrModule.forRoot({ positionClass: 'toast-center-center' }),
    ToastrModule.forRoot({ positionClass: 'toast-bottom-right' }),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    LoadingBarRouterModule,
  ],
  providers: [AppConfig, ApirequestService, DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule { }
