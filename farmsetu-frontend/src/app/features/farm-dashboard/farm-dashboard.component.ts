import { Component, inject, OnInit, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'fs-farm-dashboard',
  standalone: true,
  imports: [PageHeaderComponent, LoadingSkeletonComponent, JsonPipe],
  template: `
    <fs-page-header title="Farm Dashboard" subtitle="Your farm at a glance" />
    @if (loading()) { <fs-loading-skeleton /> }
    @else { <div class="grid lg:grid-cols-2 gap-4"><div class="fs-card"><pre class="text-xs overflow-auto">{{ data() | json }}</pre></div></div> }
  `
})
export class FarmDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly loading = signal(true);
  readonly data = signal<unknown>(null);

  ngOnInit(): void {
    const id = this.auth.currentUser()?.id ?? 1;
    this.api.get(`/api/dashboard/${id}`).subscribe({
      next: (d) => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
