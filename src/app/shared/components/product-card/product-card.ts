import { Component, input, output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models/models';
import { WishlistService } from '../../../core/services/wishlist.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.html',
  imports: [RouterLink],
})
export class ProductCardComponent {
  // Services
  private wishlistService = inject(WishlistService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Input signals
  product = input.required<Product>();
  showFeaturedBadge = input<boolean>(true);

  // Output signals
  addToCartClick = output<Product>();
  viewDetailsClick = output<Product>();

  onAddToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.addToCartClick.emit(this.product());
  }

  onViewDetails() {
    this.viewDetailsClick.emit(this.product());
  }

  toggleWishlist(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    const product = this.product();
    if (this.wishlistService.isInWishlist(product.id)) {
      this.wishlistService.removeFromWishlist(product.id);
      this.notificationService.showInfo('Producto eliminado de la lista de deseados');
    } else {
      this.wishlistService.addToWishlist(product);
      this.notificationService.showSuccess('Producto agregado a la lista de deseados');
    }
  }

  isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product().id);
  }
}
