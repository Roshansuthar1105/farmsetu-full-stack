import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import {
  LucideLayoutDashboard,
  LucideUsers,
  LucideSprout,
  LucideStore,
  LucideFileUp,
  LucideMail,
  LucideAward,
  LucideTruck,
  LucideDroplet,
  LucideArrowLeft
} from '@lucide/angular';

@Component({
  selector: 'fs-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideUsers,
    LucideSprout,
    LucideStore,
    LucideFileUp,
    LucideMail,
    LucideAward,
    LucideTruck,
    LucideDroplet,
    LucideArrowLeft
  ],
  template: `
    <div class="min-h-screen flex font-display">
      <aside class="w-60 bg-slate-900 text-white p-4 shrink-0 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex flex-col gap-1.5 pb-4 border-b border-slate-800">
            <img src="assets/logo-dark-bg.svg" alt="FarmSetu Admin" class="h-8 w-auto object-contain self-start">
            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Admin Panel</span>
          </div>
          <nav class="mt-6 space-y-1.5 text-xs font-bold">
            <a routerLink="/admin" routerLinkActive="bg-emerald-600 text-white" [routerLinkActiveOptions]="{exact: true}" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <svg lucideLayoutDashboard size="16" class="stroke-[2] text-slate-400"></svg>
              <span>Dashboard</span>
            </a>
            <a routerLink="/admin/users" routerLinkActive="bg-emerald-600 text-white" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <svg lucideUsers size="16" class="stroke-[2] text-slate-400"></svg>
              <span>Manage Users</span>
            </a>
            <a routerLink="/admin/crops" routerLinkActive="bg-emerald-600 text-white" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <svg lucideSprout size="16" class="stroke-[2] text-slate-400"></svg>
              <span>Manage Crops</span>
            </a>
            <a routerLink="/admin/mandis" routerLinkActive="bg-emerald-600 text-white" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <svg lucideStore size="16" class="stroke-[2] text-slate-400"></svg>
              <span>Manage Mandis</span>
            </a>
            <a routerLink="/admin/market-prices" routerLinkActive="bg-emerald-600 text-white" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <svg lucideFileUp size="16" class="stroke-[2] text-slate-400"></svg>
              <span>Market Bulk Upload</span>
            </a>
            <a routerLink="/admin/email" routerLinkActive="bg-emerald-600 text-white" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <svg lucideMail size="16" class="stroke-[2] text-slate-400"></svg>
              <span>Email Broadcaster</span>
            </a>
            <a routerLink="/admin/badges" routerLinkActive="bg-emerald-600 text-white" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <svg lucideAward size="16" class="stroke-[2] text-amber-400"></svg>
              <span>Manage Badges</span>
            </a>
            <a routerLink="/admin/orders" routerLinkActive="bg-emerald-600 text-white" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <svg lucideTruck size="16" class="stroke-[2] text-slate-400"></svg>
              <span>Manage Orders</span>
            </a>
            <a routerLink="/admin/water-queue" routerLinkActive="bg-emerald-600 text-white" class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 hover:text-white transition">
              <svg lucideDroplet size="16" class="stroke-[2] text-slate-400"></svg>
              <span>Manage Water Queue</span>
            </a>
          </nav>
        </div>

        <div class="pt-4 border-t border-slate-800">
          <a routerLink="/app/dashboard" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <svg lucideArrowLeft size="14" class="stroke-[2.5]"></svg>
            <span>Back to App</span>
          </a>
        </div>
      </aside>
      <main class="flex-1 p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
        <router-outlet />
      </main>
    </div>
  `
})
export class AdminLayoutComponent {}
