import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { BlogComponent } from './blog.component';
import { BlogDetailsComponent } from './blog-details/blog-details.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: BlogComponent,
        title: 'Blog - Marketify'
      },
      {
        path: ':id',
        component: BlogDetailsComponent,
        title: 'Blog Post - Marketify'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }