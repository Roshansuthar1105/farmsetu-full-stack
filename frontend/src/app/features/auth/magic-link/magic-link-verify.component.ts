import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subscription } from 'rxjs';
import * as AuthActions from '../../../store/auth/auth.actions';
import { AuthLayoutComponent } from '../shared/auth-layout.component';

@Component({
  selector: 'fs-magic-link-verify',
  standalone: true,
  imports: [AuthLayoutComponent, RouterLink],
  template: `
    <fs-auth-layout>
      <div class="text-center space-y-6 py-4">

        @if (status() === 'loading') {
          <!-- Loading state -->
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center">
              <svg class="animate-spin w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          </div>
          <div class="space-y-1">
            <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">Verifying your link...</h2>
            <p class="text-xs text-gray-400">Please wait while we sign you in securely.</p>
          </div>
        }

        @if (status() === 'success') {
          <!-- Success state -->
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 flex items-center justify-center">
              <span class="material-icons text-3xl text-green-500">verified</span>
            </div>
          </div>
          <div class="space-y-1">
            <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">Login Successful!</h2>
            <p class="text-xs text-gray-400">Redirecting to your dashboard...</p>
          </div>
        }

        @if (status() === 'error') {
          <!-- Error state -->
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 flex items-center justify-center">
              <span class="material-icons text-3xl text-red-500">link_off</span>
            </div>
          </div>
          <div class="space-y-2">
            <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">Link Invalid or Expired</h2>
            <p class="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">{{ errorMessage() }}</p>
          </div>
          <div class="flex flex-col gap-3">
            <a routerLink="/auth/login"
               class="w-full rounded-xl text-sm font-bold text-white
                      bg-gradient-to-r from-green-600 to-emerald-600
                      hover:from-green-700 hover:to-emerald-700
                      shadow-lg shadow-green-500/10
                      transition-all duration-200
                      flex items-center justify-center gap-2"
               style="height: 48px;">
              <span class="material-icons text-base">arrow_back</span>
              Back to Login
            </a>
          </div>
        }

        @if (status() === 'missing') {
          <!-- No token state -->
          <div class="flex justify-center">
            <div class="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center">
              <span class="material-icons text-3xl text-amber-500">help_outline</span>
            </div>
          </div>
          <div class="space-y-2">
            <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">No Token Found</h2>
            <p class="text-xs text-gray-400">This page requires a valid magic link token.</p>
          </div>
          <a routerLink="/auth/login"
             class="inline-flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400 hover:underline">
            <span class="material-icons text-base">arrow_back</span>
            Go to Login
          </a>
        }

      </div>
    </fs-auth-layout>
  `
})
export class MagicLinkVerifyComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);

  readonly status = signal<'loading' | 'success' | 'error' | 'missing'>('loading');
  readonly errorMessage = signal('The magic link has expired or already been used. Please request a new one.');

  private subs = new Subscription();

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status.set('missing');
      return;
    }

    // Subscribe to result before dispatching
    this.subs.add(
      this.actions$.pipe(ofType(AuthActions.verifyMagicLinkSuccess)).subscribe(() => {
        this.status.set('success');
        // Navigation handled by effect
      })
    );

    this.subs.add(
      this.actions$.pipe(ofType(AuthActions.verifyMagicLinkFailure)).subscribe(({ error }) => {
        this.status.set('error');
        this.errorMessage.set(error);
      })
    );

    this.store.dispatch(AuthActions.verifyMagicLink({ token }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
