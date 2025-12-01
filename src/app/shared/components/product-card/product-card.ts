import { Component, input, output, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { Product, User } from '../../../core/models/models';
import { WishlistService } from '../../../core/services/wishlist.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.html',
  imports: [RouterLink],
})
export class ProductCardComponent implements OnInit {
  // Services
  private wishlistService = inject(WishlistService);
  public authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  // Input signals
  product = input.required<Product>();
  showFeaturedBadge = input<boolean>(true);
  isSaving = signal<boolean>(false);
  currentUser = signal<User | null>(null);

  // Output signals
  addToCartClick = output<Product>();
  viewDetailsClick = output<Product>();

  ngOnInit(): void {
    this.currentUser.set(this.authService.currentUser());
  }

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
    this.isSaving.set(true);

    this.wishlistService
      .toggleWishlist(this.product().id, this.currentUser()?.id!)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (response) => {
          this.notificationService.showSuccess(response.data);
        },
      });
  }

  isInWishlist(): boolean {
    return this.wishlistService.isInWishlist(this.product().id);
  }
}
