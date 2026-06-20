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
  selector: 'fs-admin-schemes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminPageHeaderComponent,
    AdminDataTableComponent,
    AdminModalComponent,
    AdminConfirmDialogComponent
  ],
  templateUrl: './admin-schemes.component.html',
  styleUrls: ['./admin-schemes.component.scss']
})
export class AdminSchemesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toastr = inject(ToastrService);

  readonly schemes = signal<any[]>([]);
  readonly loading = signal(true);
  readonly totalElements = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly showEditModal = signal(false);
  readonly isEditMode = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly selectedScheme = signal<any>(null);

  private searchTerm = '';
  private activeFilters: Record<string, string> = {};

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Scheme Name', sortable: true },
    { key: 'schemeType', label: 'Type', type: 'badge' },
    { key: 'state', label: 'State', type: 'badge' },
    {
      key: 'deadline',
      label: 'Deadline',
      type: 'custom',
      render: (row) => row.deadline ? new Date(row.deadline).toLocaleDateString('en-IN') : 'Ongoing'
    },
    { key: 'helpline', label: 'Helpline' },
    { key: 'id', label: 'Actions', type: 'actions', align: 'right' }
  ];

  readonly rowActions: TableAction[] = [
    { label: 'Edit', action: 'edit', color: 'primary' },
    { label: 'Delete', action: 'delete', color: 'danger' }
  ];

  readonly filters: FilterOption[] = [
    {
      key: 'schemeType',
      label: 'Scheme Type',
      options: [
        { value: 'CENTRAL', label: 'Central' },
        { value: 'STATE', label: 'State' }
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

    this.adminService.list<any>('/api/admin/schemes', this.page(), this.size(), params).subscribe({
      next: (res) => {
        this.schemes.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load schemes');
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
      this.selectedScheme.set({ ...e.row });
      this.showEditModal.set(true);
    } else if (e.action === 'delete') {
      this.selectedScheme.set(e.row);
      this.showDeleteDialog.set(true);
    }
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

  onSave(): void {
    const scheme = this.selectedScheme();
    if (!scheme) return;

    const request$ = this.isEditMode()
      ? this.adminService.update<any>('/api/admin/schemes', scheme.id, scheme)
      : this.adminService.create<any>('/api/admin/schemes', scheme);

    request$.subscribe({
      next: () => {
        this.toastr.success(this.isEditMode() ? 'Scheme updated successfully' : 'Scheme created successfully');
        this.showEditModal.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to save scheme details')
    });
  }

  confirmDelete(): void {
    const scheme = this.selectedScheme();
    if (!scheme) return;

    this.adminService.remove('/api/admin/schemes', scheme.id).subscribe({
      next: () => {
        this.toastr.success('Scheme deleted successfully');
        this.showDeleteDialog.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to delete scheme')
    });
  }
}
