import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';

@Component({
  selector: 'fs-market-analysis',
  standalone: true,
  imports: [PageHeaderComponent, LoadingSkeletonComponent],
  template: `
    <fs-page-header title="Market Analysis" subtitle="Live mandi prices & trends" />
    @if (loading()) { <fs-loading-skeleton /> }
  @else {
      <div class="fs-card overflow-x-auto">
        <table class="w-full text-sm">
          <thead><tr class="text-left border-b"><th class="py-2">Mandi</th><th>State</th><th>Price/Qtl</th><th>Date</th></tr></thead>
          <tbody>
            @for (row of prices(); track row.id) {
              <tr class="border-b border-gray-100 dark:border-gray-700">
                <td class="py-2">{{ row.mandiName }}</td>
                <td>{{ row.state }}</td>
                <td class="text-primary font-medium">₹{{ row.pricePerQuintal }}</td>
                <td>{{ row.recordedDate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `
})
export class MarketAnalysisComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly loading = signal(true);
  readonly prices = signal<any[]>([]);

  ngOnInit(): void {
    this.api.get<any[]>('/api/market/prices').subscribe({
      next: (d) => { this.prices.set(d); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
