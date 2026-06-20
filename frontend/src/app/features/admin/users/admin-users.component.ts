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
  selector: 'fs-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminPageHeaderComponent,
    AdminDataTableComponent,
    AdminModalComponent,
    AdminConfirmDialogComponent
  ],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toastr = inject(ToastrService);

  readonly users = signal<any[]>([]);
  readonly loading = signal(true);
  readonly totalElements = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly showEditModal = signal(false);
  readonly showDeactivateDialog = signal(false);
  readonly selectedUser = signal<any>(null);

  private searchTerm = '';
  private activeFilters: Record<string, string> = {};

  readonly columns: TableColumn[] = [
    {
      key: 'name',
      label: 'User',
      type: 'custom',
      render: (row) => `
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex items-center justify-center text-slate-500 font-bold shrink-0">
            ${row.profilePhoto ? `<img src="${row.profilePhoto}" class="object-cover w-full h-full" />` : `<span>${row.name?.charAt(0) || 'U'}</span>`}
          </div>
          <div>
            <div class="text-sm font-semibold text-slate-900 dark:text-white">${row.name || 'N/A'}</div>
            <div class="text-xs text-slate-500">${row.email || row.phone || 'No Contact Info'}</div>
          </div>
        </div>
      `
    },
    { key: 'role', label: 'Role', type: 'badge' },
    {
      key: 'location',
      label: 'Location',
      type: 'custom',
      render: (row) => `${row.village ? row.village + ', ' : ''}${row.state || 'N/A'}`
    },
    { key: 'verified', label: 'Verified', type: 'boolean' },
    { key: 'active', label: 'Active', type: 'boolean' },
    { key: 'id', label: 'Actions', type: 'actions', align: 'right' }
  ];

  readonly rowActions: TableAction[] = [
    { label: 'Edit', action: 'edit', color: 'primary' },
    { label: 'Verify/Unverify', action: 'toggle-verify', color: 'info' },
    { label: 'Deactivate', action: 'deactivate', color: 'danger', visible: (row) => row.active }
  ];

  readonly filters: FilterOption[] = [
    {
      key: 'role',
      label: 'Role',
      options: [
        { value: 'FARMER', label: 'Farmer' },
        { value: 'EXPERT', label: 'Expert' },
        { value: 'SELLER', label: 'Seller' },
        { value: 'ADMIN', label: 'Admin' }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    // Combine standard pagination with filters/search
    const params: Record<string, string | number | boolean> = { ...this.activeFilters };
    if (this.searchTerm) {
      params['search'] = this.searchTerm;
    }

    this.adminService.list<any>('/api/admin/users', this.page(), this.size(), params).subscribe({
      next: (res) => {
        this.users.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load users');
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
      this.openEditModal(e.row);
    } else if (e.action === 'toggle-verify') {
      this.toggleVerify(e.row);
    } else if (e.action === 'deactivate') {
      this.selectedUser.set(e.row);
      this.showDeactivateDialog.set(true);
    }
  }

  private openEditModal(user: any): void {
    this.adminService.getById<any>('/api/admin/users', user.id).subscribe({
      next: (fullUser) => {
        const fp = fullUser.farmerProfile || {};
        this.selectedUser.set({
          ...fullUser,
          farmArea: fp.farmArea || null,
          soilType: fp.soilType || '',
          soilPh: fp.soilPh || null,
          waterSource: fp.waterSource || '',
          farmingExperience: fp.farmingExperience || null,
          farmingType: fp.farmingType || 'CONVENTIONAL'
        });
        this.showEditModal.set(true);
      },
      error: () => this.toastr.error('Failed to fetch user details')
    });
  }

  private toggleVerify(user: any): void {
    const nextVerify = !user.verified;
    this.adminService.update<any>('/api/admin/users', user.id, { verified: nextVerify }).subscribe({
      next: () => {
        this.toastr.success(`User verification updated successfully`);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to update verification status')
    });
  }

  onSave(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.adminService.update<any>('/api/admin/users/' + user.id, 'details' as any, user).subscribe({
      next: () => {
        this.toastr.success('User updated successfully');
        this.showEditModal.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to save user details')
    });
  }

  confirmDeactivate(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.adminService.remove('/api/admin/users', user.id).subscribe({
      next: () => {
        this.toastr.success('User deactivated successfully');
        this.showDeactivateDialog.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to deactivate user')
    });
  }
}
