import { Routes } from '@angular/router';
import {UserComponent} from './user/user.component';
import {RegisterComponent} from './user/register/register.component';
import {HomeComponent} from './home/home.component';

export const routes: Routes = [
  // Login
  { path: '', redirectTo: '/register', pathMatch: 'full' }, // Redirige a la página de register por defecto
  { path: 'register', component: RegisterComponent }, // Ruta para el register

  { path: 'login', component: UserComponent }, // Ruta para el login
  { path: '**', redirectTo: '/login' },

  { path: 'home', component: HomeComponent },
  { path: '**', redirectTo: '/home' }
];
