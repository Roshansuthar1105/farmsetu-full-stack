import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { I18nService } from '../../core/services/i18n.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-mandi-finder',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, PageHeaderComponent],
  template: `
    <div class="space-y-6 animate-slide-up">
      
      <!-- HEADER -->
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex justify-between items-center">
        <div>
          <h1 class="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <span class="material-icons text-green-600 dark:text-green-400">travel_explore</span>
            {{ i18n.t('mandiFinder.title') }}
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {{ i18n.t('mandiFinder.subtitle') }}
          </p>
        </div>
      </div>

      <!-- Finder Form -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 class="font-extrabold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2 text-xs uppercase tracking-wider">
          <span class="material-icons text-sm">my_location</span>
          {{ i18n.t('mandiFinder.findNearest') }}
        </h3>
        
        <form class="grid grid-cols-1 sm:grid-cols-4 gap-4" [formGroup]="form" (ngSubmit)="searchNearby()">
          <div>
            <label class="block text-[9px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase">{{ i18n.t('mandiFinder.latitude') }}</label>
            <input formControlName="lat" type="number" step="0.0001" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none text-xs font-bold text-gray-900 dark:text-white focus:border-green-500 transition" />
          </div>
          <div>
            <label class="block text-[9px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase">{{ i18n.t('mandiFinder.longitude') }}</label>
            <input formControlName="lng" type="number" step="0.0001" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none text-xs font-bold text-gray-900 dark:text-white focus:border-green-500 transition" />
          </div>
          <div>
            <label class="block text-[9px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase">{{ i18n.t('mandiFinder.radius') }}</label>
            <input formControlName="radiusKm" type="number" class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 outline-none text-xs font-bold text-gray-900 dark:text-white focus:border-green-500 transition" />
          </div>
          <div class="flex items-end">
            <button type="submit" class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-lg shadow-md active:scale-[0.98] transition text-xs flex items-center justify-center gap-1">
              <span class="material-icons text-sm">search</span>
              {{ i18n.t('mandiFinder.searchNearby') }}
            </button>
          </div>
        </form>
        
        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
          <button (click)="loadAllMandis()" class="px-4 py-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 transition flex items-center gap-1.5">
            <span class="material-icons text-sm">list_alt</span>
            {{ i18n.t('mandiFinder.showAll') }}
          </button>
        </div>
      </div>

      <!-- Mandi List -->
      <div class="space-y-4">
        <h3 class="text-sm font-extrabold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-2">
          <span class="material-icons text-sm">storefront</span>
          {{ listTitle() }} ({{ mandis().length }})
        </h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (m of mandis(); track m.id) {
            <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-500/30 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 transition hover:shadow-md">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-extrabold text-gray-900 dark:text-white text-sm">{{ m.name }}</h4>
                  <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <span class="material-icons text-xs text-gray-400">place</span>
                    {{ m.district }}, {{ m.state }}
                  </p>
                </div>
                
                <!-- Distance Badge -->
                @if (getSearchCoords(); as coords) {
                  <span class="text-[9px] font-black bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-blue-200 dark:border-blue-500/20">
                    <span class="material-icons text-[9px]">near_me</span>
                    {{ calculateDistance(coords.lat, coords.lng, m.latitude, m.longitude) }} km
                  </span>
                }
              </div>

              @if (m.address) {
                <p class="text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                  "{{ m.address }}"
                </p>
              }

              <div class="border-t border-gray-100 dark:border-gray-700 pt-3 text-[10px] space-y-1.5 text-gray-500 dark:text-gray-400">
                <p class="flex justify-between items-center">
                  <span class="flex items-center gap-1 text-gray-400 dark:text-gray-500 uppercase font-bold">
                    <span class="material-icons text-xs">schedule</span>
                    {{ i18n.t('mandiFinder.operatingHours') }}
                  </span> 
                  <span class="font-bold text-gray-900 dark:text-white">{{ m.operatingHours || '09:00 AM - 05:00 PM' }}</span>
                </p>
                <p class="flex justify-between items-center">
                  <span class="flex items-center gap-1 text-gray-400 dark:text-gray-500 uppercase font-bold">
                    <span class="material-icons text-xs">phone</span>
                    {{ i18n.t('mandiFinder.contact') }}
                  </span> 
                  <span class="font-bold text-gray-900 dark:text-white">{{ m.contactPhone || '—' }}</span>
                </p>
              </div>
            </div>
          } @empty {
            <div class="md:col-span-2 bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center text-gray-400 dark:text-gray-500 flex flex-col items-center justify-center space-y-2">
              <span class="material-icons text-3xl text-gray-300 dark:text-gray-600">sentiment_dissatisfied</span>
              <p class="text-xs font-bold">{{ i18n.t('mandiFinder.noMandis') }}</p>
            </div>
          }
        </div>
      </div>
      
    </div>
  `,
  styleUrls: ['./mandi-finder.component.scss']
})
export class MandiFinderComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly i18n = inject(I18nService);
  
  readonly mandis = signal<any[]>([]);
  readonly listTitle = signal('All Available Mandis');
  
  readonly form = this.fb.group({
    lat: [28.6139],
    lng: [77.209],
    radiusKm: [50]
  });

  // Keep track of search center to display distance dynamically
  readonly searchCenter = signal<{ lat: number; lng: number } | null>(null);

  ngOnInit(): void {
    this.loadAllMandis();
  }

  loadAllMandis(): void {
    this.listTitle.set('All Available Mandis');
    this.searchCenter.set(null);
    this.api.get<any[]>('/api/mandis').subscribe({
      next: (d) => this.mandis.set(d)
    });
  }

  searchNearby(): void {
    const v = this.form.getRawValue();
    this.listTitle.set(`Mandis near (${v.lat}, ${v.lng})`);
    this.searchCenter.set({ lat: v.lat!, lng: v.lng! });
    this.api.get<any[]>('/api/mandis/nearby', {
      lat: v.lat!,
      lng: v.lng!,
      radiusKm: v.radiusKm ?? 50
    }).subscribe({
      next: (d) => this.mandis.set(d)
    });
  }

  getSearchCoords() {
    return this.searchCenter();
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }
}
