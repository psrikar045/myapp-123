import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { ResetPasswordComponent } from './features/reset-password/reset-password.component';
import { LandingPageComponent } from './features/landing/landing-page/landing-page.component'; // Added import
import { SearchComponent } from './features/search/search/search.component';
import { SearchViewComponent } from './features/search-view/search-view/search-view.component';
import { HomePageComponent } from './features/home/home-page.component';

export const routes: Routes = [
  // 1. Redirect root path '' to '/login'
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },

  // 2. Public Route: Landing Page
  {
    path: 'landing',
    component: LandingPageComponent
  },

  // 3. Public Routes: Login, Forgot Password
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home',
    component: HomePageComponent,
    // canActivate: [authGuard]
  },
  {
    path: 'forgot-password',
    component: ResetPasswordComponent
  },
  {
    path: 'search',
    component: SearchComponent
  },
  {
    path: 'search-view/:brand',
    component: SearchViewComponent
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
