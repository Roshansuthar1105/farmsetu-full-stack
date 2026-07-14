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
  LucideSparkles
} from '@lucide/angular';

export interface GovtScheme {
  id: number;
  name: string;
  description?: string;
  eligibilityCriteria?: string;
  benefits?: string;
  applicationProcess?: string;
  documentsRequired: string[];
  deadline?: string;
  schemeType: 'CENTRAL' | 'STATE';
  state?: string;
  officialLink?: string;
  helpline?: string;
}

@Component({
  selector: 'fs-govt-schemes',
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
    LucideSparkles
  ],
  templateUrl: './govt-schemes.component.html'
})
export class GovtSchemesComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly loading = signal(true);
  readonly schemes = signal<GovtScheme[]>([]);
  readonly selectedScheme = signal<GovtScheme | null>(null);
  readonly activeTab = signal<'list' | 'calculator'>('list');

  // Filter state
  readonly searchQuery = signal('');
  readonly filterType = signal('ALL');
  readonly filterState = signal('ALL');

  // Eligibility Form fields
  readonly calculatorForm = {
    state: '',
    farmArea: null as number | null,
    cropType: 'ALL',
    farmingType: 'CONVENTIONAL' as 'CONVENTIONAL' | 'ORGANIC',
    category: 'GENERAL'
  };

  // Eligibility results
  readonly submittingEligibility = signal(false);
  readonly eligibilityResults = signal<GovtScheme[] | null>(null);

  // Computed state options
  readonly statesList = computed(() => {
    const list = this.schemes()
      .map((s) => s.state)
      .filter((state): state is string => !!state && state.trim().length > 0);
    return Array.from(new Set(list)).sort();
  });

  readonly centralCount = computed(() => {
    return this.schemes().filter((s) => s.schemeType === 'CENTRAL').length;
  });

  readonly stateCount = computed(() => {
    return this.schemes().filter((s) => s.schemeType === 'STATE').length;
  });

  // Filter logic
  readonly filteredSchemes = computed(() => {
    let list = this.schemes();
    const query = this.searchQuery().toLowerCase().trim();
    const type = this.filterType();
    const state = this.filterState();

    if (query) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query)) ||
          (s.eligibilityCriteria && s.eligibilityCriteria.toLowerCase().includes(query)) ||
          (s.benefits && s.benefits.toLowerCase().includes(query)) ||
          (s.helpline && s.helpline.toLowerCase().includes(query))
      );
    }

    if (type !== 'ALL') {
      list = list.filter((s) => s.schemeType === type);
    }

    if (state !== 'ALL') {
      list = list.filter((s) => s.state === state);
    }

    return list;
  });

  ngOnInit(): void {
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.loading.set(true);
    this.api.get<GovtScheme[]>('/api/schemes').subscribe({
      next: (data) => {
        this.schemes.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  checkEligibility(): void {
    if (!this.calculatorForm.state || this.calculatorForm.farmArea === null) {
      return;
    }

    this.submittingEligibility.set(true);
    const payload = {
      state: this.calculatorForm.state,
      farmArea: this.calculatorForm.farmArea,
      cropType: this.calculatorForm.cropType,
      farmingType: this.calculatorForm.farmingType,
      category: this.calculatorForm.category
    };

    this.api.post<{ eligibleSchemes: GovtScheme[] }>('/api/schemes/eligibility-check', payload).subscribe({
      next: (res) => {
        // Handle both returning wrapper with "eligibleSchemes" property and array direct
        const results = res?.eligibleSchemes ?? (Array.isArray(res) ? res : []);
        this.eligibilityResults.set(results);
        this.submittingEligibility.set(false);
      },
      error: () => {
        this.eligibilityResults.set([]);
        this.submittingEligibility.set(false);
      }
    });
  }

  openDetail(scheme: GovtScheme): void {
    this.selectedScheme.set(scheme);
  }

  closeDetail(): void {
    this.selectedScheme.set(null);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.filterType.set('ALL');
    this.filterState.set('ALL');
  }

  hasActiveFilters(): boolean {
    return (
      this.searchQuery() !== '' ||
      this.filterType() !== 'ALL' ||
      this.filterState() !== 'ALL'
    );
  }
}
