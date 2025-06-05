// ===============================================================================
// Componente: HomeComponent
// ===============================================================================

// Este componente actúa como el menú principal de la aplicación.
// Incluye lógica para alternar temas (claro y oscuro), navegar entre rutas,
// comprobar el estado de autenticación del usuario y cerrar sesión.

// -------------------------------------------------------------------------------
// Importaciones
// -------------------------------------------------------------------------------

import { Component, Inject, inject, Renderer2 } from '@angular/core'; // Decoradores y herramientas para manipulación del DOM.
import { Router, RouterLink } from '@angular/router';               // Navegación entre rutas y directiva RouterLink.
import { AuthService } from '../service/auth.service';               // Servicio encargado de la autenticación del usuario.

// -------------------------------------------------------------------------------
// Decorador @Component
// -------------------------------------------------------------------------------

// Define las configuraciones del componente:
// - selector: Nombre del selector usado para insertar el componente en la aplicación.
// - imports: Elementos usados en la plantilla como `RouterLink`.
// - templateUrl: Ruta donde se encuentra la plantilla HTML asociada al componente.
// - styleUrl: Ruta de los estilos específicos del componente.
// - standalone: Define este componente como autónomo, independiente de módulos.

@Component({
  selector: 'app-menu-list',                 // Selector para el componente.
  imports: [RouterLink],                     // Directivas necesarias (como RouterLink para enlaces).
  templateUrl: './home.component.html',      // Plantilla HTML del componente.
  styleUrl: './home.component.css',          // Hoja de estilos CSS del componente.
  standalone: true                           // Se define como un componente autónomo.
})
export class HomeComponent {
  // ---------------------------------------------------------------------------
  // Propiedades
  // ---------------------------------------------------------------------------

  isDarkTheme = false;            // Indica si el tema actual es oscuro o claro.
  currentYear = new Date().getFullYear(); // Año actual, generalmente mostrado en el layout.

  // ---------------------------------------------------------------------------
  // Dependencias inyectadas
  // ---------------------------------------------------------------------------

  private renderer = inject(Renderer2); // Permite manipular el DOM de manera segura.
  protected authSrvc = inject(AuthService); // Servicio encargado de manejar la autenticación.
  protected router = inject(Router);       // Servicio Router para navegación programática.

  // ---------------------------------------------------------------------------
  // Ciclo de vida del componente: ngOnInit
  // ---------------------------------------------------------------------------

  /**
   * Hook de inicialización del componente.
   * - Aplica el tema guardado (si existe) utilizando localStorage.
   * - Llama al método `isLoggedIn` del servicio AuthService para verificar el estado de autenticación del usuario.
   */
  ngOnInit(): void {
    this.applySavedTheme();      // Recupera y aplica el tema guardado.
    this.authSrvc.isLogged();  // Comprueba si el usuario está autenticado.
  }

  // ---------------------------------------------------------------------------
  // Métodos Privados
  // ---------------------------------------------------------------------------

  /**
   * Método: applySavedTheme
   * Verifica si hay un tema guardado en el almacenamiento local (`localStorage`).
   * Si el tema es oscuro (`dark`), aplica la clase CSS correspondiente al cuerpo del documento.
   */
  private applySavedTheme(): void {
    const savedTheme = localStorage.getItem('theme'); // Recupera el tema desde localStorage.
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;                       // Establece el estado del tema en oscuro.
      document.body.classList.add('dark-theme');     // Agrega la clase 'dark-theme' al elemento <body>.
    }
  }

  // ---------------------------------------------------------------------------
  // Métodos Públicos
  // ---------------------------------------------------------------------------

  /**
   * Método: toggleTheme
   * Alterna entre el tema oscuro y claro.
   * Actualiza el estado de la propiedad `isDarkTheme` y guarda la preferencia en `localStorage`.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme; // Invierte el estado actual del tema.
    this.renderer[this.isDarkTheme ? 'addClass' : 'removeClass'](document.body, 'dark-theme');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); // Guarda la preferencia en localStorage.
  }

  /**
   * Método: logout
   * Realiza la operación de cierre de sesión llamando al método `logout` del servicio AuthService.
   */
  logout(): void {
    this.authSrvc.logout(); // Desconecta al usuario.
  }

  /**
   * Método: goToProfile
   * Navega a la página del perfil del usuario.
   * Utiliza el servicio Router para la navegación programática.
   */
  goToProfile(): void {
    this.router.navigate(['/profile']); // Redirige a la ruta `/profile`.
  }

  /**
   * Método: goToSettings
   * Navega a la página de configuración del usuario.
   * Utiliza el servicio Router para la navegación programática.
   */
  goToSettings(): void {
    this.router.navigate(['/settings']); // Redirige a la ruta `/settings`.
  }
}
