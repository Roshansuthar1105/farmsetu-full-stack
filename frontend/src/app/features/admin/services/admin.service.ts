import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay, map, catchError, of, retry } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalPosts: number;
  totalCrops: number;
  totalSchemes: number;
  totalInsurance: number;
  totalMandis: number;
  totalNews: number;
  totalResources: number;
}

export interface MonthlyDataPoint {
  month: string;
  count: number;
  revenue?: number;
}

export interface DashboardAnalytics {
  monthlyOrders: MonthlyDataPoint[];
  monthlyRevenue: MonthlyDataPoint[];
  userGrowth: MonthlyDataPoint[];
  ordersByStatus: Record<string, number>;
  ordersByPayment: Record<string, number>;
  usersByRole: Record<string, number>;
}

export interface RecentOrder {
  id: number;
  buyer?: { id: number; name: string };
  seller?: { id: number; name: string };
  product?: { id: number; title: string };
  totalAmount: number;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: string;
  quantity: number;
}

export interface RecentUser {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  profilePhoto?: string;
  verified: boolean;
  createdAt?: string;
}

export interface TopProduct {
  id: number;
  title: string;
  category: string;
  price: number;
  orderCount: number;
  revenue: number;
  images?: string[];
}

export interface LowStockProduct {
  id: number;
  title: string;
  stock: number;
  lowStockThreshold: number;
  category: string;
}

export interface AdminPageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);
  private dashboardCache$?: Observable<DashboardStats>;

  // ── Dashboard ──────────────────────────────────────────
  getDashboardStats(forceRefresh = false): Observable<DashboardStats> {
    if (!this.dashboardCache$ || forceRefresh) {
      this.dashboardCache$ = this.api.get<DashboardStats>('/api/admin/dashboard').pipe(
        retry(2),
        shareReplay(1),
        catchError(() =>
          of({
            totalUsers: 0, activeUsers: 0, newUsersThisMonth: 0,
            totalOrders: 0, totalRevenue: 0, totalProducts: 0,
            totalPosts: 0, totalCrops: 0, totalSchemes: 0,
            totalInsurance: 0, totalMandis: 0, totalNews: 0,
            totalResources: 0
          })
        )
      );
    }
    return this.dashboardCache$;
  }

  clearDashboardCache(): void {
    this.dashboardCache$ = undefined;
  }

  getDashboardAnalytics(): Observable<DashboardAnalytics> {
    return this.api.get<DashboardAnalytics>('/api/admin/dashboard/analytics').pipe(
      retry(1),
      catchError(() =>
        of({
          monthlyOrders: [], monthlyRevenue: [], userGrowth: [],
          ordersByStatus: {}, ordersByPayment: {}, usersByRole: {}
        })
      )
    );
  }

  getRecentOrders(limit = 5): Observable<RecentOrder[]> {
    return this.api.get<AdminPageResponse<RecentOrder>>('/api/admin/orders', { page: 0, size: limit }).pipe(
      map(res => res.content || []),
      catchError(() => of([]))
    );
  }

  getRecentUsers(limit = 5): Observable<RecentUser[]> {
    return this.api.get<AdminPageResponse<RecentUser>>('/api/admin/users', { page: 0, size: limit }).pipe(
      map(res => res.content || []),
      catchError(() => of([]))
    );
  }

  getTopProducts(limit = 5): Observable<TopProduct[]> {
    return this.api.get<TopProduct[]>('/api/admin/products/top', { limit }).pipe(
      catchError(() => of([]))
    );
  }

  getLowStockProducts(): Observable<LowStockProduct[]> {
    return this.api.get<LowStockProduct[]>('/api/admin/products/low-stock').pipe(
      catchError(() => of([]))
    );
  }

  // ── Reports ────────────────────────────────────────────
  getReports(): Observable<any> {
    return this.api.get('/api/admin/reports');
  }

  // ── Generic CRUD helpers ───────────────────────────────
  list<T>(endpoint: string, page = 0, size = 20, params?: Record<string, string | number | boolean>): Observable<AdminPageResponse<T>> {
    return this.api.get<AdminPageResponse<T>>(endpoint, { page, size, ...params });
  }

  getById<T>(endpoint: string, id: number): Observable<T> {
    return this.api.get<T>(`${endpoint}/${id}`);
  }

  create<T>(endpoint: string, body: unknown): Observable<T> {
    return this.api.post<T>(endpoint, body);
  }

  update<T>(endpoint: string, id: number, body: unknown): Observable<T> {
    return this.api.put<T>(`${endpoint}/${id}`, body);
  }

  remove(endpoint: string, id: number): Observable<void> {
    return this.api.delete<void>(`${endpoint}/${id}`);
  }
}
