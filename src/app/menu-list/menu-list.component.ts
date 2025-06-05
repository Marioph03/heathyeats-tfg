import { Component, inject, OnInit, Renderer2 } from '@angular/core';       // Configuración del componente y manipulación del DOM.
import { CommonModule, NgIf, NgFor } from '@angular/common';               // Módulos comunes para condicionales y bucles en la plantilla.
import { forkJoin, of } from 'rxjs';                                       // Manejo de múltiples observables: forkJoin y valores de fallback `of`.
import { catchError, map } from 'rxjs/operators';                          // Operadores RxJS para transformar y manejar errores.
import { MealDbService, Meal } from '../service/recipes.service';          // Servicio para obtener recetas y definición del modelo `Meal`.
import { Router, RouterLink } from '@angular/router';                      // Navegación, enlaces y manejo de rutas.
import { AuthService } from '../service/auth.service';                     // Servicio para autenticación del usuario.
import { CartService } from '../service/cart.service';                     // Servicio para manejar el carrito de compras.
import Swal from 'sweetalert2';                                            // Biblioteca para mostrar alertas personalizadas.

// -------------------------------------------------------------------------------
// Interfaces
// -------------------------------------------------------------------------------

/**
 * Estructura para representar una sección de menús/categorías.
 */
interface Section {
  title: string; // Título de la sección (ejemplo: "Saludable").
  meals: Meal[]; // Lista de platillos asociados a esta sección.
}

/**
 * Configuración individual para definir una sección del menú.
 */
interface MenuConfig {
  title: string;  // Título de la sección.
  query?: string; // Término de búsqueda libre (opcional).
  category?: string; // Filtro basado en categoría (opcional).
}

// -------------------------------------------------------------------------------
// Decorador @Component
// -------------------------------------------------------------------------------

@Component({
  selector: 'app-menu-list',                     // Selector del componente.
  standalone: true,                              // Este componente es autónomo.
  imports: [CommonModule, NgIf, NgFor, RouterLink], // Módulos importados para usar en la plantilla.
  templateUrl: './menu-list.component.html',     // Ruta al archivo HTML asociado.
  styleUrls: ['./menu-list.component.css']       // Archivo de estilos específico.
})
export class MenuListComponent implements OnInit {
  // ---------------------------------------------------------------------------
  // Propiedades
  // ---------------------------------------------------------------------------

  sections: Section[] = [];                  // Almacena las secciones cargadas del menú.
  loading = false;                           // Indica si los datos están cargándose.
  error = '';                                // Mensaje de error en caso de fallos al cargar.
  isDarkTheme = false;                       // Controla si el tema actual es oscuro o claro.

  // Detalles del platillo seleccionado en el modal.
  selectedMealDetail: Meal | null = null;    // Detalle del platillo seleccionado.
  price = 0;                                 // Precio calculado del platillo.
  stockCount = 1;                            // Cantidad inicial de platillos a comprar.

  // Configuración de diferentes secciones a mostrar en el menú.
  private menusToShow: MenuConfig[] = [
    { title: 'Saludable', query: 'healthy' },
    { title: 'Mariscos', category: 'Seafood' },
    { title: 'Vegetariano', category: 'Vegetarian' },
    { title: 'Postres', category: 'Dessert' }
  ];

  // ---------------------------------------------------------------------------
  // Dependencias inyectadas
  // ---------------------------------------------------------------------------

  private renderer = inject(Renderer2);          // Modificaciones directas al DOM.
  protected authSrvc = inject(AuthService);      // Servicio de autenticación.
  protected router = inject(Router);             // Navegación entre vistas.

  constructor(private mealSvc: MealDbService,    // Servicio de recetas.
              private cartSv: CartService) {}    // Servicio del carrito.

  // ---------------------------------------------------------------------------
  // Métodos del Ciclo de Vida
  // ---------------------------------------------------------------------------

  /**
   * Hook `ngOnInit`: Carga inicial de datos y aplicador de configuración.
   * - Llama a la función para cargar secciones del menú.
   * - Aplica el tema guardado en `localStorage`.
   * - Verifica si el usuario está autenticado.
   */
  ngOnInit() {
    this.fetchAllSections();
    this.applySavedTheme();
    this.authSrvc.isLogged();
  }

  // ---------------------------------------------------------------------------
  // Métodos Privados
  // ---------------------------------------------------------------------------

  /**
   * Carga todas las secciones definidas en `menusToShow`.
   * Hace uso de múltiples peticiones simultáneas con `forkJoin` y maneja errores.
   */
  private fetchAllSections() {
    this.loading = true;
    this.error = '';

    const calls = this.menusToShow.map(menu => {
      if (menu.query) {
        return this.mealSvc.searchMeals(menu.query).pipe(
          map(res => ({ title: menu.title, meals: res.meals ?? [] })),
          catchError(() => of({ title: menu.title, meals: [] }))
        );
      } else {
        return this.mealSvc.filterByCategory(menu.category!).pipe(
          map(res => ({ title: menu.title, meals: res.meals ?? [] })),
          catchError(() => of({ title: menu.title, meals: [] }))
        );
      }
    });

    forkJoin(calls).subscribe({
      next: (sections: Section[]) => {
        this.sections = sections;
        this.loading = false;
      },
      error: err => {
        console.error(err);
        this.error = 'Error cargando menús';
        this.loading = false;
      }
    });
  }

  /**
   * Aplica el tema guardado en localStorage.
   */
  private applySavedTheme(): void {
    if (localStorage.getItem('theme') === 'dark') {
      this.isDarkTheme = true;
      this.renderer.addClass(document.body, 'dark-theme');
    }
  }

  /**
   * Calcula el precio estimado de un platillo basado en el número de ingredientes.
   */
  private calculatePrice(meal: Meal): number {
    const ingredientCount = this.getIngredients(meal).length;
    return Math.max(5, ingredientCount * 1.5);
  }

  // ---------------------------------------------------------------------------
  // Métodos Públicos
  // ---------------------------------------------------------------------------

  /**
   * Alterna entre temas claro y oscuro y guarda la preferencia en `localStorage`.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    const method = this.isDarkTheme ? 'addClass' : 'removeClass';
    this.renderer[method](document.body, 'dark-theme');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  /**
   * Muestra los detalles del platillo seleccionado en un modal.
   */
  selectMeal(meal: Meal): void {
    this.selectedMealDetail = null;
    this.price = 0;
    this.stockCount = 1;

    this.mealSvc.getMealByIdSingle(meal.idMeal).subscribe({
      next: m => {
        this.selectedMealDetail = m;
        this.price = this.calculatePrice(m);
      },
      error: err => console.error(err)
    });
  }

  /**
   * Extrae una lista de ingredientes y cantidades de un platillo.
   */
  public getIngredients(meal: Meal): string[] {
    const list: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const ing = (meal as any)[`strIngredient${i}`];
      const qty = (meal as any)[`strMeasure${i}`];
      if (ing && ing.trim()) {
        list.push(`${ing} — ${qty || ''}`.trim());
      }
    }
    return list;
  }

  /**
   * Añade platillos al carrito mostrando una notificación con SweetAlert.
   */
  addToCart(): void {
    if (!this.selectedMealDetail || this.stockCount < 1) return;

    this.cartSv.addToCart({
      meal: this.selectedMealDetail,
      quantity: this.stockCount,
      price: this.price
    });

    Swal.fire({
      icon: 'success',
      title: '¡Añadido al carrito!',
      text: `${this.selectedMealDetail.strMeal} x${this.stockCount}`,
      timer: 2000,
      showConfirmButton: false
    });
  }

  closeDetail(): void {
    this.selectedMealDetail = null;
    this.stockCount = 1;
    this.price = 0;
  }

  decreaseStock(): void {
    if (this.stockCount > 1) {
      this.stockCount--;
    }
  }

  increaseStock(): void {
    this.stockCount++;
  }
}
