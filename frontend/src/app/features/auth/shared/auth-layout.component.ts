import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'fs-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      <!-- Left Panel: Graphic & Content (Desktop only, 5 columns) -->
      <aside class="hidden lg:flex lg:w-[42%] bg-gradient-to-br from-green-800 via-emerald-900 to-green-950 text-white flex-col justify-between p-12 relative overflow-hidden shrink-0 border-r border-green-800">
        <!-- Interactive background grid lines -->
        <div class="absolute inset-0 bg-[radial-gradient(#ffffff_0.6px,transparent_0.6px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <!-- Header: Logo & Title -->
        <div class="relative z-10 flex items-center gap-3">
          <a routerLink="/" class="flex items-center gap-2.5 group">
            <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-white/20 p-2 group-hover:scale-105 transition duration-300">
              <img src="assets/favicon.png" alt="FarmSetu Logo" class="w-full h-full object-contain">
            </div>
            <span class="text-xl font-extrabold tracking-tight text-white">FarmSetu</span>
          </a>
        </div>

        <!-- Middle: Dynamic Showcase Carousel -->
        <div class="relative z-10 my-auto space-y-12">
          <div class="space-y-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-green-300 text-xs font-bold uppercase tracking-wider">
              <span class="material-icons text-sm">agriculture</span> Kheti Ki Nayi Duniya
            </span>
            <h2 class="text-3xl sm:text-4xl font-extrabold leading-tight text-white">
              Bridging traditional farming with modern technology.
            </h2>
          </div>

          <!-- Slide Carousel -->
          <div class="relative min-h-[140px] bg-white/5 dark:bg-black/10 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
            @for (slide of slides; track slide.title; let idx = $index) {
              <div class="transition-all duration-500 space-y-3"
                   [class.absolute]="idx !== activeSlide()"
                   [class.opacity-0]="idx !== activeSlide()"
                   [class.translate-y-4]="idx !== activeSlide()"
                   [class.relative]="idx === activeSlide()"
                   [class.opacity-100]="idx === activeSlide()"
                   [class.translate-y-0]="idx === activeSlide()">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-green-500/20 text-green-300 flex items-center justify-center shadow-sm">
                    <span class="material-icons text-xl">{{ slide.icon }}</span>
                  </div>
                  <h3 class="text-lg font-bold text-white">{{ slide.title }}</h3>
                </div>
                <p class="text-sm text-green-100 leading-relaxed">{{ slide.desc }}</p>
              </div>
            }

            <!-- Slide Dots Indicator -->
            <div class="flex gap-1.5 mt-5">
              @for (slide of slides; track slide.title; let idx = $index) {
                <button (click)="activeSlide.set(idx)"
                        class="h-1.5 rounded-full transition-all duration-300"
                        [class]="idx === activeSlide() ? 'w-6 bg-green-400' : 'w-1.5 bg-white/20'"></button>
              }
            </div>
          </div>
        </div>

        <!-- Footer: Info & Dark Mode Button -->
        <div class="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
          <button (click)="theme.toggleDark()"
                  class="flex items-center gap-2 text-xs font-bold text-green-200 hover:text-white transition py-2 px-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10">
            <span class="material-icons text-base">{{ theme.darkMode() ? 'light_mode' : 'dark_mode' }}</span>
            <span>{{ theme.darkMode() ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>
          <span class="text-xs text-green-200/60 font-medium">© 2026 FarmSetu</span>
        </div>

      </aside>

      <!-- Right Panel: Form Slot (Occupies remaining width) -->
      <main class="flex-1 flex flex-col justify-between relative p-4 sm:px-12 sm:py-6 overflow-y-auto">
        <!-- Top row: Header elements -->
        <div class="flex items-center justify-between w-full max-w-md mx-auto mb-6 lg:mb-4 gap-4">
          <!-- Mobile logo display -->
          <div class="flex items-center gap-2 lg:hidden shrink-0">
            <div class="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center p-1.5">
              <img src="assets/favicon-white.png" alt="Logo" class="w-full h-full object-contain">
            </div>
            <span class="font-extrabold text-base text-gray-900 dark:text-white tracking-tight">FarmSetu</span>
          </div>

          <!-- Actions: Theme + Language switcher (packed together) -->
          <div class="flex items-center gap-2 ml-auto">
            <!-- Dark mode button (Mobile only) -->
            <button (click)="theme.toggleDark()"
                    class="lg:hidden w-8 h-8 rounded-lg bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center border border-gray-200/60 dark:border-gray-700 active:scale-95 transition shadow-sm">
              <span class="material-icons text-sm">{{ theme.darkMode() ? 'light_mode' : 'dark_mode' }}</span>
            </button>

            <!-- Language Switcher Dropdown (aligned right) -->
            <div class="flex items-center">
              <span class="material-icons text-sm text-gray-400 dark:text-gray-500 mr-1 hidden sm:inline">translate</span>
              <select [value]="i18n.lang()"
                      (change)="i18n.setLang($any($event.target).value)"
                      class="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 outline-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition focus:border-green-500 text-gray-700 dark:text-gray-300">
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Form Slot Container -->
        <div class="w-full max-w-md mx-auto my-auto py-2 sm:py-4">
          <!-- Always render a card, even on mobile, for contrast and shadow -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/85 rounded-2xl shadow-xl p-5 sm:px-8 sm:py-6 space-y-4 transition-all duration-300">
            <ng-content></ng-content>
          </div>
        </div>

        <!-- Bottom alignment/footer elements -->
        <div class="hidden lg:block w-full max-w-md mx-auto text-center mt-6 text-[10px] text-gray-400 dark:text-gray-500 font-medium">
          <div class="flex items-center justify-center gap-4">
            <a href="#" class="hover:text-gray-600 dark:hover:text-gray-350">Privacy Policy</a>
            <span class="text-gray-200 dark:text-gray-800">|</span>
            <a href="#" class="hover:text-gray-600 dark:hover:text-gray-350">Terms of Service</a>
            <span class="text-gray-200 dark:text-gray-800">|</span>
            <a href="#" class="hover:text-gray-600 dark:hover:text-gray-350">Contact Us</a>
          </div>
        </div>
      </main>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class AuthLayoutComponent implements OnInit {
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);

  activeSlide = signal(0);
  slides = [
    { title: 'Live Mandi Prices', desc: 'Get daily price listings, route transit calculations, and target price alerts.', icon: 'trending_up' },
    { title: 'Community Chaupal', desc: 'Interact with verified crop buyers, experts, and fellow farmers across the nation.', icon: 'groups' },
    { title: 'AI Plant Doctor', desc: 'Scan crop leaves to detect infections instantly and receive remedial measures.', icon: 'psychology' }
  ];

  private slideInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.slideInterval = setInterval(() => {
      this.activeSlide.update(idx => (idx + 1) % this.slides.length);
    }, 4500);
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }
}
