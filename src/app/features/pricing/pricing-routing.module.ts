import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { PricingPlansComponent } from './pricing-plans/pricing-plans.component';
import { ChoosePlanComponent } from './choose-plan/choose-plan.component';
import { MyPlanComponent } from './my-plan/my-plan.component';

// Guards
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'plans',
        component: PricingPlansComponent,
        title: 'Pricing Plans - RIVO9'
      },
      {
        path: 'choose',
        component: ChoosePlanComponent,
        title: 'Choose Plan - RIVO9'
      },
      {
        path: 'my-plan',
        component: MyPlanComponent,
        title: 'My Plan - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: '',
        redirectTo: 'plans',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PricingRoutingModule { }