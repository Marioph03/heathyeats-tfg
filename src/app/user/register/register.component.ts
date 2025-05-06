import {Component, inject, OnInit, Renderer2} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {environment} from '../../interface/enviroment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  model = {
    username: '',
    full_name: '',
    email: '',
    password_hash: ''
  };
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  isDarkTheme = false;

  private renderer = inject(Renderer2);

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.apiUrl = environment.apiUrl;
  }

  apiUrl!: string;

  ngOnInit(): void {
    console.log('Formulario enviado:', this.model);
    // Inicializa el formulario con validaciones
    this.registerForm = this.fb.group({
      username:    ['', Validators.required],
      full_name:    ['', Validators.required],    // <-- aquí debería ser full_name
      email:       ['', [Validators.required, Validators.email]],
      password_hash:    ['', Validators.required],
      rol:         ['user']
    });
    this.applySavedTheme();
  }

  // Getter para acceder fácilmente a los controles del formulario
  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    // Si el formulario no es válido, salimos
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    // Llamada al endpoint de registro
    this.http
      .post<{ message: string }>(
        `${this.apiUrl}/createUser`,
        this.registerForm.value
      )
      .subscribe({
        next: (response) => {
          // Registro correcto: redirigir a login (o donde quieras)
          this.router.navigate(['/login']);
        },
        error: (err) => {
          // Mostrar mensaje de error
          this.errorMessage =
            err.error?.message || 'Error al registrar el usuario';
          this.loading = false;
        }
      });
  }

  private applySavedTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      this.renderer.addClass(document.body, 'dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.renderer[this.isDarkTheme ? 'addClass' : 'removeClass'](document.body, 'dark-theme');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }
}
