import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminPageHeaderComponent } from '../shared/admin-page-header/admin-page-header.component';

@Component({
  selector: 'fs-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent],
  template: `
    <div class="space-y-6">
      <fs-admin-page-header title="Settings" subtitle="Configure platform preferences and administration options" />

      <!-- Tabs -->
      <div class="flex gap-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1 overflow-x-auto">
        @for (tab of tabs; track tab.id) {
          <button (click)="activeTab.set(tab.id)"
            class="px-4 py-2.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap"
            [class.bg-white]="activeTab() === tab.id"
            [class.dark:bg-slate-700]="activeTab() === tab.id"
            [class.text-slate-900]="activeTab() === tab.id"
            [class.dark:text-white]="activeTab() === tab.id"
            [class.shadow-sm]="activeTab() === tab.id"
            [class.text-slate-500]="activeTab() !== tab.id"
            [class.hover:text-slate-700]="activeTab() !== tab.id"
            [class.dark:text-slate-400]="activeTab() !== tab.id">
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- General Settings -->
      @if (activeTab() === 'general') {
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-6 space-y-6">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">General Settings</h3>
          <div class="grid sm:grid-cols-2 gap-5">
            <div>
              <label class="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Platform Name</label>
              <input type="text" [(ngModel)]="settings.siteName" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Contact Email</label>
              <input type="email" [(ngModel)]="settings.contactEmail" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white" />
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Timezone</label>
              <select [(ngModel)]="settings.timezone" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white">
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Default Language</label>
              <select [(ngModel)]="settings.defaultLanguage" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white">
                <option value="en">English</option>
                <option value="hi">Hindi</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <button (click)="saveSettings()" class="fs-btn-primary text-sm">Save Changes</button>
          </div>
        </div>
      }

      <!-- Theme Settings -->
      @if (activeTab() === 'theme') {
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-6 space-y-6">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">Theme Settings</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <div><p class="text-sm font-medium text-slate-900 dark:text-white">Default Dark Mode</p>
                <p class="text-xs text-slate-500">Enable dark mode by default for new sessions</p></div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="settings.defaultDarkMode" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <div><p class="text-sm font-medium text-slate-900 dark:text-white">High Contrast Mode</p>
                <p class="text-xs text-slate-500">Improve accessibility with higher contrast</p></div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="settings.highContrast" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div>
              <label class="block text-xs font-semibold uppercase text-slate-500 mb-2">Accent Color</label>
              <div class="flex gap-3">
                @for (color of accentColors; track color.value) {
                  <button (click)="settings.accentColor = color.value"
                    class="w-10 h-10 rounded-xl border-2 transition-all"
                    [style.background]="color.value"
                    [class.border-slate-900]="settings.accentColor === color.value"
                    [class.dark:border-white]="settings.accentColor === color.value"
                    [class.border-transparent]="settings.accentColor !== color.value"
                    [class.scale-110]="settings.accentColor === color.value">
                  </button>
                }
              </div>
            </div>
          </div>
          <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <button (click)="saveSettings()" class="fs-btn-primary text-sm">Save Changes</button>
          </div>
        </div>
      }

      <!-- Security Settings -->
      @if (activeTab() === 'security') {
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-6 space-y-6">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">Security Settings</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
              <div><p class="text-sm font-medium text-slate-900 dark:text-white">Two-Factor Authentication</p>
                <p class="text-xs text-slate-500">Require 2FA for admin accounts</p></div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" [(ngModel)]="settings.require2FA" class="sr-only peer" />
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div class="grid sm:grid-cols-2 gap-5">
              <div>
                <label class="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Session Timeout (minutes)</label>
                <input type="number" [(ngModel)]="settings.sessionTimeout" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white" />
              </div>
              <div>
                <label class="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Max Login Attempts</label>
                <input type="number" [(ngModel)]="settings.maxLoginAttempts" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>
          <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <button (click)="saveSettings()" class="fs-btn-primary text-sm">Save Changes</button>
          </div>
        </div>
      }

      <!-- Email Settings -->
      @if (activeTab() === 'email') {
        <div class="rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm p-6 space-y-6">
          <h3 class="text-base font-semibold text-slate-900 dark:text-white">Email Settings</h3>
          <div class="grid sm:grid-cols-2 gap-5">
            <div><label class="block text-xs font-semibold uppercase text-slate-500 mb-1.5">SMTP Host</label>
              <input type="text" [(ngModel)]="settings.smtpHost" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white" /></div>
            <div><label class="block text-xs font-semibold uppercase text-slate-500 mb-1.5">SMTP Port</label>
              <input type="number" [(ngModel)]="settings.smtpPort" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white" /></div>
            <div><label class="block text-xs font-semibold uppercase text-slate-500 mb-1.5">From Email</label>
              <input type="email" [(ngModel)]="settings.fromEmail" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white" /></div>
            <div><label class="block text-xs font-semibold uppercase text-slate-500 mb-1.5">From Name</label>
              <input type="text" [(ngModel)]="settings.fromName" class="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white" /></div>
          </div>
          <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-700/60">
            <button (click)="saveSettings()" class="fs-btn-primary text-sm">Save Changes</button>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminSettingsComponent {
  readonly activeTab = signal('general');

  readonly tabs = [
    { id: 'general', label: 'General' },
    { id: 'theme', label: 'Theme' },
    { id: 'security', label: 'Security' },
    { id: 'email', label: 'Email' }
  ];

  readonly accentColors = [
    { label: 'Green', value: '#22C55E' },
    { label: 'Blue', value: '#3B82F6' },
    { label: 'Purple', value: '#8B5CF6' },
    { label: 'Rose', value: '#F43F5E' },
    { label: 'Amber', value: '#F59E0B' },
    { label: 'Teal', value: '#14B8A6' }
  ];

  settings: any = {
    siteName: 'FarmSetu',
    contactEmail: 'admin@farmsetu.com',
    timezone: 'Asia/Kolkata',
    defaultLanguage: 'en',
    defaultDarkMode: false,
    highContrast: false,
    accentColor: '#22C55E',
    require2FA: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    fromEmail: 'noreply@farmsetu.com',
    fromName: 'FarmSetu'
  };

  constructor() {
    const saved = localStorage.getItem('fs_admin_settings');
    if (saved) {
      try { this.settings = { ...this.settings, ...JSON.parse(saved) }; } catch {}
    }
  }

  saveSettings(): void {
    localStorage.setItem('fs_admin_settings', JSON.stringify(this.settings));
  }
}
