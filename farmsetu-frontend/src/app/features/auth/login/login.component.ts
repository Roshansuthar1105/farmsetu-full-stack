import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../store/auth/auth.actions';
import { AuthHeaderComponent } from '../shared/auth-header.component';
import { SocialLoginComponent } from '../shared/social-login.component';

@Component({
    selector: 'fs-login',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, AuthHeaderComponent, SocialLoginComponent],
    template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <!-- Top Section: Green Header -->
      <fs-auth-header tagline="Kheti ki nayi duniya" height="38vh" />

      <!-- Language Switcher -->
      <button class="absolute top-4 right-4 z-20 w-10 h-10 rounded-full
                     bg-white/20 backdrop-blur-sm flex items-center justify-center
                     text-white hover:bg-white/30 transition-all"
              (click)="toggleLanguage()">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/>
        </svg>
      </button>

      <!-- Bottom Section: Login Card -->
      <div class="flex-1 -mt-8 relative z-10">
        <div class="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl min-h-full px-6 pt-8 pb-6">

          <!-- Heading -->
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Welcome Back 🌾
          </h2>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5 max-w-md mx-auto">

            <!-- Phone/Email Field -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                     viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                        d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"/>
                </svg>
              </div>
              <input formControlName="identifier"
                     placeholder="Mobile Number or Email"
                     class="w-full pl-12 pr-4 py-4 text-base rounded-xl
                            border-2 border-gray-200 dark:border-gray-600
                            bg-gray-50 dark:bg-gray-700
                            text-gray-900 dark:text-white
                            placeholder-gray-400
                            focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                            focus:bg-white dark:focus:bg-gray-600
                            transition-all duration-200 outline-none" />
            </div>

            <!-- Password Field -->
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
                            text-gray-900 dark:text-white
                            placeholder-gray-400
                            focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                            focus:bg-white dark:focus:bg-gray-600
                            transition-all duration-200 outline-none" />
              <button type="button"
                      (click)="showPassword.set(!showPassword())"
                      class="absolute inset-y-0 right-0 pr-4 flex items-center
                             text-gray-400 hover:text-gray-600 transition-colors">
                @if (showPassword()) {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                } @else {
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                }
              </button>
            </div>

            <!-- Forgot Password -->
            <div class="flex justify-end">
              <a routerLink="/auth/forgot-password"
                 class="text-sm font-semibold text-amber-600 dark:text-amber-400
                        hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
                Forgot Password?
              </a>
            </div>

            <!-- Error Message -->
            @if (error()) {
              <div class="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20
                          border border-red-200 dark:border-red-800 rounded-xl">
                <svg class="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd"/>
                </svg>
                <p class="text-sm text-red-600 dark:text-red-400">{{ error() }}</p>
              </div>
            }

            <!-- Login Button -->
            <button type="submit"
                    [disabled]="form.invalid || loading()"
                    class="w-full py-4 rounded-xl text-base font-bold text-white
                           bg-gradient-to-r from-green-600 to-emerald-600
                           hover:from-green-700 hover:to-emerald-700
                           active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                           shadow-lg shadow-green-500/30
                           transition-all duration-200
                           flex items-center justify-center gap-2"
                    style="height: 56px;">
              @if (loading()) {
                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Signing in...</span>
              } @else {
                <span>Login करें / Login</span>
              }
            </button>

            <!-- Social Login -->
            <fs-social-login
              (google)="onGoogleLogin()"
              (facebook)="onFacebookLogin()"
              (otpLogin)="onOtpLogin()" />

            <!-- Register Link -->
            <p class="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
              New farmer?
              <a routerLink="/auth/register"
                 class="font-semibold text-green-600 dark:text-green-400
                        hover:text-green-700 dark:hover:text-green-300 transition-colors">
                Register here →
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly store = inject(Store);
    private readonly router = inject(Router);

    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly showPassword = signal(false);

    readonly form = this.fb.nonNullable.group({
        identifier: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]]
    });

    submit(): void {
        if (this.form.invalid) return;
        this.loading.set(true);
        this.error.set(null);
        const { identifier, password } = this.form.getRawValue();
        this.store.dispatch(AuthActions.login({ identifier, password }));
    }

    onGoogleLogin(): void {
    }

    onFacebookLogin(): void {
    }

    onOtpLogin(): void {
        const phone = prompt('Enter your phone number for OTP verification:');
        if (phone) {
            this.router.navigate(['/auth/2fa'], { queryParams: { phone } });
        }
    }

    toggleLanguage(): void {
    }
}