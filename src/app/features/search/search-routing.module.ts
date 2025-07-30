import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { SearchComponent } from './search/search.component';
import { SearchViewComponent } from './search-view/search-view/search-view.component';
import { SearchApiComponent } from './search-api/search-api.component';

// Guards
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: SearchComponent,
        title: 'Search - RIVO9'
      },
      {
        path: 'view/:brand',
        component: SearchViewComponent,
        title: 'Search Results - RIVO9',
        canActivate: [authGuard]
      },
      {
        path: 'api',
        component: SearchApiComponent,
        title: 'Search API - RIVO9',
        canActivate: [authGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }