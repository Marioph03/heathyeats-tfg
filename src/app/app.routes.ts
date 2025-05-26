import { Routes } from '@angular/router';
import {UserComponent} from './user/user.component';
import {RegisterComponent} from './user/register/register.component';
import {HomeComponent} from './home/home.component';
import {MenuListComponent} from './menu-list/menu-list.component';
import {PlanPersonalizadoComponent} from './personalized-plan/personalized-plan.component';
import {PurchaseComponent} from './purchase/purchase.component';
import {premiumGuard} from './guards/premium.guard';
import {PremiumFeaturesComponent} from './premium-feature/premium-feature.component';
import {ProfileComponent} from './profile/profile.component';
import {SettingsComponent} from './settings/settings.component';
import {AuthGuard} from './guards/auth.guard';
import {CartComponent} from './cart/cart.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent },
  { path: 'login',    component: UserComponent },
  { path: 'home',     component: HomeComponent },
  { path: 'menu',     component: MenuListComponent},
  { path: 'planes', component: PlanPersonalizadoComponent },
  { path: 'premium/plans', component: PurchaseComponent },
  { path: 'carrito', component: CartComponent },
  {
    path: 'premium/features',
    component: PremiumFeaturesComponent,
    canActivate: [premiumGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },

  // Finalmente, un solo comodín para rutas no encontradas:
  { path: '**',      redirectTo: '/login' }
];
