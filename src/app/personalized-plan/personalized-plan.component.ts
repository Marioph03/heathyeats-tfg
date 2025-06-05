// ===============================================================================
// Componente: PlanPersonalizadoComponent
// ===============================================================================

// Este componente permite a los usuarios generar un plan personalizado de comidas
// semanal. Ofrece dos modos:
// - DIY (Hazlo tú mismo): Permite personalizar las entradas del plan.
// - AI (Generación automática): Genera un plan basado en las preferencias.

// También incluye opciones para alternar entre tema claro y oscuro.

// -------------------------------------------------------------------------------
// Importaciones
// -------------------------------------------------------------------------------

import { Component, inject, OnInit, Renderer2 } from '@angular/core';                // Decorador, ciclo de vida y manipulación del DOM.
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; // Formularios reactivos para manejar entradas de usuario.
import { CommonModule, NgIf } from '@angular/common';                               // Funciones comunes y condicionales para la plantilla.
import { Router, RouterLink } from '@angular/router';                               // Navegación entre rutas.
import { AuthService } from '../service/auth.service';                              // Servicio de autenticación.
import { Meal, MealDbService } from '../service/recipes.service';                   // Servicio de recetas y modelo de datos `Meal`.

// -------------------------------------------------------------------------------
// Decorador @Component
// -------------------------------------------------------------------------------

@Component({
  selector: 'app-plan-personalizado',               // Selector del componente.
  standalone: true,                                 // Componente autónomo independiente de módulos.
  imports: [CommonModule, ReactiveFormsModule, NgIf, RouterLink], // Módulos usados en la plantilla.
  templateUrl: './personalized-plan.component.html', // Ruta a la plantilla HTML asociada.
  styleUrls: ['./personalized-plan.component.css']  // Ruta de estilos del componente.
})
export class PlanPersonalizadoComponent implements OnInit {
  // ---------------------------------------------------------------------------
  // Propiedades
  // ---------------------------------------------------------------------------

  mode: 'DIY' | 'AI' = 'DIY';                      // Modo activo del plan (DIY o AI).
  form!: FormGroup;                                // Formulario reactivo para entrada de datos.
  generatedPlan: string | null = null;            // Mensaje de éxito al generar el plan.
  loading = false;                                // Indicador de carga (mientras se procesan datos).
  error: string | null = null;                    // Mensaje de error en caso de fallos.
  isDarkTheme = false;                            // Controla si el tema oscuro está activo.
  planSemanal: { dia: string; receta: Meal }[] = []; // Plan semanal generado.
  diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']; // Días de la semana.

  // ---------------------------------------------------------------------------
  // Dependencias inyectadas
  // ---------------------------------------------------------------------------

  private renderer = inject(Renderer2);           // Manipulación del DOM para temas.
  protected authSrvc = inject(AuthService);       // Servicio de autenticación del usuario.
  protected router = inject(Router);              // Navegación entre rutas.

  constructor(
    private fb: FormBuilder,                      // Constructor del formulario reactivo.
    private recipesService: MealDbService         // Servicio para obtener recetas.
  ) {}

  // ---------------------------------------------------------------------------
  // Métodos del Ciclo de Vida
  // ---------------------------------------------------------------------------

  /**
   * Hook `ngOnInit`: Inicializa el formulario y configura el tema guardado.
   * También verifica si el usuario está autenticado.
   */
  ngOnInit() {
    this.form = this.fb.group({
      caloriesPerDay: [2000, [Validators.required, Validators.min(1000)]], // Calorías diarias.
      mealsPerDay: [3, [Validators.required, Validators.min(1), Validators.max(10)]], // Número de comidas por día.
      dietaryPreferences: ['Sin restricciones', Validators.required] // Preferencias dietéticas.
    });
    this.applySavedTheme();       // Aplica el tema guardado (claro/oscuro).
    this.authSrvc.isLogged();   // Verifica si el usuario está autenticado.
  }

  // ---------------------------------------------------------------------------
  // Métodos Públicos
  // ---------------------------------------------------------------------------

  /**
   * Método `submit`: Envío del formulario para generar el plan semanal.
   * Llama al servicio de recetas basado en las preferencias del usuario.
   */
  submit() {
    if (this.form.invalid) return; // Si el formulario no es válido, no ejecuta el plan.
    this.generatedPlan = null;
    this.error = null;
    this.planSemanal = [];
    this.loading = true; // Activa el indicador de carga.

    const { dietaryPreferences } = this.form.value;

    // Filtro basado en las preferencias del usuario (por categoría).
    const filtro = dietaryPreferences.toLowerCase().includes('vegano') ? 'Vegan' :
      dietaryPreferences.toLowerCase().includes('vegetar') ? 'Vegetarian' :
        'Chicken'; // Categoría por defecto (fallback).

    this.recipesService.getRecetasPorCategoria(filtro).subscribe({
      next: (recetas) => {
        // Valida si hay suficientes recetas para generar un plan de 7 días.
        if (!recetas || recetas.length < 7) {
          this.error = 'No se encontraron suficientes recetas para tu preferencia.';
          this.loading = false;
          return;
        }

        // Genera el plan semanal asignando recetas a cada día.
        this.planSemanal = this.diasSemana.map((dia, i) => ({
          dia,
          receta: recetas[i % recetas.length]
        }));

        this.generatedPlan = 'Plan semanal generado con éxito.'; // Mensaje de éxito.
        this.loading = false; // Detiene el indicador de carga.
      },
      error: () => {
        this.error = 'Hubo un problema al generar el plan.'; // Mensaje de error.
        this.loading = false; // Detiene el indicador de carga.
      }
    });
  }

  /**
   * Alterna entre temas claro y oscuro, y guarda la preferencia en `localStorage`.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.renderer[this.isDarkTheme ? 'addClass' : 'removeClass'](document.body, 'dark-theme');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  // ---------------------------------------------------------------------------
  // Métodos Privados
  // ---------------------------------------------------------------------------

  /**
   * Aplica el tema guardado en `localStorage`, si está disponible.
   */
  private applySavedTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    }
  }
}
