import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { Product } from '../../core/models/product.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'fs-product-list',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, LoadingSkeletonComponent],
  template: `
    <!-- Page Header & Actions -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <fs-page-header title="Krishi Bazaar" subtitle="Buy and sell premium seeds, fertilizers, machinery, and farming tools" class="!mb-0" />
      
      <!-- Search Input -->
      <div class="relative w-full md:w-80 shrink-0">
        <span class="material-icons text-slate-400 absolute left-3 top-3 text-lg pointer-events-none">search</span>
        <input 
          type="text" 
          placeholder="Search crop seeds, tools..." 
          (input)="onSearch($any($event.target).value)"
          class="fs-input pl-10 pr-4 py-2.5 text-sm" 
        />
      </div>
    </div>

    <!-- Category Filter Chips -->
    <div class="flex flex-wrap gap-2.5 mb-8">
      @for (cat of categories; track cat) {
        <button
          type="button"
          (click)="selectCategory(cat)"
          class="px-4 py-2 rounded-xl text-xs font-semibold border transition-all duration-300 active:scale-95"
          [class]="selectedCategory() === cat 
            ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/10'
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800'"
        >
          {{ cat }}
        </button>
      }
    </div>

    @if (loading()) {
      <fs-loading-skeleton />
    } @else {
      <!-- Product Grid -->
      @if (filteredProducts().length === 0) {
        <div class="glass-card p-12 text-center text-slate-400 dark:text-slate-500 max-w-lg mx-auto">
          <span class="material-icons text-5xl mb-4">search_off</span>
          <h3 class="font-bold text-slate-800 dark:text-slate-350 text-lg">No Products Found</h3>
          <p class="text-xs mt-1.5 leading-relaxed">We couldn't find any items matching your criteria. Try searching for another category or product name.</p>
        </div>
      } @else {
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (p of filteredProducts(); track p.id) {
            <a 
              [routerLink]="[p.id]" 
              class="fs-card block group hover:shadow-xl hover:border-primary-500/35 overflow-hidden transition-all duration-300"
            >
              <!-- Card Image Zoom Area -->
              <div class="h-48 bg-slate-100 dark:bg-slate-800/70 rounded-xl mb-4 flex items-center justify-center text-slate-400 overflow-hidden relative border border-slate-100 dark:border-slate-800/30">
                <!-- Category Badge -->
                <span class="absolute top-3 right-3 z-10 text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 text-primary-700 dark:text-primary-400 border border-slate-150 dark:border-slate-800 px-2.5 py-1 rounded-lg uppercase tracking-wider backdrop-blur-sm">
                  {{ p.category }}
                </span>
                
                @if (p.images.length) { 
                  <img 
                    [src]="p.images[0]" 
                    class="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 rounded-xl" 
                    alt="{{ p.title }}" 
                  /> 
                } @else { 
                  <span class="material-icons text-5xl group-hover:rotate-6 transition-transform duration-300 text-slate-300 dark:text-slate-600">store</span> 
                }
              </div>

              <!-- Product Details -->
              <div class="space-y-1">
                <h3 class="font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-1 transition-colors">
                  {{ p.title }}
                </h3>
                
                <div class="flex items-baseline justify-between pt-1">
                  <p class="text-lg font-extrabold text-primary-650 dark:text-primary-400">
                    ₹{{ p.price }}
                  </p>
                  
                  <!-- Direct/Auction Badge -->
                  <span class="text-[9px] font-bold tracking-wider uppercase text-secondary-500 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-secondary-500 animate-pulse"></span>
                    Direct Seller
                  </span>
                </div>
                
                <!-- Seller Metadata -->
                <div class="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/40 mt-3 text-[11px] text-slate-450 dark:text-slate-450 font-medium">
                  <span class="material-icons text-sm text-slate-450 dark:text-slate-500">account_circle</span>
                  <span class="truncate">{{ p.sellerName }}</span>
                </div>
              </div>
            </a>
          }
        </div>
      }
    }
  `
})
export class ProductListComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);

  readonly categories = ['All', 'Seeds', 'Fertilizers', 'Machinery', 'Pesticides', 'Tools'];
  readonly selectedCategory = signal('All');
  readonly searchQuery = signal('');

  readonly filteredProducts = computed(() => {
    return this.products().filter(p => {
      const matchesCategory = this.selectedCategory() === 'All' || 
                              p.category?.toLowerCase() === this.selectedCategory().toLowerCase();
      const matchesSearch = !this.searchQuery() || 
                            p.title?.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                            (p.description && p.description.toLowerCase().includes(this.searchQuery().toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  });

  ngOnInit(): void {
    this.marketplace.list().subscribe({
      next: (page) => {
        this.products.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  selectCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }
}
