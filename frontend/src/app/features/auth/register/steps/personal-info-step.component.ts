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
      <div class="text-center mb-2">
        <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">
          Create Account 🌱
        </h2>
        <p class="text-gray-400 text-xs">
          Join the FarmSetu family today
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onNext()" class="space-y-4">

        <!-- Full Name -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span class="material-icons text-base text-gray-400">person</span>
            </div>
            <input formControlName="name"
                   placeholder="Enter your full name"
                   class="w-full pl-10 pr-4 py-3 text-sm rounded-xl
                          border border-gray-300 dark:border-gray-700
                          bg-gray-50/50 dark:bg-gray-900
                          text-gray-900 dark:text-white placeholder-gray-400
                          focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                          transition-all duration-200 outline-none" />
          </div>
        </div>

        <!-- Mobile Number with Send OTP -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Mobile Number</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span class="material-icons text-base text-gray-400">phone_iphone</span>
            </div>
            <input formControlName="phone"
                   placeholder="Enter 10-digit mobile number"
                   class="w-full pl-10 pr-24 py-3 text-sm rounded-xl
                          border border-gray-300 dark:border-gray-700
                          bg-gray-50/50 dark:bg-gray-900
                          text-gray-900 dark:text-white placeholder-gray-400
                          focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                          transition-all duration-200 outline-none" />
            <button type="button"
                    (click)="sendOtp()"
                    [disabled]="!form.get('phone')?.valid"
                    class="absolute right-2 top-1/2 -translate-y-1/2
                           px-3 py-1.5 text-xs font-bold rounded-lg
                           bg-green-600 hover:bg-green-700 text-white disabled:opacity-50
                           transition-all duration-200">
              Send OTP
            </button>
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email (Optional)</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span class="material-icons text-base text-gray-400">mail_outline</span>
            </div>
            <input formControlName="email"
                   placeholder="Enter email address"
                   class="w-full pl-10 pr-4 py-3 text-sm rounded-xl
                          border border-gray-300 dark:border-gray-700
                          bg-gray-50/50 dark:bg-gray-900
                          text-gray-900 dark:text-white placeholder-gray-400
                          focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                          transition-all duration-200 outline-none" />
          </div>
        </div>

        <!-- Password -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Password</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span class="material-icons text-base text-gray-400">lock</span>
            </div>
            <input [type]="showPassword() ? 'text' : 'password'"
                   formControlName="password"
                   placeholder="Create password"
                   class="w-full pl-10 pr-10 py-3 text-sm rounded-xl
                          border border-gray-300 dark:border-gray-700
                          bg-gray-50/50 dark:bg-gray-900
                          text-gray-900 dark:text-white placeholder-gray-400
                          focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                          transition-all duration-200 outline-none" />
            <button type="button" (click)="showPassword.set(!showPassword())"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400
                           hover:text-gray-600 transition-colors">
              <span class="material-icons text-base">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
          <fs-password-strength [password]="form.get('password')?.value ?? ''" />
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span class="material-icons text-base text-gray-400">task_alt</span>
            </div>
            <input [type]="showPassword() ? 'text' : 'password'"
                   formControlName="confirmPassword"
                   placeholder="Confirm your password"
                   class="w-full pl-10 pr-4 py-3 text-sm rounded-xl
                          border border-gray-300 dark:border-gray-700
                          bg-gray-50/50 dark:bg-gray-900
                          text-gray-900 dark:text-white placeholder-gray-400
                          focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                          transition-all duration-200 outline-none" />
          </div>
          @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
            <p class="text-xs text-red-500 mt-1">Passwords do not match</p>
          }
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Register as:
          </label>
          <div class="grid grid-cols-3 gap-3">
            @for (roleOption of roles; track roleOption.value) {
              <button type="button"
                      (click)="form.get('role')?.setValue(roleOption.value)"
                      class="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl
                             border transition-all duration-200"
                      [class]="form.get('role')?.value === roleOption.value
                        ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-sm shadow-green-500/5 text-green-700 dark:text-green-400'
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-green-300'">
                <span class="text-xl">{{ roleOption.icon }}</span>
                <span class="text-[10px] font-bold">
                  {{ roleOption.label }}
                </span>
              </button>
            }
          </div>
        </div>

        <!-- Next Button -->
        <button type="submit"
                [disabled]="form.invalid"
                class="w-full rounded-xl text-sm font-bold text-white
                       bg-gradient-to-r from-green-600 to-emerald-600
                       hover:from-green-700 hover:to-emerald-700
                       active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-lg shadow-green-500/10
                       transition-all duration-200
                       flex items-center justify-center gap-2"
                style="height: 48px;">
          Continue →
        </button>

        <!-- Login link -->
        <p class="text-center text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
          Already registered?
          <a routerLink="/auth/login"
             class="font-bold text-green-600 dark:text-green-400 hover:text-green-700 transition-colors">
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