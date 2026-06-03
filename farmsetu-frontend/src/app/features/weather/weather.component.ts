import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-weather',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <fs-page-header title="Weather" subtitle="Forecast & crop alerts" />
    @if (current()) {
      <div class="grid md:grid-cols-3 gap-4">
        <div class="fs-card text-center">
          <p class="text-4xl font-bold text-primary">{{ current()?.['temp'] }}°C</p>
          <p class="mt-2">{{ current()?.['description'] }}</p>
        </div>
        <div class="fs-card md:col-span-2">
          <h3 class="font-semibold mb-2">7-day forecast</h3>
          @for (day of forecast(); track $index) {
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 text-sm">
              <span>Day {{ day['day'] }}</span>
              <span>{{ day['tempMax'] }}° / {{ day['tempMin'] }}°</span>
              <span>Rain: {{ day['rainMm'] }}mm</span>
            </div>
          }
        </div>
      </div>
    }
  `
})
export class WeatherComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly current = signal<Record<string, unknown> | null>(null);
  readonly forecast = signal<Record<string, unknown>[]>([]);

  ngOnInit(): void {
    this.api.get<Record<string, unknown>>('/api/weather/current').subscribe({
      next: (d) => this.current.set(d)
    });
    this.api.get<Record<string, unknown>[]>('/api/weather/forecast', { days: 7 }).subscribe({
      next: (d) => this.forecast.set(d)
    });
  }
}
