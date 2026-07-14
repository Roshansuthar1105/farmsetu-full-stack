import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';
import * as AuthActions from '../../../store/auth/auth.actions';
import { AuthLayoutComponent } from '../shared/auth-layout.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fs-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  template: `
    <fs-auth-layout>
      <!-- Form Heading -->
      <div class="text-center space-y-2 mb-4">
        <div class="flex justify-center mb-3">
          <div class="w-12 h-12 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 flex items-center justify-center">
            <span class="material-icons text-2xl text-green-600 dark:text-green-400">login</span>
          </div>
        </div>
        <h2 class="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Welcome Back
        </h2>
        <p class="text-xs text-gray-400">
          Sign in to access your FarmSetu dashboard
        </p>
      </div>

      <!-- Tab switcher: Password | Magic Link -->
      <div class="flex rounded-xl bg-gray-100 dark:bg-gray-900 p-1 gap-1 mb-4">
        <button type="button"
                (click)="activeTab.set('password')"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200"
                [class]="activeTab() === 'password'
                  ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 shadow-sm border border-gray-200/80 dark:border-gray-700'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'">
          <span class="material-icons text-sm">lock</span>
          Password
        </button>
        <button type="button"
                (click)="activeTab.set('magic')"
                class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200"
                [class]="activeTab() === 'magic'
                  ? 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 shadow-sm border border-gray-200/80 dark:border-gray-700'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'">
          <span class="material-icons text-sm">auto_awesome</span>
          Magic Link
        </button>
      </div>

      <!-- ═══ Password Login Form ═══ -->
      @if (activeTab() === 'password') {
        <form [formGroup]="passwordForm" (ngSubmit)="submitPassword()" class="space-y-4">
          <!-- Phone/Email -->
          <div>
            <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Mobile Number or Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span class="material-icons text-base text-gray-400">person_outline</span>
              </div>
              <input formControlName="identifier"
                     placeholder="Enter mobile or email"
                     class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl
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
                <span class="material-icons text-base text-gray-400">lock_outline</span>
              </div>
              <input [type]="showPassword() ? 'text' : 'password'"
                     formControlName="password"
                     placeholder="Enter password"
                     class="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl
                            border border-gray-300 dark:border-gray-700
                            bg-gray-50/50 dark:bg-gray-900
                            text-gray-900 dark:text-white placeholder-gray-400
                            focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                            transition-all duration-200 outline-none" />
              <button type="button"
                      (click)="showPassword.set(!showPassword())"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-700 transition-colors">
                <span class="material-icons text-base">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
              </button>
            </div>
          </div>

          <!-- Remember Me + Forgot Password row -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer group select-none">
              <div class="relative">
                <input type="checkbox" formControlName="rememberMe"
                       class="sr-only peer" id="rememberMe" />
                <div class="w-9 h-5 bg-gray-200 dark:bg-gray-700 rounded-full peer
                            peer-checked:bg-green-500
                            transition-colors duration-200 cursor-pointer"></div>
                <div class="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                            transition-transform duration-200
                            peer-checked:translate-x-4"></div>
              </div>
              <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                Remember me
              </span>
            </label>
            <a routerLink="/auth/forgot-password"
               class="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
              Forgot Password?
            </a>
          </div>

          <!-- Error -->
          @if (error()) {
            <div class="flex items-center gap-2.5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs">
              <span class="material-icons text-base shrink-0">error_outline</span>
              <p>{{ error() }}</p>
            </div>
          }

          <!-- Submit -->
          <button type="submit"
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
              <span>Signing in...</span>
            } @else {
              <span class="material-icons text-base">login</span>
              <span>Sign In</span>
            }
          </button>
        </form>
      }

      <!-- ═══ Magic Link Form ═══ -->
      @if (activeTab() === 'magic') {
        <div class="space-y-5">
          @if (!magicLinkSent()) {
            <div class="flex items-start gap-3 p-3.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl">
              <span class="material-icons text-blue-500 dark:text-blue-400 text-xl mt-0.5 shrink-0">info</span>
              <p class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Enter your registered email. We'll send you a one-click login link — no password needed.
              </p>
            </div>

            <form [formGroup]="magicForm" (ngSubmit)="submitMagicLink()" class="space-y-5">
              <div>
                <label class="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <span class="material-icons text-base text-gray-400">mail_outline</span>
                  </div>
                  <input formControlName="email"
                         type="email"
                         placeholder="Enter your registered email"
                         class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl
                                border border-gray-300 dark:border-gray-700
                                bg-gray-50/50 dark:bg-gray-900
                                text-gray-900 dark:text-white placeholder-gray-400
                                focus:border-green-500 focus:ring-4 focus:ring-green-500/10
                                transition-all duration-200 outline-none" />
                </div>
              </div>

              @if (magicError()) {
                <div class="flex items-center gap-2.5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs">
                  <span class="material-icons text-base shrink-0">error_outline</span>
                  <p>{{ magicError() }}</p>
                </div>
              }

              <button type="submit"
                      class="relative w-full rounded-xl text-sm font-bold text-white
                             bg-blue-600 hover:bg-blue-500 active:bg-blue-700
                             border border-blue-500/50 hover:border-blue-400
                             shadow-[0_1px_2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)]
                             transition-all duration-200 ease-in-out
                             flex items-center justify-center gap-2"
                      style="height: 44px;">
                @if (magicLoading()) {
                  <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>Sending...</span>
                } @else {
                  <span class="material-icons text-base">send</span>
                  <span>Send Magic Link</span>
                }
              </button>
            </form>
          } @else {
            <!-- Success state -->
            <div class="text-center space-y-5 py-4">
              <div class="flex justify-center">
                <div class="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 flex items-center justify-center">
                  <span class="material-icons text-3xl text-green-500">mark_email_read</span>
                </div>
              </div>
              <div class="space-y-1">
                <h3 class="font-bold text-gray-900 dark:text-white">Check your inbox!</h3>
                <p class="text-xs text-gray-400 leading-relaxed">
                  We sent a login link to <span class="font-bold text-gray-600 dark:text-gray-300">{{ magicForm.get('email')?.value }}</span>. It expires in 15 minutes.
                </p>
              </div>
              <button type="button"
                      (click)="magicLinkSent.set(false)"
                      class="text-xs font-bold text-green-600 dark:text-green-400 hover:underline">
                Use a different email
              </button>
            </div>
          }
        </div>
      }

      <!-- Footer Links -->
      <div class="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
        <p class="text-center text-xs text-gray-500 dark:text-gray-400">
          New farmer?
          <a routerLink="/auth/register"
             class="font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors">
            Create account
          </a>
        </p>
        <p class="text-center text-xs text-gray-500 dark:text-gray-400">
          Just want to explore?
          <a routerLink="/app/dashboard"
             class="font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors">
            Browse as Guest
          </a>
        </p>
      </div>
    </fs-auth-layout>
  `
})
export class LoginComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly route = inject(ActivatedRoute);
  private readonly toastr = inject(ToastrService);

  readonly activeTab = signal<'password' | 'magic'>('password');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);
  readonly magicLoading = signal(false);
  readonly magicError = signal<string | null>(null);
  readonly magicLinkSent = signal(false);

  private subs = new Subscription();

  readonly passwordForm = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false]
  });

  readonly magicForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit(): void {
    // Show expired session error
    this.subs.add(
      this.route.queryParams.subscribe(params => {
        if (params['expired'] === 'true') {
          this.error.set('Your session has expired. Please log in again.');
        }
      })
    );

    // Stop password login loader on success or failure
    this.subs.add(
      this.actions$.pipe(ofType(AuthActions.loginSuccess)).subscribe(() => {
        this.loading.set(false);
      })
    );
    this.subs.add(
      this.actions$.pipe(ofType(AuthActions.loginFailure)).subscribe(({ error }) => {
        this.loading.set(false);
        this.error.set(error);
      })
    );

    // Stop magic link loader on result
    this.subs.add(
      this.actions$.pipe(ofType(AuthActions.sendMagicLinkSuccess)).subscribe(() => {
        this.magicLoading.set(false);
        this.magicLinkSent.set(true);
      })
    );
    this.subs.add(
      this.actions$.pipe(ofType(AuthActions.sendMagicLinkFailure)).subscribe(({ error }) => {
        this.magicLoading.set(false);
        this.magicError.set(error);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.toastr.error('Please enter a valid mobile number/email and password.');
      return;
    }
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(null);
    const { identifier, password, rememberMe } = this.passwordForm.getRawValue();
    this.store.dispatch(AuthActions.login({ identifier, password, rememberMe }));
  }

  submitMagicLink(): void {
    if (this.magicForm.invalid) {
      this.magicForm.markAllAsTouched();
      this.toastr.error('Please enter a valid email address.');
      return;
    }
    if (this.magicLoading()) return;
    this.magicLoading.set(true);
    this.magicError.set(null);
    const { email } = this.magicForm.getRawValue();
    this.store.dispatch(AuthActions.sendMagicLink({ email }));
  }
}