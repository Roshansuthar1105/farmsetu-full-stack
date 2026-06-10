import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { LaborJob, LaborApplication, CreateJobPayload } from '../models/labor.model';

@Injectable({ providedIn: 'root' })
export class LaborService {
  private readonly api = inject(ApiService);

  // ─── Jobs ─────────────────────────────────────────────────────────

  getOpenJobs(village?: string): Observable<LaborJob[]> {
    const params: Record<string, string> = {};
    if (village) params['village'] = village;
    return this.api.get<LaborJob[]>('/api/labor/jobs', params);
  }

  getMyJobs(): Observable<LaborJob[]> {
    return this.api.get<LaborJob[]>('/api/labor/jobs/my');
  }

  getJobDetail(jobId: number): Observable<LaborJob> {
    return this.api.get<LaborJob>(`/api/labor/jobs/${jobId}`);
  }

  createJob(payload: CreateJobPayload): Observable<LaborJob> {
    return this.api.post<LaborJob>('/api/labor/jobs', payload);
  }

  // ─── Applications ─────────────────────────────────────────────────

  applyForJob(jobId: number): Observable<LaborApplication> {
    return this.api.post<LaborApplication>(`/api/labor/jobs/${jobId}/apply`, {});
  }

  getApplicationsForJob(jobId: number): Observable<LaborApplication[]> {
    return this.api.get<LaborApplication[]>(`/api/labor/jobs/${jobId}/applications`);
  }

  acceptApplication(applicationId: number): Observable<LaborApplication> {
    return this.api.put<LaborApplication>(`/api/labor/applications/${applicationId}/accept`, {});
  }

  rejectApplication(applicationId: number): Observable<LaborApplication> {
    return this.api.put<LaborApplication>(`/api/labor/applications/${applicationId}/reject`, {});
  }

  getMyApplications(): Observable<LaborApplication[]> {
    return this.api.get<LaborApplication[]>('/api/labor/applications/my');
  }
}
