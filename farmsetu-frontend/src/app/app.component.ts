import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/services/i18n.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'fs-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent {
  readonly title = signal('FarmSetu');

  constructor(i18n: I18nService, theme: ThemeService) {
    i18n.init();
    theme.init();
  }
}
