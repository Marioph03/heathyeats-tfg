import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { CommonModule, NgIf, NgFor }       from '@angular/common';
import { forkJoin, of }                   from 'rxjs';
import { catchError, map }                from 'rxjs/operators';
import { MealDbService, Meal }            from '../service/recipes.service';
import { Router, RouterLink }             from '@angular/router';
import { AuthService }                    from '../service/auth.service';
import {CartService} from '../service/cart.service';
import Swal from 'sweetalert2';

interface Section {
  title: string;
  meals: Meal[];
}

interface MenuConfig {
  title: string;
  query?: string;       // búsqueda libre
  category?: string;    // filtro por categoría
}

@Component({
  selector: 'app-menu-list',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterLink],
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css']
})
export class MenuListComponent implements OnInit {
  sections: Section[] = [];
  loading = false;
  error   = '';
  isDarkTheme = false;

  // Detalle modal
  selectedMealDetail: Meal | null = null;
  price        = 0;
  stockCount   = 1;

  private renderer = inject(Renderer2);
  protected authSrvc = inject(AuthService);
  protected router   = inject(Router);

  private menusToShow: MenuConfig[] = [
    { title: 'Saludable',  query: 'healthy'    },
    { title: 'Mariscos',   category: 'Seafood'},
    { title: 'Vegetariano',category: 'Vegetarian'},
    { title: 'Postres',    category: 'Dessert' }
  ];

  constructor(private mealSvc: MealDbService,
              private cartSv: CartService) {}

  ngOnInit() {
    this.fetchAllSections();
    this.applySavedTheme();
    this.authSrvc.isLoggedIn();
  }

  private fetchAllSections() {
    this.loading = true;
    this.error   = '';

    const calls = this.menusToShow.map(menu => {
      if (menu.query) {
        return this.mealSvc.searchMeals(menu.query)
          .pipe(
            map(res => ({ title: menu.title, meals: res.meals ?? [] })),
            catchError(() => of({ title: menu.title, meals: [] }))
          );
      } else {
        return this.mealSvc.filterByCategory(menu.category!)
          .pipe(
            map(res => ({ title: menu.title, meals: res.meals ?? [] })),
            catchError(() => of({ title: menu.title, meals: [] }))
          );
      }
    });

    forkJoin(calls).subscribe({
      next: (sections: Section[]) => {
        this.sections = sections;
        this.loading  = false;
      },
      error: err => {
        console.error(err);
        this.error   = 'Error cargando menús';
        this.loading = false;
      }
    });
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    const method = this.isDarkTheme ? 'addClass' : 'removeClass';
    this.renderer[method](document.body, 'dark-theme');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  /** Abre modal con detalle, calcula precio y resetea stock */
  selectMeal(meal: Meal) {
    this.selectedMealDetail = null;
    this.price      = 0;
    this.stockCount = 1;

    this.mealSvc.getMealByIdSingle(meal.idMeal).subscribe({
      next: m => {
        this.selectedMealDetail = m;
        this.price = this.calculatePrice(m);  // aquí asignas el precio
      },
      error: err => console.error(err)
    });
  }

  closeDetail() {
    this.selectedMealDetail = null;
  }

  increaseStock() {
    this.stockCount++;
  }
  decreaseStock() {
    if (this.stockCount > 1) this.stockCount--;
  }

  /** Ejemplo de cálculo de precio */
  private calculatePrice(meal: Meal): number {
    const count = this.getIngredients(meal).length;
    return Math.max(5, count * 1.5);
  }

  /** Extrae “Ingrediente — Cantidad” */
  public getIngredients(meal: Meal): string[] {
    const list: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ing = (meal as any)[`strIngredient${i}`];
      const qty = (meal as any)[`strMeasure${i}`];
      if (ing && ing.trim()) list.push(`${ing} — ${qty || ''}`.trim());
    }
    return list;
  }

  private applySavedTheme(): void {
    if (localStorage.getItem('theme') === 'dark') {
      this.isDarkTheme = true;
      this.renderer.addClass(document.body, 'dark-theme');
    }
  }

  // Lógica de “Añadir al carrito”
  addToCart(): void {
    if (!this.selectedMealDetail || this.stockCount < 1) return;

    this.cartSv.addToCart({
      meal: this.selectedMealDetail,
      quantity: this.stockCount,
      price: this.price // asegúrate de que existe
    });

    Swal.fire({
      icon: 'success',
      title: '¡Añadido al carrito!',
      text: `${this.selectedMealDetail.strMeal} x${this.stockCount}`,
      timer: 2000,
      showConfirmButton: false
    });
  }
}
