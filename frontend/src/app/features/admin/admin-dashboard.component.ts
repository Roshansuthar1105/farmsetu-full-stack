import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'fs-admin-dashboard',
  standalone: true,
  template: `
    <h1 class="text-2xl font-bold mb-6">Admin Dashboard</h1>
  <div class="grid sm:grid-cols-3 gap-4">
      @for (stat of stats(); track stat.label) {
        <div class="fs-card">
          <p class="text-sm text-gray-500">{{ stat.label }}</p>
          <p class="text-3xl font-bold text-primary mt-1">{{ stat.value }}</p>
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly stats = signal<{ label: string; value: number }[]>([]);

  ngOnInit(): void {
    this.api.get<Record<string, number>>('/api/admin/dashboard').subscribe({
      next: (d) => {
        this.stats.set([
          { label: 'Total Users', value: d['totalUsers'] ?? 0 },
          { label: 'Orders', value: d['totalOrders'] ?? 0 },
          { label: 'Posts', value: d['totalPosts'] ?? 0 }
        ]);
      }
    });
  }
}
