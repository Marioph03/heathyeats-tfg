import { Component, computed, inject, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';

/**
 * Componente `UserComponent` para la autenticación de usuarios.
 * Maneja el inicio de sesión y la integración con Google Sign-In.
 * Además, permite gestionar el tema de la aplicación (claro/oscuro).
 */
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  /** Formulario reactivo para capturar credenciales de inicio de sesión */
  loginForm!: FormGroup;
  /** Estado del tema actual (claro u oscuro) */
  isDarkTheme = false;
  /** Computada que indica si el usuario está autenticado */
  isLogged = computed(() => this.authService.isAuthenticated());

  // Inyección de dependencias necesarias
  private authService = inject(AuthService);  // Servicio de autenticación
  private router = inject(Router);           // Navegación entre rutas
  private fb = inject(FormBuilder);          // Constructor de formularios reactivos
  private renderer = inject(Renderer2);      // Para manipular clases del DOM

  /**
   * Ciclo de vida que se ejecuta al inicializar el componente.
   * Inicializa las configuraciones, el formulario y maneja el tema visual.
   */
  ngOnInit(): void {
    this.redirectIfAuthenticated();         // Redirige si el usuario ya está autenticado
    this.initLoginForm();                   // Inicializa el formulario de inicio de sesión
    this.applySavedTheme();                 // Aplica el tema guardado previamente
    this.loadGoogleAuthScript();            // Carga el script de Google Sign-In
  }

  /**
   * Inicializa el formulario de inicio de sesión con validaciones.
   */
  private initLoginForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],        // Campo obligatorio con formato de correo
      password_hash: ['', Validators.required]                     // Contraseña obligatoria
    });
  }

  /**
   * Redirige al usuario al "home" si ya está autenticado.
   */
  private redirectIfAuthenticated(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  /**
   * Aplica el tema guardado en el `localStorage` (claro u oscuro).
   */
  private applySavedTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      this.renderer.addClass(document.body, 'dark-theme'); // Aplica la clase `dark-theme` al `<body>`
    }
  }

  /**
   * Carga el script de Google Sign-In dinámicamente.
   */
  private loadGoogleAuthScript(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client'; // URL del cliente de Google Sign-In
    script.async = true;
    script.defer = true;
    document.body.appendChild(script); // Agrega el script al `<body>`
  }

  /**
   * Maneja el envío del formulario de inicio de sesión.
   * Realiza la autenticación con el servicio de backend.
   */
  onSubmit(): void {
    // Valida si el formulario es inválido antes de proceder
    if (this.loginForm.invalid) return;

    const { email, password_hash } = this.loginForm.value;

    this.authService.logIn(email, password_hash).subscribe({
      /** En caso de éxito, redirige e informa al usuario */
      next: () => {
        Swal.fire('Bienvenido', 'Has iniciado sesión con éxito', 'success'); // Muestra un mensaje de éxito
        this.router.navigate(['/home']); // Navega a la página principal
      },
      /** Maneja posibles errores en el inicio de sesión */
      error: (err) => {
        const msg = err.error?.message || 'Ocurrió un error'; // Obtiene el mensaje de error

        if (msg === 'Contraseña incorrecta') {
          Swal.fire('Contraseña incorrecta', 'Ha introducido mal su contraseña, vuelva a intentarlo', 'error');
        } else if (msg === 'Usuario no encontrado') {
          Swal.fire({
            title: 'Usuario no encontrado',
            text: '¿Quieres crear una cuenta nueva?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrarme',
            cancelButtonText: 'Cancelar'
          }).then(result => {
            if (result.isConfirmed) {
              this.router.navigate(['/register']); // Redirige a la página de registro
            }
          });
        } else {
          Swal.fire('Error', msg, 'error'); // Muestra un mensaje genérico en caso de error no reconocido
        }
      }
    });
  }

  /**
   * Alterna el tema visual entre claro y oscuro.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      this.renderer.addClass(document.body, 'dark-theme'); // Activa el tema oscuro
    } else {
      this.renderer.removeClass(document.body, 'dark-theme'); // Desactiva el tema oscuro
    }
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); // Guarda el estado en `localStorage`
  }
}
