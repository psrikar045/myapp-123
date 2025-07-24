import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';

// Guards
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// Standalone Components (for routes that don't need modules)
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { HomePageComponent } from './features/home/home-page.component';
import { MyProfileComponent } from './features/profile/my-profile/my-profile.component';
import { CompanyDataComponent } from './features/brands/company-data/company-data.component';
import { SearchApiComponent } from './features/search/search-api/search-api.component';
import { LogoLinkComponent } from './features/logo-link/logo-link.component';
import { AllCategoriesComponent } from './features/brands/all-categories/all-categories.component';
import { CategoryListComponent } from './features/brands/category-list/category-list.component';
import { BlogComponent } from './features/blog/blog.component';
import { PricingPlansComponent } from './features/pricing/pricing-plans/pricing-plans.component';
import { DeveloperComponent } from './features/developer/developer.component';
import { BlogDetailsComponent } from './features/blog/blog-details/blog-details.component';

const routes: Routes = [
  // 1. Redirect root path to landing
  {
    path: '',
    redirectTo: '/landing',
    pathMatch: 'full'
  },

  // 2. Lazy Loaded Feature Modules
  {
    path: 'landing',
    loadChildren: () => import('./features/landing/landing.module').then(m => m.LandingModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'brands',
    loadChildren: () => import('./features/brands/brands.module').then(m => m.BrandsModule)
  },
  {
    path: 'pricing',
    loadChildren: () => import('./features/pricing/pricing.module').then(m => m.PricingModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'blog',
    loadChildren: () => import('./features/blog/blog.module').then(m => m.BlogModule)
  },
  {
    path: 'developer',
    loadChildren: () => import('./features/developer/developer.module').then(m => m.DeveloperModule)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },

  // 3. Direct Routes (for components that don't need feature modules yet)
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ResetPasswordComponent
  },
  {
    path: 'search-view/:brand',
    loadChildren: () => import('./features/search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'logo-link',
    component: LogoLinkComponent,
    canActivate: [authGuard]
  },
  {
    path: 'search-api',
    component: SearchApiComponent,
    canActivate: [authGuard]
  },
  {
    path: 'all-categories',
    component: AllCategoriesComponent
  },
  {
    path: 'pricing-plans',
    component: PricingPlansComponent
  },
  {
    path: 'category-list/:subcategory',
    component: CategoryListComponent
  },
  {
    path: 'blog-page',
    component: BlogComponent
  },
  {
    path: 'blog-details/:id',
    component: BlogDetailsComponent
  },

  // 4. Protected Routes
  {
    path: 'home',
    component: HomePageComponent,
    canActivate: [authGuard]
  },
  {
    path: 'developer',
    component: DeveloperComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'my-profile',
    component: MyProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'brandApi',
    component: CompanyDataComponent,
    canActivate: [authGuard]
  },

  // 5. Wildcard Route (Must be the last route!)
  {
    path: '**',
    redirectTo: '/landing'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // Enable router preloading for better performance
    preloadingStrategy: PreloadAllModules,
    
    // Enable tracing for debugging (disable in production)
    enableTracing: false,
    
    // Scroll to top on route change
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }