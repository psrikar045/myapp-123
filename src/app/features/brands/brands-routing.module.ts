import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { AllCategoriesComponent } from './all-categories/all-categories.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { CompanyDataComponent } from './company-data/company-data.component';
import { AccountHubComponent } from './account-hub/account-hub.component';
import { ApiKeyManagementComponent } from './account-hub/components/api-key-management/api-key-management.component';

// Guards
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      // New API Dashboard Routes
      {
        path: 'api-dashboard',
        loadComponent: () => import('./api-dashboard/api-dashboard.component').then(m => m.ApiDashboardComponent),
        title: 'API Dashboard - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: 'api-dashboard/api-keys/create',
        loadComponent: () => import('./api-dashboard/components/create-api-key/create-api-key.component').then(m => m.CreateApiKeyComponent),
        title: 'Create API Key - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: 'api-dashboard/api-keys/manage',
        loadComponent: () => import('./account-hub/components/api-key-management/api-key-management.component').then(m => m.ApiKeyManagementComponent),
        title: 'API Key Management - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: 'api-dashboard/api-keys/:id',
        loadComponent: () => import('./account-hub/components/api-key-details/api-key-details.component').then(m => m.ApiKeyDetailsComponent),
        title: 'API Key Details - RIVO9',
        canActivate: [authGuard]
      },
      // Legacy Account Hub Routes (keep for backward compatibility)
      {
        path: 'account-hub',
        component: AccountHubComponent,
        title: 'Account Hub - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: 'account-hub/api-keys/manage',
        component: ApiKeyManagementComponent,
        title: 'API Key Management - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: 'account-hub/api-keys/create',
        loadComponent: () => import('./account-hub/components/create-api-key/create-api-key.component').then(m => m.CreateApiKeyComponent),
        title: 'Create API Key - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: 'account-hub/api-keys/:id',
        loadComponent: () => import('./account-hub/components/api-key-details/api-key-details.component').then(m => m.ApiKeyDetailsComponent),
        title: 'API Key Details - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: 'categories',
        component: AllCategoriesComponent,
        title: 'Browse Categories - RIVO9'
      },
      {
        path: 'category/:id',
        component: CategoryListComponent,
        title: 'Category - RIVO9'
      },
      {
        path: 'company/:domain',
        component: CompanyDataComponent,
        title: 'Company Data - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: '',
        redirectTo: 'categories',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BrandsRoutingModule { }