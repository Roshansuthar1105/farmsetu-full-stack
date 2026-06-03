import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'fs-admin-schemes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-schemes.component.html',
  styleUrls: ['./admin-schemes.component.scss']
})
export class AdminSchemesComponent implements OnInit {
  private readonly api = inject(ApiService);

  schemes = signal<any[]>([]);
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
    this.loadSchemes();
  }

  loadSchemes(): void {
    this.api.get<any>('/api/admin/schemes', { page: this.page, size: this.size }).subscribe({
      next: (res) => {
        this.schemes.set(res.content);
        this.totalElements = res.totalElements;
      },
      error: () => this.showError('Failed to load schemes')
    });
  }

  onAdd(): void {
    this.isEditMode.set(false);
    this.selectedScheme.set({
      name: '',
      description: '',
      eligibilityCriteria: '',
      benefits: '',
      applicationProcess: '',
      deadline: '',
      schemeType: 'CENTRAL',
      state: '',
      officialLink: '',
      helpline: ''
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
      this.api.put<any>(`/api/admin/schemes/${scheme.id}`, scheme).subscribe({
        next: () => {
          this.showSuccess('Scheme updated successfully');
          this.showEditModal.set(false);
          this.loadSchemes();
        },
        error: () => this.showError('Failed to save scheme details')
      });
    } else {
      this.api.post<any>('/api/admin/schemes', scheme).subscribe({
        next: () => {
          this.showSuccess('Scheme created successfully');
          this.showEditModal.set(false);
          this.loadSchemes();
        },
        error: () => this.showError('Failed to create scheme')
      });
    }
  }

  onDelete(scheme: any): void {
    if (confirm(`Are you sure you want to delete scheme ${scheme.name}?`)) {
      this.api.delete<void>(`/api/admin/schemes/${scheme.id}`).subscribe({
        next: () => {
          this.showSuccess('Scheme deleted successfully');
          this.loadSchemes();
        },
        error: () => this.showError('Failed to delete scheme')
      });
    }
  }

  nextPage(): void {
    if ((this.page + 1) * this.size < this.totalElements) {
      this.page++;
      this.loadSchemes();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadSchemes();
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
