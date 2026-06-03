import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-govt-schemes',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <fs-page-header title="Government Schemes" />
    @for (s of schemes(); track s.id) {
      <div class="fs-card mb-4">
        <h3 class="font-semibold text-primary">{{ s.name }}</h3>
        <p class="text-sm mt-2 text-gray-600 dark:text-gray-300">{{ s.description }}</p>
        @if (s.officialLink) {
          <a [href]="s.officialLink" target="_blank" class="text-sm text-primary mt-2 inline-block">Official link →</a>
        }
      </div>
    }
  `
})
export class GovtSchemesComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly schemes = signal<any[]>([]);

  ngOnInit(): void {
    this.api.get<any[]>('/api/schemes').subscribe({ next: (d) => this.schemes.set(d) });
  }
}
