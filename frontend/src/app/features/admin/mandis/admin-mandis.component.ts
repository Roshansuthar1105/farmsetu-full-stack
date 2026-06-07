import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'fs-admin-mandis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-mandis.component.html',
  // styleUrls: ['./admin-mandis.component.scss']
})
export class AdminMandisComponent implements OnInit {
  private readonly api = inject(ApiService);

  mandis = signal<any[]>([]);
  selectedMandi = signal<any>(null);
  showEditModal = signal(false);
  isEditMode = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;

  ngOnInit(): void {
    this.loadMandis();
  }

  loadMandis(): void {
    this.api.get<any>('/api/admin/mandis', { page: this.page, size: this.size }).subscribe({
      next: (res) => {
        this.mandis.set(res.content);
        this.totalElements = res.totalElements;
      },
      error: () => this.showError('Failed to load mandis')
    });
  }

  onAdd(): void {
    this.isEditMode.set(false);
    this.selectedMandi.set({
      name: '',
      state: '',
      district: '',
      latitude: 20.0,
      longitude: 77.0,
      address: '',
      operatingHours: '',
      contactPhone: ''
    });
    this.showEditModal.set(true);
  }

  onEdit(mandi: any): void {
    this.isEditMode.set(true);
    this.selectedMandi.set({ ...mandi });
    this.showEditModal.set(true);
  }

  onSave(): void {
    const mandi = this.selectedMandi();
    if (!mandi) return;

    if (this.isEditMode()) {
      this.api.put<any>(`/api/admin/mandis/${mandi.id}`, mandi).subscribe({
        next: () => {
          this.showSuccess('Mandi updated successfully');
          this.showEditModal.set(false);
          this.loadMandis();
        },
        error: () => this.showError('Failed to save mandi details')
      });
    } else {
      this.api.post<any>('/api/admin/mandis', mandi).subscribe({
        next: () => {
          this.showSuccess('Mandi created successfully');
          this.showEditModal.set(false);
          this.loadMandis();
        },
        error: () => this.showError('Failed to create mandi')
      });
    }
  }

  onDelete(mandi: any): void {
    if (confirm(`Are you sure you want to delete mandi ${mandi.name}?`)) {
      this.api.delete<void>(`/api/admin/mandis/${mandi.id}`).subscribe({
        next: () => {
          this.showSuccess('Mandi deleted successfully');
          this.loadMandis();
        },
        error: () => this.showError('Failed to delete mandi')
      });
    }
  }

  nextPage(): void {
    if ((this.page + 1) * this.size < this.totalElements) {
      this.page++;
      this.loadMandis();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadMandis();
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
