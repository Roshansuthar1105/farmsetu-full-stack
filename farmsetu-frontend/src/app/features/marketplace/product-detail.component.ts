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
    <div class="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-16">
      
      <!-- HEADER: Back navigation & Breadcrumbs -->
      @if (!loading() && product(); as p) {
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div class="flex items-center gap-4">
            <a routerLink="/app/marketplace" 
               class="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-750 bg-gray-50 dark:bg-gray-900 text-gray-650 dark:text-gray-300 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition active:scale-95 group shadow-sm">
              <span class="material-icons text-base group-hover:-translate-x-0.5 transition">arrow_back</span>
            </a>
            
            <div class="space-y-0.5">
              <!-- Breadcrumbs -->
              <div class="flex items-center gap-1.5 text-[11px] text-gray-400 font-semibold tracking-wide uppercase">
                <a routerLink="/app/marketplace" class="hover:text-green-600 transition">Marketplace</a>
                <span class="material-icons text-[10px]">chevron_right</span>
                <span class="text-green-650 dark:text-green-450">{{ p.category }}</span>
              </div>
              <h1 class="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-1">
                {{ p.title }}
              </h1>
            </div>
          </div>

          <!-- Quick Stock Indicator -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <span [class]="getStockBadgeClass(p.stockStatus)" class="px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider">
              {{ getStockStatusText(p.stockStatus) }}
            </span>
          </div>
        </div>
      }

      @if (loading()) {
        <fs-loading-skeleton />
      } @else {
        @if (product(); as p) {
          <!-- Two Column Premium Layout -->
          <div class="grid lg:grid-cols-3 gap-8 items-start">
            
            <!-- LEFT COLUMN: Product Images, Details, & Reviews (Spans 2 cols) -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Image Carousel Card -->
              <div class="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-md">
                <div class="h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-900/60 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-750 relative group">
                  @if (p.images && p.images.length) {
                    <img [src]="p.images[activeImageIndex()]" class="max-h-full max-w-full object-contain rounded-lg transition duration-500" alt="{{ p.title }}" />
                    
                    <!-- Left/Right Nav Arrows -->
                    @if (p.images.length > 1) {
                      <button (click)="prevImage(p.images.length)" class="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg text-gray-700 dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition active:scale-90 opacity-0 group-hover:opacity-100 duration-300">
                        <span class="material-icons text-sm">chevron_left</span>
                      </button>
                      <button (click)="nextImage(p.images.length)" class="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-lg text-gray-700 dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-gray-700 transition active:scale-90 opacity-0 group-hover:opacity-100 duration-300">
                        <span class="material-icons text-sm">chevron_right</span>
                      </button>
                    }
                  } @else {
                    <div class="text-center text-gray-400">
                      <span class="material-icons text-6xl">image</span>
                      <p class="text-sm mt-1">No image available</p>
                    </div>
                  }

                  <!-- Live Auction Indicator -->
                  @if (p.auction) {
                    <span class="absolute top-3 right-3 px-3 py-1.5 text-[10px] font-bold bg-red-650 text-white rounded-full shadow-md flex items-center gap-1.5 uppercase tracking-wide">
                      <span class="w-2 h-2 rounded-full bg-white animate-ping"></span> Live Auction
                    </span>
                  }
                </div>

                <!-- Carousel Thumbnails -->
                @if (p.images && p.images.length > 1) {
                  <div class="flex items-center gap-2.5 overflow-x-auto py-3 justify-center scrollbar-thin">
                    @for (img of p.images; track img; let idx = $index) {
                      <button (click)="activeImageIndex.set(idx)"
                              [class]="idx === activeImageIndex()
                                ? 'w-14 h-14 rounded-xl overflow-hidden border-2 border-green-500 scale-105 transition flex-shrink-0 shadow-sm'
                                : 'w-14 h-14 rounded-xl overflow-hidden border border-gray-250 dark:border-gray-700 opacity-60 hover:opacity-100 hover:scale-102 transition flex-shrink-0 shadow-sm'">
                        <img [src]="img" class="w-full h-full object-cover" />
                      </button>
                    }
                  </div>
                }
              </div>

              <!-- Product Details / Description -->
              <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-md space-y-4">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span class="material-icons text-green-600 text-xl">description</span> Product Description
                </h2>
                <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {{ p.description || 'No description provided for this product listing.' }}
                </p>
              </div>

              <!-- RATING & REVIEWS STATISTICS BREAKDOWN -->
              <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-md space-y-6">
                <h2 class="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
                  <span class="material-icons text-amber-500 text-xl">assessment</span> Ratings & Reviews
                </h2>

                <div class="grid md:grid-cols-3 gap-8 items-center bg-gray-50/50 dark:bg-gray-900/30 p-5 rounded-2xl border border-gray-100/50 dark:border-gray-750">
                  <!-- Score Stats -->
                  <div class="text-center md:border-r md:border-gray-200 md:dark:border-gray-700 space-y-2">
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
                  <div class="md:col-span-2 space-y-2">
                    @for (star of [5, 4, 3, 2, 1]; track star) {
                      <div class="flex items-center gap-3 text-xs">
                        <span class="w-12 text-gray-500 font-semibold text-right">{{ star }} Star</span>
                        <div class="flex-grow bg-gray-100 dark:bg-gray-900 h-3 rounded-full overflow-hidden border border-gray-150/20">
                          <div class="bg-amber-400 h-full rounded-full" 
                               [style.width.%]="getStarPercentage(star, p.starDistribution, p.totalReviews || 0)"></div>
                        </div>
                        <span class="w-12 text-gray-450 text-left">
                          {{ getStarPercentage(star, p.starDistribution, p.totalReviews || 0) | number:'1.0-0' }}%
                        </span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Review Input / Form -->
                @if (canSubmitReview()) {
                  <div class="bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-700/60 rounded-2xl p-5 space-y-4">
                    <h3 class="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                      <span class="material-icons text-green-600 text-sm">rate_review</span>
                      {{ editingReviewId() ? 'Edit Your Review' : 'Write a Review' }}
                    </h3>
                    
                    <!-- Star Rating click selector -->
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs text-gray-400 font-semibold mr-2">Your Rating:</span>
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
                                class="w-full text-xs sm:text-sm rounded-xl border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 outline-none focus:border-green-500 transition text-gray-900 dark:text-white resize-none"></textarea>
                      
                      <div class="flex justify-end gap-2">
                        @if (editingReviewId()) {
                          <button (click)="cancelReviewEdit()" class="px-4 py-2 border border-gray-200 dark:border-gray-750 text-gray-650 dark:text-gray-300 font-semibold text-xs rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition">
                            Cancel
                          </button>
                        }
                        <button (click)="submitReview(p.id)" [disabled]="!newReviewRating() || isSubmittingReview()"
                                class="px-5 py-2 bg-green-650 text-white font-bold text-xs rounded-xl shadow hover:bg-green-700 active:scale-95 transition disabled:opacity-50">
                          {{ isSubmittingReview() ? 'Submitting...' : editingReviewId() ? 'Update Review' : 'Submit Review' }}
                        </button>
                      </div>
                    </div>
                  </div>
                } @else {
                  <div class="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2 border border-amber-100/50">
                    <span class="material-icons text-sm">info</span>
                    <span>You have already reviewed this product. You can update or delete your review below.</span>
                  </div>
                }

                <!-- Reviews List -->
                <div class="space-y-4 pt-2">
                  <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider text-gray-400">Customer Comments</h3>

                  @if (reviews().length === 0) {
                    <p class="text-xs text-gray-400 italic">No reviews written for this product yet. Be the first to write one!</p>
                  } @else {
                    <div class="space-y-3">
                      @for (rev of reviews(); track rev.id) {
                        <div class="bg-gray-50/30 dark:bg-gray-900/10 border border-gray-150 dark:border-gray-750 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-250 dark:hover:border-gray-700 transition">
                          <div class="space-y-1 flex-grow">
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
                                <span class="text-[9px] font-bold text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950/30 border border-green-150/40 px-1.5 py-0.2 rounded">Your Review</span>
                              }
                            </div>
                            <!-- Review Text -->
                            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-normal">{{ rev.reviewText }}</p>
                          </div>

                          <!-- Owner Actions (Edit/Delete) -->
                          @if (isMyReview(rev.reviewerId)) {
                            <div class="flex items-center gap-2 flex-shrink-0">
                              <button (click)="editReview(rev)" class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-205 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-650 dark:text-gray-300 flex items-center justify-center transition active:scale-90" title="Edit Review">
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
                                class="px-3 py-1.5 bg-gray-50 border border-gray-250 dark:bg-gray-800 dark:border-gray-750 text-gray-500 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition active:scale-95 disabled:opacity-40">
                          Previous
                        </button>
                        <span class="text-xs text-gray-400">Page {{ reviewsPage + 1 }}</span>
                        <button (click)="nextReviewsPage()" 
                                [disabled]="(reviewsPage + 1) * reviewsPageSize >= totalReviewsCount()"
                                class="px-3 py-1.5 bg-gray-50 border border-gray-250 dark:bg-gray-800 dark:border-gray-750 text-gray-500 dark:text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition active:scale-95 disabled:opacity-40">
                          Next
                        </button>
                      </div>
                    }
                  }
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: Sticky Buy & Bidding Panel -->
            <div class="lg:col-span-1 space-y-6 lg:sticky lg:top-20">
              
              <!-- Pricing & Action Panel -->
              <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-md space-y-6">
                <!-- Auction status or Fixed Price -->
                <div>
                  @if (p.auction) {
                    <div class="space-y-1">
                      <div class="flex items-baseline gap-1">
                        <span class="text-gray-450 text-xs font-bold uppercase tracking-wider block">Current Bid</span>
                      </div>
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-3xl font-extrabold text-gray-900 dark:text-white">₹{{ p.currentBid || p.startingBid }}</span>
                      </div>
                      <p class="text-xs text-gray-400">Starting Bid: ₹{{ p.startingBid }}</p>
                      @if (p.auctionEndTime) {
                        <p class="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 pt-1.5">
                          <span class="material-icons text-sm">schedule</span> Closes: {{ p.auctionEndTime | date:'medium' }}
                        </p>
                      }
                    </div>
                  } @else {
                    <div class="space-y-1">
                      <span class="text-gray-450 text-[10px] font-bold uppercase tracking-wider block">Price</span>
                      <div class="flex items-baseline gap-1.5">
                        <span class="text-4xl font-extrabold text-green-600 dark:text-green-400">₹{{ p.price }}</span>
                        <span class="text-xs text-gray-400">/ {{ p.unit || 'Kg' }}</span>
                      </div>
                    </div>
                  }
                </div>

                <div class="border-t border-gray-100 dark:border-gray-750/70 pt-4 space-y-4">
                  @if (p.auction) {
                    <!-- Bidding Form -->
                    <form (ngSubmit)="placeBid()" class="space-y-3">
                      <div class="space-y-1">
                        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Bid Amount (₹)</label>
                        <input type="number" [(ngModel)]="bidAmount" name="bidAmount" placeholder="Enter bid amount in ₹" required class="w-full border border-gray-250 dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition text-gray-900 dark:text-white" />
                      </div>
                      <button type="submit" class="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition">
                        Place Bid
                      </button>
                      <p class="text-[10px] text-gray-400 text-center leading-normal">Your bid must be higher than ₹{{ p.currentBid || p.startingBid }}</p>
                    </form>
                  } @else {
                    <!-- Purchase Form -->
                    <div class="space-y-4">
                      <!-- Quantity Selector -->
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity</span>
                        <div class="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900">
                          <button (click)="decreaseQty()" 
                                  [disabled]="p.stockStatus === 'OUT_OF_STOCK' || orderQty <= 1"
                                  class="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-green-650 transition active:scale-95 disabled:opacity-30">
                            <span class="material-icons text-sm">remove</span>
                          </button>
                          <span class="w-8 text-center text-xs font-bold text-gray-950 dark:text-white">{{ orderQty }}</span>
                          <button (click)="increaseQty(p.stock)" 
                                  [disabled]="p.stockStatus === 'OUT_OF_STOCK' || orderQty >= p.stock"
                                  class="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-green-650 transition active:scale-95 disabled:opacity-30">
                            <span class="material-icons text-sm">add</span>
                          </button>
                        </div>
                      </div>

                      <!-- Direct Order Delivery Address -->
                      <div class="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-750">
                        <label class="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shipping Address (For Buy Now)</label>
                        <input type="text" [(ngModel)]="deliveryAddress" placeholder="Enter full address for direct checkout" class="w-full border border-gray-250 dark:border-gray-700 rounded-xl px-3.5 py-2.5 bg-gray-50 dark:bg-gray-900 text-xs outline-none focus:border-green-500 transition text-gray-950 dark:text-white" />
                      </div>

                      <!-- Actions buttons -->
                      <div class="flex flex-col gap-2.5 pt-2">
                        <button (click)="addToCart()" 
                                [disabled]="p.stockStatus === 'OUT_OF_STOCK' || p.stock <= 0"
                                class="w-full py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-250 font-extrabold rounded-xl active:scale-[0.98] transition disabled:opacity-50 text-xs flex items-center justify-center gap-1.5 border border-gray-200/50 dark:border-gray-700/50">
                          <span class="material-icons text-base">shopping_cart</span>
                          Add to Cart
                        </button>

                        <button (click)="placeOrder()" 
                                [disabled]="p.stockStatus === 'OUT_OF_STOCK' || p.stock <= 0 || !deliveryAddress.trim()"
                                class="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition disabled:opacity-50 text-xs flex items-center justify-center gap-1.5">
                          <span class="material-icons text-base">shopping_bag</span>
                          Buy Now
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- ORDER INFO PANEL -->
              @if (associatedOrders().length > 0) {
                <div class="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-md space-y-3.5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  <div class="flex items-center gap-2 text-green-650 dark:text-green-400">
                    <span class="material-icons text-xl">local_shipping</span>
                    <h3 class="text-xs font-extrabold uppercase tracking-wider">Order Track Info</h3>
                  </div>
                  
                  <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {{ isSeller() 
                        ? 'You have received ' + associatedOrders().length + ' order(s) for this listing.' 
                        : 'You have ordered this product ' + (associatedOrders().length === 1 ? 'once' : associatedOrders().length + ' times') + '.' }}
                  </p>

                  <button (click)="openOrdersModal()"
                          class="w-full py-3 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 dark:hover:bg-green-950/40 text-green-700 dark:text-green-400 font-extrabold text-xs rounded-xl active:scale-[0.98] transition border border-green-150/40 dark:border-green-800/30 flex items-center justify-center gap-1.5 shadow-sm">
                    <span class="material-icons text-sm">receipt_long</span>
                    {{ isSeller() ? 'View Received Orders' : 'View Order Details' }}
                  </button>
                </div>
              }

              <!-- Seller Profile Panel -->
              <div class="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-md space-y-4 font-outfit">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Seller Information</h3>
                
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-600 text-white font-bold flex items-center justify-center shadow">
                    {{ p.sellerName ? p.sellerName.charAt(0).toUpperCase() : 'S' }}
                  </div>
                  <div>
                    <h4 class="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">{{ p.sellerName }}</h4>
                    <span class="px-1.5 py-0.5 text-[9px] font-bold text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 rounded">Verified Listing</span>
                  </div>
                </div>

                <div class="h-px bg-gray-100 dark:bg-gray-750"></div>

                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span class="flex items-center gap-1"><span class="material-icons text-sm">location_on</span> Location:</span>
                  <span class="font-semibold text-gray-700 dark:text-gray-200">{{ p.location || 'Not Specified' }}</span>
                </div>
                
                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span class="flex items-center gap-1"><span class="material-icons text-sm">star</span> Seller Rating:</span>
                  <span class="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-0.5">
                    4.8★ <span class="text-[10px] text-gray-400">(45 sales)</span>
                  </span>
                </div>
              </div>

            </div>
            
          </div>

          <!-- ORDER DETAILS MODAL -->
          @if (showOrdersModal()) {
            <div class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
              <!-- Backdrop -->
              <div (click)="closeOrdersModal()" class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

              <!-- Content Container -->
              <div class="relative bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full shadow-2xl p-6 border border-gray-150 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-thin">
                
                <!-- Modal Header -->
                <div class="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                  <div class="space-y-0.5">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Marketplace Orders</span>
                    <h3 class="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                      <span class="material-icons text-green-600">receipt_long</span> 
                      {{ isSeller() ? 'Orders Received for Listing' : 'Your Order Purchase Info' }}
                    </h3>
                  </div>
                  <button (click)="closeOrdersModal()" class="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-gray-650 dark:hover:text-white flex items-center justify-center transition active:scale-95">✕</button>
                </div>

                <!-- Modal Body -->
                @if (associatedOrders().length > 1 && !selectedAssociatedOrder()) {
                  <!-- Order List View -->
                  <div class="space-y-3">
                    <p class="text-xs text-gray-450 mb-2 font-medium">Select an order below to view full details:</p>
                    <div class="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden bg-gray-50/20 dark:bg-gray-950/10">
                      @for (order of associatedOrders(); track order.id) {
                        <div class="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition">
                          <div class="space-y-1">
                            <div class="flex items-center gap-2">
                              <span class="text-xs font-bold text-gray-900 dark:text-white">Order #{{ order.id }}</span>
                              <span class="text-[10px] text-gray-400 font-semibold">{{ order.createdAt | date:'mediumDate' }}</span>
                            </div>
                            <div class="text-xs text-gray-500 dark:text-gray-400">
                              Qty: <strong class="text-gray-700 dark:text-gray-300">{{ order.quantity }}</strong> • 
                              Total: <strong class="text-green-600 dark:text-green-400 font-extrabold">₹{{ order.totalAmount }}</strong> •
                              {{ isSeller() ? 'Buyer: ' + (order.buyer?.name || 'Unknown') : 'Seller: ' + (order.seller?.name || 'Unknown') }}
                            </div>
                          </div>
                          <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <span [class]="getStatusClass(order.deliveryStatus)" class="text-[9px]">
                              {{ order.deliveryStatus }}
                            </span>
                            <button (click)="selectAssociatedOrder(order)" 
                                    class="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-bold rounded-lg transition active:scale-95">
                              View Receipt
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                } @else {
                  @if (selectedAssociatedOrder(); as detail) {
                  <!-- Detailed View -->
                  <div class="space-y-4">
                    @if (associatedOrders().length > 1) {
                      <button (click)="clearSelectedAssociatedOrder()" 
                              class="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-green-600 transition font-bold mb-2">
                        <span class="material-icons text-sm">arrow_back</span> Back to Orders List
                      </button>
                    }

                    <div class="grid sm:grid-cols-2 gap-6 text-xs sm:text-sm">
                      
                      <!-- Left side: Order details -->
                      <div class="space-y-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150/40 dark:border-gray-800/80 p-4 rounded-2xl">
                        <h4 class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Transaction Summary</h4>
                        
                        <div class="space-y-2.5 text-xs">
                          <div class="flex justify-between items-center">
                            <span class="text-gray-500">Order ID:</span>
                            <span class="font-bold text-gray-800 dark:text-gray-250">#{{ detail.id }}</span>
                          </div>
                          <div class="flex justify-between items-center">
                            <span class="text-gray-500">Order Date:</span>
                            <span class="font-semibold text-gray-800 dark:text-gray-255">{{ detail.createdAt | date:'medium' }}</span>
                          </div>
                          <div class="flex justify-between items-center">
                            <span class="text-gray-500">Buyer:</span>
                            <span class="font-bold text-gray-800 dark:text-gray-250">{{ detail.buyer?.name || 'Unknown' }}</span>
                          </div>
                          <div class="flex justify-between items-center">
                            <span class="text-gray-500">Seller:</span>
                            <span class="font-bold text-gray-800 dark:text-gray-250">{{ detail.seller?.name || 'Unknown' }}</span>
                          </div>
                          
                          <div class="h-px bg-gray-150 dark:bg-gray-805 my-1"></div>

                          <div class="flex justify-between items-center">
                            <span class="text-gray-500">Quantity:</span>
                            <span class="font-bold text-gray-800 dark:text-gray-255">{{ detail.quantity }} units</span>
                          </div>
                          <div class="flex justify-between items-center">
                            <span class="text-gray-500">Price Per Unit:</span>
                            <span class="font-bold text-gray-850 dark:text-gray-255">₹{{ p.price }}</span>
                          </div>
                          <div class="flex justify-between items-center">
                            <span class="text-gray-500">Total Paid:</span>
                            <span class="font-extrabold text-green-650 dark:text-green-400 text-sm">₹{{ detail.totalAmount }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Right side: Shipping & status -->
                      <div class="space-y-4 bg-gray-50/50 dark:bg-gray-950/20 border border-gray-150/40 dark:border-gray-800/80 p-4 rounded-2xl flex flex-col justify-between">
                        <div class="space-y-2.5">
                          <h4 class="text-[10px] font-bold uppercase tracking-wider text-gray-400">Shipping & Logistics</h4>
                          
                          <div class="space-y-1">
                            <span class="text-[9px] font-bold text-gray-450 uppercase block">Delivery Address</span>
                            <p class="text-xs text-gray-650 dark:text-gray-300 leading-relaxed font-medium">
                              {{ detail.deliveryAddress || 'No shipping address provided.' }}
                            </p>
                          </div>
                        </div>

                        <div class="flex gap-4 pt-2 flex-wrap border-t border-gray-150/40 dark:border-gray-800/40 mt-2">
                          <div class="flex flex-col gap-0.5">
                            <span class="text-[8px] font-bold uppercase text-gray-450 tracking-wider">Logistics Status</span>
                            <span [class]="getStatusClass(detail.deliveryStatus)" class="text-[9px] w-max">
                              {{ detail.deliveryStatus }}
                            </span>
                          </div>
                          <div class="flex flex-col gap-0.5">
                            <span class="text-[8px] font-bold uppercase text-gray-450 tracking-wider">Payment</span>
                            <span class="px-2 py-0.5 text-[9px] font-extrabold uppercase rounded-full border border-green-500/30 text-green-500 bg-green-500/10 w-max">
                              PAID
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                }
              }

                <!-- Close Action Footer -->
                <div class="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-5">
                  <button (click)="closeOrdersModal()" 
                          class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs active:scale-95 transition">
                    Close
                  </button>
                </div>
              </div>
            </div>
          }
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
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly marketplace = inject(MarketplaceService);
  readonly authService = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);

  // Associated Orders State
  readonly associatedOrders = signal<any[]>([]);
  readonly selectedAssociatedOrder = signal<any | null>(null);
  readonly showOrdersModal = signal(false);

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
        this.loadAssociatedOrders(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadAssociatedOrders(p: Product): void {
    const currentUserId = this.authService.currentUser()?.id;
    if (!currentUserId) return;

    const isSeller = Number(p.sellerId) === Number(currentUserId);
    const orderFetch = isSeller 
      ? this.marketplace.getSellerOrders() 
      : this.marketplace.getBuyerOrders();

    orderFetch.subscribe({
      next: (response: any) => {
        const allOrders = response.data || response || [];
        const filtered = allOrders.filter((o: any) => Number(o.product?.id || o.productId) === Number(p.id));
        this.associatedOrders.set(filtered);
        if (filtered.length === 1) {
          this.selectedAssociatedOrder.set(filtered[0]);
        }
      },
      error: (err) => {
        console.error('Failed to load associated orders', err);
      }
    });
  }

  isSeller(): boolean {
    const p = this.product();
    const currentId = this.authService.currentUser()?.id;
    return !!p && !!currentId && Number(p.sellerId) === Number(currentId);
  }

  openOrdersModal(): void {
    this.showOrdersModal.set(true);
    if (this.associatedOrders().length > 0 && !this.selectedAssociatedOrder()) {
      this.selectedAssociatedOrder.set(this.associatedOrders()[0]);
    }
  }

  closeOrdersModal(): void {
    this.showOrdersModal.set(false);
  }

  selectAssociatedOrder(order: any): void {
    this.selectedAssociatedOrder.set(order);
  }

  clearSelectedAssociatedOrder(): void {
    this.selectedAssociatedOrder.set(null);
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

  // Carousel helpers
  nextImage(length: number): void {
    this.activeImageIndex.update(curr => (curr + 1) % length);
  }

  prevImage(length: number): void {
    this.activeImageIndex.update(curr => (curr - 1 + length) % length);
  }

  // Qty helpers
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

  // Reviews actions
  isMyReview(reviewerId: number): boolean {
    const currentId = this.authService.currentUser()?.id;
    return Number(reviewerId) === Number(currentId);
  }

  canSubmitReview(): boolean {
    const currentId = this.authService.currentUser()?.id;
    if (!currentId) return false;
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

  // Statistics helper
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

  // Badges helper
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
        return 'text-green-750 bg-green-50 dark:text-green-400 dark:bg-green-950/40 border border-green-200/50';
      case 'LOW_STOCK':
        return 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/40 border border-amber-200/50';
      case 'OUT_OF_STOCK':
        return 'text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950/40 border border-red-200/50';
      default:
        return 'text-gray-700 bg-gray-50 dark:text-gray-400 dark:bg-gray-950/40 border border-gray-200/50';
    }
  }
}
