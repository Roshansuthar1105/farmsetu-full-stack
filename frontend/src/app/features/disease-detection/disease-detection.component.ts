import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-disease-detection',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent],
  template: `
    <fs-page-header title="Disease Detection" subtitle="Upload crop photo for AI analysis" />
    <form class="fs-card max-w-lg space-y-4" [formGroup]="form" (ngSubmit)="detect()">
      <input formControlName="cropName" placeholder="Crop name" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700" />
      <input formControlName="imageUrl" placeholder="Image URL (after upload)" class="w-full border rounded-lg px-3 py-2 dark:bg-gray-700" />
      <div class="border-2 border-dashed rounded-lg p-8 text-center text-gray-400">
        <span class="material-icons text-4xl">add_a_photo</span>
        <p class="text-sm mt-2">Camera / gallery upload — wire to S3/Cloudinary</p>
      </div>
      <button type="submit" class="fs-btn-primary">Detect disease</button>
    </form>
    @if (result()) {
      <div class="fs-card mt-6 border-l-4 border-secondary">
        <h3 class="font-bold text-lg">{{ result()?.detectedDisease }}</h3>
        <p class="text-sm">Severity: {{ result()?.severity }} · Confidence: {{ result()?.confidenceScore }}</p>
      </div>
    }
  `
})
export class DiseaseDetectionComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly result = signal<any>(null);
  readonly form = this.fb.group({ cropName: ['Wheat'], imageUrl: [''] });

  detect(): void {
    this.api.post<any>('/api/disease/detect', this.form.value).subscribe({
      next: (d) => this.result.set(d)
    });
  }
}
