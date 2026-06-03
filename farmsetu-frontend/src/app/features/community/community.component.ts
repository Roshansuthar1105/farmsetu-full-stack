import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { PageResponse } from '../../core/models/user.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'fs-community',
  standalone: true,
  imports: [PageHeaderComponent, LoadingSkeletonComponent],
  template: `
    <fs-page-header title="Community" subtitle="Share tips, stories, and polls" />
    @if (loading()) { <fs-loading-skeleton /> }
    @else {
      <div class="space-y-4">
        @for (post of posts(); track post.id) {
          <article class="fs-card">
            <p class="font-medium">{{ post.author?.name ?? 'Farmer' }}</p>
            <p class="mt-2 text-gray-700 dark:text-gray-300">{{ post.content }}</p>
            <div class="flex gap-4 mt-3 text-sm text-gray-500">
              <span>❤ {{ post.likesCount }}</span>
              <span>💬 {{ post.commentsCount }}</span>
            </div>
          </article>
        } @empty {
          <p class="text-gray-500">No posts yet. Be the first to share!</p>
        }
      </div>
    }
  `
})
export class CommunityComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly loading = signal(true);
  readonly posts = signal<any[]>([]);

  ngOnInit(): void {
    this.api.getPage<any>('/api/posts').subscribe({
      next: (p: PageResponse<any>) => { this.posts.set(p.content); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
