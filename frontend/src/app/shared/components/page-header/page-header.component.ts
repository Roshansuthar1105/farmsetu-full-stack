import { Component, Input } from '@angular/core';

@Component({
  selector: 'fs-page-header',
  standalone: true,
  template: `
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ title }}</h2>
      @if (subtitle) {
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ subtitle }}</p>
      }
    </div>
  `
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
