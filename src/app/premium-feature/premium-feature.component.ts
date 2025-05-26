import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-premium-features',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './premium-feature.component.html',
  styleUrls: ['./premium-feature.component.css']
})
export class PremiumFeaturesComponent {}
