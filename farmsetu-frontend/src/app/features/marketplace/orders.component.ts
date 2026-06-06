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
    <div class="space-y-6 pb-16 max-w-7xl mx-auto px-4 py-2">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <fs-page-header title="Order History" subtitle="Track your purchases and manage incoming sales orders" />
        <a routerLink="/app/marketplace" 
           class="inline-flex items-center gap-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl transition active:scale-95 shadow-md shadow-green-500/10 border border-green-500/20">
          <span class="material-icons text-base">storefront</span> Go to Marketplace
        </a>
      </div>

      <!-- Tab Navigation -->
      <div class="flex border-b border-gray-250 dark:border-gray-700 gap-6">
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
              <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-755 shadow-sm p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 hover:border-gray-200 dark:hover:border-gray-700 transition duration-300">
                
                <!-- Product & Order Info Left -->
                <div class="flex items-start gap-4">
                  <!-- Product Image Thumbnail -->
                  <a [routerLink]="['/app/marketplace', order.product?.id]" 
                     class="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-150 dark:border-gray-700 shadow-inner cursor-pointer hover:opacity-90 transition">
                    @if (order.product?.images && order.product.images.length) {
                      <img [src]="order.product.images[0]" class="w-full h-full object-cover" [alt]="order.product.title" />
                    } @else {
                      <span class="material-icons text-3xl text-gray-300 dark:text-gray-350">image</span>
                    }
                  </a>
                  
                  <div class="space-y-1">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="text-xs font-bold text-gray-400 uppercase tracking-wide">ORDER #{{ order.id }}</span>
                      <span class="text-xs text-gray-400">•</span>
                      <span class="text-xs text-gray-500 font-semibold">{{ order.createdAt | date:'mediumDate' }}</span>
                    </div>
                    <a [routerLink]="['/app/marketplace', order.product?.id]" 
                       class="font-extrabold text-gray-900 dark:text-white text-base hover:text-green-600 transition cursor-pointer">
                      {{ order.product?.title || 'Unknown Product' }}
                    </a>
                    <div class="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span>Quantity: <strong class="text-gray-800 dark:text-gray-350">{{ order.quantity }}</strong></span>
                      <span>•</span>
                      <span>Total: <strong class="text-green-605 dark:text-green-400 font-extrabold">₹{{ order.totalAmount }}</strong></span>
                      <span>•</span>
                      <span class="font-semibold text-gray-600 dark:text-gray-400">
                        {{ activeTab() === 'buyer' 
                            ? 'Seller: ' + (order.seller?.name || order.product?.sellerName || 'Unknown') 
                            : 'Buyer: ' + (order.buyer?.name || 'Unknown') }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Delivery Address Middle -->
                <div class="w-full md:w-64 bg-gray-50 dark:bg-gray-900/60 p-3.5 rounded-xl border border-gray-150/40 dark:border-gray-750/70">
                  <span class="block text-[9px] font-bold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-1">Shipping Details</span>
                  <p class="text-xs text-gray-600 dark:text-gray-305 line-clamp-2 leading-relaxed">
                    {{ order.deliveryAddress || 'No shipping address provided' }}
                  </p>
                </div>

                <!-- Status Badge & Actions Right -->
                <div class="flex items-center justify-between md:justify-end w-full md:w-auto gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-750">
                  <!-- Status Badge -->
                  <div class="flex flex-col gap-1 items-start md:items-end">
                    <span [class]="getStatusClass(order.deliveryStatus)">
                      {{ order.deliveryStatus }}
                    </span>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <!-- View Details Modal Action -->
                    <button (click)="viewOrderDetails(order)"
                            class="px-3 py-2 border border-gray-250 dark:border-gray-700 text-gray-750 dark:text-gray-300 hover:bg-gray-55 dark:hover:bg-gray-700/60 text-xs font-bold rounded-xl transition active:scale-95 shadow-sm flex items-center gap-1">
                      <span class="material-icons text-sm">info</span> Details
                    </button>

                    <!-- Cancel Action (For Buyer) -->
                    @if (activeTab() === 'buyer' && (order.deliveryStatus === 'PENDING' || order.deliveryStatus === 'CONFIRMED')) {
                      <button (click)="cancelOrder(order)"
                              class="px-4 py-2 bg-red-600/10 hover:bg-red-605 text-red-600 hover:text-white border border-red-500/25 text-xs font-bold rounded-xl transition-all duration-200 active:scale-95 shadow-sm">
                        Cancel Order
                      </button>
                    }

                    <!-- Status Dropdown Select (For Seller) -->
                    @if (activeTab() === 'seller') {
                      <div class="relative">
                        <select [ngModel]="order.deliveryStatus"
                                (change)="onStatusChange(order.id, $any($event.target).value)"
                                [disabled]="order.deliveryStatus === 'CANCELLED' || order.deliveryStatus === 'RETURNED' || order.deliveryStatus === 'DELIVERED'"
                                class="text-xs border border-gray-250 dark:border-gray-700 rounded-xl px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 outline-none cursor-pointer hover:border-gray-300 dark:hover:border-gray-650 transition focus:border-green-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold">
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

      <!-- ORDER DETAILS MODAL -->
      @if (selectedOrderDetail(); as detail) {
        <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <!-- Backdrop -->
          <div (click)="closeDetailsModal()" class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

          <!-- Content Container -->
          <div class="relative bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full shadow-2xl p-6 border border-gray-150 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-thin">
            
            <!-- Modal Header -->
            <div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
              <div class="space-y-0.5">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Receipt</span>
                <h3 class="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  <span class="material-icons text-green-600">receipt</span> Order Details #{{ detail.id }}
                </h3>
              </div>
              <button (click)="closeDetailsModal()" class="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-650 dark:hover:text-white flex items-center justify-center transition active:scale-95">✕</button>
            </div>

            <!-- Modal Body Grid -->
            <div class="grid sm:grid-cols-2 gap-6 text-xs sm:text-sm">
              
              <!-- Left Side: Product Info -->
              <div class="space-y-4">
                <!-- Thumbnail -->
                <div class="h-44 bg-gray-50 dark:bg-gray-950 rounded-2xl overflow-hidden border border-gray-150 dark:border-gray-800 flex items-center justify-center relative shadow-inner">
                  @if (detail.product?.images && detail.product.images.length) {
                    <img [src]="detail.product.images[0]" class="w-full h-full object-cover" />
                  } @else {
                    <span class="material-icons text-4xl text-gray-300 dark:text-gray-700">image</span>
                  }
                  
                  <span class="absolute top-2.5 right-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider {{ detail.product?.condition === 'NEW' ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20' : 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20' }}">
                    {{ detail.product?.condition }}
                  </span>
                </div>

                <!-- Product Details -->
                <div class="space-y-1">
                  <span class="px-2 py-0.5 text-[9px] font-bold text-green-700 dark:text-green-450 bg-green-50 dark:bg-green-950/30 rounded border border-green-100/50 w-max block uppercase">
                    {{ detail.product?.category }}
                  </span>
                  <h4 class="font-extrabold text-gray-950 dark:text-white text-base pt-1">
                    {{ detail.product?.title || 'Unknown Product' }}
                  </h4>
                  <p class="text-xs text-gray-500 leading-relaxed max-h-24 overflow-y-auto pr-1 scrollbar-thin">
                    {{ detail.product?.description || 'No description provided.' }}
                  </p>
                </div>
              </div>

              <!-- Right Side: Order Transaction Details -->
              <div class="space-y-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150/40 dark:border-gray-800/80 p-4 rounded-2xl">
                <h4 class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Order Summary</h4>
                
                <div class="space-y-2.5 text-xs">
                  <!-- Buyer Details -->
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">Buyer:</span>
                    <span class="font-bold text-gray-800 dark:text-gray-250">{{ detail.buyer?.name || 'Unknown' }}</span>
                  </div>

                  <!-- Seller Details -->
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">Seller:</span>
                    <span class="font-bold text-gray-800 dark:text-gray-250">{{ detail.seller?.name || detail.product?.sellerName || 'Unknown' }}</span>
                  </div>

                  <div class="h-px bg-gray-150 dark:bg-gray-805 my-1"></div>

                  <!-- Qty and Total Price -->
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">Quantity Ordered:</span>
                    <span class="font-extrabold text-gray-800 dark:text-gray-255">{{ detail.quantity }} units</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">Price Per Unit:</span>
                    <span class="font-bold text-gray-850 dark:text-gray-255">₹{{ detail.product?.price || 0 }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-500">Total Charged:</span>
                    <span class="font-extrabold text-green-650 dark:text-green-400 text-sm">₹{{ detail.totalAmount }}</span>
                  </div>

                  <div class="h-px bg-gray-150 dark:bg-gray-805 my-1"></div>

                  <!-- Shipping Address -->
                  <div class="space-y-1">
                    <span class="text-[9px] font-bold uppercase text-gray-400 block tracking-wider">Shipping Address</span>
                    <p class="text-xs text-gray-650 dark:text-gray-300 leading-relaxed">
                      {{ detail.deliveryAddress }}
                    </p>
                  </div>

                  <!-- Status Badges -->
                  <div class="flex gap-2 pt-1.5 flex-wrap">
                    <!-- Delivery Status Badge -->
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[8px] font-bold uppercase text-gray-450 tracking-wider">Shipping Status</span>
                      <span [class]="getStatusClass(detail.deliveryStatus)" class="text-[9px]">
                        {{ detail.deliveryStatus }}
                      </span>
                    </div>
                    <!-- Payment Status Badge -->
                    <div class="flex flex-col gap-0.5">
                      <span class="text-[8px] font-bold uppercase text-gray-450 tracking-wider">Payment Status</span>
                      <span class="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full border border-green-500/30 text-green-500 bg-green-500/10">
                        PAID
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- Close Action footer -->
            <div class="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-5">
              <button (click)="closeDetailsModal()" 
                      class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs active:scale-95 transition">
                Close Details
              </button>
            </div>
          </div>
        </div>
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

  // Modal State
  readonly selectedOrderDetail = signal<any | null>(null);

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

  // Modal actions
  viewOrderDetails(order: any): void {
    this.selectedOrderDetail.set(order);
  }

  closeDetailsModal(): void {
    this.selectedOrderDetail.set(null);
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
    const base = 'px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ';
    switch (status) {
      case 'PENDING':
        return base + 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      case 'CONFIRMED':
        return base + 'text-blue-500 bg-blue-500/10 border-blue-500/30';
      case 'SHIPPED':
        return base + 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30';
      case 'DELIVERED':
        return base + 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'CANCELLED':
        return base + 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'RETURNED':
        return base + 'text-purple-500 bg-purple-500/10 border-purple-500/30';
      default:
        return base + 'text-gray-500 bg-gray-500/10 border-gray-500/30';
    }
  }
}
