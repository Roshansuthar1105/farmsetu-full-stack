import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';

@Component({
  selector: 'fs-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-green-50 dark:bg-gray-900">
      <form class="fs-card w-full max-w-md space-y-4" [formGroup]="form" (ngSubmit)="submit()">
        <h2 class="text-2xl font-bold text-center text-primary">FarmSetu Login</h2>
        <div>
          <label class="text-sm font-medium">Email or Phone</label>
          <input formControlName="identifier" class="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-700" />
        </div>
        <div>
          <label class="text-sm font-medium">Password</label>
          <input type="password" formControlName="password" class="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-700" />
        </div>
        @if (error()) {
          <p class="text-sm text-red-600">{{ error() }}</p>
        }
        <button type="submit" class="w-full fs-btn-primary" [disabled]="form.invalid || loading()">
          {{ loading() ? 'Signing in...' : 'Login' }}
        </button>
        <p class="text-center text-sm">
          New farmer?
          <a routerLink="/auth/register" class="text-primary font-medium">Register</a>
        </p>
      </form>
    </div>
  `
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    const { identifier, password } = this.form.getRawValue();
    this.store.dispatch(AuthActions.login({ identifier, password, rememberMe: false }));
    this.loading.set(false);
  }
}
