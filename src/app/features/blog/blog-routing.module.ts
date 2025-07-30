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
        title: 'Blog - RIVO9'
      },
      {
        path: ':id',
        component: BlogDetailsComponent,
        title: 'Blog Post - RIVO9'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }