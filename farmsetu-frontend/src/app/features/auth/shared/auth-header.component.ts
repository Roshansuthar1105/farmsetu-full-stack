import { Component, Input } from '@angular/core';

@Component({
    selector: 'fs-auth-header',
    standalone: true,
    template: `
    <div class="relative w-full overflow-hidden flex flex-col justify-center items-center select-none"
         [style.height]="height">
      <!-- Premium Ambient Gradient Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-950 to-emerald-950">
        <!-- Interactive Aurora Blur Orbs -->
        <div class="absolute top-[-20%] right-[-10%] w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div class="absolute bottom-[-10%] left-[-20%] w-[450px] h-[450px] bg-secondary-500/10 rounded-full blur-[140px] animate-pulse-slow" style="animation-delay: 2s"></div>
        <div class="absolute top-[30%] left-[20%] w-72 h-72 bg-emerald-400/10 rounded-full blur-[100px]"></div>

        <!-- Fine Grid pattern overlay for tech-agri look -->
        <div class="absolute inset-0 opacity-15"
             style="background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
             background-size: 24px 24px;">
        </div>
      </div>

      <!-- Main Header Container -->
      <div class="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-4">
        <!-- Modern Glass logo box with rotation -->
        <div class="w-16 h-16 bg-white/10 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4
                    shadow-xl border border-white/20 hover:rotate-6 transition-all duration-500">
          <img src="assets/logo.svg" alt="FarmSetu Logo" class="w-10 h-10 object-contain" />
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Farm<span class="text-primary-400">Setu</span>
        </h1>
        <p class="text-primary-200 mt-2 text-xs md:text-sm font-semibold tracking-widest uppercase">
          {{ tagline }}
        </p>

        <!-- Floating plant particles -->
        <div class="flex gap-3 mt-4 text-white/50 text-sm">
          <span class="animate-float" style="animation-delay: 0s">🌱</span>
          <span class="animate-float" style="animation-delay: 1.5s">🌾</span>
          <span class="animate-float" style="animation-delay: 3s">🚜</span>
        </div>
      </div>
    </div>
  `
})
export class AuthHeaderComponent {
    @Input() tagline = 'Kheti ki nayi duniya';
    @Input() height = '35vh';
}