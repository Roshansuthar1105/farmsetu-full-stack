import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../services/admin.service';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn, TableAction, FilterOption } from '../shared/admin-data-table/admin-data-table.component';
import { AdminModalComponent } from '../shared/admin-modal/admin-modal.component';
import { AdminConfirmDialogComponent } from '../shared/admin-confirm-dialog/admin-confirm-dialog.component';

@Component({
  selector: 'fs-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminPageHeaderComponent,
    AdminDataTableComponent,
    AdminModalComponent,
    AdminConfirmDialogComponent
  ],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toastr = inject(ToastrService);

  readonly orders = signal<any[]>([]);
  readonly loading = signal(true);
  readonly totalElements = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly showEditModal = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly selectedOrder = signal<any>(null);

  private searchTerm = '';
  private activeFilters: Record<string, string> = {};

  readonly columns: TableColumn[] = [
    { key: 'id', label: 'Order ID', width: '80px' },
    {
      key: 'participants',
      label: 'Buyer / Seller',
      type: 'custom',
      render: (row) => `
        <div class="text-xs">
          <div><span class="font-medium text-slate-400">Buyer:</span> ${row.buyer?.name || 'N/A'}</div>
          <div class="mt-0.5"><span class="font-medium text-slate-400">Seller:</span> ${row.seller?.name || 'N/A'}</div>
        </div>
      `
    },
    {
      key: 'product',
      label: 'Product Info',
      type: 'custom',
      render: (row) => `
        <div>
          <div class="font-medium text-slate-900 dark:text-white">${row.product?.title || 'N/A'}</div>
          <div class="text-xs text-slate-500">Qty: ${row.quantity || 0}</div>
        </div>
      `
    },
    { key: 'totalAmount', label: 'Total Amount', type: 'currency' },
    {
      key: 'paymentStatus',
      label: 'Payment',
      type: 'badge',
      badgeColors: {
        PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        REFUNDED: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400'
      }
    },
    {
      key: 'deliveryStatus',
      label: 'Delivery',
      type: 'badge',
      badgeColors: {
        DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        SHIPPED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
        CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        RETURNED: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400'
      }
    },
    { key: 'id', label: 'Actions', type: 'actions', align: 'right' }
  ];

  readonly rowActions: TableAction[] = [
    { label: 'Edit', action: 'edit', color: 'primary' },
    { label: 'Delete', action: 'delete', color: 'danger' }
  ];

  readonly filters: FilterOption[] = [
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'PAID', label: 'Paid' },
        { value: 'FAILED', label: 'Failed' },
        { value: 'REFUNDED', label: 'Refunded' }
      ]
    },
    {
      key: 'deliveryStatus',
      label: 'Delivery Status',
      options: [
        { value: 'PENDING', label: 'Pending' },
        { value: 'CONFIRMED', label: 'Confirmed' },
        { value: 'SHIPPED', label: 'Shipped' },
        { value: 'DELIVERED', label: 'Delivered' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'RETURNED', label: 'Returned' }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    const params: Record<string, string | number | boolean> = { ...this.activeFilters };
    if (this.searchTerm) {
      params['search'] = this.searchTerm;
    }

    this.adminService.list<any>('/api/admin/orders', this.page(), this.size(), params).subscribe({
      next: (res) => {
        this.orders.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load orders');
        this.loading.set(false);
      }
    });
  }

  onPageChange(e: { page: number; size: number }): void {
    this.page.set(e.page);
    this.size.set(e.size);
    this.loadData();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.page.set(0);
    this.loadData();
  }

  onFilterChange(filters: Record<string, string>): void {
    this.activeFilters = filters;
    this.page.set(0);
    this.loadData();
  }

  onRowAction(e: { action: string; row: any }): void {
    if (e.action === 'edit') {
      this.selectedOrder.set({ ...e.row });
      this.showEditModal.set(true);
    } else if (e.action === 'delete') {
      this.selectedOrder.set(e.row);
      this.showDeleteDialog.set(true);
    }
  }

  onSave(): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.adminService.update<any>('/api/admin/orders', order.id, order).subscribe({
      next: () => {
        this.toastr.success('Order updated successfully');
        this.showEditModal.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to update order')
    });
  }

  confirmDelete(): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.adminService.remove('/api/admin/orders', order.id).subscribe({
      next: () => {
        this.toastr.success('Order deleted successfully');
        this.showDeleteDialog.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to delete order')
    });
  }
}
