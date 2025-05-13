import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strMealThumb: string;
  // …otros campos
}

export interface MealDBResponse {
  meals: Meal[] | null;
}

@Injectable({ providedIn: 'root' })
export class MealDbService {
  private apiUrl = 'https://www.themealdb.com/api/json/v1/1';

  constructor(private http: HttpClient) {}

  /** Busca recetas por texto libre */
  searchMeals(query: string): Observable<MealDBResponse> {
    return this.http.get<MealDBResponse>(`${this.apiUrl}/search.php`, {
      params: new HttpParams().set('s', query)
    });
  }

  /** Filtra recetas que contienen un ingrediente */
  filterByIngredient(ingredient: string): Observable<MealDBResponse> {
    return this.http.get<MealDBResponse>(`${this.apiUrl}/filter.php`, {
      params: new HttpParams().set('i', ingredient)
    });
  }

  /** Filtra recetas por categoría */
  filterByCategory(category: string): Observable<MealDBResponse> {
    return this.http.get<MealDBResponse>(`${this.apiUrl}/filter.php`, {
      params: new HttpParams().set('c', category)
    });
  }
}
