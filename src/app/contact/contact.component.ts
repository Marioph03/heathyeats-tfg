// ===============================================================================
// Componente: ContactComponent
// ===============================================================================

// Este componente maneja la lógica para la página de contacto en una aplicación Angular.
// Incluye funcionalidad para cambiar entre temas (claro y oscuro) y muestra el año actual.
// Además, utiliza servicios para autenticación y control de rutas.

// -------------------------------------------------------------------------------
// Importaciones
// -------------------------------------------------------------------------------

import { Component, inject, Renderer2 } from '@angular/core';   // Decoradores y utilidades de Angular.
import { Router, RouterLink } from '@angular/router';          // Herramientas para la navegación.
import { AuthService } from '../service/auth.service';         // Servicio para la autenticación.

// -------------------------------------------------------------------------------
// Decorador @Component
// -------------------------------------------------------------------------------

// Define las configuraciones del componente:
// - selector: Nombre del selector HTML para este componente.
// - imports: Lista de directivas, pipes o servicios necesarios en la plantilla.
// - templateUrl: Ruta del archivo HTML asociado a este componente.
// - styleUrl: Ruta de los estilos CSS específicos del componente.

@Component({
  selector: 'app-contact',                 // Selector utilizado para insertar este componente.
  imports: [                               // Imports necesarios en la plantilla.
    RouterLink                             // Para manejar enlaces de navegación en la plantilla.
  ],
  templateUrl: './contact.component.html', // Ruta del archivo de plantilla HTML.
  styleUrl: './contact.component.css'      // Ruta de los estilos CSS.
})
export class ContactComponent {
  // ---------------------------------------------------------------------------
  // Propiedades
  // ---------------------------------------------------------------------------

  year = new Date().getFullYear(); // Año actual, se usa típicamente en el footer del HTML.
  isDarkTheme = false;             // Controla si el tema actual es `oscuro` (true) o `claro` (false).

  // ---------------------------------------------------------------------------
  // Dependencias inyectadas
  // ---------------------------------------------------------------------------

  // Inyecta el servicio Renderer2 para manipular clases de elementos en el DOM.
  private renderer = inject(Renderer2);

  // Inyecta el Router para manejar la navegación desde el componente.
  protected router = inject(Router);

  // Inyecta el servicio de autenticación para operaciones relacionadas con usuarios.
  protected authSrvc = inject(AuthService);

  // ---------------------------------------------------------------------------
  // Ciclo de vida del componente
  // ---------------------------------------------------------------------------

  // Hook `ngOnInit`: Se ejecuta al inicializar el componente.
  // Aquí se aplica el tema guardado previamente en localStorage.
  ngOnInit(): void {
    this.applySavedTheme();
  }

  // ---------------------------------------------------------------------------
  // Métodos privados
  // ---------------------------------------------------------------------------

  // Método: applySavedTheme
  // Aplica el tema guardado en el almacenamiento local (`localStorage`).
  // Si se detecta que el tema es `oscuro`, activa la clase correspondiente en el cuerpo del documento.
  private applySavedTheme(): void {
    const savedTheme = localStorage.getItem('theme'); // Obtiene el tema guardado del almacenamiento local.
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;                        // Cambia la propiedad del estado del tema.
      document.body.classList.add('dark-theme');      // Agrega la clase CSS para el tema oscuro al `<body>`.
    }
  }

  // ---------------------------------------------------------------------------
  // Métodos públicos
  // ---------------------------------------------------------------------------

  // Método: toggleTheme
  // Alterna entre el tema claro y oscuro. Cambia el estado de `isDarkTheme` y guarda la preferencia en `localStorage`.
  toggleTheme(): void {
    // Inversión del estado del tema.
    this.isDarkTheme = !this.isDarkTheme;

    // Usa el Renderer2 para agregar o eliminar dinámicamente la clase CSS `dark-theme` en el cuerpo del documento.
    this.renderer[this.isDarkTheme ? 'addClass' : 'removeClass'](document.body, 'dark-theme');

    // Guarda el tema actual en localStorage para persistir la preferencia.
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }
}
