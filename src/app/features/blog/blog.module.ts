import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Shared Module
import { SharedModule } from '../../shared/shared.module';

// Feature Components
import { BlogComponent } from './blog.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';

// Feature Services
import { BlogService } from '../../shared/services/blog.service';

// Routing
import { BlogRoutingModule } from './blog-routing.module';

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
    BlogRoutingModule,
    
    // Import standalone components
    BlogComponent,
    BlogDetailsComponent
  ],
  providers: [
    BlogService
  ]
})
export class BlogModule { }