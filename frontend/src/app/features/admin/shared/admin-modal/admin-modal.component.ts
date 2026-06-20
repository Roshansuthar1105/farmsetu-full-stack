import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fs-admin-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
          (click)="dismissable && close.emit()"></div>

        <!-- Modal -->
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-2xl transition-all sm:my-8 w-full border border-slate-200/60 dark:border-slate-700/60"
            [class.sm:max-w-md]="size === 'sm'"
            [class.sm:max-w-lg]="size === 'md'"
            [class.sm:max-w-2xl]="size === 'lg'"
            [class.sm:max-w-4xl]="size === 'xl'"
            [class.sm:max-w-6xl]="size === 'full'">

            <!-- Header -->
            @if (title) {
              <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/60">
                <div>
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
                  @if (subtitle) {
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ subtitle }}</p>
                  }
                </div>
                <button (click)="close.emit()"
                  class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            }

            <!-- Body -->
            <div class="px-6 py-5 max-h-[70vh] overflow-y-auto">
              <ng-content></ng-content>
            </div>

            <!-- Footer -->
            @if (showFooter) {
              <div class="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-900/30">
                <ng-content select="[footer]"></ng-content>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class AdminModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'lg';
  @Input() dismissable = true;
  @Input() showFooter = true;
  @Output() close = new EventEmitter<void>();
}
