import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ identifier, password, rememberMe }) =>
        this.auth.login(identifier, password, rememberMe).pipe(
          map((res) => AuthActions.loginSuccess({ user: res.user, rememberMe })),
          catchError((err) =>
            of(AuthActions.loginFailure({ error: err?.error?.message ?? err?.message ?? 'Login failed. Please try again.' }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.router.navigate(['/app/dashboard']))
      ),
    { dispatch: false }
  );

  sendMagicLink$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.sendMagicLink),
      mergeMap(({ email }) =>
        this.auth.sendMagicLink(email).pipe(
          map(() => AuthActions.sendMagicLinkSuccess()),
          catchError((err) =>
            of(AuthActions.sendMagicLinkFailure({ error: err?.error?.message ?? 'Failed to send magic link.' }))
          )
        )
      )
    )
  );

  verifyMagicLink$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.verifyMagicLink),
      mergeMap(({ token }) =>
        this.auth.verifyMagicLink(token).pipe(
          map((res) => AuthActions.verifyMagicLinkSuccess({ user: res.user })),
          catchError((err) =>
            of(AuthActions.verifyMagicLinkFailure({ error: err?.error?.message ?? 'Invalid or expired magic link.' }))
          )
        )
      )
    )
  );

  verifyMagicLinkSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.verifyMagicLinkSuccess),
        tap(() => this.router.navigate(['/app/dashboard']))
      ),
    { dispatch: false }
  );
}
