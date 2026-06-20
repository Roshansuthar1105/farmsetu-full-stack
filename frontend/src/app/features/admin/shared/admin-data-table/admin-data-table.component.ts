import { Component, Input, Output, EventEmitter, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge' | 'image' | 'boolean' | 'currency' | 'actions' | 'custom';
  badgeColors?: Record<string, string>;
  width?: string;
  align?: 'left' | 'center' | 'right';
  visible?: boolean;
  render?: (row: any) => string;
}

export interface TableAction {
  label: string;
  icon?: string;
  color?: 'primary' | 'danger' | 'warning' | 'info';
  action: string;
  visible?: (row: any) => boolean;
}

export interface BulkAction {
  label: string;
  action: string;
  color?: 'primary' | 'danger' | 'warning';
  icon?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

@Component({
  selector: 'fs-admin-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Toolbar -->
    <div class="mb-4 flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
      <!-- Search & Filters -->
      <div class="flex flex-wrap gap-2 items-center flex-1 w-full lg:w-auto">
        <!-- Search -->
        <div class="relative flex-1 min-w-[200px] max-w-sm">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text"
            [placeholder]="searchPlaceholder"
            [ngModel]="searchTerm()"
            (ngModelChange)="onSearchChange($event)"
            class="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition" />
        </div>

        <!-- Filters -->
        @for (filter of filters; track filter.key) {
          <select
            [ngModel]="activeFilters()[filter.key] || ''"
            (ngModelChange)="onFilterChange(filter.key, $event)"
            class="text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition min-w-[130px]">
            <option value="">All {{ filter.label }}</option>
            @for (opt of filter.options; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
        }
      </div>

      <!-- Actions -->
      <div class="flex gap-2 items-center shrink-0">
        <!-- Bulk Actions -->
        @if (selectedRows().length > 0 && bulkActions.length > 0) {
          <div class="flex gap-2 items-center px-3 py-1.5 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20">
            <span class="text-xs font-medium text-primary">{{ selectedRows().length }} selected</span>
            @for (action of bulkActions; track action.action) {
              <button (click)="onBulkAction(action.action)"
                class="px-3 py-1.5 text-xs font-medium rounded-lg transition"
                [class]="getBulkActionClasses(action.color)">
                {{ action.label }}
              </button>
            }
          </div>
        }

        <!-- Export -->
        @if (exportable) {
          <button (click)="onExportCSV()"
            class="px-3 py-2.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            Export
          </button>
        }

        <!-- Column Toggle -->
        <div class="relative">
          <button (click)="showColumnPicker.set(!showColumnPicker())"
            class="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
            </svg>
          </button>
          @if (showColumnPicker()) {
            <div class="absolute right-0 top-12 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 min-w-[180px]">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Columns</p>
              @for (col of columns; track col.key) {
                @if (col.type !== 'actions') {
                  <label class="flex items-center gap-2 py-1.5 px-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg">
                    <input type="checkbox"
                      [checked]="isColumnVisible(col)"
                      (change)="toggleColumn(col)"
                      class="rounded border-slate-300 text-primary focus:ring-primary/30 w-3.5 h-3.5" />
                    {{ col.label }}
                  </label>
                }
              }
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-800/60 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700/60 overflow-hidden backdrop-blur-sm">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-700/60">
          <thead class="bg-slate-50/80 dark:bg-slate-900/40">
            <tr>
              @if (selectable) {
                <th class="px-4 py-3.5 w-10">
                  <input type="checkbox"
                    [checked]="allSelected()"
                    (change)="toggleSelectAll()"
                    class="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/30 w-3.5 h-3.5" />
                </th>
              }
              @for (col of visibleColumns(); track col.key) {
                <th class="px-5 py-3.5 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  [style.width]="col.width || 'auto'"
                  [class.text-right]="col.align === 'right'"
                  [class.text-center]="col.align === 'center'"
                  [class.cursor-pointer]="col.sortable"
                  (click)="col.sortable && onSortChange(col.key)">
                  <div class="flex items-center gap-1" [class.justify-end]="col.align === 'right'" [class.justify-center]="col.align === 'center'">
                    {{ col.label }}
                    @if (col.sortable) {
                      <span class="text-slate-300 dark:text-slate-600">
                        @if (sortKey() === col.key) {
                          <svg class="w-3 h-3 transition-transform" [class.rotate-180]="sortDir() === 'desc'" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                          </svg>
                        } @else {
                          <svg class="w-3 h-3 opacity-40" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                          </svg>
                        }
                      </span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/40">
            <!-- Loading Skeleton -->
            @if (loading) {
              @for (i of skeletonRows; track i) {
                <tr class="animate-pulse">
                  @if (selectable) { <td class="px-4 py-4"><div class="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded"></div></td> }
                  @for (col of visibleColumns(); track col.key) {
                    <td class="px-5 py-4">
                      <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg" [style.width]="getSkeletonWidth(col)"></div>
                    </td>
                  }
                </tr>
              }
            }

            <!-- Empty State -->
            @if (!loading && data.length === 0) {
              <tr>
                <td [attr.colspan]="visibleColumns().length + (selectable ? 1 : 0)" class="text-center py-16">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <svg class="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                      </svg>
                    </div>
                    <p class="text-sm font-medium text-slate-500 dark:text-slate-400">{{ emptyMessage }}</p>
                    <p class="text-xs text-slate-400 dark:text-slate-500">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            }

            <!-- Data Rows -->
            @if (!loading) {
              @for (row of data; track trackByFn(row)) {
                <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150"
                  [ngClass]="{
                    'bg-primary-50 dark:bg-primary-950/10': isSelected(row)
                  }">
                  @if (selectable) {
                    <td class="px-4 py-3.5">
                      <input type="checkbox"
                        [checked]="isSelected(row)"
                        (change)="toggleSelect(row)"
                        class="rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/30 w-3.5 h-3.5" />
                    </td>
                  }
                  @for (col of visibleColumns(); track col.key) {
                    <td class="px-5 py-3.5 whitespace-nowrap text-sm"
                      [class.text-right]="col.align === 'right'"
                      [class.text-center]="col.align === 'center'">
                      @switch (col.type) {
                        @case ('badge') {
                          <span class="px-2.5 py-1 text-[11px] font-semibold rounded-full"
                            [class]="getBadgeClasses(getNestedValue(row, col.key), col.badgeColors)">
                            {{ getNestedValue(row, col.key) }}
                          </span>
                        }
                        @case ('boolean') {
                          <span class="flex items-center gap-1.5">
                            @if (getNestedValue(row, col.key)) {
                              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                              <span class="text-emerald-600 dark:text-emerald-400 text-xs font-medium">Yes</span>
                            } @else {
                              <span class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                              <span class="text-slate-500 text-xs font-medium">No</span>
                            }
                          </span>
                        }
                        @case ('currency') {
                          <span class="font-semibold text-slate-900 dark:text-white tabular-nums">₹{{ getNestedValue(row, col.key) | number:'1.2-2' }}</span>
                        }
                        @case ('number') {
                          <span class="text-slate-700 dark:text-slate-300 tabular-nums">{{ getNestedValue(row, col.key) | number }}</span>
                        }
                        @case ('date') {
                          <span class="text-slate-500 dark:text-slate-400 text-xs">{{ formatDate(getNestedValue(row, col.key)) }}</span>
                        }
                        @case ('image') {
                          <div class="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 overflow-hidden">
                            @if (getNestedValue(row, col.key)) {
                              <img [src]="getNestedValue(row, col.key)" class="w-full h-full object-cover" alt="" />
                            } @else {
                              <div class="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold">
                                {{ (row['name'] || row['title'] || '?').charAt(0) }}
                              </div>
                            }
                          </div>
                        }
                        @case ('actions') {
                          <div class="flex items-center justify-end gap-1">
                            @for (action of rowActions; track action.action) {
                              @if (!action.visible || action.visible(row)) {
                                <button (click)="onRowAction(action.action, row)"
                                  class="p-1.5 rounded-lg transition-colors text-xs font-medium"
                                  [class]="getActionClasses(action.color)">
                                  {{ action.label }}
                                </button>
                              }
                            }
                          </div>
                        }
                        @case ('custom') {
                          <span class="text-slate-700 dark:text-slate-300 text-sm" [innerHTML]="col.render ? col.render(row) : getNestedValue(row, col.key)"></span>
                        }
                        @default {
                          <span class="text-slate-700 dark:text-slate-300">{{ getNestedValue(row, col.key) || '—' }}</span>
                        }
                      }
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (totalElements > 0) {
        <div class="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-500 dark:text-slate-400">
              Showing <span class="font-semibold text-slate-700 dark:text-slate-300">{{ page * pageSize + 1 }}</span>
              to <span class="font-semibold text-slate-700 dark:text-slate-300">{{ min((page + 1) * pageSize, totalElements) }}</span>
              of <span class="font-semibold text-slate-700 dark:text-slate-300">{{ totalElements }}</span>
            </span>
            <select [ngModel]="pageSize" (ngModelChange)="onPageSizeChange($event)"
              class="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 focus:outline-none">
              <option [value]="10">10</option>
              <option [value]="20">20</option>
              <option [value]="50">50</option>
              <option [value]="100">100</option>
            </select>
          </div>
          <div class="flex items-center gap-1">
            <button (click)="goToPage(0)" [disabled]="page === 0"
              class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
            </button>
            <button (click)="goToPage(page - 1)" [disabled]="page === 0"
              class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>

            @for (p of visiblePages(); track p) {
              <button (click)="goToPage(p)"
                class="w-8 h-8 rounded-lg text-xs font-medium transition"
                [class.bg-primary]="p === page"
                [class.text-white]="p === page"
                [class.text-slate-600]="p !== page"
                [class.dark:text-slate-400]="p !== page"
                [class.hover:bg-slate-100]="p !== page"
                [class.dark:hover:bg-slate-700]="p !== page">
                {{ p + 1 }}
              </button>
            }

            <button (click)="goToPage(page + 1)" [disabled]="page >= totalPages - 1"
              class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
            <button (click)="goToPage(totalPages - 1)" [disabled]="page >= totalPages - 1"
              class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminDataTableComponent implements OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() loading = false;
  @Input() totalElements = 0;
  @Input() page = 0;
  @Input() pageSize = 10;
  @Input() rowActions: TableAction[] = [];
  @Input() bulkActions: BulkAction[] = [];
  @Input() filters: FilterOption[] = [];
  @Input() selectable = false;
  @Input() exportable = true;
  @Input() searchPlaceholder = 'Search...';
  @Input() emptyMessage = 'No data found';
  @Input() trackKey = 'id';

  @Output() pageChange = new EventEmitter<{ page: number; size: number }>();
  @Output() sortChange = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<Record<string, string>>();
  @Output() bulkActionEvent = new EventEmitter<{ action: string; rows: any[] }>();
  @Output() rowActionEvent = new EventEmitter<{ action: string; row: any }>();
  @Output() exportEvent = new EventEmitter<'csv' | 'excel'>();

  readonly searchTerm = signal('');
  readonly sortKey = signal('');
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly selectedRows = signal<any[]>([]);
  readonly showColumnPicker = signal(false);
  readonly hiddenColumns = signal<Set<string>>(new Set());
  readonly activeFilters = signal<Record<string, string>>({});

  readonly skeletonRows = Array.from({ length: 5 }, (_, i) => i);

  get totalPages(): number {
    return Math.ceil(this.totalElements / this.pageSize) || 1;
  }

  readonly visibleColumns = computed(() =>
    this.columns.filter(c => !this.hiddenColumns().has(c.key) && c.visible !== false)
  );

  readonly allSelected = computed(() =>
    this.data.length > 0 && this.selectedRows().length === this.data.length
  );

  readonly visiblePages = computed(() => {
    const total = this.totalPages;
    const current = this.page;
    const pages: number[] = [];
    const start = Math.max(0, current - 2);
    const end = Math.min(total - 1, current + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.selectedRows.set([]);
    }
  }

  trackByFn(row: any): any {
    return row[this.trackKey] ?? row;
  }

  getNestedValue(obj: any, key: string): any {
    return key.split('.').reduce((o, k) => o?.[k], obj);
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.searchChange.emit(term);
  }

  onSortChange(key: string): void {
    if (this.sortKey() === key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    }
    this.sortChange.emit({ key: this.sortKey(), direction: this.sortDir() });
  }

  onFilterChange(key: string, value: string): void {
    this.activeFilters.update(f => {
      const updated = { ...f };
      if (value) updated[key] = value;
      else delete updated[key];
      return updated;
    });
    this.filterChange.emit(this.activeFilters());
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages) {
      this.pageChange.emit({ page: p, size: this.pageSize });
    }
  }

  onPageSizeChange(size: number | string): void {
    this.pageChange.emit({ page: 0, size: Number(size) });
  }

  toggleSelect(row: any): void {
    this.selectedRows.update(rows => {
      const idx = rows.indexOf(row);
      return idx >= 0 ? rows.filter(r => r !== row) : [...rows, row];
    });
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedRows.set([]);
    } else {
      this.selectedRows.set([...this.data]);
    }
  }

  isSelected(row: any): boolean {
    return this.selectedRows().includes(row);
  }

  isColumnVisible(col: TableColumn): boolean {
    return !this.hiddenColumns().has(col.key);
  }

  toggleColumn(col: TableColumn): void {
    this.hiddenColumns.update(s => {
      const updated = new Set(s);
      if (updated.has(col.key)) updated.delete(col.key);
      else updated.add(col.key);
      return updated;
    });
  }

  onRowAction(action: string, row: any): void {
    this.rowActionEvent.emit({ action, row });
  }

  onBulkAction(action: string): void {
    this.bulkActionEvent.emit({ action, rows: this.selectedRows() });
  }

  onExportCSV(): void {
    const headers = this.visibleColumns()
      .filter(c => c.type !== 'actions')
      .map(c => c.label);
    const keys = this.visibleColumns()
      .filter(c => c.type !== 'actions')
      .map(c => c.key);
    const rows = this.data.map(row => keys.map(k => {
      const val = this.getNestedValue(row, k);
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : val ?? '';
    }));

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  min(a: number, b: number): number {
    return Math.min(a, b);
  }

  formatDate(value: any): string {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return String(value);
    }
  }

  getSkeletonWidth(col: TableColumn): string {
    const widths: Record<string, string> = {
      actions: '80px', image: '36px', boolean: '40px',
      badge: '70px', currency: '80px', number: '50px'
    };
    return widths[col.type || 'text'] || `${60 + Math.random() * 60}%`;
  }

  getBadgeClasses(value: string, colors?: Record<string, string>): string {
    if (colors && colors[value]) return colors[value];
    const defaults: Record<string, string> = {
      ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      FARMER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      SHIPPED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      EXPERT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      ADMIN: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
      SUPER_ADMIN: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
      SELLER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      SOLD: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
      REFUNDED: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
      RETURNED: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
    };
    return defaults[value] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  }

  getActionClasses(color?: string): string {
    const map: Record<string, string> = {
      primary: 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30',
      danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30',
      warning: 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30',
      info: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
    };
    return map[color || 'primary'] || map['primary'];
  }

  getBulkActionClasses(color?: string): string {
    const map: Record<string, string> = {
      primary: 'bg-primary text-white hover:bg-green-700',
      danger: 'bg-red-500 text-white hover:bg-red-600',
      warning: 'bg-amber-500 text-white hover:bg-amber-600'
    };
    return map[color || 'primary'] || map['primary'];
  }
}
