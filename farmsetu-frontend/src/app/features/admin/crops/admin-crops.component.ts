import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'fs-admin-crops',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-crops.component.html',
  styleUrls: ['./admin-crops.component.scss']
})
export class AdminCropsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toastr = inject(ToastrService);

  crops = signal<any[]>([]);
  selectedCrop = signal<any>(null);
  showEditModal = signal(false);
  isEditMode = signal(false);

  // Form soil types comma list
  soilTypesRaw = '';
  // Local names form bindings
  localNameEn = '';
  localNameHi = '';

  // Pagination
  page = 0;
  size = 10;
  totalElements = 0;

  ngOnInit(): void {
    this.loadCrops();
  }

  loadCrops(): void {
    this.api.get<any>('/api/admin/crops', { page: this.page, size: this.size }).subscribe({
      next: (res) => {
        this.crops.set(res.content);
        this.totalElements = res.totalElements;
      },
      error: () => this.showError('Failed to load crops')
    });
  }

  onAdd(): void {
    this.isEditMode.set(false);
    this.soilTypesRaw = '';
    this.localNameEn = '';
    this.localNameHi = '';
    this.selectedCrop.set({
      name: '',
      season: 'KHARIF',
      waterRequirement: 'Medium',
      growingDays: 120,
      averageYieldPerAcre: 0.0,
      averageMarketPrice: 0.0,
      soilTypes: [],
      localNames: {}
    });
    this.showEditModal.set(true);
  }

  onEdit(crop: any): void {
    this.isEditMode.set(true);
    this.soilTypesRaw = (crop.soilTypes || []).join(', ');
    this.localNameEn = crop.localNames?.en || '';
    this.localNameHi = crop.localNames?.hi || '';
    this.selectedCrop.set({ ...crop });
    this.showEditModal.set(true);
  }

  onSave(): void {
    const crop = this.selectedCrop();
    if (!crop) return;

    // Process soil types
    crop.soilTypes = this.soilTypesRaw
      ? this.soilTypesRaw.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    // Process local names
    crop.localNames = {
      en: this.localNameEn || crop.name,
      hi: this.localNameHi || ''
    };

    if (this.isEditMode()) {
      this.api.put<any>(`/api/admin/crops/${crop.id}`, crop).subscribe({
        next: () => {
          this.showSuccess('Crop updated successfully');
          this.showEditModal.set(false);
          this.loadCrops();
        },
        error: () => this.showError('Failed to save crop details')
      });
    } else {
      this.api.post<any>('/api/admin/crops', crop).subscribe({
        next: () => {
          this.showSuccess('Crop created successfully');
          this.showEditModal.set(false);
          this.loadCrops();
        },
        error: () => this.showError('Failed to create crop')
      });
    }
  }

  onDelete(crop: any): void {
    if (confirm(`Are you sure you want to delete crop ${crop.name}?`)) {
      this.api.delete<void>(`/api/admin/crops/${crop.id}`).subscribe({
        next: () => {
          this.showSuccess('Crop deleted successfully');
          this.loadCrops();
        },
        error: () => this.showError('Failed to delete crop')
      });
    }
  }

  nextPage(): void {
    if ((this.page + 1) * this.size < this.totalElements) {
      this.page++;
      this.loadCrops();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadCrops();
    }
  }

  private showSuccess(msg: string): void {
    this.toastr.success(msg, 'Success');
  }

  private showError(msg: string): void {
    this.toastr.error(msg, 'Error');
  }
}
