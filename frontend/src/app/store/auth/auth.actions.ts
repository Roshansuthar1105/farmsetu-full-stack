import { createAction, props } from '@ngrx/store';
import { User } from '../../core/models/user.model';

export const login = createAction('[Auth] Login', props<{ identifier: string; password: string; rememberMe: boolean }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ user: User; rememberMe: boolean }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());
export const logout = createAction('[Auth] Logout');

export const sendMagicLink = createAction('[Auth] Send Magic Link', props<{ email: string }>());
export const sendMagicLinkSuccess = createAction('[Auth] Send Magic Link Success');
export const sendMagicLinkFailure = createAction('[Auth] Send Magic Link Failure', props<{ error: string }>());

export const verifyMagicLink = createAction('[Auth] Verify Magic Link', props<{ token: string }>());
export const verifyMagicLinkSuccess = createAction('[Auth] Verify Magic Link Success', props<{ user: User }>());
export const verifyMagicLinkFailure = createAction('[Auth] Verify Magic Link Failure', props<{ error: string }>());
