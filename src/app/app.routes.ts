import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { LandingPageComponent } from './features/landing/landing-page/landing-page.component'; // Added import

export const routes: Routes = [
  // 1. Redirect root path '' to '/home'
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },

  // 2. Public Route: Landing Page
  {
    path: 'home',
    component: LandingPageComponent
  },
  // Optional: path 'landing' also goes to LandingPageComponent
  // {
  //   path: 'landing',
  //   component: LandingPageComponent
  // },

  // 3. Public Routes: Login, Forgot Password
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ResetPasswordComponent
  },

  // 4. Protected Routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule)
  },

  // 5. Wildcard Route (Must be the last route!)
  //    Redirects any unmatched paths to the landing page.
  {
    path: '**',
    redirectTo: '/home'
  }
  // Or, if you have a 404 Not Found component:
  // { path: '**', component: NotFoundComponent }
];
