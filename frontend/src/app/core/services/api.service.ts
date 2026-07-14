import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/user.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  get<T>(
    path: string, 
    params?: Record<string, string | number | boolean>, 
    headers?: Record<string, string>
  ): Observable<T> {
    let httpHeaders = new HttpHeaders();
    if (headers) {
      Object.entries(headers).forEach(([k, v]) => {
        httpHeaders = httpHeaders.set(k, v);
      });
    }
    return this.http
      .get<ApiResponse<T>>(`${this.base}${path}`, { 
        params: this.toParams(params),
        headers: httpHeaders
      })
      .pipe(map((r) => r.data));
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(map((r) => r.data));
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.base}${path}`, body)
      .pipe(map((r) => r.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.base}${path}`)
      .pipe(map((r) => r.data));
  }

  getPage<T>(path: string, page = 0, size = 20): Observable<PageResponse<T>> {
    return this.get<PageResponse<T>>(path, { page, size });
  }

  private toParams(params?: Record<string, string | number | boolean>): HttpParams | undefined {
    if (!params) return undefined;
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      httpParams = httpParams.set(k, String(v));
    });
    return httpParams;
  }
}
