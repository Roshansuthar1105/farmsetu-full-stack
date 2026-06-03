import { Component, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/services/i18n.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-settings',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <fs-page-header title="Settings" />
    <div class="fs-card max-w-lg space-y-4">
      <label class="flex items-center justify-between">
        <span>Dark mode</span>
        <input type="checkbox" [checked]="theme.darkMode()" (change)="theme.toggleDark()" />
      </label>
      <label class="flex items-center justify-between">
        <span>High contrast</span>
        <input type="checkbox" [checked]="theme.highContrast()" (change)="theme.toggleHighContrast()" />
      </label>
      <label class="block">
        <span class="text-sm font-medium">Font size</span>
        <select class="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-700" (change)="onFont($event)">
          <option value="sm">Small</option>
          <option value="md" selected>Medium</option>
          <option value="lg">Large</option>
        </select>
      </label>
      <label class="block">
        <span class="text-sm font-medium">Language</span>
        <select class="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-700" (change)="onLang($event)">
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
        </select>
      </label>
    </div>
  `
})
export class SettingsComponent {
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);

  onFont(e: Event): void {
    this.theme.setFontSize((e.target as HTMLSelectElement).value as 'sm' | 'md' | 'lg');
  }

  onLang(e: Event): void {
    this.i18n.setLang((e.target as HTMLSelectElement).value as 'en' | 'hi');
  }
}
