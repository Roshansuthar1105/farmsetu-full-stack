import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { Product } from '../../core/models/product.model';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fs-product-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingSkeletonComponent],
  template: `
    <div class="max-w-4xl mx-auto p-4 space-y-6">
      <a routerLink="/app/marketplace" class="text-sm font-semibold text-green-600 hover:text-green-700 mb-4 inline-flex items-center gap-1 transition">
        <span>←</span> Back to Marketplace
      </a>
      
      @if (loading()) {
        <fs-loading-skeleton />
      } @else {
        @if (product(); as p) {
          <div class="grid lg:grid-cols-2 gap-8 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
          
          <!-- Left: Product Image -->
          <div class="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-700/30 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            @if (p.images.length) {
              <img [src]="p.images[0]" class="max-h-full max-w-full object-contain rounded-lg hover:scale-105 transition duration-300" alt="{{ p.title }}" />
            } @else {
              <div class="text-center text-gray-400">
                <span class="material-icons text-6xl">image</span>
                <p class="text-sm mt-1">No image available</p>
              </div>
            }
          </div>
          
          <!-- Right: Details and Action Forms -->
          <div class="flex flex-col justify-between space-y-6">
            <div class="space-y-4">
              <span class="px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800/30 rounded-full w-max">
                {{ p.category }}
              </span>
              
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ p.title }}</h1>
              
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Seller: <span class="font-semibold text-gray-700 dark:text-gray-200">{{ p.sellerName }}</span>
              </p>

              <div class="border-t border-b border-gray-100 dark:border-gray-700 py-4">
                @if (p.auction) {
                  <div class="space-y-2">
                    <span class="text-xs font-semibold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                      <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                      Live Auction
                    </span>
                    <div class="flex items-baseline gap-2">
                      <span class="text-3xl font-extrabold text-gray-900 dark:text-white">₹{{ p.currentBid || p.startingBid }}</span>
                      <span class="text-xs text-gray-400">Current Bid</span>
                    </div>
                    <p class="text-xs text-gray-500">Starting Bid: ₹{{ p.startingBid }}</p>
                  </div>
                } @else {
                  <div class="space-y-1">
                    <div class="flex items-baseline gap-2">
                      <span class="text-3xl font-extrabold text-green-600 dark:text-green-400">₹{{ p.price }}</span>
                      <span class="text-xs text-gray-400">Fixed Price</span>
                    </div>
                    <p class="text-xs text-gray-500">Available Quantity: {{ p.quantity || 10 }} {{ p.unit || 'Kg' }}</p>
                  </div>
                }
              </div>

              <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{{ p.description }}</p>
            </div>

            <!-- Forms -->
            <div class="bg-gray-50 dark:bg-gray-700/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
              @if (p.auction) {
                <!-- Bidding Form -->
                <form (ngSubmit)="placeBid()" class="space-y-3">
                  <h3 class="text-sm font-bold text-gray-700 dark:text-gray-200">Place Your Bid</h3>
                  <div class="flex gap-2">
                    <input type="number" [(ngModel)]="bidAmount" name="bidAmount" placeholder="Enter bid amount in ₹" required class="flex-1 border rounded-xl px-4 py-3 dark:bg-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition" />
                    <button type="submit" class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition">
                      Bid
                    </button>
                  </div>
                  <p class="text-[10px] text-gray-400">Min bid must be higher than current bid ₹{{ p.currentBid || p.startingBid }}</p>
                </form>
              } @else {
                <!-- Purchase Form -->
                <form (ngSubmit)="placeOrder()" class="space-y-3">
                  <h3 class="text-sm font-bold text-gray-700 dark:text-gray-200">Order Product</h3>
                  
                  <div class="grid grid-cols-3 gap-2">
                    <div class="col-span-1">
                      <label class="text-[10px] font-bold text-gray-400 uppercase">Qty</label>
                      <input type="number" [(ngModel)]="orderQty" name="orderQty" min="1" required class="w-full border rounded-xl px-3 py-2.5 dark:bg-gray-800 outline-none focus:border-green-500 transition" />
                    </div>
                    <div class="col-span-2">
                      <label class="text-[10px] font-bold text-gray-400 uppercase">Delivery Address</label>
                      <input type="text" [(ngModel)]="deliveryAddress" name="deliveryAddress" placeholder="Enter full address" required class="w-full border rounded-xl px-3 py-2.5 dark:bg-gray-800 outline-none focus:border-green-500 transition" />
                    </div>
                  </div>

                  <button type="submit" class="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition">
                    Buy Now
                  </button>
                </form>
              }
            </div>
          </div>
        </div>
        }
      }
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly marketplace = inject(MarketplaceService);
  private readonly toastr = inject(ToastrService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);

  // Form bindings
  bidAmount: number | null = null;
  orderQty = 1;
  deliveryAddress = '';

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.marketplace.get(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  placeBid(): void {
    const p = this.product();
    if (!p || !this.bidAmount) return;

    const currentMin = p.currentBid || p.startingBid || 0;
    if (this.bidAmount <= currentMin) {
      this.toastr.warning(`Your bid must be higher than ₹${currentMin}`, 'Lower Bid');
      return;
    }

    this.marketplace.placeBid(p.id, this.bidAmount).subscribe({
      next: (bid) => {
        this.toastr.success(`Successfully bid ₹${this.bidAmount}!`, 'Bid Placed');
        this.bidAmount = null;
        this.loadProduct();
      },
      error: () => this.toastr.error('Failed to submit your bid. Try again.', 'Error')
    });
  }

  placeOrder(): void {
    const p = this.product();
    if (!p || !this.orderQty || !this.deliveryAddress) return;

    this.marketplace.createOrder(p.id, this.orderQty, this.deliveryAddress).subscribe({
      next: (order) => {
        this.toastr.success(`Order for ${this.orderQty} item(s) placed successfully!`, 'Order Placed');
        this.orderQty = 1;
        this.deliveryAddress = '';
        this.loadProduct();
      },
      error: () => this.toastr.error('Failed to process order.', 'Error')
    });
  }
}
