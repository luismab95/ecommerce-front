import { Injectable, signal, computed } from '@angular/core';
import { Wishlist, WishlistItem, Product } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private wishlistSignal = signal<Wishlist>({ items: [], totalItems: 0 });

  // Computed signals
  wishlist = this.wishlistSignal.asReadonly();
  totalItems = computed(() => this.wishlistSignal().totalItems);

  constructor() {
    this.loadFromStorage();
  }

  // Get wishlist
  getWishlist(): Wishlist {
    return this.wishlistSignal();
  }

  // Add product to wishlist
  addToWishlist(product: Product): void {
    const currentWishlist = this.wishlistSignal();

    // Check if product already exists in wishlist
    const existingItem = currentWishlist.items.find((item) => item.product.id === product.id);

    if (existingItem) {
      // Product already in wishlist, do nothing
      return;
    }

    // Add new item to wishlist
    const newItem: WishlistItem = {
      product,
      addedAt: new Date(),
    };

    const updatedWishlist: Wishlist = {
      items: [...currentWishlist.items, newItem],
      totalItems: currentWishlist.totalItems + 1,
    };

    this.wishlistSignal.set(updatedWishlist);
    this.saveToStorage();
  }

  // Remove product from wishlist
  removeFromWishlist(productId: number): void {
    const currentWishlist = this.wishlistSignal();
    const updatedItems = currentWishlist.items.filter((item) => item.product.id !== productId);

    const updatedWishlist: Wishlist = {
      items: updatedItems,
      totalItems: updatedItems.length,
    };

    this.wishlistSignal.set(updatedWishlist);
    this.saveToStorage();
  }

  // Check if product is in wishlist
  isInWishlist(productId: number): boolean {
    return this.wishlistSignal().items.some((item) => item.product.id === productId);
  }

  // Clear wishlist
  clearWishlist(): void {
    this.wishlistSignal.set({ items: [], totalItems: 0 });
    this.saveToStorage();
  }

  // Save to localStorage
  private saveToStorage(): void {
    localStorage.setItem('wishlist', JSON.stringify(this.wishlistSignal()));
  }

  // Load from localStorage
  private loadFromStorage(): void {
    const wishlistStr = localStorage.getItem('wishlist');
    if (wishlistStr) {
      try {
        const wishlist = JSON.parse(wishlistStr);
        // Convert date strings back to Date objects
        wishlist.items = wishlist.items.map((item: WishlistItem) => ({
          ...item,
          addedAt: new Date(item.addedAt),
        }));
        this.wishlistSignal.set(wishlist);
      } catch (e) {
        console.error('Error loading wishlist from storage', e);
      }
    }
  }
}
