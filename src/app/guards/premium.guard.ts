// ===============================================================================
// Guard: premiumGuard
// ===============================================================================

// Este guard verifica si el usuario tiene acceso premium antes de permitirle
// acceder a ciertas rutas protegidas. Si el usuario no posee una suscripción
// premium, será redirigido a la página de planes premium.

// -------------------------------------------------------------------------------
// Importaciones
// -------------------------------------------------------------------------------

import { inject } from '@angular/core';                      // Para inyectar dependencias en funciones.
import { CanActivateFn, Router, UrlTree } from '@angular/router'; // Interfaces y clases para proteger rutas y manejar redirecciones.
import { map } from 'rxjs/operators';                       // Operador de procesamiento de RxJS.
import { PremiumService } from '../service/premium.service'; // Servicio personalizado para manejar el estado de suscripción premium.

// -------------------------------------------------------------------------------
// Guard: premiumGuard
// -------------------------------------------------------------------------------

/**
 * Este guard usa una función como protector de rutas (`CanActivateFn`).
 * Implementa lógica reactiva para verificar si el usuario tiene una suscripción premium.
 *
 * Si el usuario tiene acceso premium, permite el acceso a la ruta (`true`).
 * De lo contrario, redirige al usuario a la página de planes premium (`/premium/plans`).
 */
export const premiumGuard: CanActivateFn = () => {
  // ---------------------------------------------------------------------------
  // Inyección de dependencias
  // ---------------------------------------------------------------------------

  const premiumService = inject(PremiumService); // Servicio para obtener el estado del usuario (premium o no).
  const router = inject(Router);                 // Se utiliza para redirigir a otra ruta si no cumple los requisitos.

  // ---------------------------------------------------------------------------
  // Lógica del guard
  // ---------------------------------------------------------------------------

  /**
   * Verifica si el usuario tiene acceso premium a través del servicio `PremiumService`.
   * El método `getUserStatus` devuelve un observable que emite el estado del usuario.
   * Se utiliza el operador `map` para procesar la respuesta:
   * - Si el usuario tiene acceso premium (`status.premium === true`), devuelve `true`.
   * - Si no es premium, devuelve un `UrlTree` para redirigir a `/premium/plans`.
   */
  return premiumService.getUserStatus().pipe(
    map(status => {
      if (status.premium) {           // Verifica si el usuario es premium.
        return true;                  // Permite acceso a la ruta protegida.
      }
      // Si no es premium, redirige al usuario a la página de planes premium.
      return router.createUrlTree(['/premium/plans']);
    })
  );
};
