import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthResponse, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal(false);

  constructor() {
    this.loadSession();
  }

  register(payload: Record<string, unknown>) {
    return this.api.post<AuthResponse>('/api/auth/register', payload).pipe(
      tap((res) => this.setSession(res))
    );
  }

  login(identifier: string, password: string) {
    return this.api.post<AuthResponse>('/api/auth/login', { identifier, password }).pipe(
      tap((res) => this.setSession(res))
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

  logout(): void {
    localStorage.removeItem('fs_access_token');
    localStorage.removeItem('fs_refresh_token');
    localStorage.removeItem('fs_user');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('fs_access_token');
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('fs_access_token', res.accessToken);
    localStorage.setItem('fs_refresh_token', res.refreshToken);
    localStorage.setItem('fs_user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
    this.isAuthenticated.set(true);
  }

  private loadSession(): void {
    const token = this.getAccessToken();
    const userRaw = localStorage.getItem('fs_user');
    if (token && userRaw) {
      this.currentUser.set(JSON.parse(userRaw) as User);
      this.isAuthenticated.set(true);
    }
  }
}
