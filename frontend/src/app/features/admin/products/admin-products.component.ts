import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'fs-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit {
  private readonly api = inject(ApiService);

  products = signal<any[]>([]);
  users = signal<any[]>([]); // To associate seller id
  selectedProduct = signal<any>(null);
  showEditModal = signal(false);
  isEditMode = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;

  ngOnInit(): void {
    this.loadProducts();
    this.loadUsers();
  }

  loadProducts(): void {
    this.api.get<any>('/api/admin/products', { page: this.page, size: this.size }).subscribe({
      next: (res) => {
        this.products.set(res.content);
        this.totalElements = res.totalElements;
      },
      error: () => this.showError('Failed to load products')
    });
  }

  loadUsers(): void {
    // Load users so admin can select a seller when creating products
    this.api.get<any>('/api/admin/users', { page: 0, size: 100 }).subscribe({
      next: (res) => this.users.set(res.content),
      error: () => {}
    });
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

  onEdit(product: any): void {
    this.isEditMode.set(true);
    // Find seller ID
    const sellerId = product.seller ? product.seller.id : null;
    this.selectedProduct.set({
      ...product,
      sellerId
    });
    this.showEditModal.set(true);
  }

  onSave(): void {
    const product = this.selectedProduct();
    if (!product) return;

    if (this.isEditMode()) {
      this.api.put<any>(`/api/admin/products/${product.id}`, product).subscribe({
        next: () => {
          this.showSuccess('Product updated successfully');
          this.showEditModal.set(false);
          this.loadProducts();
        },
        error: () => this.showError('Failed to save product details')
      });
    } else {
      this.api.post<any>('/api/admin/products', product).subscribe({
        next: () => {
          this.showSuccess('Product created successfully');
          this.showEditModal.set(false);
          this.loadProducts();
        },
        error: () => this.showError('Failed to create product')
      });
    }
  }

  onDelete(product: any): void {
    if (confirm(`Are you sure you want to cancel the listing for ${product.title}?`)) {
      this.api.delete<void>(`/api/admin/products/${product.id}`).subscribe({
        next: () => {
          this.showSuccess('Product listing cancelled');
          this.loadProducts();
        },
        error: () => this.showError('Failed to cancel product')
      });
    }
  }

  nextPage(): void {
    if ((this.page + 1) * this.size < this.totalElements) {
      this.page++;
      this.loadProducts();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadProducts();
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
