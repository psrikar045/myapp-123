import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Feature Components
import { LandingPageComponent } from './landing-page/landing-page.component';

// Shared Module
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule } from '../../layout/layout.module';

// Feature Routes
const routes = [
  {
    path: '',
    component: LandingPageComponent
  }
];

@NgModule({
  declarations: [
    // Only declare non-standalone components here
  ],
  imports: [
    CommonModule,
    SharedModule,
    LayoutModule,
    RouterModule.forChild(routes),
    
    // Import standalone components
    LandingPageComponent
  ],
  exports: [
    LandingPageComponent
  ]
})
export class LandingModule { }