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