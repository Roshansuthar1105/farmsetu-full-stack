import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarketplaceService } from '../../core/services/marketplace.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, ProductCategory } from '../../core/models/product.model';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastrService } from 'ngx-toastr';
import {
  LucideArrowLeft,
  LucideChevronRight,
  LucideChevronLeft,
  LucideShoppingCart,
  LucideShoppingBag,
  LucideStar,
  LucideUser,
  LucideMapPin,
  LucideThumbsUp,
  LucideCheckCheck,
  LucideTruck,
  LucideFileText,
  LucideUploadCloud,
  LucideClock,
  LucideX,
  LucideTrash2,
  LucideEdit,
  LucideInfo,
  LucideMinus,
  LucidePlus
} from '@lucide/angular';

@Component({
  selector: 'fs-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    LoadingSkeletonComponent,
    LucideArrowLeft,
    LucideChevronRight,
    LucideChevronLeft,
    LucideShoppingCart,
    LucideShoppingBag,
    LucideStar,
    LucideUser,
    LucideMapPin,
    LucideThumbsUp,
    LucideCheckCheck,
    LucideTruck,
    LucideFileText,
    LucideUploadCloud,
    LucideClock,
    LucideX,
    LucideTrash2,
    LucideEdit,
    LucideInfo,
    LucideMinus,
    LucidePlus
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
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

  // Edit Listing State
  readonly showEditModal = signal(false);
  readonly editSubmitting = signal(false);
  readonly editImageUploading = signal(false);
  readonly editUploadedImages = signal<string[]>([]);
  editForm = {
    title: '',
    category: 'SEEDS' as ProductCategory,
    description: '',
    price: 0,
    stock: 0,
    lowStockThreshold: 5,
    unit: 'Kg',
    condition: 'NEW' as 'NEW' | 'USED',
    location: '',
    auction: false,
    startingBid: 0,
    auctionEndTime: undefined as string | undefined
  };
  editAuctionEndDate = '';

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

  openEditModal(): void {
    const p = this.product();
    if (!p) return;

    this.editForm = {
      title: p.title,
      category: p.category,
      description: p.description || '',
      price: p.price,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      unit: p.unit || 'Kg',
      condition: p.condition,
      location: p.location || '',
      auction: p.auction,
      startingBid: p.startingBid || 0,
      auctionEndTime: p.auctionEndTime
    };

    if (p.auctionEndTime) {
      const date = new Date(p.auctionEndTime);
      const tzoffset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
      this.editAuctionEndDate = localISOTime;
    } else {
      this.editAuctionEndDate = '';
    }

    this.editUploadedImages.set([...(p.images || [])]);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  onEditFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files: File[] = Array.from(input.files);
    this.editImageUploading.set(true);

    this.marketplace.uploadImages(files).subscribe({
      next: (urls) => {
        this.editUploadedImages.update(existing => [...existing, ...urls]);
        this.editImageUploading.set(false);
        this.toastr.success('Images uploaded successfully');
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Failed to upload images';
        this.toastr.error(errorMsg);
        this.editImageUploading.set(false);
      }
    });
  }

  removeEditUploadedImage(index: number): void {
    this.editUploadedImages.update(existing => existing.filter((_, idx) => idx !== index));
  }

  submitProductEdit(): void {
    const p = this.product();
    if (!p) return;

    this.editSubmitting.set(true);

    let endTimeStr: string | undefined = undefined;
    if (this.editForm.auction && this.editAuctionEndDate) {
      endTimeStr = new Date(this.editAuctionEndDate).toISOString();
    }

    const payload = {
      ...this.editForm,
      images: this.editUploadedImages(),
      auctionEndTime: endTimeStr
    };

    this.marketplace.update(p.id, payload).subscribe({
      next: () => {
        this.toastr.success('Listing updated successfully!', 'Success');
        this.editSubmitting.set(false);
        this.showEditModal.set(false);
        this.loadProduct();
      },
      error: (err) => {
        console.error(err);
        const errorMsg = err.error?.message || 'Failed to update listing';
        this.toastr.error(errorMsg);
        this.editSubmitting.set(false);
      }
    });
  }

  deleteListing(): void {
    const p = this.product();
    if (!p) return;

    if (confirm(`Are you sure you want to cancel the product listing for "${p.title}"?`)) {
      this.marketplace.deleteProduct(p.id).subscribe({
        next: () => {
          this.toastr.success('Listing cancelled successfully.');
          this.router.navigate(['/app/marketplace']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to cancel listing');
        }
      });
    }
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

  getStepClass(currentStatus: string, step: string): string {
    const activeClass = 'bg-green-600 text-white shadow-md shadow-green-500/20';
    const inactiveClass = 'bg-gray-150 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-250 dark:border-gray-700';

    const statusWeight: Record<string, number> = {
      'PENDING': 1,
      'CONFIRMED': 2,
      'SHIPPED': 3,
      'DELIVERED': 4
    };

    const currentWeight = statusWeight[currentStatus] || 0;
    const stepWeight = statusWeight[step] || 0;

    if (currentWeight >= stepWeight) {
      return activeClass;
    }
    return inactiveClass;
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
        this.router.navigate(['/app/orders']);
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
