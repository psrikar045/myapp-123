import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

// Feature Components
import { AllCategoriesComponent } from './all-categories/all-categories.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { CompanyDataComponent } from './company-data/company-data.component';
import { AccountHubComponent } from './account-hub/account-hub.component';
import { ApiKeyManagementComponent } from './account-hub/components/api-key-management/api-key-management.component';
import { LoadingSpinnerComponent } from './account-hub/components/loading-spinner/loading-spinner.component';
import { ErrorDisplayComponent } from './account-hub/components/error-display/error-display.component';

// Feature Services
import { BrandApiService } from '../../shared/services/brand-api.service';

// Routing
import { BrandsRoutingModule } from './brands-routing.module';

@NgModule({
  declarations: [
    // Only declare non-standalone components here
    // AccountHubComponent is now standalone, so it's imported below
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    BrandsRoutingModule,
    
    // Import standalone components
    AccountHubComponent,
    AllCategoriesComponent,
    CategoryListComponent,
    CompanyDataComponent,
    ApiKeyManagementComponent,
    LoadingSpinnerComponent,
    ErrorDisplayComponent
  ],
  providers: [
    BrandApiService
  ]
})
export class BrandsModule { }