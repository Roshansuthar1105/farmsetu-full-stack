import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  getProfile(): Observable<User> {
    return this.api.get<User>('/api/users/me');
  }

  updateProfile(body: Partial<User>): Observable<User> {
    return this.api.put<User>('/api/users/me', body);
  }

  getBadges(): Observable<any[]> {
    return this.api.get<any[]>('/api/users/me/badges');
  }

  updateProfilePhoto(userId: number, photoUrl: string): Observable<User> {
    return this.api.put<User>(`/api/users/${userId}/profile-photo?url=${encodeURIComponent(photoUrl)}`, null);
  }

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<string>('/api/chats/upload', formData);
  }
}
