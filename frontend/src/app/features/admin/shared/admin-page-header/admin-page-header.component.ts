import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminBreadcrumbComponent } from '../admin-breadcrumb/admin-breadcrumb.component';

@Component({
  selector: 'fs-admin-page-header',
  standalone: true,
  imports: [CommonModule, AdminBreadcrumbComponent],
  template: `
    <div class="mb-6">
      <fs-admin-breadcrumb class="mb-3" />
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{{ title }}</h1>
          @if (subtitle) {
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{{ subtitle }}</p>
          }
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `
})
export class AdminPageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
