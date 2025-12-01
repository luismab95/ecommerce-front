import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { AuthModalService } from '../../../core/services/auth-modal.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  imports: [RouterLink],
})
export class CartComponent {
  cartService = inject(CartService);
  private authService = inject(AuthService);
  private authModalService = inject(AuthModalService);
  private router = inject(Router);

  // Increase quantity
  increaseQuantity(productId: number, currentQuantity: number): void {
    this.cartService.updateQuantity(productId, currentQuantity + 1);
  }

  // Decrease quantity
  decreaseQuantity(productId: number, currentQuantity: number): void {
    if (currentQuantity > 1) {
      this.cartService.updateQuantity(productId, currentQuantity - 1);
    }
  }

  // Remove item from cart
  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  // Proceed to checkout
  proceedToCheckout(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/checkout']);
    } else {
      // Open login modal if not authenticated
      this.authModalService.openLogin();
    }
  }
}
