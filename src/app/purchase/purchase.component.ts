import { Component, inject, OnInit, Renderer2 } from '@angular/core';          // Decorador del componente y ciclo de vida.
import { CommonModule } from '@angular/common';                               // Funciones comunes, como *ngFor y *ngIf.
import { PremiumService, SubscriptionPlan } from '../service/premium.service'; // Servicio para gestionar los planes de suscripción.
import Swal from 'sweetalert2';                                               // Biblioteca para mostrar alertas personalizadas.
import { FormsModule } from '@angular/forms';                                 // Módulo para manejar formularios.
import { Router, RouterLink } from '@angular/router';                         // Navegación y enlaces.
import { AuthService } from '../service/auth.service';                        // Servicio para gestionar la autenticación del usuario.

// -------------------------------------------------------------------------------
// Decorador @Component
// -------------------------------------------------------------------------------

@Component({
  selector: 'app-purchase',                     // Selector del componente.
  standalone: true,                             // Componente autónomo.
  imports: [CommonModule, FormsModule, RouterLink], // Módulos importados en la plantilla.
  templateUrl: './purchase.component.html',     // Ruta al archivo HTML asociado.
  styleUrls: ['./purchase.component.css']       // Ruta al archivo CSS del componente.
})
export class PurchaseComponent implements OnInit {
  // ---------------------------------------------------------------------------
  // Propiedades
  // ---------------------------------------------------------------------------

  plans: SubscriptionPlan[] = [];               // Lista de planes de suscripción disponibles.
  loading = true;                               // Indica si se están cargando los planes.
  isDarkTheme = false;                          // Indica si está activado el tema oscuro.

  // Modal (para seleccionar un plan y procesar el pago).
  showModal = false;                            // Muestra u oculta el modal de pago.
  selectedPlan: SubscriptionPlan | null = null; // Plan seleccionado para la compra.
  paymentProcessing = false;                    // Indica si el pago está siendo procesado.

  // ---------------------------------------------------------------------------
  // Dependencias inyectadas
  // ---------------------------------------------------------------------------

  private renderer = inject(Renderer2);         // Utilizado para manipular el DOM (aplicar temas).
  protected authSrvc = inject(AuthService);     // Servicio para gestionar la autenticación.
  protected router = inject(Router);            // Servicio de navegación.

  constructor(private premiumService: PremiumService) {}

  // ---------------------------------------------------------------------------
  // Métodos del Ciclo de Vida
  // ---------------------------------------------------------------------------

  /**
   * Hook `ngOnInit`: Carga los planes de suscripción disponibles y aplica el tema guardado.
   * También verifica si el usuario está autenticado.
   */
  ngOnInit() {
    this.premiumService.getSubscriptionPlans().subscribe(plans => {
      this.plans = plans;         // Asigna los planes recuperados.
      this.loading = false;       // Finaliza el estado de carga.
    });

    this.applySavedTheme();       // Aplica el tema oscuro (si está guardado en localStorage).
    this.authSrvc.isLogged();   // Verifica si el usuario está autenticado.
  }

  // ---------------------------------------------------------------------------
  // Métodos Públicos
  // ---------------------------------------------------------------------------

  /**
   * Método `openPaymentModal`: Abre el modal de pago para el plan seleccionado.
   * @param plan Plan de suscripción seleccionado por el usuario.
   */
  openPaymentModal(plan: SubscriptionPlan) {
    this.selectedPlan = plan;
    this.showModal = true;    // Muestra el modal de pago.
  }

  /**
   * Método `closeModal`: Cierra el modal de pago y resetea el estado de procesamiento.
   */
  closeModal() {
    this.showModal = false;   // Oculta el modal.
    this.paymentProcessing = false; // Reinicia el estado de procesamiento.
  }

  /**
   * Método `confirmPayment`: Simula la confirmación de pago para el plan seleccionado.
   * @param formValues Valores del formulario de pago (nombre del titular, tarjeta, fecha, etc.).
   */
  confirmPayment(formValues: {
    cardHolder: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
  }) {
    if (!this.selectedPlan) return; // Si no hay un plan seleccionado, no realiza la operación.
    this.paymentProcessing = true; // Activa el estado de procesamiento.

    // Simula el envío de datos al backend.
    setTimeout(() => {
      this.premiumService.purchasePlan(this.selectedPlan!.id).subscribe({
        next: () => {
          this.paymentProcessing = false; // Finaliza el pago exitoso.
          this.closeModal();             // Cierra el modal.
          Swal.fire({
            icon: 'success',              // Muestra una alerta de éxito.
            title: '¡Compra exitosa!',
            text: `Has desbloqueado el plan ${this.selectedPlan!.name}.`
          });
        },
        error: err => {
          this.paymentProcessing = false; // Finaliza el estado de procesamiento.
          Swal.fire({
            icon: 'error',                // Muestra una alerta de error.
            title: 'Error al procesar el pago',
            text: err.error?.message || 'Inténtalo de nuevo más tarde.'
          });
        }
      });
    }, 1000); // Simulación de un retraso en el pago.
  }

  /**
   * Método `toggleTheme`: Alterna entre temas claro y oscuro.
   * Guarda la preferencia en `localStorage` y la aplica en el DOM.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.renderer[this.isDarkTheme ? 'addClass' : 'removeClass'](document.body, 'dark-theme');
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
  }

  // ---------------------------------------------------------------------------
  // Métodos Privados
  // ---------------------------------------------------------------------------

  /**
   * Método `applySavedTheme`: Aplica el tema (oscuro o claro) guardado en `localStorage`.
   */
  private applySavedTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme'); // Aplica la clase de tema oscuro al cuerpo.
    }
  }
}
