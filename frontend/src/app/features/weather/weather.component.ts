import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastrService } from 'ngx-toastr';

interface CurrentWeather {
  source: string;
  lat: number;
  lng: number;
  city: string;
  temp: number;
  humidity: number;
  description: string;
}

interface ForecastDay {
  day: number;
  date?: string;
  tempMax: number;
  tempMin: number;
  rainMm: number;
}

@Component({
  selector: 'fs-weather',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="min-h-screen bg-[#0f172a] text-gray-100 p-6 font-sans">
      <div class="max-w-5xl mx-auto space-y-6">
        
        <!-- Page Header -->
        <fs-page-header title="Meteorological Center" subtitle="Dynamic coordinates geolocation & agricultural advisory" />

        <!-- SEARCH BAR CONTROLS -->
        <div class="bg-[#1e293b]/40 p-5 rounded-3xl border border-gray-800 backdrop-blur-md flex flex-col sm:flex-row gap-3">
          <div class="relative flex-1">
            <span class="material-icons absolute left-3 top-2.5 text-gray-500 text-sm">search</span>
            <input 
              type="text" 
              [(ngModel)]="searchCity" 
              (keyup.enter)="search()" 
              placeholder="Search City or District (e.g. Ludhiana, Jaipur, Delhi)..." 
              class="w-full bg-[#0f172a]/80 border border-gray-750 text-xs text-white rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-green-500 transition"
            >
          </div>
          <div class="flex gap-2">
            <button 
              (click)="search()" 
              type="button" 
              class="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-green-500/10 transition active:scale-95"
            >
              Search
            </button>
            <button 
              (click)="detectLocationAndFetch()" 
              type="button" 
              class="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-bold text-xs px-4 py-2.5 rounded-xl transition active:scale-95 flex items-center gap-1.5"
              title="Detect Location"
            >
              <span class="material-icons text-sm">my_location</span>
              GPS
            </button>
          </div>
        </div>

        @if (current()) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- LEFT COLUMN: CURRENT WEATHER -->
            <div class="lg:col-span-1 space-y-6">
              
              <!-- Current weather card -->
              <div class="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-80 border border-blue-400/20">
                <div class="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-36 h-36 bg-white/10 rounded-full blur-2xl"></div>
                
                <div class="flex justify-between items-start relative z-10">
                  <div class="space-y-1">
                    <span class="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">Current Weather</span>
                    <h3 class="text-base font-extrabold pt-2">{{ current()?.city }}</h3>
                    <p class="text-[10px] opacity-75">GPS: {{ current()?.lat | number:'1.2-2' }}, {{ current()?.lng | number:'1.2-2' }}</p>
                  </div>
                  
                  <!-- Save location "+" button -->
                  @if (isNotFound()) {
                    <span class="bg-red-500/30 text-red-300 p-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider">Not Found</span>
                  } @else if (!isCurrentSaved()) {
                    <button 
                      (click)="saveLocation()" 
                      type="button" 
                      class="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition active:scale-90 flex items-center justify-center"
                      title="Save this location"
                    >
                      <span class="material-icons text-sm">add</span>
                    </button>
                  } @else {
                    <span class="bg-green-500/30 text-green-300 p-1.5 rounded-xl text-[9px] font-bold uppercase tracking-wider">Saved</span>
                  }
                </div>
                
                <div class="space-y-2 relative z-10">
                  <div class="flex items-center gap-3">
                    <span class="text-5xl font-black">{{ current()?.temp }}°C</span>
                    <span class="text-4xl">{{ getWeatherIcon(current()?.description || '') }}</span>
                  </div>
                  <p class="text-xs font-bold capitalize tracking-wide">{{ current()?.description }}</p>
                </div>
                
                <div class="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 relative z-10 text-xs">
                  <div>
                    <span class="block opacity-75 text-[9px] uppercase tracking-wider">Humidity</span>
                    <span class="font-bold text-sm">{{ current()?.humidity }}%</span>
                  </div>
                  <div>
                    <span class="block opacity-75 text-[9px] uppercase tracking-wider">Source</span>
                    <span class="font-bold text-sm">{{ current()?.source }}</span>
                  </div>
                </div>
              </div>

              <!-- SAVED LOCATIONS LIST -->
              <div class="bg-[#1e293b]/40 border border-gray-800 rounded-3xl p-5 shadow-sm space-y-4">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Saved Locations</h3>
                
                @if (savedLocations().length === 0) {
                  <p class="text-[10px] text-gray-500 italic">No locations saved yet. Search and click "+" to save.</p>
                } @else {
                  <div class="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                    @for (loc of savedLocations(); track loc.storedName) {
                      <div 
                        (click)="selectSavedLocation(loc.storedName)"
                        class="flex justify-between items-center p-3 bg-[#1e293b]/60 border border-gray-800/80 hover:border-gray-700 rounded-2xl cursor-pointer transition active:scale-[0.98]"
                      >
                        <div class="flex-1 min-w-0 pr-2">
                          <h4 class="text-xs font-extrabold text-white truncate">{{ loc.name }}</h4>
                          <span class="text-[9px] text-gray-400 font-medium capitalize">{{ loc.description }}</span>
                        </div>
                        <div class="flex items-center gap-3 shrink-0">
                          <span class="text-xs font-bold text-green-400">{{ loc.temp }}°C</span>
                          <button 
                            (click)="removeLocation(loc.storedName); $event.stopPropagation()" 
                            class="p-1 text-gray-500 hover:text-red-400 transition"
                            title="Remove"
                          >
                            <span class="material-icons text-xs">close</span>
                          </button>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>

            </div>
            
            <!-- RIGHT COLUMN: 7-DAY FORECAST -->
            <div class="lg:col-span-2">
              <div class="bg-[#1e293b]/40 border border-gray-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-80">
                <div>
                  <h3 class="font-bold text-white mb-4 flex items-center gap-2 text-sm">
                    <span class="material-icons text-green-500 text-sm">calendar_month</span> 
                    7-Day Agricultural Forecast
                  </h3>
                  
                  <div class="divide-y divide-gray-800">
                    @for (day of forecast(); track $index) {
                      <div class="flex justify-between items-center py-3 text-xs">
                        <span class="font-bold text-gray-300">
                          {{ day.date ? (day.date | date:'EEEE, MMM d') : 'Day ' + day.day }}
                        </span>
                        
                        <div class="flex items-center gap-2">
                          <span class="px-2 py-0.5 rounded-lg bg-red-500/10 text-red-400 font-bold text-[10px]">
                            {{ day.tempMax }}° Max
                          </span>
                          <span class="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 font-bold text-[10px]">
                            {{ day.tempMin }}° Min
                          </span>
                        </div>
                        
                        <span class="text-gray-400 flex items-center gap-1">
                          <span>💧 Rain:</span>
                          <span class="font-extrabold text-white">{{ day.rainMm }} mm</span>
                        </span>
                      </div>
                    }
                  </div>
                </div>
                
                <p class="text-[10px] text-gray-500 mt-6 pt-3 border-t border-gray-800/60 leading-relaxed italic">
                  Note: Weather predictions are powered by Open-Meteo API services. High forecast precipitation values advise delaying active crop fertilization sprays and harvest timings.
                </p>
              </div>
            </div>
            
          </div>
        } @else {
          <!-- Empty loading state -->
          <div class="bg-[#1e293b]/20 rounded-3xl p-16 text-center text-gray-500 border border-gray-800 shadow-md">
            <div class="animate-bounce text-4xl mb-3">☁️</div>
            <p class="text-xs">Connecting to meteorological weather stations...</p>
          </div>
        }

      </div>
    </div>
  `,
  styles: []
})
export class WeatherComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toastr = inject(ToastrService);
  
  readonly current = signal<CurrentWeather | null>(null);
  readonly forecast = signal<ForecastDay[]>([]);
  readonly savedLocations = signal<any[]>([]);

  searchCity = '';

  ngOnInit(): void {
    this.loadSavedLocations();
    this.detectLocationAndFetch();
  }

  detectLocationAndFetch(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.fetchWeather(pos.coords.latitude, pos.coords.longitude, null),
        () => this.fetchWeather(28.6139, 77.209, null)
      );
    } else {
      this.fetchWeather(28.6139, 77.209, null);
    }
  }

  fetchWeather(lat: number | null, lon: number | null, city: string | null): void {
    const params: any = {};
    if (lat !== null) params.lat = lat;
    if (lon !== null) params.lon = lon;
    if (city !== null) params.city = city;

    this.api.get<any>('/api/weather', params).subscribe({
      next: (res) => {
        if (res) {
          this.current.set(res.current);
          this.forecast.set(res.forecast || []);
          if (res.current && res.current.city && res.current.city.toLowerCase().includes('not found')) {
            this.toastr.warning('Location coordinates could not be resolved. Showing default weather.', 'Location Not Found');
          }
        }
      }
    });
  }

  isNotFound(): boolean {
    const curr = this.current();
    return !!curr && (curr.city || '').toLowerCase().includes('not found');
  }

  search(): void {
    if (!this.searchCity.trim()) return;
    this.fetchWeather(null, null, this.searchCity.trim());
    this.searchCity = '';
  }

  isCurrentSaved(): boolean {
    const curr = this.current();
    if (!curr) return false;
    const name = (curr.city || '').toLowerCase();
    return this.savedLocations().some(loc => {
      const locName = (loc.name || '').toLowerCase();
      return name === locName || name.startsWith(locName) || locName.startsWith(name);
    });
  }

  saveLocation(): void {
    const curr = this.current();
    if (!curr) return;
    const name = curr.city;
    
    if (this.isCurrentSaved()) return;

    const savedNames = this.getSavedNamesFromStorage();
    if (!savedNames.includes(name)) {
      savedNames.push(name);
      localStorage.setItem('saved_weather_locations', JSON.stringify(savedNames));
      this.loadSavedLocations();
    }
  }

  removeLocation(name: string): void {
    let savedNames = this.getSavedNamesFromStorage();
    savedNames = savedNames.filter(n => n !== name);
    localStorage.setItem('saved_weather_locations', JSON.stringify(savedNames));
    this.loadSavedLocations();
  }

  private getSavedNamesFromStorage(): string[] {
    const str = localStorage.getItem('saved_weather_locations');
    return str ? JSON.parse(str) : [];
  }

  private loadSavedLocations(): void {
    const names = this.getSavedNamesFromStorage();
    this.savedLocations.set([]); // Reset list

    for (const name of names) {
      this.api.get<any>('/api/weather/current', { city: name }).subscribe({
        next: (res) => {
          if (res) {
            const list = this.savedLocations();
            if (!list.some(item => item.storedName === name)) {
              this.savedLocations.set([...list, {
                storedName: name,
                name: res.city,
                temp: res.temp,
                description: res.description
              }]);
            }
          }
        }
      });
    }
  }

  selectSavedLocation(name: string): void {
    this.fetchWeather(null, null, name);
  }

  getWeatherIcon(description: string): string {
    const desc = description.toLowerCase();
    if (desc.includes('sun') || desc.includes('clear')) return '☀️';
    if (desc.includes('cloud') || desc.includes('overcast')) return '🌤️';
    if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) return '🌧️';
    if (desc.includes('thunder') || desc.includes('storm')) return '⛈️';
    if (desc.includes('snow') || desc.includes('ice')) return '❄️';
    if (desc.includes('fog') || desc.includes('mist')) return '🌫️';
    return '🌤️';
  }
}
