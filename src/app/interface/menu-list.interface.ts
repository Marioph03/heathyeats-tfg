// src/app/interfaces/menu-list.interface.ts
import { Recipe } from './menu-list.model';

export interface MenuListState {
  /** Lista de recetas obtenidas de la API */
  recipes: Recipe[];
  /** Indicador de carga mientras esperamos respuesta */
  loading: boolean;
  /** Mensaje de error si falla la petición */
  error: string;
}

export interface MenuListComponent {
  /** Estado interno del componente */
  state: MenuListState;

  /** Dispara la carga de menús */
  fetchMenus(): void;
}
