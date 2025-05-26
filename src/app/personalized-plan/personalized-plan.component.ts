import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../service/auth.service';
import {Meal, MealDbService} from '../service/recipes.service';

@Component({
  selector: 'app-plan-personalizado',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './personalized-plan.component.html',
  styleUrls: ['./personalized-plan.component.css']
})
export class PlanPersonalizadoComponent implements OnInit {
  mode: 'DIY' | 'AI' = 'DIY';
  form!: FormGroup;
  generatedPlan: string | null = null;
  loading = false;
  error: string | null = null;
  isDarkTheme = false;
  planSemanal: { dia: string; receta: Meal }[] = [];
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  private renderer = inject(Renderer2);
  protected authSrvc = inject(AuthService);
  protected router = inject(Router);

  constructor(
    private fb: FormBuilder,
    private recipesService: MealDbService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      caloriesPerDay: [2000, [Validators.required, Validators.min(1000)]],
      mealsPerDay:    [3,    [Validators.required, Validators.min(1), Validators.max(10)]],
      dietaryPreferences: ['Sin restricciones', Validators.required]
    });
    this.applySavedTheme();
    this.authSrvc.isLoggedIn();
  }

  submit() {
    if (this.form.invalid) return;
    this.generatedPlan = null;
    this.error = null;
    this.planSemanal = [];
    this.loading = true;

    const { dietaryPreferences } = this.form.value;
    const filtro = dietaryPreferences.toLowerCase().includes('vegano') ? 'Vegan' :
      dietaryPreferences.toLowerCase().includes('vegetar') ? 'Vegetarian' :
        'Chicken'; // fallback simple

    this.recipesService.getRecetasPorCategoria(filtro).subscribe({
      next: (recetas) => {
        if (!recetas || recetas.length < 7) {
          this.error = 'No se encontraron suficientes recetas para tu preferencia.';
          this.loading = false;
          return;
        }

        this.planSemanal = this.diasSemana.map((dia, i) => ({
          dia,
          receta: recetas[i % recetas.length]
        }));

        this.generatedPlan = 'Plan semanal generado con éxito.';
        this.loading = false;
      },
      error: () => {
        this.error = 'Hubo un problema al generar el plan.';
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
    this.renderer[this.isDarkTheme ? 'addClass' : 'removeClass'](
      document.body, 'dark-theme'
    );
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }
}
