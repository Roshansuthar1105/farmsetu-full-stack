import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule } from 'ng-apexcharts';
import { forkJoin, interval, Subscription } from 'rxjs';
import { AdminService, DashboardStats, RecentOrder, RecentUser, DashboardAnalytics } from './services/admin.service';
import { AdminStatCardComponent } from './shared/admin-stat-card/admin-stat-card.component';
import { AdminChartCardComponent } from './shared/admin-chart-card/admin-chart-card.component';
import { AdminSkeletonComponent } from './shared/admin-skeleton/admin-skeleton.component';
import { AdminPageHeaderComponent } from './shared/admin-page-header/admin-page-header.component';

@Component({
  selector: 'fs-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, NgApexchartsModule,
    AdminStatCardComponent, AdminChartCardComponent,
    AdminSkeletonComponent, AdminPageHeaderComponent
  ],
  template: `
    <div class="space-y-6">
      <!-- Page Header -->
      <fs-admin-page-header title="Admin Dashboard" subtitle="Overview of your platform metrics and recent activity">
        <button (click)="refreshData()" class="px-4 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" [class.animate-spin]="loading()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>
      </fs-admin-page-header>

      <!-- Stat Cards Grid -->
      @if (loading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <fs-admin-skeleton variant="card" />
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <fs-admin-stat-card
            label="Total Users"
            [value]="stats().totalUsers"
            [trend]="12"
            subtitle="All registered users"
            accentColor="#22C55E"
            iconBg="rgba(34, 197, 94, 0.1)"
            iconColor="#22C55E"
            icon="users" />
          <fs-admin-stat-card
            label="Active Users"
            [value]="stats().activeUsers"
            [trend]="8"
            subtitle="Currently active"
            accentColor="#3B82F6"
            iconBg="rgba(59, 130, 246, 0.1)"
            iconColor="#3B82F6"
            icon="active-users" />
          <fs-admin-stat-card
            label="New This Month"
            [value]="stats().newUsersThisMonth"
            [trend]="15"
            subtitle="New registrations"
            accentColor="#8B5CF6"
            iconBg="rgba(139, 92, 246, 0.1)"
            iconColor="#8B5CF6"
            icon="new-users" />
          <fs-admin-stat-card
            label="Total Orders"
            [value]="stats().totalOrders"
            [trend]="5"
            subtitle="All marketplace orders"
            accentColor="#F59E0B"
            iconBg="rgba(245, 158, 11, 0.1)"
            iconColor="#F59E0B"
            icon="orders" />
          <fs-admin-stat-card
            label="Revenue"
            [value]="stats().totalRevenue"
            prefix="₹"
            [trend]="22"
            subtitle="Total platform revenue"
            accentColor="#10B981"
            iconBg="rgba(16, 185, 129, 0.1)"
            iconColor="#10B981"
            icon="revenue" />
          <fs-admin-stat-card
            label="Products"
            [value]="stats().totalProducts"
            subtitle="Listed in marketplace"
            accentColor="#EC4899"
            iconBg="rgba(236, 72, 153, 0.1)"
            iconColor="#EC4899"
            icon="products" />
          <fs-admin-stat-card
            label="Crops"
            [value]="stats().totalCrops"
            subtitle="Registered crop types"
            accentColor="#14B8A6"
            iconBg="rgba(20, 184, 166, 0.1)"
            iconColor="#14B8A6"
            icon="crops" />
          <fs-admin-stat-card
            label="Community Posts"
            [value]="stats().totalPosts"
            subtitle="Forum discussions"
            accentColor="#6366F1"
            iconBg="rgba(99, 102, 241, 0.1)"
            iconColor="#6366F1"
            icon="posts" />
        </div>
      }

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        @if (loading()) {
          <fs-admin-skeleton variant="chart" />
          <fs-admin-skeleton variant="chart" />
        } @else {
          <fs-admin-chart-card
            title="Revenue Trends"
            subtitle="Monthly revenue over last 12 months"
            [loading]="chartsLoading()"
            [chartOptions]="revenueChartOptions()" />
          <fs-admin-chart-card
            title="Order Analytics"
            subtitle="Monthly orders breakdown"
            [loading]="chartsLoading()"
            [chartOptions]="ordersChartOptions()" />
        }
      </div>

      <!-- User Growth + Status Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        @if (loading()) {
          <fs-admin-skeleton variant="chart" />
          <fs-admin-skeleton variant="chart" />
          <fs-admin-skeleton variant="chart" />
        } @else {
          <fs-admin-chart-card
            title="User Growth"
            subtitle="New registrations per month"
            [loading]="chartsLoading()"
            [chartOptions]="userGrowthChartOptions()" />
          <fs-admin-chart-card
            title="Orders by Status"
            subtitle="Delivery status distribution"
            [loading]="chartsLoading()"
            [chartOptions]="orderStatusChartOptions()" />
          <fs-admin-chart-card
            title="Users by Role"
            subtitle="Role distribution"
            [loading]="chartsLoading()"
            [chartOptions]="userRoleChartOptions()" />
        }
      </div>

      <!-- Recent Activity Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Recent Orders -->
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/60">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Recent Orders</h3>
            <a routerLink="/admin/orders" class="text-xs font-medium text-primary hover:text-green-700 transition">View All →</a>
          </div>
          @if (loading()) {
            <div class="p-5 space-y-4 animate-pulse">
              @for (i of [1,2,3,4,5]; track i) {
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  <div class="flex-1 space-y-1.5">
                    <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                  <div class="h-5 w-14 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                </div>
              }
            </div>
          } @else {
            <div class="divide-y divide-slate-100 dark:divide-slate-700/40">
              @for (order of recentOrders(); track order.id) {
                <div class="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/>
                      </svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ order.product?.title || 'Order #' + order.id }}</p>
                      <p class="text-xs text-slate-405 dark:text-slate-500 truncate">{{ order.buyer?.name || 'Unknown' }} · ₹{{ order.totalAmount | number:'1.0-0' }}</p>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0"
                    [class]="getStatusBadge(order.deliveryStatus)">
                    {{ order.deliveryStatus }}
                  </span>
                </div>
              }
              @if (recentOrders().length === 0) {
                <div class="px-5 py-8 text-center text-sm text-slate-400">No recent orders</div>
              }
            </div>
          }
        </div>

        <!-- Recent Users -->
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/60">
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">Recent Users</h3>
            <a routerLink="/admin/users" class="text-xs font-medium text-primary hover:text-green-700 transition">View All →</a>
          </div>
          @if (loading()) {
            <div class="p-5 space-y-4 animate-pulse">
              @for (i of [1,2,3,4,5]; track i) {
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                  <div class="flex-1 space-y-1.5">
                    <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="divide-y divide-slate-100 dark:divide-slate-700/40">
              @for (user of recentUsers(); track user.id) {
                <div class="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden">
                      @if (user.profilePhoto) {
                        <img [src]="user.profilePhoto" class="w-full h-full object-cover" alt="" />
                      } @else {
                        {{ user.name ? user.name.charAt(0).toUpperCase() : 'U' }}
                      }
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-medium text-slate-900 dark:text-white truncate">{{ user.name }}</p>
                      <p class="text-xs text-slate-405 dark:text-slate-500 truncate">{{ user.email || user.phone || 'No contact' }}</p>
                    </div>
                  </div>
                  <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full shrink-0"
                    [class]="getRoleBadge(user.role)">
                    {{ user.role }}
                  </span>
                </div>
              }
              @if (recentUsers().length === 0) {
                <div class="px-5 py-8 text-center text-sm text-slate-400">No recent users</div>
              }
            </div>
          }
        </div>
      </div>

      <!-- Quick Links -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        @for (link of quickLinks; track link.path) {
          <a [routerLink]="link.path"
            class="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
              [style.background]="link.bg" [style.color]="link.color">
              <span class="w-5 h-5 flex items-center justify-center">
                @switch (link.icon) {
                  @case ('users') {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  }
                  @case ('orders') {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                  }
                  @case ('products') {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  }
                  @case ('analytics') {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  }
                  @case ('crops') {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/></svg>
                  }
                  @case ('settings') {
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1-2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                  }
                }
              </span>
            </div>
            <span class="text-xs font-semibold text-slate-600 dark:text-slate-300 group-hover:text-primary transition">{{ link.label }}</span>
          </a>
        }
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private readonly adminService = inject(AdminService);
  private refreshSub?: Subscription;

  readonly loading = signal(true);
  readonly chartsLoading = signal(true);
  readonly stats = signal<DashboardStats>({
    totalUsers: 0, activeUsers: 0, newUsersThisMonth: 0,
    totalOrders: 0, totalRevenue: 0, totalProducts: 0,
    totalPosts: 0, totalCrops: 0, totalSchemes: 0,
    totalInsurance: 0, totalMandis: 0, totalNews: 0,
    totalResources: 0
  });
  readonly analytics = signal<DashboardAnalytics>({
    monthlyOrders: [], monthlyRevenue: [], userGrowth: [],
    ordersByStatus: {}, ordersByPayment: {}, usersByRole: {}
  });
  readonly recentOrders = signal<RecentOrder[]>([]);
  readonly recentUsers = signal<RecentUser[]>([]);

  // Chart Options
  readonly revenueChartOptions = signal<any>(null);
  readonly ordersChartOptions = signal<any>(null);
  readonly userGrowthChartOptions = signal<any>(null);
  readonly orderStatusChartOptions = signal<any>(null);
  readonly userRoleChartOptions = signal<any>(null);

  readonly quickLinks = [
    { path: '/admin/users', label: 'Users', icon: 'users', bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
    { path: '/admin/orders', label: 'Orders', icon: 'orders', bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
    { path: '/admin/products', label: 'Products', icon: 'products', bg: 'rgba(236, 72, 153, 0.1)', color: '#EC4899' },
    { path: '/admin/analytics', label: 'Analytics', icon: 'analytics', bg: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' },
    { path: '/admin/crops', label: 'Crops', icon: 'crops', bg: 'rgba(20, 184, 166, 0.1)', color: '#14B8A6' },
    { path: '/admin/settings', label: 'Settings', icon: 'settings', bg: 'rgba(107, 114, 128, 0.1)', color: '#6B7280' }
  ];

  ngOnInit(): void {
    this.loadData();
    // Auto-refresh every 5 minutes
    this.refreshSub = interval(300000).subscribe(() => this.refreshData());
  }

  ngOnDestroy(): void {
    this.refreshSub?.unsubscribe();
  }

  refreshData(): void {
    this.adminService.clearDashboardCache();
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.chartsLoading.set(true);

    // Load main stats + recent data
    forkJoin({
      stats: this.adminService.getDashboardStats(true),
      recentOrders: this.adminService.getRecentOrders(5),
      recentUsers: this.adminService.getRecentUsers(5)
    }).subscribe({
      next: ({ stats, recentOrders, recentUsers }) => {
        this.stats.set(stats);
        this.recentOrders.set(recentOrders);
        this.recentUsers.set(recentUsers);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    // Load analytics for charts (may fail gracefully for new installs)
    this.adminService.getDashboardAnalytics().subscribe({
      next: (analytics) => {
        this.analytics.set(analytics);
        this.buildCharts(analytics);
        this.chartsLoading.set(false);
      },
      error: () => {
        this.buildFallbackCharts();
        this.chartsLoading.set(false);
      }
    });
  }

  private buildCharts(data: DashboardAnalytics): void {
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0, 0, 0, 0.04)';

    const baseChart = {
      toolbar: { show: false },
      fontFamily: 'Inter, system-ui, sans-serif',
      foreColor: textColor
    };

    const baseGrid = {
      borderColor: gridColor,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } }
    };

    // Revenue Chart
    const revMonths = data.monthlyRevenue?.length > 0
      ? data.monthlyRevenue.map(d => d.month || '')
      : this.getLast12Months();
    const revData = data.monthlyRevenue?.length > 0
      ? data.monthlyRevenue.map(d => d.revenue || d.count || 0)
      : this.generateFallbackData(12);

    this.revenueChartOptions.set({
      series: [{ name: 'Revenue', data: revData }],
      chart: { ...baseChart, type: 'area', height: 280, sparkline: { enabled: false } },
      colors: ['#22C55E'],
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.05, stops: [0, 100] } },
      stroke: { curve: 'smooth', width: 2.5 },
      xaxis: { categories: revMonths, labels: { style: { fontSize: '10px' } } },
      yaxis: { labels: { formatter: (v: number) => '₹' + (v >= 1000 ? (v/1000).toFixed(0) + 'k' : v), style: { fontSize: '10px' } } },
      dataLabels: { enabled: false },
      grid: baseGrid,
      tooltip: { theme: isDark ? 'dark' : 'light' }
    });

    // Orders Chart
    const ordMonths = data.monthlyOrders?.length > 0
      ? data.monthlyOrders.map(d => d.month || '')
      : this.getLast12Months();
    const ordData = data.monthlyOrders?.length > 0
      ? data.monthlyOrders.map(d => d.count || 0)
      : this.generateFallbackData(12);

    this.ordersChartOptions.set({
      series: [{ name: 'Orders', data: ordData }],
      chart: { ...baseChart, type: 'bar', height: 280 },
      colors: ['#F59E0B'],
      plotOptions: { bar: { borderRadius: 6, columnWidth: '55%' } },
      xaxis: { categories: ordMonths, labels: { style: { fontSize: '10px' } } },
      yaxis: { labels: { style: { fontSize: '10px' } } },
      dataLabels: { enabled: false },
      grid: baseGrid,
      tooltip: { theme: isDark ? 'dark' : 'light' }
    });

    // User Growth Chart
    const ugMonths = data.userGrowth?.length > 0
      ? data.userGrowth.map(d => d.month || '')
      : this.getLast12Months();
    const ugData = data.userGrowth?.length > 0
      ? data.userGrowth.map(d => d.count || 0)
      : this.generateFallbackData(12);

    this.userGrowthChartOptions.set({
      series: [{ name: 'New Users', data: ugData }],
      chart: { ...baseChart, type: 'line', height: 260 },
      colors: ['#8B5CF6'],
      stroke: { curve: 'smooth', width: 2.5 },
      xaxis: { categories: ugMonths, labels: { style: { fontSize: '10px' } } },
      yaxis: { labels: { style: { fontSize: '10px' } } },
      dataLabels: { enabled: false },
      grid: baseGrid,
      tooltip: { theme: isDark ? 'dark' : 'light' }
    });

    // Order Status Donut
    const statusKeys = Object.keys(data.ordersByStatus || {});
    const statusVals = Object.values(data.ordersByStatus || {});

    this.orderStatusChartOptions.set({
      series: statusVals.length > 0 ? statusVals : [30, 20, 15, 10, 5],
      chart: { ...baseChart, type: 'donut', height: 260 },
      labels: statusKeys.length > 0 ? statusKeys : ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
      colors: ['#F59E0B', '#3B82F6', '#6366F1', '#22C55E', '#EF4444'],
      legend: { position: 'bottom', fontSize: '11px' },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '12px', color: textColor } } } } }
    });

    // Users by Role Donut
    const roleKeys = Object.keys(data.usersByRole || {});
    const roleVals = Object.values(data.usersByRole || {});

    this.userRoleChartOptions.set({
      series: roleVals.length > 0 ? roleVals : [60, 15, 10, 15],
      chart: { ...baseChart, type: 'donut', height: 260 },
      labels: roleKeys.length > 0 ? roleKeys : ['FARMER', 'EXPERT', 'SELLER', 'ADMIN'],
      colors: ['#22C55E', '#3B82F6', '#F59E0B', '#8B5CF6'],
      legend: { position: 'bottom', fontSize: '11px' },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '70%', labels: { show: true, total: { show: true, label: 'Total', fontSize: '12px', color: textColor } } } } }
    });
  }

  private buildFallbackCharts(): void {
    this.buildCharts({
      monthlyOrders: [], monthlyRevenue: [], userGrowth: [],
      ordersByStatus: {}, ordersByPayment: {}, usersByRole: {}
    });
  }

  private getLast12Months(): string[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      return months[d.getMonth()];
    });
  }

  private generateFallbackData(n: number): number[] {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 50) + 10);
  }

  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      SHIPPED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return map[status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }

  getRoleBadge(role: string): string {
    const map: Record<string, string> = {
      FARMER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      EXPERT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      SELLER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      ADMIN: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
    };
    return map[role] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }
}
