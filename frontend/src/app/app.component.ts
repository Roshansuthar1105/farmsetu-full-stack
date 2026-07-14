import { Component, signal, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { I18nService } from './core/services/i18n.service';
import { ThemeService } from './core/services/theme.service';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'fs-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent implements OnInit, OnDestroy {
  readonly title = signal('FarmSetu');

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private routerSub?: Subscription;
  private observer?: MutationObserver;

  constructor(i18n: I18nService, theme: ThemeService) {
    i18n.init();
    theme.init();
  }

  ngOnInit(): void {
    // 1. Listen to router events for smooth scrolling on route change (to top or to fragment)
    this.routerSub = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const urlTree = this.router.parseUrl(event.urlAfterRedirects || event.url);
      const fragment = urlTree.fragment;
      if (fragment) {
        this.scrollToFragment(fragment);
      } else {
        this.scrollToTop();
      }
    });

    // 2. Set up MutationObserver to lock background scrolling when modals are open
    if (isPlatformBrowser(this.platformId)) {
      this.setupModalObserver();
    }
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private scrollToTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Smooth scroll the main window
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Smooth scroll any scrollable layout main containers
    const mainElements = document.querySelectorAll('main');
    mainElements.forEach(main => {
      main.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  private scrollToFragment(fragment: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Smooth scroll to target element after a short delay for rendering
    setTimeout(() => {
      const element = document.getElementById(fragment);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  }

  private setupModalObserver(): void {
    const checkModals = () => {
      // Find any modal elements in the DOM:
      // - elements with .modal-overlay
      // - elements with .modal-backdrop
      // - elements matching backdrop/fixed overlay selectors (like fixed inset-0 z-50 or z-40)
      const hasModal = !!document.querySelector(
        '.modal-overlay, .modal-backdrop, [class*="fixed"][class*="inset-0"][class*="z-50"], [class*="fixed"][class*="inset-0"][class*="z-40"]'
      );

      const isBodyModalOpen = document.body.classList.contains('modal-open');
      const isDocModalOpen = document.documentElement.classList.contains('modal-open');

      if (hasModal) {
        if (!isBodyModalOpen) {
          document.body.classList.add('modal-open');
        }
        if (!isDocModalOpen) {
          document.documentElement.classList.add('modal-open');
        }
      } else {
        if (isBodyModalOpen) {
          document.body.classList.remove('modal-open');
        }
        if (isDocModalOpen) {
          document.documentElement.classList.remove('modal-open');
        }
      }
    };

    // Run initial check
    checkModals();

    // Create a MutationObserver to listen to DOM changes
    this.observer = new MutationObserver(() => {
      checkModals();
    });

    // Observe body mutations: check only when children are added/removed (modals opening/closing)
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

