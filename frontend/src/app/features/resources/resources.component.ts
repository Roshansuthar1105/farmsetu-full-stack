import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import {
  LucideSearch,
  LucideFilter,
  LucidePlay,
  LucideFileText,
  LucideBookOpen,
  LucideVideo,
  LucideCheckCircle,
  LucideEye,
  LucideX,
  LucideExternalLink,
  LucideGraduationCap,
  LucideTag,
  LucideGlobe,
  LucideTrophy,
  LucideSprout,
  LucideChevronDown
} from '@lucide/angular';

export interface ResourceItem {
  id: number;
  title: string;
  description: string;
  contentType: 'VIDEO' | 'PDF' | 'ARTICLE' | 'WEBINAR';
  contentUrl: string;
  cropType: string;
  topic: string;
  difficultyLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  language: string;
  thumbnailUrl: string;
  viewsCount: number;
  completionCount: number;
}

@Component({
  selector: 'fs-resources',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    LoadingSkeletonComponent,
    LucideSearch,
    LucideFilter,
    LucidePlay,
    LucideFileText,
    LucideBookOpen,
    LucideVideo,
    LucideCheckCircle,
    LucideEye,
    LucideX,
    LucideExternalLink,
    LucideGraduationCap,
    LucideTag,
    LucideGlobe,
    LucideTrophy,
    LucideSprout,
    LucideChevronDown
  ],
  templateUrl: './resources.component.html'
})
export class ResourcesComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly resources = signal<ResourceItem[]>([]);
  readonly completedIds = signal<Set<number>>(new Set());
  readonly completingId = signal<number | null>(null);
  readonly selectedResource = signal<ResourceItem | null>(null);
  readonly activeTab = signal<'all' | 'completed'>('all');

  // Filter state
  readonly searchQuery = signal('');
  readonly filterType = signal('ALL');
  readonly filterDifficulty = signal('ALL');
  readonly filterCrop = signal('ALL');
  readonly filterLanguage = signal('ALL');

  // Derived: unique crop & language values for filter dropdowns
  readonly cropTypes = computed(() =>
    ['ALL', ...new Set(this.resources().map(r => r.cropType).filter(Boolean))]
  );
  readonly languages = computed(() =>
    ['ALL', ...new Set(this.resources().map(r => r.language).filter(Boolean))]
  );

  readonly contentTypes = ['ALL', 'VIDEO', 'PDF', 'ARTICLE', 'WEBINAR'];
  readonly difficultyLevels = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  readonly videoCount = computed(() => this.resources().filter(r => r.contentType === 'VIDEO').length);

  readonly filteredResources = computed(() => {
    let list = this.resources();
    const q = this.searchQuery().toLowerCase().trim();
    const type = this.filterType();
    const difficulty = this.filterDifficulty();
    const crop = this.filterCrop();
    const lang = this.filterLanguage();
    const tab = this.activeTab();

    if (tab === 'completed') {
      list = list.filter(r => this.completedIds().has(r.id));
    }
    if (q) {
      list = list.filter(r =>
        r.title?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q) ||
        r.topic?.toLowerCase().includes(q) ||
        r.cropType?.toLowerCase().includes(q)
      );
    }
    if (type !== 'ALL') list = list.filter(r => r.contentType === type);
    if (difficulty !== 'ALL') list = list.filter(r => r.difficultyLevel === difficulty);
    if (crop !== 'ALL') list = list.filter(r => r.cropType === crop);
    if (lang !== 'ALL') list = list.filter(r => r.language === lang);

    return list;
  });

  readonly totalCompleted = computed(() => this.completedIds().size);

  ngOnInit(): void {
    this.loadResources();
    this.loadCompleted();
  }

  loadResources(): void {
    this.loading.set(true);
    this.api.get<any>('/api/resources', { page: 0, size: 50 }).subscribe({
      next: (res: any) => {
        const content = res?.content ?? (Array.isArray(res) ? res : []);
        this.resources.set(content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadCompleted(): void {
    this.api.get<ResourceItem[]>('/api/resources/completed').subscribe({
      next: (arr) => {
        const ids = new Set<number>((arr || []).map((r: any) => r.id));
        this.completedIds.set(ids);
      }
    });
  }

  markCompleted(resource: ResourceItem): void {
    if (this.completedIds().has(resource.id) || this.completingId() === resource.id) return;
    this.completingId.set(resource.id);
    this.api.put<void>(`/api/resources/${resource.id}/progress`, {}).subscribe({
      next: () => {
        const next = new Set(this.completedIds());
        next.add(resource.id);
        this.completedIds.set(next);
        this.completingId.set(null);
      },
      error: () => this.completingId.set(null)
    });
  }

  openResource(resource: ResourceItem): void {
    this.selectedResource.set(resource);
  }

  closeDetail(): void {
    this.selectedResource.set(null);
  }

  isCompleted(id: number): boolean {
    return this.completedIds().has(id);
  }

  getContentTypeIcon(type: string): string {
    switch (type) {
      case 'VIDEO': return 'video';
      case 'PDF': return 'file-text';
      case 'ARTICLE': return 'book-open';
      case 'WEBINAR': return 'graduation-cap';
      default: return 'book-open';
    }
  }

  getContentTypeColor(type: string): string {
    switch (type) {
      case 'VIDEO': return 'text-red-600 bg-red-50 dark:bg-red-950/40 dark:text-red-300 border-red-100 dark:border-red-900/30';
      case 'PDF': return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100 dark:border-amber-900/30';
      case 'ARTICLE': return 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-300 border-blue-100 dark:border-blue-900/30';
      case 'WEBINAR': return 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-300 border-purple-100 dark:border-purple-900/30';
      default: return 'text-green-600 bg-green-50 dark:bg-green-950/40 dark:text-green-300';
    }
  }

  getDifficultyColor(level: string): string {
    switch (level) {
      case 'BEGINNER': return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300';
      case 'INTERMEDIATE': return 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300';
      case 'ADVANCED': return 'text-red-700 bg-red-50 dark:bg-red-950/40 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-gray-300';
    }
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.filterType.set('ALL');
    this.filterDifficulty.set('ALL');
    this.filterCrop.set('ALL');
    this.filterLanguage.set('ALL');
  }

  get hasActiveFilters(): boolean {
    return this.searchQuery() !== '' ||
      this.filterType() !== 'ALL' ||
      this.filterDifficulty() !== 'ALL' ||
      this.filterCrop() !== 'ALL' ||
      this.filterLanguage() !== 'ALL';
  }
}
