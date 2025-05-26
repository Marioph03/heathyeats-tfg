// ejemplo: src/app/components/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { UserService, UserProfile } from '../service/user.service';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    NgIf,
    RouterLink
  ],
  templateUrl: './profile.component.html'
})
export class ProfileComponent implements OnInit {
  profile!: UserProfile;
  form!: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private userSvc: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: [''],
      full_name: [''],
      password_hash: ['']
      // agrega más controls si tu API los incluye
    });
    this.loadProfile();
  }

  loadProfile() {
    this.loading = true;
    this.userSvc.getProfile().subscribe({
      next: profile => {
        this.profile = profile;
        this.form.patchValue(profile);
        this.loading = false;
      },
      error: err => {
        this.error = 'No se pudo cargar el perfil';
        this.loading = false;
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;
    this.userSvc.updateProfile(this.form.value).subscribe({
      next: updated => {
        this.profile = updated;
        this.loading = false;
      },
      error: err => {
        this.error = 'Error al actualizar el perfil';
        this.loading = false;
      }
    });
  }
}
