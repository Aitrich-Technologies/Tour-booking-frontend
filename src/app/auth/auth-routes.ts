import { Routes } from '@angular/router';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const AUTH_ROUTES: Routes = [
  { 
    path: 'signup', 
    loadComponent: () => import('./signup/signup.component').then(m => m.SignupComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
    { path: 'reset-password', component: ResetPasswordComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' }
];