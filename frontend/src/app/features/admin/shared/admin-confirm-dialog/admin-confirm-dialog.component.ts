import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'fs-admin-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (open) {
      <div class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" (click)="cancel.emit()"></div>
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-800 text-left shadow-2xl transition-all sm:w-full sm:max-w-md border border-slate-200/60 dark:border-slate-700/60">
            <div class="p-6">
              <!-- Icon -->
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
                [ngClass]="{
                  'bg-red-50 dark:bg-red-950/30': variant === 'danger',
                  'bg-amber-50 dark:bg-amber-950/30': variant === 'warning',
                  'bg-blue-50 dark:bg-blue-950/30': variant === 'info'
                }">
                @if (variant === 'danger') {
                  <svg class="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                }
                @if (variant === 'warning') {
                  <svg class="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
                @if (variant === 'info') {
                  <svg class="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                }
              </div>

              <!-- Content -->
              <div class="text-center">
                <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">{{ title }}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ message }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3 px-6 pb-6 pt-2">
              <button (click)="cancel.emit()"
                class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                {{ cancelLabel }}
              </button>
              <button (click)="confirm.emit()"
                class="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl text-white transition"
                [class.bg-red-500]="variant === 'danger'"
                [class.hover:bg-red-600]="variant === 'danger'"
                [class.bg-amber-500]="variant === 'warning'"
                [class.hover:bg-amber-600]="variant === 'warning'"
                [class.bg-blue-500]="variant === 'info'"
                [class.hover:bg-blue-600]="variant === 'info'">
                {{ confirmLabel }}
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminConfirmDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmLabel = 'Confirm';
  @Input() cancelLabel = 'Cancel';
  @Input() variant: 'danger' | 'warning' | 'info' = 'danger';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
