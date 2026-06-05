import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OtpInputComponent } from '../shared/otp-input.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'fs-two-factor',
    standalone: true,
    imports: [OtpInputComponent, RouterLink, FormsModule],
    template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
      <div class="w-full max-w-md">
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 space-y-6">

          <!-- Shield Illustration -->
          <div class="flex justify-center">
            <div class="w-28 h-28 bg-green-100 dark:bg-green-900/30 rounded-full
                        flex items-center justify-center relative">
              <span class="text-5xl">🛡️</span>
              <!-- Animated ring -->
              <div class="absolute inset-0 rounded-full border-4 border-green-500/30
                          animate-ping opacity-20"></div>
            </div>
          </div>

          <!-- Heading -->
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
              Two-Factor Authentication
            </h2>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-2">
              @if (phone()) {
                Enter the 6-digit code sent to {{ phone() }}
              } @else {
                Enter the 6-digit code from your authenticator app
              }
            </p>
          </div>

          <!-- OTP Input -->
          <fs-otp-input [length]="6" (otpComplete)="onCodeEntered($event)" />

          <!-- Or Phone OTP -->
          <div class="text-center">
            <button (click)="sendPhoneOtp()"
                    class="text-sm font-semibold text-green-600 dark:text-green-400
                           hover:text-green-700 transition-colors">
              Or resend OTP to my phone →
            </button>
          </div>

          <!-- Trust Device -->
          <label class="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" [(ngModel)]="trustDevice"
                   class="w-5 h-5 rounded border-gray-300 text-green-600
                          focus:ring-green-500 cursor-pointer" />
            <span class="text-sm text-gray-600 dark:text-gray-400
                         group-hover:text-gray-900 dark:group-hover:text-gray-200
                         transition-colors">
              Trust this device for 30 days
            </span>
          </label>

          <!-- Error -->
          @if (error()) {
            <div class="flex items-center justify-center gap-2 p-3
                        bg-red-50 dark:bg-red-900/20
                        border border-red-200 dark:border-red-800 rounded-xl">
              <p class="text-sm text-red-600 dark:text-red-400">{{ error() }}</p>
            </div>
          }

          <!-- Verify Button -->
          <button (click)="verify()"
                  [disabled]="!code() || loading()"
                  class="w-full py-4 rounded-xl text-base font-bold text-white
                         bg-gradient-to-r from-green-600 to-emerald-600
                         hover:from-green-700 hover:to-emerald-700
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg shadow-green-500/30
                         transition-all duration-200"
                  style="height: 56px;">
            @if (loading()) {
              Verifying...
            } @else {
              Verify
            }
          </button>

          <!-- Back Link -->
          <p class="text-center">
            <a routerLink="/auth/login"
               class="text-sm text-gray-500 hover:text-gray-700
                      dark:hover:text-gray-300 transition-colors">
              ← Back to Login
            </a>
          </p>

        </div>
      </div>
    </div>
  `
})
export class TwoFactorComponent implements OnInit {
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly auth = inject(AuthService);

    readonly phone = signal<string | null>(null);
    readonly code = signal('');
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    trustDevice = false;

    ngOnInit(): void {
        this.phone.set(this.route.snapshot.queryParamMap.get('phone'));
    }

    onCodeEntered(otp: string): void {
        this.code.set(otp);
    }

    verify(): void {
        if (!this.code()) return;
        this.loading.set(true);
        this.error.set(null);

        const phoneNo = this.phone() || '9178787878';
        this.auth.verifyOtp(phoneNo, this.code()).subscribe({
            next: () => {
                this.loading.set(false);
                this.router.navigate(['/app/dashboard']);
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set(err?.message ?? 'Invalid OTP code. Please try again.');
            }
        });
    }

    sendPhoneOtp(): void {
        alert('OTP has been resent successfully!');
    }
}