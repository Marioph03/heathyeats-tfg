import { Injectable } from '@angular/core';
import { Meal } from './recipes.service';

export interface CartItem {
  meal: Meal;
  quantity: number;
  price: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: CartItem[] = [];

  addToCart(item: CartItem) {
    const existing = this.items.find(i => i.meal.idMeal === item.meal.idMeal);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      this.items.push({ ...item });
    }
  }

  getItems(): CartItem[] {
    return this.items;
  }

  clearCart() {
    this.items = [];
  }
}
