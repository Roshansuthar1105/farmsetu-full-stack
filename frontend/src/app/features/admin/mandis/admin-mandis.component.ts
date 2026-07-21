import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminService } from '../services/admin.service';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';
import { AdminModalComponent } from '../shared/admin-modal/admin-modal.component';
import { AdminConfirmDialogComponent } from '../shared/admin-confirm-dialog/admin-confirm-dialog.component';

export interface StagedMandi {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  address: string;
  operatingHours: string;
  contactPhone: string;
}

@Component({
  selector: 'fs-admin-mandis',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AdminPageHeaderComponent,
    AdminModalComponent,
    AdminConfirmDialogComponent
  ],
  template: `
    <div class="space-y-6 animate-fade-in pb-12">
      <fs-admin-page-header title="Mandi Directory & Bulk Management" subtitle="Manage Mandi locations, generate synthetic coordinates data, and perform bulk uploads.">
        <button (click)="onAdd()" class="fs-btn-primary flex items-center space-x-2 text-sm">
          <span>+ Add Single Mandi</span>
        </button>
      </fs-admin-page-header>

      <!-- SECTION 1: DATA SOURCE CONTROLS (GENERATOR & BULK UPLOAD) -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
          <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
            <button
              (click)="activeTab.set('generator')"
              [class]="activeTab() === 'generator' ? 'bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 shadow-sm font-extrabold' : 'text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white'"
              class="px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <span class="material-icons text-base">auto_awesome</span>
              Mandi Data Generator
            </button>
            <button
              (click)="activeTab.set('json')"
              [class]="activeTab() === 'json' ? 'bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 shadow-sm font-extrabold' : 'text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white'"
              class="px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <span class="material-icons text-base">code</span>
              Paste JSON Data
            </button>
            <button
              (click)="activeTab.set('file')"
              [class]="activeTab() === 'file' ? 'bg-white dark:bg-slate-800 text-green-600 dark:text-green-400 shadow-sm font-extrabold' : 'text-slate-500 font-medium hover:text-slate-900 dark:hover:text-white'"
              class="px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <span class="material-icons text-base">upload_file</span>
              Upload File
            </button>
          </div>

          <span class="text-xs text-slate-400">
            Staged mandis ready: <strong class="text-green-600 dark:text-green-400 font-extrabold">{{ stagedMandis().length }}</strong>
          </span>
        </div>

        <!-- TAB 1: DUMMY DATA GENERATOR -->
        @if (activeTab() === 'generator') {
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- States Multi-select -->
              <div>
                <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Target States</label>
                <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  @for (s of availableStates; track s) {
                    <button
                      type="button"
                      (click)="toggleState(s)"
                      [class]="isStateSelected(s) ? 'bg-green-600 text-white font-bold' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
                      class="px-2 py-0.5 rounded text-[11px] transition"
                    >
                      {{ s }}
                    </button>
                  }
                </div>
              </div>

              <!-- Lat/Lng Region Presets -->
              <div>
                <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Region Coordinates Preset</label>
                <select
                  [(ngModel)]="genRegion"
                  class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs dark:text-white outline-none"
                >
                  <option value="NCR">Delhi-NCR (Lat ~28.6, Lng ~77.2)</option>
                  <option value="MP">Madhya Pradesh (Lat ~23.2, Lng ~77.4)</option>
                  <option value="RJ">Rajasthan (Lat ~26.9, Lng ~75.8)</option>
                  <option value="PB">Punjab / Haryana (Lat ~30.9, Lng ~75.8)</option>
                </select>
              </div>

              <!-- Output Count -->
              <div>
                <label class="block text-[11px] font-bold text-slate-500 uppercase mb-1">Number of Mandis to Generate</label>
                <div class="flex gap-2 items-center">
                  <input
                    type="number"
                    [(ngModel)]="genCount"
                    min="1"
                    max="100"
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-xs font-bold dark:text-white outline-none"
                  >
                  <button (click)="genCount = 10" class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs font-bold rounded">10</button>
                  <button (click)="genCount = 25" class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-xs font-bold rounded">25</button>
                </div>
              </div>
            </div>

            <div class="flex justify-end pt-2">
              <button
                (click)="generateDummyMandis()"
                class="px-5 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold shadow transition active:scale-95 flex items-center gap-1.5"
              >
                <span class="material-icons text-base">auto_awesome</span>
                Generate & Stage {{ genCount }} Mandis
              </button>
            </div>
          </div>
        }

        <!-- TAB 2: JSON INPUT -->
        @if (activeTab() === 'json') {
          <div class="space-y-4">
            <textarea
              [(ngModel)]="jsonInput"
              rows="6"
              placeholder='[ { "name": "Karnal Grain Mandi", "state": "Haryana", "district": "Karnal", "latitude": 29.6857, "longitude": 76.9905, "address": "GT Road APMC", "operatingHours": "08:00 AM - 06:00 PM", "contactPhone": "0184-2255443" } ]'
              class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono dark:text-white outline-none"
            ></textarea>
            <div class="flex justify-between items-center">
              <button (click)="loadExampleJson()" class="px-3 py-1.5 text-xs border rounded-xl font-bold">Load Example JSON</button>
              <button (click)="parseJsonToStaging()" class="px-5 py-2 bg-green-600 text-white text-xs font-bold rounded-xl">Parse to Staging Table</button>
            </div>
          </div>
        }

        <!-- TAB 3: FILE UPLOAD -->
        @if (activeTab() === 'file') {
          <div class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-900/30">
            <input type="file" (change)="onFileSelected($event)" accept=".json,.csv" class="block mx-auto text-xs">
          </div>
        }
      </div>

      <!-- DRAFT STAGING TABLE -->
      @if (stagedMandis().length > 0) {
        <div class="bg-amber-50/40 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/40 rounded-3xl p-6 space-y-4 animate-scale-up">
          <div class="flex justify-between items-center pb-2 border-b border-amber-200 dark:border-amber-900/40">
            <h2 class="text-xs font-extrabold text-amber-900 dark:text-amber-300 uppercase">
              Draft Staging Table (Inspect Before DB Commit)
            </h2>
            <div class="flex gap-2">
              <button (click)="stagedMandis.set([])" class="px-3 py-1 text-xs border border-amber-300 text-amber-800 rounded-xl font-bold">Clear</button>
              <button (click)="commitStagedToDb()" [disabled]="uploading()" class="px-5 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl">
                {{ uploading() ? 'Saving...' : 'Save ' + stagedMandis().length + ' Mandis to DB' }}
              </button>
            </div>
          </div>

          <div class="overflow-x-auto max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-slate-800 border border-amber-200">
            <table class="w-full text-xs text-left">
              <thead class="bg-amber-100/80 dark:bg-amber-950/80 sticky top-0">
                <tr class="text-amber-900 dark:text-amber-200 uppercase text-[10px] font-bold">
                  <th class="p-2">Name</th>
                  <th class="p-2">District</th>
                  <th class="p-2">State</th>
                  <th class="p-2">Lat / Lng</th>
                  <th class="p-2">Hours</th>
                  <th class="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                @for (item of stagedMandis(); track item.id) {
                  <tr class="border-b border-slate-100 dark:border-slate-700/50">
                    <td class="p-2 font-bold">{{ item.name }}</td>
                    <td class="p-2">{{ item.district }}</td>
                    <td class="p-2">{{ item.state }}</td>
                    <td class="p-2 text-[11px] text-slate-500">{{ item.latitude.toFixed(4) }}, {{ item.longitude.toFixed(4) }}</td>
                    <td class="p-2">{{ item.operatingHours }}</td>
                    <td class="p-2 text-right">
                      <button (click)="removeStagedItem(item.id)" class="text-red-500 hover:bg-red-50 p-1 rounded">
                        <span class="material-icons text-sm">close</span>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- LIVE DATABASE MANDIS TABLE -->
      <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
        <!-- Search & Filter Controls -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div class="relative w-full sm:w-72">
            <span class="material-icons absolute left-3 top-2.5 text-slate-400 text-sm">search</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Search mandis..."
              class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs dark:text-white outline-none"
            >
          </div>

          @if (selectedIds().size > 0) {
            <div class="flex items-center gap-2 bg-red-50 dark:bg-red-950/40 p-2 rounded-xl border border-red-200">
              <span class="text-xs font-bold text-red-700">{{ selectedIds().size }} selected</span>
              <button (click)="onDeleteBatch()" [disabled]="deletingBatch()" class="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-lg">
                {{ deletingBatch() ? 'Deleting...' : 'Delete Selected' }}
              </button>
            </div>
          }
        </div>

        <div class="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-700">
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-900 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-100 dark:border-slate-700">
                <th class="p-3 w-8">
                  <input type="checkbox" [checked]="isAllSelected()" (change)="toggleSelectAll($event)">
                </th>
                <th class="p-3">Mandi Name</th>
                <th class="p-3">District</th>
                <th class="p-3">State</th>
                <th class="p-3">Coordinates</th>
                <th class="p-3">Phone</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (mandis().length === 0) {
                <tr><td colspan="7" class="py-8 text-center text-slate-400">No mandis found.</td></tr>
              } @else {
                @for (m of mandis(); track m.id) {
                  <tr [class.bg-green-50]="isItemSelected(m.id)" class="border-b border-slate-50 dark:border-slate-750 hover:bg-slate-50/50">
                    <td class="p-3">
                      <input type="checkbox" [checked]="isItemSelected(m.id)" (change)="toggleSelectItem(m.id)">
                    </td>
                    <td class="p-3 font-bold text-slate-800 dark:text-white">{{ m.name }}</td>
                    <td class="p-3 text-slate-600 dark:text-slate-300">{{ m.district }}</td>
                    <td class="p-3"><span class="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-semibold">{{ m.state }}</span></td>
                    <td class="p-3 text-[11px] text-slate-500">{{ m.latitude }}, {{ m.longitude }}</td>
                    <td class="p-3 text-slate-500">{{ m.contactPhone || 'N/A' }}</td>
                    <td class="p-3 text-right space-x-1">
                      <button (click)="onEditRow(m)" class="p-1 text-slate-400 hover:text-green-600"><span class="material-icons text-sm">edit</span></button>
                      <button (click)="onDeleteRow(m)" class="p-1 text-red-400 hover:text-red-600"><span class="material-icons text-sm">delete</span></button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <div class="flex justify-between items-center pt-2">
          <span class="text-[10px] text-slate-400">Page {{ page() + 1 }} · Total {{ totalElements() }}</span>
          <div class="flex gap-2">
            <button (click)="prevPage()" [disabled]="page() === 0" class="px-3 py-1 border rounded-lg text-xs disabled:opacity-50">Prev</button>
            <button (click)="nextPage()" [disabled]="(page() + 1) * size() >= totalElements()" class="px-3 py-1 border rounded-lg text-xs disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit/Add Modal -->
    <fs-admin-modal [open]="showEditModal()" [title]="isEditMode() ? 'Edit Mandi' : 'Add New Mandi'" (close)="showEditModal.set(false)">
      <form *ngIf="selectedMandi()" (ngSubmit)="onSave()" class="space-y-4">
        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Mandi Name</label>
            <input type="text" [(ngModel)]="selectedMandi().name" name="name" class="w-full rounded-lg border p-2 text-sm dark:bg-slate-900 dark:text-white" required />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Contact Phone</label>
            <input type="text" [(ngModel)]="selectedMandi().contactPhone" name="contactPhone" class="w-full rounded-lg border p-2 text-sm dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-500 mb-1">District</label>
            <input type="text" [(ngModel)]="selectedMandi().district" name="district" class="w-full rounded-lg border p-2 text-sm dark:bg-slate-900 dark:text-white" required />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-500 mb-1">State</label>
            <input type="text" [(ngModel)]="selectedMandi().state" name="state" class="w-full rounded-lg border p-2 text-sm dark:bg-slate-900 dark:text-white" required />
          </div>
        </div>

        <div class="grid sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Operating Hours</label>
            <input type="text" [(ngModel)]="selectedMandi().operatingHours" name="operatingHours" class="w-full rounded-lg border p-2 text-sm dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Latitude</label>
            <input type="number" step="0.000001" [(ngModel)]="selectedMandi().latitude" name="latitude" class="w-full rounded-lg border p-2 text-sm dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Longitude</label>
            <input type="number" step="0.000001" [(ngModel)]="selectedMandi().longitude" name="longitude" class="w-full rounded-lg border p-2 text-sm dark:bg-slate-900 dark:text-white" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold uppercase text-slate-500 mb-1">Address</label>
          <textarea [(ngModel)]="selectedMandi().address" name="address" rows="2" class="w-full rounded-lg border p-2 text-sm dark:bg-slate-900 dark:text-white"></textarea>
        </div>
      </form>
      <div footer>
        <button (click)="showEditModal.set(false)" class="px-4 py-2 border rounded-xl text-sm">Cancel</button>
        <button (click)="onSave()" class="fs-btn-primary text-sm ml-2">Save Mandi</button>
      </div>
    </fs-admin-modal>

    <!-- Delete Dialog -->
    <fs-admin-confirm-dialog
      [open]="showDeleteDialog()"
      title="Delete Mandi"
      message="Are you sure you want to delete this mandi?"
      (confirm)="confirmDelete()"
      (cancel)="showDeleteDialog.set(false)">
    </fs-admin-confirm-dialog>
  `
})
export class AdminMandisComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly toastr = inject(ToastrService);

  readonly mandis = signal<any[]>([]);
  readonly stagedMandis = signal<StagedMandi[]>([]);
  readonly selectedIds = signal<Set<number>>(new Set());

  readonly activeTab = signal<'generator' | 'json' | 'file'>('generator');
  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly deletingBatch = signal(false);

  readonly totalElements = signal(0);
  readonly page = signal(0);
  readonly size = signal(15);

  readonly showEditModal = signal(false);
  readonly isEditMode = signal(false);
  readonly showDeleteDialog = signal(false);
  readonly selectedMandi = signal<any>(null);

  searchQuery = '';
  jsonInput = '';

  // Generator Controls
  readonly availableStates = ['Delhi', 'Madhya Pradesh', 'Uttar Pradesh', 'Rajasthan', 'Haryana', 'Punjab', 'Maharashtra', 'Gujarat'];
  readonly selectedStates = signal<string[]>(['Delhi', 'Madhya Pradesh', 'Uttar Pradesh', 'Haryana']);
  genRegion = 'NCR';
  genCount = 10;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    const params: Record<string, string | number | boolean> = {};
    if (this.searchQuery) {
      params['search'] = this.searchQuery;
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

  // --- DUMMY GENERATOR ---
  isStateSelected(state: string): boolean {
    return this.selectedStates().includes(state);
  }

  toggleState(state: string): void {
    const list = [...this.selectedStates()];
    const idx = list.indexOf(state);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(state);
    this.selectedStates.set(list);
  }

  generateDummyMandis(): void {
    const states = this.selectedStates().length > 0 ? this.selectedStates() : ['Madhya Pradesh'];
    const count = Math.max(1, Math.min(100, this.genCount));
    const newItems: StagedMandi[] = [];

    let baseLat = 23.25;
    let baseLng = 77.41;

    if (this.genRegion === 'NCR') { baseLat = 28.61; baseLng = 77.20; }
    else if (this.genRegion === 'RJ') { baseLat = 26.91; baseLng = 75.78; }
    else if (this.genRegion === 'PB') { baseLat = 30.90; baseLng = 75.85; }

    const mandiTypes = ['APMC Yard', 'Fruit & Vegetable Market', 'Grain Market', 'Kisan Mandi', 'Subzi Yard'];

    for (let i = 0; i < count; i++) {
      const state = states[Math.floor(Math.random() * states.length)];
      const district = state + ' District ' + (i + 1);
      const type = mandiTypes[Math.floor(Math.random() * mandiTypes.length)];
      const name = district + ' ' + type + ' ' + (Math.floor(Math.random() * 89) + 10);

      const lat = baseLat + (Math.random() - 0.5) * 0.5;
      const lng = baseLng + (Math.random() - 0.5) * 0.5;

      newItems.push({
        id: 'staged_mandi_' + Math.random().toString(36).substr(2, 8),
        name: name,
        state: state,
        district: district,
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        address: `${name}, Main APMC Gate, ${district}`,
        operatingHours: '07:00 AM - 06:00 PM',
        contactPhone: '011-2' + (Math.floor(Math.random() * 899999) + 100000)
      });
    }

    this.stagedMandis.update(current => [...current, ...newItems]);
    this.toastr.success(`Generated ${count} Mandis into Staging Table`, 'Staged Successfully');
  }

  // --- JSON / FILE UPLOAD ---
  loadExampleJson(): void {
    const example = [
      {
        "name": "Azadpur APMC Market",
        "state": "Delhi",
        "district": "North Delhi",
        "latitude": 28.7161,
        "longitude": 77.1706,
        "address": "Azadpur Fruit Yard",
        "operatingHours": "06:00 AM - 08:00 PM",
        "contactPhone": "011-27671122"
      }
    ];
    this.jsonInput = JSON.stringify(example, null, 2);
  }

  parseJsonToStaging(): void {
    try {
      const parsed = JSON.parse(this.jsonInput);
      if (!Array.isArray(parsed)) throw new Error('Root must be an array [ ... ]');

      const items: StagedMandi[] = parsed.map((item, idx) => ({
        id: 'staged_json_' + idx + '_' + Date.now(),
        name: item.name || 'Mandi ' + (idx + 1),
        state: item.state || 'Madhya Pradesh',
        district: item.district || 'District',
        latitude: Number(item.latitude || 22.7),
        longitude: Number(item.longitude || 75.8),
        address: item.address || 'APMC Yard',
        operatingHours: item.operatingHours || '08:00 AM - 05:00 PM',
        contactPhone: item.contactPhone || 'N/A'
      }));

      this.stagedMandis.update(current => [...current, ...items]);
      this.jsonInput = '';
      this.toastr.success(`Parsed ${items.length} mandis to staging`, 'Success');
    } catch (e: any) {
      this.toastr.error('JSON Error: ' + e.message, 'Parse Failed');
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.jsonInput = e.target.result;
      this.parseJsonToStaging();
    };
    reader.readAsText(file);
  }

  removeStagedItem(id: string): void {
    this.stagedMandis.update(items => items.filter(i => i.id !== id));
  }

  commitStagedToDb(): void {
    const items = this.stagedMandis();
    if (items.length === 0) return;

    const payload = items.map(item => ({
      name: item.name,
      state: item.state,
      district: item.district,
      latitude: item.latitude,
      longitude: item.longitude,
      address: item.address,
      operatingHours: item.operatingHours,
      contactPhone: item.contactPhone
    }));

    this.uploading.set(true);
    this.adminService.create<any[]>('/api/admin/mandis/bulk', payload).subscribe({
      next: (res) => {
        this.toastr.success(`Successfully saved ${res.length} Mandis to Database!`, 'Complete');
        this.stagedMandis.set([]);
        this.page.set(0);
        this.loadData();
        this.uploading.set(false);
      },
      error: (err) => {
        this.toastr.error('Failed to save mandis', 'Error');
        this.uploading.set(false);
      }
    });
  }

  // --- MULTI-SELECT & BATCH DELETE ---
  isItemSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelectItem(id: number): void {
    const set = new Set(this.selectedIds());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedIds.set(set);
  }

  isAllSelected(): boolean {
    const visible = this.mandis();
    if (visible.length === 0) return false;
    return visible.every(m => this.selectedIds().has(m.id));
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    const set = new Set(this.selectedIds());
    const visible = this.mandis();
    if (checked) visible.forEach(m => set.add(m.id));
    else visible.forEach(m => set.delete(m.id));
    this.selectedIds.set(set);
  }

  onDeleteBatch(): void {
    const ids = Array.from(this.selectedIds());
    if (ids.length === 0) return;

    if (confirm(`Delete ${ids.length} selected Mandis?`)) {
      this.deletingBatch.set(true);
      this.adminService.remove('/api/admin/mandis/batch', ids).subscribe({
        next: () => {
          this.toastr.success(`Deleted ${ids.length} Mandis`);
          this.selectedIds.set(new Set());
          this.loadData();
          this.deletingBatch.set(false);
        },
        error: () => {
          this.toastr.error('Failed to delete mandis');
          this.deletingBatch.set(false);
        }
      });
    }
  }

  // --- SINGLE ACTIONS ---
  onSearchChange(): void {
    this.page.set(0);
    this.loadData();
  }

  onAdd(): void {
    this.isEditMode.set(false);
    this.selectedMandi.set({
      name: '',
      state: 'Madhya Pradesh',
      district: 'Indore',
      latitude: 22.7196,
      longitude: 75.8577,
      address: '',
      operatingHours: '09:00 AM - 05:00 PM',
      contactPhone: ''
    });
    this.showEditModal.set(true);
  }

  onEditRow(m: any): void {
    this.isEditMode.set(true);
    this.selectedMandi.set({ ...m });
    this.showEditModal.set(true);
  }

  onDeleteRow(m: any): void {
    this.selectedMandi.set(m);
    this.showDeleteDialog.set(true);
  }

  onSave(): void {
    const mandi = this.selectedMandi();
    if (!mandi) return;

    const request$ = this.isEditMode()
      ? this.adminService.update<any>('/api/admin/mandis', mandi.id, mandi)
      : this.adminService.create<any>('/api/admin/mandis', mandi);

    request$.subscribe({
      next: () => {
        this.toastr.success(this.isEditMode() ? 'Mandi updated' : 'Mandi created');
        this.showEditModal.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to save mandi')
    });
  }

  confirmDelete(): void {
    const mandi = this.selectedMandi();
    if (!mandi) return;

    this.adminService.remove('/api/admin/mandis', mandi.id).subscribe({
      next: () => {
        this.toastr.success('Mandi deleted');
        this.showDeleteDialog.set(false);
        this.loadData();
      },
      error: () => this.toastr.error('Failed to delete mandi')
    });
  }

  nextPage(): void {
    if ((this.page() + 1) * this.size() < this.totalElements()) {
      this.page.update(p => p + 1);
      this.loadData();
    }
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update(p => p - 1);
      this.loadData();
    }
  }
}
