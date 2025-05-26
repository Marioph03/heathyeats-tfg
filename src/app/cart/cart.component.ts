// cart.component.ts
import { Component } from '@angular/core';
import { CartService, CartItem } from '../service/cart.service';
import Swal from 'sweetalert2';
import {DecimalPipe, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-cart',
  imports: [
    DecimalPipe,
    NgIf,
    NgForOf
  ],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  items: CartItem[] = [];

  constructor(private cartSv: CartService) {
    this.items = this.cartSv.getItems();
  }

  get total() {
    return this.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  }

  purchase() {
    // Aquí harías la llamada real a tu API… luego:
    Swal.fire({
      icon: 'success',
      title: '¡Compra realizada!',
      text: `Total: €${this.total.toFixed(2)}`,
    });
    this.cartSv.clearCart();
    this.items = [];
  }


}
