import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

interface WaterSource {
  id: number;
  name: string;
  type: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

interface WaterBooking {
  id: number;
  farmerId: number;
  farmerName: string;
  waterSourceId: number;
  waterSourceName: string;
  waterSourceType: string;
  hoursRequested: number;
  bookingDate: string;
  status: string;
  queuePosition?: number;
  scheduledStartTime?: string;
  weatherWarning: boolean;
  weatherRainChance?: number;
  notes?: string;
  createdAt?: string;
}

@Component({
  selector: 'fs-water-queue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './water-queue.component.html',
  styleUrl: './water-queue.component.scss'
})
export class WaterQueueComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly i18n = inject(I18nService);
  readonly theme = inject(ThemeService);
  readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  // Tabs: 'book' | 'my' | 'live'
  readonly activeTab = signal<'book' | 'my' | 'live'>('book');

  // Signals for data
  readonly sources = signal<WaterSource[]>([]);
  readonly myBookings = signal<WaterBooking[]>([]);
  readonly liveQueue = signal<WaterBooking[]>([]);

  // Selected parameters for Live Queue view
  readonly selectedLiveSourceId = signal<number | null>(null);
  readonly selectedLiveDate = signal<string>(new Date().toISOString().split('T')[0]);

  // Loading states
  readonly loading = signal(false);
  readonly successMsg = signal<string | null>(null);
  readonly errorMsg = signal<string | null>(null);

  // Form
  bookingForm!: FormGroup;

  // Weather check intervention response
  readonly weatherWarning = signal<{
    hasWarning: boolean;
    rainMm: number;
    rainChance: number;
    warningMessage: string;
  } | null>(null);

  // Pending data to proceed if user chooses to bypass warning
  pendingBookingPayload: any = null;

  ngOnInit(): void {
    this.initForm();
    this.loadSources();
    this.loadMyBookings();
  }

  private initForm(): void {
    this.bookingForm = this.fb.group({
      waterSourceId: ['', Validators.required],
      bookingDate: [new Date().toISOString().split('T')[0], Validators.required],
      hoursRequested: [2.0, [Validators.required, Validators.min(0.5), Validators.max(24)]],
      notes: ['']
    });
  }

  loadSources(): void {
    this.api.get<WaterSource[]>('/api/water-queue/sources').subscribe({
      next: (data) => {
        this.sources.set(data);
        if (data.length > 0) {
          this.selectedLiveSourceId.set(data[0].id);
          this.loadLiveQueue();
        }
      },
      error: () => this.errorMsg.set('Failed to load community water sources')
    });
  }

  loadMyBookings(): void {
    this.api.get<WaterBooking[]>('/api/water-queue/bookings').subscribe({
      next: (data) => this.myBookings.set(data),
      error: () => this.errorMsg.set('Failed to load your water bookings')
    });
  }

  loadLiveQueue(): void {
    const sourceId = this.selectedLiveSourceId();
    const date = this.selectedLiveDate();
    if (!sourceId || !date) return;

    this.api.get<WaterBooking[]>('/api/water-queue/bookings/queue', { waterSourceId: sourceId, date }).subscribe({
      next: (data) => this.liveQueue.set(data),
      error: () => this.errorMsg.set('Failed to load live queue timeline')
    });
  }

  onTabChange(tab: 'book' | 'my' | 'live'): void {
    this.activeTab.set(tab);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    this.weatherWarning.set(null);

    if (tab === 'my') {
      this.loadMyBookings();
    } else if (tab === 'live') {
      this.loadLiveQueue();
    }
  }

  onCheckBooking(): void {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const payload = this.bookingForm.value;
    this.loading.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);
    this.weatherWarning.set(null);

    this.api.post<{
      hasWarning: boolean;
      rainMm: number;
      rainChance: number;
      warningMessage: string;
    }>('/api/water-queue/bookings/check', {
      waterSourceId: payload.waterSourceId,
      bookingDate: payload.bookingDate,
      hoursRequested: payload.hoursRequested
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.hasWarning) {
          this.weatherWarning.set(res);
          this.pendingBookingPayload = { ...payload, bypassWarning: true };
        } else {
          // Direct submission since no warning
          this.submitBooking(payload, false);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.message || 'Error checking weather advisory');
      }
    });
  }

  submitBooking(formValue: any, bypass: boolean): void {
    this.loading.set(true);
    this.api.post<any>('/api/water-queue/bookings', {
      waterSourceId: formValue.waterSourceId,
      bookingDate: formValue.bookingDate,
      hoursRequested: formValue.hoursRequested,
      notes: formValue.notes,
      bypassWarning: bypass
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.weatherWarning.set(null);
        this.pendingBookingPayload = null;

        if (res.status === 'SUCCESS') {
          this.successMsg.set(this.i18n.t('waterQueue.successMsg'));
          this.bookingForm.patchValue({
            notes: '',
            hoursRequested: 2.0
          });
          this.loadMyBookings();
          // Auto switch to My Slots tab after 1.5 seconds
          setTimeout(() => {
            this.onTabChange('my');
          }, 1500);
        } else if (res.status === 'WARNING') {
          this.weatherWarning.set(res.warning);
          this.pendingBookingPayload = { ...formValue, bypassWarning: true };
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.message || 'Failed to submit booking request');
      }
    });
  }

  proceedWithBypass(): void {
    if (this.pendingBookingPayload) {
      this.submitBooking(this.pendingBookingPayload, true);
    }
  }

  cancelBypass(): void {
    this.weatherWarning.set(null);
    this.pendingBookingPayload = null;
  }

  onCancelBooking(bookingId: number): void {
    if (!confirm('Are you sure you want to cancel this booking slot?')) return;

    this.loading.set(true);
    this.api.put<any>(`/api/water-queue/bookings/${bookingId}/cancel`, {}).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('Booking slot cancelled successfully');
        this.loadMyBookings();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.message || 'Failed to cancel booking slot');
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  formatTime(dateTimeStr?: string): string {
    if (!dateTimeStr) return 'Not Scheduled';
    try {
      const d = new Date(dateTimeStr);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateTimeStr;
    }
  }

  getStatusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50';
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400';
    }
  }
}
