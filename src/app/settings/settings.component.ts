import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { SettingsService, UserSettings } from '../service/settings.service';
import {NgForOf, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    RouterLink
  ],
  standalone: true
})
export class SettingsComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Opciones replicando ChatGPT
  themes = [
    { label: 'Claro', value: 'light' },
    { label: 'Oscuro', value: 'dark' },
    { label: 'Sistema', value: 'system' }
  ];
  languages = [
    { label: 'Español', value: 'es' },
    { label: 'English', value: 'en' },
    { label: 'Français', value: 'fr' }
  ];

  constructor(
    private fb: FormBuilder,
    private settingsSvc: SettingsService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      theme: ['system'],
      language: ['es'],
      notifications: [true]
    });
    this.loadSettings();
  }

  private loadSettings() {
    this.loading = true;
    this.settingsSvc.getSettings().subscribe({
      next: (s: UserSettings) => {
        this.form.patchValue(s);
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las preferencias';
        this.loading = false;
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    this.settingsSvc.updateSettings(this.form.value).subscribe({
      next: () => {
        this.successMessage = 'Preferencias guardadas correctamente';
        this.loading = false;
      },
      error: () => {
        this.error = 'Error al guardar las preferencias';
        this.loading = false;
      }
    });
  }
}
