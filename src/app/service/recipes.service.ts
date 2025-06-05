import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

/** Modelo que representa una receta */
export interface Meal {
  idMeal: string;               // ID único de la receta
  strMeal: string;              // Nombre del plato
  strCategory: string;          // Categoría del plato (ejemplo: "Postre")
  strArea: string;              // Región/Cocina (ejemplo: "Mexicana")
  strInstructions: string;      // Instrucciones de preparación paso a paso
  strMealThumb: string;         // URL de la imagen del plato
  // Claves dinámicas para los pares ingrediente–cantidad
  [key: `strIngredient${number}`]: string | undefined; // Ingredientes numerados
  [key: `strMeasure${number}`]: string | undefined;    // Cantidades correspondientes
}

/** Modelo de respuesta de la API, que contiene las recetas */
export interface MealDBResponse {
  meals: Meal[] | null;         // Un array de recetas o `null` si no se encontraron
}

/**
 * Servicio que interactúa con la API de TheMealDB para recuperar recetas,
 * buscarlas y filtrarlas según categorías o IDs.
 */
@Injectable({ providedIn: 'root' })
export class MealDbService {
  /** URL base de la API de TheMealDB */
  private apiUrl = 'https://www.themealdb.com/api/json/v1/1';

  /**
   * Constructor del servicio.
   * @param http Cliente HTTP de Angular, utilizado para realizar las peticiones.
   */
  constructor(private http: HttpClient) {}

  /**
   * Busca recetas por texto libre.
   * @param term Palabra clave utilizada para buscar recetas.
   * @returns Un `Observable` que emite los resultados de la búsqueda (array de recetas o vacío).
   */
  searchMeals(term: string): Observable<MealDBResponse> {
    return this.http.get<MealDBResponse>(
      `${this.apiUrl}/search.php`,
      {
        params: new HttpParams().set('s', term) // Parámetro "s" para búsqueda por texto libre
      }
    );
  }

  /**
   * Filtra las recetas por categoría específica (ejemplo: "Postre").
   * @param category Categoría de recetas por la cual se desea filtrar.
   * @returns Un `Observable` que emite un array de recetas por la categoría dada.
   */
  filterByCategory(category: string): Observable<MealDBResponse> {
    return this.http.get<MealDBResponse>(
      `${this.apiUrl}/filter.php`,
      {
        params: new HttpParams().set('c', category) // Parámetro "c" para filtro de categoría
      }
    );
  }

  /**
   * Obtiene una receta completa dados su ID único.
   * @param id Identificador único de la receta.
   * @returns Un `Observable` que emite la receta completa (o un array vacío si no se encuentra).
   */
  getMealById(id: string): Observable<MealDBResponse> {
    return this.http.get<MealDBResponse>(
      `${this.apiUrl}/lookup.php`,
      {
        params: new HttpParams().set('i', id) // Parámetro "i" para búsqueda por ID
      }
    );
  }

  /**
   * Obtiene directamente la primera receta asociada al ID proporcionado.
   * @param id Identificador único de la receta.
   * @returns Un `Observable` que emite la receta (objeto `Meal`),
   *          o lanza un error si no se encuentra.
   */
  getMealByIdSingle(id: string): Observable<Meal> {
    return this.getMealById(id).pipe(
      map(res => {
        const m = res.meals?.[0]; // Obtiene la primera receta del resultado
        if (!m) throw new Error(`Receta con id ${id} no encontrada`); // Lanza error si no existe
        return m;
      })
    );
  }

  /**
   * Obtiene recetas por una categoría específica.
   * Es una variación del método `filterByCategory` que emite directamente
   * un array de objetos `Meal` (sin metadatos adicionales).
   * @param categoria Nombre de la categoría.
   * @returns Un `Observable` que emite un array de recetas de la categoría.
   */
  getRecetasPorCategoria(categoria: string): Observable<Meal[]> {
    return this.http.get<any>(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
    ).pipe(
      map(resp => resp.meals || []) // Devuelve el array de recetas o vacío si no hay resultados
    );
  }
}
