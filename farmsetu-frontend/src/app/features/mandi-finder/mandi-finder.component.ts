import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-mandi-finder',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent],
  template: `
    <fs-page-header title="Mandi Finder" subtitle="Nearest mandis within 50km" />
    <form class="flex flex-wrap gap-2 mb-4" [formGroup]="form" (ngSubmit)="search()">
      <input formControlName="lat" type="number" step="0.0001" placeholder="Latitude" class="border rounded-lg px-3 py-2 dark:bg-gray-700" />
      <input formControlName="lng" type="number" step="0.0001" placeholder="Longitude" class="border rounded-lg px-3 py-2 dark:bg-gray-700" />
      <button type="submit" class="fs-btn-primary">Search</button>
    </form>
    <div class="fs-card h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 mb-4">
      Google Maps integration — add API key in your config
    </div>
    @for (m of mandis(); track m.id) {
      <div class="fs-card mb-3">
        <h3 class="font-semibold">{{ m.name }}</h3>
        <p class="text-sm text-gray-500">{{ m.district }}, {{ m.state }}</p>
        <p class="text-sm mt-1">{{ m.operatingHours }} · {{ m.contactPhone }}</p>
      </div>
    }
  `
})
export class MandiFinderComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly mandis = signal<any[]>([]);
  readonly form = this.fb.group({ lat: [28.6139], lng: [77.209], radiusKm: [50] });

  ngOnInit(): void {
    this.search();
  }

  search(): void {
    const v = this.form.getRawValue();
    this.api.get<any[]>('/api/mandis/nearby', {
      lat: v.lat!,
      lng: v.lng!,
      radiusKm: v.radiusKm ?? 50
    }).subscribe({ next: (d) => this.mandis.set(d) });
  }
}
