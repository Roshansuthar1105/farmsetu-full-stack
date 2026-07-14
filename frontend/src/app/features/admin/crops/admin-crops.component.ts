import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../services/admin.service';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn, TableAction, FilterOption } from '../shared/admin-data-table/admin-data-table.component';
import { AdminModalComponent } from '../shared/admin-modal/admin-modal.component';
import { AdminConfirmDialogComponent } from '../shared/admin-confirm-dialog/admin-confirm-dialog.component';

@Component({
  selector: 'fs-admin-crops',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminPageHeaderComponent,
    AdminDataTableComponent,
    AdminModalComponent,
    AdminConfirmDialogComponent
  ],
  templateUrl: './admin-crops.component.html',
  styleUrls: ['./admin-crops.component.scss']
})
export class AdminCropsComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toastr = inject(ToastrService);

  readonly crops = signal<any[]>([]);
  readonly loading = signal(true);
  readonly totalElements = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly showEditModal = signal(false);
  readonly isEditMode = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly selectedCrop = signal<any>(null);

  // Form bindings
  soilTypesRaw = '';
  localNameHi = '';

  private searchTerm = '';
  private activeFilters: Record<string, string> = {};

  readonly columns: TableColumn[] = [
    {
      key: 'name',
      label: 'Crop Name',
      type: 'custom',
      render: (row) => `
        <div>
          <div class="font-semibold text-slate-900 dark:text-white">${row.name}</div>
          <div class="text-xs text-slate-500">English: ${row.localNames?.en || row.name}</div>
        </div>
      `
    },
    {
      key: 'hindiName',
      label: 'Hindi Name',
      type: 'custom',
      render: (row) => row.localNames?.hi || '—'
    },
    { key: 'season', label: 'Season', type: 'badge' },
    {
      key: 'growingDays',
      label: 'Growing Days',
      type: 'custom',
      render: (row) => `${row.growingDays || 0} days`
    },
    { key: 'averageMarketPrice', label: 'Market Price (Per Qtl)', type: 'currency' },
    { key: 'waterRequirement', label: 'Water Req.' },
    { key: 'id', label: 'Actions', type: 'actions', align: 'right' }
  ];

  readonly rowActions: TableAction[] = [
    { label: 'Edit', action: 'edit', color: 'primary' },
    { label: 'Delete', action: 'delete', color: 'danger' }
  ];

  readonly filters: FilterOption[] = [
    {
      key: 'season',
      label: 'Season',
      options: [
        { value: 'KHARIF', label: 'Kharif' },
        { value: 'RABI', label: 'Rabi' },
        { value: 'ZAID', label: 'Zaid' }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    const params: Record<string, string | number | boolean> = { ...this.activeFilters };
    if (this.searchTerm) {
      params['search'] = this.searchTerm;
    }

    this.adminService.list<any>('/api/admin/crops', this.page(), this.size(), params).subscribe({
      next: (res) => {
        this.crops.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load crops');
        this.loading.set(false);
      }
    });
  }

  onPageChange(e: { page: number; size: number }): void {
    this.page.set(e.page);
    this.size.set(e.size);
    this.loadData();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.page.set(0);
    this.loadData();
  }

  onFilterChange(filters: Record<string, string>): void {
    this.activeFilters = filters;
    this.page.set(0);
    this.loadData();
  }

  onRowAction(e: { action: string; row: any }): void {
    if (e.action === 'edit') {
      this.isEditMode.set(true);
      this.soilTypesRaw = (e.row.soilTypes || []).join(', ');
      this.localNameHi = e.row.localNames?.hi || '';
      this.selectedCrop.set({ ...e.row });
      this.showEditModal.set(true);
    } else if (e.action === 'delete') {
      this.selectedCrop.set(e.row);
      this.showDeleteDialog.set(true);
    }
  }

  onAdd(): void {
    this.isEditMode.set(false);
    this.soilTypesRaw = '';
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

  onSave(): void {
    const crop = this.selectedCrop();
    if (!crop) return;

    // Process soil types
    crop.soilTypes = this.soilTypesRaw
      ? this.soilTypesRaw.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    // Process local names
    crop.localNames = {
      en: crop.name,
      hi: this.localNameHi || ''
    };

    const request$ = this.isEditMode()
      ? this.adminService.update<any>('/api/admin/crops', crop.id, crop)
      : this.adminService.create<any>('/api/admin/crops', crop);

    request$.subscribe({
      next: () => {
        this.toastr.success(this.isEditMode() ? 'Crop updated successfully' : 'Crop created successfully');
        this.showEditModal.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to save crop details')
    });
  }

  confirmDelete(): void {
    const crop = this.selectedCrop();
    if (!crop) return;

    this.adminService.remove('/api/admin/crops', crop.id).subscribe({
      next: () => {
        this.toastr.success('Crop deleted successfully');
        this.showDeleteDialog.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to delete crop')
    });
  }
}
