import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { PageResponse } from '../models/user.model';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private readonly api = inject(ApiService);

  list(page = 0, size = 20) {
    return this.api.getPage<Product>('/api/products', page, size);
  }

  get(id: number) {
    return this.api.get<Product>(`/api/products/${id}`);
  }

  create(body: unknown) {
    return this.api.post<Product>('/api/products', body);
  }
}
