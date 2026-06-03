import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { PageResponse } from '../../core/models/user.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-news',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <fs-page-header title="Agricultural News" />
    <div class="grid md:grid-cols-2 gap-4">
      @for (item of articles(); track item.id) {
        <article class="fs-card">
          <span class="text-xs text-secondary font-medium">{{ item.category }}</span>
          <h3 class="font-semibold mt-1">{{ item.title }}</h3>
          <p class="text-sm text-gray-500 mt-2 line-clamp-3">{{ item.content }}</p>
        </article>
      }
    </div>
  `
})
export class NewsComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly articles = signal<any[]>([]);

  ngOnInit(): void {
    this.api.getPage<any>('/api/news').subscribe({
      next: (p: PageResponse<any>) => this.articles.set(p.content)
    });
  }
}
