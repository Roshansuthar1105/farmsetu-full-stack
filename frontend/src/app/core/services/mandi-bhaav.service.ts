import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Mandi {
  id: number;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Commodity {
  id: number;
  name: string;
  category: string;
  localName?: string;
}

export interface LatestPriceRecord {
  id: number;
  mandi: Mandi;
  commodity: Commodity;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  arrivalVolume: number;
  priceDate: string;
  distance: number;
  priceChange: number;
}

export interface WatchlistItem {
  id: number;
  commodity?: Commodity;
  mandi?: Mandi;
  latestMinPrice?: number;
  latestMaxPrice?: number;
  latestModalPrice?: number;
  priceDate?: string;
}

export interface RoiComparisonResult {
  mandi: Mandi;
  distance: number;
  modalPrice: number;
  totalRevenue: number;
  transportCost: number;
  netProfit: number;
}

export interface ForecastPoint {
  date: string;
  price: number;
}

export interface HistoryPoint {
  date: string;
  price: number;
  volume: number;
}

export interface ForecastResponse {
  history: HistoryPoint[];
  forecast: ForecastPoint[];
}

@Injectable({ providedIn: 'root' })
export class MandiBhaavService {
  private readonly api = inject(ApiService);

  getCommodities(): Observable<Commodity[]> {
    return this.api.get<Commodity[]>('/api/mandi-bhaav/commodities');
  }

  getLatestPrices(lat?: number, lng?: number, radiusKm?: number): Observable<LatestPriceRecord[]> {
    const params: Record<string, string | number | boolean> = {};
    if (lat !== undefined && lat !== null) params['lat'] = lat;
    if (lng !== undefined && lng !== null) params['lng'] = lng;
    if (radiusKm !== undefined && radiusKm !== null) params['radiusKm'] = radiusKm;
    return this.api.get<LatestPriceRecord[]>('/api/mandi-bhaav/latest', params);
  }

  getWatchlist(): Observable<WatchlistItem[]> {
    return this.api.get<WatchlistItem[]>('/api/mandi-bhaav/watchlist');
  }

  addToWatchlist(commodityId?: number, mandiId?: number): Observable<WatchlistItem> {
    const queryParts: string[] = [];
    if (commodityId !== undefined && commodityId !== null) queryParts.push(`commodityId=${commodityId}`);
    if (mandiId !== undefined && mandiId !== null) queryParts.push(`mandiId=${mandiId}`);
    const queryStr = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
    return this.api.post<WatchlistItem>(`/api/mandi-bhaav/watchlist${queryStr}`, null);
  }

  removeFromWatchlist(id: number): Observable<void> {
    return this.api.delete<void>(`/api/mandi-bhaav/watchlist/${id}`);
  }

  compareRoi(commodityId: number, quantity: number, lat?: number, lng?: number): Observable<RoiComparisonResult[]> {
    const params: Record<string, string | number | boolean> = {
      commodityId,
      quantity
    };
    if (lat !== undefined && lat !== null) params['lat'] = lat;
    if (lng !== undefined && lng !== null) params['lng'] = lng;
    return this.api.get<RoiComparisonResult[]>('/api/mandi-bhaav/compare-roi', params);
  }

  getForecast(commodityId: number, days?: number): Observable<ForecastResponse> {
    const params: Record<string, string | number | boolean> = {};
    if (days !== undefined && days !== null) params['days'] = days;
    return this.api.get<ForecastResponse>(`/api/mandi-bhaav/forecast/${commodityId}`, params);
  }
}
