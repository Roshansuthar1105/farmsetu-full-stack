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
  selector: 'fs-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminPageHeaderComponent,
    AdminDataTableComponent,
    AdminModalComponent,
    AdminConfirmDialogComponent
  ],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toastr = inject(ToastrService);

  readonly products = signal<any[]>([]);
  readonly users = signal<any[]>([]); // To associate seller id
  readonly loading = signal(true);
  readonly totalElements = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly showEditModal = signal(false);
  readonly isEditMode = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly selectedProduct = signal<any>(null);

  private searchTerm = '';
  private activeFilters: Record<string, string> = {};

  readonly columns: TableColumn[] = [
    {
      key: 'title',
      label: 'Product Info',
      type: 'custom',
      render: (row) => `
        <div>
          <div class="font-semibold text-slate-900 dark:text-white">${row.title}</div>
          <div class="text-xs text-slate-500 truncate max-w-xs">${row.description || 'No description'}</div>
        </div>
      `
    },
    {
      key: 'seller',
      label: 'Seller',
      type: 'custom',
      render: (row) => row.seller?.name || 'Unknown Seller'
    },
    { key: 'category', label: 'Category', type: 'badge' },
    { key: 'price', label: 'Price', type: 'currency' },
    {
      key: 'stock',
      label: 'Qty/Stock',
      type: 'custom',
      render: (row) => `${row.quantity || 0} ${row.unit || 'units'}`
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge',
      badgeColors: {
        ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
        SOLD: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
        CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      }
    },
    { key: 'id', label: 'Actions', type: 'actions', align: 'right' }
  ];

  readonly rowActions: TableAction[] = [
    { label: 'Edit', action: 'edit', color: 'primary' },
    { label: 'Cancel Listing', action: 'delete', color: 'danger', visible: (row) => row.status !== 'CANCELLED' }
  ];

  readonly filters: FilterOption[] = [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'SEEDS', label: 'Seeds' },
        { value: 'FERTILIZERS', label: 'Fertilizers' },
        { value: 'TOOLS', label: 'Tools' },
        { value: 'EQUIPMENT', label: 'Equipment' },
        { value: 'PESTICIDES', label: 'Pesticides' },
        { value: 'ORGANIC_PRODUCTS', label: 'Organic Products' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'ACTIVE', label: 'Active' },
        { value: 'SOLD', label: 'Sold' },
        { value: 'CANCELLED', label: 'Cancelled' }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadData();
    this.loadUsers();
  }

  loadData(): void {
    this.loading.set(true);
    const params: Record<string, string | number | boolean> = { ...this.activeFilters };
    if (this.searchTerm) {
      params['search'] = this.searchTerm;
    }

    this.adminService.list<any>('/api/admin/products', this.page(), this.size(), params).subscribe({
      next: (res) => {
        this.products.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load products');
        this.loading.set(false);
      }
    });
  }

  loadUsers(): void {
    this.adminService.list<any>('/api/admin/users', 0, 100).subscribe({
      next: (res) => this.users.set(res.content || []),
      error: () => {}
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
      this.isEditMode.set(true);
      const sellerId = e.row.seller ? e.row.seller.id : null;
      this.selectedProduct.set({
        ...e.row,
        sellerId
      });
      this.showEditModal.set(true);
    } else if (e.action === 'delete') {
      this.selectedProduct.set(e.row);
      this.showDeleteDialog.set(true);
    }
  }

  onAdd(): void {
    this.isEditMode.set(false);
    this.selectedProduct.set({
      title: '',
      description: '',
      category: 'SEEDS',
      price: 0.0,
      quantity: 10,
      unit: 'kg',
      condition: 'NEW',
      location: '',
      status: 'ACTIVE',
      sellerId: this.users().length > 0 ? this.users()[0].id : null
    });
    this.showEditModal.set(true);
  }

  onSave(): void {
    const product = this.selectedProduct();
    if (!product) return;

    const request$ = this.isEditMode()
      ? this.adminService.update<any>('/api/admin/products', product.id, product)
      : this.adminService.create<any>('/api/admin/products', product);

    request$.subscribe({
      next: () => {
        this.toastr.success(this.isEditMode() ? 'Product listing updated' : 'Product listing created');
        this.showEditModal.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to save product details')
    });
  }

  confirmDelete(): void {
    const product = this.selectedProduct();
    if (!product) return;

    this.adminService.remove('/api/admin/products', product.id).subscribe({
      next: () => {
        this.toastr.success('Product listing cancelled');
        this.showDeleteDialog.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to cancel product listing')
    });
  }
}
