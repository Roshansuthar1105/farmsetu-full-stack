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
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      
      <!-- Ambient Header Banner -->
      <fs-auth-header tagline="Secure your agricultural account" height="32vh" />

      <!-- Center Content Card -->
      <div class="flex-1 -mt-8 relative z-10 px-4 pb-12">
        <div class="glass-card max-w-md mx-auto p-8 shadow-2xl relative overflow-hidden">
          
          <!-- Top Accent Border -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>

          <!-- Back Button -->
          <a routerLink="/auth/login"
             class="inline-flex items-center gap-1 text-xs font-semibold text-slate-500
                    hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors group">
            <span class="material-icons text-sm group-hover:-translate-x-0.5 transform duration-200">arrow_back</span>
            Back to Login
          </a>

          <!-- Heading -->
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-secondary-500/10 dark:bg-secondary-950/20 rounded-2xl
                        flex items-center justify-center mx-auto mb-4 border border-secondary-500/20">
              <span class="material-icons text-3xl text-secondary-500">lock_reset</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white">
              Reset Password
            </h2>
            <p class="text-xs text-slate-450 dark:text-slate-450 mt-1">Select verification method to recover access</p>
          </div>

          <!-- Tab Selector Swits -->
          <div class="flex bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 mb-6 border border-slate-200/20">
            @for (tab of ['Via OTP', 'Via Email']; track tab) {
              <button (click)="activeTab.set(tab)"
                      class="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-300"
                      [class]="activeTab() === tab
                        ? 'bg-white dark:bg-slate-700 text-primary-700 dark:text-primary-400 shadow-sm border border-slate-100 dark:border-slate-600/50'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'">
                {{ tab }}
              </button>
            }
          </div>

          @switch (step()) {
            @case ('input') {
              <form [formGroup]="form" (ngSubmit)="sendReset()" class="space-y-4">
                @if (activeTab() === 'Via OTP') {
                  <div>
                    <label class="fs-label">Mobile Number</label>
                    <div class="relative">
                      <span class="material-icons text-slate-450 absolute left-3.5 top-3.5 text-lg">phone</span>
                      <input formControlName="phone" placeholder="Enter mobile number"
                             class="fs-input pl-11" />
                    </div>
                  </div>
                } @else {
                  <div>
                    <label class="fs-label">Email Address</label>
                    <div class="relative">
                      <span class="material-icons text-slate-450 absolute left-3.5 top-3.5 text-lg">mail</span>
                      <input formControlName="email" placeholder="Enter email address"
                             class="fs-input pl-11" />
                    </div>
                  </div>
                }

                <button type="submit"
                        class="fs-btn-primary w-full py-3.5 shadow-lg shadow-primary-650/20">
                  <span class="material-icons text-lg">send</span>
                  Send OTP Code
                </button>
              </form>
            }

            @case ('otp') {
              <div class="space-y-6">
                <p class="text-center text-xs text-slate-550 dark:text-slate-400 font-medium">
                  Enter the 6-digit verification code sent to your {{ activeTab() === 'Via OTP' ? 'phone' : 'email' }}
                </p>
                <div class="flex justify-center py-2">
                  <fs-otp-input [length]="6" (otpComplete)="onOtpVerified($event)" />
                </div>

                <!-- New Password Fields -->
                <div class="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                  <div>
                    <label class="fs-label">New Password</label>
                    <div class="relative">
                      <span class="material-icons text-slate-450 absolute left-3.5 top-3.5 text-lg">lock</span>
                      <input type="password" placeholder="••••••••"
                             class="fs-input pl-11"
                             [(ngModel)]="newPassword" />
                    </div>
                  </div>
                  <div>
                    <label class="fs-label">Confirm Password</label>
                    <div class="relative">
                      <span class="material-icons text-slate-450 absolute left-3.5 top-3.5 text-lg">lock_clock</span>
                      <input type="password" placeholder="••••••••"
                             class="fs-input pl-11"
                             [(ngModel)]="confirmNewPassword" />
                    </div>
                  </div>
                </div>

                <button (click)="resetPassword()"
                        class="fs-btn-primary w-full py-3.5 shadow-lg shadow-primary-650/20">
                  <span class="material-icons text-lg">lock_open</span>
                  Reset Password
                </button>
              </div>
            }
          }

        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);

  readonly activeTab = signal('Via OTP');
  readonly step = signal<'input' | 'otp'>('input');

  newPassword = '';
  confirmNewPassword = '';

  readonly form = this.fb.nonNullable.group({
    phone: [''],
    email: ['']
  });

  sendReset(): void {
    this.step.set('otp');
  }

  onOtpVerified(otp: string): void {
    console.log('OTP Verified:', otp);
  }

  resetPassword(): void {
    console.log('Reset Password:', this.newPassword, this.confirmNewPassword);
  }
}