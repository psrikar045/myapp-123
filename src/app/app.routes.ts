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
import { MyProfileComponent } from './features/my-profile/my-profile.component';
import { CompanyDataComponent } from './features/company-data/company-data.component';
import { SearchApiComponent } from './features/search-api/search-api.component';
import { LogoLinkComponent } from './features/logo-link/logo-link.component';
import { AllCategoriesComponent } from './features/all-categories/all-categories.component';
import { CategoryListComponent } from './features/category-list/category-list.component';
import { BlogComponent } from './features/blog/blog.component';
import { PricingPlansComponent } from './features/pricing-plans/pricing-plans.component';
import { BlogDetailsComponent } from './features/blog-details/blog-details.component';
// import { DeveloperComponent } from './features/developer/developer.component';

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
    path: 'pricing',
    component: PricingPlansComponent
  },
  {
    path: 'category-list/:subcategory',
    component: CategoryListComponent
  },
  {
    path: 'blog',
    component: BlogComponent
  },
  
  {
    path: 'blog-details/:id',
    component: BlogDetailsComponent
  },
  // {
  //   path: 'developer',
  //   component: DeveloperComponent
  // },

  // 4. Protected Routes
  {
    path: 'home',
    component: HomePageComponent,
    canActivate: [authGuard]
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
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    loadChildren: () => import('./features/admin/admin.module').then((m) => m.AdminModule)
  },

  // 5. Wildcard Route (Must be the last route!)
  //    Redirects any unmatched paths to the landing page.
  {
    path: '**',
    redirectTo: '/landing'
  }
  // Or, if you have a 404 Not Found component:
  // { path: '**', component: NotFoundComponent }
];
