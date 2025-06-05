// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interfaz que representa el perfil del usuario.
 */
export interface UserProfile {
  user_id: number;     // ID único del usuario
  username: string;    // Nombre de usuario
  email: string;       // Correo electrónico del usuario
  full_name: string;   // Nombre completo del usuario
  rol: string;         // Rol o tipo del usuario (e.g., "admin", "user")
  // Otros campos adicionales devueltos por tu API se pueden añadir aquí.
}

/**
 * Servicio encargado de manejar las interacciones relacionadas
 * con el usuario, como obtener o actualizar su perfil.
 */
@Injectable({
  providedIn: 'root'
})
export class UserService {
  /** URL base de la API para los endpoints relacionados con el usuario */
  private API_URL = 'http://localhost:5000/api/user';

  /**
   * Constructor del servicio.
   * @param http El cliente HTTP de Angular utilizado para realizar solicitudes HTTP.
   */
  constructor(private http: HttpClient) {}

  /**
   * Genera los encabezados de autenticación para las solicitudes al backend.
   * Incluye el token almacenado en el `localStorage`.
   * @returns Un objeto de tipo `HttpHeaders` con las cabeceras configuradas.
   */
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || ''; // Obtiene el token JWT
    return new HttpHeaders({
      'Content-Type': 'application/json',  // Define el tipo de contenido como JSON
      'Authorization': `Bearer ${token}`  // Incluye el token en el encabezado "Authorization"
    });
  }

  /**
   * Obtiene el perfil del usuario autenticado desde el backend.
   * @returns Un `Observable` que emite un objeto `UserProfile` con los datos del perfil del usuario.
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(
      `${this.API_URL}/profile`,           // Endpoint para obtener el perfil
      { headers: this.authHeaders() }      // Agrega encabezados de autenticación
    );
  }

  /**
   * Actualiza el perfil del usuario autenticado con los datos proporcionados.
   * @param data Un objeto parcial con los campos a actualizar. El campo `user_id` no puede ser modificado.
   * @returns Un `Observable` que emite el objeto `UserProfile` actualizado.
   */
  updateProfile(data: Partial<Omit<UserProfile, 'user_id'>>): Observable<UserProfile> {
    return this.http.put<UserProfile>(
      `${this.API_URL}/profile`,           // Endpoint para la actualización del perfil
      data,                                // Los datos a actualizar
      { headers: this.authHeaders() }      // Agrega encabezados de autenticación
    );
  }
}
