import {Component, Inject, inject, Renderer2} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../service/auth.service';

@Component({
  selector: 'app-menu-list',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent {
  isDarkTheme = false;
  currentYear = new Date().getFullYear();

  private renderer = inject(Renderer2);
  protected authSrvc = inject(AuthService);
  protected router = inject(Router);

  ngOnInit(): void {
    this.applySavedTheme();
    this.authSrvc.isLoggedIn();
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

  logout(): void {
    this.authSrvc.logout();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToSettings(): void {
    this.router.navigate(['/settings']);
  }
}
