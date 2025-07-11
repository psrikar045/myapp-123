import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard'; // Import functional roleGuard
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component'; // Import DashboardComponent
import { authGuard } from './core/guards/auth.guard'; // Import functional authGuard
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent // Using direct component since it's likely already loaded or handled by standalone imports
  },
  {
    path: 'forgot-password',
    component: ResetPasswordComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard] // Protect this route with the functional auth guard
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard], // Use functional roleGuard
    loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule)
  },
  {
    path: '',
    redirectTo: '/login', // Default route redirects to login
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login' // Wildcard route for any other invalid URL
  }
];
