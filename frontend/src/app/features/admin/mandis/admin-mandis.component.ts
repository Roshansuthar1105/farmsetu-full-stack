import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../services/admin.service';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn, TableAction } from '../shared/admin-data-table/admin-data-table.component';
import { AdminModalComponent } from '../shared/admin-modal/admin-modal.component';
import { AdminConfirmDialogComponent } from '../shared/admin-confirm-dialog/admin-confirm-dialog.component';

@Component({
  selector: 'fs-admin-mandis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminPageHeaderComponent,
    AdminDataTableComponent,
    AdminModalComponent,
    AdminConfirmDialogComponent
  ],
  templateUrl: './admin-mandis.component.html'
})
export class AdminMandisComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toastr = inject(ToastrService);

  readonly mandis = signal<any[]>([]);
  readonly loading = signal(true);
  readonly totalElements = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly showEditModal = signal(false);
  readonly isEditMode = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly selectedMandi = signal<any>(null);

  private searchTerm = '';

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Mandi Name', sortable: true },
    { key: 'district', label: 'District' },
    { key: 'state', label: 'State', type: 'badge' },
    { key: 'contactPhone', label: 'Phone' },
    { key: 'operatingHours', label: 'Operating Hours' },
    { key: 'id', label: 'Actions', type: 'actions', align: 'right' }
  ];

  readonly rowActions: TableAction[] = [
    { label: 'Edit', action: 'edit', color: 'primary' },
    { label: 'Delete', action: 'delete', color: 'danger' }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    const params: Record<string, string | number | boolean> = {};
    if (this.searchTerm) {
      params['search'] = this.searchTerm;
    }

    this.adminService.list<any>('/api/admin/mandis', this.page(), this.size(), params).subscribe({
      next: (res) => {
        this.mandis.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load mandis');
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

  onRowAction(e: { action: string; row: any }): void {
    if (e.action === 'edit') {
      this.isEditMode.set(true);
      this.selectedMandi.set({ ...e.row });
      this.showEditModal.set(true);
    } else if (e.action === 'delete') {
      this.selectedMandi.set(e.row);
      this.showDeleteDialog.set(true);
    }
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

  onSave(): void {
    const mandi = this.selectedMandi();
    if (!mandi) return;

    const request$ = this.isEditMode()
      ? this.adminService.update<any>('/api/admin/mandis', mandi.id, mandi)
      : this.adminService.create<any>('/api/admin/mandis', mandi);

    request$.subscribe({
      next: () => {
        this.toastr.success(this.isEditMode() ? 'Mandi updated successfully' : 'Mandi created successfully');
        this.showEditModal.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to save mandi details')
    });
  }

  confirmDelete(): void {
    const mandi = this.selectedMandi();
    if (!mandi) return;

    this.adminService.remove('/api/admin/mandis', mandi.id).subscribe({
      next: () => {
        this.toastr.success('Mandi deleted successfully');
        this.showDeleteDialog.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to delete mandi')
    });
  }
}
