import {Component, inject, Renderer2} from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-menu-list',
  imports: [NgIf, NgFor, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  standalone: true
})
export class HomeComponent {
  isDarkTheme = false;
  currentYear = new Date().getFullYear();

  private renderer = inject(Renderer2);

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
