import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

interface WaterSource {
  id: number;
  name: string;
  type: string;
  location: string;
  latitude?: number;
  longitude?: number;
  flowRateLph?: number;
  status: string;
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
  preferredTime?: string;
  waterSuppliedLiters?: number;
  notes?: string;
  createdAt?: string;
}

@Component({
  selector: 'fs-admin-water-queue',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-water-queue.component.html',
  styleUrl: './admin-water-queue.component.scss'
})
export class AdminWaterQueueComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);

  // Tabs: 'requests' | 'sources'
  readonly activeTab = signal<'requests' | 'sources'>('requests');

  // Signals
  readonly bookings = signal<WaterBooking[]>([]);
  readonly sources = signal<WaterSource[]>([]);
  readonly stagedSources = signal<any[]>([]);
  readonly selectedSourceIds = signal<Set<number>>(new Set());

  readonly loading = signal(false);
  readonly uploadingStaged = signal(false);
  readonly deletingBatch = signal(false);

  // Form for new water source
  sourceForm!: FormGroup;
  showAddSourceForm = signal(false);
  editingSourceId = signal<number | null>(null);

  // Generator parameters
  genCount = 5;
  genType = 'Tube-well';
  jsonInput = '';

  readonly totalWaterSupplied = computed(() => {
    return this.bookings()
      .filter(b => b.status === 'COMPLETED' || b.status === 'APPROVED')
      .reduce((acc, b) => acc + (b.waterSuppliedLiters || 0), 0);
  });

  readonly pendingRequestsCount = computed(() => {
    return this.bookings().filter(b => b.status === 'PENDING').length;
  });

  readonly activeSourcesCount = computed(() => {
    return this.sources().filter(s => s.status === 'ACTIVE').length;
  });

  ngOnInit(): void {
    this.initForm();
    this.loadBookings();
    this.loadSources();
  }

  private initForm(): void {
    this.sourceForm = this.fb.group({
      name: ['', Validators.required],
      type: ['Borewell', Validators.required],
      location: ['', Validators.required],
      latitude: [26.8809, Validators.required],
      longitude: [75.7590, Validators.required],
      flowRateLph: [15000, [Validators.required, Validators.min(100)]]
    });
  }

  loadBookings(): void {
    this.loading.set(true);
    this.api.get<WaterBooking[]>('/api/admin/water-queue/bookings').subscribe({
      next: (res) => {
        this.bookings.set(res || []);
        this.loading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load bookings');
        this.loading.set(false);
      }
    });
  }

  loadSources(): void {
    this.api.get<WaterSource[]>('/api/admin/water-queue/sources').subscribe({
      next: (res) => this.sources.set(res || []),
      error: () => this.toastr.error('Failed to load water sources')
    });
  }

  onTabChange(tab: 'requests' | 'sources'): void {
    this.activeTab.set(tab);
    if (tab === 'requests') {
      this.loadBookings();
    } else {
      this.loadSources();
    }
  }

  updateBookingStatus(id: number, status: string): void {
    this.loading.set(true);
    this.api.put<any>(`/api/admin/water-queue/bookings/${id}/status?status=${status}`, null).subscribe({
      next: () => {
        this.toastr.success(`Slot successfully marked as ${status.toUpperCase()}`);
        this.loadBookings();
      },
      error: (err) => {
        this.toastr.error(err.message || 'Failed to update booking status');
        this.loading.set(false);
      }
    });
  }

  // --- WATER SOURCES DUMMY GENERATOR & BULK UPLOAD ---
  generateDummyWaterSources(): void {
    const types = ['Borewell', 'Tube-well', 'Canal', 'Pond', 'Solar Pump', 'River Lift'];
    const locations = [
      'Chomu Irrigation Zone A, Jaipur',
      'Muhana Mandi Ground, Jaipur',
      'Sikar Road Agro Cluster',
      'Bassi Shared Reservoir',
      'Noida Sector 62 Farm Canal',
      'Faridabad NIT Irrigation Tube',
      'Bhopal Karond Shared Pump'
    ];

    const count = Math.max(1, Math.min(50, this.genCount));
    const newItems: any[] = [];

    for (let i = 0; i < count; i++) {
      const type = this.genType || types[Math.floor(Math.random() * types.length)];
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const name = `${loc.split(',')[0]} ${type} ${Math.floor(Math.random() * 89) + 10}`;

      const lat = 26.8 + (Math.random() - 0.5) * 2;
      const lng = 75.7 + (Math.random() - 0.5) * 2;
      const flowRate = (Math.floor(Math.random() * 20) + 10) * 1000;

      newItems.push({
        id: 'staged_ws_' + Math.random().toString(36).substr(2, 8),
        name: name,
        type: type,
        location: loc,
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        flowRateLph: flowRate,
        status: 'ACTIVE'
      });
    }

    this.stagedSources.update(curr => [...curr, ...newItems]);
    this.toastr.success(`Generated ${count} Water Sources into Staging Table`, 'Staging Ready');
  }

  parseJsonSourcesToStaging(): void {
    try {
      const parsed = JSON.parse(this.jsonInput);
      if (!Array.isArray(parsed)) throw new Error('JSON root must be an array [ ... ]');

      const items = parsed.map((item: any, idx: number) => ({
        id: 'staged_json_ws_' + idx + '_' + Date.now(),
        name: item.name || 'Water Source ' + (idx + 1),
        type: item.type || 'Tube-well',
        location: item.location || 'Community Zone',
        latitude: Number(item.latitude || 26.88),
        longitude: Number(item.longitude || 75.75),
        flowRateLph: Number(item.flowRateLph || 15000),
        status: 'ACTIVE'
      }));

      this.stagedSources.update(curr => [...curr, ...items]);
      this.jsonInput = '';
      this.toastr.success(`Parsed ${items.length} water sources to staging`, 'Success');
    } catch (e: any) {
      this.toastr.error('JSON Error: ' + e.message, 'Parse Failed');
    }
  }

  removeStagedSource(id: string): void {
    this.stagedSources.update(items => items.filter(i => i.id !== id));
  }

  commitStagedSourcesToDb(): void {
    const items = this.stagedSources();
    if (items.length === 0) return;

    this.uploadingStaged.set(true);
    this.api.post<WaterSource[]>('/api/admin/water-queue/sources/bulk', items).subscribe({
      next: (res) => {
        this.toastr.success(`Successfully saved ${res.length} Water Sources to Database!`, 'Complete');
        this.stagedSources.set([]);
        this.loadSources();
        this.uploadingStaged.set(false);
      },
      error: (err) => {
        this.toastr.error('Failed to save water sources', 'Error');
        this.uploadingStaged.set(false);
      }
    });
  }

  // --- MULTI SELECT & BATCH DELETE FOR SOURCES ---
  isSourceSelected(id: number): boolean {
    return this.selectedSourceIds().has(id);
  }

  toggleSelectSource(id: number): void {
    const set = new Set(this.selectedSourceIds());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedSourceIds.set(set);
  }

  isAllSourcesSelected(): boolean {
    const visible = this.sources();
    if (visible.length === 0) return false;
    return visible.every(s => this.selectedSourceIds().has(s.id));
  }

  toggleSelectAllSources(event: any): void {
    const checked = event.target.checked;
    const set = new Set(this.selectedSourceIds());
    const visible = this.sources();
    if (checked) visible.forEach(s => set.add(s.id));
    else visible.forEach(s => set.delete(s.id));
    this.selectedSourceIds.set(set);
  }

  onDeleteSelectedSourcesBatch(): void {
    const ids = Array.from(this.selectedSourceIds());
    if (ids.length === 0) return;

    if (confirm(`Delete ${ids.length} selected Water Sources?`)) {
      this.deletingBatch.set(true);
      this.api.delete('/api/admin/water-queue/sources/batch', ids).subscribe({
        next: () => {
          this.toastr.success(`Successfully deleted ${ids.length} Water Sources`);
          this.selectedSourceIds.set(new Set());
          this.loadSources();
          this.deletingBatch.set(false);
        },
        error: () => {
          this.toastr.error('Failed to delete selected water sources');
          this.deletingBatch.set(false);
        }
      });
    }
  }

  // --- SINGLE SOURCE CRUD ---
  onSaveSource(): void {
    if (this.sourceForm.invalid) {
      this.sourceForm.markAllAsTouched();
      return;
    }

    const payload = this.sourceForm.value;
    const editingId = this.editingSourceId();

    if (editingId) {
      this.api.put<WaterSource>(`/api/admin/water-queue/sources/${editingId}`, payload).subscribe({
        next: () => {
          this.toastr.success('Water source updated successfully');
          this.sourceForm.reset({ type: 'Borewell', latitude: 26.8809, longitude: 75.7590, flowRateLph: 15000 });
          this.showAddSourceForm.set(false);
          this.editingSourceId.set(null);
          this.loadSources();
        },
        error: () => this.toastr.error('Failed to update water source')
      });
    } else {
      this.api.post<WaterSource>('/api/admin/water-queue/sources', payload).subscribe({
        next: () => {
          this.toastr.success('Water source created successfully');
          this.sourceForm.reset({ type: 'Borewell', latitude: 26.8809, longitude: 75.7590, flowRateLph: 15000 });
          this.showAddSourceForm.set(false);
          this.loadSources();
        },
        error: () => this.toastr.error('Failed to create water source')
      });
    }
  }

  onEditSource(source: WaterSource): void {
    this.editingSourceId.set(source.id);
    this.sourceForm.patchValue({
      name: source.name,
      type: source.type,
      location: source.location,
      latitude: source.latitude || 26.8809,
      longitude: source.longitude || 75.7590,
      flowRateLph: source.flowRateLph || 15000
    });
    this.showAddSourceForm.set(true);
  }

  toggleSourceStatus(source: WaterSource): void {
    const nextStatus = source.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
    this.api.put<WaterSource>(`/api/admin/water-queue/sources/${source.id}`, { status: nextStatus }).subscribe({
      next: () => {
        this.toastr.success(`Water source status updated to ${nextStatus}`);
        this.loadSources();
      },
      error: () => this.toastr.error('Failed to toggle status')
    });
  }

  onDeleteSource(id: number): void {
    if (!confirm('Are you sure you want to delete this water source?')) return;

    this.api.delete<void>(`/api/admin/water-queue/sources/${id}`).subscribe({
      next: () => {
        this.toastr.success('Water source deleted successfully');
        this.loadSources();
      },
      error: () => this.toastr.error('Failed to delete water source')
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
