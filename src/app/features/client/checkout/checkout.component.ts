import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TaxService } from '../../../core/services/tax.service';
import { CreateOrderRequest, PaymentMethod } from '../../../core/models/models';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);
  private taxService = inject(TaxService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  isProcessing = signal(false);
  sameAsBilling = signal(false);

  // Price calculations
  subtotal = signal(0);
  tax = signal(0);
  shippingCost = signal(0);
  total = signal(0);

  // Payment methods
  paymentMethods = Object.values(PaymentMethod);
  selectedPaymentMethod = signal<PaymentMethod>(PaymentMethod.CREDIT_CARD);

  // Forms
  billingAddressForm!: FormGroup;
  shippingAddressForm!: FormGroup;
  paymentForm!: FormGroup;

  constructor() {
    // Watch for same as billing checkbox
    effect(() => {
      if (this.sameAsBilling()) {
        this.copyBillingToShipping();
      }
    });
  }

  ngOnInit(): void {
    this.initializeForms();
    this.calculatePrices();

    // Watch for shipping address state changes to recalculate tax
    this.shippingAddressForm.get('state')?.valueChanges.subscribe(() => {
      this.calculatePrices();
    });
  }

  initializeForms(): void {
    // Billing Address Form
    this.billingAddressForm = this.fb.group({
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      country: ['USA', [Validators.required]],
    });

    // Shipping Address Form
    this.shippingAddressForm = this.fb.group({
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      country: ['USA', [Validators.required]],
    });

    // Payment Form
    this.paymentForm = this.fb.group({
      cardHolderName: ['', [Validators.required, Validators.minLength(3)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
      expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    });
  }

  calculatePrices(): void {
    const cartTotal = this.cartService.totalPrice();
    this.subtotal.set(cartTotal);

    // Calculate shipping
    this.taxService.calculateShipping(cartTotal).subscribe((shipping) => {
      this.shippingCost.set(shipping);
      this.updateTotal();
    });

    // Calculate tax based on shipping state
    const shippingState = this.shippingAddressForm.get('state')?.value;
    if (shippingState && shippingState.length >= 2) {
      this.taxService.calculateTax(cartTotal, shippingState).subscribe((taxAmount) => {
        this.tax.set(taxAmount);
        this.updateTotal();
      });
    } else {
      this.tax.set(0);
      this.updateTotal();
    }
  }

  updateTotal(): void {
    const totalAmount = this.subtotal() + this.tax() + this.shippingCost();
    this.total.set(totalAmount);
  }

  toggleSameAsBilling(): void {
    this.sameAsBilling.set(!this.sameAsBilling());
    if (this.sameAsBilling()) {
      this.copyBillingToShipping();
    }
  }

  copyBillingToShipping(): void {
    const billingValues = this.billingAddressForm.value;
    this.shippingAddressForm.patchValue(billingValues);
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod.set(method);

    // Update payment form validators based on method
    if (method === PaymentMethod.CREDIT_CARD || method === PaymentMethod.DEBIT_CARD) {
      this.paymentForm
        .get('cardHolderName')
        ?.setValidators([Validators.required, Validators.minLength(3)]);
      this.paymentForm
        .get('cardNumber')
        ?.setValidators([Validators.required, Validators.pattern(/^\d{13,19}$/)]);
      this.paymentForm
        .get('expiryDate')
        ?.setValidators([Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]);
      this.paymentForm
        .get('cvv')
        ?.setValidators([Validators.required, Validators.pattern(/^\d{3,4}$/)]);
    } else {
      // For PayPal and Bank Transfer, card details are not required
      this.paymentForm.get('cardHolderName')?.clearValidators();
      this.paymentForm.get('cardNumber')?.clearValidators();
      this.paymentForm.get('expiryDate')?.clearValidators();
      this.paymentForm.get('cvv')?.clearValidators();
    }

    this.paymentForm.get('cardHolderName')?.updateValueAndValidity();
    this.paymentForm.get('cardNumber')?.updateValueAndValidity();
    this.paymentForm.get('expiryDate')?.updateValueAndValidity();
    this.paymentForm.get('cvv')?.updateValueAndValidity();
  }

  isFormValid(): boolean {
    const billingValid = this.billingAddressForm.valid;
    const shippingValid = this.shippingAddressForm.valid;
    const paymentValid =
      this.selectedPaymentMethod() === PaymentMethod.CREDIT_CARD ||
      this.selectedPaymentMethod() === PaymentMethod.DEBIT_CARD
        ? this.paymentForm.valid
        : true;

    return billingValid && shippingValid && paymentValid && this.cartService.cartItems().length > 0;
  }

  // Place order
  placeOrder(): void {
    if (!this.isFormValid()) {
      this.notificationService.show('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    if (this.cartService.cartItems().length === 0) {
      this.notificationService.show('El carrito está vacío', 'warning');
      return;
    }

    this.isProcessing.set(true);

    // Get last 4 digits of card if applicable
    let cardLastFour = '';
    if (
      this.selectedPaymentMethod() === PaymentMethod.CREDIT_CARD ||
      this.selectedPaymentMethod() === PaymentMethod.DEBIT_CARD
    ) {
      const cardNumber = this.paymentForm.get('cardNumber')?.value || '';
      cardLastFour = cardNumber.slice(-4);
    }

    // Prepare order request
    const orderRequest: CreateOrderRequest = {
      items: this.cartService.cartItems().map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      billingAddress: this.billingAddressForm.value,
      shippingAddress: this.shippingAddressForm.value,
      paymentInfo: {
        method: this.selectedPaymentMethod(),
        cardHolderName: this.paymentForm.get('cardHolderName')?.value,
        cardLastFour: cardLastFour,
      },
      subtotal: this.subtotal(),
      tax: this.tax(),
      shippingCost: this.shippingCost(),
      totalPrice: this.total(),
    };

    // Create order
    this.orderService
      .createOrder(orderRequest)
      .pipe(finalize(() => this.isProcessing.set(false)))
      .subscribe({
        next: (response) => {
          this.notificationService.show(response.message, 'success');
          this.cartService.clearCart();
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.notificationService.show(error.message || 'Error al procesar el pedido', 'error');
        },
      });
  }
}
