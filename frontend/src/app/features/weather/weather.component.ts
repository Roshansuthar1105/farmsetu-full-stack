import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-weather',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <fs-page-header title="Weather Dashboard" subtitle="Real-time crop advisory & meteorological forecast" />
    
    <div class="max-w-4xl mx-auto space-y-6">
      @if (current()) {
        <div class="grid md:grid-cols-3 gap-6">
          
          <!-- Left: Current Weather Card -->
          <div class="bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-80 border border-blue-400/20">
            <div class="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-36 h-36 bg-white/10 rounded-full blur-2xl"></div>
            
            <div class="space-y-1 relative z-10">
              <span class="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">Current Weather</span>
              <h3 class="text-lg font-medium pt-2">Local Weather</h3>
              <p class="text-xs opacity-75">Based on your coordinates</p>
            </div>
            
            <div class="space-y-2 relative z-10">
              <div class="flex items-center gap-3">
                <span class="text-6xl font-extrabold">{{ current()?.['temp'] }}°C</span>
                <span class="text-4xl">🌤️</span>
              </div>
              <p class="text-sm font-semibold capitalize">{{ current()?.['description'] }}</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 relative z-10 text-xs">
              <div>
                <span class="block opacity-75">Humidity</span>
                <span class="font-bold text-sm">{{ current()?.['humidity'] }}%</span>
              </div>
              <div>
                <span class="block opacity-75">Source</span>
                <span class="font-bold text-sm">{{ current()?.['source'] || 'OpenWeather' }}</span>
              </div>
            </div>
          </div>
          
          <!-- Right: Forecast Card -->
          <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-3xl p-6 shadow-xl md:col-span-2 flex flex-col justify-between min-h-80">
            <div>
              <h3 class="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
                <span>📅</span> 7-Day Agricultural Forecast
              </h3>
              
              <div class="divide-y divide-gray-50 dark:divide-gray-700/50">
                @for (day of forecast(); track $index) {
                  <div class="flex justify-between items-center py-3 text-sm">
                    <span class="font-semibold text-gray-700 dark:text-gray-200">Day {{ day['day'] }}</span>
                    <div class="flex items-center gap-2 text-xs">
                      <span class="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-medium">{{ day['tempMax'] }}° Max</span>
                      <span class="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-medium">{{ day['tempMin'] }}° Min</span>
                    </div>
                    <span class="text-xs text-gray-500 flex items-center gap-1">
                      <span>💧 Rain:</span>
                      <span class="font-bold text-gray-700 dark:text-gray-300">{{ day['rainMm'] }} mm</span>
                    </span>
                  </div>
                }
              </div>
            </div>
            
            <p class="text-[10px] text-gray-400 mt-4">Note: Higher precipitation calls for delaying crop spraying and harvest scheduling.</p>
          </div>
          
        </div>
      } @else {
        <div class="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center text-gray-500 border border-gray-100 dark:border-gray-700 shadow-md">
          <div class="animate-bounce text-4xl mb-2">☁️</div>
          <p class="text-sm">Fetching weather data...</p>
        </div>
      }
    </div>
  `
})
export class WeatherComponent implements OnInit {
  private readonly api = inject(ApiService);
  
  readonly current = signal<Record<string, unknown> | null>(null);
  readonly forecast = signal<Record<string, unknown>[]>([]);

  ngOnInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => this.fetchWeather(28.6139, 77.209)
      );
    } else {
      this.fetchWeather(28.6139, 77.209);
    }
  }

  fetchWeather(lat: number, lon: number): void {
    this.api.get<Record<string, any>>('/api/weather', { lat, lon }).subscribe({
      next: (res) => {
        if (res) {
          this.current.set(res['current']);
          this.forecast.set(res['forecast'] || []);
        }
      }
    });
  }
}
