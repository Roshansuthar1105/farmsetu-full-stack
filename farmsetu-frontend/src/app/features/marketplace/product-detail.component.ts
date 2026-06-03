import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { Product } from '../../core/models/product.model';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'fs-product-detail',
  standalone: true,
  imports: [RouterLink, LoadingSkeletonComponent],
  template: `
    <a routerLink="/app/marketplace" class="text-sm text-primary mb-4 inline-block">← Back</a>
    @if (loading()) {
      <fs-loading-skeleton />
    } @else if (product()) {
      <div class="grid lg:grid-cols-2 gap-6">
        <div class="fs-card h-80 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          @if (product()!.images?.length) {
            <img [src]="product()!.images[0]" class="max-h-full rounded-lg" alt="" />
          }
        </div>
        <div>
          <h1 class="text-2xl font-bold">{{ product()!.title }}</h1>
          <p class="text-3xl text-primary font-bold mt-2">₹{{ product()!.price }}</p>
          <p class="mt-4 text-gray-600 dark:text-gray-300">{{ product()!.description }}</p>
          <p class="mt-2 text-sm">Seller: {{ product()!.sellerName }}</p>
          @if (product()!.auction) {
            <p class="mt-2 text-secondary font-medium">Live auction · Current bid: ₹{{ product()!.currentBid }}</p>
          }
          <button type="button" class="mt-6 fs-btn-primary">Add to cart</button>
        </div>
      </div>
    }
  `
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly marketplace = inject(MarketplaceService);
  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.marketplace.get(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
