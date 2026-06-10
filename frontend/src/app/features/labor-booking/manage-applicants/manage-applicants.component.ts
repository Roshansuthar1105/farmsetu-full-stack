import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LaborService } from '../../../core/services/labor.service';
import { LaborJob, LaborApplication } from '../../../core/models/labor.model';

@Component({
  selector: 'fs-manage-applicants',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-slide-up pb-10">

      <!-- Back button -->
      <button (click)="goBack()"
              class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition">
        <span class="material-icons text-sm">arrow_back</span>
        Back to Jobs
      </button>

      <!-- Loading -->
      <div *ngIf="loading() && !job()" class="text-center py-20">
        <span class="material-icons text-4xl text-slate-600 animate-spin">hourglass_top</span>
        <p class="text-xs text-slate-500 mt-2 font-bold">Loading job details...</p>
      </div>

      <ng-container *ngIf="job()">
        <!-- Job Summary Header -->
        <div class="bg-gradient-to-r from-green-600/20 via-emerald-600/10 to-slate-900/0
                    border border-green-800/30 rounded-2xl p-6 space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 class="text-xl font-black text-white tracking-tight">{{ job()!.title }}</h1>
              <p *ngIf="job()!.description" class="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">{{ job()!.description }}</p>
            </div>
            <span [class]="getStatusBadge(job()!.status)"
                  class="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider self-start">
              {{ job()!.status }}
            </span>
          </div>

          <div class="flex flex-wrap gap-3 pt-2 border-t border-green-800/20">
            <span class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-800/70 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <span class="material-icons text-sm text-blue-400">calendar_today</span>
              {{ formatDate(job()!.jobDate) }}
            </span>
            <span class="inline-flex items-center gap-1.5 text-xs font-bold text-green-400 bg-green-950/30 px-3 py-1.5 rounded-lg border border-green-800/30">
              <span class="material-icons text-sm">payments</span>
              ₹{{ job()!.dailyWage | number }} / day
            </span>
            <span class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-800/70 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <span class="material-icons text-sm text-amber-400">groups</span>
              {{ job()!.workersHired }} / {{ job()!.requiredWorkers }} Hired
            </span>
            <span *ngIf="job()!.villageLocation" class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-800/70 px-3 py-1.5 rounded-lg border border-slate-700/50">
              <span class="material-icons text-sm text-amber-400">location_on</span>
              {{ job()!.villageLocation }}
            </span>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
                 [style.width.%]="(job()!.workersHired / job()!.requiredWorkers) * 100">
            </div>
          </div>
        </div>

        <!-- Messages -->
        <div *ngIf="successMsg()" class="p-4 bg-emerald-950/20 border border-emerald-800/40 text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-slide-up">
          <span class="material-icons text-sm">check_circle</span>
          <span class="font-semibold">{{ successMsg() }}</span>
        </div>
        <div *ngIf="errorMsg()" class="p-4 bg-rose-950/20 border border-rose-800/40 text-rose-400 rounded-xl text-xs flex items-center gap-2 animate-slide-up">
          <span class="material-icons text-sm">error</span>
          <span class="font-semibold">{{ errorMsg() }}</span>
        </div>

        <!-- Applicants List -->
        <div class="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 space-y-5">
          <h2 class="font-extrabold text-white text-base flex items-center gap-2">
            <span class="material-icons text-blue-400">people_alt</span>
            Applicants
            <span class="bg-slate-800 text-slate-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-slate-700/50 ml-1">
              {{ applications().length }}
            </span>
          </h2>

          <!-- Empty State -->
          <div *ngIf="applications().length === 0 && !loading()" class="text-center py-12">
            <span class="material-icons text-4xl text-slate-700">person_search</span>
            <p class="text-xs text-slate-500 mt-2 font-bold">No applications yet. Workers will appear here once they apply.</p>
          </div>

          <!-- Applicant Rows -->
          <div *ngFor="let app of applications(); trackBy: trackByAppId"
               class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl
                      border border-slate-700/40 bg-slate-800/40 hover:bg-slate-800/70 transition-all duration-200">

            <!-- Left: Laborer Info -->
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500
                          flex items-center justify-center text-white text-sm font-black shrink-0">
                {{ getInitials(app.laborerName) }}
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-extrabold text-white truncate">{{ app.laborerName }}</h4>
                <div class="flex flex-wrap items-center gap-2 mt-0.5">
                  <span *ngIf="app.laborerPhone" class="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                    <span class="material-icons text-[11px]">phone</span>
                    {{ app.laborerPhone }}
                  </span>
                  <span *ngIf="app.laborerVillage" class="text-[10px] text-slate-400 font-semibold flex items-center gap-0.5">
                    <span class="material-icons text-[11px]">location_on</span>
                    {{ app.laborerVillage }}
                  </span>
                  <span class="text-[10px] text-slate-500 font-semibold">
                    Applied {{ formatTimeAgo(app.appliedAt) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Right: Status / Actions -->
            <div class="flex items-center gap-2 shrink-0">
              <!-- If already processed, show badge -->
              <span *ngIf="app.applicationStatus === 'ACCEPTED'"
                    class="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider
                           bg-green-950/40 text-green-400 border border-green-800/40 flex items-center gap-1">
                <span class="material-icons text-xs">check_circle</span>
                Accepted
              </span>
              <span *ngIf="app.applicationStatus === 'REJECTED'"
                    class="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider
                           bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                <span class="material-icons text-xs">cancel</span>
                Rejected
              </span>

              <!-- If pending (APPLIED), show action buttons -->
              <ng-container *ngIf="app.applicationStatus === 'APPLIED'">
                <button (click)="onAccept(app.id)"
                        [disabled]="actionLoading()"
                        class="px-3.5 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-extrabold rounded-xl
                               shadow-md shadow-green-600/20 transition active:scale-[0.97] flex items-center gap-1
                               disabled:opacity-50 disabled:cursor-not-allowed">
                  <span class="material-icons text-sm">check</span>
                  Accept
                </button>
                <button (click)="onReject(app.id)"
                        [disabled]="actionLoading()"
                        class="px-3.5 py-2 bg-rose-600/20 hover:bg-rose-600/40 border border-rose-700/50
                               text-rose-400 text-xs font-extrabold rounded-xl
                               transition active:scale-[0.97] flex items-center gap-1
                               disabled:opacity-50 disabled:cursor-not-allowed">
                  <span class="material-icons text-sm">close</span>
                  Reject
                </button>
              </ng-container>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class ManageApplicantsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly laborService = inject(LaborService);

  readonly job = signal<LaborJob | null>(null);
  readonly applications = signal<LaborApplication[]>([]);
  readonly loading = signal(false);
  readonly actionLoading = signal(false);
  readonly successMsg = signal<string | null>(null);
  readonly errorMsg = signal<string | null>(null);

  private jobId!: number;

  ngOnInit(): void {
    this.jobId = +this.route.snapshot.paramMap.get('jobId')!;
    this.loadData();
  }

  private loadData(): void {
    this.loading.set(true);
    this.laborService.getJobDetail(this.jobId).subscribe({
      next: (job) => {
        this.job.set(job);
        this.loadApplications();
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Failed to load job details');
      }
    });
  }

  private loadApplications(): void {
    this.laborService.getApplicationsForJob(this.jobId).subscribe({
      next: (apps) => {
        this.applications.set(apps);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Failed to load applications');
      }
    });
  }

  onAccept(applicationId: number): void {
    this.actionLoading.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    this.laborService.acceptApplication(applicationId).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.successMsg.set('Worker accepted successfully!');
        this.loadData(); // Refresh everything (job counts + application statuses)
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.errorMsg.set(err.message || 'Failed to accept application');
      }
    });
  }

  onReject(applicationId: number): void {
    this.actionLoading.set(true);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    this.laborService.rejectApplication(applicationId).subscribe({
      next: () => {
        this.actionLoading.set(false);
        this.successMsg.set('Application rejected');
        this.loadApplications();
      },
      error: (err) => {
        this.actionLoading.set(false);
        this.errorMsg.set(err.message || 'Failed to reject application');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/app/labor-booking']);
  }

  trackByAppId(_: number, app: LaborApplication): number {
    return app.id;
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  formatTimeAgo(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const now = new Date();
      const past = new Date(dateStr);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return diffMins + 'm ago';
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return diffHours + 'h ago';
      const diffDays = Math.floor(diffHours / 24);
      return diffDays + 'd ago';
    } catch {
      return dateStr;
    }
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'OPEN':
        return 'bg-green-950/40 text-green-400 border border-green-800/40';
      case 'FILLED':
        return 'bg-amber-950/40 text-amber-400 border border-amber-800/40';
      case 'COMPLETED':
        return 'bg-blue-950/40 text-blue-400 border border-blue-800/40';
      case 'CANCELED':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  }
}
