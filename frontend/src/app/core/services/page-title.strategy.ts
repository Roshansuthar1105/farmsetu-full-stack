import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class PageTitleStrategy extends TitleStrategy {
  private readonly prefix = 'FarmSetu';

  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(routerState);

    if (pageTitle) {
      this.title.setTitle(`${this.prefix} | ${pageTitle}`);
    } else {
      this.title.setTitle(`${this.prefix} — An Agricultural Platform`);
    }
  }
}
