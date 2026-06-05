import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { PageResponse } from '../models/user.model';
import { Product } from '../models/product.model';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private readonly api = inject(ApiService);

  list(page = 0, size = 20): Observable<PageResponse<Product>> {
    return this.api.get<Product[]>('/api/marketplace/products').pipe(
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

  placeBid(id: number, amount: number): Observable<any> {
    return this.api.post<any>(`/api/marketplace/products/${id}/bids`, { amount });
  }

  createOrder(productId: number, quantity: number, deliveryAddress: string): Observable<any> {
    return this.api.post<any>('/api/marketplace/orders', { productId, quantity, deliveryAddress });
  }
}
