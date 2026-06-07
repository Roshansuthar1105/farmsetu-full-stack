import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-financial',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <fs-page-header title="Financial Tools" />
    <div class="grid md:grid-cols-2 gap-4">
      <div class="fs-card">
        <h3 class="font-semibold">Loan schemes</h3>
        @for (s of schemes(); track s['name']) {
          <p class="text-sm mt-2">{{ s['name'] }} — {{ s['provider'] }}</p>
        }
      </div>
      <div class="fs-card">
        <h3 class="font-semibold">Expense report</h3>
        <p class="text-2xl text-primary font-bold mt-2">₹{{ report()?.['totalExpenses'] ?? 0 }}</p>
        <p class="text-sm text-gray-500">{{ report()?.['expenseCount'] ?? 0 }} entries</p>
      </div>
    </div>
  `
})
export class FinancialComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  readonly schemes = signal<Record<string, unknown>[]>([]);
  readonly report = signal<Record<string, unknown> | null>(null);

  ngOnInit(): void {
    this.api.get<Record<string, unknown>[]>('/api/finance/schemes').subscribe({
      next: (d) => this.schemes.set(d)
    });
    const id = this.auth.currentUser()?.id ?? 1;
    this.api.get<Record<string, unknown>>(`/api/finance/report/${id}`).subscribe({
      next: (d) => this.report.set(d)
    });
  }
}
