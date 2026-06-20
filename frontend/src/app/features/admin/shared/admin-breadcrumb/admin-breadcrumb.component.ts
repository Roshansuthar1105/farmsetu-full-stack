import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'fs-admin-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="flex items-center gap-1.5 text-xs" aria-label="Breadcrumb">
      <a routerLink="/admin"
        class="text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition flex items-center gap-1">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
        </svg>
        <span>Admin</span>
      </a>
      @for (crumb of breadcrumbs(); track crumb.url; let last = $last) {
        <svg class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
        </svg>
        @if (last) {
          <span class="font-medium text-slate-700 dark:text-slate-200">{{ crumb.label }}</span>
        } @else {
          <a [routerLink]="crumb.url"
            class="text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition">
            {{ crumb.label }}
          </a>
        }
      }
    </nav>
  `
})
export class AdminBreadcrumbComponent {
  private readonly router = inject(Router);

  private readonly routeLabelMap: Record<string, string> = {
    'admin': 'Dashboard',
    'users': 'Users',
    'products': 'Products',
    'orders': 'Orders',
    'crops': 'Crops',
    'mandis': 'Mandis',
    'market-prices': 'Market Prices',
    'email': 'Email',
    'water-queue': 'Water Queue',
    'schemes': 'Schemes',
    'insurance': 'Insurance',
    'news': 'News',
    'resources': 'Resources',
    'analytics': 'Analytics',
    'notifications': 'Notifications',
    'settings': 'Settings'
  };

  readonly breadcrumbs = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const url = this.router.url;
        const segments = url.split('/').filter(s => s && s !== 'admin');
        let currentPath = '/admin';
        return segments.map(segment => {
          currentPath += `/${segment}`;
          return {
            label: this.routeLabelMap[segment] || this.titleCase(segment),
            url: currentPath
          };
        });
      })
    ),
    { initialValue: [] }
  );

  private titleCase(str: string): string {
    return str.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}
