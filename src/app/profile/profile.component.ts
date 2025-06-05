// ===============================================================================
// Componente: ProfileComponent
// ===============================================================================

// Este componente gestiona la visualización y edición del perfil de usuario.
// Permite cargar y actualizar los datos del usuario mediante un formulario reactivo,
// interactuando con un servicio que gestiona las operaciones relacionadas con el perfil.

// -------------------------------------------------------------------------------
// Importaciones
// -------------------------------------------------------------------------------

import { Component, OnInit } from '@angular/core';                           // Configuración del componente y ciclo de vida.
import { UserService, UserProfile } from '../service/user.service';          // Servicio para operaciones relacionadas con el perfil.
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'; // Formularios reactivos.
import { NgIf } from '@angular/common';                                      // Directiva estructural para condicionales.
import { RouterLink } from '@angular/router';                                // Enlaces entre rutas.

// -------------------------------------------------------------------------------
// Decorador @Component
// -------------------------------------------------------------------------------

@Component({
  selector: 'app-profile',                       // Selector del componente.
  imports: [ReactiveFormsModule, NgIf, RouterLink], // Módulos usados en la plantilla.
  templateUrl: './profile.component.html'        // Ruta al archivo HTML asociado.
})
export class ProfileComponent implements OnInit {
  // ---------------------------------------------------------------------------
  // Propiedades
  // ---------------------------------------------------------------------------

  profile!: UserProfile;       // Objeto que almacena la información del perfil del usuario.
  form!: FormGroup;            // Formulario reactivo para editar los datos del perfil.
  loading = false;             // Indicador de si hay una operación en curso (carga o actualización).
  error: string | null = null; // Mensaje de error en caso de operación fallida.

  // ---------------------------------------------------------------------------
  // Constructor e Inyección de Dependencias
  // ---------------------------------------------------------------------------

  /**
   * Inyección de dependencias:
   * - `UserService`: Servicio que maneja operaciones relacionadas con el perfil del usuario.
   * - `FormBuilder`: Herramienta para construir y gestionar formularios reactivos.
   */
  constructor(
    private userSvc: UserService,
    private fb: FormBuilder
  ) {}

  // ---------------------------------------------------------------------------
  // Métodos del Ciclo de Vida
  // ---------------------------------------------------------------------------

  /**
   * Hook `ngOnInit`: Inicializa el formulario y carga los datos del perfil del usuario.
   */
  ngOnInit() {
    // Configuración inicial del formulario reactivo con controles básicos.
    this.form = this.fb.group({
      email: [''],           // Control para el correo electrónico.
      full_name: [''],       // Control para el nombre completo.
      password_hash: ['']    // Control para el campo de la contraseña (en caso necesario).
      // Más controles pueden agregarse si la API incluye más propiedades.
    });

    // Carga los datos del perfil desde el servicio.
    this.loadProfile();
  }

  // ---------------------------------------------------------------------------
  // Métodos Públicos
  // ---------------------------------------------------------------------------

  /**
   * Método `loadProfile`: Carga el perfil del usuario desde el backend.
   * Realiza una llamada al servicio `UserService` para obtener los datos
   * y actualiza el formulario con la información recibida.
   */
  loadProfile() {
    this.loading = true; // Activa el indicador de carga.

    this.userSvc.getProfile().subscribe({
      next: profile => {
        this.profile = profile;              // Almacena los datos del perfil.
        this.form.patchValue(profile);       // Actualiza los valores del formulario.
        this.loading = false;                // Desactiva el indicador de carga.
      },
      error: err => {
        this.error = 'No se pudo cargar el perfil'; // Mensaje de error en caso de fallo.
        this.loading = false;                      // Desactiva el indicador de carga.
      }
    });
  }

  /**
   * Método `save`: Guarda los cambios realizados al perfil del usuario.
   * Verifica la validez del formulario y realiza una llamada al servicio `UserService`
   * para enviar los datos actualizados al backend.
   */
  save() {
    // Si el formulario no es válido, no se realiza la actualización.
    if (this.form.invalid) return;
    this.loading = true; // Activa el indicador de carga.

    // Llena con los datos del formulario y realiza la actualización.
    this.userSvc.updateProfile(this.form.value).subscribe({
      next: updated => {
        this.profile = updated;          // Actualiza el perfil con los datos recibidos del backend.
        this.loading = false;            // Desactiva el indicador de carga.
      },
      error: err => {
        this.error = 'Error al actualizar el perfil'; // Mensaje de error en caso de fallo.
        this.loading = false;                         // Desactiva el indicador de carga.
      }
    });
  }
}
