import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translate = inject(TranslateService);
  private storage = inject(StorageService);
  private readonly LANG_KEY = 'app_language';

  init(defaultLang: string = 'en') {
    this.translate.addLangs(['en', 'hn']);
    this.translate.setDefaultLang(defaultLang);
    
    const browserLang = this.translate.getBrowserLang();
    const savedLang = this.storage.getItem<string>(this.LANG_KEY);
    
    const langToUse = savedLang || (browserLang && browserLang.match(/en|hn/) ? browserLang : defaultLang);
    this.setLanguage(langToUse);
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.storage.setItem(this.LANG_KEY, lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }
}
