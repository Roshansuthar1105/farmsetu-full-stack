import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistrationData } from '../register.component';

@Component({
  selector: 'fs-farm-details-step',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-5">
      <div class="text-center mb-2">
        <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">
          Farming Profile 🚜
        </h2>
        <p class="text-gray-400 text-xs">
          Help us customize your FarmSetu features
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onComplete()" class="space-y-4">

        <!-- State Dropdown -->
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
              <option value="" disabled>Select State</option>
              @for (state of states; track state) {
                <option [value]="state">{{ state }}</option>
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
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tehsil / Village</label>
            <input formControlName="village" placeholder="Village"
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
            <input formControlName="farmArea" type="number" placeholder="Land Area"
                   class="flex-1 px-4 py-3 text-sm rounded-xl
                          border border-gray-300 dark:border-gray-700
                          bg-gray-50/50 dark:bg-gray-900
                          text-gray-900 dark:text-white placeholder-gray-400
                          focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                          transition-all duration-200 outline-none" />
            <div class="flex rounded-xl border border-gray-300 dark:border-gray-700 overflow-hidden bg-gray-50/50 dark:bg-gray-900 p-1 shrink-0">
              @for (unit of ['Acres', 'Hectares']; track unit) {
                <button type="button"
                        (click)="form.get('farmAreaUnit')?.setValue(unit)"
                        class="px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200"
                        [class]="form.get('farmAreaUnit')?.value === unit
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'text-gray-400 hover:text-gray-700 bg-gray-50/50 dark:bg-gray-900'">
                  {{ unit }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Soil Type Visual Selector -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Soil Type
          </label>
          <div class="grid grid-cols-5 gap-2">
            @for (soil of soilTypes; track soil.value) {
              <button type="button"
                      (click)="form.get('soilType')?.setValue(soil.value)"
                      class="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl
                             border transition-all duration-200"
                      [class]="form.get('soilType')?.value === soil.value
                        ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-sm text-green-700 dark:text-green-400'
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-green-300'">
                <span class="text-xl">{{ soil.icon }}</span>
                <span class="text-[9px] font-bold leading-none text-center">
                  {{ soil.label }}
                </span>
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
          <div class="flex items-center gap-3">
            <span class="text-lg">👨‍🌾</span>
            <input type="range" formControlName="experience"
                   min="0" max="30" step="1"
                   class="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full
                          appearance-none cursor-pointer accent-green-600" />
          </div>
        </div>

        <!-- Buttons Row -->
        <div class="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <button type="button"
                  (click)="back.emit()"
                  class="flex-1 py-3 rounded-xl text-sm font-bold
                         border border-gray-300 dark:border-gray-700
                         text-gray-500 dark:text-gray-400
                         hover:bg-gray-100 dark:hover:bg-gray-800
                         transition-all duration-200"
                  style="height: 48px;">
            ← Back
          </button>

          <button type="submit"
                  class="flex-[2] py-3 rounded-xl text-sm font-bold text-white
                         bg-gradient-to-r from-green-600 to-emerald-600
                         hover:from-green-700 hover:to-emerald-700
                         active:scale-[0.98]
                         shadow-lg shadow-green-500/10
                         transition-all duration-200"
                  style="height: 48px;">
            Complete 🎉
          </button>
        </div>
      </form>
    </div>
  `
})
export class FarmDetailsStepComponent {
  private readonly fb = inject(FormBuilder);

  @Input() data: Partial<RegistrationData> = {};
  @Output() complete = new EventEmitter<Partial<RegistrationData>>();
  @Output() back = new EventEmitter<void>();

  readonly states = [
    'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Punjab', 'Rajasthan',
    'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
  ];

  readonly soilTypes = [
    { value: 'sandy', label: 'Sandy', icon: '🏖️' },
    { value: 'clay', label: 'Clay', icon: '🧱' },
    { value: 'loamy', label: 'Loamy', icon: '🌱' },
    { value: 'silt', label: 'Silt', icon: '🌊' },
    { value: 'black', label: 'Black', icon: '⬛' }
  ];

  readonly form = this.fb.nonNullable.group({
    state: ['', Validators.required],
    district: [''],
    village: [''],
    farmArea: [0],
    farmAreaUnit: ['Acres'],
    soilType: ['loamy'],
    experience: [0]
  });

  onComplete(): void {
    this.complete.emit(this.form.getRawValue());
  }
}