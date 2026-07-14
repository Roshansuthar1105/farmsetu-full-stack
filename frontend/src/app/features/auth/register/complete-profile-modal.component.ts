import { Component, inject, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'fs-complete-profile-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" (click)="onDismiss()"></div>

      <!-- Modal Card -->
      <div class="relative z-10 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">

        <!-- Header -->
        <div class="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 flex items-center justify-center shrink-0">
                <span class="material-icons text-xl text-green-600 dark:text-green-400">agriculture</span>
              </div>
              <div>
                <h3 class="text-base font-extrabold text-gray-900 dark:text-white">Complete Your Profile</h3>
                <p class="text-xs text-gray-400 mt-0.5">Help us personalize your FarmSetu experience</p>
              </div>
            </div>
            <button type="button" (click)="onDismiss()"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <span class="material-icons text-xl">close</span>
            </button>
          </div>
        </div>

        <!-- Scrollable form body -->
        <div class="overflow-y-auto max-h-[70vh] px-6 py-5">
          <form [formGroup]="form" (ngSubmit)="onSave()" class="space-y-4">

            <!-- Email (optional) -->
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Email Address <span class="text-gray-300 dark:text-gray-600 font-normal normal-case">(optional)</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span class="material-icons text-base text-gray-400">mail_outline</span>
                </div>
                <input formControlName="email" type="email" placeholder="Enter email address"
                       class="w-full pl-10 pr-4 py-3 text-sm rounded-xl
                              border border-gray-300 dark:border-gray-700
                              bg-gray-50/50 dark:bg-gray-900
                              text-gray-900 dark:text-white placeholder-gray-400
                              focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                              transition-all duration-200 outline-none" />
              </div>
            </div>

            <!-- State -->
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">State</label>
              <div class="relative">
                <select formControlName="state"
                        class="w-full px-4 py-3 text-sm rounded-xl appearance-none
                               border border-gray-300 dark:border-gray-700
                               bg-gray-50/50 dark:bg-gray-900
                               text-gray-900 dark:text-white
                               focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                               transition-all duration-200 outline-none">
                  <option value="">Select State</option>
                  @for (s of states; track s) {
                    <option [value]="s">{{ s }}</option>
                  }
                </select>
                <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <span class="material-icons text-base text-gray-400">expand_more</span>
                </div>
              </div>
            </div>

            <!-- District & Village -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">District</label>
                <input formControlName="district" placeholder="District"
                       class="w-full px-4 py-3 text-sm rounded-xl
                              border border-gray-300 dark:border-gray-700
                              bg-gray-50/50 dark:bg-gray-900
                              text-gray-900 dark:text-white placeholder-gray-400
                              focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                              transition-all duration-200 outline-none" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Village</label>
                <input formControlName="village" placeholder="Village / Tehsil"
                       class="w-full px-4 py-3 text-sm rounded-xl
                              border border-gray-300 dark:border-gray-700
                              bg-gray-50/50 dark:bg-gray-900
                              text-gray-900 dark:text-white placeholder-gray-400
                              focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                              transition-all duration-200 outline-none" />
              </div>
            </div>

            <!-- Farm Area -->
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Total Land Area</label>
              <div class="flex gap-2">
                <div class="relative flex-1">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span class="material-icons text-base text-gray-400">landscape</span>
                  </div>
                  <input formControlName="farmArea" type="number" min="0" placeholder="Area"
                         class="w-full pl-10 pr-4 py-3 text-sm rounded-xl
                                border border-gray-300 dark:border-gray-700
                                bg-gray-50/50 dark:bg-gray-900
                                text-gray-900 dark:text-white placeholder-gray-400
                                focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                                transition-all duration-200 outline-none" />
                </div>
                <div class="flex rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden bg-gray-50/50 dark:bg-gray-900 p-1 shrink-0">
                  @for (unit of ['Acres', 'Hectares']; track unit) {
                    <button type="button"
                            (click)="form.get('farmAreaUnit')?.setValue(unit)"
                            class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200"
                            [class]="form.get('farmAreaUnit')?.value === unit
                              ? 'bg-green-600 text-white shadow-sm'
                              : 'text-gray-400 hover:text-gray-700'">
                      {{ unit }}
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Soil Type -->
            <div>
              <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Soil Type</label>
              <div class="grid grid-cols-5 gap-2">
                @for (soil of soilTypes; track soil.value) {
                  <button type="button"
                          (click)="form.get('soilType')?.setValue(soil.value)"
                          class="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border transition-all duration-200"
                          [class]="form.get('soilType')?.value === soil.value
                            ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-sm text-green-700 dark:text-green-400'
                            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-400 hover:border-green-300'">
                    <span class="material-icons text-lg">{{ soil.icon }}</span>
                    <span class="text-[9px] font-bold leading-none text-center">{{ soil.label }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Experience Slider -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Farming Experience
                </label>
                <span class="text-xs font-extrabold text-green-600 dark:text-green-400">
                  {{ form.get('experience')?.value }}{{ form.get('experience')?.value === 30 ? '+' : '' }} Years
                </span>
              </div>
              <div class="flex items-center gap-3 w-full">
                <span class="material-icons text-lg text-gray-400">eco</span>
                <input type="range" formControlName="experience"
                       min="0" max="30" step="1"
                       class="flex-1 w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-full
                              appearance-none cursor-pointer accent-green-600 shadow-inner" />
                <span class="material-icons text-lg text-green-600">agriculture</span>
              </div>
            </div>

            <!-- Error -->
            @if (saveError()) {
              <div class="flex items-center gap-2.5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs">
                <span class="material-icons text-base shrink-0">error_outline</span>
                <p>{{ saveError() }}</p>
              </div>
            }

          </form>
        </div>

        <!-- Footer actions -->
        <div class="px-6 pb-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-3">
          <button type="button" (click)="onDismiss()"
                  class="flex-1 py-3 rounded-xl text-sm font-bold
                         border border-gray-300 dark:border-gray-700
                         text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-700
                         transition-all duration-200"
                  style="height: 48px;">
            Complete Later
          </button>
          <button type="button" (click)="onSave()"
                  [disabled]="saving()"
                  class="flex-[2] py-3 rounded-xl text-sm font-bold text-white
                         bg-gradient-to-r from-green-600 to-emerald-600
                         hover:from-green-700 hover:to-emerald-700
                         active:scale-[0.98]
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                         shadow-lg shadow-green-500/10
                         transition-all duration-200
                         flex items-center justify-center gap-2"
                  style="height: 48px;">
            @if (saving()) {
              <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span>Saving...</span>
            } @else {
              <span class="material-icons text-base">check_circle</span>
              <span>Save Profile</span>
            }
          </button>
        </div>
      </div>
    </div>
  `
})
export class CompleteProfileModalComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ApiService);
  private readonly authService = inject(AuthService);

  @Input() userId!: number;
  @Output() saved = new EventEmitter<void>();
  @Output() dismissed = new EventEmitter<void>();

  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly states = [
    'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
    'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
  ];

  readonly soilTypes = [
    { value: 'sandy', label: 'Sandy', icon: 'terrain' },
    { value: 'clay', label: 'Clay', icon: 'water_drop' },
    { value: 'loamy', label: 'Loamy', icon: 'grass' },
    { value: 'silt', label: 'Silt', icon: 'waves' },
    { value: 'black', label: 'Black', icon: 'circle' }
  ];

  readonly form = this.fb.nonNullable.group({
    email: [''],
    state: [''],
    district: [''],
    village: [''],
    farmArea: [0],
    farmAreaUnit: ['Acres'],
    soilType: ['loamy'],
    experience: [0]
  });

  ngOnInit(): void {
    // Pre-fill from existing user data if available
    const user = this.authService.currentUser();
    if (user) {
      this.form.patchValue({
        email: user.email ?? '',
        state: user.state ?? '',
        district: user.district ?? '',
        village: user.village ?? ''
      });
    }
  }

  onSave(): void {
    this.saving.set(true);
    this.saveError.set(null);
    const { farmAreaUnit, ...rest } = this.form.getRawValue();
    const payload = { ...rest, farmAreaUnitLabel: farmAreaUnit };

    this.api.put<Record<string, unknown>>('/api/users/me', payload).subscribe({
      next: (_res: Record<string, unknown>) => {
        this.saving.set(false);
        const current = this.authService.currentUser();
        if (current) {
          this.authService.updateCurrentUser({ ...current, ...payload });
        }
        this.saved.emit();
      },
      error: (err: { error?: { message?: string } }) => {
        this.saving.set(false);
        this.saveError.set(err?.error?.message ?? 'Failed to save profile. Please try again.');
      }
    });
  }

  onDismiss(): void {
    this.dismissed.emit();
  }
}
