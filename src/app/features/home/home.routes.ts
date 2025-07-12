import { Routes } from '@angular/router';
import { HomePageComponent } from './home-page.component';
import { authGuard } from '../../core/guards/auth.guard';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomePageComponent,
    canActivate: [authGuard]
  }
];
