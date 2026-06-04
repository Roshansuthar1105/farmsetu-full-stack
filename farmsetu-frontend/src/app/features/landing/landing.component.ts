import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'fs-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen relative flex flex-col justify-between overflow-x-hidden font-sans bg-slate-900 text-white">
      
      <!-- Immersive Backdrop Overlay -->
      <div class="absolute inset-0 bg-cover bg-center -z-20 transition-transform duration-[10000ms] hover:scale-105"
           style="background-image: url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1932&q=80'); filter: brightness(0.35);">
      </div>
      <!-- Subtle Ambient Colors -->
      <div class="absolute inset-0 bg-gradient-to-b from-primary-950/70 via-slate-900/60 to-slate-950/90 -z-10"></div>
      <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[130px] -z-10 animate-pulse-slow"></div>
      <div class="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-[130px] -z-10 animate-pulse-slow" style="animation-delay: 2s"></div>

      <!-- Top Header / Bar -->
      <header class="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div class="flex items-center gap-2">
          <div class="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center p-1.5 border border-white/20">
            <img src="assets/logo.svg" alt="Logo" class="w-full h-full object-contain" />
          </div>
          <span class="text-xl font-bold bg-gradient-to-r from-primary-400 to-emerald-350 bg-clip-text text-transparent">
            {{ i18n.t('app.name') }}
          </span>
        </div>
        <div class="flex gap-4">
          <a routerLink="/auth/login" class="px-4 py-2 text-slate-200 hover:text-white font-medium transition-colors text-sm flex items-center">
            {{ i18n.t('auth.login') }}
          </a>
          <a routerLink="/auth/register" class="fs-btn-glass text-sm font-semibold !px-5 !py-2.5">
            {{ i18n.t('auth.register') }}
          </a>
        </div>
      </header>

      <!-- Hero Main Area -->
      <section class="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col justify-center items-center text-center z-10 relative">
        
        <!-- Glowing Plant Emblem -->
        <div class="mb-6 animate-float">
          <div class="w-16 h-16 rounded-full bg-primary-500/20 backdrop-blur-md flex items-center justify-center border border-primary-500/30 shadow-lg shadow-primary-500/10">
            <span class="material-icons text-primary-400 text-3xl">eco</span>
          </div>
        </div>

        <!-- Main Headline -->
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-4xl">
          <span class="block">{{ i18n.t('heroTitle') }}</span>
          <span class="block mt-2 text-gradient-gold drop-shadow-sm min-h-[45px] md:min-h-[70px]">
            {{ typewriterText() }}<span class="animate-ping font-light">|</span>
          </span>
        </h1>

        <!-- Hero Sub-description -->
        <p class="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
          {{ i18n.t('heroDescription') }}
        </p>

        <!-- CTA Action Buttons Panel -->
        <div class="flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-2xl justify-center mb-16">
          <a routerLink="/auth/register" class="fs-btn-primary text-base px-8 py-3.5 shadow-xl hover:scale-105 transform duration-300">
            <span class="material-icons">rocket_launch</span>
            Get Started Free
          </a>
          <a routerLink="/auth/login" class="fs-btn-glass text-base px-8 py-3.5 hover:scale-105 transform duration-300">
            <span class="material-icons">login</span>
            Access Platform
          </a>
        </div>

        <!-- Features Showcase Grid -->
        <div class="w-full grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left mt-8">
          @for (f of features; track f.title) {
            <div class="glass-card p-6 border-white/10 hover:border-primary-500/30 hover:-translate-y-1 transform duration-300 group">
              <div class="w-12 h-12 rounded-xl bg-primary-500/10 dark:bg-primary-950/30 flex items-center justify-center text-primary-400 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300 shadow-inner mb-4">
                <span class="material-icons text-2xl">{{ f.icon }}</span>
              </div>
              <h3 class="font-bold text-lg text-white group-hover:text-primary-350 transition-colors">{{ f.title }}</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">{{ f.desc }}</p>
            </div>
          }
        </div>

        <!-- QR Code - Scan to Visit Widget (Positioned bottom left on desktop, inline below on mobile) -->
        <div class="mt-16 md:absolute md:bottom-2 md:left-6 z-25 bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/10 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 max-w-xs">
          <img src="assets/qr.jpeg" alt="QR Code" class="w-16 h-16 rounded-lg border border-white/20" />
          <div class="text-left min-w-0">
            <p class="text-[10px] font-semibold text-primary-400 uppercase tracking-widest">Mobile App</p>
            <h4 class="text-xs font-bold text-white truncate">Scan to Visit 👩‍🌾</h4>
            <p class="text-[9px] text-slate-400 mt-0.5">Quick access via smartphone camera</p>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="w-full max-w-7xl mx-auto px-6 py-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4 z-10 text-xs text-slate-400">
        <p>&copy; 2026 FarmSetu Platform. Empowering Indian Farmers with Digital Agricultural Intelligence.</p>
        <div class="flex gap-6">
          <a class="hover:text-primary-400 cursor-pointer">About</a>
          <a class="hover:text-primary-400 cursor-pointer">Help Center</a>
          <a class="hover:text-primary-400 cursor-pointer">Privacy</a>
        </div>
      </footer>
    </div>
  `
})
export class LandingComponent implements OnInit, OnDestroy {
  readonly i18n = inject(I18nService);

  readonly typewriterText = signal('');
  private wordIndex = 0;
  private charIndex = 0;
  private isDeleting = false;
  private speed = 100;
  private timeoutId?: any;
  private isAlive = true;

  readonly features = [
    { icon: 'store', title: 'Marketplace', desc: 'Buy & sell seeds, tools, and equipment with live auctions.' },
    { icon: 'trending_up', title: 'Market Analysis', desc: 'Live mandi prices, trends, and sell-time alerts.' },
    { icon: 'biotech', title: 'AI Disease Detection', desc: 'Upload crop photos for instant diagnosis and treatment.' },
    { icon: 'cloud', title: 'Weather', desc: 'Forecasts and crop-specific alerts for your village.' },
    { icon: 'groups', title: 'Community', desc: 'Connect with farmers and verified experts across India.' },
    { icon: 'account_balance', title: 'Govt Schemes', desc: 'Eligibility checks and guides for central & state schemes.' }
  ];

  ngOnInit(): void {
    this.typewriterCycle();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  private typewriterCycle(): void {
    if (!this.isAlive) return;

    const words = [
      'Real-Time Market Insights',
      'Accurate Price Trends',
      'Up-to-Date Information'
    ];
    const currentWord = words[this.wordIndex];

    if (this.isDeleting) {
      this.typewriterText.set(currentWord.substring(0, this.charIndex - 1));
      this.charIndex--;
      this.speed = 45; // faster deletion
    } else {
      this.typewriterText.set(currentWord.substring(0, this.charIndex + 1));
      this.charIndex++;
      this.speed = 100; // standard typing
    }

    if (!this.isDeleting && this.charIndex === currentWord.length) {
      this.isDeleting = true;
      this.speed = 2000; // linger on finished word
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.wordIndex = (this.wordIndex + 1) % words.length;
      this.speed = 600; // pause before starting next word
    }

    this.timeoutId = setTimeout(() => this.typewriterCycle(), this.speed);
  }
}
