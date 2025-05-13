import { Routes } from '@angular/router';
import {UserComponent} from './user/user.component';
import {RegisterComponent} from './user/register/register.component';
import {HomeComponent} from './home/home.component';
import {MenuListComponent} from './menu-list/menu-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login',    component: UserComponent },
  { path: 'home',     component: HomeComponent },
  { path: 'menu',     component: MenuListComponent},

  // Finalmente, un solo comodín para rutas no encontradas:
  { path: '**',      redirectTo: '/login' }
];
