import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

// Feature Components
import { MyProfileComponent } from './my-profile/my-profile.component';

// Routing
import { ProfileRoutingModule } from './profile-routing.module';

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
    ProfileRoutingModule,
    
    // Import standalone components
    MyProfileComponent
  ],
  providers: [
    // Add profile-related services
  ]
})
export class ProfileModule { }