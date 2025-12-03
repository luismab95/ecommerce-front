import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { finalize } from 'rxjs';
import { Order, OrderStatus } from '../../../../core/models/models';
import { OrderService } from '../../../../core/services/order.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  imports: [ConfirmModalComponent, RouterLink, NgClass],
})
export class OrderDetailComponent implements OnInit {
  order = signal<Order | null>(null);
  loading = signal(false);
  OrderStatus = OrderStatus;
  showCancelModal = signal(false);

  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetail(parseInt(orderId, 10));
    }
  }

  loadOrderDetail(orderId: number): void {
    this.loading.set(true);
    this.orderService
      .getOrderById(orderId)
      .pipe(
        finalize(() => {
          this.loading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          this.order.set(response.data);
        },
        error: () => {
          this.router.navigate(['/orders']);
        },
      });
  }

  openCancelModal(): void {
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
  }

  confirmCancelOrder(): void {
    const currentOrder = this.order();
    if (!currentOrder) return;

    this.loading.set(true);
    this.orderService
      .cancelOrder(currentOrder.id)

      .pipe(
        finalize(() => {
          this.loading.set(false);
          this.closeCancelModal();
        })
      )
      .subscribe({
        next: (response) => {
          this.notificationService.show(response.message, 'success');
          this.loadOrderDetail(this.order()?.id!);
        },
      });
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case OrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return '⏳';
      case OrderStatus.PROCESSING:
        return '⚙️';
      case OrderStatus.SHIPPED:
        return '🚚';
      case OrderStatus.DELIVERED:
        return '✅';
      case OrderStatus.CANCELLED:
        return '❌';
      default:
        return '📦';
    }
  }

  getStatusSteps(): { label: string; status: OrderStatus; completed: boolean }[] {
    const currentOrder = this.order();
    if (!currentOrder) return [];

    const statusOrder = [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];

    const currentIndex = statusOrder.indexOf(currentOrder.status);

    return statusOrder.map((status, index) => ({
      label: this.getStatus(status),
      status,
      completed: index <= currentIndex,
    }));
  }

  getProgressWidth(): string {
    const steps = this.getStatusSteps();
    const completedCount = steps.filter((step) => step.completed).length;
    const percentage = (completedCount - 1) * 33.33;
    return `${percentage}%`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getStatus(status: OrderStatus) {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Pendiente';
      case OrderStatus.PROCESSING:
        return 'Procesando';
      case OrderStatus.SHIPPED:
        return 'Enviado';
      case OrderStatus.DELIVERED:
        return 'Entregado';
      case OrderStatus.CANCELLED:
        return 'Cancelado';
      default:
        return 'Estado Desconocido';
    }
  }
}
