import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-insurance',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <fs-page-header title="Crop Insurance" subtitle="PMFBY & partner policies" />
    @for (p of policies(); track p.id) {
      <div class="fs-card mb-4">
        <h3 class="font-semibold">{{ p.name }}</h3>
        <p class="text-sm text-gray-500 mt-1">{{ p.partnerCompany }}</p>
        <p class="text-sm mt-2">{{ p.description }}</p>
      </div>
    }
  `
})
export class InsuranceComponent implements OnInit {
  private readonly api = inject(ApiService);
  readonly policies = signal<any[]>([]);

  ngOnInit(): void {
    this.api.get<any[]>('/api/insurance').subscribe({ next: (d) => this.policies.set(d) });
  }
}
