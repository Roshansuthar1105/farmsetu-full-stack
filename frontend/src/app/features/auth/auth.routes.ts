import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    title: 'Sign Up',
    loadComponent: () =>
      import('./register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    title: 'Forgot Password',
    loadComponent: () =>
      import('./forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: '2fa',
    title: 'Two-Factor Authentication',
    loadComponent: () =>
      import('./two-factor/two-factor.component').then(m => m.TwoFactorComponent)
  },
  {
    path: 'magic-link',
    title: 'Magic Link',
    loadComponent: () =>
      import('./magic-link/magic-link-verify.component').then(m => m.MagicLinkVerifyComponent)
  }
];
