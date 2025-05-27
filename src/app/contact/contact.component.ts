import {Component, inject, Renderer2} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../service/auth.service';

@Component({
  selector: 'app-contact',
  imports: [
    RouterLink
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  year = new Date().getFullYear();
  isDarkTheme = false;

  private renderer = inject(Renderer2);
  protected router = inject(Router);
  protected authSrvc = inject(AuthService);

  ngOnInit(): void {
    this.applySavedTheme();
  }

  private applySavedTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.renderer[this.isDarkTheme ? 'addClass' : 'removeClass'](document.body, 'dark-theme');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

}
