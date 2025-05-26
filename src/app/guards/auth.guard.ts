// src/app/guards/auth.guard.ts
import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private router = inject(Router);

  canActivate():
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    if (this.auth.isAuthenticated()) {
      return true;
    }
    // si no está logueado, le mandamos al login
    return this.router.createUrlTree(['/login']);
  }
}
