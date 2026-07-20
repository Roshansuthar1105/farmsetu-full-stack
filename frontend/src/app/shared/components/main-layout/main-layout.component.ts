import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';
import {
  LucideLayoutDashboard,
  LucideGrid,
  LucideStore,
  LucideReceipt,
  LucideMessageSquare,
  LucideMessagesSquare,
  LucideUsers,
  LucideUser,
  LucideShieldAlert,
  LucideUserCheck,
  LucideGavel,
  LucideFileUp,
  LucideMail,
  LucideTruck,
  LucideDroplet,
  LucideTractor,
  LucideTrendingUp,
  LucideCloud,
  LucideNewspaper,
  LucideBookOpen,
  LucideLandmark,
  LucideShieldCheck,
  LucideSprout,
  LucideCalendar,
  LucideFlaskConical,
  LucideMap,
  LucideWrench,
  LucideCoins,
  LucideBell,
  LucideLogOut,
  LucideSun,
  LucideMoon,
  LucideMenu,
  LucideShoppingCart,
  LucideX,
  LucideHelpCircle,
  LucideSearch,
  LucideLanguages
} from '@lucide/angular';

interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'fs-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    LucideLayoutDashboard,
    LucideGrid,
    LucideStore,
    LucideReceipt,
    LucideMessageSquare,
    LucideMessagesSquare,
    LucideUsers,
    LucideUser,
    LucideShieldAlert,
    LucideUserCheck,
    LucideGavel,
    LucideFileUp,
    LucideMail,
    LucideTruck,
    LucideDroplet,
    LucideTractor,
    LucideTrendingUp,
    LucideCloud,
    LucideNewspaper,
    LucideBookOpen,
    LucideLandmark,
    LucideShieldCheck,
    LucideSprout,
    LucideCalendar,
    LucideFlaskConical,
    LucideMap,
    LucideWrench,
    LucideCoins,
    LucideBell,
    LucideLogOut,
    LucideSun,
    LucideMoon,
    LucideMenu,
    LucideShoppingCart,
    LucideX,
    LucideHelpCircle,
    LucideSearch,
    LucideLanguages
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  readonly currentUrl = signal<string>('');
  readonly searchQuery = signal<string>('');
  readonly showLangDropdown = signal(false);

  readonly availableLanguages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
    { code: 'te', label: 'తెలుగు (Telugu)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', label: 'മലയാളം (Malayalam)' },
    { code: 'bn', label: 'বাংলা (Bengali)' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'as', label: 'অসমীয়া (Assamese)' }
  ];

  constructor() {
    this.currentUrl.set(this.router.url);
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl.set(event.urlAfterRedirects || event.url);
    });
  }

  readonly requiresLogin = computed(() => {
    if (this.auth.isAuthenticated()) {
      return false;
    }
    const url = this.currentUrl();
    if (!url || url.includes('/app/dashboard')) {
      return false;
    }
    return url.startsWith('/app');
  });

  getRequestedFeatureName(): string {
    const url = this.currentUrl();
    const allItems = [...this.primaryNavItems, ...this.secondaryNavItems, ...this.adminNavItems];
    const item = allItems.find(nav => url.startsWith(nav.path));
    if (item) {
      return this.t(item.labelKey);
    }
    return 'this page';
  }

  readonly showMobileDrawer = signal(false);
  readonly showSidebar = signal(true);

  toggleSidebar(): void {
    if (window.innerWidth >= 1024) {
      this.showSidebar.update(v => !v);
    } else {
      this.showMobileDrawer.set(true);
    }
  }

  readonly primaryNavItems: NavItem[] = [
    { path: '/app/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard' },
    { path: '/app/marketplace', labelKey: 'nav.marketplace', icon: 'store' },
    { path: '/app/orders', labelKey: 'nav.orders', icon: 'receipt_long' },
    { path: '/app/farm-chat', labelKey: 'nav.farmChat', icon: 'forum' },
    { path: '/app/community', labelKey: 'nav.community', icon: 'groups' },
    { path: '/app/profile', labelKey: 'nav.profile', icon: 'person' }
  ];

  readonly adminNavItems: NavItem[] = [
    { path: '/admin', labelKey: 'nav.adminDashboard', icon: 'admin_panel_settings' },
    { path: '/admin/users', labelKey: 'nav.adminUsers', icon: 'manage_accounts' },
    { path: '/admin/farms', labelKey: 'nav.adminFarms', icon: 'map' },
    { path: '/admin/products', labelKey: 'nav.adminProducts', icon: 'package' },
    { path: '/admin/crops', labelKey: 'nav.adminCrops', icon: 'gavel' },
    { path: '/admin/mandis', labelKey: 'nav.adminMandis', icon: 'storefront' },
    { path: '/admin/market-prices', labelKey: 'nav.adminMarketPrices', icon: 'upload_file' },
    { path: '/admin/email', labelKey: 'nav.adminEmail', icon: 'forward_to_inbox' },
    { path: '/admin/orders', labelKey: 'nav.adminOrders', icon: 'local_shipping' },
    { path: '/admin/water-queue', labelKey: 'nav.adminWaterQueue', icon: 'water_drop' },
    { path: '/admin/schemes', labelKey: 'nav.adminSchemes', icon: 'account_balance' },
    { path: '/admin/insurance', labelKey: 'nav.adminInsurance', icon: 'health_and_safety' },
    { path: '/admin/news', labelKey: 'nav.adminNews', icon: 'article' },
    { path: '/admin/resources', labelKey: 'nav.adminResources', icon: 'school' },
    { path: '/admin/analytics', labelKey: 'nav.adminAnalytics', icon: 'trending_up' },
    { path: '/admin/notifications', labelKey: 'nav.adminNotifications', icon: 'notifications' },
    { path: '/admin/settings', labelKey: 'nav.adminSettings', icon: 'engineering' }
  ];

  readonly secondaryNavItems: NavItem[] = [
    { path: '/app/farm-dashboard', labelKey: 'nav.farmDashboard', icon: 'agriculture' },
    { path: '/app/market-analysis', labelKey: 'nav.market', icon: 'trending_up' },
    { path: '/app/weather', labelKey: 'nav.weather', icon: 'cloud' },
    { path: '/app/news', labelKey: 'nav.news', icon: 'article' },
    { path: '/app/resources', labelKey: 'nav.resources', icon: 'school' },
    { path: '/app/govt-schemes', labelKey: 'nav.schemes', icon: 'account_balance' },
    { path: '/app/insurance', labelKey: 'nav.insurance', icon: 'health_and_safety' },
    { path: '/app/crop-recommendation', labelKey: 'nav.cropRec', icon: 'eco' },
    { path: '/app/crop-calendar', labelKey: 'nav.calendar', icon: 'calendar_month' },
    { path: '/app/disease-detection', labelKey: 'nav.disease', icon: 'biotech' },
    { path: '/app/mandi-finder', labelKey: 'nav.mandi', icon: 'map' },
    { path: '/app/water-queue', labelKey: 'nav.waterQueue', icon: 'water_drop' },
    { path: '/app/labor-booking', labelKey: 'nav.laborBooking', icon: 'engineering' },
    { path: '/app/machinery', labelKey: 'nav.machinery', icon: 'agriculture' },
    { path: '/app/financial', labelKey: 'nav.finance', icon: 'payments' },
    { path: '/app/notifications', labelKey: 'nav.notifications', icon: 'notifications' },
    { path: '/app/help', labelKey: 'nav.help', icon: 'help_circle' }
  ];

  t(key: string): string {
    return this.i18n.t(key);
  }

  readonly filteredPrimaryNavItems = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.primaryNavItems;
    return this.primaryNavItems.filter(item => 
      this.t(item.labelKey).toLowerCase().includes(q) || 
      item.labelKey.toLowerCase().includes(q)
    );
  });

  readonly filteredSecondaryNavItems = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.secondaryNavItems;
    return this.secondaryNavItems.filter(item => 
      this.t(item.labelKey).toLowerCase().includes(q) || 
      item.labelKey.toLowerCase().includes(q)
    );
  });

  readonly filteredAdminNavItems = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.adminNavItems;
    return this.adminNavItems.filter(item => 
      this.t(item.labelKey).toLowerCase().includes(q) || 
      item.labelKey.toLowerCase().includes(q)
    );
  });

  logout(): void {
    this.auth.logout();
  }

  toggleLangDropdown(): void {
    this.showLangDropdown.update(v => !v);
  }

  setLanguage(lang: string): void {
    this.i18n.setLang(lang as any);
    this.showLangDropdown.set(false);
  }
}
