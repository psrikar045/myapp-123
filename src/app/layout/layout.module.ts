import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Layout Components
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

// Shared Module
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    // Only declare non-standalone components here
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    
    // Import standalone layout components
    HeaderComponent,
    FooterComponent
  ],
  exports: [
    // Export layout components for use in other modules
    HeaderComponent,
    FooterComponent,
    // Export common modules
    CommonModule,
    RouterModule
  ]
})
export class LayoutModule { }