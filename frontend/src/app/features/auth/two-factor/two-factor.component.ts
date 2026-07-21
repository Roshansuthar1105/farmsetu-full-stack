import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OtpInputComponent } from '../shared/otp-input.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { AuthLayoutComponent } from '../shared/auth-layout.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fs-two-factor',
  standalone: true,
  imports: [OtpInputComponent, RouterLink, FormsModule, AuthLayoutComponent],
  template: `
    <fs-auth-layout>
      <!-- Back Link -->
      <a routerLink="/auth/login"
         class="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400
                hover:text-gray-700 mb-4 transition-colors">
        <span class="material-icons text-sm">arrow_back</span>
        Back to Login
      </a>

      <!-- Illustration & Header -->
      <div class="text-center space-y-3 mb-6">
        <div class="flex justify-center">
          <div class="w-16 h-16 bg-green-50 dark:bg-green-950/20 rounded-full flex items-center justify-center relative border border-green-100 dark:border-green-900/50">
            <span class="material-icons text-3xl text-green-600 dark:text-green-400">security</span>
            <!-- Animated ping ring -->
            <div class="absolute inset-0 rounded-full border-4 border-green-500/20 animate-ping opacity-75"></div>
          </div>
        </div>
        <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">
          Secure Login (2FA)
        </h2>
        <p class="text-gray-400 text-xs leading-relaxed max-w-xs mx-auto">
          @if (phone()) {
            Enter the 6-digit verification code sent to <span class="font-bold text-gray-700 dark:text-gray-300">{{ phone() }}</span>
          } @else {
            Enter the 6-digit code from your authenticator application
          }
        </p>
      </div>

      <!-- OTP Input -->
      <div class="py-2 flex justify-center">
        <fs-otp-input [length]="6" (otpComplete)="onCodeEntered($event)" />
      </div>

      <!-- Actions/Toggles -->
      <div class="space-y-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div class="text-center">
          <button (click)="sendPhoneOtp()"
                  class="text-xs font-bold text-green-600 dark:text-green-400 hover:text-green-700 transition-colors">
            Or resend verification code to phone →
          </button>
        </div>

        <!-- Trust Device -->
        <label class="flex items-center gap-2.5 cursor-pointer group">
          <input type="checkbox" [(ngModel)]="trustDevice"
                 class="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-green-600
                        focus:ring-green-500 cursor-pointer bg-gray-50 dark:bg-gray-800" />
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors select-none">
            Trust this device for 30 days
          </span>
        </label>
      </div>

      <!-- Error -->
      @if (error()) {
        <div class="flex items-center justify-center gap-2.5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-650 dark:text-red-400 text-xs">
          <span class="material-icons text-base shrink-0">error_outline</span>
          <p>{{ error() }}</p>
        </div>
      }

      <!-- Verify Button -->
      <button (click)="verify()"
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
          <span>Verifying...</span>
        } @else {
          <span>Verify</span>
        }
      </button>
    </fs-auth-layout>
  `
})
export class TwoFactorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);

  readonly phone = signal<string | null>(null);
  readonly email = signal<string | null>(null);
  readonly code = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  trustDevice = false;

  ngOnInit(): void {
    this.phone.set(this.route.snapshot.queryParamMap.get('phone'));
    this.email.set(this.route.snapshot.queryParamMap.get('email'));
  }

  onCodeEntered(otp: string): void {
    this.code.set(otp);
  }

  verify(): void {
    if (!this.code()) {
      this.toastr.error('Please enter the 6-digit verification code.');
      return;
    }
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);

    const identifier = this.email() || this.phone() || '';
    this.auth.verifyOtp(identifier, this.code()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? err?.message ?? 'Invalid OTP code. Please try again.');
      }
    });
  }

  sendPhoneOtp(): void {
    const identifier = this.email() || this.phone() || '';
    if (!identifier) {
      this.toastr.error('No email or phone available to send OTP.');
      return;
    }
    this.auth.sendOtp(identifier).subscribe({
      next: () => this.toastr.success('OTP has been resent to your email!'),
      error: () => this.toastr.error('Failed to resend OTP. Please try again.')
    });
  }
}
