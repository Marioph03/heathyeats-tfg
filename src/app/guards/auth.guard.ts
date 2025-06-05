// ===============================================================================
// Guard: AuthGuard
// ===============================================================================

// Este guard se utiliza para proteger rutas en una aplicación Angular, asegurándose
// de que el usuario esté autenticado antes de permitir el acceso.
// Si el usuario no está autenticado, se le redirige a la página de inicio de sesión.

// -------------------------------------------------------------------------------
// Importaciones
// -------------------------------------------------------------------------------

import { Injectable, inject } from '@angular/core';        // Decorador Injectable e inyección de dependencias.
import { CanActivate, Router, UrlTree } from '@angular/router'; // Interfaces y clases para configuración de rutas.
import { Observable } from 'rxjs';                        // Para manejar observables en caso necesario.
import { AuthService } from '../service/auth.service';    // Servicio personalizado para manejar la autenticación.

// -------------------------------------------------------------------------------
// Decorador @Injectable
// -------------------------------------------------------------------------------

// Define que este servicio es inyectable y está disponible en el nivel raíz de la aplicación.
// Esto significa que la instancia de `AuthGuard` será única en toda la aplicación.

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  // ---------------------------------------------------------------------------
  // Dependencias inyectadas
  // ---------------------------------------------------------------------------

  private auth = inject(AuthService); // Inyección del servicio de autenticación.
  private router = inject(Router);    // Inyección del Router para las redirecciones.

  // ---------------------------------------------------------------------------
  // Método: canActivate
  // ---------------------------------------------------------------------------

  /**
   * Método implementado de la interfaz CanActivate.
   * Define si el usuario puede acceder a una ruta protegida.
   *
   * Return:
   * - `true`: Si el usuario está autenticado, lo que permite el acceso.
   * - `UrlTree`: Si no está autenticado, crea un redireccionamiento a la ruta `/login`.
   *
   * Compatible con:
   * - Booleano (`true`/`false`).
   * - `UrlTree` (para redirección automática).
   * - Observables o Promesas que resuelvan cualquiera de los tipos anteriores.
   */
  canActivate():
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    // Verifica si el usuario está autenticado a través del servicio `AuthService`.
    if (this.auth.isAuthenticated()) {
      return true; // Usuario autenticado: acceso permitido.
    }

    // Usuario no autenticado: se redirige a la página de inicio de sesión ('/login').
    return this.router.createUrlTree(['/login']);
  }
}
