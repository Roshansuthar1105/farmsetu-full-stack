import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'fs-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header class="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
        <span class="text-2xl font-bold text-primary">{{ i18n.t('app.name') }}</span>
        <div class="flex gap-3">
          <a routerLink="/auth/login" class="px-4 py-2 text-primary font-medium">{{ i18n.t('auth.login') }}</a>
          <a routerLink="/auth/register" class="fs-btn-primary">{{ i18n.t('auth.register') }}</a>
        </div>
      </header>
      <section class="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
          {{ i18n.t('app.name') }}
        </h1>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {{ i18n.t('landing.tagline') }}
        </p>
        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <a routerLink="/auth/register" class="fs-btn-primary text-lg px-8 py-3">Get Started</a>
          <a routerLink="/auth/login" class="fs-btn-secondary text-lg px-8 py-3">Login</a>
        </div>
        <div class="mt-16 grid md:grid-cols-3 gap-6 text-left">
          @for (f of features; track f.title) {
            <div class="fs-card">
              <span class="material-icons text-primary text-3xl">{{ f.icon }}</span>
              <h3 class="font-semibold mt-3">{{ f.title }}</h3>
              <p class="text-sm text-gray-500 mt-2">{{ f.desc }}</p>
            </div>
          }
        </div>
      </section>
    </div>
  `
})
export class LandingComponent {
  readonly i18n = inject(I18nService);

  readonly features = [
    { icon: 'store', title: 'Marketplace', desc: 'Buy & sell seeds, tools, and equipment with live auctions.' },
    { icon: 'trending_up', title: 'Market Analysis', desc: 'Live mandi prices, trends, and sell-time alerts.' },
    { icon: 'biotech', title: 'AI Disease Detection', desc: 'Upload crop photos for instant diagnosis and treatment.' },
    { icon: 'cloud', title: 'Weather', desc: 'Forecasts and crop-specific alerts for your village.' },
    { icon: 'groups', title: 'Community', desc: 'Connect with farmers and verified experts across India.' },
    { icon: 'account_balance', title: 'Govt Schemes', desc: 'Eligibility checks and guides for central & state schemes.' }
  ];
}
