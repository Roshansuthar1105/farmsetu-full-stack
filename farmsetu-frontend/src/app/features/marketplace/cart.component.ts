import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { CartResponse, CartItem } from '../../core/models/cart.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fs-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent],
  template: `
    <div class="space-y-6 pb-16">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <fs-page-header title="Your Shopping Cart" subtitle="Manage your selected items and complete your order" />
        <a routerLink="/app/marketplace" 
           class="inline-flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-4 py-2.5 rounded-xl hover:bg-green-100 dark:hover:bg-green-950/60 transition active:scale-95 border border-green-100/30">
          <span class="material-icons text-base">arrow_back</span> Back to Marketplace
        </a>
      </div>

      <!-- Main Content Grid -->
      @if (loading()) {
        <!-- Loading Skeleton -->
        <div class="grid lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-4">
            <div class="h-28 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700"></div>
            <div class="h-28 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700"></div>
          </div>
          <div class="h-80 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-100 dark:border-gray-700"></div>
        </div>
      } @else {
        @if (!cart() || cart()!.items.length === 0) {
          <!-- Empty Cart State -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div class="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto shadow-inner">
              <span class="material-icons text-4xl">shopping_cart</span>
            </div>
            <div>
              <h3 class="font-extrabold text-gray-900 dark:text-white text-xl">Your Cart is Empty</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                Looks like you haven't added any products to your cart yet. Explore our listings to find high-quality agricultural products.
              </p>
            </div>
            <a routerLink="/app/marketplace" class="inline-flex px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition">
              Start Shopping
            </a>
          </div>
        } @else {
          <div class="grid lg:grid-cols-3 gap-8 items-start">
            
            <!-- Cart Items List (Left Column) -->
            <div class="lg:col-span-2 space-y-4">
              @for (item of cart()!.items; track item.id) {
                <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 hover:border-gray-200 dark:hover:border-gray-600 transition duration-300">
                  <!-- Product Image -->
                  <div class="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-700">
                    @if (item.productImage) {
                      <img [src]="item.productImage" class="w-full h-full object-cover" [alt]="item.productTitle" />
                    } @else {
                      <span class="material-icons text-3xl text-gray-300 dark:text-gray-650">image</span>
                    }
                  </div>

                  <!-- Product Info -->
                  <div class="flex-grow text-center sm:text-left space-y-1">
                    <h4 class="font-bold text-gray-900 dark:text-white text-base hover:text-green-600 transition">{{ item.productTitle }}</h4>
                    <p class="text-sm font-semibold text-green-600 dark:text-green-400">₹{{ item.productPrice }}</p>
                    
                    <!-- Stock status / Warning section -->
                    <div class="pt-1.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      @if (item.warning === 'OUT_OF_STOCK') {
                        <span class="px-2.5 py-0.5 text-[10px] font-bold text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30 rounded-full flex items-center gap-1">
                          <span class="material-icons text-[12px]">error</span> Out of Stock
                        </span>
                      } @else if (item.warning === 'INSUFFICIENT_STOCK') {
                        <span class="px-2.5 py-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30 rounded-full flex items-center gap-1">
                          <span class="material-icons text-[12px]">warning</span> Only {{ item.availableStock }} units available
                        </span>
                      } @else if (item.warning === 'LOW_STOCK') {
                        <span class="px-2.5 py-0.5 text-[10px] font-bold text-yellow-700 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950/20 border border-yellow-100/50 dark:border-yellow-900/30 rounded-full flex items-center gap-1">
                          <span class="material-icons text-[12px]">info</span> Low Stock ({{ item.availableStock }} left)
                        </span>
                      } @else {
                        <span class="px-2.5 py-0.5 text-[10px] font-semibold text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/20 border border-green-100/50 dark:border-green-900/30 rounded-full flex items-center gap-1">
                          <span class="material-icons text-[12px]">check_circle</span> In Stock
                        </span>
                      }
                    </div>
                  </div>

                  <!-- Quantity Controls & Actions -->
                  <div class="flex items-center gap-4 mt-2 sm:mt-0">
                    <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900">
                      <button (click)="decreaseQty(item)" 
                              [disabled]="item.requestedQuantity <= 1"
                              class="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-green-600 transition active:scale-95 disabled:opacity-30">
                        <span class="material-icons text-sm">remove</span>
                      </button>
                      <span class="w-8 text-center text-xs font-bold text-gray-900 dark:text-white">{{ item.requestedQuantity }}</span>
                      <button (click)="increaseQty(item)" 
                              [disabled]="item.requestedQuantity >= item.availableStock"
                              class="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-green-600 transition active:scale-95 disabled:opacity-30">
                        <span class="material-icons text-sm">add</span>
                      </button>
                    </div>

                    <button (click)="removeItem(item)" 
                            class="w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition active:scale-95">
                      <span class="material-icons text-lg">delete</span>
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Order Summary (Right Column) -->
            <div class="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-md p-6 space-y-6">
              <h3 class="font-extrabold text-gray-900 dark:text-white text-base flex items-center gap-2 border-b border-gray-150 dark:border-gray-700 pb-3">
                <span class="material-icons text-green-600">receipt</span> Order Summary
              </h3>

              <div class="space-y-3">
                <div class="flex justify-between text-xs sm:text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Total Items</span>
                  <span class="font-bold text-gray-900 dark:text-white">{{ totalItemsCount() }}</span>
                </div>
                <div class="flex justify-between text-xs sm:text-sm">
                  <span class="text-gray-500 dark:text-gray-400">Delivery charges</span>
                  <span class="font-semibold text-green-600 dark:text-green-400">FREE</span>
                </div>
                <div class="h-px bg-gray-150 dark:bg-gray-700 my-2"></div>
                <div class="flex justify-between">
                  <span class="font-bold text-gray-900 dark:text-white text-sm">Total Amount</span>
                  <span class="font-extrabold text-green-600 dark:text-green-400 text-lg">₹{{ cart()?.totalAmount || 0 }}</span>
                </div>
              </div>

              <!-- Delivery Address Input -->
              <div class="space-y-2">
                <label class="block text-[10px] font-bold uppercase text-gray-400">Delivery Address</label>
                <textarea [(ngModel)]="deliveryAddress" 
                          rows="3" 
                          placeholder="Enter your complete delivery address with PIN code..."
                          class="w-full text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white resize-none"></textarea>
              </div>

              @if (hasCartWarnings()) {
                <div class="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30 rounded-xl flex items-start gap-2.5">
                  <span class="material-icons text-red-500 text-base mt-0.5">error</span>
                  <p class="text-xs text-red-750 dark:text-red-400 leading-normal">
                    Some items in your cart have stock issues. Please resolve them before checking out.
                  </p>
                </div>
              }

              <!-- Checkout Button -->
              <button (click)="onCheckout()" 
                      [disabled]="submitting() || hasCartWarnings() || !deliveryAddress.trim() || !cart()?.items?.length"
                      class="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2">
                @if (submitting()) {
                  <span>Processing...</span>
                } @else {
                  <span class="material-icons text-base">shopping_bag</span>
                  <span>Proceed to Checkout</span>
                }
              </button>
            </div>
            
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class CartComponent implements OnInit {
  private readonly marketplaceService = inject(MarketplaceService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  readonly cart = signal<CartResponse | null>(null);
  readonly loading = signal(true);
  readonly submitting = signal(false);

  deliveryAddress = '';

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.marketplaceService.getCart().subscribe({
      next: (response) => {
        this.cart.set(response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load cart items');
        this.loading.set(false);
      }
    });
  }

  increaseQty(item: CartItem): void {
    if (item.requestedQuantity >= item.availableStock) {
      this.toastr.warning(`Cannot exceed available stock of ${item.availableStock} units.`);
      return;
    }
    const newQty = item.requestedQuantity + 1;
    this.updateQuantity(item.productId, newQty);
  }

  decreaseQty(item: CartItem): void {
    if (item.requestedQuantity <= 1) return;
    const newQty = item.requestedQuantity - 1;
    this.updateQuantity(item.productId, newQty);
  }

  updateQuantity(productId: number, quantity: number): void {
    this.marketplaceService.updateCartQuantity(productId, quantity).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Failed to update quantity';
        this.toastr.error(errorMsg);
        this.loadCart(); // Refresh cart to match server status
      }
    });
  }

  removeItem(item: CartItem): void {
    this.marketplaceService.removeFromCart(item.productId).subscribe({
      next: () => {
        this.toastr.success('Item removed from cart');
        this.loadCart();
      },
      error: () => {
        this.toastr.error('Failed to remove item');
      }
    });
  }

  totalItemsCount(): number {
    const items = this.cart()?.items || [];
    return items.reduce((acc, curr) => acc + curr.requestedQuantity, 0);
  }

  hasCartWarnings(): boolean {
    const items = this.cart()?.items || [];
    return items.some(item => item.warning === 'OUT_OF_STOCK' || item.warning === 'INSUFFICIENT_STOCK');
  }

  onCheckout(): void {
    if (!this.deliveryAddress.trim()) {
      this.toastr.error('Please enter a delivery address');
      return;
    }
    if (this.hasCartWarnings()) {
      this.toastr.error('Please fix cart items with stock warnings before placing order.');
      return;
    }

    this.submitting.set(true);
    this.marketplaceService.checkout(this.deliveryAddress).subscribe({
      next: () => {
        this.toastr.success('Order placed successfully!');
        this.submitting.set(false);
        this.router.navigate(['/app/orders']);
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Checkout failed. Please check stock and try again.';
        this.toastr.error(errorMsg);
        this.submitting.set(false);
        this.loadCart(); // Refresh cart details
      }
    });
  }
}
