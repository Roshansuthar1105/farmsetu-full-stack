import { Component, Input } from '@angular/core';

@Component({
    selector: 'fs-auth-header',
    standalone: true,
    template: `
    <div class="relative w-full overflow-hidden"
         [style.height]="height">
      <!-- Gradient Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800">
        <!-- Decorative circles -->
        <div class="absolute -top-20 -right-20 w-64 h-64 bg-green-500/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl"></div>
        <div class="absolute top-10 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl"></div>

        <!-- Wheat pattern overlay -->
        <div class="absolute inset-0 opacity-10"
             style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cpath d=&quot;M30 5c0 8-5 15-5 25s5 17 5 25&quot; stroke=&quot;%23fff&quot; fill=&quot;none&quot; stroke-width=&quot;1.5&quot;/%3E%3Cellipse cx=&quot;30&quot; cy=&quot;20&quot; rx=&quot;4&quot; ry=&quot;8&quot; fill=&quot;%23fff&quot;/%3E%3C/svg%3E');
             background-size: 60px 60px;">
        </div>
      </div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
        <!-- Logo -->
        <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4
                    shadow-lg border border-white/30">
          <span class="text-4xl">🌾</span>
        </div>
        <h1 class="text-3xl font-bold tracking-wide">FarmSetu</h1>
        <p class="text-green-100 mt-2 text-sm tracking-widest uppercase">{{ tagline }}</p>

        <!-- Animated wheat illustration -->
        <div class="flex gap-2 mt-4 opacity-60">
          <span class="text-2xl animate-bounce" style="animation-delay: 0ms">🌿</span>
          <span class="text-2xl animate-bounce" style="animation-delay: 150ms">🌾</span>
          <span class="text-2xl animate-bounce" style="animation-delay: 300ms">🌿</span>
        </div>
      </div>
    </div>
  `
})
export class AuthHeaderComponent {
    @Input() tagline = 'Kheti ki nayi duniya';
    @Input() height = '40vh';
}