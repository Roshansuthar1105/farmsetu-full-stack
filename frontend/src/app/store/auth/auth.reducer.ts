import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  magicLinkSent: boolean;
  magicLinkLoading: boolean;
  magicLinkError: string | null;
}

export const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  magicLinkSent: false,
  magicLinkLoading: false,
  magicLinkError: null
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { user }) => ({ ...state, user, loading: false })),
  on(AuthActions.loginFailure, (state, { error }) => ({ ...state, loading: false, error })),
  on(AuthActions.logout, () => initialState),

  on(AuthActions.sendMagicLink, (state) => ({ ...state, magicLinkLoading: true, magicLinkError: null, magicLinkSent: false })),
  on(AuthActions.sendMagicLinkSuccess, (state) => ({ ...state, magicLinkLoading: false, magicLinkSent: true })),
  on(AuthActions.sendMagicLinkFailure, (state, { error }) => ({ ...state, magicLinkLoading: false, magicLinkError: error })),

  on(AuthActions.verifyMagicLink, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.verifyMagicLinkSuccess, (state, { user }) => ({ ...state, user, loading: false })),
  on(AuthActions.verifyMagicLinkFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
