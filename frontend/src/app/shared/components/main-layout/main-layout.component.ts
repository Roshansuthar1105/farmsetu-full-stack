import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';

interface NavItem {
  path: string;
  labelKey: string;
  icon: string;
}

@Component({
  selector: 'fs-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);

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
    { path: '/app/chat', labelKey: 'nav.chat', icon: 'chat' },
    { path: '/app/farm-chat', labelKey: 'nav.farmChat', icon: 'forum' },
    { path: '/app/community', labelKey: 'nav.community', icon: 'groups' },
    { path: '/app/profile', labelKey: 'nav.profile', icon: 'person' }
  ];

  readonly adminNavItems: NavItem[] = [
    { path: '/admin', labelKey: 'nav.adminDashboard', icon: 'admin_panel_settings' },
    { path: '/admin/users', labelKey: 'nav.adminUsers', icon: 'manage_accounts' },
    { path: '/admin/crops', labelKey: 'nav.adminCrops', icon: 'gavel' },
    { path: '/admin/mandis', labelKey: 'nav.adminMandis', icon: 'storefront' },
    { path: '/admin/market-prices', labelKey: 'nav.adminMarketPrices', icon: 'upload_file' },
    { path: '/admin/email', labelKey: 'nav.adminEmail', icon: 'forward_to_inbox' },
    { path: '/admin/orders', labelKey: 'nav.adminOrders', icon: 'local_shipping' },
    { path: '/admin/water-queue', labelKey: 'nav.adminWaterQueue', icon: 'water_drop' }
  ];

  readonly secondaryNavItems: NavItem[] = [
    { path: '/app/farm-dashboard', labelKey: 'nav.dashboard', icon: 'agriculture' },
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
    { path: '/app/financial', labelKey: 'nav.finance', icon: 'payments' },
    { path: '/app/notifications', labelKey: 'nav.notifications', icon: 'notifications' }
  ];

  t(key: string): string {
    return this.i18n.t(key);
  }

  logout(): void {
    this.auth.logout();
  }
}
