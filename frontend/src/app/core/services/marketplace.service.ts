import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { PageResponse } from '../models/user.model';
import { Product } from '../models/product.model';
import { CartResponse } from '../models/cart.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private readonly api = inject(ApiService);

  list(
    page = 0,
    size = 20,
    category = '',
    search = '',
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
    stockStatus?: string,
    sortBy = 'newest'
  ): Observable<PageResponse<Product>> {
    let url = `/api/marketplace/products?page=${page}&size=${size}&sortBy=${sortBy}`;
    if (category && category !== 'ALL') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (minPrice != null) {
      url += `&minPrice=${minPrice}`;
    }
    if (maxPrice != null) {
      url += `&maxPrice=${maxPrice}`;
    }
    if (minRating != null) {
      url += `&minRating=${minRating}`;
    }
    if (stockStatus && stockStatus !== 'ALL') {
      url += `&stockStatus=${encodeURIComponent(stockStatus)}`;
    }

    return this.api.get<Product[]>(url).pipe(
      map((products) => ({
        content: products,
        page: page,
        size: size,
        totalElements: products.length,
        totalPages: Math.ceil(products.length / size),
        last: true
      }))
    );
  }

  get(id: number): Observable<Product> {
    return this.api.get<Product>(`/api/marketplace/products/${id}`);
  }

  create(body: unknown): Observable<Product> {
    return this.api.post<Product>('/api/marketplace/products', body);
  }

  update(id: number, body: unknown): Observable<Product> {
    return this.api.put<Product>(`/api/marketplace/products/${id}`, body);
  }

  deleteProduct(id: number): Observable<void> {
    return this.api.delete<void>(`/api/marketplace/products/${id}`);
  }

  placeBid(id: number, amount: number): Observable<any> {
    return this.api.post<any>(`/api/marketplace/products/${id}/bids`, { amount });
  }

  createOrder(productId: number, quantity: number, deliveryAddress: string): Observable<any> {
    return this.api.post<any>('/api/marketplace/orders', { productId, quantity, deliveryAddress });
  }

  // Cart Management
  getCart(): Observable<CartResponse> {
    return this.api.get<CartResponse>('/api/marketplace/cart');
  }

  addToCart(productId: number, quantity: number): Observable<any> {
    return this.api.post<any>('/api/marketplace/cart', { productId, quantity });
  }

  updateCartQuantity(productId: number, quantity: number): Observable<any> {
    return this.api.put<any>(`/api/marketplace/cart/${productId}`, { quantity });
  }

  removeFromCart(productId: number): Observable<void> {
    return this.api.delete<void>(`/api/marketplace/cart/${productId}`);
  }

  checkout(deliveryAddress: string): Observable<any[]> {
    return this.api.post<any[]>('/api/marketplace/cart/checkout', { deliveryAddress });
  }

  // Order History Management
  getBuyerOrders(page = 0, size = 50): Observable<any[]> {
    return this.api.get<any[]>(`/api/marketplace/orders/buyer?page=${page}&size=${size}`);
  }

  getSellerOrders(page = 0, size = 50): Observable<any[]> {
    return this.api.get<any[]>(`/api/marketplace/orders/seller?page=${page}&size=${size}`);
  }

  updateOrderStatus(orderId: number, status: string): Observable<any> {
    return this.api.put<any>(`/api/marketplace/orders/${orderId}/status?status=${status}`, {});
  }

  // Reviews and Ratings Management
  getReviews(productId: number, page = 0, size = 20): Observable<any[]> {
    return this.api.get<any[]>(`/api/marketplace/products/${productId}/reviews?page=${page}&size=${size}`);
  }

  addReview(productId: number, rating: number, comment: string): Observable<any> {
    return this.api.post<any>(`/api/marketplace/products/${productId}/review`, { rating, comment });
  }

  updateReview(reviewId: number, rating: number, comment: string): Observable<any> {
    return this.api.put<any>(`/api/marketplace/reviews/${reviewId}`, { rating, comment });
  }

  deleteReview(reviewId: number): Observable<void> {
    return this.api.delete<void>(`/api/marketplace/reviews/${reviewId}`);
  }

  // Image Uploading
  uploadImages(files: File[]): Observable<string[]> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    return this.api.post<string[]>('/api/marketplace/products/upload', formData);
  }
}
