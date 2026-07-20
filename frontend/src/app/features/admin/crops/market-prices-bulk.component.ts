import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'fs-market-prices-bulk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Page Header -->
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-xl font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">Market Prices Management</h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Bulk upload new market prices via JSON or alter existing records</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- LEFT: BULK UPLOAD CONTROLS -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 class="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">JSON Bulk Upload</h2>
            
            <div class="space-y-4">
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Paste JSON Data</label>
                <textarea
                  [(ngModel)]="jsonInput"
                  rows="12"
                  placeholder="[ { 'ticker': 'Wheat', ... } ]"
                  class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono dark:text-white outline-none focus:border-green-500 transition resize-y"
                ></textarea>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  (click)="loadExample()"
                  type="button"
                  class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300 transition active:scale-95"
                >
                  Load Example JSON
                </button>
                <button
                  (click)="formatJson()"
                  type="button"
                  class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300 transition active:scale-95"
                >
                  Format JSON
                </button>
              </div>

              <button
                (click)="onUpload()"
                [disabled]="uploading()"
                type="button"
                class="w-full py-2.5 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-600 hover:shadow-lg text-white text-xs font-bold transition active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {{ uploading() ? 'Uploading...' : 'Upload Bulk Data' }}
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT: TABLE OF EXISTING PRICES -->
        <div class="lg:col-span-2">
          <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
            <div class="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-700">
              <h2 class="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Existing Mandi Prices</h2>
              
              <button
                (click)="openAddModal()"
                type="button"
                class="bg-green-50 hover:bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-xl text-xs font-bold transition"
              >
                + Add Single Price
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left">
                <thead>
                  <tr class="text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                    <th class="pb-3 font-bold">Crop</th>
                    <th class="pb-3 font-bold">Mandi</th>
                    <th class="pb-3 font-bold">State</th>
                    <th class="pb-3 font-bold">Min</th>
                    <th class="pb-3 font-bold">Max</th>
                    <th class="pb-3 font-bold">Price</th>
                    <th class="pb-3 font-bold">Date</th>
                    <th class="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @if (prices().length === 0) {
                    <tr>
                      <td colspan="8" class="py-8 text-center text-gray-400">No prices loaded. Upload bulk data to populate.</td>
                    </tr>
                  } @else {
                    @for (row of prices(); track row.id) {
                      <tr class="border-b border-gray-50 dark:border-gray-750 hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition">
                        <td class="py-3 font-bold">{{ row.cropName || row.crop?.name || 'Unknown' }}</td>
                        <td>{{ row.mandiName }}</td>
                        <td>{{ row.state }}</td>
                        <td>₹{{ row.minPrice }}</td>
                        <td>₹{{ row.maxPrice }}</td>
                        <td class="text-green-600 font-bold">₹{{ row.pricePerQuintal }}</td>
                        <td>{{ row.recordedDate }}</td>
                        <td class="text-right space-x-1">
                          <button
                            (click)="openEditModal(row)"
                            class="p-1 text-gray-400 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            (click)="onDelete(row.id)"
                            class="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    }
                  }
                </tbody>
              </table>
            </div>

            <!-- Pagination Controls -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
              <span class="text-[10px] text-gray-400">Page {{ page + 1 }} · showing max {{ size }} items</span>
              <div class="flex gap-2">
                <button
                  (click)="prevPage()"
                  [disabled]="page === 0"
                  class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300 transition disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  (click)="nextPage()"
                  [disabled]="prices().length < size"
                  class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300 transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CREATE/EDIT SINGLE PRICE MODAL -->
    @if (showModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none animate-fade-in">
        <div (click)="closeModal()" class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
        <div class="relative w-full max-w-md mx-auto my-6 px-4 z-50 animate-scale-up">
          <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 flex flex-col">
            <div class="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <div class="flex items-center gap-2">
                <span class="material-icons text-green-600 dark:text-green-400">payments</span>
                <h2 class="text-base font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">
                  {{ isEditMode() ? 'Edit Mandi Price' : 'Add Mandi Price' }}
                </h2>
              </div>
              <button (click)="closeModal()" type="button" class="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                ✕
              </button>
            </div>
            
            <div class="p-6 space-y-4">
              <!-- Crop Selection -->
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Select Crop</label>
                <select
                  [(ngModel)]="formPrice.cropId"
                  class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition cursor-pointer"
                >
                  <option [ngValue]="null" disabled>-- Choose Crop --</option>
                  @for (crop of crops(); track crop.id) {
                    <option [value]="crop.id">{{ crop.name }}</option>
                  }
                </select>
              </div>

              <!-- Mandi and State -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Mandi Name</label>
                  <input
                    type="text"
                    [(ngModel)]="formPrice.mandiName"
                    placeholder="e.g. Dara"
                    class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition"
                  >
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">State</label>
                  <input
                    type="text"
                    [(ngModel)]="formPrice.state"
                    placeholder="e.g. Punjab"
                    class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition"
                  >
                </div>
              </div>

              <!-- Price Values -->
              <div class="grid grid-cols-3 gap-2">
                <div>
                  <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Min Price (₹)</label>
                  <input
                    type="number"
                    [(ngModel)]="formPrice.minPrice"
                    class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition"
                  >
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Max Price (₹)</label>
                  <input
                    type="number"
                    [(ngModel)]="formPrice.maxPrice"
                    class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition"
                  >
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Avg Price (₹)</label>
                  <input
                    type="number"
                    [(ngModel)]="formPrice.pricePerQuintal"
                    class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition"
                  >
                </div>
              </div>

              <!-- Date -->
              <div>
                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Recorded Date</label>
                <input
                  type="date"
                  [(ngModel)]="formPrice.recordedDate"
                  class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition cursor-pointer"
                >
              </div>
            </div>

            <!-- Footer -->
            <div class="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-3xl">
              <button (click)="closeModal()" type="button" class="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-300 transition active:scale-95">
                Cancel
              </button>
              <button (click)="onSaveSingle()" type="button" class="px-5 py-2 rounded-xl bg-gradient-to-tr from-green-500 to-emerald-600 hover:shadow-lg text-white text-xs font-bold transition active:scale-95">
                Save Price
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class MarketPricesBulkComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toastr = inject(ToastrService);

  readonly prices = signal<any[]>([]);
  readonly crops = signal<any[]>([]);
  readonly uploading = signal(false);
  readonly showModal = signal(false);
  readonly isEditMode = signal(false);

  jsonInput = '';
  page = 0;
  size = 15;

  // Single price form bindings
  formPrice: any = {
    id: null,
    cropId: null,
    mandiName: '',
    state: 'Punjab',
    district: 'Default',
    minPrice: 2000,
    maxPrice: 3000,
    pricePerQuintal: 2500,
    recordedDate: new Date().toISOString().split('T')[0]
  };

  ngOnInit(): void {
    this.loadPrices();
    this.loadCrops();
  }

  loadPrices(): void {
    this.api.get<any[]>('/api/market/prices', { page: this.page, size: this.size }).subscribe({
      next: (data) => this.prices.set(data),
      error: () => this.toastr.error('Failed to load mandi prices', 'Error')
    });
  }

  loadCrops(): void {
    this.api.get<any>('/api/admin/crops', { page: 0, size: 200 }).subscribe({
      next: (res) => this.crops.set(res.content || []),
      error: () => this.toastr.error('Failed to load crops selection list', 'Error')
    });
  }

  loadExample(): void {
    const example = [
      {
        "ticker": "Wheat",
        "market": "Sonalika",
        "maxPrice": "3000",
        "minPrice": "2400",
        "date": "2026-06-09",
        "price": "2700"
      },
      {
        "ticker": "Paddy(Dhan)(Common)",
        "market": "Swarna Masuri (New)",
        "maxPrice": "2250",
        "minPrice": "2150",
        "date": "2026-06-09",
        "price": "2200"
      }
    ];
    this.jsonInput = JSON.stringify(example, null, 2);
    this.toastr.info('Sample data loaded in text area', 'Info');
  }

  formatJson(): void {
    try {
      if (!this.jsonInput.trim()) return;
      const parsed = JSON.parse(this.jsonInput);
      this.jsonInput = JSON.stringify(parsed, null, 2);
      this.toastr.success('JSON parsed and formatted successfully', 'Valid JSON');
    } catch (e: any) {
      this.toastr.error('Malformed JSON structure: ' + e.message, 'Invalid JSON');
    }
  }

  onUpload(): void {
    if (!this.jsonInput.trim()) {
      this.toastr.warning('Please paste or write some JSON data before uploading', 'Empty Field');
      return;
    }

    let parsed: any[];
    try {
      parsed = JSON.parse(this.jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error('Root structure must be a JSON Array [ ... ]');
      }
    } catch (e: any) {
      this.toastr.error('JSON Error: ' + e.message, 'Upload Failed');
      return;
    }

    this.uploading.set(true);
    this.api.post<any[]>('/api/market/prices/bulk', parsed).subscribe({
      next: (res) => {
        this.toastr.success(`Successfully uploaded and created ${res.length} market prices!`, 'Success');
        this.jsonInput = '';
        this.page = 0;
        this.loadPrices();
        this.uploading.set(false);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || err.message, 'Upload Failed');
        this.uploading.set(false);
      }
    });
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this market price record?')) {
      this.api.delete(`/api/market/prices/${id}`).subscribe({
        next: () => {
          this.toastr.success('Market price record deleted successfully', 'Deleted');
          this.loadPrices();
        },
        error: () => this.toastr.error('Failed to delete market price record', 'Error')
      });
    }
  }

  openAddModal(): void {
    this.isEditMode.set(false);
    this.formPrice = {
      id: null,
      cropId: this.crops().length > 0 ? this.crops()[0].id : null,
      mandiName: '',
      state: 'Punjab',
      district: 'Default',
      minPrice: 2000,
      maxPrice: 3000,
      pricePerQuintal: 2500,
      recordedDate: new Date().toISOString().split('T')[0]
    };
    this.showModal.set(true);
  }

  openEditModal(row: any): void {
    this.isEditMode.set(true);
    this.formPrice = {
      id: row.id,
      cropId: row.crop?.id || null,
      mandiName: row.mandiName,
      state: row.state,
      district: row.district || 'Default',
      minPrice: row.minPrice,
      maxPrice: row.maxPrice,
      pricePerQuintal: row.pricePerQuintal,
      recordedDate: row.recordedDate
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
  }

  onSaveSingle(): void {
    if (!this.formPrice.cropId) {
      this.toastr.warning('Please select a valid crop target', 'Validation Error');
      return;
    }
    if (!this.formPrice.mandiName.trim()) {
      this.toastr.warning('Please enter a mandi location', 'Validation Error');
      return;
    }

    const payload = {
      crop: { id: this.formPrice.cropId },
      mandiName: this.formPrice.mandiName,
      state: this.formPrice.state,
      district: this.formPrice.district,
      minPrice: this.formPrice.minPrice,
      maxPrice: this.formPrice.maxPrice,
      pricePerQuintal: this.formPrice.pricePerQuintal,
      modalPrice: this.formPrice.pricePerQuintal,
      tradeVolume: 1500,
      recordedDate: this.formPrice.recordedDate
    };

    if (this.isEditMode()) {
      this.api.put(`/api/market/prices/${this.formPrice.id}`, payload).subscribe({
        next: () => {
          this.toastr.success('Mandi price updated successfully', 'Success');
          this.closeModal();
          this.loadPrices();
        },
        error: () => this.toastr.error('Failed to update mandi price', 'Error')
      });
    } else {
      this.api.post('/api/market/prices', payload).subscribe({
        next: () => {
          this.toastr.success('Mandi price saved successfully', 'Success');
          this.closeModal();
          this.loadPrices();
        },
        error: () => this.toastr.error('Failed to create mandi price record', 'Error')
      });
    }
  }

  nextPage(): void {
    if (this.prices().length === this.size) {
      this.page++;
      this.loadPrices();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadPrices();
    }
  }
}
