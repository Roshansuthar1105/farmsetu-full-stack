import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-dashboard',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent],
  template: `
    <!-- Top Greeting Hero Section -->
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-800 to-emerald-950 p-8 md:p-10 text-white shadow-lg mb-8">
      <!-- Decorative Orbs -->
      <div class="absolute -top-12 -right-12 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px]"></div>
      <div class="absolute -bottom-10 -left-10 w-48 h-48 bg-secondary-500/10 rounded-full blur-[60px]"></div>
      
      <!-- Tech Grid Pattern -->
      <div class="absolute inset-0 opacity-5 pointer-events-none"
           style="background-image: radial-gradient(circle, white 1px, transparent 1px); background-size: 20px 20px;">
      </div>

      <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span class="text-xs font-semibold bg-white/10 text-primary-200 border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Farmer Dashboard
          </span>
          <h1 class="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
            Welcome back, {{ auth.currentUser()?.name || 'Farmer Guest' }}! 🌾
          </h1>
          <p class="text-slate-350 text-sm mt-2 max-w-xl">
            Check local weather conditions, scan crops for active diseases, and view the latest mandi pricing lists.
          </p>
        </div>
        <div class="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-4 rounded-2xl backdrop-blur-sm shadow-inner shrink-0">
          <div class="w-10 h-10 rounded-xl bg-secondary-500/20 flex items-center justify-center text-secondary-400">
            <span class="material-icons">calendar_today</span>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Today's Date</p>
            <p class="text-sm font-bold text-white mt-0.5">June 4, 2026</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Section Heading -->
    <fs-page-header title="Ecosystem Services" subtitle="Access tools and insights to optimize production" />

    <!-- Grid Layout of Action Cards -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      @for (card of quickLinks; track card.path) {
        <a
          [routerLink]="card.path"
          class="fs-card relative overflow-hidden group hover:border-primary-500/40 hover:-translate-y-1 transform duration-300 flex flex-col justify-between"
        >
          <!-- Card Icon Header -->
          <div>
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300"
                 [class]="card.bgClass + ' ' + card.iconColor">
              <span class="material-icons text-2xl group-hover:scale-110 transition-transform duration-300">{{ card.icon }}</span>
            </div>
            <h3 class="font-bold text-slate-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
              {{ card.label }}
            </h3>
            <p class="text-xs text-slate-450 dark:text-slate-450 mt-1.5 leading-relaxed">
              {{ card.desc }}
            </p>
          </div>

          <!-- Bottom Arrow Indicator -->
          <div class="mt-6 flex justify-end items-center text-slate-400 dark:text-slate-500 group-hover:text-primary-500 transition-colors duration-200">
            <span class="text-[11px] font-semibold tracking-wider mr-1 opacity-0 group-hover:opacity-100 transition-all duration-300">Open Service</span>
            <span class="material-icons text-sm">arrow_forward</span>
          </div>
        </a>
      }
    </div>
  `
})
export class DashboardComponent {
  readonly auth = inject(AuthService);

  readonly quickLinks = [
    { 
      path: '/app/weather', 
      icon: 'cloud', 
      label: 'Weather Setu', 
      desc: '7-day localized agricultural forecasts & warnings.',
      bgClass: 'bg-sky-50 dark:bg-sky-950/20', 
      iconColor: 'text-sky-600 dark:text-sky-400' 
    },
    { 
      path: '/app/market-analysis', 
      icon: 'trending_up', 
      label: 'Mandi Rates', 
      desc: 'Real-time pricing analysis and sell-time suggestions.',
      bgClass: 'bg-green-50 dark:bg-green-950/20', 
      iconColor: 'text-green-600 dark:text-green-400' 
    },
    { 
      path: '/app/disease-detection', 
      icon: 'biotech', 
      label: 'Disease Scan', 
      desc: 'Instant computer vision scan and custom diagnosis.',
      bgClass: 'bg-rose-50 dark:bg-rose-950/20', 
      iconColor: 'text-rose-600 dark:text-rose-400' 
    },
    { 
      path: '/app/marketplace', 
      icon: 'store', 
      label: 'Krishi Bazaar', 
      desc: 'Seeds, farming equipment, and supplies with direct auctions.',
      bgClass: 'bg-amber-50 dark:bg-amber-950/20', 
      iconColor: 'text-amber-600 dark:text-amber-400' 
    },
    { 
      path: '/app/chat', 
      icon: 'chat', 
      label: 'Expert Support', 
      desc: 'Chat directly with certified agronomists and advisers.',
      bgClass: 'bg-indigo-50 dark:bg-indigo-950/20', 
      iconColor: 'text-indigo-600 dark:text-indigo-400' 
    },
    { 
      path: '/app/crop-calendar', 
      icon: 'calendar_month', 
      label: 'Crop Calendar', 
      desc: 'Custom task timelines for your sown crop types.',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/20', 
      iconColor: 'text-emerald-600 dark:text-emerald-400' 
    },
    { 
      path: '/app/govt-schemes', 
      icon: 'account_balance', 
      label: 'Govt Benefits', 
      desc: 'Automatic eligibility lookup for central subsidy programs.',
      bgClass: 'bg-cyan-50 dark:bg-cyan-950/20', 
      iconColor: 'text-cyan-600 dark:text-cyan-400' 
    },
    { 
      path: '/app/mandi-finder', 
      icon: 'map', 
      label: 'Mandi Finder', 
      desc: 'Locate and navigate to the closest official grain mandi.',
      bgClass: 'bg-purple-50 dark:bg-purple-950/20', 
      iconColor: 'text-purple-600 dark:text-purple-400' 
    }
  ];
}
