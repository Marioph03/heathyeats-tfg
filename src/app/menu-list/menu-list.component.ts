import {Component, inject, OnInit, Renderer2} from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MealDbService, Meal } from '../service/recipes.service';
import {RouterLink} from '@angular/router';

interface Section {
  title: string;
  meals: Meal[];
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
  error = '';
  isDarkTheme = false;

  private renderer = inject(Renderer2);

  // Define aquí las categorías o búsquedas que quieres mostrar
  private menusToShow = [
    { title: 'Saludable', query: 'healthy'               }, // usa search
    { title: 'Mariscos',  category: 'Seafood'            }, // usa filterByCategory
    { title: 'Vegetariano',category: 'Vegetarian'        },
    { title: 'Postres',    category: 'Dessert'           },
  ];

  constructor(private mealSvc: MealDbService) {}

  ngOnInit() {
    this.fetchAllSections();
  }

  private fetchAllSections() {
    this.loading = true;
    this.error = '';

    // Crea un array de Observables, uno por sección
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

    // forkJoin espera a todas las peticiones
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

  private applySavedTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.renderer[this.isDarkTheme ? 'addClass' : 'removeClass'](document.body, 'dark-theme');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }
}
