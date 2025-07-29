import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Routing
import { AuthRoutingModule } from './auth-routing.module';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

// Feature Components
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
  declarations: [
    // Only declare non-standalone components here
  ],
  imports: [
    CommonModule,
    SharedModule,
    AuthRoutingModule,
    
    // Import standalone components
    LoginComponent,
    ResetPasswordComponent
  ]
})
export class AuthModule {}
