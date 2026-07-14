import { Component, Input } from '@angular/core';

@Component({
  selector: 'fs-admin-empty-state',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center py-16 px-4">
      <div class="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
      </div>
      <h3 class="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">{{ title }}</h3>
      <p class="text-sm text-slate-400 dark:text-slate-500 text-center max-w-sm">{{ message }}</p>
      @if (actionLabel) {
        <button class="mt-4 fs-btn-primary text-sm" (click)="null">{{ actionLabel }}</button>
      }
    </div>
  `
})
export class AdminEmptyStateComponent {
  @Input() title = 'No Data Found';
  @Input() message = 'There are no records to display at the moment.';
  @Input() actionLabel?: string;
}
