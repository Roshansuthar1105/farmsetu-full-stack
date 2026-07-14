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
    <div class="mb-5 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
      <!-- Search & Filters -->
      <div class="flex flex-wrap gap-2.5 items-center flex-1 w-full lg:w-auto">
        <!-- Search -->
        <div class="relative flex-1 min-w-[240px] max-w-sm">
          <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input type="text"
            [placeholder]="searchPlaceholder"
            [ngModel]="searchTerm()"
            (ngModelChange)="onSearchChange($event)"
            class="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.01)]" />
        </div>

        <!-- Filters -->
        @for (filter of filters; track filter.key) {
          <select
            [ngModel]="activeFilters()[filter.key] || ''"
            (ngModelChange)="onFilterChange(filter.key, $event)"
            class="text-xs rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 min-w-[140px] cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
            <option value="">All {{ filter.label }}</option>
            @for (opt of filter.options; track opt.value) {
              <option [value]="opt.value">{{ opt.label }}</option>
            }
          </select>
        }
      </div>

      <!-- Actions -->
      <div class="flex gap-2 items-center shrink-0 w-full lg:w-auto justify-end">
        <!-- Export -->
        @if (exportable) {
          <button (click)="onExportCSV()"
            class="px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-650 dark:text-slate-300 bg-white/60 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all duration-250 flex items-center gap-1.5 shadow-sm active:scale-[0.98]">
            <svg class="w-3.5 h-3.5 text-slate-550 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            Export
          </button>
        }

        <!-- Column Toggle -->
        <div class="relative">
          <button (click)="showColumnPicker.set(!showColumnPicker())"
            class="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 bg-white/60 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all duration-250 shadow-sm active:scale-[0.98]">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
            </svg>
          </button>
          @if (showColumnPicker()) {
            <div class="absolute right-0 top-12.5 z-20 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 min-w-[220px] backdrop-blur-md transition-all duration-200 animate-in fade-in zoom-in-95">
              <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Display Columns</p>
              <div class="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-slate-750">
                @for (col of columns; track col.key) {
                  @if (col.type !== 'actions') {
                    <label class="flex items-center gap-2.5 py-1.5 px-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                      <input type="checkbox"
                        [checked]="isColumnVisible(col)"
                        (change)="toggleColumn(col)"
                        class="rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500/30 w-3.5 h-3.5 bg-white/80 dark:bg-slate-900/50" />
                      {{ col.label }}
                    </label>
                  }
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Table Container -->
    <div class="relative bg-white/50 dark:bg-slate-900/25 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-slate-200/60 dark:border-slate-800/80 overflow-hidden transition-all duration-300">
      <!-- Subtle top gradient strip -->
      <div class="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-emerald-550 via-teal-500 to-emerald-600"></div>

      <div class="overflow-x-auto pt-[2.5px]">
        <table class="min-w-full divide-y divide-slate-200/30 dark:divide-slate-800/35">
          <thead class="bg-slate-50/30 dark:bg-slate-950/15">
            <tr>
              @if (selectable) {
                <th class="px-5 py-4 w-12 text-center select-none">
                  <input type="checkbox"
                    [checked]="allSelected()"
                    (change)="toggleSelectAll()"
                    class="rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500/30 w-3.5 h-3.5 bg-white/80 dark:bg-slate-900/50 cursor-pointer transition" />
                </th>
              }
              @for (col of visibleColumns(); track col.key) {
                <th class="px-6 py-4.5 text-left text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider select-none hover:bg-slate-100/20 dark:hover:bg-slate-800/5 transition-colors duration-200"
                  [style.width]="col.width || 'auto'"
                  [class.text-right]="col.align === 'right'"
                  [class.text-center]="col.align === 'center'"
                  [class.cursor-pointer]="col.sortable"
                  (click)="col.sortable && onSortChange(col.key)">
                  <div class="flex items-center gap-1.5" [class.justify-end]="col.align === 'right'" [class.justify-center]="col.align === 'center'">
                    {{ col.label }}
                    @if (col.sortable) {
                      <span class="text-slate-400 dark:text-slate-550">
                        @if (sortKey() === col.key) {
                          <svg class="w-3.5 h-3.5 transition-transform" [class.rotate-180]="sortDir() === 'desc'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
                          </svg>
                        } @else {
                          <svg class="w-3 h-3 opacity-35" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>
                          </svg>
                        }
                      </span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100/50 dark:divide-slate-800/30">
            <!-- Loading Skeleton -->
            @if (loading) {
              @for (i of skeletonRows; track i) {
                <tr class="animate-pulse">
                  @if (selectable) { <td class="px-5 py-4.5"><div class="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded"></div></td> }
                  @for (col of visibleColumns(); track col.key) {
                    <td class="px-6 py-4.5">
                      <div class="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-lg" [style.width]="getSkeletonWidth(col)"></div>
                    </td>
                  }
                </tr>
              }
            }

            <!-- Empty State -->
            @if (!loading && data.length === 0) {
              <tr>
                <td [attr.colspan]="visibleColumns().length + (selectable ? 1 : 0)" class="text-center py-20 bg-white/10 dark:bg-transparent">
                  <div class="flex flex-col items-center gap-3.5 max-w-sm mx-auto">
                    <div class="w-14 h-14 rounded-2xl bg-slate-100/70 dark:bg-slate-800/40 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                      <svg class="w-6 h-6 text-slate-400 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                      </svg>
                    </div>
                    <p class="text-xs font-bold text-slate-705 dark:text-slate-300">{{ emptyMessage }}</p>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 leading-normal">Try adjusting search criteria or selecting other filter options.</p>
                  </div>
                </td>
              </tr>
            }

            <!-- Data Rows -->
            @if (!loading) {
              @for (row of data; track trackByFn(row)) {
                <tr class="hover:bg-gradient-to-r hover:from-slate-50/30 hover:to-slate-100/20 dark:hover:from-slate-800/10 dark:hover:to-slate-800/5 transition-all duration-250 relative border-b border-slate-100/50 dark:border-slate-850/60 group"
                  [ngClass]="{
                    'bg-emerald-500/[0.02] dark:bg-emerald-500/[0.02] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-gradient-to-b before:from-emerald-500 before:to-teal-500': isSelected(row)
                  }">
                  @if (selectable) {
                    <td class="px-5 py-4 text-center select-none">
                      <input type="checkbox"
                        [checked]="isSelected(row)"
                        (change)="toggleSelect(row)"
                        class="rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500/30 w-3.5 h-3.5 bg-white/80 dark:bg-slate-900/50 cursor-pointer transition" />
                    </td>
                  }
                  @for (col of visibleColumns(); track col.key) {
                    <td class="px-6 py-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-300 transition-colors group-hover:text-slate-900 dark:group-hover:text-white"
                      [class.text-right]="col.align === 'right'"
                      [class.text-center]="col.align === 'center'">
                      @switch (col.type) {
                        @case ('badge') {
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full border shadow-sm"
                            [class]="getBadgeClasses(getNestedValue(row, col.key), col.badgeColors)">
                            <span class="w-1.5 h-1.5 rounded-full animate-pulse-subtle"
                              [ngClass]="getBadgeDotClass(getNestedValue(row, col.key))"></span>
                            {{ getNestedValue(row, col.key) }}
                          </span>
                        }
                        @case ('boolean') {
                          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                            [ngClass]="getNestedValue(row, col.key) ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-500/25' : 'bg-slate-500/10 text-slate-550 dark:text-slate-450 border-slate-500/25'">
                            <span class="w-1.5 h-1.5 rounded-full animate-pulse-subtle" [ngClass]="getNestedValue(row, col.key) ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-slate-400'"></span>
                            {{ getNestedValue(row, col.key) ? 'Yes' : 'No' }}
                          </span>
                        }
                        @case ('currency') {
                          <span class="font-bold text-slate-800 dark:text-slate-100 tabular-nums">₹{{ getNestedValue(row, col.key) | number:'1.2-2' }}</span>
                        }
                        @case ('number') {
                          <span class="font-semibold text-slate-750 dark:text-slate-200 tabular-nums">{{ getNestedValue(row, col.key) | number }}</span>
                        }
                        @case ('date') {
                          <span class="text-slate-500 dark:text-slate-400 font-medium">{{ formatDate(getNestedValue(row, col.key)) }}</span>
                        }
                        @case ('image') {
                          <div class="w-9 h-9 rounded-xl bg-slate-150 dark:bg-slate-800 overflow-hidden border border-slate-200/50 dark:border-slate-750/50 shadow-sm group-hover:scale-105 transition-transform duration-250">
                            @if (getNestedValue(row, col.key)) {
                              <img [src]="getNestedValue(row, col.key)" class="w-full h-full object-cover" alt="" />
                            } @else {
                              <div class="w-full h-full flex items-center justify-center text-slate-450 dark:text-slate-500 text-xs font-bold uppercase bg-slate-50 dark:bg-slate-900">
                                {{ (row['name'] || row['title'] || '?').charAt(0) }}
                              </div>
                            }
                          </div>
                        }
                        @case ('actions') {
                          <div class="flex items-center justify-end gap-2">
                            @for (action of rowActions; track action.action) {
                              @if (!action.visible || action.visible(row)) {
                                <button (click)="onRowAction(action.action, row)"
                                  class="text-[10px] font-bold tracking-tight hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-1 shadow-sm"
                                  [class]="getActionClasses(action.color)">
                                  @if (action.icon) {
                                    <span class="material-icons text-[11px]">{{ action.icon }}</span>
                                  }
                                  {{ action.label }}
                                </button>
                              }
                            }
                          </div>
                        }
                        @case ('custom') {
                          <span class="text-xs font-medium" [innerHTML]="col.render ? col.render(row) : getNestedValue(row, col.key)"></span>
                        }
                        @default {
                          <span class="font-medium">{{ getNestedValue(row, col.key) || '—' }}</span>
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
        <div class="px-6 py-4 bg-slate-50/20 dark:bg-slate-950/10 border-t border-slate-200/50 dark:border-slate-800/60 flex flex-col sm:flex-row justify-between items-center gap-4 select-none">
          <div class="flex items-center gap-3.5">
            <span class="text-xs text-slate-550 dark:text-slate-400">
              Showing <span class="font-bold text-slate-700 dark:text-slate-205">{{ page * pageSize + 1 }}</span>
              to <span class="font-bold text-slate-700 dark:text-slate-205">{{ min((page + 1) * pageSize, totalElements) }}</span>
              of <span class="font-bold text-slate-700 dark:text-slate-205">{{ totalElements }}</span>
            </span>
            <select [ngModel]="pageSize" (ngModelChange)="onPageSizeChange($event)"
              class="text-[11px] font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 px-2.5 py-1 focus:outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <option [value]="10">10 / page</option>
              <option [value]="20">20 / page</option>
              <option [value]="50">50 / page</option>
              <option [value]="100">100 / page</option>
            </select>
          </div>
          <div class="flex items-center gap-1.5">
            <button (click)="goToPage(0)" [disabled]="page === 0"
              class="p-2 rounded-xl text-slate-500 dark:text-slate-450 hover:bg-slate-100/60 dark:hover:bg-slate-850/60 border border-slate-200/30 dark:border-slate-800/50 disabled:opacity-30 disabled:pointer-events-none transition active:scale-95 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
            </button>
            <button (click)="goToPage(page - 1)" [disabled]="page === 0"
              class="p-2 rounded-xl text-slate-500 dark:text-slate-455 hover:bg-slate-100/60 dark:hover:bg-slate-850/60 border border-slate-200/30 dark:border-slate-800/50 disabled:opacity-30 disabled:pointer-events-none transition active:scale-95 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>

            @for (p of visiblePages(); track p) {
              <button (click)="goToPage(p)"
                class="w-8 h-8 rounded-xl text-xs font-bold transition active:scale-95 shadow-sm flex items-center justify-center"
                [ngClass]="p === page ? 'bg-gradient-to-br from-emerald-500 to-teal-550 text-white shadow-emerald-500/20' : 'bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'">
                {{ p + 1 }}
              </button>
            }

            <button (click)="goToPage(page + 1)" [disabled]="page >= totalPages - 1"
              class="p-2 rounded-xl text-slate-500 dark:text-slate-450 hover:bg-slate-100/60 dark:hover:bg-slate-850/60 border border-slate-200/30 dark:border-slate-800/50 disabled:opacity-30 disabled:pointer-events-none transition active:scale-95 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
            <button (click)="goToPage(totalPages - 1)" [disabled]="page >= totalPages - 1"
              class="p-2 rounded-xl text-slate-500 dark:text-slate-450 hover:bg-slate-100/60 dark:hover:bg-slate-850/60 border border-slate-200/30 dark:border-slate-800/50 disabled:opacity-30 disabled:pointer-events-none transition active:scale-95 flex items-center justify-center">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      }
    </div>

    <!-- Floating Bulk Actions Drawer -->
    @if (selectedRows().length > 0 && bulkActions.length > 0) {
      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3.5 rounded-2xl bg-slate-900/90 dark:bg-slate-950/95 border border-emerald-500/30 text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 animate-slide-up select-none">
        <div class="flex items-center gap-2 border-r border-slate-800 dark:border-slate-800/80 pr-4">
          <span class="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950">
            {{ selectedRows().length }}
          </span>
          <span class="text-xs font-semibold text-slate-300">selected</span>
        </div>
        <div class="flex gap-2 items-center">
          @for (action of bulkActions; track action.action) {
            <button (click)="onBulkAction(action.action)"
              class="px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5 shadow-sm"
              [class]="getBulkActionClasses(action.color)">
              @if (action.icon) {
                <span class="material-icons text-sm">{{ action.icon }}</span>
              }
              {{ action.label }}
            </button>
          }
          <button (click)="toggleSelectAll()"
            class="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all duration-200">
            Cancel
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes slide-up {
      from {
        transform: translate(-50%, 150%) scale(0.95);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0) scale(1);
        opacity: 1;
      }
    }
    .animate-slide-up {
      animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes pulse-subtle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.55; transform: scale(0.9); }
    }
    .animate-pulse-subtle {
      animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
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
      ACTIVE: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      PAID: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      DELIVERED: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      FARMER: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      PENDING: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      CONFIRMED: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      SHIPPED: 'bg-indigo-500/10 text-indigo-400 dark:text-indigo-400 border border-indigo-500/20',
      EXPERT: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      ADMIN: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20',
      SUPER_ADMIN: 'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/20',
      SELLER: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20',
      FAILED: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
      CANCELLED: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
      SOLD: 'bg-slate-500/10 text-slate-650 dark:text-slate-400 border border-slate-500/20',
      REFUNDED: 'bg-slate-500/10 text-slate-650 dark:text-slate-400 border border-slate-500/20',
      RETURNED: 'bg-slate-500/10 text-slate-650 dark:text-slate-400 border border-slate-500/20',
    };
    return defaults[value] || 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20';
  }

  getBadgeDotClass(value: string): string {
    const defaults: Record<string, string> = {
      ACTIVE: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
      PAID: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
      DELIVERED: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
      FARMER: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
      PENDING: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
      CONFIRMED: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]',
      SHIPPED: 'bg-indigo-500 shadow-[0_0_8px_#6366f1]',
      EXPERT: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]',
      ADMIN: 'bg-violet-500 shadow-[0_0_8px_#8b5cf6]',
      SUPER_ADMIN: 'bg-fuchsia-500 shadow-[0_0_8px_#d946ef]',
      SELLER: 'bg-pink-500 shadow-[0_0_8px_#ec4899]',
      FAILED: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
      CANCELLED: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
      SOLD: 'bg-slate-550 shadow-[0_0_8px_#6b7280]',
      REFUNDED: 'bg-slate-550 shadow-[0_0_8px_#6b7280]',
      RETURNED: 'bg-slate-550 shadow-[0_0_8px_#6b7280]',
    };
    return defaults[value] || 'bg-slate-400';
  }

  getActionClasses(color?: string): string {
    const map: Record<string, string> = {
      primary: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/15 border border-emerald-500/10 hover:border-emerald-500/30 px-2.5 py-1.5 rounded-lg transition-all duration-250 shadow-[0_1px_2px_rgba(16,185,129,0.02)]',
      danger: 'text-red-700 dark:text-red-400 bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/30 px-2.5 py-1.5 rounded-lg transition-all duration-250 shadow-[0_1px_2px_rgba(239,68,68,0.02)]',
      warning: 'text-amber-700 dark:text-amber-400 bg-amber-500/5 hover:bg-amber-500/15 border border-amber-500/10 hover:border-amber-500/30 px-2.5 py-1.5 rounded-lg transition-all duration-250 shadow-[0_1px_2px_rgba(245,158,11,0.02)]',
      info: 'text-sky-700 dark:text-sky-400 bg-sky-500/5 hover:bg-sky-500/15 border border-sky-500/10 hover:border-sky-500/30 px-2.5 py-1.5 rounded-lg transition-all duration-250 shadow-[0_1px_2px_rgba(59,130,246,0.02)]'
    };
    return map[color || 'primary'] || map['primary'];
  }

  getBulkActionClasses(color?: string): string {
    const map: Record<string, string> = {
      primary: 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 border border-emerald-500/20',
      danger: 'bg-red-500 hover:bg-red-600 text-white border border-red-500/20',
      warning: 'bg-amber-500 hover:bg-amber-600 text-slate-950 border border-amber-500/20'
    };
    return map[color || 'primary'] || map['primary'];
  }
}
