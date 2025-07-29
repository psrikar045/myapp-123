import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Feature Components
import { SearchComponent } from './search/search.component';
import { SearchViewComponent } from './search-view/search-view/search-view.component';
import { SearchApiComponent } from './search-api/search-api.component';

// Shared Module
import { SharedModule } from '../../shared/shared.module';
import { LayoutModule } from '../../layout/layout.module';

// Routing
import { SearchRoutingModule } from './search-routing.module';

@NgModule({
  declarations: [
    // Only declare non-standalone components here
  ],
  imports: [
    CommonModule,
    SharedModule,
    LayoutModule,
    SearchRoutingModule,
    
    // Import standalone components
    SearchComponent,
    SearchViewComponent,
    SearchApiComponent
  ],
  providers: [
    // Add search-related services
  ]
})
export class SearchModule { }