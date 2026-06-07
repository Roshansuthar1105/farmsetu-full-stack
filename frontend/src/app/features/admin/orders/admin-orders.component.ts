import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'fs-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  private readonly api = inject(ApiService);

  orders = signal<any[]>([]);
  selectedOrder = signal<any>(null);
  showEditModal = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.api.get<any>('/api/admin/orders', { page: this.page, size: this.size }).subscribe({
      next: (res) => {
        this.orders.set(res.content);
        this.totalElements = res.totalElements;
      },
      error: () => this.showError('Failed to load orders')
    });
  }

  onEdit(order: any): void {
    this.selectedOrder.set({ ...order });
    this.showEditModal.set(true);
  }

  onSave(): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.api.put<any>(`/api/admin/orders/${order.id}`, order).subscribe({
      next: () => {
        this.showSuccess('Order updated successfully');
        this.showEditModal.set(false);
        this.loadOrders();
      },
      error: () => this.showError('Failed to save order details')
    });
  }

  onDelete(order: any): void {
    if (confirm(`Are you sure you want to delete order #${order.id}?`)) {
      this.api.delete<void>(`/api/admin/orders/${order.id}`).subscribe({
        next: () => {
          this.showSuccess('Order deleted successfully');
          this.loadOrders();
        },
        error: () => this.showError('Failed to delete order')
      });
    }
  }

  nextPage(): void {
    if ((this.page + 1) * this.size < this.totalElements) {
      this.page++;
      this.loadOrders();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadOrders();
    }
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  private showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 3000);
  }
}
