// ===============================================================================
// Componente: CartComponent
// ===============================================================================

// Este componente maneja la lógica y la presentación de un carrito de compras.
// Permite mostrar los ítems en el carrito, calcular el total y realizar la compra.

// -------------------------------------------------------------------------------
// Importaciones
// -------------------------------------------------------------------------------

import { Component } from '@angular/core';                         // Permite definir un componente Angular.
import { CartService, CartItem } from '../service/cart.service';  // Importa el servicio del carrito y el modelo que representa un ítem del carrito.
import Swal from 'sweetalert2';                                   // Biblioteca para mostrar alertas personalizadas.
import { DecimalPipe, NgForOf, NgIf } from '@angular/common';     // Pipes y directivas usadas en la plantilla HTML.

// -------------------------------------------------------------------------------
// Decorador @Component
// -------------------------------------------------------------------------------

// Define las configuraciones del componente:
// - selector: Nombre del selector HTML para este componente.
// - imports: Lista de pipes y directivas necesarias en la plantilla.
// - templateUrl: Ruta del archivo de plantilla HTML asociada al componente.

@Component({
  selector: 'app-cart',            // Selector utilizado para insertar este componente.
  imports: [                       // Pipes y directivas que el componente usará en su HTML.
    DecimalPipe,
    NgIf,
    NgForOf
  ],
  templateUrl: './cart.component.html' // Ruta del archivo de plantilla HTML.
})
export class CartComponent {
  // ---------------------------------------------------------------------------
  // Propiedades
  // ---------------------------------------------------------------------------

  items: CartItem[] = [];  // Lista de ítems en el carrito. Cada ítem sigue la estructura del modelo `CartItem`.

  // ---------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------

  constructor(private cartSv: CartService) {
    // Inicialización:
    // - Obtiene los ítems existentes en el carrito desde el servicio `CartService`.
    this.items = this.cartSv.getItems();
  }

  // ---------------------------------------------------------------------------
  // Propiedades Calculadas
  // ---------------------------------------------------------------------------

  // Getter: Calcula el total del carrito.
  // - Suma el precio de cada ítem multiplicado por su cantidad.
  get total() {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  // ---------------------------------------------------------------------------
  // Métodos
  // ---------------------------------------------------------------------------

  // Método: purchase
  // Maneja la compra de los ítems en el carrito.
  // - En escenarios reales, haría una llamada a una API para procesar la compra.
  // - Muestra una alerta de éxito con el total de la compra utilizando SweetAlert2.
  // - Limpia el carrito usando el servicio `CartService` y vacía la lista de ítems en el componente.
  purchase() {
    Swal.fire({
      icon: 'success',                                       // Icono de éxito.
      title: '¡Compra realizada!',                           // Título de la alerta.
      text: `Total: €${this.total.toFixed(2)}`,              // Muestra el total del carrito formateado a 2 decimales.
    });

    this.cartSv.clearCart();  // Limpia el carrito usando el servicio.
    this.items = [];          // Limpia los ítems locales en el componente.
  }
}
