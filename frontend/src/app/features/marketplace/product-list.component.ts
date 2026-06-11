import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { Product, ProductCategory } from '../../core/models/product.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastrService } from 'ngx-toastr';
import {
  LucidePlus,
  LucideSearch,
  LucideX,
  LucideGrid,
  LucideSprout,
  LucideBeaker,
  LucideWrench,
  LucideTractor,
  LucideBug,
  LucideLeaf,
  LucideSliders,
  LucideStar,
  LucideUser,
  LucideImage,
  LucideUploadCloud,
  LucideShoppingBag
} from '@lucide/angular';

interface CategoryItem {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'fs-product-list',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    LoadingSkeletonComponent,
    LucidePlus,
    LucideSearch,
    LucideX,
    LucideGrid,
    LucideSprout,
    LucideBeaker,
    LucideWrench,
    LucideTractor,
    LucideBug,
    LucideLeaf,
    LucideSliders,
    LucideStar,
    LucideUser,
    LucideImage,
    LucideUploadCloud,
    LucideShoppingBag
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  private readonly toastr = inject(ToastrService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly showCreateModal = signal(false);
  readonly submitting = signal(false);
  readonly imageUploading = signal(false);

  // Search & Filter state
  searchQuery = '';
  readonly selectedCategory = signal<string>('ALL');

  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  stockStatus = 'ALL';
  sortBy = 'newest';

  // debouncer
  private searchTimeout: any;

  readonly categories: CategoryItem[] = [
    { key: 'ALL', label: 'All Products', icon: 'grid_view' },
    { key: 'SEEDS', label: 'Seeds', icon: 'grass' },
    { key: 'FERTILIZERS', label: 'Fertilizers', icon: 'science' },
    { key: 'TOOLS', label: 'Tools', icon: 'construction' },
    { key: 'EQUIPMENT', label: 'Equipment', icon: 'agriculture' },
    { key: 'PESTICIDES', label: 'Pesticides', icon: 'bug_report' },
    { key: 'ORGANIC_PRODUCTS', label: 'Organic', icon: 'eco' }
  ];

  // Form Model
  form = {
    title: '',
    category: 'SEEDS' as ProductCategory,
    description: '',
    price: 0,
    stock: 25,
    lowStockThreshold: 5,
    unit: 'Kg',
    condition: 'NEW' as 'NEW' | 'USED',
    location: '',
    auction: false,
    startingBid: 0,
    auctionEndTime: undefined as string | undefined
  };
  auctionEndDate = '';
  readonly uploadedImages = signal<string[]>([]);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    const cat = this.selectedCategory() === 'ALL' ? '' : this.selectedCategory();
    
    this.marketplace.list(
      0, 
      50, 
      cat, 
      this.searchQuery, 
      this.minPrice, 
      this.maxPrice, 
      this.minRating, 
      this.stockStatus, 
      this.sortBy
    ).subscribe({
      next: (page) => {
        this.products.set(page.content);
        this.loading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load products', 'Error');
        this.loading.set(false);
      }
    });
  }

  onSearchChange(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadProducts();
    }, 400);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadProducts();
  }

  selectCategory(categoryKey: string): void {
    this.selectedCategory.set(categoryKey);
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory.set('ALL');
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.minRating = undefined;
    this.stockStatus = 'ALL';
    this.sortBy = 'newest';
    this.loadProducts();
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files: File[] = Array.from(input.files);
    this.imageUploading.set(true);
    
    this.marketplace.uploadImages(files).subscribe({
      next: (urls) => {
        this.uploadedImages.update(existing => [...existing, ...urls]);
        this.imageUploading.set(false);
        this.toastr.success('Images uploaded successfully');
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Failed to upload images';
        this.toastr.error(errorMsg);
        this.imageUploading.set(false);
      }
    });
  }

  removeUploadedImage(index: number): void {
    this.uploadedImages.update(existing => existing.filter((_, idx) => idx !== index));
  }

  submitProduct(): void {
    if (!this.form.title || !this.form.price || this.form.stock == null) {
      this.toastr.warning('Please fill out all required fields.', 'Validation');
      return;
    }

    this.submitting.set(true);
    
    // Build request payload
    const body: any = {
      ...this.form,
      quantity: this.form.stock, // keep quantity populated for compatibility
      images: this.uploadedImages()
    };

    if (this.form.auction) {
      body.startingBid = this.form.startingBid || this.form.price;
      if (this.auctionEndDate) {
        body.auctionEndTime = new Date(this.auctionEndDate).toISOString();
      }
    }

    this.marketplace.create(body).subscribe({
      next: () => {
        this.toastr.success('Your listing has been created successfully!', 'Listing Created');
        this.showCreateModal.set(false);
        this.submitting.set(false);
        this.resetForm();
        this.loadProducts();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Failed to list product.', 'Error');
        this.submitting.set(false);
      }
    });
  }

  private resetForm(): void {
    this.form = {
      title: '',
      category: 'SEEDS',
      description: '',
      price: 0,
      stock: 25,
      lowStockThreshold: 5,
      unit: 'Kg',
      condition: 'NEW',
      location: '',
      auction: false,
      startingBid: 0,
      auctionEndTime: undefined
    };
    this.auctionEndDate = '';
    this.uploadedImages.set([]);
  }

  getStockStatusText(status: string): string {
    switch (status) {
      case 'IN_STOCK': return 'In Stock';
      case 'LOW_STOCK': return 'Low Stock';
      case 'OUT_OF_STOCK': return 'Out of Stock';
      default: return status;
    }
  }

  getStockBadgeClass(status: string): string {
    switch (status) {
      case 'IN_STOCK':
        return 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/40 border border-green-150/40';
      case 'LOW_STOCK':
        return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border border-amber-150/40';
      case 'OUT_OF_STOCK':
        return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40 border border-red-150/40';
      default:
        return 'text-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/40 border border-gray-150/40';
    }
  }
}
