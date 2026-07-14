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
  selector: 'fs-admin-resources',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent, AdminDataTableComponent, AdminModalComponent, AdminConfirmDialogComponent],
  template: `
    <div class="space-y-4">
      <fs-admin-page-header title="Resources Management" subtitle="Manage educational resources and learning materials">
        <button (click)="onAdd()" class="fs-btn-primary text-sm flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Add Resource
        </button>
      </fs-admin-page-header>

      <fs-admin-data-table
        [columns]="columns" [data]="resources()" [loading]="loading()"
        [totalElements]="totalElements()" [page]="page()" [pageSize]="size()"
        [rowActions]="rowActions" [selectable]="true"
        searchPlaceholder="Search resources..." emptyMessage="No resources found"
        (pageChange)="onPageChange($event)" (searchChange)="onSearch($event)" (rowActionEvent)="onRowAction($event)" />

      <fs-admin-modal [open]="showModal()" [title]="editMode() ? 'Edit Resource' : 'Add Resource'" (close)="showModal.set(false)">
        <form (ngSubmit)="onSave()" class="space-y-4">
          <div class="grid sm:grid-cols-2 gap-4">
            <div><label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Title</label>
              <input type="text" [(ngModel)]="formData.title" name="title" required class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white" /></div>
            <div><label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Content Type</label>
              <select [(ngModel)]="formData.contentType" name="contentType" class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white">
                <option value="VIDEO">Video</option><option value="ARTICLE">Article</option><option value="PDF">PDF</option><option value="INFOGRAPHIC">Infographic</option>
              </select></div>
            <div><label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Topic</label>
              <input type="text" [(ngModel)]="formData.topic" name="topic" class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white" /></div>
            <div><label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Crop Type</label>
              <input type="text" [(ngModel)]="formData.cropType" name="cropType" class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white" /></div>
            <div><label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Difficulty</label>
              <select [(ngModel)]="formData.difficultyLevel" name="difficultyLevel" class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white">
                <option value="BEGINNER">Beginner</option><option value="INTERMEDIATE">Intermediate</option><option value="ADVANCED">Advanced</option>
              </select></div>
            <div><label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Language</label>
              <input type="text" [(ngModel)]="formData.language" name="language" class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white" /></div>
            <div class="sm:col-span-2"><label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Content URL</label>
              <input type="url" [(ngModel)]="formData.contentUrl" name="contentUrl" class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white" /></div>
          </div>
          <div><label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Description</label>
            <textarea [(ngModel)]="formData.description" name="description" rows="3" class="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2 text-sm text-slate-900 dark:text-white"></textarea></div>
        </form>
        <div footer>
          <button (click)="showModal.set(false)" class="px-4 py-2 text-sm border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl">Cancel</button>
          <button (click)="onSave()" class="fs-btn-primary text-sm">{{ editMode() ? 'Save Changes' : 'Create' }}</button>
        </div>
      </fs-admin-modal>

      <fs-admin-confirm-dialog [open]="showDeleteDialog()" title="Delete Resource" message="Are you sure?"
        (confirm)="confirmDelete()" (cancel)="showDeleteDialog.set(false)" />
    </div>
  `
})
export class AdminResourcesComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toastr = inject(ToastrService);
  readonly resources = signal<any[]>([]);
  readonly loading = signal(true);
  readonly totalElements = signal(0);
  readonly page = signal(0);
  readonly size = signal(10);
  readonly showModal = signal(false);
  readonly editMode = signal(false);
  readonly showDeleteDialog = signal(false);
  private deleteId = 0;
  formData: any = {};

  readonly columns: TableColumn[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'contentType', label: 'Type', type: 'badge' },
    { key: 'topic', label: 'Topic' },
    { key: 'difficultyLevel', label: 'Difficulty', type: 'badge' },
    { key: 'language', label: 'Language' },
    { key: 'id', label: 'Actions', type: 'actions', align: 'right' }
  ];
  readonly rowActions: TableAction[] = [
    { label: 'Edit', action: 'edit', color: 'primary' },
    { label: 'Delete', action: 'delete', color: 'danger' }
  ];

  ngOnInit(): void { this.loadData(); }
  loadData(): void {
    this.loading.set(true);
    this.adminService.list('/api/admin/resources', this.page(), this.size()).subscribe({
      next: (res) => { this.resources.set(res.content); this.totalElements.set(res.totalElements); this.loading.set(false); },
      error: () => { this.toastr.error('Failed to load resources'); this.loading.set(false); }
    });
  }
  onPageChange(e: { page: number; size: number }): void { this.page.set(e.page); this.size.set(e.size); this.loadData(); }
  onSearch(term: string): void { this.page.set(0); this.loadData(); }
  onAdd(): void { this.formData = { contentType: 'ARTICLE', difficultyLevel: 'BEGINNER' }; this.editMode.set(false); this.showModal.set(true); }
  onRowAction(e: { action: string; row: any }): void {
    if (e.action === 'edit') { this.formData = { ...e.row }; this.editMode.set(true); this.showModal.set(true); }
    if (e.action === 'delete') { this.deleteId = e.row.id; this.showDeleteDialog.set(true); }
  }
  onSave(): void {
    const obs = this.editMode() ? this.adminService.update('/api/admin/resources', this.formData.id, this.formData) : this.adminService.create('/api/admin/resources', this.formData);
    obs.subscribe({ next: () => { this.toastr.success(this.editMode() ? 'Updated' : 'Created'); this.showModal.set(false); this.loadData(); }, error: () => this.toastr.error('Failed') });
  }
  confirmDelete(): void {
    this.adminService.remove('/api/admin/resources', this.deleteId).subscribe({
      next: () => { this.toastr.success('Deleted'); this.showDeleteDialog.set(false); this.loadData(); }, error: () => this.toastr.error('Failed')
    });
  }
}
