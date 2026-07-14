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
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 overflow-hidden animate-pulse">
          <div class="p-4 space-y-1">
            <div class="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div class="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          </div>
          <div class="border-t border-slate-200/80 dark:border-slate-700/50">
            @for (i of [1,2,3,4,5]; track i) {
              <div class="px-5 py-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-700/30">
                <div class="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-lg" [style.width.%]="60 + i * 5"></div>
                  <div class="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3"></div>
                </div>
                <div class="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
            }
          </div>
        </div>
      }
      @default {
        <div class="animate-pulse">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg" [style.width]="width"></div>
        </div>
      }
    }
  `
})
export class AdminSkeletonComponent {
  @Input() variant: 'card' | 'chart' | 'table' | 'text' = 'text';
  @Input() width = '100%';

  getBarHeights(): number[] {
    return [30, 60, 45, 80, 50, 70, 40, 90, 55, 75, 35, 65];
  }
}
