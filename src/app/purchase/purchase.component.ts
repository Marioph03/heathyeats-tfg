import {Component, inject, OnInit, Renderer2} from '@angular/core';
import { CommonModule } from '@angular/common';
import { PremiumService, SubscriptionPlan } from '../service/premium.service';
import Swal from 'sweetalert2';
import {FormsModule} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../service/auth.service';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.css']
})
export class PurchaseComponent implements OnInit {
  plans: SubscriptionPlan[] = [];
  loading = true;
  isDarkTheme = false;

  private renderer = inject(Renderer2);
  protected authSrvc = inject(AuthService);
  protected router = inject(Router);

  // Modal
  showModal = false;
  selectedPlan: SubscriptionPlan | null = null;
  paymentProcessing = false;

  constructor(private premiumService: PremiumService) {
  }

  ngOnInit() {
    this.premiumService.getSubscriptionPlans().subscribe(plans => {
      this.plans = plans;
      this.loading = false;
    });
    this.applySavedTheme();
    this.authSrvc.isLoggedIn();
  }

  openPaymentModal(plan: SubscriptionPlan) {
    this.selectedPlan = plan;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.paymentProcessing = false;
  }

  confirmPayment(formValues: {
    cardHolder: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
  }) {
    if (!this.selectedPlan) return;
    this.paymentProcessing = true;

    // Aquí podrías enviar formValues a un gateway real...
    setTimeout(() => {
      this.premiumService.purchasePlan(this.selectedPlan!.id).subscribe({
        next: () => {
          this.paymentProcessing = false;
          this.closeModal();
          Swal.fire({
            icon: 'success',
            title: '¡Compra exitosa!',
            text: `Has desbloqueado el plan ${this.selectedPlan!.name}.`
          });
        },
        error: err => {
          this.paymentProcessing = false;
          Swal.fire({
            icon: 'error',
            title: 'Error al procesar el pago',
            text: err.error?.message || 'Inténtalo de nuevo más tarde.'
          });
        }
      });
    }, 1000);
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
