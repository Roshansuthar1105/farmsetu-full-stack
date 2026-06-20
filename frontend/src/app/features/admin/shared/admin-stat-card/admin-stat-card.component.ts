import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fs-admin-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 group">
      <!-- Gradient Orb Background -->
      <div class="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-500"
        [style.background]="'radial-gradient(circle, ' + accentColor + ', transparent)'"></div>

      <div class="flex items-start justify-between relative z-10">
        <div class="space-y-2">
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{{ label }}</p>
          <div class="flex items-baseline gap-2">
            <p class="text-2xl font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
              {{ prefix }}{{ animatedValue | number }}{{ suffix }}
            </p>
            @if (trend !== undefined && trend !== null) {
              <span class="flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
                [ngClass]="trend >= 0 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'">
                <svg class="w-3 h-3" [class.rotate-180]="trend < 0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                </svg>
                {{ trend >= 0 ? '+' : '' }}{{ trend }}%
              </span>
            }
          </div>
          @if (subtitle) {
            <p class="text-xs text-slate-400 dark:text-slate-500">{{ subtitle }}</p>
          }
        </div>
        <div class="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
          [style.background]="iconBg"
          [style.color]="iconColor">
          <span [innerHTML]="iconSvg" class="w-5 h-5"></span>
        </div>
      </div>

      <!-- Loading Skeleton -->
      @if (loading) {
        <div class="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center z-20 rounded-2xl">
          <div class="space-y-3 w-full px-5">
            <div class="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div class="h-7 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminStatCardComponent {
  @Input() label = '';
  @Input() value = 0;
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() trend?: number;
  @Input() subtitle?: string;
  @Input() loading = false;
  @Input() accentColor = '#22C55E';
  @Input() iconBg = 'rgba(34, 197, 94, 0.1)';
  @Input() iconColor = '#22C55E';
  @Input() iconSvg = '';

  animatedValue = 0;
  private animFrame?: number;

  ngOnChanges(): void {
    this.animateValue(this.value);
  }

  ngOnDestroy(): void {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  private animateValue(target: number): void {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    const start = this.animatedValue;
    const diff = target - start;
    const duration = 800;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      this.animatedValue = Math.round(start + diff * eased);
      if (progress < 1) {
        this.animFrame = requestAnimationFrame(step);
      }
    };
    this.animFrame = requestAnimationFrame(step);
  }
}
