import { Injectable, inject, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export interface ActivityLog {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly toastr = inject(ToastrService);
  readonly activities = signal<ActivityLog[]>([]);

  success(message: string, title?: string): void {
    this.toastr.success(message, title);
    this.log(message, 'success');
  }

  error(message: string, title?: string): void {
    this.toastr.error(message, title);
    this.log(message, 'error');
  }

  warning(message: string, title?: string): void {
    this.toastr.warning(message, title);
    this.log(message, 'warning');
  }

  info(message: string, title?: string): void {
    this.toastr.info(message, title);
    this.log(message, 'info');
  }

  private log(message: string, type: ActivityLog['type']): void {
    const newLog: ActivityLog = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: new Date()
    };
    this.activities.update(list => [newLog, ...list]);
  }
}
