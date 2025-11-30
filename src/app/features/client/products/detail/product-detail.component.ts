import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { Product } from '../../../../core/models/models';
import { CartService } from '../../../../core/services/cart.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductService } from '../../../../core/services/product.service';
import { WishlistService } from '../../../../core/services/wishlist.service';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  imports: [RouterLink, LoadingComponent],
})
export class ProductDetailComponent implements OnInit {
  product = signal<Product | undefined>(undefined);
  loading = signal(true);
  selectedImage = signal<string>('');

  // Zoom functionality signals
  isZoomed = signal(false);
  zoomPosition = signal({ x: 0, y: 0 });

  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private wishlistService = inject(WishlistService);

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(Number(id));
      }
    });
  }

  loadProduct(id: number) {
    this.loading.set(true);
    this.productService
      .getProductById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.product.set(response.data);
          if (response.data && response.data.images.length > 0) {
            this.selectedImage.set(response.data.images[0].path);
          }
        },
      });
  }

  selectImage(url: string) {
    this.selectedImage.set(url);
  }

  onMouseMove(event: MouseEvent) {
    const imageContainer = event.currentTarget as HTMLElement;
    const { left, top, width, height } = imageContainer.getBoundingClientRect();

    // Calculate position as percentage (0-100)
    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;

    this.zoomPosition.set({ x, y });
    this.isZoomed.set(true);
  }

  onMouseLeave() {
    this.isZoomed.set(false);
  }

  addToCart() {
    const product = this.product();
    if (product) {
      this.cartService.addToCart(product, 1);
      this.notificationService.show(`${product.name} agregado al carrito`, 'success');
    }
  }

  toggleWishlist() {
    const product = this.product();
    if (product) {
      if (this.wishlistService.isInWishlist(product.id)) {
        this.wishlistService.removeFromWishlist(product.id);
        this.notificationService.showInfo('Producto eliminado de la lista de deseados');
      } else {
        this.wishlistService.addToWishlist(product);
        this.notificationService.showSuccess('Producto agregado a la lista de deseados');
      }
    }
  }

  isInWishlist(): boolean {
    const product = this.product();
    return product ? this.wishlistService.isInWishlist(product.id) : false;
  }
}
