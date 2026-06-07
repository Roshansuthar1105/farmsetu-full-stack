import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OtpInputComponent } from '../shared/otp-input.component';
import { AuthHeaderComponent } from '../shared/auth-header.component';

@Component({
  selector: 'fs-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, OtpInputComponent, AuthHeaderComponent, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">

      <fs-auth-header tagline="Reset your password" height="25vh" />

      <div class="flex-1 -mt-6 relative z-10">
        <div class="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl min-h-full px-6 pt-8 pb-6">
          <div class="max-w-md mx-auto">

            <!-- Back Button -->
            <a routerLink="/auth/login"
               class="inline-flex items-center gap-1 text-sm text-gray-500
                      hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
              </svg>
              Back to Login
            </a>

            <!-- Illustration -->
            <div class="flex justify-center mb-6">
              <div class="w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full
                          flex items-center justify-center">
                <span class="text-5xl">🔐</span>
              </div>
            </div>

            <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Reset Password
            </h2>

            <!-- Tab Switch -->
            <div class="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6">
              @for (tab of ['Via OTP', 'Via Email']; track tab) {
                <button (click)="activeTab.set(tab)"
                        class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                        [class]="activeTab() === tab
                          ? 'bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'">
                  {{ tab }}
                </button>
              }
            </div>

            @switch (step()) {
              @case ('input') {
                <form [formGroup]="form" (ngSubmit)="sendReset()" class="space-y-4">
                  @if (activeTab() === 'Via OTP') {
                    <input formControlName="phone" placeholder="Enter Mobile Number"
                           class="w-full px-4 py-4 text-base rounded-xl
                                  border-2 border-gray-200 dark:border-gray-600
                                  bg-gray-50 dark:bg-gray-700
                                  text-gray-900 dark:text-white placeholder-gray-400
                                  focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20
                                  transition-all duration-200 outline-none" />
                  } @else {
                    <input formControlName="email" placeholder="Enter Email Address"
                           class="w-full px-4 py-4 text-base rounded-xl
                                  border-2 border-gray-200 dark:border-gray-600
                                  bg-gray-50 dark:bg-gray-700
                                  text-gray-900 dark:text-white placeholder-gray-400
                                  focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20
                                  transition-all duration-200 outline-none" />
                  }

                  <button type="submit"
                          class="w-full py-4 rounded-xl text-base font-bold text-white
                                 bg-gradient-to-r from-amber-500 to-amber-600
                                 hover:from-amber-600 hover:to-amber-700
                                 shadow-lg shadow-amber-500/30
                                 transition-all duration-200"
                          style="height: 56px;">
                    Send OTP
                  </button>
                </form>
              }

              @case ('otp') {
                <div class="space-y-6">
                  <p class="text-center text-sm text-gray-500">
                    Enter the 6-digit code sent to your {{ activeTab() === 'Via OTP' ? 'phone' : 'email' }}
                  </p>
                  <fs-otp-input [length]="6" (otpComplete)="onOtpVerified($event)" />

                  <!-- New Password Fields -->
                  <div class="space-y-3">
                    <input type="password" placeholder="New Password"
                           class="w-full px-4 py-4 text-base rounded-xl
                                  border-2 border-gray-200 dark:border-gray-600
                                  bg-gray-50 dark:bg-gray-700
                                  text-gray-900 dark:text-white placeholder-gray-400
                                  focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                                  transition-all duration-200 outline-none"
                           [(ngModel)]="newPassword" />
                    <input type="password" placeholder="Confirm New Password"
                           class="w-full px-4 py-4 text-base rounded-xl
                                  border-2 border-gray-200 dark:border-gray-600
                                  bg-gray-50 dark:bg-gray-700
                                  text-gray-900 dark:text-white placeholder-gray-400
                                  focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                                  transition-all duration-200 outline-none"
                           [(ngModel)]="confirmNewPassword" />
                  </div>

                  <button (click)="resetPassword()"
                          class="w-full py-4 rounded-xl text-base font-bold text-white
                                 bg-gradient-to-r from-green-600 to-emerald-600
                                 shadow-lg shadow-green-500/30
                                 transition-all duration-200"
                          style="height: 56px;">
                    Reset Password
                  </button>
                </div>
              }
            }

          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);

  readonly activeTab = signal('Via OTP');
  readonly step = signal<'input' | 'otp'>('input');

  readonly form = this.fb.nonNullable.group({
    phone: [''],
    email: ['']
  });

  newPassword = '';
  confirmNewPassword = '';

  sendReset(): void {
    this.step.set('otp');
  }

  onOtpVerified(otp: string): void {
    console.log('OTP:', otp);
  }

  resetPassword(): void {
    console.log('Reset password');
  }
}