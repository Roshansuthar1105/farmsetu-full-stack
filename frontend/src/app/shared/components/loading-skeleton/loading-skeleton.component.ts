import { Component, Input } from '@angular/core';

@Component({
  selector: 'fs-loading-skeleton',
  standalone: true,
  template: `
    <div class="animate-pulse space-y-3">
      @for (row of rows; track $index) {
        <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded" [style.width.%]="widths[$index % widths.length]"></div>
      }
    </div>
  `
})
export class LoadingSkeletonComponent {
  @Input() count = 4;
  widths = [100, 80, 90, 70];
  get rows(): number[] {
    return Array.from({ length: this.count });
  }
}
