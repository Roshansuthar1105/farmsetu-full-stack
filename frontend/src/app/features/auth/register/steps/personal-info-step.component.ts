import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PasswordStrengthComponent } from '../../shared/password-strength.component';
import { RegistrationData } from '../register.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fs-personal-info-step',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PasswordStrengthComponent],
  template: `
    <div class="space-y-4">
      <div class="text-center mb-3">
        <div class="flex justify-center mb-2">
          <div class="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 flex items-center justify-center">
            <span class="material-icons text-2xl text-green-600 dark:text-green-400">person_add</span>
          </div>
        </div>
        <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">Create Account</h2>
        <p class="text-gray-400 text-xs mt-1">Join the FarmSetu family today</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onNext()" class="flex flex-col gap-3">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <!-- Full Name -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Full Name <span class="text-red-500">*</span></label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-icons text-base text-gray-400"
                      [class.text-red-400]="form.get('name')?.invalid && form.get('name')?.touched">badge</span>
              </div>
              <input formControlName="name"
                     placeholder="Enter your full name"
                     class="w-full pl-9 pr-3 py-2 text-sm rounded-xl
                            border border-gray-300 dark:border-gray-700
                            bg-gray-50/50 dark:bg-gray-900
                            text-gray-900 dark:text-white placeholder-gray-400
                            focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                            transition-all duration-200 outline-none"
                     [class.!border-red-500]="form.get('name')?.invalid && form.get('name')?.touched" />
            </div>
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
              <p class="text-[10px] text-red-500 mt-1">Full name is required</p>
            }
          </div>

          <!-- Mobile Number -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Mobile Number <span class="text-red-500">*</span></label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-icons text-base text-gray-400"
                      [class.text-red-400]="form.get('phone')?.invalid && form.get('phone')?.touched">smartphone</span>
              </div>
              <input formControlName="phone"
                     placeholder="10-digit mobile number"
                     class="w-full pl-9 pr-3 py-2 text-sm rounded-xl
                            border border-gray-300 dark:border-gray-700
                            bg-gray-50/50 dark:bg-gray-900
                            text-gray-900 dark:text-white placeholder-gray-400
                            focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                            transition-all duration-200 outline-none"
                     [class.!border-red-500]="form.get('phone')?.invalid && form.get('phone')?.touched" />
            </div>
            @if (form.get('phone')?.invalid && form.get('phone')?.touched) {
              <p class="text-[10px] text-red-500 mt-1">Please enter a valid 10-digit mobile number</p>
            }
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Password <span class="text-red-500">*</span></label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-icons text-base text-gray-400"
                      [class.text-red-400]="form.get('password')?.invalid && form.get('password')?.touched">lock_outline</span>
              </div>
              <input [type]="showPassword() ? 'text' : 'password'"
                     formControlName="password"
                     placeholder="Strong password"
                     class="w-full pl-9 pr-9 py-2 text-sm rounded-xl
                            border border-gray-300 dark:border-gray-700
                            bg-gray-50/50 dark:bg-gray-900
                            text-gray-900 dark:text-white placeholder-gray-400
                            focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                            transition-all duration-200 outline-none"
                     [class.!border-red-500]="form.get('password')?.invalid && form.get('password')?.touched" />
              <button type="button" (click)="showPassword.set(!showPassword())"
                      class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                <span class="material-icons text-base">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <p class="text-[10px] text-red-500 mt-1">Password must be at least 8 characters</p>
            }
            <div class="mt-1">
              <fs-password-strength [password]="form.get('password')?.value ?? ''" />
            </div>
          </div>

          <!-- Confirm Password -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Confirm Password <span class="text-red-500">*</span></label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="material-icons text-base text-gray-400"
                      [class.text-red-400]="form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched">task_alt</span>
              </div>
              <input [type]="showConfirmPassword() ? 'text' : 'password'"
                     formControlName="confirmPassword"
                     placeholder="Confirm password"
                     class="w-full pl-9 pr-9 py-2 text-sm rounded-xl
                            border border-gray-300 dark:border-gray-700
                            bg-gray-50/50 dark:bg-gray-900
                            text-gray-900 dark:text-white placeholder-gray-400
                            focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                            transition-all duration-200 outline-none"
                     [class.!border-red-500]="form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched" />
              <button type="button" (click)="showConfirmPassword.set(!showConfirmPassword())"
                      class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                <span class="material-icons text-base">{{ showConfirmPassword() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
            @if (form.hasError('passwordMismatch') && form.get('confirmPassword')?.touched) {
              <p class="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                <span class="material-icons text-[10px]">error</span> Passwords do not match
              </p>
            } @else if (form.get('confirmPassword')?.invalid && form.get('confirmPassword')?.touched) {
              <p class="text-[10px] text-red-500 mt-1">Please confirm your password</p>
            }
          </div>
        </div>

        <!-- Role Selection -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Register as</label>
          <div class="grid grid-cols-3 gap-2">
            @for (roleOption of roles; track roleOption.value) {
              <button type="button"
                      (click)="form.get('role')?.setValue(roleOption.value)"
                      class="flex flex-row sm:flex-col items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border transition-all duration-200"
                      [class]="form.get('role')?.value === roleOption.value
                        ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-sm shadow-green-500/5 text-green-700 dark:text-green-400'
                        : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:border-green-300'">
                <span class="material-icons text-lg">{{ roleOption.icon }}</span>
                <span class="text-[10px] font-bold">{{ roleOption.label }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Error Message -->
        @if (errorMsg()) {
          <div class="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs">
            <span class="material-icons text-base shrink-0">error_outline</span>
            <p>{{ errorMsg() }}</p>
          </div>
        }

        <!-- Submit Button -->
        <button type="submit"
                class="relative w-full rounded-xl text-sm font-bold text-white
                       bg-green-600 hover:bg-green-500 active:bg-green-700
                       border border-green-500/50 hover:border-green-400
                       shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)]
                       transition-all duration-200 ease-in-out
                       flex items-center justify-center gap-2"
                style="height: 40px;">
          @if (loading()) {
            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>Creating account...</span>
          } @else {
            <span class="material-icons text-base">arrow_forward</span>
            <span>Create Account</span>
          }
        </button>

        <!-- Login link -->
        <p class="text-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          Already registered?
          <a routerLink="/auth/login"
             class="font-bold text-green-600 dark:text-green-400 hover:text-green-700 transition-colors">
            Sign in
          </a>
        </p>
      </form>
    </div>
  `
})
export class PersonalInfoStepComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  @Input() data: Partial<RegistrationData> = {};
  @Input() loading = signal(false);
  @Input() errorMsg = signal<string | null>(null);
  @Output() next = new EventEmitter<Partial<RegistrationData>>();

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly roles = [
    { value: 'FARMER', label: 'Farmer', icon: 'agriculture' },
    { value: 'EXPERT', label: 'Expert', icon: 'science' },
    { value: 'SELLER', label: 'Seller', icon: 'storefront' }
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
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

  onNext(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Please fix the errors in the form before creating an account.');
      return;
    }
    if (this.loading()) return;
    const { confirmPassword, ...data } = this.form.getRawValue();
    this.next.emit(data);
  }
}