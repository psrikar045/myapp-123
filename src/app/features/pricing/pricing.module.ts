import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

// Feature Components
import { PricingPlansComponent } from './pricing-plans/pricing-plans.component';
import { ChoosePlanComponent } from './choose-plan/choose-plan.component';
import { MyPlanComponent } from './my-plan/my-plan.component';

// Routing
import { PricingRoutingModule } from './pricing-routing.module';

@NgModule({
  declarations: [
    // Only declare non-standalone components here
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    PricingRoutingModule,
    
    // Import standalone components
    PricingPlansComponent,
    ChoosePlanComponent,
    MyPlanComponent
  ],
  providers: [
    // Add pricing-related services
  ]
})
export class PricingModule { }