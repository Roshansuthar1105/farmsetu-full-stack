import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../../store/auth/auth.actions';
import { AuthHeaderComponent } from '../shared/auth-header.component';
import { SocialLoginComponent } from '../shared/social-login.component';

@Component({
    selector: 'fs-login',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, AuthHeaderComponent, SocialLoginComponent],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <!-- Top Section: Ambient Animated Header -->
      <fs-auth-header tagline="Empowering Agriculture through Technology" height="38vh" />

      <!-- Language Toggle Button -->
      <button class="absolute top-6 right-6 z-25 w-10 h-10 rounded-xl
                     bg-white/10 dark:bg-slate-900/40 backdrop-blur-md flex items-center justify-center
                     text-white hover:bg-white/20 hover:scale-105 border border-white/20 transition-all duration-300"
              (click)="toggleLanguage()">
        <span class="material-icons text-xl">translate</span>
      </button>

      <!-- Bottom/Center Section: Glassmorphic Login Card -->
      <div class="flex-1 -mt-10 relative z-10 px-4 pb-12">
        <div class="glass-card max-w-md mx-auto p-8 shadow-2xl relative overflow-hidden">
          
          <!-- Accent Line -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>

          <!-- Heading -->
          <div class="text-center mb-8">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-white">
              Welcome Back <span class="inline-block animate-bounce">🌾</span>
            </h2>
            <p class="text-xs text-slate-400 dark:text-slate-500 mt-1.5">Enter details to manage your digital farm</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-5">

            <!-- Phone/Email Field -->
            <div>
              <label class="fs-label">Mobile Number or Email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <span class="material-icons text-lg">person</span>
                </div>
                <input formControlName="identifier"
                       type="text"
                       placeholder="Enter mobile or email"
                       class="fs-input pl-11" />
              </div>
            </div>

            <!-- Password Field -->
            <div>
              <div class="flex justify-between items-center mb-1.5">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <a routerLink="/auth/forgot-password"
                   class="text-xs font-semibold text-secondary-600 dark:text-secondary-400
                          hover:text-secondary-700 dark:hover:text-secondary-300 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                  <span class="material-icons text-lg">lock</span>
                </div>
                <input [type]="showPassword() ? 'text' : 'password'"
                       formControlName="password"
                       placeholder="••••••••"
                       class="fs-input pl-11 pr-11" />
                <button type="button"
                        (click)="showPassword.set(!showPassword())"
                        class="absolute inset-y-0 right-0 pr-3.5 flex items-center
                               text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <span class="material-icons text-lg">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <!-- Error Message -->
            @if (error()) {
              <div class="flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/20
                          border border-red-200/50 dark:border-red-900/35 rounded-xl animate-fade-in-up">
                <span class="material-icons text-red-500 text-lg shrink-0">error</span>
                <p class="text-xs text-red-650 dark:text-red-400 font-medium leading-normal">{{ error() }}</p>
              </div>
            }

            <!-- Login Button -->
            <button type="submit"
                    [disabled]="form.invalid || loading()"
                    class="fs-btn-primary w-full py-3.5 shadow-lg shadow-primary-650/20 disabled:opacity-50 disabled:cursor-not-allowed">
              @if (loading()) {
                <svg class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Signing in...</span>
              } @else {
                <span>Sign In / Login</span>
              }
            </button>

            <!-- Social Login Wrapper -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <fs-social-login
                (google)="onGoogleLogin()"
                (facebook)="onFacebookLogin()"
                (otpLogin)="onOtpLogin()" />
            </div>

            <!-- Register Link -->
            <p class="text-center text-xs text-slate-500 dark:text-slate-400 pt-3">
              New farmer?
              <a routerLink="/auth/register"
                 class="font-semibold text-primary-600 dark:text-primary-400
                        hover:text-primary-755 dark:hover:text-primary-300 hover:underline transition-all">
                Register here &rarr;
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
        // Loading will be reset by store effect on success/failure
    }

    onGoogleLogin(): void {
        // this.store.dispatch(AuthActions.googleLogin());
    }

    onFacebookLogin(): void {
        // Facebook login
    }

    onOtpLogin(): void {
        // Navigate to OTP login flow
    }

    toggleLanguage(): void {
        // Language switch logic
    }
}