import { Component, computed, inject, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../service/auth.service';
import { RouterModule, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  loginForm!: FormGroup;
  isDarkTheme = false;
  isLogged = computed(() => this.authService.isAuthenticated());

  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private renderer = inject(Renderer2);

  ngOnInit(): void {
    this.redirectIfAuthenticated();
    this.initLoginForm();
    this.applySavedTheme();
    this.loadGoogleAuthScript();
    (window as any).handleCredentialResponse = this.handleCredentialResponse.bind(this);
  }

  private initLoginForm(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  private redirectIfAuthenticated(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  }

  private applySavedTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      this.renderer.addClass(document.body, 'dark-theme');
    }
  }

  private loadGoogleAuthScript(): void {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    const { username, password } = this.loginForm.value;
    this.authService.logIn(username, password)
      .subscribe({
        next: ({ access_token }) => {
          localStorage.setItem('access_token', access_token);
          Swal.fire('Éxito', 'Sesión iniciada con éxito. Redirigiendo...', 'success');
          setTimeout(() => this.router.navigate(['/home']), 2000);
        },
        error: (err) => {
          const message = err.error?.message ?? err.message ?? 'Error desconocido';
          Swal.fire('Error', message, 'error');
        }
      });
  }

  handleCredentialResponse(response: any): void {
    this.authService.loginWithGoogle(response.credential)
      .then(() => {
        Swal.fire('Éxito', 'Inicio de sesión con Google exitoso', 'success');
        localStorage.setItem('access_token', response.credential);
        this.router.navigate(['/home']);
      })
      .catch(err => {
        console.error('Error al iniciar sesión con Google:', err);
        Swal.fire('Error', 'No se pudo iniciar sesión con Google', 'error');
      });
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.renderer[this.isDarkTheme ? 'addClass' : 'removeClass'](document.body, 'dark-theme');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }
}
