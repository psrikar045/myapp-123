import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';

export const routes: Routes = [
  {
    path: 'login',
    // Assuming LoginComponent is standalone and you want to lazy load it directly
    loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
    // If AuthModule still exists and LoginComponent is part of it, and you want to keep AuthModule:
    // loadChildren: () => import('./features/auth/auth.module').then((m) => m.AuthModule)
  },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.module').then((m) => m.DashboardModule)
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule)
  },
  {
    path: '', // Default route
    loadComponent: () => import('./features/landing/landing-page/landing-page.component').then(c => c.LandingPageComponent),
    pathMatch: 'full'
  },
  {
    // It's good practice to have a specific login route if your default is a landing page
    // And then redirect to dashboard or other protected areas after login.
    // The route for 'login' is already defined above.
    // The previous default redirectTo: 'dashboard' is now replaced by the LandingPageComponent.
    path: '**',
    // Option 1: Redirect to the new landing page for any unknown URL
    redirectTo: '',
    // Option 2: Or redirect to a dedicated NotFoundComponent if you have one
    // loadComponent: () => import('./core/components/not-found/not-found.component').then(c => c.NotFoundComponent)
    // Option 3: Or keep redirecting to dashboard (though landing page might be better for unknown URLs)
    // redirectTo: 'dashboard'
  }
];
