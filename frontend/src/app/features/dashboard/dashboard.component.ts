import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  template: `
    <fs-page-header title="Welcome" [subtitle]="'Hello, ' + (auth.currentUser()?.name ?? 'Farmer')" />
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      @for (card of quickLinks; track card.path) {
        <a [routerLink]="card.path" class="fs-card hover:border-primary transition">
          <span class="material-icons text-primary text-3xl">{{ card.icon }}</span>
          <h3 class="font-semibold mt-2">{{ card.label }}</h3>
          <p class="text-xs text-gray-500 mt-1">{{ card.desc }}</p>
        </a>
      }
    </div>
  `
})
export class DashboardComponent {
  readonly auth = inject(AuthService);

  readonly quickLinks = [
    { path: '/app/weather', icon: 'cloud', label: 'Weather', desc: '7-day forecast' },
    { path: '/app/market-analysis', icon: 'trending_up', label: 'Mandi Prices', desc: 'Live rates' },
    { path: '/app/disease-detection', icon: 'biotech', label: 'Disease Scan', desc: 'AI detection' },
    { path: '/app/marketplace', icon: 'store', label: 'Marketplace', desc: 'Buy & sell' },
    { path: '/app/chat', icon: 'chat', label: 'Expert Chat', desc: 'Ask experts' },
    { path: '/app/crop-calendar', icon: 'calendar_month', label: 'Crop Calendar', desc: 'Plan tasks' },
    { path: '/app/govt-schemes', icon: 'account_balance', label: 'Schemes', desc: 'Govt benefits' },
    { path: '/app/mandi-finder', icon: 'map', label: 'Mandi Finder', desc: 'Nearest mandi' }
  ];
}
