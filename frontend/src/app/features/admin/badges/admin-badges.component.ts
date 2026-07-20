import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../services/admin.service';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';
import { AdminDataTableComponent, TableColumn, TableAction, FilterOption } from '../shared/admin-data-table/admin-data-table.component';
import { AdminModalComponent } from '../shared/admin-modal/admin-modal.component';
import { AdminConfirmDialogComponent } from '../shared/admin-confirm-dialog/admin-confirm-dialog.component';

interface BadgeModel {
  id?: number;
  name: string;
  hindiName?: string;
  description?: string;
  hindiDescription?: string;
  badgeType?: string;
  category?: string;
  rarity?: string;
  criteriaType?: string;
  thresholdValue?: number;
  gradientStyle?: string;
  pointsRequired: number;
}

@Component({
  selector: 'fs-admin-badges',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminPageHeaderComponent,
    AdminDataTableComponent,
    AdminModalComponent,
    AdminConfirmDialogComponent
  ],
  templateUrl: './admin-badges.component.html',
  styleUrls: ['./admin-badges.component.scss']
})
export class AdminBadgesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toastr = inject(ToastrService);

  readonly badges = signal<BadgeModel[]>([]);
  readonly loading = signal(true);
  readonly totalElements = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);

  readonly showEditModal = signal(false);
  readonly isEditMode = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly selectedBadge = signal<BadgeModel | null>(null);

  badgeForm: BadgeModel = {
    name: '',
    hindiName: '',
    description: '',
    hindiDescription: '',
    category: 'SOIL',
    rarity: 'BRONZE',
    criteriaType: 'PROFILE_COMPLETE',
    thresholdValue: 1,
    gradientStyle: 'from-emerald-600 to-teal-800',
    pointsRequired: 50
  };

  readonly columns: TableColumn[] = [
    { key: 'name', label: 'Badge Name (EN)', sortable: true },
    { key: 'hindiName', label: 'Hindi Title (हिंदी)' },
    { key: 'category', label: 'Category', type: 'badge' },
    { key: 'rarity', label: 'Rarity', type: 'badge' },
    { key: 'pointsRequired', label: 'Points (+Rep)', sortable: true },
    { key: 'criteriaType', label: 'Criteria Type' },
    { key: 'id', label: 'Actions', type: 'actions', align: 'right' }
  ];

  readonly rowActions: TableAction[] = [
    { label: 'Edit', action: 'edit', color: 'primary' },
    { label: 'Delete', action: 'delete', color: 'danger' }
  ];

  readonly filters: FilterOption[] = [
    {
      key: 'rarity',
      label: 'Rarity Level',
      options: [
        { value: 'BRONZE', label: 'Bronze' },
        { value: 'SILVER', label: 'Silver' },
        { value: 'GOLD', label: 'Gold' },
        { value: 'PLATINUM', label: 'Platinum' },
        { value: 'LEGENDARY', label: 'Legendary' }
      ]
    }
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.adminService.list<BadgeModel>('/api/admin/badges', this.page(), this.size()).subscribe({
      next: (res) => {
        this.badges.set(res.content || []);
        this.totalElements.set(res.totalElements || 0);
        this.loading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load badges data');
        this.loading.set(false);
      }
    });
  }

  onPageChange(e: { page: number; size: number }): void {
    this.page.set(e.page);
    this.size.set(e.size);
    this.loadData();
  }

  openCreateModal(): void {
    this.isEditMode.set(false);
    this.badgeForm = {
      name: '',
      hindiName: '',
      description: '',
      hindiDescription: '',
      category: 'SOIL',
      rarity: 'BRONZE',
      criteriaType: 'PROFILE_COMPLETE',
      thresholdValue: 1,
      gradientStyle: 'from-emerald-600 to-teal-800',
      pointsRequired: 50
    };
    this.showEditModal.set(true);
  }

  onActionClick(event: { action: string; row: BadgeModel }): void {
    if (event.action === 'edit') {
      this.isEditMode.set(true);
      this.selectedBadge.set(event.row);
      this.badgeForm = { ...event.row };
      this.showEditModal.set(true);
    } else if (event.action === 'delete') {
      this.selectedBadge.set(event.row);
      this.showDeleteDialog.set(true);
    }
  }

  saveBadge(): void {
    if (!this.badgeForm.name.trim()) {
      this.toastr.warning('Please enter a badge name');
      return;
    }

    if (this.isEditMode() && this.selectedBadge()?.id) {
      this.adminService.update<BadgeModel>('/api/admin/badges', this.selectedBadge()!.id!, this.badgeForm).subscribe({
        next: () => {
          this.toastr.success('Badge definition updated successfully');
          this.showEditModal.set(false);
          this.loadData();
        },
        error: (err) => this.toastr.error(err.error?.message || 'Failed to update badge')
      });
    } else {
      this.adminService.create<BadgeModel>('/api/admin/badges', this.badgeForm).subscribe({
        next: () => {
          this.toastr.success('New badge created successfully');
          this.showEditModal.set(false);
          this.loadData();
        },
        error: (err) => this.toastr.error(err.error?.message || 'Failed to create badge')
      });
    }
  }

  confirmDelete(): void {
    const badge = this.selectedBadge();
    if (!badge?.id) return;

    this.adminService.remove('/api/admin/badges', badge.id).subscribe({
      next: () => {
        this.toastr.success('Badge deleted successfully');
        this.showDeleteDialog.set(false);
        this.loadData();
      },
      error: (err) => this.toastr.error(err.error?.message || 'Failed to delete badge')
    });
  }
}
