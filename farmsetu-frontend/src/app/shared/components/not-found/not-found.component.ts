import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'fs-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center text-center p-6">
      <h1 class="text-6xl font-bold text-primary">404</h1>
      <p class="mt-4 text-gray-600 dark:text-gray-300">Page not found</p>
      <a routerLink="/" class="mt-6 fs-btn-primary">Go Home</a>
    </div>
  `
})
export class NotFoundComponent {}
