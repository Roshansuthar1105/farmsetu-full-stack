import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../../core/services/api.service';

export interface StagedItem {
  id: string;
  ticker: string;
  market: string;
  state: string;
  district: string;
  minPrice: number;
  maxPrice: number;
  price: number;
  date: string;
}

@Component({
  selector: 'fs-market-prices-bulk',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-8 animate-fade-in pb-12">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span class="material-icons text-green-600 text-3xl">insights</span>
            Market Prices Management & Bulk Tools
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Generate synthetic dummy data, stage & preview bulk records, and manage live prices with mass deletion.
          </p>
        </div>
      </div>

      <!-- SECTION 1: DATA SOURCE CONTROLS (GENERATOR & UPLOAD) -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        <!-- Input Mode Tabs -->
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
          <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1.5 rounded-2xl">
            <button
              (click)="activeTab.set('generator')"
              [class]="activeTab() === 'generator' ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm font-extrabold' : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-white'"
              class="px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <span class="material-icons text-base">auto_awesome</span>
              Dummy Data Generator
            </button>
            <button
              (click)="activeTab.set('json')"
              [class]="activeTab() === 'json' ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm font-extrabold' : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-white'"
              class="px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <span class="material-icons text-base">code</span>
              Paste JSON Data
            </button>
            <button
              (click)="activeTab.set('csv')"
              [class]="activeTab() === 'csv' ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm font-extrabold' : 'text-gray-500 dark:text-gray-400 font-medium hover:text-gray-800 dark:hover:text-white'"
              class="px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <span class="material-icons text-base">upload_file</span>
              Upload File
            </button>
          </div>

          <span class="text-[11px] text-gray-400 font-medium">
            Staged items ready: <strong class="text-green-600 dark:text-green-400 font-extrabold">{{ stagedItems().length }}</strong>
          </span>
        </div>

        <!-- TAB 1: DUMMY DATA GENERATOR -->
        @if (activeTab() === 'generator') {
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Price Ranges -->
              <div class="space-y-3">
                <label class="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Min Price Range (₹/Quintal)
                </label>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    [(ngModel)]="genMinPriceLow"
                    placeholder="From"
                    class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition"
                  >
                  <span class="text-gray-400 text-xs">to</span>
                  <input
                    type="number"
                    [(ngModel)]="genMinPriceHigh"
                    placeholder="To"
                    class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition"
                  >
                </div>
              </div>

              <div class="space-y-3">
                <label class="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Max Price Range (₹/Quintal)
                </label>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    [(ngModel)]="genMaxPriceLow"
                    placeholder="From"
                    class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition"
                  >
                  <span class="text-gray-400 text-xs">to</span>
                  <input
                    type="number"
                    [(ngModel)]="genMaxPriceHigh"
                    placeholder="To"
                    class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition"
                  >
                </div>
              </div>

              <!-- Output Count -->
              <div class="space-y-3">
                <label class="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Number of Output Records
                </label>
                <div class="flex items-center gap-2">
                  <input
                    type="number"
                    [(ngModel)]="genCount"
                    min="1"
                    max="500"
                    class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition font-bold"
                  >
                  <div class="flex gap-1">
                    <button (click)="genCount = 10" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200">10</button>
                    <button (click)="genCount = 25" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200">25</button>
                    <button (click)="genCount = 50" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200">50</button>
                  </div>
                </div>
              </div>

              <!-- Date Selection -->
              <div class="space-y-3">
                <label class="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recorded Date
                </label>
                <input
                  type="date"
                  [(ngModel)]="genDate"
                  class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs dark:text-white outline-none focus:border-green-500 transition"
                >
              </div>
            </div>

            <!-- Multi-Select Categories -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <!-- Target Crops Multi-Select -->
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Target Crops (Multi-select)
                  </label>
                  <div class="space-x-2 text-[10px]">
                    <button (click)="selectAllCrops()" class="text-green-600 dark:text-green-400 hover:underline font-bold">Select All</button>
                    <span class="text-gray-300">|</span>
                    <button (click)="selectedCrops.set([])" class="text-gray-400 hover:underline">Clear</button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                  @for (c of cropOptions(); track c) {
                    <button
                      type="button"
                      (click)="toggleCrop(c)"
                      [class]="isCropSelected(c) ? 'bg-green-600 text-white font-bold' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'"
                      class="px-2.5 py-1 rounded-lg text-xs transition active:scale-95 flex items-center gap-1"
                    >
                      <span>{{ c }}</span>
                      @if (isCropSelected(c)) {
                        <span class="material-icons text-[10px]">done</span>
                      }
                    </button>
                  }
                </div>
              </div>

              <!-- Target States Multi-Select -->
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <label class="block text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Target States (Multi-select)
                  </label>
                  <div class="space-x-2 text-[10px]">
                    <button (click)="selectAllStates()" class="text-green-600 dark:text-green-400 hover:underline font-bold">Select All</button>
                    <span class="text-gray-300">|</span>
                    <button (click)="selectedStates.set([])" class="text-gray-400 hover:underline">Clear</button>
                  </div>
                </div>
                <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl">
                  @for (s of availableStates; track s) {
                    <button
                      type="button"
                      (click)="toggleState(s)"
                      [class]="isStateSelected(s) ? 'bg-emerald-600 text-white font-bold' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'"
                      class="px-2.5 py-1 rounded-lg text-xs transition active:scale-95 flex items-center gap-1"
                    >
                      <span>{{ s }}</span>
                      @if (isStateSelected(s)) {
                        <span class="material-icons text-[10px]">done</span>
                      }
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <div class="pt-2 flex justify-end">
              <button
                (click)="generateDummyData()"
                type="button"
                class="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition active:scale-95 flex items-center gap-2"
              >
                <span class="material-icons text-base">auto_awesome</span>
                Generate & Stage {{ genCount }} Dummy Records
              </button>
            </div>
          </div>
        }

        <!-- TAB 2: PASTE JSON DATA -->
        @if (activeTab() === 'json') {
          <div class="space-y-4">
            <div>
              <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Paste JSON Array</label>
              <textarea
                [(ngModel)]="jsonInput"
                rows="8"
                placeholder='[ { "ticker": "Wheat", "market": "Sonalika", "minPrice": "2400", "maxPrice": "3000", "price": "2700", "date": "2026-06-09", "state": "Punjab" } ]'
                class="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-mono dark:text-white outline-none focus:border-green-500 transition"
              ></textarea>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex gap-2">
                <button
                  (click)="loadExampleJson()"
                  type="button"
                  class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300 transition"
                >
                  Load Example JSON
                </button>
                <button
                  (click)="formatJson()"
                  type="button"
                  class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-300 transition"
                >
                  Format JSON
                </button>
              </div>

              <button
                (click)="parseJsonToStaging()"
                type="button"
                class="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition active:scale-95 flex items-center gap-1.5"
              >
                <span class="material-icons text-base">playlist_add</span>
                Parse to Staging Table
              </button>
            </div>
          </div>
        }

        <!-- TAB 3: FILE UPLOAD -->
        @if (activeTab() === 'csv') {
          <div class="space-y-4">
            <div class="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center bg-gray-50/50 dark:bg-gray-900/30 hover:border-green-500 transition">
              <span class="material-icons text-4xl text-gray-400 mb-2">cloud_upload</span>
              <p class="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Upload CSV or JSON file</p>
              <p class="text-[10px] text-gray-400 mb-4">File should contain headers: ticker, market, minPrice, maxPrice, price, date, state</p>
              <input
                type="file"
                (change)="onFileSelected($event)"
                accept=".json,.csv"
                class="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 dark:file:bg-green-950 dark:file:text-green-300 cursor-pointer max-w-sm mx-auto"
              >
            </div>
          </div>
        }
      </div>

      <!-- SECTION 2: DRAFT STAGING TABLE (PRE-DB COMMIT) -->
      @if (stagedItems().length > 0) {
        <div class="bg-amber-50/40 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-900/40 rounded-3xl p-6 shadow-sm space-y-4 animate-scale-up">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-amber-200/60 dark:border-amber-900/40">
            <div>
              <div class="flex items-center gap-2">
                <span class="material-icons text-amber-600 dark:text-amber-400">preview</span>
                <h2 class="text-sm font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                  Draft Staging Table (Inspect Before Inserting into Database)
                </h2>
              </div>
              <p class="text-[11px] text-amber-700 dark:text-amber-400/80 mt-0.5">
                Review the staged records below. You can remove individual rows before committing to DB.
              </p>
            </div>

            <div class="flex items-center gap-3">
              <button
                (click)="clearStagedItems()"
                type="button"
                class="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition"
              >
                Clear Staged
              </button>
              <button
                (click)="commitStagedToDb()"
                [disabled]="uploading()"
                type="button"
                class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:shadow-lg text-white text-xs font-black transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <span class="material-icons text-base">cloud_done</span>
                {{ uploading() ? 'Inserting...' : 'Insert ' + stagedItems().length + ' Records into DB' }}
              </button>
            </div>
          </div>

          <!-- Staged Records Table -->
          <div class="overflow-x-auto max-h-72 overflow-y-auto rounded-xl bg-white dark:bg-gray-800 border border-amber-200/50 dark:border-amber-900/30">
            <table class="w-full text-xs text-left">
              <thead class="sticky top-0 bg-amber-100/80 dark:bg-amber-950/80 backdrop-blur-sm">
                <tr class="text-amber-900 dark:text-amber-200 uppercase tracking-wider text-[10px] font-extrabold border-b border-amber-200 dark:border-amber-900">
                  <th class="py-2.5 px-3">#</th>
                  <th class="py-2.5 px-3">Crop</th>
                  <th class="py-2.5 px-3">Mandi Name</th>
                  <th class="py-2.5 px-3">State</th>
                  <th class="py-2.5 px-3">Min (₹)</th>
                  <th class="py-2.5 px-3">Max (₹)</th>
                  <th class="py-2.5 px-3">Price (₹)</th>
                  <th class="py-2.5 px-3">Date</th>
                  <th class="py-2.5 px-3 text-right">Remove</th>
                </tr>
              </thead>
              <tbody>
                @for (item of stagedItems(); track item.id; let idx = $index) {
                  <tr class="border-b border-gray-100 dark:border-gray-700/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/10">
                    <td class="py-2 px-3 text-gray-400 text-[10px]">{{ idx + 1 }}</td>
                    <td class="py-2 px-3 font-bold text-gray-800 dark:text-white">{{ item.ticker }}</td>
                    <td class="py-2 px-3 text-gray-600 dark:text-gray-300">{{ item.market }}</td>
                    <td class="py-2 px-3 text-gray-600 dark:text-gray-300">{{ item.state }}</td>
                    <td class="py-2 px-3 text-gray-600 dark:text-gray-300">₹{{ item.minPrice }}</td>
                    <td class="py-2 px-3 text-gray-600 dark:text-gray-300">₹{{ item.maxPrice }}</td>
                    <td class="py-2 px-3 text-green-600 dark:text-green-400 font-bold">₹{{ item.price }}</td>
                    <td class="py-2 px-3 text-gray-500 text-[11px]">{{ item.date }}</td>
                    <td class="py-2 px-3 text-right">
                      <button
                        (click)="removeStagedItem(item.id)"
                        class="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-1 rounded transition"
                        title="Remove row"
                      >
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

      <!-- SECTION 3: LIVE DATABASE MANDI PRICES TABLE WITH SEARCH, FILTERING & MASS DELETION -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <!-- Table Header & Add Single Button -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 class="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-icons text-sm text-green-600">table_chart</span>
              Live Database Mandi Prices
            </h2>
            <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Filter, search, select, and mass-delete price records.</p>
          </div>

          <div class="flex items-center gap-2">
            <button
              (click)="openAddModal()"
              type="button"
              class="bg-green-50 hover:bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-300 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              <span class="material-icons text-sm">add</span>
              Add Single Price
            </button>
          </div>
        </div>

        <!-- Search & Filtering Bar -->
        <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 bg-gray-50 dark:bg-gray-900 p-3 rounded-2xl">
          <!-- Search Input -->
          <div class="relative sm:col-span-2">
            <span class="material-icons absolute left-3 top-2.5 text-gray-400 text-sm">search</span>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search crop, mandi, state..."
              class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-1.5 text-xs dark:text-white outline-none focus:border-green-500 transition"
            >
          </div>

          <!-- Crop Filter -->
          <div>
            <select
              [(ngModel)]="filterCrop"
              class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs dark:text-white outline-none focus:border-green-500 transition cursor-pointer"
            >
              <option value="">All Crops</option>
              @for (c of cropOptions(); track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          <!-- State Filter -->
          <div>
            <select
              [(ngModel)]="filterState"
              class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5 text-xs dark:text-white outline-none focus:border-green-500 transition cursor-pointer"
            >
              <option value="">All States</option>
              @for (s of availableStates; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </div>
        </div>

        <!-- BATCH SELECTION & ACTION BAR -->
        @if (selectedPriceIds().size > 0) {
          <div class="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-2xl px-4 py-3 flex items-center justify-between animate-fade-in">
            <div class="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400">
              <span class="material-icons text-base">check_box</span>
              <span>{{ selectedPriceIds().size }} items selected</span>
            </div>

            <div class="flex items-center gap-2">
              <button
                (click)="clearSelection()"
                class="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:underline"
              >
                Clear Selection
              </button>
              <button
                (click)="onDeleteSelectedBatch()"
                [disabled]="deletingBatch()"
                class="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
              >
                <span class="material-icons text-sm">delete_forever</span>
                {{ deletingBatch() ? 'Deleting...' : 'Delete Selected (' + selectedPriceIds().size + ')' }}
              </button>
            </div>
          </div>
        }

        <!-- Prices Table -->
        <div class="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700">
          <table class="w-full text-xs text-left">
            <thead>
              <tr class="bg-gray-50 dark:bg-gray-900 text-gray-400 uppercase tracking-wider text-[10px] font-extrabold border-b border-gray-100 dark:border-gray-700">
                <th class="py-3 px-3 w-8">
                  <input
                    type="checkbox"
                    [checked]="isAllSelected()"
                    (change)="toggleSelectAll($event)"
                    class="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                  >
                </th>
                <th class="py-3 px-3">Crop</th>
                <th class="py-3 px-3">Mandi</th>
                <th class="py-3 px-3">State</th>
                <th class="py-3 px-3">Min</th>
                <th class="py-3 px-3">Max</th>
                <th class="py-3 px-3">Avg Price</th>
                <th class="py-3 px-3">Recorded Date</th>
                <th class="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredPrices().length === 0) {
                <tr>
                  <td colspan="9" class="py-8 text-center text-gray-400">
                    No prices found matching filters.
                  </td>
                </tr>
              } @else {
                @for (row of filteredPrices(); track row.id) {
                  <tr
                    [class.bg-green-50]="isItemSelected(row.id)"
                    [class.dark:bg-green-950]="isItemSelected(row.id)"
                    class="border-b border-gray-50 dark:border-gray-750 hover:bg-gray-50/50 dark:hover:bg-gray-900/10 transition"
                  >
                    <td class="py-3 px-3">
                      <input
                        type="checkbox"
                        [checked]="isItemSelected(row.id)"
                        (change)="toggleSelectItem(row.id)"
                        class="rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                      >
                    </td>
                    <td class="py-3 px-3 font-bold text-gray-800 dark:text-white">{{ row.cropName || row.crop?.name || row.ticker || 'Unknown' }}</td>
                    <td class="py-3 px-3 text-gray-600 dark:text-gray-300">{{ row.mandiName }}</td>
                    <td class="py-3 px-3 text-gray-600 dark:text-gray-300">{{ row.state }}</td>
                    <td class="py-3 px-3 text-gray-600 dark:text-gray-300">₹{{ row.minPrice }}</td>
                    <td class="py-3 px-3 text-gray-600 dark:text-gray-300">₹{{ row.maxPrice }}</td>
                    <td class="py-3 px-3 text-green-600 font-bold">₹{{ row.pricePerQuintal }}</td>
                    <td class="py-3 px-3 text-gray-500">{{ row.recordedDate }}</td>
                    <td class="py-3 px-3 text-right space-x-1">
                      <button
                        (click)="openEditModal(row)"
                        class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                        title="Edit"
                      >
                        <span class="material-icons text-sm">edit</span>
                      </button>
                      <button
                        (click)="onDeleteSingle(row.id)"
                        class="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition"
                        title="Delete"
                      >
                        <span class="material-icons text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <span class="text-[10px] text-gray-400">Page {{ page + 1 }} · Showing {{ filteredPrices().length }} of total fetched</span>
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
                <span class="material-icons text-sm">close</span>
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
                    placeholder="e.g. APMC Khanna"
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
  readonly stagedItems = signal<StagedItem[]>([]);
  readonly selectedPriceIds = signal<Set<number>>(new Set());

  readonly activeTab = signal<'generator' | 'json' | 'csv'>('generator');
  readonly uploading = signal(false);
  readonly deletingBatch = signal(false);
  readonly showModal = signal(false);
  readonly isEditMode = signal(false);

  // Generator parameters
  genMinPriceLow = 1800;
  genMinPriceHigh = 2400;
  genMaxPriceLow = 2600;
  genMaxPriceHigh = 3600;
  genCount = 20;
  genDate = new Date().toISOString().split('T')[0];

  readonly availableStates = ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat'];
  readonly selectedCrops = signal<string[]>(['Wheat', 'Paddy(Dhan)(Common)', 'Mustard', 'Cotton', 'Potato']);
  readonly selectedStates = signal<string[]>(['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh']);
  readonly defaultMandis = ['APMC Main Mandi', 'Central Grain Market', 'District Kisan Mandi', 'Subzi Mandi APMC', 'State Mandi'];

  // Table Filters & Search
  searchQuery = '';
  filterCrop = '';
  filterState = '';

  jsonInput = '';
  page = 0;
  size = 50;

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

  readonly cropOptions = computed(() => {
    const list = this.crops().map(c => c.name);
    return list.length > 0 ? Array.from(new Set(list)) : ['Wheat', 'Paddy(Dhan)(Common)', 'Mustard', 'Cotton', 'Potato', 'Apple'];
  });

  readonly filteredPrices = computed(() => {
    let list = this.prices();
    const query = this.searchQuery.trim().toLowerCase();
    const cFilter = this.filterCrop;
    const sFilter = this.filterState;

    if (query) {
      list = list.filter(item => {
        const cropName = (item.cropName || item.crop?.name || item.ticker || '').toLowerCase();
        const mandiName = (item.mandiName || '').toLowerCase();
        const state = (item.state || '').toLowerCase();
        return cropName.includes(query) || mandiName.includes(query) || state.includes(query);
      });
    }

    if (cFilter) {
      list = list.filter(item => (item.cropName || item.crop?.name || item.ticker || '') === cFilter);
    }

    if (sFilter) {
      list = list.filter(item => (item.state || '') === sFilter);
    }

    return list;
  });

  ngOnInit(): void {
    this.loadPrices();
    this.loadCrops();
  }

  loadPrices(): void {
    this.api.get<any[]>('/api/market/prices', { page: this.page, size: this.size }).subscribe({
      next: (data) => this.prices.set(data || []),
      error: () => this.toastr.error('Failed to load mandi prices', 'Error')
    });
  }

  loadCrops(): void {
    this.api.get<any>('/api/admin/crops', { page: 0, size: 200 }).subscribe({
      next: (res) => this.crops.set(res.content || []),
      error: () => this.toastr.error('Failed to load crops selection list', 'Error')
    });
  }

  // --- DUMMY DATA GENERATOR METHODS ---
  isCropSelected(crop: string): boolean {
    return this.selectedCrops().includes(crop);
  }

  toggleCrop(crop: string): void {
    const current = [...this.selectedCrops()];
    const idx = current.indexOf(crop);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(crop);
    }
    this.selectedCrops.set(current);
  }

  selectAllCrops(): void {
    this.selectedCrops.set([...this.cropOptions()]);
  }

  isStateSelected(state: string): boolean {
    return this.selectedStates().includes(state);
  }

  toggleState(state: string): void {
    const current = [...this.selectedStates()];
    const idx = current.indexOf(state);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(state);
    }
    this.selectedStates.set(current);
  }

  selectAllStates(): void {
    this.selectedStates.set([...this.availableStates]);
  }

  generateDummyData(): void {
    const activeCrops = this.selectedCrops().length > 0 ? this.selectedCrops() : ['Wheat'];
    const activeStates = this.selectedStates().length > 0 ? this.selectedStates() : ['Punjab'];

    const count = Math.max(1, Math.min(500, this.genCount));
    const newStaged: StagedItem[] = [];

    for (let i = 0; i < count; i++) {
      const crop = activeCrops[Math.floor(Math.random() * activeCrops.length)];
      const state = activeStates[Math.floor(Math.random() * activeStates.length)];
      const mandi = this.defaultMandis[Math.floor(Math.random() * this.defaultMandis.length)] + ' ' + (Math.floor(Math.random() * 90) + 10);

      const minPrice = Math.floor(Math.random() * (this.genMinPriceHigh - this.genMinPriceLow + 1)) + this.genMinPriceLow;
      const maxPrice = Math.floor(Math.random() * (this.genMaxPriceHigh - this.genMaxPriceLow + 1)) + Math.max(minPrice + 100, this.genMaxPriceLow);
      const price = Math.floor((minPrice + maxPrice) / 2);

      newStaged.push({
        id: 'staged_' + Math.random().toString(36).substr(2, 9),
        ticker: crop,
        market: mandi,
        state: state,
        district: 'District ' + (i + 1),
        minPrice: minPrice,
        maxPrice: maxPrice,
        price: price,
        date: this.genDate || new Date().toISOString().split('T')[0]
      });
    }

    this.stagedItems.update(existing => [...existing, ...newStaged]);
    this.toastr.success(`Generated ${count} dummy market price records into Staging Table`, 'Staged Successfully');
  }

  // --- JSON / FILE UPLOAD METHODS ---
  loadExampleJson(): void {
    const example = [
      {
        "ticker": "Wheat",
        "market": "APMC Khanna",
        "state": "Punjab",
        "maxPrice": "3000",
        "minPrice": "2400",
        "price": "2700",
        "date": new Date().toISOString().split('T')[0]
      },
      {
        "ticker": "Paddy(Dhan)(Common)",
        "market": "APMC Karnal",
        "state": "Haryana",
        "maxPrice": "2250",
        "minPrice": "2150",
        "price": "2200",
        "date": new Date().toISOString().split('T')[0]
      }
    ];
    this.jsonInput = JSON.stringify(example, null, 2);
    this.toastr.info('Sample JSON loaded in text box', 'Loaded');
  }

  formatJson(): void {
    try {
      if (!this.jsonInput.trim()) return;
      const parsed = JSON.parse(this.jsonInput);
      this.jsonInput = JSON.stringify(parsed, null, 2);
      this.toastr.success('Valid JSON formatted', 'Success');
    } catch (e: any) {
      this.toastr.error('Invalid JSON: ' + e.message, 'Format Error');
    }
  }

  parseJsonToStaging(): void {
    if (!this.jsonInput.trim()) {
      this.toastr.warning('Paste JSON array before parsing', 'Empty Field');
      return;
    }

    try {
      const parsed = JSON.parse(this.jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error('JSON root must be an Array [ ... ]');
      }

      const items: StagedItem[] = parsed.map((item, idx) => ({
        id: 'staged_json_' + idx + '_' + Date.now(),
        ticker: item.ticker || item.crop || 'Crop',
        market: item.market || item.mandiName || 'General Mandi',
        state: item.state || 'Punjab',
        district: item.district || 'Default',
        minPrice: Number(item.minPrice || 2000),
        maxPrice: Number(item.maxPrice || 3000),
        price: Number(item.price || item.pricePerQuintal || 2500),
        date: item.date || item.recordedDate || new Date().toISOString().split('T')[0]
      }));

      this.stagedItems.update(existing => [...existing, ...items]);
      this.jsonInput = '';
      this.toastr.success(`Parsed ${items.length} records into Staging Table`, 'Staging Ready');
    } catch (e: any) {
      this.toastr.error('Failed to parse JSON: ' + e.message, 'Parse Error');
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const text = e.target.result;
      if (file.name.endsWith('.json')) {
        this.jsonInput = text;
        this.parseJsonToStaging();
      } else if (file.name.endsWith('.csv')) {
        this.parseCsvToStaging(text);
      }
    };
    reader.readAsText(file);
  }

  parseCsvToStaging(csvText: string): void {
    const lines = csvText.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      this.toastr.warning('CSV file is empty or lacks headers', 'Invalid CSV');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const items: StagedItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim());
      if (cols.length < headers.length) continue;

      const rowMap: any = {};
      headers.forEach((h, idx) => rowMap[h] = cols[idx]);

      items.push({
        id: 'staged_csv_' + i + '_' + Date.now(),
        ticker: rowMap['ticker'] || rowMap['crop'] || 'Crop',
        market: rowMap['market'] || rowMap['mandi'] || 'General Mandi',
        state: rowMap['state'] || 'Punjab',
        district: rowMap['district'] || 'Default',
        minPrice: Number(rowMap['minprice'] || 2000),
        maxPrice: Number(rowMap['maxprice'] || 3000),
        price: Number(rowMap['price'] || 2500),
        date: rowMap['date'] || new Date().toISOString().split('T')[0]
      });
    }

    this.stagedItems.update(existing => [...existing, ...items]);
    this.toastr.success(`Imported ${items.length} CSV rows to Staging Table`, 'Success');
  }

  // --- STAGING MANAGEMENT & COMMIT TO DB ---
  removeStagedItem(stagedId: string): void {
    this.stagedItems.update(items => items.filter(i => i.id !== stagedId));
  }

  clearStagedItems(): void {
    this.stagedItems.set([]);
    this.toastr.info('Cleared all staged items', 'Info');
  }

  commitStagedToDb(): void {
    const items = this.stagedItems();
    if (items.length === 0) return;

    const payload = items.map(item => ({
      ticker: item.ticker,
      market: item.market,
      state: item.state,
      district: item.district,
      minPrice: String(item.minPrice),
      maxPrice: String(item.maxPrice),
      price: String(item.price),
      date: item.date
    }));

    this.uploading.set(true);
    this.api.post<any[]>('/api/market/prices/bulk', payload).subscribe({
      next: (res) => {
        this.toastr.success(`Successfully committed ${res.length} prices to Database!`, 'Bulk Insert Complete');
        this.stagedItems.set([]);
        this.page = 0;
        this.loadPrices();
        this.uploading.set(false);
      },
      error: (err) => {
        this.toastr.error(err.error?.message || err.message, 'Database Insert Failed');
        this.uploading.set(false);
      }
    });
  }

  // --- MULTI-SELECT & BATCH DELETION ---
  isItemSelected(id: number): boolean {
    return this.selectedPriceIds().has(id);
  }

  toggleSelectItem(id: number): void {
    const set = new Set(this.selectedPriceIds());
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    this.selectedPriceIds.set(set);
  }

  isAllSelected(): boolean {
    const visible = this.filteredPrices();
    if (visible.length === 0) return false;
    return visible.every(row => this.selectedPriceIds().has(row.id));
  }

  toggleSelectAll(event: any): void {
    const checked = event.target.checked;
    const set = new Set(this.selectedPriceIds());
    const visible = this.filteredPrices();

    if (checked) {
      visible.forEach(row => set.add(row.id));
    } else {
      visible.forEach(row => set.delete(row.id));
    }
    this.selectedPriceIds.set(set);
  }

  clearSelection(): void {
    this.selectedPriceIds.set(new Set());
  }

  onDeleteSelectedBatch(): void {
    const ids = Array.from(this.selectedPriceIds());
    if (ids.length === 0) return;

    if (confirm(`Are you sure you want to PERMANENTLY DELETE ${ids.length} selected price records?`)) {
      this.deletingBatch.set(true);
      this.api.delete('/api/market/prices/batch', ids).subscribe({
        next: () => {
          this.toastr.success(`Successfully deleted ${ids.length} market price records!`, 'Batch Delete Complete');
          this.clearSelection();
          this.loadPrices();
          this.deletingBatch.set(false);
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Failed to delete selected records', 'Delete Failed');
          this.deletingBatch.set(false);
        }
      });
    }
  }

  onDeleteSingle(id: number): void {
    if (confirm('Are you sure you want to delete this market price record?')) {
      this.api.delete(`/api/market/prices/${id}`).subscribe({
        next: () => {
          this.toastr.success('Record deleted', 'Deleted');
          const set = new Set(this.selectedPriceIds());
          set.delete(id);
          this.selectedPriceIds.set(set);
          this.loadPrices();
        },
        error: () => this.toastr.error('Failed to delete record', 'Error')
      });
    }
  }

  // --- SINGLE PRICE MODAL METHODS ---
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
      this.toastr.warning('Please select a valid crop', 'Validation Error');
      return;
    }
    if (!this.formPrice.mandiName.trim()) {
      this.toastr.warning('Please enter a mandi name', 'Validation Error');
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
        error: () => this.toastr.error('Failed to update price', 'Error')
      });
    } else {
      this.api.post('/api/market/prices', payload).subscribe({
        next: () => {
          this.toastr.success('Mandi price saved successfully', 'Success');
          this.closeModal();
          this.loadPrices();
        },
        error: () => this.toastr.error('Failed to create price record', 'Error')
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
