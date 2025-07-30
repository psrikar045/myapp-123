import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { DeveloperComponent } from './developer.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        component: DeveloperComponent,
        title: 'Developer Tools - RIVO9'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeveloperRoutingModule { }