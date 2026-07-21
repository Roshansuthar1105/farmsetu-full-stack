import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthResponse, User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal(false);

  /** Key used to store session — localStorage (remember me) or sessionStorage (session only) */
  private readonly TOKEN_KEY = 'fs_access_token';
  private readonly REFRESH_KEY = 'fs_refresh_token';
  private readonly USER_KEY = 'fs_user';
  private readonly REMEMBER_KEY = 'fs_remember_me';

  constructor() {
    this.loadSession();
  }

  register(payload: Record<string, unknown>) {
    return this.api.post<AuthResponse>('/api/auth/register', payload).pipe(
      tap((res) => this.setSession(res, true))
    );
  }

  /** Login with optional remember-me — uses localStorage if rememberMe, sessionStorage otherwise */
  login(identifier: string, password: string, rememberMe = false): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/api/auth/login', { identifier, password }).pipe(
      tap((res) => this.setSession(res, rememberMe))
    );
  }

  sendMagicLink(email: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/api/auth/magic-link/send', { email });
  }

  verifyMagicLink(token: string): Observable<AuthResponse> {
    return this.api.get<AuthResponse>('/api/auth/magic-link/verify', { token }).pipe(
      tap((res) => this.setSession(res, true)) // magic link = persistent session
    );
  }

  sendOtp(email: string) {
    return this.api.post<{ message: string }>('/api/auth/send-otp', { email });
  }

  verifyOtp(email: string, otp: string) {
    return this.api.post<any>('/api/auth/verify-otp', { email, otp }).pipe(
      tap((res) => {
        if (res && res.accessToken) {
          this.setSession(res, false);
        }
      })
    );
  }

  me() {
    return this.api.get<User>('/api/auth/me').pipe(
      tap((user) => {
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      })
    );
  }

  forgotPassword(identifier: string, type: 'phone' | 'email') {
    const payload = type === 'phone' ? { phone: identifier } : { email: identifier };
    return this.api.post<any>('/api/auth/forgot-password', payload);
  }

  resetPassword(identifier: string, type: 'phone' | 'email', otp: string, password: string) {
    const payload = type === 'phone'
      ? { phone: identifier, otp, password }
      : { email: identifier, otp, password };
    return this.api.post<any>('/api/auth/reset-password', payload);
  }

  /** Send OTP specifically for registration verification */
  sendRegistrationOtp(email: string) {
    return this.sendOtp(email);
  }

  logout(expired = false): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REMEMBER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_KEY);
    sessionStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    setTimeout(() => {
      if (expired) {
        this.router.navigate(['/auth/login'], { queryParams: { expired: 'true' } });
      } else {
        this.router.navigate(['/auth/login']);
      }
    });
  }

  isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payloadDecoded = atob(parts[1]);
      const payload = JSON.parse(payloadDecoded);
      if (!payload.exp) return false;
      return Date.now() > (payload.exp * 1000);
    } catch (e) {
      return true;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) ?? sessionStorage.getItem(this.TOKEN_KEY);
  }

  updateCurrentUser(user: User): void {
    const storage = localStorage.getItem(this.REMEMBER_KEY) === 'true' ? localStorage : sessionStorage;
    storage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  private setSession(res: AuthResponse, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, res.accessToken);
    storage.setItem(this.REFRESH_KEY, res.refreshToken);
    storage.setItem(this.USER_KEY, JSON.stringify(res.user));
    if (rememberMe) {
      localStorage.setItem(this.REMEMBER_KEY, 'true');
    }
    this.currentUser.set(res.user);
    this.isAuthenticated.set(true);
  }

  private loadSession(): void {
    const token = this.getAccessToken();
    const userRaw = localStorage.getItem(this.USER_KEY) ?? sessionStorage.getItem(this.USER_KEY);
    if (token && userRaw) {
      if (this.isTokenExpired(token)) {
        this.logout(true);
      } else {
        this.currentUser.set(JSON.parse(userRaw) as User);
        this.isAuthenticated.set(true);
      }
    }
  }
}
