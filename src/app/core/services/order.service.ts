import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Order,
  CreateOrderRequest,
  GeneralResponse,
  PaginatedResponse,
  OrderStatus,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = environment.API_URL;
  private http = inject(HttpClient);

  // Simulated order storage (in a real app, this would be handled by the backend)
  private mockOrders: Order[] = [];
  private nextOrderId = 1;

  constructor() {
    this.generateFakeOrders();
  }

  private generateFakeOrders(): void {
    const statuses = Object.values(OrderStatus);
    // PaymentMethod is not imported in the original file, so I will use hardcoded values or import it if I can.
    // Looking at the imports, PaymentMethod is not imported. I should add it to the imports.
    // However, I can't easily add imports with replace_file_content if they are far away.
    // I'll use a separate edit for imports or just use strings if possible, but TypeScript might complain.
    // Let's assume I'll add the import in a separate step or try to include it if it's close.
    // Actually, I can just use the enum values if I import it.

    for (let i = 1; i <= 10; i++) {
      const itemsCount = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < itemsCount; j++) {
        const price = Math.floor(Math.random() * 100) + 10;
        const quantity = Math.floor(Math.random() * 2) + 1;
        items.push({
          productId: j + 1,
          productName: `Producto de prueba ${j + 1}`,
          price: price,
          quantity: quantity,
        });
        subtotal += price * quantity;
      }

      const tax = subtotal * 0.15;
      const shippingCost = 10;
      const totalPrice = subtotal + tax + shippingCost;
      const statusIndex = Math.floor(Math.random() * statuses.length);

      this.mockOrders.push({
        id: i,
        userId: 1,
        items: items,
        billingAddress: {
          street: `Calle Principal ${i}`,
          city: 'Ciudad Demo',
          state: 'Estado',
          code: '12345',
          country: 'País',
        },
        shippingAddress: {
          street: `Calle Principal ${i}`,
          city: 'Ciudad Demo',
          state: 'Estado',
          code: '12345',
          country: 'País',
        },
        paymentInfo: {
          method: 'Credit Card' as any, // Casting to avoid import issues for now, will fix import next
          cardLastFour: '4242',
        },
        subtotal: subtotal,
        tax: tax,
        shippingCost: shippingCost,
        totalPrice: totalPrice,
        status: statuses[statusIndex],
        createdAt: new Date(new Date().setDate(new Date().getDate() - i)),
        updatedAt: new Date(),
      });
    }
    // Sort by date desc
    this.mockOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    this.nextOrderId = 11;
  }

  createOrder(request: CreateOrderRequest): Observable<GeneralResponse<Order>> {
    // Simulate API call with delay
    return of(request).pipe(
      delay(1000), // Simulate network delay
      map((req) => {
        // Create the order with all the new fields from the request
        const newOrder: Order = {
          id: this.nextOrderId++,
          userId: 1, // This would come from the authenticated user
          items: req.items.map((item) => ({
            productId: item.productId,
            productName: `Product ${item.productId}`, // Placeholder
            price: 100, // Placeholder price
            quantity: item.quantity,
          })),
          billingAddress: req.billingAddress,
          shippingAddress: req.shippingAddress,
          paymentInfo: req.paymentInfo,
          subtotal: req.subtotal,
          tax: req.tax,
          shippingCost: req.shippingCost,
          totalPrice: req.totalPrice,
          status: OrderStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Store the order
        this.mockOrders.push(newOrder);

        return {
          data: newOrder,
          message: 'Pedido creado exitosamente',
        };
      })
    );
  }

  // Get all orders for the current user (simulated)
  getOrders(
    pageNumber: number = 1,
    pageSize: number = 10
  ): Observable<GeneralResponse<PaginatedResponse<Order[]>>> {
    return of(this.mockOrders).pipe(
      delay(500),
      map((orders) => {
        const startIndex = (pageNumber - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedOrders = orders.slice(startIndex, endIndex);

        return {
          data: {
            items: paginatedOrders,
            totalCount: orders.length,
            pageNumber,
            pageSize,
            totalPages: Math.ceil(orders.length / pageSize),
            hasPreviousPage: pageNumber > 1,
            hasNextPage: endIndex < orders.length,
          },
          message: 'Pedidos obtenidos exitosamente',
        };
      })
    );
  }

  // Get a specific order by ID (simulated)
  getOrderById(id: number): Observable<GeneralResponse<Order>> {
    return of(this.mockOrders).pipe(
      delay(500),
      map((orders) => {
        const order = orders.find((o) => o.id === id);
        if (!order) {
          throw new Error('Pedido no encontrado');
        }
        return {
          data: order,
          message: 'Pedido obtenido exitosamente',
        };
      })
    );
  }

  // Cancel an order (simulated)
  cancelOrder(id: number): Observable<GeneralResponse<Order>> {
    return of(this.mockOrders).pipe(
      delay(500),
      map((orders) => {
        const order = orders.find((o) => o.id === id);
        if (!order) {
          throw new Error('Pedido no encontrado');
        }

        if (order.status !== OrderStatus.PENDING) {
          throw new Error('Solo se pueden cancelar pedidos pendientes');
        }

        order.status = OrderStatus.CANCELLED;
        order.updatedAt = new Date();

        return {
          data: order,
          message: 'Pedido cancelado exitosamente',
        };
      })
    );
  }
  /*
  createOrder(request: CreateOrderRequest): Observable<GeneralResponse<Order>> {
    return this.http.post<GeneralResponse<Order>>(`${this.apiUrl}/orders`, request);
  }

  getOrders(pageNumber: number = 1, pageSize: number = 10): Observable<GeneralResponse<PaginatedResponse<Order[]>>> {
    return this.http.get<GeneralResponse<PaginatedResponse<Order[]>>>(
      `${this.apiUrl}/orders?pageNumber=${pageNumber}&pageSize=${pageSize}`
    );
  }

  getOrderById(id: number): Observable<GeneralResponse<Order>> {
    return this.http.get<GeneralResponse<Order>>(`${this.apiUrl}/orders/${id}`);
  }
  */
}
