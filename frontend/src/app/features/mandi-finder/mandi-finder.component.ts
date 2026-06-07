import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-mandi-finder',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PageHeaderComponent],
  template: `
    <fs-page-header title="Mandi Finder" subtitle="Find local crop markets and prices" />
    
    <div class="max-w-4xl mx-auto space-y-6">
      
      <!-- Finder Form -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
          <span>🔍</span> Find Nearest Mandi
        </h3>
        
        <form class="grid sm:grid-cols-4 gap-3" [formGroup]="form" (ngSubmit)="searchNearby()">
          <div class="sm:col-span-1">
            <input formControlName="lat" type="number" step="0.0001" placeholder="Latitude" class="w-full border rounded-xl px-4 py-2.5 dark:bg-gray-700 outline-none text-xs focus:border-green-500" />
          </div>
          <div class="sm:col-span-1">
            <input formControlName="lng" type="number" step="0.0001" placeholder="Longitude" class="w-full border rounded-xl px-4 py-2.5 dark:bg-gray-700 outline-none text-xs focus:border-green-500" />
          </div>
          <div class="sm:col-span-1">
            <input formControlName="radiusKm" type="number" placeholder="Radius (Km)" class="w-full border rounded-xl px-4 py-2.5 dark:bg-gray-700 outline-none text-xs focus:border-green-500" />
          </div>
          <div class="sm:col-span-1">
            <button type="submit" class="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-md shadow-green-500/20 active:scale-[0.98] transition text-xs">
              Search Nearby
            </button>
          </div>
        </form>
        
        <div class="mt-4 flex gap-2">
          <button (click)="loadAllMandis()" class="px-4 py-2 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 rounded-xl hover:bg-green-100 transition">
            Show All Mandis
          </button>
        </div>
      </div>

      <!-- Mandi List -->
      <div class="space-y-4">
        <h3 class="text-sm font-bold text-gray-900 dark:text-white">
          {{ listTitle() }} ({{ mandis().length }})
        </h3>
        
        <div class="grid sm:grid-cols-2 gap-4">
          @for (m of mandis(); track m.id) {
            <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition space-y-3">
              <div>
                <h4 class="font-bold text-gray-900 dark:text-white">{{ m.name }}</h4>
                <p class="text-xs text-gray-400">📍 {{ m.district }}, {{ m.state }}</p>
              </div>
              <div class="border-t border-gray-50 dark:border-gray-700/50 pt-2 text-xs space-y-1 text-gray-500 dark:text-gray-400">
                <p class="flex justify-between"><span>🕒 Timing</span> <span class="font-semibold">{{ m.operatingHours || '09:00 AM - 05:00 PM' }}</span></p>
                <p class="flex justify-between"><span>📞 Contact</span> <span class="font-semibold">{{ m.contactPhone || '—' }}</span></p>
              </div>
            </div>
          } @empty {
            <div class="sm:col-span-2 bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center text-gray-400">
              <span class="text-2xl block mb-1">🏪</span>
              <p class="text-xs">No mandis found matching the criteria.</p>
            </div>
          }
        </div>
      </div>
      
    </div>
  `
})
export class MandiFinderComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  
  readonly mandis = signal<any[]>([]);
  readonly listTitle = signal('All Available Mandis');
  
  readonly form = this.fb.group({
    lat: [28.6139],
    lng: [77.209],
    radiusKm: [50]
  });

  ngOnInit(): void {
    this.loadAllMandis();
  }

  loadAllMandis(): void {
    this.listTitle.set('All Available Mandis');
    this.api.get<any[]>('/api/mandis').subscribe({
      next: (d) => this.mandis.set(d)
    });
  }

  searchNearby(): void {
    const v = this.form.getRawValue();
    this.listTitle.set(`Mandis near (${v.lat}, ${v.lng})`);
    this.api.get<any[]>('/api/mandis/nearby', {
      lat: v.lat!,
      lng: v.lng!,
      radiusKm: v.radiusKm ?? 50
    }).subscribe({
      next: (d) => this.mandis.set(d)
    });
  }
}
