import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { PageResponse } from '../../core/models/user.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-resources',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <fs-page-header title="Learning Resources" subtitle="Videos, PDFs, webinars" />
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      @for (r of resources(); track r.id) {
        <div class="fs-card">
          <span class="text-xs bg-green-100 text-primary px-2 py-0.5 rounded">{{ r.contentType }}</span>
          <h3 class="font-semibold mt-2">{{ r.title }}</h3>
          <p class="text-sm text-gray-500 mt-1">{{ r.difficultyLevel }} · {{ r.language }}</p>
        </div>
      }
    </div>
  `
})
export class ResourcesComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly resources = signal<any[]>([]);

  ngOnInit(): void {
    this.api.getPage<any>('/api/resources').subscribe({
      next: (p: PageResponse<any>) => this.resources.set(p.content)
    });
  }
}
