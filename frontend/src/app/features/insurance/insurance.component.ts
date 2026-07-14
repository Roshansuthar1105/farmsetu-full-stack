import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import {
  LucideSearch,
  LucideFilter,
  LucideCheckCircle,
  LucideX,
  LucideExternalLink,
  LucideGlobe,
  LucideAward,
  LucideMapPin,
  LucideCalculator,
  LucidePhone,
  LucideCalendar,
  LucideArrowRight,
  LucideInfo,
  LucideCheck,
  LucideSparkles,
  LucideShieldCheck,
  LucideCoins,
  LucideFileText
} from '@lucide/angular';

export interface InsuranceScheme {
  id: number;
  name: string;
  description?: string;
  coverageDetails?: string;
  premiumCalculationFormula?: string;
  eligibility?: string;
  claimProcess?: string;
  partnerCompany?: string;
  officialLink?: string;
}

@Component({
  selector: 'fs-insurance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    LoadingSkeletonComponent,
    LucideSearch,
    LucideFilter,
    LucideCheckCircle,
    LucideX,
    LucideExternalLink,
    LucideGlobe,
    LucideAward,
    LucideMapPin,
    LucideCalculator,
    LucidePhone,
    LucideCalendar,
    LucideArrowRight,
    LucideInfo,
    LucideCheck,
    LucideSparkles,
    LucideShieldCheck,
    LucideCoins,
    LucideFileText
  ],
  templateUrl: './insurance.component.html'
})
export class InsuranceComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly policies = signal<InsuranceScheme[]>([]);
  readonly selectedPolicy = signal<InsuranceScheme | null>(null);
  readonly activeTab = signal<'list' | 'calculator' | 'claim'>('list');

  // Filter state
  readonly searchQuery = signal('');

  // Premium calculator form
  readonly calculatorForm = {
    policyId: '',
    area: null as number | null,
    crop: 'Wheat'
  };
  readonly submittingCalculator = signal(false);
  readonly calculatorResult = signal<number | null>(null);

  // Claim wizard form
  readonly claimForm = {
    policyId: '',
    crop: '',
    dateOfLoss: '',
    affectedArea: null as number | null,
    causeOfLoss: 'Drought',
    description: ''
  };
  readonly submittingClaim = signal(false);
  readonly claimStatus = signal<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  readonly claimDetails = signal<any | null>(null);

  // Statistics tracking
  readonly claimCount = signal(0);

  readonly filteredPolicies = computed(() => {
    let list = this.policies();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.partnerCompany && p.partnerCompany.toLowerCase().includes(query)) ||
          (p.coverageDetails && p.coverageDetails.toLowerCase().includes(query))
      );
    }
    return list;
  });

  ngOnInit(): void {
    this.loadPolicies();
  }

  loadPolicies(): void {
    this.loading.set(true);
    this.api.get<InsuranceScheme[]>('/api/insurance').subscribe({
      next: (data) => {
        this.policies.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  calculatePremium(): void {
    if (!this.calculatorForm.policyId || this.calculatorForm.area === null) {
      return;
    }

    this.submittingCalculator.set(true);
    const payload = {
      policyId: Number(this.calculatorForm.policyId),
      area: this.calculatorForm.area,
      crop: this.calculatorForm.crop
    };

    this.api.post<{ estimatedPremium: number }>('/api/insurance/premium-calculate', payload).subscribe({
      next: (res) => {
        this.calculatorResult.set(res?.estimatedPremium ?? 0);
        this.submittingCalculator.set(false);
      },
      error: () => {
        this.calculatorResult.set(0);
        this.submittingCalculator.set(false);
      }
    });
  }

  fileClaim(): void {
    if (!this.claimForm.policyId || this.claimForm.affectedArea === null || !this.claimForm.crop || !this.claimForm.dateOfLoss) {
      return;
    }

    this.submittingClaim.set(true);
    const payload = {
      policyId: Number(this.claimForm.policyId),
      crop: this.claimForm.crop,
      dateOfLoss: this.claimForm.dateOfLoss,
      affectedArea: this.claimForm.affectedArea,
      causeOfLoss: this.claimForm.causeOfLoss,
      description: this.claimForm.description
    };

    this.api.post<any>('/api/insurance/claim', payload).subscribe({
      next: (res) => {
        this.claimDetails.set(res);
        this.claimStatus.set('SUCCESS');
        this.claimCount.update((c) => c + 1);
        this.submittingClaim.set(false);
      },
      error: () => {
        this.claimStatus.set('ERROR');
        this.submittingClaim.set(false);
      }
    });
  }

  resetClaim(): void {
    this.claimForm.policyId = '';
    this.claimForm.crop = '';
    this.claimForm.dateOfLoss = '';
    this.claimForm.affectedArea = null;
    this.claimForm.causeOfLoss = 'Drought';
    this.claimForm.description = '';
    this.claimStatus.set('IDLE');
    this.claimDetails.set(null);
  }

  openDetail(policy: InsuranceScheme): void {
    this.selectedPolicy.set(policy);
  }

  closeDetail(): void {
    this.selectedPolicy.set(null);
  }
}
