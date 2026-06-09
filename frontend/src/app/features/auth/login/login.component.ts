import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../store/auth/auth.actions';
import { AuthLayoutComponent } from '../shared/auth-layout.component';
import { SocialLoginComponent } from '../shared/social-login.component';

@Component({
  selector: 'fs-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent, SocialLoginComponent],
  template: `
    <fs-auth-layout>
      <!-- Form Heading -->
      <div class="text-center space-y-2 mb-8">
        <h2 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Welcome Back 🌾
        </h2>
        <p class="text-xs text-gray-400">
          Sign in to access your FarmSetu dashboard
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">
        <!-- Phone/Email Field -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Mobile Number or Email</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span class="material-icons text-base text-gray-400">person</span>
            </div>
            <input formControlName="identifier"
                   placeholder="Enter mobile or email"
                   class="w-full pl-10 pr-4 py-3.5 text-sm rounded-xl
                          border border-gray-300 dark:border-gray-700
                          bg-gray-50/50 dark:bg-gray-900
                          text-gray-900 dark:text-white
                          placeholder-gray-400
                          focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                          transition-all duration-200 outline-none" />
          </div>
        </div>

        <!-- Password Field -->
        <div>
          <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Password</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span class="material-icons text-base text-gray-400">lock</span>
            </div>
            <input [type]="showPassword() ? 'text' : 'password'"
                   formControlName="password"
                   placeholder="Enter password"
                   class="w-full pl-10 pr-10 py-3.5 text-sm rounded-xl
                          border border-gray-300 dark:border-gray-700
                          bg-gray-50/50 dark:bg-gray-900
                          text-gray-900 dark:text-white
                          placeholder-gray-400
                          focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                          transition-all duration-200 outline-none" />
            <button type="button"
                    (click)="showPassword.set(!showPassword())"
                    class="absolute inset-y-0 right-0 pr-3 flex items-center
                           text-gray-400 hover:text-gray-700 transition-colors">
              <span class="material-icons text-base">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
            </button>
          </div>
        </div>

        <!-- Forgot Password Link -->
        <div class="flex justify-end pt-1">
          <a routerLink="/auth/forgot-password"
             class="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
            Forgot Password?
          </a>
        </div>

        <!-- Error Message -->
        @if (error()) {
          <div class="flex items-center gap-2.5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs">
            <span class="material-icons text-base shrink-0">error_outline</span>
            <p>{{ error() }}</p>
          </div>
        }

        <!-- Submit Button -->
        <button type="submit"
                [disabled]="form.invalid || loading()"
                class="w-full rounded-xl text-sm font-bold text-white
                       bg-gradient-to-r from-green-600 to-emerald-600
                       hover:from-green-700 hover:to-emerald-700
                       active:scale-[0.98]
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
                       shadow-lg shadow-green-500/10 hover:shadow-green-500/20
                       transition-all duration-200
                       flex items-center justify-center gap-2"
                style="height: 48px;">
          @if (loading()) {
            <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
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
        <p class="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
          New farmer?
          <a routerLink="/auth/register"
             class="font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
            Register here →
          </a>
        </p>
      </form>
    </fs-auth-layout>
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
}