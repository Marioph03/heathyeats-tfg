import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../interface/enviroment';
import { CommonModule } from '@angular/common';

/**
 * Componente de registro para nuevos usuarios.
 * Permite a los usuarios registrarse proporcionando datos básicos como nombre, correo y contraseña.
 * También incluye funcionalidad para cambio de tema visual entre claro y oscuro.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  /** Formulario reactivo para capturar datos de registro */
  registerForm!: FormGroup;
  /** Controla el estado de carga al enviar el formulario */
  loading = false;
  /** Indica si el formulario ha sido enviado */
  submitted = false;
  /** Mensaje de error en caso de fallo */
  errorMessage = '';
  /** Indica si el tema oscuro está activado */
  isDarkTheme = false;

  // Inyección de dependencias
  private renderer = inject(Renderer2);        // Para manipular clases en el DOM
  private fb = inject(FormBuilder);           // Para construir formularios reactivos
  private http = inject(HttpClient);          // Cliente HTTP para realizar solicitudes
  private router = inject(Router);            // Para navegación entre rutas
  private apiUrl = environment.apiUrl;        // URL base de la API desde los entornos configurados

  /**
   * Método del ciclo de vida que se ejecuta al inicializar el componente.
   * Crea el formulario y aplica el tema guardado previamente.
   */
  ngOnInit(): void {
    this.initForm();           // Inicializa el formulario
    this.applySavedTheme();    // Aplica el tema visual seleccionado previamente
  }

  /**
   * Inicializa el formulario de registro con las validaciones necesarias.
   */
  private initForm(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],                               // Nombre de usuario (obligatorio)
      full_name: ['', [Validators.required]],                             // Nombre completo (obligatorio)
      email: ['', [Validators.required, Validators.email]],              // Correo electrónico válido (obligatorio)
      password: ['', [Validators.required]],                             // Contraseña (obligatoria)
      rol: ['user']                                                     // Rol del usuario (por defecto: "user")
    });
  }

  /**
   * Acceso rápido a los controles del formulario para facilitar las validaciones.
   */
  get f() {
    return this.registerForm.controls;
  }

  /**
   * Método que se ejecuta al enviar el formulario.
   * Valida la información ingresada y realiza una solicitud al backend para registrar al usuario.
   */
  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = ''; // Reinicia el mensaje de error

    // Si el formulario no es válido, detiene el proceso
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true; // Muestra el estado de carga
    this.http
      .post<{ message: string }>(
        `${this.apiUrl}/createUser`,       // Endpoint para crear nuevos usuarios
        this.registerForm.value            // Datos del formulario
      )
      .subscribe({
        next: () => this.router.navigate(['/login']), // Navega a la pantalla de inicio de sesión al completar
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error al registrar el usuario'; // Mensaje de error
          this.loading = false; // Finaliza el estado de carga
        }
      });
  }

  /**
   * Aplica el tema visual (claro u oscuro) guardado previamente en el `localStorage`.
   */
  private applySavedTheme(): void {
    const savedTheme = localStorage.getItem('theme'); // Obtiene el tema guardado ("dark" o "light")
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      this.renderer.addClass(document.body, 'dark-theme'); // Aplica la clase para el tema oscuro
    }
  }

  /**
   * Alterna el tema visual entre claro y oscuro.
   * También guarda la selección en el `localStorage` para conservar el estado.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.renderer[this.isDarkTheme ? 'addClass' : 'removeClass'](document.body, 'dark-theme'); // Agrega o elimina la clase para el tema oscuro
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light'); // Guarda la preferencia en el `localStorage`
  }
}
