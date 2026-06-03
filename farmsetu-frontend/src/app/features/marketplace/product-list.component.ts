import { Component, inject, OnInit, signal } from '@angular/core';
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
    <fs-page-header title="Marketplace" subtitle="Seeds, tools, fertilizers & more" />
    @if (loading()) {
      <fs-loading-skeleton />
    } @else {
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (p of products(); track p.id) {
          <a [routerLink]="[p.id]" class="fs-card block hover:shadow-md transition">
            <div class="h-36 bg-gray-100 dark:bg-gray-700 rounded-lg mb-3 flex items-center justify-center text-gray-400">
              @if (p.images.length) { <img [src]="p.images[0]" class="h-full w-full object-cover rounded-lg" alt="" /> }
              @else { <span class="material-icons text-4xl">image</span> }
            </div>
            <h3 class="font-semibold line-clamp-1">{{ p.title }}</h3>
            <p class="text-primary font-bold mt-1">₹{{ p.price }}</p>
            <p class="text-xs text-gray-500">{{ p.sellerName }} · {{ p.category }}</p>
          </a>
        }
      </div>
    }
  `
})
export class ProductListComponent implements OnInit {
  private readonly marketplace = inject(MarketplaceService);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.marketplace.list().subscribe({
      next: (page) => {
        this.products.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
