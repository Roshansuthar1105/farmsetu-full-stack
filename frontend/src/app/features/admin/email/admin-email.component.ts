import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';
import { AdminModalComponent } from '../shared/admin-modal/admin-modal.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface UserOption {
  id: number;
  name: string;
  email: string;
  role: string;
  verified?: boolean;
}

interface BroadcastHistoryItem {
  id: string;
  subject: string;
  targetType: string;
  targetLabel: string;
  format: string;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  timestamp: string;
  status: string;
}

@Component({
  selector: 'fs-admin-email',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent, AdminModalComponent],
  template: `
    <div class="space-y-6">
      <fs-admin-page-header
        title="Email Broadcaster & IDE Studio"
        subtitle="Compose rich HTML/Markdown campaigns, select audience groups, test in real time, and broadcast to FarmSetu users.">
        <div class="flex items-center gap-3">
          <button (click)="activeTab.set('history'); loadHistory()" 
                  class="px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 shadow-sm">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Broadcast History</span>
          </button>
          <button (click)="openTestModal()" 
                  class="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            <span>Send Test Email</span>
          </button>
        </div>
      </fs-admin-page-header>

      <!-- Main Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-1">
        <button (click)="activeTab.set('compose')"
                [class]="activeTab() === 'compose' ? 'border-green-600 text-green-600 dark:text-green-400 font-bold border-b-2' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium'"
                class="px-5 py-2.5 text-sm transition flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
          </svg>
          <span>Compose & IDE Studio</span>
        </button>
        <button (click)="activeTab.set('preview')"
                [class]="activeTab() === 'preview' ? 'border-green-600 text-green-600 dark:text-green-400 font-bold border-b-2' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium'"
                class="px-5 py-2.5 text-sm transition flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          <span>Live Render Preview</span>
        </button>
        <button (click)="activeTab.set('history'); loadHistory()"
                [class]="activeTab() === 'history' ? 'border-green-600 text-green-600 dark:text-green-400 font-bold border-b-2' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 font-medium'"
                class="px-5 py-2.5 text-sm transition flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
          </svg>
          <span>Activity History Logs</span>
        </button>
      </div>

      <!-- TAB 1: COMPOSE & IDE STUDIO -->
      @if (activeTab() === 'compose') {
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- LEFT COLUMN: Audience & Target Selection (4 cols) -->
          <div class="lg:col-span-4 space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 space-y-5">
              <div>
                <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span>Audience Target Selection</span>
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">Choose who receives this email campaign</p>
              </div>

              <!-- Target Type Selector -->
              <div class="space-y-2">
                <label class="text-xs font-semibold text-gray-600 dark:text-gray-300">Targeting Mode</label>
                <div class="grid grid-cols-3 gap-2 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl">
                  <button type="button" (click)="setTargetMode('GROUP')"
                          [class]="targetMode() === 'GROUP' ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 font-bold shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'"
                          class="py-2 text-xs rounded-xl transition text-center">
                    Group / Role
                  </button>
                  <button type="button" (click)="setTargetMode('USERS')"
                          [class]="targetMode() === 'USERS' ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 font-bold shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'"
                          class="py-2 text-xs rounded-xl transition text-center">
                    Pick Users
                  </button>
                  <button type="button" (click)="setTargetMode('CUSTOM')"
                          [class]="targetMode() === 'CUSTOM' ? 'bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 font-bold shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'"
                          class="py-2 text-xs rounded-xl transition text-center">
                    Custom List
                  </button>
                </div>
              </div>

              <!-- MODE 1: GROUP / ROLE SELECTOR -->
              @if (targetMode() === 'GROUP') {
                <div class="space-y-3 pt-2">
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Select Audience Group</label>
                  <div class="space-y-2">
                    <label *ngFor="let g of groupOptions" 
                           class="flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer"
                           [class]="selectedGroup() === g.key ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 text-green-900 dark:text-green-200' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'">
                      <div class="flex items-center gap-3">
                        <input type="radio" name="groupOption" [value]="g.key" [checked]="selectedGroup() === g.key" (change)="selectedGroup.set(g.key)" class="text-green-600 focus:ring-green-500">
                        <div>
                          <div class="text-xs font-bold">{{ g.label }}</div>
                          <div class="text-[11px] text-gray-500 dark:text-gray-400">{{ g.description }}</div>
                        </div>
                      </div>
                      <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {{ getGroupCount(g.key) }}
                      </span>
                    </label>
                  </div>
                </div>
              }

              <!-- MODE 2: SPECIFIC USERS MULTI-PICKER -->
              @if (targetMode() === 'USERS') {
                <div class="space-y-3 pt-2">
                  <div class="flex justify-between items-center">
                    <label class="text-xs font-semibold text-gray-600 dark:text-gray-300">Select Specific Users</label>
                    <span class="text-[11px] text-green-600 font-bold">{{ selectedUserIds().length }} Selected</span>
                  </div>
                  
                  <input type="text" [(ngModel)]="userSearchTerm" (input)="filterUsers()" placeholder="Search users by name or email..." 
                         class="w-full text-xs px-3 py-2 border rounded-xl dark:bg-gray-700 outline-none focus:border-green-500" />
                  
                  <div class="max-h-60 overflow-y-auto space-y-1.5 pr-1 border rounded-xl p-2 dark:border-gray-700">
                    <div *ngFor="let user of filteredUsers()" 
                         (click)="toggleUserSelection(user.id)"
                         class="flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition"
                         [class]="isUserSelected(user.id) ? 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-200 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'">
                      <div class="flex items-center gap-2 overflow-hidden">
                        <input type="checkbox" [checked]="isUserSelected(user.id)" class="rounded text-green-600 focus:ring-green-500">
                        <div class="truncate">
                          <div class="truncate font-medium">{{ user.name }}</div>
                          <div class="text-[10px] text-gray-500 truncate">{{ user.email }}</div>
                        </div>
                      </div>
                      <span class="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">
                        {{ user.role }}
                      </span>
                    </div>
                  </div>
                </div>
              }

              <!-- MODE 3: CUSTOM EMAILS -->
              @if (targetMode() === 'CUSTOM') {
                <div class="space-y-2 pt-2">
                  <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300">Custom Recipient Emails</label>
                  <textarea [(ngModel)]="customEmailsInput" rows="4" placeholder="Enter recipient email addresses (comma separated)... e.g. farmer1@gmail.com, buyer2@agri.com"
                            class="w-full text-xs p-3 border rounded-xl dark:bg-gray-700 outline-none focus:border-green-500 font-mono"></textarea>
                  <p class="text-[11px] text-gray-400">Separate multiple email addresses with commas or line breaks.</p>
                </div>
              }

              <!-- Audience Summary Badge -->
              <div class="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl flex items-center justify-between">
                <div class="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
                  <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span class="font-semibold">Target Audience Size:</span>
                </div>
                <span class="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {{ estimatedRecipientCount() }} Recipients
                </span>
              </div>
            </div>

            <!-- FarmSetu Template Selector Card -->
            <div class="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-lg border border-gray-100 dark:border-gray-700 space-y-3">
              <h4 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h6a2 2 0 012 2v2M8 7H6a2 2 0 00-2 2v8a2 2 0 002 2h2m0-6h6m-6 4h6"></path>
                </svg>
                <span>Quick Presets & Templates</span>
              </h4>
              <div class="space-y-2">
                <button *ngFor="let t of templatePresets" (click)="applyTemplate(t)"
                        class="w-full text-left p-2.5 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-950/20 transition group">
                  <div class="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-green-600 dark:group-hover:text-green-400 flex items-center justify-between">
                    <span>{{ t.name }}</span>
                    <span class="text-[10px] font-normal uppercase px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">{{ t.format }}</span>
                  </div>
                  <div class="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{{ t.description }}</div>
                </button>
              </div>
            </div>
          </div>

          <!-- RIGHT COLUMN: IDE Editor Studio (8 cols) -->
          <div class="lg:col-span-8 space-y-6">
            <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-5">
              
              <!-- Form Top Bar & Subject -->
              <div class="space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <h2 class="text-lg font-extrabold text-gray-900 dark:text-white">Compose Email Campaign</h2>
                    <p class="text-xs text-gray-500">Design your email using Markdown, HTML, or Plain Text format.</p>
                  </div>
                  
                  <!-- Format Selector -->
                  <div class="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-gray-900 rounded-2xl text-xs">
                    <button type="button" (click)="mailFormat.set('markdown')" 
                            [class]="mailFormat() === 'markdown' ? 'bg-green-600 text-white font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'"
                            class="px-3 py-1.5 rounded-xl transition">
                      Markdown
                    </button>
                    <button type="button" (click)="mailFormat.set('html')" 
                            [class]="mailFormat() === 'html' ? 'bg-green-600 text-white font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'"
                            class="px-3 py-1.5 rounded-xl transition">
                      HTML / CSS
                    </button>
                    <button type="button" (click)="mailFormat.set('text')" 
                            [class]="mailFormat() === 'text' ? 'bg-green-600 text-white font-bold' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'"
                            class="px-3 py-1.5 rounded-xl transition">
                      Plain Text
                    </button>
                  </div>
                </div>

                <!-- Subject Line -->
                <div>
                  <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Campaign Subject Line</label>
                  <input type="text" [(ngModel)]="mailForm.subject" placeholder="e.g. Important Weather & Pest Advisory for Harvest Season" 
                         class="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition text-sm font-medium" />
                </div>
              </div>

              <!-- IDE Action Toolbar & Variable Injection Chips -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dynamic Placeholders (Click to insert)</label>
                  <span class="text-[11px] text-gray-400 font-mono">Format: {{ mailFormat() | uppercase }}</span>
                </div>
                
                <div class="flex flex-wrap items-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <button *ngFor="let varChip of variableChips" type="button" (click)="insertVariable(varChip.token)"
                          class="px-2.5 py-1 text-xs font-mono bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 text-green-700 dark:text-green-400 rounded-lg shadow-sm active:scale-95 transition flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <span>{{ varChip.token }}</span>
                  </button>

                  <div class="h-4 w-px bg-gray-300 dark:bg-gray-700 mx-1"></div>

                  <!-- Quick Formatting buttons -->
                  <button type="button" (click)="insertFormat('# ')" class="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 text-gray-800 dark:text-gray-200" title="Heading 1">H1</button>
                  <button type="button" (click)="insertFormat('## ')" class="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 text-gray-800 dark:text-gray-200" title="Heading 2">H2</button>
                  <button type="button" (click)="insertFormat('**bold**')" class="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 font-bold text-gray-800 dark:text-gray-200" title="Bold">B</button>
                  <button type="button" (click)="insertFormat('*italic*')" class="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 italic text-gray-800 dark:text-gray-200" title="Italic">I</button>
                  <button type="button" (click)="insertFormat('- ')" class="px-2 py-1 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 text-gray-800 dark:text-gray-200" title="List item">• List</button>
                </div>
              </div>

              <!-- IDE Textarea Studio with Line Counter styling -->
              <div class="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-slate-900 text-slate-100 shadow-inner">
                <div class="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 text-xs font-mono text-slate-400">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
                    <span class="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                    <span class="ml-2 font-semibold text-slate-300">email_content.{{ mailFormat() }}</span>
                  </div>
                  <div class="flex items-center gap-4 text-[11px]">
                    <span>Lines: {{ lineCount() }}</span>
                    <span>Chars: {{ mailForm.content.length }}</span>
                  </div>
                </div>

                <textarea id="ide-editor" [(ngModel)]="mailForm.content" rows="12" 
                          [placeholder]="editorPlaceholder" 
                          class="w-full bg-slate-900 text-slate-100 p-4 font-mono text-xs leading-relaxed outline-none resize-y focus:ring-0 border-none"></textarea>
              </div>

              <!-- Bottom Actions Bar -->
              <div class="pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
                <div class="flex items-center gap-2">
                  <button type="button" (click)="activeTab.set('preview')" 
                          class="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl transition flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    <span>Live Preview</span>
                  </button>
                  <button type="button" (click)="openTestModal()" 
                          class="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold rounded-xl transition flex items-center gap-2 border border-emerald-200 dark:border-emerald-800">
                    <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    <span>Test Send</span>
                  </button>
                </div>

                <button type="button" (click)="confirmBroadcast()" [disabled]="sending() || !mailForm.subject || !mailForm.content"
                        class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition flex items-center gap-2 disabled:opacity-50">
                  @if (sending()) {
                    <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    <span>Broadcasting...</span>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                    </svg>
                    <span>Broadcast to {{ estimatedRecipientCount() }} Users</span>
                  }
                </button>
              </div>

            </div>
          </div>

        </div>
      }

      <!-- TAB 2: LIVE RENDER PREVIEW -->
      @if (activeTab() === 'preview') {
        <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                <span>Real-Time Email Preview</span>
              </h3>
              <p class="text-xs text-gray-500">Live rendering simulation with placeholder values evaluated.</p>
            </div>
            
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-900 rounded-xl text-xs">
                <button (click)="previewViewport.set('desktop')" 
                        [class]="previewViewport() === 'desktop' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold shadow-sm' : 'text-gray-500'"
                        class="px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>Desktop</span>
                </button>
                <button (click)="previewViewport.set('mobile')" 
                        [class]="previewViewport() === 'mobile' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold shadow-sm' : 'text-gray-500'"
                        class="px-3 py-1.5 rounded-lg transition flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                  </svg>
                  <span>Mobile</span>
                </button>
              </div>
              <button (click)="activeTab.set('compose')" class="px-4 py-2 bg-green-600 text-white font-bold text-xs rounded-xl hover:bg-green-700 transition flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                <span>Back to Editor</span>
              </button>
            </div>
          </div>

          <!-- Email Client Mock Header -->
          <div class="mx-auto border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-lg bg-gray-50 dark:bg-gray-900"
               [class]="previewViewport() === 'mobile' ? 'max-w-sm' : 'max-w-3xl'">
            
            <!-- Email Header Metadata -->
            <div class="p-4 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 space-y-2 text-xs">
              <div class="flex items-center gap-2 text-gray-500">
                <span class="font-semibold w-16 text-right">From:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">FarmSetu Platform &lt;sroshan2931&#64;gmail.com&gt;</span>
              </div>
              <div class="flex items-center gap-2 text-gray-500">
                <span class="font-semibold w-16 text-right">To:</span>
                <span class="font-medium text-gray-800 dark:text-gray-200">Ramesh Kumar &lt;ramesh.farmer&#64;example.com&gt;</span>
              </div>
              <div class="flex items-center gap-2 text-gray-500">
                <span class="font-semibold w-16 text-right">Subject:</span>
                <span class="font-bold text-gray-900 dark:text-white">{{ mailForm.subject || '(No Subject)' }}</span>
              </div>
            </div>

            <!-- Email Body Render Area -->
            <div class="p-6 bg-white min-h-[350px] text-gray-800 text-sm">
              @if (!mailForm.content) {
                <div class="text-center py-16 text-gray-400 space-y-2">
                  <svg class="w-10 h-10 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <p>No content composed yet. Switch to Compose & IDE tab to draft your email.</p>
                </div>
              } @else {
                <div [innerHTML]="renderedPreviewHtml()"></div>
              }
            </div>

            <!-- Mock Footer -->
            <div class="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-[11px] text-center text-gray-400 font-mono">
              Render Engine: {{ mailFormat() | uppercase }} Mode • Simulated Preview
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: BROADCAST HISTORY & LOGS -->
      @if (activeTab() === 'history') {
        <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 space-y-5">
          <div class="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <span>Campaign Broadcast History</span>
              </h3>
              <p class="text-xs text-gray-500">Log of recent email broadcasts and target delivery performance.</p>
            </div>
            <button (click)="loadHistory()" class="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              <span>Refresh Logs</span>
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-gray-50 dark:bg-gray-900 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th class="p-3">Campaign Subject</th>
                  <th class="p-3">Target Group</th>
                  <th class="p-3">Format</th>
                  <th class="p-3">Recipients</th>
                  <th class="p-3">Status</th>
                  <th class="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-700 font-medium">
                @if (historyList().length === 0) {
                  <tr>
                    <td colspan="6" class="p-8 text-center text-gray-400">
                      No broadcast campaigns recorded yet.
                    </td>
                  </tr>
                } @else {
                  <tr *ngFor="let item of historyList()" class="hover:bg-gray-50/50 dark:hover:bg-gray-700/50">
                    <td class="p-3 font-bold text-gray-900 dark:text-white max-w-xs truncate">{{ item.subject }}</td>
                    <td class="p-3 text-gray-600 dark:text-gray-300 font-mono">{{ item.targetLabel }}</td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold">
                        {{ item.format }}
                      </span>
                    </td>
                    <td class="p-3 font-mono">
                      <span class="text-green-600 font-bold">{{ item.successCount }}</span> / <span>{{ item.totalRecipients }}</span>
                    </td>
                    <td class="p-3">
                      <span [class]="item.status === 'SUCCESS' ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
                            class="px-2.5 py-1 rounded-full text-[10px] font-bold">
                        {{ item.status }}
                      </span>
                    </td>
                    <td class="p-3 text-gray-400 font-mono text-[11px]">{{ item.timestamp | date:'short' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>

    <!-- TEST MAIL MODAL -->
    <fs-admin-modal *ngIf="showTestModal()" (close)="showTestModal.set(false)">
      <div modal-header class="flex items-center gap-2">
        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Send Real-Time Test Email</h3>
      </div>
      
      <div modal-content class="space-y-4 py-2">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Send a quick test dispatch of your current email draft with evaluated placeholders to verify how it looks in your mailbox.
        </p>
        
        <div>
          <label class="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">Test Recipient Email</label>
          <input type="email" [(ngModel)]="testRecipientEmail" placeholder="Enter test email address..." 
                 class="w-full border rounded-xl px-4 py-2.5 text-xs dark:bg-gray-700 outline-none focus:border-green-500" />
        </div>

        <div class="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-xs space-y-1">
          <div class="font-bold text-gray-700 dark:text-gray-300">Subject: [TEST] {{ mailForm.subject || 'Test Subject' }}</div>
          <div class="text-gray-500 font-mono text-[11px]">Format: {{ mailFormat() | uppercase }}</div>
        </div>
      </div>

      <div modal-footer class="flex justify-end gap-3">
        <button (click)="showTestModal.set(false)" class="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">
          Cancel
        </button>
        <button (click)="sendTestMail()" [disabled]="sendingTest() || !testRecipientEmail" 
                class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2">
          @if (sendingTest()) {
            <span>Sending...</span>
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <span>Send Test Mail Now</span>
          }
        </button>
      </div>
    </fs-admin-modal>
  `
})
export class AdminEmailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly toastr = inject(ToastrService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly activeTab = signal<'compose' | 'preview' | 'history'>('compose');
  readonly targetMode = signal<'GROUP' | 'USERS' | 'CUSTOM'>('GROUP');
  readonly mailFormat = signal<'markdown' | 'html' | 'text'>('markdown');
  readonly previewViewport = signal<'desktop' | 'mobile'>('desktop');

  readonly sending = signal(false);
  readonly sendingTest = signal(false);
  readonly showTestModal = signal(false);

  readonly selectedGroup = signal<string>('ALL');
  readonly selectedUserIds = signal<number[]>([]);
  readonly allUsers = signal<UserOption[]>([]);
  readonly filteredUsers = signal<UserOption[]>([]);
  readonly historyList = signal<BroadcastHistoryItem[]>([]);

  userSearchTerm = '';
  customEmailsInput = '';
  testRecipientEmail = 'admin@farmsetu.com';
  readonly editorPlaceholder = 'Type your content here... Use {{name}}, {{email}}, {{role}} for dynamic variables.';

  mailForm = {
    subject: 'Seasonal Harvest Advisory & Platform Update',
    content: `# Seasonal Crop Advisory & Market Guidance

Hello **{{name}}**,

We are pleased to bring you key agricultural insights for your region (**{{state}}**, {{village}}).

## Key Actions for this Week:
- **Soil Moisture Check**: Ensure optimal irrigation during crop flowering stage.
- **Pest Monitoring**: Inspect leaves for yellow rust or aphid activity.
- **Mandi Rates**: Check latest price trends on FarmSetu Marketplace.

If you have questions, reach out to our registered agricultural experts directly from your dashboard.

*Best Regards,*  
**The FarmSetu Team**  
*Date: {{date}}*`
  };

  readonly groupOptions = [
    { key: 'ALL', label: 'All Users', description: 'All registered platform users' },
    { key: 'FARMER', label: 'Farmers Only', description: 'Users registered with farmer role' },
    { key: 'EXPERT', label: 'Agronomy Experts', description: 'Verified agricultural specialists' },
    { key: 'SELLER', label: 'Marketplace Sellers', description: 'Product sellers and vendors' },
    { key: 'VERIFIED', label: 'Verified Users', description: 'Users with verified identity badge' }
  ];

  readonly templatePresets = [
    {
      name: 'Weather & Crop Advisory',
      format: 'markdown',
      description: 'Seasonal advice on pests, irrigation, and crop care',
      subject: 'Urgent Crop Advisory for Your Region',
      content: `# Crop Advisory & Weather Notice\n\nDear **{{name}}**,\n\nOur agronomy team has released a weather & pest advisory for **{{state}}**.\n\n### Recommendations:\n1. Inspect crops for early sign of fungal spot.\n2. Adjust fertilizer scheduling as rain is expected this week.\n\nVisit [FarmSetu Dashboard](https://farmsetu.com) for real-time diagnostic tools.`
    },
    {
      name: 'Market Price & Mandi Intelligence',
      format: 'markdown',
      description: 'Daily mandi rate highlights and selling opportunities',
      subject: 'Market Price Update & Mandi Intelligence',
      content: `# Mandi Rate & Market Intelligence\n\nHello **{{name}}**,\n\nHere are the top market trends for your area (**{{village}}**, {{state}}):\n\n- **Wheat**: ₹2,250 / Quintal (▲ 3%)\n- **Mustard**: ₹5,400 / Quintal (▲ 1.5%)\n- **Paddy**: ₹2,180 / Quintal (Stable)\n\nLog into your account to connect directly with verified buyers.`
    },
    {
      name: 'Govt Scheme & Subsidy Alert',
      format: 'html',
      description: 'Announcements regarding agricultural schemes and subsidies',
      subject: 'New Govt Scheme Alert: PM-Kisan & Subsidy Updates',
      content: `<div style="padding: 20px; background-color: #f0fdf4; border-radius: 12px;">\n<h2 style="color: #166534; margin-top:0;">New Agriculture Subsidy Announced</h2>\n<p>Dear <strong>{{name}}</strong>,</p>\n<p>Applications are now open for the solar pump subsidy in <strong>{{state}}</strong>. Eligible farmers can receive up to 60% financial assistance.</p>\n<a href="#" style="background-color: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; inline-block;">View Scheme Details</a>\n</div>`
    }
  ];

  readonly variableChips = [
    { token: '{{name}}', label: 'Name' },
    { token: '{{email}}', label: 'Email' },
    { token: '{{role}}', label: 'Role' },
    { token: '{{state}}', label: 'State' },
    { token: '{{village}}', label: 'Village' },
    { token: '{{date}}', label: 'Current Date' }
  ];

  ngOnInit(): void {
    this.loadUsers();
    this.loadHistory();
  }

  loadUsers(): void {
    this.api.get<any>('/api/admin/users', { page: 0, size: 100 }).subscribe({
      next: (res) => {
        const usersList: UserOption[] = (res.content || []).map((u: any) => ({
          id: u.id,
          name: u.name || 'User #' + u.id,
          email: u.email || 'No email',
          role: u.role || 'FARMER',
          verified: u.verified
        }));
        this.allUsers.set(usersList);
        this.filteredUsers.set(usersList);
      },
      error: () => this.toastr.error('Failed to load user list for targeting')
    });
  }

  loadHistory(): void {
    this.api.get<any[]>('/api/admin/mail/history').subscribe({
      next: (res) => this.historyList.set(res || []),
      error: () => {}
    });
  }

  setTargetMode(mode: 'GROUP' | 'USERS' | 'CUSTOM'): void {
    this.targetMode.set(mode);
  }

  filterUsers(): void {
    const term = this.userSearchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredUsers.set(this.allUsers());
      return;
    }
    const filtered = this.allUsers().filter(u => 
      u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
    );
    this.filteredUsers.set(filtered);
  }

  toggleUserSelection(userId: number): void {
    const current = [...this.selectedUserIds()];
    const index = current.indexOf(userId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(userId);
    }
    this.selectedUserIds.set(current);
  }

  isUserSelected(userId: number): boolean {
    return this.selectedUserIds().includes(userId);
  }

  getGroupCount(groupKey: string): number {
    const users = this.allUsers();
    if (groupKey === 'ALL') return users.length;
    if (groupKey === 'VERIFIED') return users.filter(u => u.verified).length;
    return users.filter(u => u.role === groupKey).length;
  }

  readonly estimatedRecipientCount = computed(() => {
    const mode = this.targetMode();
    if (mode === 'GROUP') {
      return this.getGroupCount(this.selectedGroup());
    }
    if (mode === 'USERS') {
      return this.selectedUserIds().length;
    }
    if (mode === 'CUSTOM') {
      return this.customEmailsInput.split(/[\n,]/).filter(e => e.trim().length > 0).length;
    }
    return 0;
  });

  readonly lineCount = computed(() => {
    return (this.mailForm.content.match(/\n/g) || []).length + 1;
  });

  insertVariable(token: string): void {
    const textarea = document.getElementById('ide-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const val = this.mailForm.content;
      this.mailForm.content = val.substring(0, start) + token + val.substring(end);
    } else {
      this.mailForm.content += ' ' + token;
    }
  }

  insertFormat(syntax: string): void {
    this.mailForm.content += '\n' + syntax;
  }

  applyTemplate(preset: any): void {
    this.mailForm.subject = preset.subject;
    this.mailForm.content = preset.content;
    this.mailFormat.set(preset.format);
    this.toastr.info(`Applied template: ${preset.name}`);
  }

  readonly renderedPreviewHtml = computed<SafeHtml>(() => {
    let content = this.mailForm.content || '';
    
    // Evaluate sample placeholders
    content = content.replace(/\{\{name\}\}/g, 'Ramesh Kumar');
    content = content.replace(/\{\{email\}\}/g, 'ramesh.farmer@example.com');
    content = content.replace(/\{\{role\}\}/g, 'FARMER');
    content = content.replace(/\{\{state\}\}/g, 'Punjab');
    content = content.replace(/\{\{village\}\}/g, 'Ludhiana');
    content = content.replace(/\{\{date\}\}/g, new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));

    const fmt = this.mailFormat();
    if (fmt === 'markdown') {
      let html = content;
      html = html.replace(/```(.*?)```/gs, '<pre style="background-color:#1e293b; color:#e2e8f0; padding:12px; border-radius:8px; font-family:monospace; overflow-x:auto;">$1</pre>');
      html = html.replace(/^### (.*)$/gm, '<h3 style="color:#059669; font-size:18px; margin-top:16px; margin-bottom:8px; font-weight:bold;">$1</h3>');
      html = html.replace(/^## (.*)$/gm, '<h2 style="color:#047857; font-size:22px; margin-top:20px; margin-bottom:10px; font-weight:bold;">$1</h2>');
      html = html.replace(/^# (.*)$/gm, '<h1 style="color:#065f46; font-size:26px; margin-top:24px; margin-bottom:12px; border-bottom:2px solid #ecfdf5; font-weight:bold;">$1</h1>');
      html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#111827;">$1</strong>');
      html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
      html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" style="color:#10b981; font-weight:600; text-decoration:underline;">$1</a>');
      html = html.replace(/^[-*] (.*)$/gm, '<li style="margin-bottom:4px;">$1</li>');
      html = html.replace(/\n\n/g, '</p><p style="margin-bottom:12px;">');
      html = html.replace(/\n/g, '<br/>');

      const fullCard = `<div style="font-family: 'Segoe UI', Roboto, sans-serif; color: #374151; font-size: 14px; line-height: 1.6;">
        <p style="margin-bottom:12px;">${html}</p>
        <hr style="border:none; border-top:1px solid #f3f4f6; margin-top:24px; margin-bottom:12px;"/>
        <footer style="font-size:11px; color:#9ca3af; text-align:center;">Sent via FarmSetu Platform Email Service</footer>
      </div>`;
      return this.sanitizer.bypassSecurityTrustHtml(fullCard);
    }

    return this.sanitizer.bypassSecurityTrustHtml(content);
  });

  openTestModal(): void {
    this.showTestModal.set(true);
  }

  sendTestMail(): void {
    if (!this.testRecipientEmail || !this.mailForm.subject || !this.mailForm.content) return;
    this.sendingTest.set(true);

    const payload = {
      to: this.testRecipientEmail,
      subject: this.mailForm.subject,
      content: this.mailForm.content,
      format: this.mailFormat()
    };

    this.api.post<any>('/api/admin/mail/test', payload).subscribe({
      next: (res) => {
        this.toastr.success(`Test email dispatched to ${this.testRecipientEmail}!`, 'Success');
        this.sendingTest.set(false);
        this.showTestModal.set(false);
      },
      error: (err) => {
        this.toastr.error(err?.message || 'Failed to send test mail', 'Error');
        this.sendingTest.set(false);
      }
    });
  }

  confirmBroadcast(): void {
    if (!this.mailForm.subject || !this.mailForm.content) {
      this.toastr.warning('Please enter subject and content before broadcasting');
      return;
    }
    const count = this.estimatedRecipientCount();
    if (count === 0) {
      this.toastr.warning('No recipients found for selected targeting mode');
      return;
    }

    if (confirm(`Are you sure you want to broadcast this email to ${count} recipients?`)) {
      this.executeBroadcast();
    }
  }

  private executeBroadcast(): void {
    this.sending.set(true);
    const mode = this.targetMode();
    const count = this.estimatedRecipientCount();

    const payload: any = {
      subject: this.mailForm.subject,
      content: this.mailForm.content,
      format: this.mailFormat(),
      targetType: mode === 'GROUP' ? (this.selectedGroup() === 'ALL' || this.selectedGroup() === 'VERIFIED' ? this.selectedGroup() : 'ROLE') : mode,
      roleName: mode === 'GROUP' && this.selectedGroup() !== 'ALL' && this.selectedGroup() !== 'VERIFIED' ? this.selectedGroup() : null,
      userIds: mode === 'USERS' ? this.selectedUserIds() : [],
      customEmails: mode === 'CUSTOM' ? this.customEmailsInput.split(/[\n,]/).map(e => e.trim()).filter(e => e) : []
    };

    this.api.post<any>('/api/admin/mail/broadcast', payload).subscribe({
      next: (res) => {
        this.toastr.success(`Successfully dispatched broadcast to ${res?.totalRecipients || count} recipients!`, 'Broadcast Dispatched');
        this.sending.set(false);
        this.loadHistory();
        this.activeTab.set('history');
      },
      error: (err) => {
        this.toastr.error(err?.message || 'Failed to dispatch broadcast', 'Broadcast Error');
        this.sending.set(false);
      }
    });
  }
}
