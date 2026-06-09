import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MandiBhaavService, LatestPriceRecord, Commodity, WatchlistItem, RoiComparisonResult, ForecastPoint, HistoryPoint } from '../../core/services/mandi-bhaav.service';
import { I18nService } from '../../core/services/i18n.service';
import { ThemeService } from '../../core/services/theme.service';
import { UserService } from '../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'fs-market-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, LoadingSkeletonComponent, NgApexchartsModule],
  templateUrl: './market-analysis.component.html',
  styleUrls: ['./market-analysis.component.scss']
})
export class MarketAnalysisComponent implements OnInit {
  private readonly mandiBhaavService = inject(MandiBhaavService);
  private readonly userService = inject(UserService);
  private readonly toastr = inject(ToastrService);
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);

  readonly loading = signal(true);
  readonly activeTab = signal<'Overview' | 'ROI Calculator' | 'Forecasts' | 'Data Table'>('Overview');
  
  // Coordinates
  readonly lat = signal<number | null>(null);
  readonly lng = signal<number | null>(null);

  // Data Signals
  readonly commodities = signal<Commodity[]>([]);
  readonly latestPrices = signal<LatestPriceRecord[]>([]);
  readonly watchlist = signal<WatchlistItem[]>([]);

  // Selection Signals
  readonly selectedCommodityId = signal<number | null>(null);
  readonly selectedMandiId = signal<number | null>(null);

  // Alert inputs
  readonly alertMandiId = signal<number | null>(null);
  readonly alertCommodityId = signal<number | null>(null);
  readonly alertThreshold = signal<number>(2500);

  // ROI Calculator
  readonly calculatorQuantity = signal<number>(50); // Quintals
  readonly calculatorCommodityId = signal<number | null>(null);
  readonly roiResults = signal<RoiComparisonResult[]>([]);
  readonly isCalculated = signal<boolean>(false);

  // Forecast charts data
  readonly historyPoints = signal<HistoryPoint[]>([]);
  readonly forecastPoints = signal<ForecastPoint[]>([]);

  // Forecast filters
  readonly chartView = signal<'both' | 'history' | 'forecast'>('both');
  readonly historyDays = signal<number>(30);

  // Unique commodities listed in current prices
  readonly availableCommodities = computed(() => {
    const list = this.latestPrices().map(p => p.commodity);
    const uniqueIds = Array.from(new Set(list.map(c => c.id)));
    return uniqueIds.map(id => list.find(c => c.id === id)!).sort((a, b) => a.name.localeCompare(b.name));
  });

  // Watchlist quick lookup set
  readonly watchlistLookup = computed(() => {
    const map = new Map<string, number>(); // Key: 'commodityId_mandiId' -> Watchlist Item ID
    this.watchlist().forEach(w => {
      if (w.commodity && w.mandi) {
        map.set(`${w.commodity.id}_${w.mandi.id}`, w.id);
      }
    });
    return map;
  });

  // Key stats
  readonly totalCommodities = computed(() => this.commodities().length);
  readonly totalMarkets = computed(() => {
    const list = this.latestPrices().map(p => p.mandi.id);
    return Array.from(new Set(list)).length;
  });
  readonly highestPriceRecord = computed(() => {
    if (this.latestPrices().length === 0) return null;
    return this.latestPrices().reduce((prev, current) => 
      (prev.modalPrice > current.modalPrice) ? prev : current
    );
  });

  ngOnInit(): void {
    // Attempt Geolocation first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.lat.set(pos.coords.latitude);
          this.lng.set(pos.coords.longitude);
          this.loadAllData();
        },
        () => {
          this.fallbackToProfileAndLoad();
        }
      );
    } else {
      this.fallbackToProfileAndLoad();
    }
  }

  private fallbackToProfileAndLoad(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        if (user.latitude && user.longitude) {
          this.lat.set(user.latitude);
          this.lng.set(user.longitude);
        }
        this.loadAllData();
      },
      error: () => {
        this.loadAllData(); // Load with default coordinates in service
      }
    });
  }

  private loadAllData(): void {
    this.loading.set(true);

    // Get commodities
    this.mandiBhaavService.getCommodities().subscribe({
      next: (comms) => {
        this.commodities.set(comms);
        if (comms.length > 0) {
          this.selectedCommodityId.set(comms[0].id);
          this.calculatorCommodityId.set(comms[0].id);
          this.alertCommodityId.set(comms[0].id);
          this.loadForecast(comms[0].id, this.historyDays());
        }
      }
    });

    // Get latest prices based on coords
    const latitude = this.lat();
    const longitude = this.lng();
    this.mandiBhaavService.getLatestPrices(latitude ?? undefined, longitude ?? undefined).subscribe({
      next: (prices) => {
        this.latestPrices.set(prices);
        if (prices.length > 0) {
          this.selectedMandiId.set(prices[0].mandi.id);
          this.alertMandiId.set(prices[0].mandi.id);
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    // Get Watchlist
    this.loadWatchlist();
  }

  loadWatchlist(): void {
    this.mandiBhaavService.getWatchlist().subscribe({
      next: (items) => this.watchlist.set(items)
    });
  }

  toggleWatchlist(commodityId: number, mandiId: number): void {
    const key = `${commodityId}_${mandiId}`;
    const watchlistId = this.watchlistLookup().get(key);

    if (watchlistId) {
      this.mandiBhaavService.removeFromWatchlist(watchlistId).subscribe({
        next: () => {
          this.toastr.success(this.i18n.t('mandiBhaav.unpinSuccess'));
          this.loadWatchlist();
        }
      });
    } else {
      this.mandiBhaavService.addToWatchlist(commodityId, mandiId).subscribe({
        next: () => {
          this.toastr.success(this.i18n.t('mandiBhaav.pinSuccess'));
          this.loadWatchlist();
        }
      });
    }
  }

  isPinned(commodityId: number, mandiId: number): boolean {
    return this.watchlistLookup().has(`${commodityId}_${mandiId}`);
  }

  calculateRoi(): void {
    const commId = this.calculatorCommodityId();
    const qty = this.calculatorQuantity();
    if (!commId || qty <= 0) return;

    this.mandiBhaavService.compareRoi(commId, qty, this.lat() ?? undefined, this.lng() ?? undefined).subscribe({
      next: (results) => {
        this.roiResults.set(results);
        this.isCalculated.set(true);
      }
    });
  }

  loadForecast(commodityId: number, days?: number): void {
    const d = days ?? this.historyDays();
    this.mandiBhaavService.getForecast(commodityId, d).subscribe({
      next: (res) => {
        this.historyPoints.set(res.history);
        this.forecastPoints.set(res.forecast);
      }
    });
  }

  onForecastCommodityChange(e: Event): void {
    const target = e.target as HTMLSelectElement;
    const id = Number(target.value);
    this.selectedCommodityId.set(id);
    this.loadForecast(id, this.historyDays());
  }

  onHistoryDaysChange(e: Event): void {
    const target = e.target as HTMLSelectElement;
    const days = Number(target.value);
    this.historyDays.set(days);
    const commId = this.selectedCommodityId();
    if (commId) {
      this.loadForecast(commId, days);
    }
  }

  onChartViewChange(e: Event): void {
    const target = e.target as HTMLSelectElement;
    this.chartView.set(target.value as 'both' | 'history' | 'forecast');
  }

  setTab(tab: 'Overview' | 'ROI Calculator' | 'Forecasts' | 'Data Table'): void {
    this.activeTab.set(tab);
  }

  setupPriceAlert(): void {
    const commId = this.alertCommodityId();
    const mandiId = this.alertMandiId();
    const threshold = this.alertThreshold();

    if (!commId || !mandiId || threshold <= 0) {
      this.toastr.warning('Please enter valid alert settings.');
      return;
    }
    
    // Simulate Alert Setup success
    this.toastr.success(this.i18n.t('mandiBhaav.alertSuccess'));
  }

  // ApexCharts definitions computed dynamically based on current selected commodity & theme
  readonly forecastChartOptions = computed(() => {
    const hist = this.historyPoints();
    const fore = this.forecastPoints();
    const isDark = this.theme.darkMode();
    const view = this.chartView();

    // Filter data based on chart view selection
    const showHistory = view === 'both' || view === 'history';
    const showForecast = view === 'both' || view === 'forecast';

    const histDates = showHistory ? hist.map(h => h.date) : [];
    const foreDates = showForecast ? fore.map(f => f.date) : [];
    const allLabels = [...histDates, ...foreDates];

    // Build series based on view
    const series: any[] = [];

    if (showHistory && showForecast) {
      // Combined view: history line then nulls; forecast nulls then line
      const histData: (number | null)[] = [...hist.map(h => h.price), ...fore.map(() => null)];
      const lastHistVal = hist.length > 0 ? hist[hist.length - 1].price : null;
      const foreData: (number | null)[] = [...hist.map(() => null)];
      if (foreData.length > 0 && lastHistVal !== null) {
        foreData[foreData.length - 1] = lastHistVal; // Connect lines
      }
      fore.forEach(f => foreData.push(f.price));

      series.push({ name: 'Historical Price', data: histData });
      series.push({ name: '15-Day Forecast', data: foreData });
    } else if (showHistory) {
      series.push({ name: 'Historical Price', data: hist.map(h => h.price) });
    } else if (showForecast) {
      series.push({ name: '15-Day Forecast', data: fore.map(f => f.price) });
    }

    const labelColor = isDark ? '#9ca3af' : '#6b7280';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const legendColor = isDark ? '#d1d5db' : '#374151';

    return {
      series,
      chart: {
        type: 'line' as 'line',
        height: 380,
        background: 'transparent',
        foreColor: labelColor,
        toolbar: { show: false }
      },
      theme: { mode: isDark ? 'dark' as 'dark' : 'light' as 'light' },
      colors: showHistory && showForecast ? ['#3b82f6', '#10b981'] : (showHistory ? ['#3b82f6'] : ['#10b981']),
      stroke: {
        curve: 'smooth' as 'smooth',
        width: 3,
        dashArray: showHistory && showForecast ? [0, 5] : [0]
      },
      tooltip: {
        theme: isDark ? 'dark' : 'light',
        style: { fontSize: '12px' }
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: allLabels,
        labels: {
          style: { colors: labelColor, fontSize: '10px' },
          rotate: -45,
          rotateAlways: false
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        title: { text: 'Price (₹/Quintal)', style: { color: labelColor } },
        labels: { style: { colors: labelColor } }
      },
      grid: { borderColor: gridColor, strokeDashArray: 4 },
      legend: {
        position: 'top' as 'top',
        horizontalAlign: 'center' as 'center',
        labels: { colors: legendColor }
      }
    };
  });
}
