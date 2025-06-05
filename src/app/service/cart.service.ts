// ===============================================================================
// Servicio: CartService
// ===============================================================================

// Este servicio ofrece funcionalidades para administrar un carrito de compras.
// Permite agregar elementos al carrito, obtener la lista de elementos añadidos
// y vaciar el carrito.

// -------------------------------------------------------------------------------
// Importaciones
// -------------------------------------------------------------------------------

import { Injectable } from '@angular/core';        // Decorador para marcar el servicio como inyectable.
import { Meal } from './recipes.service';         // Interfaz que representa una receta/meal (importada desde otro archivo).

// -------------------------------------------------------------------------------
// Interfaces
// -------------------------------------------------------------------------------

/**
 * Interfaz `CartItem`:
 * Representa un elemento que se guarda en el carrito.
 * - `meal`: Información del producto (del tipo `Meal`).
 * - `quantity`: Cantidad del producto seleccionado.
 * - `price`: Precio individual del producto.
 */
export interface CartItem {
  meal: Meal;          // Información del producto.
  quantity: number;    // Cantidad seleccionada.
  price: number;       // Precio unitario.
}

// -------------------------------------------------------------------------------
// Decorador @Injectable
// -------------------------------------------------------------------------------

@Injectable({
  providedIn: 'root', // Hace el servicio disponible en toda la aplicación.
})

// -------------------------------------------------------------------------------
// Clase: CartService
// -------------------------------------------------------------------------------

export class CartService {
  // ---------------------------------------------------------------------------
  // Propiedades
  // ---------------------------------------------------------------------------

  private items: CartItem[] = []; // Lista de elementos actualmente en el carrito.

  // ---------------------------------------------------------------------------
  // Métodos Públicos
  // ---------------------------------------------------------------------------

  /**
   * Método `addToCart`:
   * Agrega un elemento al carrito. Si el producto ya existe en el carrito,
   * simplemente incrementa su cantidad.
   * @param item Objeto del tipo `CartItem` que representa un producto a añadir.
   */
  addToCart(item: CartItem) {
    // Busca si el producto ya está en el carrito.
    const existing = this.items.find(i => i.meal.idMeal === item.meal.idMeal);

    if (existing) {
      // Si existe, incrementa la cantidad del producto.
      existing.quantity += item.quantity;
    } else {
      // Si no existe, lo añade como un nuevo elemento.
      this.items.push({ ...item });
    }
  }

  /**
   * Método `getItems`:
   * Obtiene la lista de elementos actualmente en el carrito.
   * @returns Un arreglo con los elementos del tipo `CartItem`.
   */
  getItems(): CartItem[] {
    return this.items;
  }

  /**
   * Método `clearCart`:
   * Limpia el carrito eliminando todos los elementos almacenados.
   */
  clearCart() {
    this.items = [];
  }
}
