import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fs-admin-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (variant) {
      @case ('card') {
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 p-5 animate-pulse">
          <div class="flex items-start justify-between">
            <div class="space-y-3 flex-1">
              <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div class="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              <div class="h-2.5 w-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            </div>
            <div class="w-11 h-11 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
        </div>
      }
      @case ('chart') {
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 overflow-hidden animate-pulse">
          <div class="px-5 pt-5 pb-2 space-y-2">
            <div class="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div class="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
          <div class="px-5 pb-5 pt-3">
            <div class="h-[200px] bg-slate-100 dark:bg-slate-700/50 rounded-xl flex items-end justify-around gap-2 p-4">
              @for (i of getBarHeights(); track i) {
                <div class="bg-slate-200 dark:bg-slate-700 rounded-t-lg flex-1" [style.height.%]="i"></div>
              }
            </div>
          </div>
        </div>
      }
      @case ('table') {
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 overflow-hidden">
          <!-- Top accent bar -->
          <div class="h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

          <!-- Header -->
          <div class="p-4 space-y-1 border-b border-slate-200/60 dark:border-slate-700/40">
            <div class="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div class="h-3 w-32 bg-slate-200/70 dark:bg-slate-700/70 rounded-lg animate-pulse"></div>
          </div>

          <!-- Column headers -->
          <div class="bg-slate-50/50 dark:bg-slate-900/30 px-5 py-3 flex items-center gap-6 border-b border-slate-200/40 dark:border-slate-700/30">
            <div class="h-2.5 w-14 bg-slate-200/80 dark:bg-slate-700/80 rounded-md"></div>
            <div class="h-2.5 w-20 bg-slate-200/70 dark:bg-slate-700/70 rounded-md"></div>
            <div class="h-2.5 w-16 bg-slate-200/60 dark:bg-slate-700/60 rounded-md"></div>
            <div class="flex-1"></div>
            <div class="h-2.5 w-12 bg-slate-200/50 dark:bg-slate-700/50 rounded-md"></div>
          </div>

          <!-- Rows with shimmer -->
          <div class="divide-y divide-slate-100/50 dark:divide-slate-700/20">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="px-5 py-3.5 flex items-center gap-4 relative overflow-hidden"
                [style.animation]="'adminSkeletonRow 0.4s ease-out ' + (i * 70) + 'ms both'">

                <!-- Shimmer -->
                <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 dark:via-slate-600/8 to-transparent pointer-events-none"
                  [style.animation]="'adminShimmer 1.8s ease-in-out infinite ' + (i * 120) + 'ms'"></div>

                <!-- Avatar -->
                <div class="w-9 h-9 bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-600/80 rounded-xl border border-slate-200/50 dark:border-slate-600/40 shrink-0"></div>

                <!-- Text content -->
                <div class="flex-1 space-y-1.5">
                  <div class="h-3.5 bg-gradient-to-r from-slate-200/90 to-slate-100/50 dark:from-slate-700/90 dark:to-slate-600/50 rounded-md" [style.width.%]="55 + i * 6"></div>
                  <div class="h-2.5 bg-slate-100/90 dark:bg-slate-700/40 rounded-md w-1/3"></div>
                </div>

                <!-- Badge -->
                <div class="h-5 rounded-full bg-gradient-to-r from-emerald-100/60 to-emerald-50/30 dark:from-emerald-900/15 dark:to-emerald-950/5 border border-emerald-200/30 dark:border-emerald-800/20 shrink-0" [style.width.px]="50 + i * 6"></div>
              </div>
            }
          </div>

          <!-- Pagination skeleton -->
          <div class="bg-slate-50/30 dark:bg-slate-900/20 border-t border-slate-200/40 dark:border-slate-700/30 px-5 py-3 flex items-center justify-between">
            <div class="h-2.5 w-28 bg-slate-200/60 dark:bg-slate-700/50 rounded-md"></div>
            <div class="flex gap-1">
              <div class="w-6 h-6 bg-slate-200/50 dark:bg-slate-700/40 rounded-md"></div>
              <div class="w-6 h-6 bg-emerald-200/40 dark:bg-emerald-800/20 rounded-md"></div>
              <div class="w-6 h-6 bg-slate-200/50 dark:bg-slate-700/40 rounded-md"></div>
            </div>
          </div>
        </div>
      }
      @default {
        <div class="animate-pulse">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg" [style.width]="width"></div>
        </div>
      }
    }
  `,
  styles: [`
    @keyframes adminShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    @keyframes adminSkeletonRow {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminSkeletonComponent {
  @Input() variant: 'card' | 'chart' | 'table' | 'text' = 'text';
  @Input() width = '100%';

  getBarHeights(): number[] {
    return [30, 60, 45, 80, 50, 70, 40, 90, 55, 75, 35, 65];
  }
}
