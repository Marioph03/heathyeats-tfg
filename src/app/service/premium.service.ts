import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

/** Interfaz para representar un plan de suscripción */
export interface SubscriptionPlan {
  id: string;          // Identificador único del plan
  name: string;        // Nombre del plan de suscripción
  price: number;       // Precio del plan
  benefits: string[];  // Lista de beneficios incluidos en el plan
}

/** Interfaz para representar el estado del usuario */
export interface UserStatus {
  premium: boolean;    // Indica si el usuario tiene suscripción premium
  plan?: string;       // Nombre del plan actual del usuario (opcional)
}

/**
 * Servicio encargado de manejar las suscripciones premium
 * y de interactuar con el backend para consultar planes,
 * realizar compras y verificar el estado del usuario.
 */
@Injectable({ providedIn: 'root' })
export class PremiumService {
  /** URL base para las solicitudes al backend */
  private API_URL = 'http://localhost:5000/api';

  /**
   * `BehaviorSubject` que almacena el estado premium del usuario.
   * Se inicializa con `false`.
   */
  private isPremiumSubject = new BehaviorSubject<boolean>(false);

  /**
   * Observable que permite a otros componentes observar el estado premium
   * en tiempo real. Expone el estado de `isPremiumSubject`.
   */
  public isPremium$ = this.isPremiumSubject.asObservable();

  /**
   * Constructor del servicio.
   * @param http Cliente HTTP para realizar solicitudes al backend.
   */
  constructor(private http: HttpClient) {
    // Verifica el estado del usuario al inicializar el servicio.
    this.loadStatus();
  }

  /**
   * Consulta el backend al iniciar la aplicación para determinar
   * si el usuario tiene una suscripción premium. Si ocurre un error
   * o no hay token, asume que el usuario no es premium.
   */
  loadStatus() {
    // Verifica si existe un token de acceso en el localStorage
    if (localStorage.getItem('access_token')) {
      this.getUserStatus().subscribe({
        // Si la solicitud es exitosa, actualiza el estado premium
        next: ({ premium }) => this.isPremiumSubject.next(premium),
        // Si falla, establece el estado premium como falso
        error: () => this.isPremiumSubject.next(false)
      });
    }
  }

  /**
   * Consulta los planes de suscripción disponibles desde el backend.
   * @returns Observable que emite un array de planos de suscripción.
   */
  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.API_URL}/plans`);
  }

  /**
   * Realiza la compra de un plan de suscripción específico.
   * @param planId Identificador del plan a comprar.
   * @returns Observable que emite la respuesta de la solicitud.
   */
  purchasePlan(planId: string): Observable<any> {
    // Establece los headers necesarios para autenticar la solicitud
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    });

    // Envia la solicitud POST con el ID del plan
    return this.http
      .post(`${this.API_URL}/purchase`, { plan: planId }, { headers })
      .pipe(
        tap(() => {
          // Actualiza el estado premium si la compra es exitosa
          this.isPremiumSubject.next(true);
        })
      );
  }

  /**
   * Consulta el estado del usuario respecto a su suscripción premium.
   * @returns Observable que emite el estado del usuario (UserStatus).
   */
  getUserStatus(): Observable<UserStatus> {
    // Obtiene el token de acceso almacenado
    const token = localStorage.getItem('access_token');

    // Configura los headers necesarios para autenticar la solicitud
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });

    // Realiza la solicitud GET al endpoint del estado del usuario
    return this.http.get<UserStatus>(
      `${this.API_URL}/user/status`,
      { headers, withCredentials: false }
    );
  }
}
