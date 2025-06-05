import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interfaz que representa la configuración del usuario.
 */
export interface UserSettings {
  theme: 'light' | 'dark' | 'system'; // Tema de la aplicación: claro, oscuro o según el sistema.
  language: string;                   // Idioma preferido por el usuario (e.g. "en", "es").
  model: string;                      // Modelo o plantilla de configuración (personalizado según la app).
  notifications: boolean;             // Si el usuario permite notificaciones.
}

/**
 * Servicio encargado de manejar las configuraciones del usuario, como tema, idioma,
 * modelo preferido y notificaciones. Se comunica con un backend RESTful para obtener
 * y actualizar la configuración.
 */
@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  /** URL base de la API para las configuraciones de usuario */
  private API_URL = 'http://localhost:5000/api/user';

  /**
   * Constructor del servicio.
   * @param http Cliente HTTP de Angular para realizar peticiones HTTP al backend.
   */
  constructor(private http: HttpClient) {}

  /**
   * Genera los encabezados HTTP necesarios para autenticar las solicitudes.
   * @returns `HttpHeaders` con el token de autorización incluido.
   */
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || ''; // Extrae el token del `localStorage`
    return new HttpHeaders({
      'Content-Type': 'application/json',          // La solicitud maneja datos JSON
      Authorization: `Bearer ${token}`            // Token de autenticación
    });
  }

  /**
   * Recupera la configuración del usuario desde el backend.
   * @returns Un `Observable` que emite un objeto `UserSettings` con la configuración actual del usuario.
   */
  getSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(
      `${this.API_URL}/settings`,              // Endpoint para obtener configuraciones
      { headers: this.authHeaders() }          // Incluye encabezados con autenticación
    );
  }

  /**
   * Actualiza parcialmente la configuración del usuario en el backend.
   * @param settings Objeto que contiene las configuraciones a actualizar.
   *                 Solo se envían las propiedades cambiadas (`Partial<UserSettings>`).
   * @returns Un `Observable` que emite el objeto `UserSettings` actualizado.
   */
  updateSettings(settings: Partial<UserSettings>): Observable<UserSettings> {
    return this.http.put<UserSettings>(
      `${this.API_URL}/settings`,              // Endpoint para actualizar configuraciones
      settings,                                // Configuraciones nuevas/parciales
      { headers: this.authHeaders() }          // Incluye encabezados con autenticación
    );
  }
}
