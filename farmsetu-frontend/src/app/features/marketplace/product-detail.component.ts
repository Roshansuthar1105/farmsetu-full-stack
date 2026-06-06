import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fs-product-detail',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LoadingSkeletonComponent],
  template: `
    <div class="max-w-5xl mx-auto p-4 space-y-8 pb-16">
      <a routerLink="/app/marketplace" class="inline-flex items-center gap-2 text-xs font-bold text-green-700 dark:text-green-450 bg-green-50 dark:bg-green-950/40 px-4 py-2.5 rounded-xl hover:bg-green-100 dark:hover:bg-green-950/60 transition active:scale-95 border border-green-100/30">
        <span class="material-icons text-sm">arrow_back</span> Back to Marketplace
      </a>
      
      @if (loading()) {
        <fs-loading-skeleton />
      } @else {
        @if (product(); as p) {
          <div class="grid lg:grid-cols-2 gap-8 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            
            <!-- Left: Product Image Carousel -->
            <div class="space-y-4">
              <div class="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 relative group">
                @if (p.images && p.images.length) {
                  <img [src]="p.images[activeImageIndex()]" class="max-h-full max-w-full object-contain rounded-lg transition duration-500" alt="{{ p.title }}" />
                  
                  <!-- Left/Right Navigation -->
                  @if (p.images.length > 1) {
                    <button (click)="prevImage(p.images.length)" class="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md text-gray-700 dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition active:scale-90">
                      <span class="material-icons text-sm">chevron_left</span>
                    </button>
                    <button (click)="nextImage(p.images.length)" class="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-md text-gray-700 dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition active:scale-90">
                      <span class="material-icons text-sm">chevron_right</span>
                    </button>
                  }
                } @else {
                  <div class="text-center text-gray-400">
                    <span class="material-icons text-6xl">image</span>
                    <p class="text-sm mt-1">No image available</p>
                  </div>
                }

                <!-- Auction Status Badge -->
                @if (p.auction) {
                  <span class="absolute top-3 right-3 px-2.5 py-1 text-[10px] font-bold bg-red-600 text-white rounded-full shadow-md flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span> Live Auction
                  </span>
                }
              </div>

              <!-- Carousel Thumbnails -->
              @if (p.images && p.images.length > 1) {
                <div class="flex items-center gap-2 overflow-x-auto py-1 justify-center scrollbar-thin">
                  @for (img of p.images; track img; let idx = $index) {
                    <button (click)="activeImageIndex.set(idx)"
                            [class]="idx === activeImageIndex()
                              ? 'w-14 h-14 rounded-lg overflow-hidden border-2 border-green-500 scale-105 transition flex-shrink-0'
                              : 'w-14 h-14 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 opacity-60 hover:opacity-100 hover:scale-102 transition flex-shrink-0'">
                      <img [src]="img" class="w-full h-full object-cover" />
                    </button>
                  }
                </div>
              }
            </div>
            
            <!-- Right: Details and Action Forms -->
            <div class="flex flex-col justify-between space-y-6">
              <div class="space-y-4">
                <div class="flex flex-wrap gap-2 items-center justify-between">
                  <span class="px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 border border-green-100/30 dark:border-green-800/30 rounded-full w-max">
                    {{ p.category }}
                  </span>
                  
                  <span [class]="getStockBadgeClass(p.stockStatus)" class="px-2.5 py-1 text-xs font-bold rounded-full">
                    {{ getStockStatusText(p.stockStatus) }}
                  </span>
                </div>
                
                <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{{ p.title }}</h1>
                
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Listed by: <span class="font-bold text-gray-700 dark:text-gray-200">{{ p.sellerName }}</span>
                </p>

                <div class="border-t border-b border-gray-100 dark:border-gray-700/60 py-4">
                  @if (p.auction) {
                    <div class="space-y-2">
                      <span class="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Bidding Open
                      </span>
                      <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-extrabold text-gray-900 dark:text-white">₹{{ p.currentBid || p.startingBid }}</span>
                        <span class="text-xs text-gray-400">Current Bid</span>
                      </div>
                      <p class="text-xs text-gray-400 font-medium">Starting Bid: ₹{{ p.startingBid }}</p>
                      @if (p.auctionEndTime) {
                        <p class="text-xs text-amber-600 font-bold flex items-center gap-1">
                          <span class="material-icons text-sm">schedule</span> Closes: {{ p.auctionEndTime | date:'medium' }}
                        </p>
                      }
                    </div>
                  } @else {
                    <div class="space-y-1">
                      <div class="flex items-baseline gap-2">
                        <span class="text-3xl font-extrabold text-green-600 dark:text-green-400">₹{{ p.price }}</span>
                        <span class="text-xs text-gray-400">/ {{ p.unit || 'Kg' }}</span>
                      </div>
                      <div class="flex items-center gap-2 pt-1">
                        <span class="text-xs text-gray-500">Stock Available: <strong class="text-gray-800 dark:text-gray-200">{{ p.stock }} {{ p.unit || 'Kg' }}</strong></span>
                        @if (p.stockStatus === 'LOW_STOCK') {
                          <span class="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded border border-amber-100/50">Only {{ p.stock }} left!</span>
                        }
                      </div>
                    </div>
                  }
                </div>

                <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{{ p.description }}</p>
              </div>

              <!-- Action Controls Card -->
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                @if (p.auction) {
                  <!-- Bidding Form -->
                  <form (ngSubmit)="placeBid()" class="space-y-3">
                    <h3 class="text-sm font-bold text-gray-700 dark:text-gray-200">Place Your Bid</h3>
                    <div class="flex gap-2">
                      <input type="number" [(ngModel)]="bidAmount" name="bidAmount" placeholder="Enter bid amount in ₹" required class="flex-1 border rounded-xl px-4 py-3 bg-white dark:bg-gray-800 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition text-gray-900 dark:text-white" />
                      <button type="submit" class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition">
                        Bid
                      </button>
                    </div>
                    <p class="text-[10px] text-gray-400">Min bid must be higher than current bid ₹{{ p.currentBid || p.startingBid }}</p>
                  </form>
                } @else {
                  <!-- Purchase / Cart Form -->
                  <div class="space-y-4">
                    <!-- Qty Input Capping at Stock -->
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-gray-500 uppercase">Purchase Quantity</span>
                      <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                        <button (click)="decreaseQty()" 
                                [disabled]="p.stockStatus === 'OUT_OF_STOCK' || orderQty <= 1"
                                class="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-green-600 transition active:scale-95 disabled:opacity-30">
                          <span class="material-icons text-sm">remove</span>
                        </button>
                        <span class="w-8 text-center text-xs font-bold text-gray-950 dark:text-white">{{ orderQty }}</span>
                        <button (click)="increaseQty(p.stock)" 
                                [disabled]="p.stockStatus === 'OUT_OF_STOCK' || orderQty >= p.stock"
                                class="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-green-600 transition active:scale-95 disabled:opacity-30">
                          <span class="material-icons text-sm">add</span>
                        </button>
                      </div>
                    </div>

                    <!-- Direct Checkout (Buy Now) Address input -->
                    <div class="space-y-2 pt-2 border-t border-gray-150 dark:border-gray-800">
                      <label class="block text-[10px] font-bold text-gray-400 uppercase">Direct Order Delivery Address</label>
                      <input type="text" [(ngModel)]="deliveryAddress" placeholder="Enter delivery address for instant checkout" class="w-full border rounded-xl px-3.5 py-2.5 bg-white dark:bg-gray-800 text-xs sm:text-sm outline-none focus:border-green-500 transition text-gray-950 dark:text-white" />
                    </div>

                    <div class="grid grid-cols-2 gap-3 pt-2">
                      <!-- Add to Cart Button -->
                      <button (click)="addToCart()" 
                              [disabled]="p.stockStatus === 'OUT_OF_STOCK' || p.stock <= 0"
                              class="py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200 font-bold rounded-xl active:scale-[0.98] transition disabled:opacity-50 text-xs sm:text-sm flex items-center justify-center gap-1.5">
                        <span class="material-icons text-base">shopping_cart</span>
                        Add to Cart
                      </button>

                      <!-- Buy Now Button -->
                      <button (click)="placeOrder()" 
                              [disabled]="p.stockStatus === 'OUT_OF_STOCK' || p.stock <= 0 || !deliveryAddress.trim()"
                              class="py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition disabled:opacity-50 text-xs sm:text-sm flex items-center justify-center gap-1.5">
                        <span class="material-icons text-base">shopping_bag</span>
                        Buy Now
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- RATING & REVIEWS STATISTICS BREAKDOWN -->
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-6">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
              <span class="material-icons text-amber-500">assessment</span> Ratings & Reviews
            </h2>

            <div class="grid md:grid-cols-3 gap-8 items-center">
              <!-- Score Stats -->
              <div class="text-center md:border-r md:border-gray-100 md:dark:border-gray-700 space-y-2">
                <p class="text-5xl font-extrabold text-gray-900 dark:text-white">
                  {{ p.averageRating ? (p.averageRating | number:'1.1-1') : '0.0' }}
                </p>
                <div class="flex items-center justify-center gap-0.5 text-amber-400">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span class="material-icons text-lg">
                      {{ getStarIconName(p.averageRating || 0, star) }}
                    </span>
                  }
                </div>
                <p class="text-xs text-gray-400 font-semibold">{{ p.totalReviews || 0 }} reviews total</p>
              </div>

              <!-- Distribution Bars -->
              <div class="md:col-span-2 space-y-2.5">
                @for (star of [5, 4, 3, 2, 1]; track star) {
                  <div class="flex items-center gap-3 text-xs">
                    <span class="w-12 text-gray-500 font-semibold text-right">{{ star }} Star</span>
                    <div class="flex-grow bg-gray-100 dark:bg-gray-900 h-3 rounded-full overflow-hidden border border-gray-150/20">
                      <div class="bg-amber-400 h-full rounded-full" 
                           [style.width.%]="getStarPercentage(star, p.starDistribution, p.totalReviews || 0)"></div>
                    </div>
                    <span class="w-12 text-gray-400 text-left">
                      {{ getStarPercentage(star, p.starDistribution, p.totalReviews || 0) | number:'1.0-0' }}%
                    </span>
                  </div>
                }
              </div>
            </div>

            <div class="h-px bg-gray-100 dark:bg-gray-750"></div>

            <!-- Review Input / Form -->
            @if (canSubmitReview()) {
              <div class="bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-700/60 rounded-2xl p-5 space-y-4">
                <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {{ editingReviewId() ? 'Edit Your Review' : 'Write a Review' }}
                </h3>
                
                <!-- Star Rating click selector -->
                <div class="flex items-center gap-1.5">
                  <span class="text-xs text-gray-400 font-medium mr-2">Your Rating:</span>
                  @for (star of [1,2,3,4,5]; track star) {
                    <button type="button" (click)="newReviewRating.set(star)" class="text-amber-400 hover:scale-110 active:scale-95 transition outline-none">
                      <span class="material-icons text-2xl">
                        {{ star <= newReviewRating() ? 'star' : 'star_border' }}
                      </span>
                    </button>
                  }
                </div>

                <div class="space-y-3">
                  <textarea [(ngModel)]="newReviewComment" rows="3" placeholder="Share your experience using this product. Be descriptive..."
                            class="w-full text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white resize-none"></textarea>
                  
                  <div class="flex justify-end gap-2">
                    @if (editingReviewId()) {
                      <button (click)="cancelReviewEdit()" class="px-4 py-2 border border-gray-200 dark:border-gray-750 text-gray-650 dark:text-gray-300 font-semibold text-xs rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition">
                        Cancel
                      </button>
                    }
                    <button (click)="submitReview(p.id)" [disabled]="!newReviewRating() || isSubmittingReview()"
                            class="px-5 py-2 bg-green-600 text-white font-bold text-xs rounded-xl shadow hover:bg-green-700 active:scale-95 transition disabled:opacity-50">
                      {{ isSubmittingReview() ? 'Submitting...' : editingReviewId() ? 'Update Review' : 'Submit Review' }}
                    </button>
                  </div>
                </div>
              </div>
            } @else {
              <div class="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <span class="material-icons text-sm">info</span>
                <span>You have already reviewed this product. You can update or delete your review below.</span>
              </div>
            }

            <!-- Reviews List -->
            <div class="space-y-4">
              <h3 class="text-base font-bold text-gray-900 dark:text-white">Customer Reviews</h3>

              @if (reviews().length === 0) {
                <p class="text-xs text-gray-400 italic">No reviews written for this product yet. Be the first to write one!</p>
              } @else {
                <div class="space-y-3.5">
                  @for (rev of reviews(); track rev.id) {
                    <div class="bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-750 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-200 dark:hover:border-gray-700 transition">
                      <div class="space-y-1">
                        <!-- Rating & Name -->
                        <div class="flex items-center gap-2 flex-wrap">
                          <div class="flex items-center text-amber-400 gap-0.5">
                            @for (star of [1,2,3,4,5]; track star) {
                              <span class="material-icons text-xs">
                                {{ star <= rev.rating ? 'star' : 'star_border' }}
                              </span>
                            }
                          </div>
                          <span class="text-xs font-bold text-gray-800 dark:text-gray-200">{{ rev.reviewerName }}</span>
                          @if (isMyReview(rev.reviewerId)) {
                            <span class="text-[9px] font-bold text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/30 border border-green-100/50 px-1.5 py-0.2 rounded">Your Review</span>
                          }
                        </div>
                        <!-- Review Text -->
                        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-normal">{{ rev.reviewText }}</p>
                      </div>

                      <!-- Owner Actions (Edit/Delete) -->
                      @if (isMyReview(rev.reviewerId)) {
                        <div class="flex items-center gap-2 flex-shrink-0">
                          <button (click)="editReview(rev)" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-650 dark:text-gray-300 flex items-center justify-center transition active:scale-90" title="Edit Review">
                            <span class="material-icons text-sm">edit</span>
                          </button>
                          <button (click)="deleteReview(rev.id)" class="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center transition active:scale-90" title="Delete Review">
                            <span class="material-icons text-sm">delete</span>
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>

                <!-- Reviews Pagination -->
                @if (totalReviewsCount() > reviewsPageSize) {
                  <div class="flex items-center justify-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/60">
                    <button (click)="prevReviewsPage()" 
                            [disabled]="reviewsPage === 0"
                            class="px-3 py-1.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-100 transition active:scale-95 disabled:opacity-40">
                      Previous
                    </button>
                    <span class="text-xs text-gray-400">Page {{ reviewsPage + 1 }}</span>
                    <button (click)="nextReviewsPage()" 
                            [disabled]="(reviewsPage + 1) * reviewsPageSize >= totalReviewsCount()"
                            class="px-3 py-1.5 bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-500 rounded-lg text-xs font-bold hover:bg-gray-100 transition active:scale-95 disabled:opacity-40">
                      Next
                    </button>
                  </div>
                }
              }
            </div>
          </div>
        }
      }
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly marketplace = inject(MarketplaceService);
  readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);

  // Carousel State
  readonly activeImageIndex = signal(0);

  // Buy Form bindings
  orderQty = 1;
  deliveryAddress = '';
  bidAmount: number | null = null;

  // Review bindings
  readonly reviews = signal<any[]>([]);
  readonly newReviewRating = signal<number>(5);
  newReviewComment = '';
  readonly editingReviewId = signal<number | null>(null);
  readonly isSubmittingReview = signal(false);

  // Reviews list pagination
  reviewsPage = 0;
  readonly reviewsPageSize = 5;
  readonly totalReviewsCount = signal<number>(0);

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.marketplace.get(id).subscribe({
      next: (p) => {
        this.product.set(p);
        this.totalReviewsCount.set(p.totalReviews || 0);
        this.loadReviews(id);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadReviews(productId: number): void {
    this.marketplace.getReviews(productId, this.reviewsPage, this.reviewsPageSize).subscribe({
      next: (response: any) => {
        const rawReviews = response.data || response || [];
        const normalized = rawReviews.map((r: any) => this.normalizeReview(r));
        this.reviews.set(normalized);
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  normalizeReview(raw: any): any {
    return {
      id: raw.id || raw.ID,
      rating: raw.rating || raw.RATING || 0,
      reviewText: raw.review_text || raw.reviewText || raw.REVIEW_TEXT || '',
      reviewerId: raw.reviewer_id || raw.reviewerId || raw.REVIEWER_ID || 0,
      reviewerName: raw.reviewerName || raw.reviewer_name || raw.REVIEWERNAME || 'Anonymous User',
      createdDate: raw.created_date || raw.createdDate || raw.CREATED_DATE || null
    };
  }

  // Carousel helper
  nextImage(length: number): void {
    this.activeImageIndex.update(curr => (curr + 1) % length);
  }

  prevImage(length: number): void {
    this.activeImageIndex.update(curr => (curr - 1 + length) % length);
  }

  // Stock Form actions
  increaseQty(stock: number): void {
    if (this.orderQty < stock) {
      this.orderQty++;
    }
  }

  decreaseQty(): void {
    if (this.orderQty > 1) {
      this.orderQty--;
    }
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;

    this.marketplace.addToCart(p.id, this.orderQty).subscribe({
      next: () => {
        this.toastr.success(`Added ${this.orderQty} units to cart!`, 'Cart Updated');
        this.orderQty = 1;
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Failed to add to cart';
        this.toastr.error(errorMsg);
      }
    });
  }

  placeOrder(): void {
    const p = this.product();
    if (!p || !this.orderQty || !this.deliveryAddress.trim()) {
      this.toastr.warning('Please enter a delivery address');
      return;
    }

    this.marketplace.createOrder(p.id, this.orderQty, this.deliveryAddress).subscribe({
      next: () => {
        this.toastr.success(`Direct checkout of ${this.orderQty} units processed!`, 'Order Placed');
        this.orderQty = 1;
        this.deliveryAddress = '';
        this.loadProduct();
        this.router.navigate(['/app/marketplace/orders']);
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Failed to place order';
        this.toastr.error(errorMsg);
        this.loadProduct();
      }
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
      next: () => {
        this.toastr.success(`Successfully bid ₹${this.bidAmount}!`, 'Bid Placed');
        this.bidAmount = null;
        this.loadProduct();
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to submit your bid. Try again.', 'Error');
      }
    });
  }

  // Reviews section actions
  isMyReview(reviewerId: number): boolean {
    const currentId = this.authService.currentUser()?.id;
    return Number(reviewerId) === Number(currentId);
  }

  canSubmitReview(): boolean {
    const currentId = this.authService.currentUser()?.id;
    if (!currentId) return false;
    // Check if user already has a review in the listed collection
    const hasReviewed = this.reviews().some(r => Number(r.reviewerId) === Number(currentId));
    return !hasReviewed || !!this.editingReviewId();
  }

  submitReview(productId: number): void {
    if (this.newReviewRating() < 1 || this.newReviewRating() > 5) {
      this.toastr.warning('Please select a valid rating between 1 and 5 stars');
      return;
    }

    this.isSubmittingReview.set(true);

    const action = this.editingReviewId()
      ? this.marketplace.updateReview(this.editingReviewId()!, this.newReviewRating(), this.newReviewComment)
      : this.marketplace.addReview(productId, this.newReviewRating(), this.newReviewComment);

    action.subscribe({
      next: () => {
        this.toastr.success(
          this.editingReviewId() ? 'Review updated successfully!' : 'Thank you for your review!',
          'Review Submitted'
        );
        this.isSubmittingReview.set(false);
        this.editingReviewId.set(null);
        this.newReviewComment = '';
        this.newReviewRating.set(5);
        this.loadProduct();
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Failed to submit review';
        this.toastr.error(errorMsg);
        this.isSubmittingReview.set(false);
      }
    });
  }

  editReview(rev: any): void {
    this.editingReviewId.set(rev.id);
    this.newReviewRating.set(rev.rating);
    this.newReviewComment = rev.reviewText;
    // scroll review input into view
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  cancelReviewEdit(): void {
    this.editingReviewId.set(null);
    this.newReviewComment = '';
    this.newReviewRating.set(5);
  }

  deleteReview(reviewId: number): void {
    if (confirm('Are you sure you want to delete your review?')) {
      this.marketplace.deleteReview(reviewId).subscribe({
        next: () => {
          this.toastr.success('Review deleted successfully');
          this.loadProduct();
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to delete review');
        }
      });
    }
  }

  nextReviewsPage(): void {
    if ((this.reviewsPage + 1) * this.reviewsPageSize < this.totalReviewsCount()) {
      this.reviewsPage++;
      const p = this.product();
      if (p) this.loadReviews(p.id);
    }
  }

  prevReviewsPage(): void {
    if (this.reviewsPage > 0) {
      this.reviewsPage--;
      const p = this.product();
      if (p) this.loadReviews(p.id);
    }
  }

  // Distribution helper
  getStarPercentage(star: number, distribution: Record<number, number> | undefined, total: number): number {
    if (!distribution || total === 0) return 0;
    const count = distribution[star] || 0;
    return (count / total) * 100;
  }

  getStarIconName(avgRating: number, index: number): string {
    const decimal = avgRating - (index - 1);
    if (decimal >= 1) return 'star';
    if (decimal >= 0.5) return 'star_half';
    return 'star_border';
  }

  // Stock Badge helper
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
