import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PasswordStrengthComponent } from '../../shared/password-strength.component';
import { RegistrationData } from '../register.component';

@Component({
  selector: 'fs-personal-info-step',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PasswordStrengthComponent],
  template: `
    <div class="space-y-5">
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Join FarmSetu Family 🌱
        </h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Create your account to get started
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onNext()" class="space-y-4">

        <!-- Full Name -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
            </svg>
          </div>
          <input formControlName="name"
                 placeholder="Full Name"
                 class="w-full pl-12 pr-4 py-4 text-base rounded-xl
                        border-2 border-gray-200 dark:border-gray-600
                        bg-gray-50 dark:bg-gray-700
                        text-gray-900 dark:text-white placeholder-gray-400
                        focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                        transition-all duration-200 outline-none" />
        </div>

        <!-- Mobile Number with Send OTP -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>
            </svg>
          </div>
          <input formControlName="phone"
                 placeholder="Mobile Number"
                 class="w-full pl-12 pr-28 py-4 text-base rounded-xl
                        border-2 border-gray-200 dark:border-gray-600
                        bg-gray-50 dark:bg-gray-700
                        text-gray-900 dark:text-white placeholder-gray-400
                        focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                        transition-all duration-200 outline-none" />
          <button type="button"
                  (click)="sendOtp()"
                  [disabled]="!form.get('phone')?.valid"
                  class="absolute right-2 top-1/2 -translate-y-1/2
                         px-4 py-2 text-xs font-bold rounded-lg
                         bg-green-600 text-white
                         hover:bg-green-700 disabled:opacity-50
                         transition-all duration-200">
            Send OTP
          </button>
        </div>

        <!-- Email (optional) -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
            </svg>
          </div>
          <input formControlName="email"
                 placeholder="Email (optional)"
                 class="w-full pl-12 pr-4 py-4 text-base rounded-xl
                        border-2 border-gray-200 dark:border-gray-600
                        bg-gray-50 dark:bg-gray-700
                        text-gray-900 dark:text-white placeholder-gray-400
                        focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                        transition-all duration-200 outline-none" />
        </div>

        <!-- Password -->
        <div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                   viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
              </svg>
            </div>
            <input [type]="showPassword() ? 'text' : 'password'"
                   formControlName="password"
                   placeholder="Password"
                   class="w-full pl-12 pr-12 py-4 text-base rounded-xl
                          border-2 border-gray-200 dark:border-gray-600
                          bg-gray-50 dark:bg-gray-700
                          text-gray-900 dark:text-white placeholder-gray-400
                          focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                          transition-all duration-200 outline-none" />
            <button type="button" (click)="showPassword.set(!showPassword())"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400
                           hover:text-gray-600 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>
          <fs-password-strength [password]="form.get('password')?.value ?? ''" />
        </div>

        <!-- Confirm Password -->
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                 viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <input [type]="showPassword() ? 'text' : 'password'"
                 formControlName="confirmPassword"
                 placeholder="Confirm Password"
                 class="w-full pl-12 pr-4 py-4 text-base rounded-xl
                        border-2 border-gray-200 dark:border-gray-600
                        bg-gray-50 dark:bg-gray-700
                        text-gray-900 dark:text-white placeholder-gray-400
                        focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                        transition-all duration-200 outline-none" />
        </div>
        @if (form.hasError('passwordMismatch')) {
          <p class="text-xs text-red-500 -mt-2">Passwords do not match</p>
        }

        <!-- Role Selection -->
        <div>
          <label class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 block">
            Register as:
          </label>
          <div class="grid grid-cols-3 gap-3">
            @for (roleOption of roles; track roleOption.value) {
              <button type="button"
                      (click)="form.get('role')?.setValue(roleOption.value)"
                      class="flex flex-col items-center gap-2 py-4 px-3 rounded-xl
                             border-2 transition-all duration-200"
                      [class]="form.get('role')?.value === roleOption.value
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-md shadow-green-500/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'">
                <span class="text-2xl">{{ roleOption.icon }}</span>
                <span class="text-xs font-semibold"
                      [class]="form.get('role')?.value === roleOption.value
                        ? 'text-green-700 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-400'">
                  {{ roleOption.label }}
                </span>
              </button>
            }
          </div>
        </div>

        <!-- Next Button -->
        <button type="submit"
                [disabled]="form.invalid"
                class="w-full py-4 rounded-xl text-base font-bold text-white
                       bg-gradient-to-r from-green-600 to-emerald-600
                       hover:from-green-700 hover:to-emerald-700
                       active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-lg shadow-green-500/30
                       transition-all duration-200
                       flex items-center justify-center gap-2"
                style="height: 56px;">
          Continue →
        </button>

        <!-- Login link -->
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          Already registered?
          <a routerLink="/auth/login"
             class="font-semibold text-green-600 dark:text-green-400
                    hover:text-green-700 transition-colors">
            Login
          </a>
        </p>
      </form>
    </div>
  `
})
export class PersonalInfoStepComponent {
  private readonly fb = inject(FormBuilder);

  @Input() data: Partial<RegistrationData> = {};
  @Output() next = new EventEmitter<Partial<RegistrationData>>();

  readonly showPassword = signal(false);

  readonly roles = [
    { value: 'FARMER', label: 'Farmer', icon: '👨‍🌾' },
    { value: 'EXPERT', label: 'Expert', icon: '👨‍🔬' },
    { value: 'SELLER', label: 'Seller', icon: '🏪' }
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    email: ['', Validators.email],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    role: ['FARMER']
  }, {
    validators: [this.passwordMatchValidator]
  });

  passwordMatchValidator(group: any) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  sendOtp(): void {
    const phone = this.form.get('phone')?.value;
    console.log('Sending OTP to', phone);
    // Call OTP service
  }

  onNext(): void {
    if (this.form.invalid) return;
    const { confirmPassword, ...data } = this.form.getRawValue();
    this.next.emit(data);
  }
}