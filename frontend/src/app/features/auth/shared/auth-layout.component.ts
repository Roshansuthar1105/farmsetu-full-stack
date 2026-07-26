import { Component, ElementRef, HostListener, Input, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideLanguages } from '@lucide/angular';
import { I18nService } from '../../../core/services/i18n.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'fs-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideLanguages],
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

            <!-- Language Switcher Button + Custom Dropdown -->
            <div class="relative">
              <button type="button" (click)="toggleLangDropdown($event)" title="Switch Language"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 flex items-center justify-center transition active:scale-95 focus:outline-none"
                [class.text-green-600]="showLangDropdown()" [class.dark:text-green-400]="showLangDropdown()">
                <svg lucideLanguages size="18" class="stroke-[2]"></svg>
              </button>

              @if (showLangDropdown()) {
              <div (click)="$event.stopPropagation()"
                class="lang-dropdown absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto scrollbar-thin">
                <div class="p-2">
                  <p class="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-2 font-display">
                    Select Language
                  </p>
                  @for (lang of availableLanguages; track lang.code) {
                  <button (click)="setLanguage(lang.code)"
                    class="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors flex items-center justify-between group"
                    [ngClass]="i18n.lang() === lang.code ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-semibold' : 'text-gray-700 dark:text-gray-300'">
                    <span>{{ lang.label }}</span>
                    @if (i18n.lang() === lang.code) {
                    <div class="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    }
                  </button>
                  }
                </div>
              </div>
              }
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
            <a routerLink="/privacy-policy" class="hover:text-gray-600 dark:hover:text-gray-350">Privacy Policy</a>
            <span class="text-gray-200 dark:text-gray-800">|</span>
            <a routerLink="/terms-of-service" class="hover:text-gray-600 dark:hover:text-gray-350">Terms of Service</a>
            <span class="text-gray-200 dark:text-gray-800">|</span>
            <a routerLink="/contact" class="hover:text-gray-600 dark:hover:text-gray-350">Contact Us</a>
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
export class AuthLayoutComponent implements OnInit, OnDestroy {
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);
  private readonly elementRef = inject(ElementRef);

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.showLangDropdown() && !this.elementRef.nativeElement.contains(event.target)) {
      this.showLangDropdown.set(false);
    }
  }

  toggleLangDropdown(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.showLangDropdown.update(v => !v);
  }

  setLanguage(lang: string): void {
    this.i18n.setLang(lang as any);
    this.showLangDropdown.set(false);
  }

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
