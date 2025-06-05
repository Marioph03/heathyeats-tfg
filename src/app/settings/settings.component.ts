import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SettingsService, UserSettings } from '../service/settings.service';
import { NgForOf, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Componente que maneja la configuración de usuario (como tema, idioma y notificaciones).
 * Permite cargar y guardar las preferencias del usuario usando el servicio `SettingsService`.
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [
    ReactiveFormsModule, // Módulo para trabajar con formularios reactivos
    NgIf,                // Directiva para mostrar/ocultar elementos condicionalmente
    NgForOf,             // Directiva para iterar sobre arrays
    RouterLink           // Directiva para navegar entre rutas
  ],
  standalone: true      // Indica que este es un componente independiente (Standalone)
})
export class SettingsComponent implements OnInit {
  /** Formulario reactivo para gestionar las configuraciones */
  form!: FormGroup;
  /** Controla el estado de carga de las operaciones */
  loading = false;
  /** Mensaje de error en caso de problemas */
  error: string | null = null;
  /** Mensaje de éxito cuando los cambios se guardan correctamente */
  successMessage: string | null = null;

  /** Opciones disponibles para el tema del usuario */
  themes = [
    { label: 'Claro', value: 'light' },   // Tema claro
    { label: 'Oscuro', value: 'dark' },  // Tema oscuro
    { label: 'Sistema', value: 'system' } // Tema automático según el sistema
  ];

  /** Opciones disponibles para los idiomas del usuario */
  languages = [
    { label: 'Español', value: 'es' },  // Español
    { label: 'English', value: 'en' }, // Inglés
    { label: 'Français', value: 'fr' } // Francés
  ];

  /**
   * Constructor que inyecta dependencias necesarias.
   * @param fb FormBuilder para construir el formulario reactivo.
   * @param settingsSvc Servicio que maneja las configuraciones del usuario.
   */
  constructor(
    private fb: FormBuilder,
    private settingsSvc: SettingsService
  ) {}

  /**
   * Hook del ciclo de vida del componente. Se ejecuta al inicializar el componente.
   * Crea el formulario y carga las configuraciones del usuario desde el backend.
   */
  ngOnInit() {
    // Define el formulario reactivo con valores iniciales por defecto
    this.form = this.fb.group({
      theme: ['system'],           // Tema por defecto: "Sistema"
      language: ['es'],            // Idioma por defecto: "Español"
      notifications: [true]        // Notificaciones activadas por defecto
    });
    this.loadSettings();          // Carga las preferencias del usuario
  }

  /**
   * Carga las configuraciones del usuario desde el backend usando `SettingsService`.
   * Actualiza el formulario con las configuraciones recuperadas.
   */
  private loadSettings() {
    this.loading = true; // Indica que la operación está en progreso
    this.settingsSvc.getSettings().subscribe({
      next: (s: UserSettings) => {
        this.form.patchValue(s);  // Actualiza los valores del formulario con los datos recuperados
        this.loading = false;    // Finaliza el estado de carga
      },
      error: () => {
        this.error = 'No se pudieron cargar las preferencias'; // Mensaje de error
        this.loading = false;    // Finaliza el estado de carga
      }
    });
  }

  /**
   * Guarda las configuraciones del usuario usando `SettingsService`.
   * Muestra un mensaje de éxito o error dependiendo del resultado.
   */
  save() {
    // Si el formulario es inválido, no realiza ninguna acción
    if (this.form.invalid) return;

    this.loading = true;  // Indica que la operación de guardado comenzó
    this.error = null;    // Reinicia el mensaje de error
    this.successMessage = null; // Reinicia el mensaje de éxito

    // Envia los valores actuales del formulario al servicio para guardar
    this.settingsSvc.updateSettings(this.form.value).subscribe({
      next: () => {
        this.successMessage = 'Preferencias guardadas correctamente'; // Mensaje de éxito
        this.loading = false; // Finaliza el estado de carga
      },
      error: () => {
        this.error = 'Error al guardar las preferencias'; // Mensaje de error en caso de fallo
        this.loading = false; // Finaliza el estado de carga
      }
    });
  }
}
