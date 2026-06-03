import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'fs-admin-insurance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-insurance.component.html',
  styleUrls: ['./admin-insurance.component.scss']
})
export class AdminInsuranceComponent implements OnInit {
  private readonly api = inject(ApiService);

  insuranceSchemes = signal<any[]>([]);
  selectedScheme = signal<any>(null);
  showEditModal = signal(false);
  isEditMode = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;

  ngOnInit(): void {
    this.loadInsurance();
  }

  loadInsurance(): void {
    this.api.get<any>('/api/admin/insurance', { page: this.page, size: this.size }).subscribe({
      next: (res) => {
        this.insuranceSchemes.set(res.content);
        this.totalElements = res.totalElements;
      },
      error: () => this.showError('Failed to load insurance schemes')
    });
  }

  onAdd(): void {
    this.isEditMode.set(false);
    this.selectedScheme.set({
      name: '',
      description: '',
      coverageDetails: '',
      premiumCalculationFormula: '',
      eligibility: '',
      claimProcess: '',
      partnerCompany: '',
      officialLink: ''
    });
    this.showEditModal.set(true);
  }

  onEdit(scheme: any): void {
    this.isEditMode.set(true);
    this.selectedScheme.set({ ...scheme });
    this.showEditModal.set(true);
  }

  onSave(): void {
    const scheme = this.selectedScheme();
    if (!scheme) return;

    if (this.isEditMode()) {
      this.api.put<any>(`/api/admin/insurance/${scheme.id}`, scheme).subscribe({
        next: () => {
          this.showSuccess('Insurance scheme updated successfully');
          this.showEditModal.set(false);
          this.loadInsurance();
        },
        error: () => this.showError('Failed to save insurance details')
      });
    } else {
      this.api.post<any>('/api/admin/insurance', scheme).subscribe({
        next: () => {
          this.showSuccess('Insurance scheme created successfully');
          this.showEditModal.set(false);
          this.loadInsurance();
        },
        error: () => this.showError('Failed to create insurance scheme')
      });
    }
  }

  onDelete(scheme: any): void {
    if (confirm(`Are you sure you want to delete insurance scheme ${scheme.name}?`)) {
      this.api.delete<void>(`/api/admin/insurance/${scheme.id}`).subscribe({
        next: () => {
          this.showSuccess('Insurance scheme deleted successfully');
          this.loadInsurance();
        },
        error: () => this.showError('Failed to delete insurance scheme')
      });
    }
  }

  nextPage(): void {
    if ((this.page + 1) * this.size < this.totalElements) {
      this.page++;
      this.loadInsurance();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadInsurance();
    }
  }

  private showSuccess(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  private showError(msg: string): void {
    this.errorMessage.set(msg);
    setTimeout(() => this.errorMessage.set(null), 3000);
  }
}
