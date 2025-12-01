import { Injectable, signal, computed } from '@angular/core';
import { Cart, CartItem, Product } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'shopping_cart';

  // Signal to hold cart items
  private cartItemsSignal = signal<CartItem[]>([]);

  // Public readonly signals
  readonly cartItems = this.cartItemsSignal.asReadonly();

  // Computed signals
  readonly itemCount = computed(() => {
    return this.cartItemsSignal().reduce((total, item) => total + item.quantity, 0);
  });

  readonly totalPrice = computed(() => {
    return this.cartItemsSignal().reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  });

  readonly cart = computed<Cart>(() => ({
    items: this.cartItemsSignal(),
    totalItems: this.itemCount(),
    totalPrice: this.totalPrice(),
  }));

  constructor() {
    this.loadCartFromStorage();
  }

  // Add product to cart
  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = [...this.cartItemsSignal()];
    const existingItemIndex = currentItems.findIndex((item) => item.product.id === product.id);

    if (existingItemIndex > -1) {
      // Update quantity if product already exists
      currentItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      currentItems.push({ product, quantity });
    }

    this.cartItemsSignal.set(currentItems);
    this.saveCartToStorage();
  }

  // Remove product from cart
  removeFromCart(productId: number): void {
    const currentItems = this.cartItemsSignal().filter((item) => item.product.id !== productId);
    this.cartItemsSignal.set(currentItems);
    this.saveCartToStorage();
  }

  // Update quantity of a product in cart
  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = [...this.cartItemsSignal()];
    const itemIndex = currentItems.findIndex((item) => item.product.id === productId);

    if (itemIndex > -1) {
      currentItems[itemIndex].quantity = quantity;
      this.cartItemsSignal.set(currentItems);
      this.saveCartToStorage();
    }
  }

  // Clear entire cart
  clearCart(): void {
    this.cartItemsSignal.set([]);
    this.saveCartToStorage();
  }

  // Get cart data
  getCart(): Cart {
    return this.cart();
  }

  // Private methods for localStorage persistence
  private saveCartToStorage(): void {
    try {
      const cartData = this.cartItemsSignal();
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private loadCartFromStorage(): void {
    try {
      const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
      if (cartData) {
        const items = JSON.parse(cartData) as CartItem[];
        this.cartItemsSignal.set(items);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.cartItemsSignal.set([]);
    }
  }
}
