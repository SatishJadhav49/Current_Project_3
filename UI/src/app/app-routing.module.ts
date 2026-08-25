import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlantloginComponent } from './authentication/plantlogin/plantlogin.component';
import { AuthguardComponent } from './authentication/authguard/authguard.component';
import { NotaccessComponent } from './shared/components/notaccess/notaccess.component';
import { NotfoundComponent } from './shared/components/notfound/notfound.component';
import { NointernetconnectionComponent } from './shared/components/nointernetconnection/nointernetconnection.component';

const routes: Routes = [
  {
    path: 'NotAccess',
    component: NotaccessComponent,
  },
  { path: '', component: AuthguardComponent },
  {
    path: 'plantlogin',
    component: PlantloginComponent,
  },
  {
    path: 'nointernet',
    component: NointernetconnectionComponent,
  },
  {
    path: 'configmaster',
    loadChildren: () =>import('./shared/config/config.module').then((m)=>m.ConfigModule)
  },
  {
    path: '**',
    component: NotfoundComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
