import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { AllCategoriesComponent } from './all-categories/all-categories.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { CompanyDataComponent } from './company-data/company-data.component';

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
        path: 'api-dashboard/api-keys/list',
        loadComponent: () => import('./api-dashboard/components/api-keys-list/api-keys-list.component').then(m => m.ApiKeysListComponent),
        title: 'All API Keys - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: 'api-dashboard/api-keys/manage',
        loadComponent: () => import('./api-dashboard/components/api-keys-list/api-keys-list.component').then(m => m.ApiKeysListComponent),
        title: 'API Key Management - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: 'api-dashboard/api-keys/:id',
        loadComponent: () => import('./api-dashboard/components/domain-api-keys/domain-api-keys.component').then(m => m.DomainApiKeysComponent),
        title: 'Domain API Keys - RIVO9',
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