import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OtpInputComponent } from '../shared/otp-input.component';
import { AuthLayoutComponent } from '../shared/auth-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fs-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, OtpInputComponent, AuthLayoutComponent, FormsModule],
  template: `
    <fs-auth-layout>
      <!-- Back Link -->
      <a routerLink="/auth/login"
         class="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400
                hover:text-gray-700 mb-4 transition-colors">
        <span class="material-icons text-sm">arrow_back</span>
        Back to Login
      </a>

      <!-- Icon & Header -->
      <div class="text-center space-y-1 mb-4">
        <div class="flex justify-center">
          <div class="w-14 h-14 bg-amber-50 dark:bg-amber-950/20 rounded-full flex items-center justify-center border border-amber-100 dark:border-amber-900/40">
            <span class="material-icons text-2xl text-amber-600 dark:text-amber-400">lock_reset</span>
          </div>
        </div>
        <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">
          Reset Password
        </h2>
        <p class="text-gray-400 text-xs">
          Choose a method to verify your account identity
        </p>
      </div>

      <!-- Tab Switch -->
      <div class="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4 border border-gray-200/50 dark:border-gray-700/50">
        @for (tab of ['Via OTP', 'Via Email']; track tab) {
          <button (click)="activeTab.set(tab)"
                  class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
                  [class]="activeTab() === tab
                    ? 'bg-white dark:bg-gray-750 text-green-700 dark:text-green-400 shadow-sm'
                    : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'">
            {{ tab }}
          </button>
        }
      </div>

      @switch (step()) {
        @case ('input') {
          <form [formGroup]="form" (ngSubmit)="submitIdentifier()" class="space-y-4">
            @if (activeTab() === 'Via OTP') {
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Mobile Number</label>
                <input formControlName="phone" placeholder="Enter 10-digit mobile number"
                       class="w-full px-4 py-2.5 text-sm rounded-xl
                              border border-gray-300 dark:border-gray-700
                              bg-gray-50/50 dark:bg-gray-900
                              text-gray-900 dark:text-white placeholder-gray-400
                              focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10
                              transition-all duration-200 outline-none" />
              </div>
            } @else {
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input formControlName="email" placeholder="Enter registered email address"
                       class="w-full px-4 py-2.5 text-sm rounded-xl
                              border border-gray-300 dark:border-gray-700
                              bg-gray-50/50 dark:bg-gray-900
                              text-gray-900 dark:text-white placeholder-gray-400
                              focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10
                              transition-all duration-200 outline-none" />
              </div>
            }

            <!-- Error -->
            @if (error()) {
              <div class="flex items-center gap-2.5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-650 dark:text-red-400 text-xs">
                <span class="material-icons text-base shrink-0">error_outline</span>
                <p>{{ error() }}</p>
              </div>
            }

            <button type="submit"
                    class="relative w-full rounded-xl text-sm font-bold text-white
                           bg-amber-500 hover:bg-amber-400 active:bg-amber-600
                           border border-amber-400/50 hover:border-amber-300
                           shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(245,158,11,0.3)]
                           transition-all duration-200 ease-in-out
                           flex items-center justify-center gap-2"
                    style="height: 44px;">
              @if (loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Sending...</span>
              } @else {
                <span>Send Verification Code</span>
              }
            </button>
          </form>
        }

        @case ('otp') {
          <div class="space-y-6">
            <p class="text-center text-xs text-gray-400 font-medium">
              Enter the 6-digit code sent to your {{ activeTab() === 'Via OTP' ? 'phone' : 'email' }}
            </p>
            <div class="flex justify-center">
              <fs-otp-input [length]="6" (otpComplete)="onOtpVerified($event)" />
            </div>

            <!-- New Password Fields -->
            <div class="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span class="material-icons text-base text-gray-400">lock_outline</span>
                  </div>
                  <input [type]="showNewPassword() ? 'text' : 'password'" placeholder="Enter new password"
                         class="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl
                                border border-gray-300 dark:border-gray-700
                                bg-gray-50/50 dark:bg-gray-900
                                text-gray-900 dark:text-white placeholder-gray-400
                                focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                                transition-all duration-200 outline-none"
                         [(ngModel)]="newPassword" />
                  <button type="button" (click)="showNewPassword.set(!showNewPassword())"
                          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    <span class="material-icons text-base">{{ showNewPassword() ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Confirm New Password</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span class="material-icons text-base text-gray-400">task_alt</span>
                  </div>
                  <input [type]="showConfirmPassword() ? 'text' : 'password'" placeholder="Confirm new password"
                         class="w-full pl-10 pr-10 py-3 text-sm rounded-xl
                                border border-gray-300 dark:border-gray-700
                                bg-gray-50/50 dark:bg-gray-900
                                text-gray-900 dark:text-white placeholder-gray-400
                                focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                                transition-all duration-200 outline-none"
                         [(ngModel)]="confirmNewPassword" />
                  <button type="button" (click)="showConfirmPassword.set(!showConfirmPassword())"
                          class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    <span class="material-icons text-base">{{ showConfirmPassword() ? 'visibility_off' : 'visibility' }}</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Error -->
            @if (error()) {
              <div class="flex items-center gap-2.5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-650 dark:text-red-400 text-xs">
                <span class="material-icons text-base shrink-0">error_outline</span>
                <p>{{ error() }}</p>
              </div>
            }

            <button (click)="resetPassword()"
                    class="relative w-full rounded-xl text-sm font-bold text-white
                           bg-green-600 hover:bg-green-500 active:bg-green-700
                           border border-green-500/50 hover:border-green-400
                           shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(22,163,74,0.3)]
                           transition-all duration-200 ease-in-out
                           flex items-center justify-center gap-2"
                    style="height: 44px;">
              @if (loading()) {
                <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Resetting...</span>
              } @else {
                <span>Reset Password</span>
              }
            </button>
          </div>
        }
      }
    </fs-auth-layout>
  `
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  readonly activeTab = signal('Via OTP');
  readonly step = signal<'input' | 'otp'>('input');
  readonly error = signal<string | null>(null);
  readonly loading = signal(false);
  readonly showNewPassword = signal(false);
  readonly showConfirmPassword = signal(false);

  readonly form = this.fb.nonNullable.group({
    phone: [''],
    email: ['']
  });

  newPassword = '';
  confirmNewPassword = '';
  otpEntered = '';

  submitIdentifier(): void {
    const isPhone = this.activeTab() === 'Via OTP';
    const identifier = isPhone ? this.form.get('phone')?.value : this.form.get('email')?.value;
    
    if (!identifier) {
      this.toastr.error(`Please enter a valid ${isPhone ? 'mobile number' : 'email address'}.`);
      return;
    }
    
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    this.auth.forgotPassword(identifier, isPhone ? 'phone' : 'email').subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set('otp');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message || 'Verification code failed to send.');
      }
    });
  }

  onOtpVerified(otp: string): void {
    this.otpEntered = otp;
  }

  resetPassword(): void {
    if (!this.newPassword || !this.confirmNewPassword) {
      this.toastr.error('Please enter both password fields.');
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.toastr.error('Passwords do not match.');
      return;
    }
    if (this.newPassword.length < 8) {
      this.toastr.error('Password must be at least 8 characters long.');
      return;
    }
    if (!this.otpEntered) {
      this.toastr.error('Please complete the verification code input.');
      return;
    }

    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    const isPhone = this.activeTab() === 'Via OTP';
    const identifier = (isPhone ? this.form.get('phone')?.value : this.form.get('email')?.value) || '';

    this.auth.resetPassword(identifier, isPhone ? 'phone' : 'email', this.otpEntered, this.newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.toastr.success('Password reset successfully! Please login with your new password.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message || 'Failed to reset password. Please check your verification code.');
      }
    });
  }
}
