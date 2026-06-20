import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { WebsocketService } from '../../../core/services/websocket.service';
import { AuthService } from '../../../core/services/auth.service';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';
import { Subscription } from 'rxjs';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'USER' | 'ORDER' | 'ALERT';
  read: boolean;
  createdAt: Date;
}

@Component({
  selector: 'fs-admin-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent],
  template: `
    <div class="space-y-6">
      <fs-admin-page-header title="System Notifications" subtitle="Real-time logs, activity updates, and critical system alerts.">
        <div class="flex items-center gap-2">
          <button (click)="markAllAsRead()" class="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            Mark all read
          </button>
          <button (click)="clearAll()" class="px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 transition">
            Clear all
          </button>
        </div>
      </fs-admin-page-header>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Sidebar filters -->
        <div class="space-y-2 lg:col-span-1">
          <div class="bg-white dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-sm space-y-1">
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Category Filters</p>
            @for (cat of categories; track cat.id) {
              <button (click)="activeCategory.set(cat.id)"
                class="w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition-all"
                [ngClass]="activeCategory() === cat.id ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/40'">
                <span class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" [class.bg-white]="activeCategory() === cat.id" [style.background-color]="activeCategory() !== cat.id ? cat.color : null"></span>
                  {{ cat.name }}
                </span>
                <span class="px-1.5 py-0.5 text-[9px] font-bold rounded-full"
                  [class]="activeCategory() === cat.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'">
                  {{ getCount(cat.id) }}
                </span>
              </button>
            }
          </div>
        </div>

        <!-- Notifications list -->
        <div class="lg:col-span-3 space-y-3">
          <div class="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 backdrop-blur-sm overflow-hidden">
            <div class="divide-y divide-slate-100 dark:divide-slate-700/40">
              @for (notif of filteredNotifications(); track notif.id) {
                <div class="p-4 flex items-start gap-3 transition-colors duration-150"
                  [ngClass]="!notif.read ? 'bg-primary-50/20 dark:bg-primary-950/5' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'">
                  
                  <!-- Type icon -->
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    [class]="getIconBgClass(notif.type)">
                    <span [innerHTML]="getIconSvg(notif.type)" class="w-4 h-4"></span>
                  </div>

                  <!-- Details -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                      <p class="text-sm font-semibold text-slate-900 dark:text-white" [class.font-bold]="!notif.read">
                        {{ notif.title }}
                      </p>
                      <span class="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 font-mono">
                        {{ notif.createdAt | date:'shortTime' }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{{ notif.message }}</p>
                    <div class="flex items-center gap-2 mt-2">
                      @if (!notif.read) {
                        <button (click)="markAsRead(notif.id)" class="text-[10px] font-semibold text-primary hover:underline">
                          Mark as read
                        </button>
                        <span class="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                      }
                      <button (click)="removeNotification(notif.id)" class="text-[10px] font-semibold text-red-500 hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              }
              @if (filteredNotifications().length === 0) {
                <div class="p-16 text-center">
                  <div class="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <svg class="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-slate-500 dark:text-slate-400">All caught up!</p>
                  <p class="text-xs text-slate-400 dark:text-slate-500">No notifications in this category</p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminNotificationsComponent implements OnInit, OnDestroy {
  private readonly ws = inject(WebsocketService);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  private wsUnsub?: () => void;

  readonly notifications = signal<AdminNotification[]>([
    { id: '1', title: 'New Seller Registration', message: 'Seller Ramesh Kumar applied for shop verification.', type: 'USER', read: false, createdAt: new Date(Date.now() - 300000) },
    { id: '2', title: 'Order Completed', message: 'Order #4102 has been successfully delivered and paid.', type: 'ORDER', read: false, createdAt: new Date(Date.now() - 3600000) },
    { id: '3', title: 'High CPU Utilization', message: 'Server instance API usage peaked above 90% threshold.', type: 'ALERT', read: true, createdAt: new Date(Date.now() - 7200000) },
    { id: '4', title: 'System Database Backup', message: 'Automated midnight backup completed successfully.', type: 'SYSTEM', read: true, createdAt: new Date(Date.now() - 86400000) }
  ]);

  readonly activeCategory = signal<string>('ALL');

  readonly categories = [
    { id: 'ALL', name: 'All Notifications', color: '#64748B' },
    { id: 'SYSTEM', name: 'System Info', color: '#3B82F6' },
    { id: 'USER', name: 'Users / Sellers', color: '#8B5CF6' },
    { id: 'ORDER', name: 'Orders & Trades', color: '#10B981' },
    { id: 'ALERT', name: 'System Alerts', color: '#EF4444' }
  ];

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.ws.connect(user.id);
      // Subscribe to real-time admin notification channel
      this.wsUnsub = this.ws.subscribe('/topic/admin.notifications', (data) => {
        this.toastr.info(data.message || 'New system update', data.title || 'Notification');
        this.addNotification({
          id: Math.random().toString(36).substr(2, 9),
          title: data.title || 'System Notification',
          message: data.message || String(data),
          type: data.type || 'SYSTEM',
          read: false,
          createdAt: new Date()
        });
      });
    }
  }

  ngOnDestroy(): void {
    this.wsUnsub?.();
  }

  private addNotification(n: AdminNotification): void {
    this.notifications.update(list => [n, ...list]);
  }

  filteredNotifications() {
    const cat = this.activeCategory();
    const list = this.notifications();
    if (cat === 'ALL') return list;
    return list.filter(n => n.type === cat);
  }

  getCount(category: string): number {
    const list = this.notifications();
    if (category === 'ALL') return list.length;
    return list.filter(n => n.type === category).length;
  }

  markAsRead(id: string): void {
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllAsRead(): void {
    this.notifications.update(list =>
      list.map(n => ({ ...n, read: true }))
    );
    this.toastr.success('All notifications marked as read');
  }

  removeNotification(id: string): void {
    this.notifications.update(list =>
      list.filter(n => n.id !== id)
    );
  }

  clearAll(): void {
    this.notifications.set([]);
    this.toastr.success('Cleared all notifications');
  }

  getIconBgClass(type: string): string {
    const map: Record<string, string> = {
      SYSTEM: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
      USER: 'bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400',
      ORDER: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
      ALERT: 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
    };
    return map[type] || 'bg-slate-50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-400';
  }

  getIconSvg(type: string): string {
    const map: Record<string, string> = {
      SYSTEM: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
      USER: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
      ORDER: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
      ALERT: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
    };
    return map[type] || '';
  }
}
