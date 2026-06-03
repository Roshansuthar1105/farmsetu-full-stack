import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'fs-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen flex">
      <aside class="w-56 bg-gray-900 text-white p-4">
        <h2 class="font-bold text-secondary">FarmSetu Admin</h2>
        <nav class="mt-6 space-y-2 text-sm">
          <a routerLink="/admin" routerLinkActive="text-secondary" class="block py-2">Dashboard</a>
          <a routerLink="/app/dashboard" class="block py-2 text-gray-400">← App</a>
        </nav>
      </aside>
      <main class="flex-1 p-6 bg-gray-100 dark:bg-gray-900">
        <router-outlet />
      </main>
    </div>
  `
})
export class AdminLayoutComponent {}
