import { Component, Input, OnChanges, OnDestroy, inject, ChangeDetectorRef, NgZone } from '@angular/core';
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
          <span class="w-5 h-5 flex items-center justify-center">
            @switch (icon) {
              @case ('users') {
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              }
              @case ('active-users') {
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 12l-4 4-2-2"/></svg>
              }
              @case ('new-users') {
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              }
              @case ('orders') {
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              }
              @case ('revenue') {
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              }
              @case ('products') {
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              }
              @case ('crops') {
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>
              }
              @case ('posts') {
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              }
            }
          </span>
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
export class AdminStatCardComponent implements OnChanges, OnDestroy {
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
  @Input() icon = '';

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

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

    this.ngZone.runOutsideAngular(() => {
      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        this.animatedValue = Math.round(start + diff * eased);
        
        // Manually trigger change detection locally for this component view
        this.cdr.detectChanges();

        if (progress < 1) {
          this.animFrame = requestAnimationFrame(step);
        }
      };
      this.animFrame = requestAnimationFrame(step);
    });
  }
}
