import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/** Modelo de una receta */
export interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  // Campos dinámicos para pares ingrediente–cantidad
  [key: `strIngredient${number}`]: string | undefined;
  [key: `strMeasure${number}`]: string | undefined;
}

/** Forma en que la API devuelve un array de recetas */
export interface MealDBResponse {
  meals: Meal[] | null;
}

@Injectable({ providedIn: 'root' })
export class MealDbService {
  private apiUrl = 'https://www.themealdb.com/api/json/v1/1';

  constructor(private http: HttpClient) {}

  /** Busca recetas por texto libre */
  searchMeals(term: string): Observable<MealDBResponse> {
    return this.http.get<MealDBResponse>(
      `${this.apiUrl}/search.php`,
      { params: new HttpParams().set('s', term) }
    );
  }

  /** Filtra recetas por categoría */
  filterByCategory(category: string): Observable<MealDBResponse> {
    return this.http.get<MealDBResponse>(
      `${this.apiUrl}/filter.php`,
      { params: new HttpParams().set('c', category) }
    );
  }

  /** Obtiene la receta completa (array meals) */
  getMealById(id: string): Observable<MealDBResponse> {
    return this.http.get<MealDBResponse>(
      `${this.apiUrl}/lookup.php`,
      { params: new HttpParams().set('i', id) }
    );
  }

  /**
   * Conveniencia: extrae y devuelve directamente la primera receta
   * o lanza error si no existe.
   */
  getMealByIdSingle(id: string): Observable<Meal> {
    return this.getMealById(id).pipe(
      map(res => {
        const m = res.meals?.[0];
        if (!m) throw new Error(`Receta con id ${id} no encontrada`);
        return m;
      })
    );
  }

  getRecetasPorCategoria(categoria: string): Observable<Meal[]> {
    return this.http.get<any>(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`)
      .pipe(map(resp => resp.meals || []));
  }
}
