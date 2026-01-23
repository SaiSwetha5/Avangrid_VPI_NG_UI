import { Routes } from '@angular/router';
import { VpiTableComponent } from './vpi-table/vpi-table.component';
import { MsalGuard } from '@azure/msal-angular';
import { VpiDashboardComponent } from './vpi-dashboard/vpi-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'vpi', component: VpiTableComponent },
  { path: 'home', component: VpiDashboardComponent, canActivate: [MsalGuard] },
 ];