import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  model: string;
  notifications: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private API_URL = 'http://localhost:5000/api/user';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
  }

  getSettings(): Observable<UserSettings> {
    return this.http.get<UserSettings>(
      `${this.API_URL}/settings`,
      { headers: this.authHeaders() }
    );
  }

  updateSettings(settings: Partial<UserSettings>): Observable<UserSettings> {
    return this.http.put<UserSettings>(
      `${this.API_URL}/settings`,
      settings,
      { headers: this.authHeaders() }
    );
  }
}
