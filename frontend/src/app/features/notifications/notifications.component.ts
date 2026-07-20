import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PageResponse } from '../../core/models/user.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import {
  LucideSprout,
  LucideCloudRain,
  LucideTrendingUp,
  LucideBell,
  LucideCheckCircle2,
  LucideTrash2,
  LucideSettings,
  LucideSlidersHorizontal,
  LucideXCircle,
  LucideAlertCircle,
  LucideInfo,
  LucideSearch,
  LucideCheck,
  LucideX,
  LucideBriefcase,
  LucideTruck
} from '@lucide/angular';

interface LocalNotification {
  id: number;
  title: string;
  message: string;
  notificationType: string;
  read: boolean;
  actionUrl?: string;
  timeAgo: string;
}

@Component({
  selector: 'fs-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PageHeaderComponent,
    FormsModule,
    LucideSprout,
    LucideCloudRain,
    LucideTrendingUp,
    LucideBell,
    LucideCheckCircle2,
    LucideTrash2,
    LucideSettings,
    LucideSlidersHorizontal,
    LucideXCircle,
    LucideAlertCircle,
    LucideInfo,
    LucideSearch,
    LucideCheck,
    LucideX,
    LucideBriefcase,
    LucideTruck
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  readonly items = signal<LocalNotification[]>([]);
  readonly activeChannel = signal<'all' | 'weather' | 'market' | 'task' | 'marketplace' | 'system' | 'preferences'>('all');
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(true);

  // Preferences model
  readonly preferences = signal({
    emailAlerts: true,
    smsAlerts: true,
    whatsappAlerts: false,
    weatherWarnings: true,
    priceSurges: true,
    taskReminders: true
  });

  // Computed filtered notifications
  readonly filteredItems = computed(() => {
    let list = this.items();
    const channel = this.activeChannel();
    const query = this.searchQuery().toLowerCase().trim();

    // 1. Channel Category Filter
    if (channel === 'weather') {
      list = list.filter(n => n.notificationType === 'WEATHER');
    } else if (channel === 'market') {
      list = list.filter(n => n.notificationType === 'PRICE');
    } else if (channel === 'task') {
      list = list.filter(n => n.notificationType === 'TASK');
    } else if (channel === 'marketplace') {
      list = list.filter(n => n.notificationType === 'MARKETPLACE');
    } else if (channel === 'system') {
      list = list.filter(n => n.notificationType === 'SYSTEM');
    }

    // 2. Search text filter
    if (query) {
      list = list.filter(n =>
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query)
      );
    }

    return list;
  });

  // Category counts
  readonly counts = computed(() => {
    const list = this.items();
    return {
      all: list.length,
      weather: list.filter(n => n.notificationType === 'WEATHER').length,
      market: list.filter(n => n.notificationType === 'PRICE').length,
      task: list.filter(n => n.notificationType === 'TASK').length,
      marketplace: list.filter(n => n.notificationType === 'MARKETPLACE').length,
      system: list.filter(n => n.notificationType === 'SYSTEM').length,
      unread: list.filter(n => !n.read).length
    };
  });

  ngOnInit(): void {
    this.loadNotifications();
    this.loadPreferences();
  }

  loadNotifications(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      this.items.set([]);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.api.getPage<any>(`/api/notifications/${userId}`).subscribe({
      next: (p: PageResponse<any>) => {
        const backendItems = (p.content || []).map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          notificationType: this.normalizeNotificationType(n.notificationType, n.title, n.message),
          read: n.read,
          actionUrl: n.actionUrl || '',
          timeAgo: n.createdAt ? this.formatTime(n.createdAt) : 'Recently'
        }));

        this.items.set(backendItems);
        this.loading.set(false);
      },
      error: () => {
        this.items.set([]);
        this.loading.set(false);
      }
    });
  }

  loadPreferences(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    this.api.get<any>('/api/notifications/preferences').subscribe({
      next: (prefs) => {
        if (prefs) {
          this.preferences.set({
            emailAlerts: prefs.emailAlerts ?? true,
            smsAlerts: prefs.smsAlerts ?? true,
            whatsappAlerts: prefs.whatsappAlerts ?? false,
            weatherWarnings: prefs.weatherWarnings ?? true,
            priceSurges: prefs.priceSurges ?? true,
            taskReminders: prefs.taskReminders ?? true
          });
        }
      }
    });
  }

  normalizeNotificationType(type: string, title: string, message: string): string {
    const rawType = (type || 'GENERAL').toUpperCase();
    const cleanTitle = (title || '').toLowerCase();
    const cleanMsg = (message || '').toLowerCase();

    if (rawType === 'WEATHER' || rawType === 'PEST_ALERT' || cleanTitle.includes('weather') || cleanTitle.includes('rain') || cleanTitle.includes('storm')) {
      return 'WEATHER';
    }

    if (rawType === 'PRICE_ALERT' || rawType === 'PRICE' || cleanTitle.includes('price') || cleanTitle.includes('mandi') || cleanTitle.includes('rate') || cleanTitle.includes('quintal')) {
      return 'PRICE';
    }

    if (rawType === 'TASK_REMINDER' || rawType === 'HARVEST_REMINDER' || rawType === 'TASK' || cleanTitle.includes('water slot') || cleanTitle.includes('canal') || cleanTitle.includes('slot') || cleanTitle.includes('calendar') || cleanTitle.includes('fertilizer') || cleanTitle.includes('sow') || cleanTitle.includes('irrigation')) {
      return 'TASK';
    }

    if (rawType === 'MARKETPLACE' || cleanTitle.includes('booking') || cleanTitle.includes('labor') || cleanTitle.includes('job') || cleanTitle.includes('tractor') || cleanMsg.includes('rent') || cleanMsg.includes('lease') || cleanMsg.includes('tractor') || cleanMsg.includes('booking') || cleanMsg.includes('machinery')) {
      return 'MARKETPLACE';
    }

    if (rawType === 'COMMUNITY' || cleanTitle.includes('reply') || cleanTitle.includes('forum') || cleanTitle.includes('comment') || cleanTitle.includes('chaupal')) {
      return 'COMMUNITY';
    }

    if (rawType === 'SCHEME_DEADLINE' || rawType === 'INSURANCE' || rawType === 'GENERAL' || rawType === 'SYSTEM') {
      return 'SYSTEM';
    }

    return rawType;
  }

  markRead(id: number): void {
    this.items.update(list =>
      list.map(n => (n.id === id ? { ...n, read: true } : n))
    );

    this.api.put(`/api/notifications/${id}/read`, {}).subscribe({
      next: () => {
        this.toastr.success('Notification marked as read');
      }
    });
  }

  markAllRead(): void {
    const userId = this.auth.currentUser()?.id ?? 1;

    this.items.update(list =>
      list.map(n => ({ ...n, read: true }))
    );

    this.api.put(`/api/notifications/read-all?userId=${userId}`, {}).subscribe({
      next: () => {
        this.toastr.success('All notifications marked as read');
      }
    });
  }

  deleteNotification(id: number, event: MouseEvent): void {
    event.stopPropagation();

    this.items.update(list => list.filter(n => n.id !== id));

    this.api.delete(`/api/notifications/${id}`).subscribe({
      next: () => {
        this.toastr.info('Notification deleted');
      }
    });
  }

  setChannel(channel: 'all' | 'weather' | 'market' | 'task' | 'marketplace' | 'system' | 'preferences'): void {
    this.activeChannel.set(channel);
    if (channel === 'preferences') {
      this.loadPreferences();
    }
  }

  updateSearch(e: Event): void {
    const val = (e.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  togglePref(key: 'emailAlerts' | 'smsAlerts' | 'whatsappAlerts' | 'weatherWarnings' | 'priceSurges' | 'taskReminders'): void {
    this.preferences.update(p => ({
      ...p,
      [key]: !p[key]
    }));
  }

  savePrefs(): void {
    this.api.post('/api/notifications/preferences', this.preferences()).subscribe({
      next: () => {
        this.toastr.success('Alert settings saved successfully');
      },
      error: () => {
        this.toastr.error('Failed to save alert settings');
      }
    });
  }

  private formatTime(createdAtStr: string): string {
    try {
      const created = new Date(createdAtStr);
      const diffMs = new Date().getTime() - created.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) return `${diffMins} mins ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${Math.floor(diffHours / 24)} days ago`;
    } catch {
      return 'Recently';
    }
  }
}
