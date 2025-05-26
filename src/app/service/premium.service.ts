import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  benefits: string[];
}

export interface UserStatus {
  premium: boolean;
  plan?: string;
}

@Injectable({ providedIn: 'root' })
export class PremiumService {
  private API_URL = 'http://localhost:5000/api';

  // Estado interno premium
  private isPremiumSubject = new BehaviorSubject<boolean>(false);
  public isPremium$ = this.isPremiumSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStatus();
  }

  /** Al arrancar, consulta backend si este usuario es premium */
  loadStatus() {
    if (localStorage.getItem('access_token')) {
      this.getUserStatus().subscribe({
        next: ({ premium }) => this.isPremiumSubject.next(premium),
        error: () => this.isPremiumSubject.next(false)
      });
    }
  }

  getSubscriptionPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(`${this.API_URL}/plans`);
  }

  purchasePlan(planId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    });
    return this.http
      .post(`${this.API_URL}/purchase`, { plan: planId }, { headers })
      .pipe(
        tap(() => {
          // Marcamos premium inmediatamente al recibir OK
          this.isPremiumSubject.next(true);
        })
      );
  }

  getUserStatus(): Observable<UserStatus> {
    const token = localStorage.getItem('access_token');
    // Si usas headers en lugar de cookies:
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    });
    // Llamamos AL MISMO endpoint que definiste en Flask:
    return this.http.get<UserStatus>(
      `${this.API_URL}/user/status`,
      { headers, withCredentials: false }
    );
  }
}
