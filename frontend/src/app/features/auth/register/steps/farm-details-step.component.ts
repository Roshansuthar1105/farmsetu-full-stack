import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistrationData } from '../register.component';

@Component({
  selector: 'fs-farm-details-step',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="space-y-5">
      <div class="text-center mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Tell us about your farm 🚜
        </h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
          This helps us give personalized advice
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onComplete()" class="space-y-4">

        <!-- State Dropdown -->
        <div class="relative">
          <select formControlName="state"
                  class="w-full px-4 py-4 text-base rounded-xl appearance-none
                         border-2 border-gray-200 dark:border-gray-600
                         bg-gray-50 dark:bg-gray-700
                         text-gray-900 dark:text-white
                         focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                         transition-all duration-200 outline-none">
            <option value="" disabled>Select State</option>
            @for (state of states; track state) {
              <option [value]="state">{{ state }}</option>
            }
          </select>
          <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5"/>
            </svg>
          </div>
        </div>

        <!-- District -->
        <input formControlName="district" placeholder="District"
               class="w-full px-4 py-4 text-base rounded-xl
                      border-2 border-gray-200 dark:border-gray-600
                      bg-gray-50 dark:bg-gray-700
                      text-gray-900 dark:text-white placeholder-gray-400
                      focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                      transition-all duration-200 outline-none" />

        <!-- Village -->
        <input formControlName="village" placeholder="Village / Tehsil"
               class="w-full px-4 py-4 text-base rounded-xl
                      border-2 border-gray-200 dark:border-gray-600
                      bg-gray-50 dark:bg-gray-700
                      text-gray-900 dark:text-white placeholder-gray-400
                      focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                      transition-all duration-200 outline-none" />

        <!-- Farm Area -->
        <div class="flex gap-3">
          <input formControlName="farmArea" type="number" placeholder="Farm Area"
                 class="flex-1 px-4 py-4 text-base rounded-xl
                        border-2 border-gray-200 dark:border-gray-600
                        bg-gray-50 dark:bg-gray-700
                        text-gray-900 dark:text-white placeholder-gray-400
                        focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                        transition-all duration-200 outline-none" />
          <div class="flex rounded-xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden">
            @for (unit of ['Acres', 'Hectares']; track unit) {
              <button type="button"
                      (click)="form.get('farmAreaUnit')?.setValue(unit)"
                      class="px-4 py-4 text-sm font-semibold transition-all duration-200"
                      [class]="form.get('farmAreaUnit')?.value === unit
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-500 hover:bg-gray-100'">
                {{ unit }}
              </button>
            }
          </div>
        </div>

        <!-- Soil Type Visual Selector -->
        <div>
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
            Soil Type
          </label>
          <div class="grid grid-cols-5 gap-2">
            @for (soil of soilTypes; track soil.value) {
              <button type="button"
                      (click)="form.get('soilType')?.setValue(soil.value)"
                      class="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl
                             border-2 transition-all duration-200"
                      [class]="form.get('soilType')?.value === soil.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'">
                <span class="text-2xl">{{ soil.icon }}</span>
                <span class="text-[10px] font-bold leading-tight text-center"
                      [class]="form.get('soilType')?.value === soil.value
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-500'">
                  {{ soil.label }}
                </span>
              </button>
            }
          </div>
        </div>

        <!-- Experience Slider -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Farming Experience
            </label>
            <span class="text-sm font-bold text-green-600 dark:text-green-400">
              {{ form.get('experience')?.value }}{{ form.get('experience')?.value === 30 ? '+' : '' }} years
            </span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xl">👨‍🌾</span>
            <input type="range" formControlName="experience"
                   min="0" max="30" step="1"
                   class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full
                          appearance-none cursor-pointer
                          [&::-webkit-slider-thumb]:appearance-none
                          [&::-webkit-slider-thumb]:w-6
                          [&::-webkit-slider-thumb]:h-6
                          [&::-webkit-slider-thumb]:bg-green-600
                          [&::-webkit-slider-thumb]:rounded-full
                          [&::-webkit-slider-thumb]:shadow-lg
                          [&::-webkit-slider-thumb]:cursor-pointer
                          accent-green-600" />
          </div>
        </div>

        <!-- Buttons Row -->
        <div class="flex gap-3 pt-2">
          <button type="button"
                  (click)="back.emit()"
                  class="flex-1 py-4 rounded-xl text-base font-bold
                         border-2 border-gray-200 dark:border-gray-600
                         text-gray-600 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-700
                         transition-all duration-200"
                  style="height: 56px;">
            ← Back
          </button>

          <button type="submit"
                  class="flex-[2] py-4 rounded-xl text-base font-bold text-white
                         bg-gradient-to-r from-green-600 to-emerald-600
                         hover:from-green-700 hover:to-emerald-700
                         active:scale-[0.98]
                         shadow-lg shadow-green-500/30
                         transition-all duration-200"
                  style="height: 56px;">
            Join FarmSetu! 🎉
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