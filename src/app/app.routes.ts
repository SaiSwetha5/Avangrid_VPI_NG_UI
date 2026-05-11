import { Routes } from '@angular/router';
import { VpiTableComponent } from './vpi-table/vpi-table.component';
import { MsalGuard } from '@azure/msal-angular';
import { VpiDashboardComponent } from './vpi-dashboard/vpi-dashboard.component';
import { ErrorComponent } from './error/error.component';
import { authGuard } from 'services/auth.guard';
 
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'vpi', component: VpiTableComponent , canActivate: [authGuard] },
  { path: 'home', component: VpiDashboardComponent, canActivate: [MsalGuard] },
  { path: 'error', component: ErrorComponent },
 ];