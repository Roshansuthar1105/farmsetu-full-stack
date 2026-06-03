import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-crop-recommendation',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent],
  template: `
    <fs-page-header title="Crop Recommendation" subtitle="ML-based suggestions for your farm" />
    <form class="fs-card max-w-xl space-y-3" [formGroup]="form" (ngSubmit)="recommend()">
      <input formControlName="soilType" placeholder="Soil type" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700" />
      <input formControlName="region" placeholder="Region / State" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700" />
      <select formControlName="season" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700">
        <option value="KHARIF">Kharif</option>
        <option value="RABI">Rabi</option>
        <option value="ZAID">Zaid</option>
      </select>
      <button type="submit" class="fs-btn-primary">Get recommendations</button>
    </form>
    @if (results().length) {
      <div class="grid md:grid-cols-2 gap-4 mt-6">
        @for (c of results(); track c['cropId']) {
          <div class="fs-card">
            <h3 class="font-semibold text-primary">{{ c['name'] }}</h3>
            <p class="text-sm mt-1">Yield: {{ c['expectedYieldPerAcre'] }} / acre</p>
            <p class="text-sm">Difficulty: {{ c['difficulty'] }}</p>
          </div>
        }
      </div>
    }
  `
})
export class CropRecommendationComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly results = signal<Record<string, unknown>[]>([]);
  readonly form = this.fb.group({
    soilType: ['Loamy'],
    region: [''],
    season: ['KHARIF']
  });

  recommend(): void {
    this.api.post<Record<string, unknown>[]>('/api/crops/recommend', this.form.value).subscribe({
      next: (d) => this.results.set(d)
    });
  }
}
