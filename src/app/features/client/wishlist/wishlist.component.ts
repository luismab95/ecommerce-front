import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WishlistService } from '../../../core/services/wishlist.service';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Product, WishlistItem } from '../../../core/models/models';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-wishlist',
  imports: [ProductCardComponent, PaginationComponent],
  templateUrl: './wishlist.component.html',
})
export class WishlistComponent implements OnInit {
  wishlistItems = signal<WishlistItem[]>([]);
  totalItems = signal(0);

  currentPage = signal(1);
  pageSize = signal(5);
  totalPages = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);

  private wishlistService = inject(WishlistService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    const wishlist = this.wishlistService.getWishlist();
    this.wishlistItems.set(wishlist.items);
    this.totalItems.set(wishlist.totalItems);
  }

  addToCart(item: Product): void {
    this.cartService.addToCart(item, 1);
    this.notificationService.showSuccess('Producto agregado al carrito');
  }

  removeFromWishlist(productId: number): void {
    this.wishlistService.removeFromWishlist(productId);
    this.loadWishlist();
    this.notificationService.showSuccess('Producto eliminado de la lista de deseados');
  }

  viewProductDetail(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  getProductImage(item: WishlistItem): string {
    if (item.product.images && item.product.images.length > 0) {
      return item.product.images[0].path;
    }
    return 'https://via.placeholder.com/300x300?text=No+Image';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  changePage(page: number) {
    this.currentPage.set(page);
    // this.loadCategories();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
