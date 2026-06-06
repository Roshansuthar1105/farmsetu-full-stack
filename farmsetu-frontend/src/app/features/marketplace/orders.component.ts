import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fs-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeaderComponent],
  template: `
    <div class="space-y-6 pb-16">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <fs-page-header title="Order History" subtitle="Track your purchases and manage incoming sales orders" />
        <a routerLink="/app/marketplace" 
           class="inline-flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-4 py-2.5 rounded-xl hover:bg-green-100 dark:hover:bg-green-950/60 transition active:scale-95 border border-green-100/30">
          <span class="material-icons text-base">storefront</span> Go to Marketplace
        </a>
      </div>

      <!-- Tab Navigation -->
      <div class="flex border-b border-gray-200 dark:border-gray-700 gap-6">
        <button (click)="setActiveTab('buyer')"
                [class]="activeTab() === 'buyer' 
                  ? 'pb-4 text-sm font-extrabold text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 flex items-center gap-2 transition'
                  : 'pb-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2 transition'">
          <span class="material-icons text-lg">shopping_bag</span>
          <span>My Purchases</span>
        </button>

        @if (isSellerOrFarmer()) {
          <button (click)="setActiveTab('seller')"
                  [class]="activeTab() === 'seller' 
                    ? 'pb-4 text-sm font-extrabold text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400 flex items-center gap-2 transition'
                    : 'pb-4 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-2 transition'">
            <span class="material-icons text-lg">store</span>
            <span>Received Sales</span>
          </button>
        }
      </div>

      <!-- Orders List Container -->
      @if (loading()) {
        <div class="space-y-4">
          <div class="h-28 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-150 dark:border-gray-700"></div>
          <div class="h-28 bg-white dark:bg-gray-800 rounded-2xl animate-pulse border border-gray-150 dark:border-gray-700"></div>
        </div>
      } @else {
        @if (orders().length === 0) {
          <!-- Empty State -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-5 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div class="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto shadow-inner">
              <span class="material-icons text-4xl">receipt_long</span>
            </div>
            <div>
              <h3 class="font-extrabold text-gray-900 dark:text-white text-xl">No Orders Found</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                {{ activeTab() === 'buyer' 
                    ? 'You have not placed any orders yet. Once you purchase products, they will appear here.'
                    : 'No one has ordered your products yet. Optimize your product listings and price to attract buyers.' }}
              </p>
            </div>
            @if (activeTab() === 'buyer') {
              <a routerLink="/app/marketplace" class="inline-flex px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition">
                Browse Products
              </a>
            }
          </div>
        } @else {
          <div class="space-y-4">
            @for (order of orders(); track order.id) {
              <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 hover:border-gray-200 dark:hover:border-gray-650 transition duration-300">
                
                <!-- Product & Order Info Left -->
                <div class="flex items-start gap-4">
                  <!-- Order Icon -->
                  <div class="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-gray-700 flex-shrink-0">
                    <span class="material-icons text-2xl">local_shipping</span>
                  </div>
                  
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-bold text-gray-400">ORDER #{{ order.id }}</span>
                      <span class="text-xs text-gray-400">•</span>
                      <span class="text-xs text-gray-500">{{ order.orderDate | date:'mediumDate' }}</span>
                    </div>
                    <h4 class="font-bold text-gray-900 dark:text-white text-base hover:text-green-600 transition">
                      {{ order.product?.title || 'Unknown Product' }}
                    </h4>
                    <div class="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span>Quantity: <strong class="text-gray-800 dark:text-gray-300">{{ order.quantity }}</strong></span>
                      <span>•</span>
                      <span>Total: <strong class="text-green-600 dark:text-green-400 font-bold">₹{{ order.totalPrice }}</strong></span>
                      <span>•</span>
                      <span>
                        {{ activeTab() === 'buyer' 
                            ? 'Seller: ' + (order.product?.sellerName || 'Unknown') 
                            : 'Buyer: ' + (order.buyer?.name || 'Unknown') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Delivery Address Middle -->
                <div class="w-full lg:w-72 bg-gray-50 dark:bg-gray-900/40 p-3 rounded-xl border border-gray-100/50 dark:border-gray-700/50">
                  <span class="block text-[9px] font-bold uppercase text-gray-450 tracking-wider mb-1">Shipping Details</span>
                  <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                    {{ order.deliveryAddress || 'No shipping address provided' }}
                  </p>
                </div>

                <!-- Status Badge & Actions Right -->
                <div class="flex items-center justify-between lg:justify-end w-full lg:w-auto gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 dark:border-gray-750">
                  <!-- Status Badge -->
                  <div class="flex flex-col gap-1 items-start lg:items-end">
                    <span [class]="getStatusClass(order.deliveryStatus)">
                      {{ order.deliveryStatus }}
                    </span>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-2">
                    <!-- Cancel Action (For Buyer) -->
                    @if (activeTab() === 'buyer' && (order.deliveryStatus === 'PENDING' || order.deliveryStatus === 'CONFIRMED')) {
                      <button (click)="cancelOrder(order)"
                              class="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20 text-xs font-bold rounded-xl transition active:scale-95">
                        Cancel Order
                      </button>
                    }

                    <!-- Status Dropdown Select (For Seller) -->
                    @if (activeTab() === 'seller') {
                      <div class="relative">
                        <select [ngModel]="order.deliveryStatus"
                                (change)="onStatusChange(order.id, $any($event.target).value)"
                                [disabled]="order.deliveryStatus === 'CANCELLED' || order.deliveryStatus === 'RETURNED' || order.deliveryStatus === 'DELIVERED'"
                                class="text-xs border border-gray-200 dark:border-gray-750 rounded-xl px-3 py-2 bg-white dark:bg-gray-800 dark:text-white outline-none cursor-pointer hover:border-gray-300 dark:hover:border-gray-650 transition focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                          <option value="RETURNED">RETURNED</option>
                        </select>
                      </div>
                    }
                  </div>
                </div>

              </div>
            }
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
export class OrdersComponent implements OnInit {
  private readonly marketplaceService = inject(MarketplaceService);
  private readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  readonly activeTab = signal<'buyer' | 'seller'>('buyer');
  readonly orders = signal<any[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.loadOrders();
  }

  isSellerOrFarmer(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'SELLER' || role === 'FARMER' || role === 'ADMIN';
  }

  setActiveTab(tab: 'buyer' | 'seller'): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    const orderFetch = this.activeTab() === 'buyer' 
      ? this.marketplaceService.getBuyerOrders()
      : this.marketplaceService.getSellerOrders();

    orderFetch.subscribe({
      next: (response: any) => {
        // API response data holds the list directly as per controller mapping
        this.orders.set(response.data || response || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load orders history');
        this.loading.set(false);
      }
    });
  }

  cancelOrder(order: any): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.marketplaceService.updateOrderStatus(order.id, 'CANCELLED').subscribe({
        next: () => {
          this.toastr.success('Order cancelled successfully.');
          this.loadOrders();
        },
        error: (err) => {
          console.error(err);
          const errorMsg = err.error?.message || 'Failed to cancel order';
          this.toastr.error(errorMsg);
        }
      });
    }
  }

  onStatusChange(orderId: number, status: string): void {
    this.marketplaceService.updateOrderStatus(orderId, status).subscribe({
      next: () => {
        this.toastr.success(`Order status updated to ${status}`);
        this.loadOrders();
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Failed to update order status';
        this.toastr.error(errorMsg);
        this.loadOrders(); // Revert back on failure
      }
    });
  }

  getStatusClass(status: string): string {
    const base = 'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ';
    switch (status) {
      case 'PENDING':
        return base + 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border-amber-100/50 dark:border-amber-900/30';
      case 'CONFIRMED':
        return base + 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 border-blue-100/50 dark:border-blue-900/30';
      case 'SHIPPED':
        return base + 'text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/20 border-indigo-100/50 dark:border-indigo-900/30';
      case 'DELIVERED':
        return base + 'text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/20 border-green-100/50 dark:border-green-900/30';
      case 'CANCELLED':
        return base + 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/20 border-red-100/50 dark:border-red-900/30';
      case 'RETURNED':
        return base + 'text-purple-700 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/20 border-purple-100/50 dark:border-purple-900/30';
      default:
        return base + 'text-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/20 border-gray-100/50 dark:border-gray-900/30';
    }
  }
}
