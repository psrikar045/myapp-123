import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

// Feature Components
import { DeveloperComponent } from './developer.component';

// Routing
import { DeveloperRoutingModule } from './developer-routing.module';

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
    DeveloperRoutingModule,
    
    // Import standalone components
    DeveloperComponent
  ],
  providers: [
    // Add developer-related services
  ]
})
export class DeveloperModule { }