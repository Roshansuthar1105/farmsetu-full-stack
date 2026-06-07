import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-crop-calendar',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <fs-page-header title="Crop Calendar" subtitle="Plan sowing, irrigation & harvest" />
    @for (cal of calendars(); track cal.id) {
      <div class="fs-card mb-4">
        <div class="flex justify-between">
          <span class="font-semibold">{{ cal.season }} {{ cal.year }}</span>
          <span class="text-sm text-gray-500">{{ cal.status }}</span>
        </div>
        <p class="text-sm mt-2">Plant: {{ cal.plantingDate }} · Harvest: {{ cal.expectedHarvestDate }}</p>
      </div>
    } @empty {
      <p class="text-gray-500">No calendars yet. Create one from the API.</p>
    }
  `
})
export class CropCalendarComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly calendars = signal<any[]>([]);

  ngOnInit(): void {
    const id = this.auth.currentUser()?.id ?? 1;
    this.api.get<any[]>(`/api/calendar/${id}`).subscribe({
      next: (d) => this.calendars.set(d)
    });
  }
}
