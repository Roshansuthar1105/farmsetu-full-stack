import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fs-loading-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 w-full animate-fade-in font-display">
      
      <!-- Optional Top Page Header Skeleton -->
      <div *ngIf="showHeader" class="bg-white/60 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 p-5 rounded-3xl shadow-sm backdrop-blur-md space-y-3 relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <div class="h-7 w-48 sm:w-64 bg-slate-200/80 dark:bg-slate-800 rounded-xl animate-pulse"></div>
            <div class="h-3.5 w-64 sm:w-96 bg-slate-200/60 dark:bg-slate-800/60 rounded-lg animate-pulse"></div>
          </div>
          <div class="hidden sm:block h-10 w-28 bg-emerald-500/20 dark:bg-emerald-500/15 rounded-xl animate-pulse"></div>
        </div>
      </div>

      <!-- 1. GRID / CARD SKELETON (Default) -->
      <div *ngIf="type === 'grid' || type === 'card'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (item of items; track $index) {
          <div class="bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4 backdrop-blur-md relative overflow-hidden group">
            
            <!-- Shimmer Effect Overlay -->
            <div class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-slate-700/20 to-transparent pointer-events-none"></div>

            <!-- Card Thumbnail / Image Area Skeleton -->
            <div class="h-44 w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl animate-pulse flex items-center justify-center relative overflow-hidden border border-slate-200/40 dark:border-slate-700/40">
              <div class="w-10 h-10 rounded-2xl bg-slate-300/60 dark:bg-slate-700/60 flex items-center justify-center">
                <div class="w-4 h-4 rounded-full bg-slate-400/40 dark:bg-slate-600/40"></div>
              </div>
            </div>

            <!-- Card Header: Tag Pill & Badge Skeleton -->
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <div class="h-4 w-20 bg-emerald-500/20 dark:bg-emerald-500/15 rounded-full animate-pulse"></div>
                <div class="h-3.5 w-12 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse"></div>
              </div>
              <!-- Card Main Heading -->
              <div class="h-5 w-4/5 bg-slate-300/80 dark:bg-slate-700/80 rounded-xl animate-pulse"></div>
            </div>

            <!-- Description Text Lines Skeleton -->
            <div class="space-y-2 pt-1">
              <div class="h-3 w-full bg-slate-200/70 dark:bg-slate-800/70 rounded-md animate-pulse"></div>
              <div class="h-3 w-5/6 bg-slate-200/70 dark:bg-slate-800/70 rounded-md animate-pulse"></div>
              <div class="h-3 w-2/3 bg-slate-200/50 dark:bg-slate-800/50 rounded-md animate-pulse"></div>
            </div>

            <!-- Card Footer Skeleton -->
            <div class="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
              <div class="space-y-1">
                <div class="h-3 w-12 bg-slate-200/60 dark:bg-slate-800/60 rounded animate-pulse"></div>
                <div class="h-5 w-20 bg-slate-300/80 dark:bg-slate-700/80 rounded-lg animate-pulse"></div>
              </div>
              <div class="h-9 w-28 bg-emerald-600/20 dark:bg-emerald-500/20 border border-emerald-500/30 rounded-xl animate-pulse"></div>
            </div>
          </div>
        }
      </div>

      <!-- 2. ROWS / LIST SKELETON -->
      <div *ngIf="type === 'rows'" class="space-y-3">
        @for (item of items; track $index) {
          <div class="bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 backdrop-blur-md relative overflow-hidden">
            <!-- Shimmer Overlay -->
            <div class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-slate-700/20 to-transparent pointer-events-none"></div>

            <div class="flex items-center gap-4 flex-1">
              <!-- Circular Avatar Thumbnail Box -->
              <div class="w-12 h-12 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 shrink-0 animate-pulse border border-slate-200/40 dark:border-slate-700/40"></div>
              <div class="space-y-2 flex-1">
                <div class="h-4.5 w-1/3 bg-slate-300/80 dark:bg-slate-700/80 rounded-lg animate-pulse"></div>
                <div class="h-3 w-2/3 bg-slate-200/70 dark:bg-slate-800/70 rounded-md animate-pulse"></div>
              </div>
            </div>

            <!-- Action Button Skeleton -->
            <div class="h-8 w-24 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl shrink-0 animate-pulse"></div>
          </div>
        }
      </div>

      <!-- 3. TABLE SKELETON -->
      <div *ngIf="type === 'table'" class="bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-sm backdrop-blur-md overflow-hidden">
        <!-- Top accent bar -->
        <div class="h-[2.5px] bg-gradient-to-r from-emerald-550 via-teal-500 to-emerald-600"></div>

        <!-- Table Header Row Skeleton -->
        <div class="bg-slate-50/40 dark:bg-slate-950/20 border-b border-slate-200/50 dark:border-slate-800/60 px-5 py-3.5 flex items-center gap-6">
          <div class="h-3 w-16 bg-slate-200/80 dark:bg-slate-800/80 rounded-md"></div>
          <div class="h-3 w-24 bg-slate-200/70 dark:bg-slate-800/70 rounded-md"></div>
          <div class="h-3 w-20 bg-slate-200/60 dark:bg-slate-800/60 rounded-md hidden sm:block"></div>
          <div class="flex-1"></div>
          <div class="h-3 w-14 bg-slate-200/50 dark:bg-slate-800/50 rounded-md hidden sm:block"></div>
          <div class="h-3 w-14 bg-emerald-200/50 dark:bg-emerald-800/30 rounded-md"></div>
        </div>

        <!-- Table Body Rows -->
        <div class="divide-y divide-slate-100/50 dark:divide-slate-800/30">
          @for (item of items; track $index) {
            <div class="px-5 py-4 flex items-center gap-5 relative overflow-hidden"
              [style.animation]="'skeletonRowIn 0.4s ease-out ' + ($index * 60) + 'ms both'">

              <!-- Shimmer overlay -->
              <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 dark:via-slate-600/8 to-transparent pointer-events-none"
                [style.animation]="'shimmer 2s ease-in-out infinite ' + ($index * 120) + 'ms'"></div>

              <!-- Avatar/Image placeholder -->
              <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700/80 border border-slate-200/50 dark:border-slate-700/40 shrink-0"></div>

              <!-- Primary + secondary text -->
              <div class="flex-1 space-y-1.5 min-w-0">
                <div class="h-3.5 bg-gradient-to-r from-slate-200/90 to-slate-100/50 dark:from-slate-700/90 dark:to-slate-800/50 rounded-md"
                  [style.width]="(45 + $index * 8) + '%'"></div>
                <div class="h-2.5 bg-slate-100/90 dark:bg-slate-800/50 rounded-md"
                  [style.width]="(25 + $index * 5) + '%'"></div>
              </div>

              <!-- Badge placeholder -->
              <div class="h-5 rounded-full bg-gradient-to-r from-emerald-100/70 to-emerald-50/40 dark:from-emerald-900/20 dark:to-emerald-950/10 border border-emerald-200/30 dark:border-emerald-800/20 shrink-0 hidden sm:block"
                [style.width]="(52 + $index * 7) + 'px'"></div>

              <!-- Value/number placeholder -->
              <div class="h-3.5 w-16 bg-slate-200/70 dark:bg-slate-800/60 rounded-md shrink-0 hidden sm:block"></div>

              <!-- Action button placeholder -->
              <div class="h-7 w-16 bg-slate-200/50 dark:bg-slate-800/40 rounded-lg border border-slate-200/30 dark:border-slate-700/30 shrink-0"></div>
            </div>
          }
        </div>

        <!-- Pagination footer skeleton -->
        <div class="bg-slate-50/30 dark:bg-slate-950/15 border-t border-slate-200/40 dark:border-slate-800/50 px-5 py-3.5 flex items-center justify-between">
          <div class="h-3 w-36 bg-slate-200/60 dark:bg-slate-800/50 rounded-md"></div>
          <div class="flex gap-1.5">
            <div class="w-7 h-7 bg-slate-200/50 dark:bg-slate-800/40 rounded-lg"></div>
            <div class="w-7 h-7 bg-emerald-200/40 dark:bg-emerald-900/20 rounded-lg"></div>
            <div class="w-7 h-7 bg-slate-200/50 dark:bg-slate-800/40 rounded-lg"></div>
          </div>
        </div>
      </div>

      <!-- 4. DETAIL PAGE SKELETON -->
      <div *ngIf="type === 'detail'" class="space-y-6">
        <!-- Hero Image Banner -->
        <div class="h-64 sm:h-80 w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-3xl animate-pulse border border-slate-200/50 dark:border-slate-800/80 relative overflow-hidden">
          <div class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-slate-700/20 to-transparent"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Main Content Body Skeleton -->
          <div class="lg:col-span-2 bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 backdrop-blur-md">
            <div class="h-7 w-3/4 bg-slate-300/80 dark:bg-slate-700/80 rounded-xl animate-pulse"></div>
            <div class="space-y-2 pt-2">
              <div class="h-3.5 w-full bg-slate-200/70 dark:bg-slate-800/70 rounded-md animate-pulse"></div>
              <div class="h-3.5 w-full bg-slate-200/70 dark:bg-slate-800/70 rounded-md animate-pulse"></div>
              <div class="h-3.5 w-4/5 bg-slate-200/60 dark:bg-slate-800/60 rounded-md animate-pulse"></div>
            </div>
          </div>

          <!-- Sidebar Skeleton Card -->
          <div class="bg-white/70 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl p-6 space-y-5 backdrop-blur-md">
            <div class="h-6 w-1/2 bg-slate-300/80 dark:bg-slate-700/80 rounded-lg animate-pulse"></div>
            <div class="h-10 w-full bg-emerald-600/20 dark:bg-emerald-500/20 rounded-2xl animate-pulse"></div>
            <div class="h-10 w-full bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    @keyframes shimmer {
      100% {
        transform: translateX(100%);
      }
    }
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }
    @keyframes skeletonRowIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LoadingSkeletonComponent {
  @Input() count = 3;
  @Input() type: 'grid' | 'card' | 'rows' | 'table' | 'detail' = 'grid';
  @Input() showHeader = false;

  get items(): number[] {
    return Array.from({ length: this.count });
  }
}
