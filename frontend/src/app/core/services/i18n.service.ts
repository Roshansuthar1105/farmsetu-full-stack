import { Injectable, signal } from '@angular/core';
import en from '../../../i18n/en.json';
import hi from '../../../i18n/hi.json';

type Lang = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'pa' | 'or' | 'as';

const dictionaries: Record<string, Record<string, string>> = { en, hi };

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly lang = signal<Lang>('en');

  init(): void {
    const saved = localStorage.getItem('fs_lang') as Lang | null;
    if (saved) this.setLang(saved);
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem('fs_lang', lang);
  }

  t(key: string): string {
    const dict = dictionaries[this.lang()] ?? dictionaries['en'];
    return dict[key] ?? key;
  }
}
