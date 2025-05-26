// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  full_name: string;
  rol: string;
  // añade aquí cualquier otro campo que devuelva tu API
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private API_URL = 'http://localhost:5000/api/user';

  constructor(private http: HttpClient) {}

  /** Construye los headers con el token */
  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  /** Obtiene el perfil del usuario autenticado */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(
      `${this.API_URL}/profile`,
      { headers: this.authHeaders() }
    );
  }

  /** Actualiza el perfil con los campos proporcionados */
  updateProfile(data: Partial<Omit<UserProfile, 'user_id'>>): Observable<UserProfile> {
    return this.http.put<UserProfile>(
      `${this.API_URL}/profile`,
      data,
      { headers: this.authHeaders() }
    );
  }
}
