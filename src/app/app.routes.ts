import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';

// Direct imports for components that are not in modules
import { LandingPageComponent } from './features/landing/landing-page/landing-page.component';
import { HomePageComponent } from './features/home/home-page.component';
import { LogoLinkComponent } from './features/logo-link/logo-link.component';
import { CompanyDataComponent } from './features/brands/company-data/company-data.component';

export const routes: Routes = [
  // 1. Root redirect
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },

  // 2. Public Routes
  {
    path: 'landing',
    component: LandingPageComponent,
    title: 'Welcome to Marketify'
  },
  {
    path: 'home',
    component: HomePageComponent,
    title: 'Home - Marketify'
  },
  {
    path: 'logo-link',
    component: LogoLinkComponent,
    canActivate: [authGuard],
    title: 'Logo Link - Marketify'
  },

  // 3. Feature Modules (Lazy Loaded)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    title: 'Authentication - Marketify'
  },
  {
    path: 'brandApi',
    component: CompanyDataComponent,
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivate: [authGuard],
    title: 'Dashboard - Marketify'
  },
  {
    path: 'brands',
    loadChildren: () => import('./features/brands/brands.module').then(m => m.BrandsModule),
    title: 'Brands - Marketify'
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule),
    title: 'Search - Marketify'
  },
  {
    path: 'blog',
    loadChildren: () => import('./features/blog/blog.module').then(m => m.BlogModule),
    title: 'Blog - Marketify'
  },
  {
    path: 'pricing',
    loadChildren: () => import('./features/pricing/pricing.module').then(m => m.PricingModule),
    title: 'Pricing - Marketify'
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule),
    canActivate: [authGuard],
    title: 'Profile - Marketify'
  },
  {
    path: 'developer',
    loadChildren: () => import('./features/developer/developer.module').then(m => m.DeveloperModule),
    canActivate: [authGuard],
    title: 'Developer - Marketify'
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [authGuard, roleGuard],
    title: 'Admin - Marketify'
  },

  // 4. Legacy route redirects (for backward compatibility)
  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'forgot-password', redirectTo: '/auth/forgot-password', pathMatch: 'full' },
  { path: 'all-categories', redirectTo: '/brands/categories', pathMatch: 'full' },
  { path: 'category-list/:subcategory', redirectTo: '/brands/category/:subcategory', pathMatch: 'full' },
  { path: 'my-profile', redirectTo: '/profile', pathMatch: 'full' },
  { path: 'brandApi', redirectTo: '/brands/company/:domain', pathMatch: 'full' },
  { path: 'search-view/:brand', redirectTo: '/search/view/:brand', pathMatch: 'full' },
  { path: 'search-api', redirectTo: '/search/api', pathMatch: 'full' },
  { path: 'blog-details/:id', redirectTo: '/blog/:id', pathMatch: 'full' },
  { path: 'blog-details', redirectTo: '/blog', pathMatch: 'full' },

  // 5. Wildcard Route (Must be last!)
  {
    path: '**',
    redirectTo: '/landing'
  }
];
