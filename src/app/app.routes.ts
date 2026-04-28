import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { ScheduleViewerComponent } from './components/schedule-viewer/schedule-viewer';

export const routes: Routes = [
  { 
    path: '', 
    component: DashboardComponent,
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  { 
    path: 'viewer', 
    component: ScheduleViewerComponent 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];