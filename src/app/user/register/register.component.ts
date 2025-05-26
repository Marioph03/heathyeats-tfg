import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../interface/enviroment';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  isDarkTheme = false;

  private renderer = inject(Renderer2);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  ngOnInit(): void {
    this.initForm();
    this.applySavedTheme();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      username: ['',[Validators.required]],
      full_name: ['',[Validators.required]],
      email: ['',[Validators.required, Validators.email]],
      password: ['',[Validators.required]],
      rol: ['user']
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.http
      .post<{ message: string }>(
        `${this.apiUrl}/createUser`,
        this.registerForm.value
      )
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error al registrar el usuario';
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
