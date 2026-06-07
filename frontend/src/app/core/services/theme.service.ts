import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly darkMode = signal(false);
  readonly fontSize = signal<'sm' | 'md' | 'lg'>('md');
  readonly highContrast = signal(false);

  init(): void {
    const dark = localStorage.getItem('fs_dark') === 'true';
    this.setDark(dark);
    const size = (localStorage.getItem('fs_font_size') as 'sm' | 'md' | 'lg') || 'md';
    this.setFontSize(size);
  }

  toggleDark(): void {
    this.setDark(!this.darkMode());
  }

  setDark(value: boolean): void {
    this.darkMode.set(value);
    localStorage.setItem('fs_dark', String(value));
    document.documentElement.classList.toggle('dark', value);
  }

  setFontSize(size: 'sm' | 'md' | 'lg'): void {
    this.fontSize.set(size);
    localStorage.setItem('fs_font_size', size);
    document.documentElement.dataset['fontSize'] = size;
  }

  toggleHighContrast(): void {
    this.highContrast.update((v) => !v);
    document.documentElement.classList.toggle('high-contrast', this.highContrast());
  }
}
