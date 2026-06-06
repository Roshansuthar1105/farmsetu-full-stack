import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { Product, ProductCategory } from '../../core/models/product.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastrService } from 'ngx-toastr';

interface CategoryItem {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'fs-product-list',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, PageHeaderComponent, LoadingSkeletonComponent],
  template: `
    <div class="space-y-6 pb-12">
      <!-- HEADER WITH ACTIONS -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <fs-page-header title="Marketplace" subtitle="Buy seeds, tools, & fertilizers, or auction your produce" />
        <button (click)="showCreateModal.set(true)"
                class="fs-btn-primary flex items-center gap-2 shadow-lg shadow-green-500/20 active:scale-[0.98] transition">
          <span class="material-icons text-sm">add</span> Add Listing
        </button>
      </div>

      <!-- SEARCH & FILTER BAR -->
      <div class="flex flex-col gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <!-- Search Input -->
        <div class="relative w-full">
          <span class="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input type="text"
                 [(ngModel)]="searchQuery"
                 (ngModelChange)="onSearchChange()"
                 placeholder="Search products by title or description..."
                 class="w-full pl-12 pr-10 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition outline-none dark:text-white" />
          @if (searchQuery) {
            <button (click)="clearSearch()" class="material-icons absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition">close</button>
          }
        </div>

        <!-- Categories horizontal scroll -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          @for (cat of categories; track cat.key) {
            <button (click)="selectCategory(cat.key)"
                    [class]="cat.key === selectedCategory() 
                      ? 'flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-full shadow-md transition'
                      : 'flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full border border-gray-100 dark:border-gray-700 transition'">
              <span class="material-icons text-base">{{ cat.icon }}</span>
              {{ cat.label }}
            </button>
          }
        </div>
      </div>

      <!-- PRODUCTS CONTAINER -->
      @if (loading()) {
        <fs-loading-skeleton />
      } @else {
        @if (products().length === 0) {
          <!-- Empty State -->
          <div class="fs-card py-16 text-center max-w-md mx-auto space-y-4">
            <div class="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto shadow-inner">
              <span class="material-icons text-3xl">storefront</span>
            </div>
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white text-lg">No Listings Found</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Try resetting filters, modifying your search, or list a new product yourself.</p>
            </div>
            <button (click)="resetFilters()" class="px-4 py-2 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 rounded-xl hover:bg-green-100 dark:hover:bg-green-950/60 transition active:scale-95">
              Reset Filters
            </button>
          </div>
        } @else {
          <!-- Products Grid -->
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (p of products(); track p.id) {
              <a [routerLink]="[p.id]" class="fs-card block hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative group border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
                
                <!-- Image Wrapper -->
                <div class="h-44 bg-gray-50 dark:bg-gray-700/30 rounded-xl mb-4 flex items-center justify-center text-gray-400 relative overflow-hidden border border-gray-100 dark:border-gray-750">
                  @if (p.images && p.images.length) {
                    <img [src]="p.images[0]" class="h-full w-full object-cover group-hover:scale-105 transition duration-500" alt="{{ p.title }}" />
                  } @else {
                    <span class="material-icons text-5xl text-gray-300 dark:text-gray-600">image</span>
                  }
                  
                  <!-- Auction Indicator -->
                  @if (p.auction) {
                    <span class="absolute top-2.5 right-2.5 px-2.5 py-1 text-[10px] font-bold bg-red-600 text-white rounded-full shadow-md flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> Live Auction
                    </span>
                  }
                </div>

                <!-- Product Details -->
                <div class="space-y-2">
                  <span class="px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 rounded border border-green-100/50 dark:border-green-800/30 w-max block">
                    {{ p.category }}
                  </span>

                  <h3 class="font-bold text-base text-gray-900 dark:text-white line-clamp-1 group-hover:text-green-600 transition">{{ p.title }}</h3>
                  
                  <div class="flex justify-between items-baseline pt-1">
                    <div>
                      @if (p.auction) {
                        <p class="text-xs text-gray-400">Current Bid</p>
                        <p class="text-lg font-extrabold text-gray-900 dark:text-white">₹{{ p.currentBid || p.startingBid }}</p>
                      } @else {
                        <p class="text-xs text-gray-400">Fixed Price</p>
                        <p class="text-lg font-extrabold text-green-600 dark:text-green-400">₹{{ p.price }}</p>
                      }
                    </div>
                    <span class="text-xs text-gray-400 font-medium">Qty: {{ p.quantity || 10 }} {{ p.unit || 'Kg' }}</span>
                  </div>

                  <div class="border-t border-gray-100 dark:border-gray-700/60 pt-2.5 flex items-center justify-between text-[11px] text-gray-500">
                    <span class="flex items-center gap-1">
                      <span class="material-icons text-sm text-gray-400">person</span> {{ p.sellerName }}
                    </span>
                    <span class="px-1.5 py-0.5 rounded {{ p.condition === 'NEW' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20' : 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20' }}">
                      {{ p.condition }}
                    </span>
                  </div>
                </div>
              </a>
            }
          </div>
        }
      }

      <!-- ADD PRODUCT MODAL -->
      <div *ngIf="showCreateModal()" class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div (click)="showCreateModal.set(false)" class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

        <!-- Content Container -->
        <div class="relative bg-white dark:bg-gray-800 rounded-3xl max-w-lg w-full shadow-2xl p-6 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
          <div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-4 mb-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span class="material-icons text-green-600">storefront</span> List New Product
            </h3>
            <button (click)="showCreateModal.set(false)" class="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">✕</button>
          </div>

          <form (ngSubmit)="submitProduct()" class="space-y-4 text-xs sm:text-sm">
            <!-- Row: Title & Category -->
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Product Title</label>
                <input type="text" [(ngModel)]="form.title" name="title" required placeholder="e.g., Organic Wheat Seeds"
                       class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Category</label>
                <select [(ngModel)]="form.category" name="category" required
                        class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white">
                  <option value="SEEDS">Seeds</option>
                  <option value="FERTILIZERS">Fertilizers</option>
                  <option value="TOOLS">Tools</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="PESTICIDES">Pesticides</option>
                  <option value="ORGANIC_PRODUCTS">Organic Products</option>
                </select>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Description</label>
              <textarea [(ngModel)]="form.description" name="description" rows="3" placeholder="Describe the item condition, quality, crop variety, etc."
                        class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white"></textarea>
            </div>

            <!-- Row: Price / Qty / Unit -->
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Price (₹)</label>
                <input type="number" [(ngModel)]="form.price" name="price" required min="1"
                       class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Quantity</label>
                <input type="number" [(ngModel)]="form.quantity" name="quantity" min="1"
                       class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Unit</label>
                <input type="text" [(ngModel)]="form.unit" name="unit" placeholder="Kg / Bags / Pcs"
                       class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white" />
              </div>
            </div>

            <!-- Row: Condition & Location -->
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Condition</label>
                <div class="flex gap-4 py-2">
                  <label class="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                    <input type="radio" [(ngModel)]="form.condition" name="condition" value="NEW" class="text-green-600 focus:ring-green-500" /> New
                  </label>
                  <label class="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                    <input type="radio" [(ngModel)]="form.condition" name="condition" value="USED" class="text-green-600 focus:ring-green-500" /> Used
                  </label>
                </div>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Location</label>
                <input type="text" [(ngModel)]="form.location" name="location" placeholder="e.g. Pune, Maharashtra"
                       class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white" />
              </div>
            </div>

            <!-- Option: Toggle Auction -->
            <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-3">
              <label class="flex items-center justify-between cursor-pointer font-bold text-xs uppercase text-gray-500">
                <span>Sell via Bidding / Live Auction</span>
                <input type="checkbox" [(ngModel)]="form.auction" name="auction" class="rounded text-green-600 focus:ring-green-500" />
              </label>

              @if (form.auction) {
                <div class="grid sm:grid-cols-2 gap-3 pt-2 animate-in slide-in-from-top-2 duration-200">
                  <div>
                    <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Starting Bid (₹)</label>
                    <input type="number" [(ngModel)]="form.startingBid" name="startingBid" min="1"
                           class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">End Time</label>
                    <input type="datetime-local" [(ngModel)]="auctionEndDate" name="auctionEndDate"
                           class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white" />
                  </div>
                </div>
              }
            </div>

            <!-- Image Link Placeholder -->
            <div>
              <label class="block text-[10px] font-bold uppercase text-gray-400 mb-1">Image URL</label>
              <input type="url" [(ngModel)]="formImageUrl" name="formImageUrl" placeholder="Paste product image URL"
                     class="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white" />
            </div>

            <!-- Action buttons -->
            <div class="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button type="button" (click)="showCreateModal.set(false)"
                      class="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition">Cancel</button>
              <button type="submit" [disabled]="submitting()"
                      class="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition disabled:opacity-50">
                {{ submitting() ? 'Listing...' : 'List Product' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  private readonly toastr = inject(ToastrService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly showCreateModal = signal(false);
  readonly submitting = signal(false);

  // Filter bindings
  searchQuery = '';
  readonly selectedCategory = signal<string>('ALL');

  // Search debounce
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
    quantity: 10,
    unit: 'Kg',
    condition: 'NEW' as 'NEW' | 'USED',
    location: '',
    auction: false,
    startingBid: 0,
    auctionEndTime: undefined as string | undefined
  };
  formImageUrl = '';
  auctionEndDate = '';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    const cat = this.selectedCategory() === 'ALL' ? '' : this.selectedCategory();
    this.marketplace.list(0, 50, cat, this.searchQuery).subscribe({
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
    this.loadProducts();
  }

  submitProduct(): void {
    if (!this.form.title || !this.form.price) {
      this.toastr.warning('Please fill out all required fields.', 'Validation');
      return;
    }

    this.submitting.set(true);
    
    // Prepare body
    const body: any = {
      ...this.form,
      images: this.formImageUrl ? [this.formImageUrl] : []
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
      quantity: 10,
      unit: 'Kg',
      condition: 'NEW',
      location: '',
      auction: false,
      startingBid: 0,
      auctionEndTime: undefined
    };
    this.formImageUrl = '';
    this.auctionEndDate = '';
  }
}
