import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LaborService } from '../../core/services/labor.service';
import { AuthService } from '../../core/services/auth.service';
import { LaborJob } from '../../core/models/labor.model';
import { JobCardComponent } from './job-card/job-card.component';
import { PostJobFormComponent } from './post-job-form/post-job-form.component';

@Component({
  selector: 'fs-labor-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, JobCardComponent, PostJobFormComponent],
  template: `
    <div class="space-y-6 animate-slide-up pb-10">

      <!-- HEADER -->
      <div class="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6 rounded-2xl shadow-lg
                  flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <!-- Decorative circles -->
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div class="absolute right-16 -bottom-6 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>

        <div class="relative z-10">
          <h1 class="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <span class="material-icons text-white/90 text-3xl">engineering</span>
            Labor Booking
          </h1>
          <p class="text-sm text-green-100 mt-1 max-w-xl leading-relaxed">
            Find workers for your farm or apply for available jobs in your village. Connect with local labor during peak seasons.
          </p>
        </div>

        <button (click)="showPostForm.set(!showPostForm())"
                class="relative z-10 px-5 py-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-xl
                       text-sm font-extrabold hover:bg-white/25 transition-all duration-200 active:scale-[0.97]
                       flex items-center gap-2 self-start md:self-auto shadow-lg">
          <span class="material-icons text-lg">{{ showPostForm() ? 'close' : 'add_circle' }}</span>
          {{ showPostForm() ? 'Close Form' : 'Post a Job' }}
        </button>
      </div>

      <!-- POST JOB FORM (toggleable) -->
      <fs-post-job-form *ngIf="showPostForm()"
                        (jobCreated)="onJobCreated($event)"
                        (onCancel)="showPostForm.set(false)">
      </fs-post-job-form>

      <!-- TAB SWITCHER -->
      <div class="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl max-w-lg">
        <button (click)="onTabChange('available')"
                [class]="activeTab() === 'available'
                  ? 'bg-slate-800 shadow-sm text-green-400 font-extrabold'
                  : 'text-slate-400 font-semibold'"
                class="flex-1 py-3 text-xs rounded-xl transition duration-200 focus:outline-none flex items-center justify-center gap-1.5">
          <span class="material-icons text-sm">work</span>
          Available Jobs
        </button>
        <button (click)="onTabChange('my-jobs')"
                [class]="activeTab() === 'my-jobs'
                  ? 'bg-slate-800 shadow-sm text-green-400 font-extrabold'
                  : 'text-slate-400 font-semibold'"
                class="flex-1 py-3 text-xs rounded-xl transition duration-200 focus:outline-none flex items-center justify-center gap-1.5">
          <span class="material-icons text-sm">assignment</span>
          My Posted Jobs
          <span *ngIf="myJobs().length > 0"
                class="ml-1 bg-green-950/40 text-green-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-green-800/30">
            {{ myJobs().length }}
          </span>
        </button>
        <button (click)="onTabChange('my-applications')"
                [class]="activeTab() === 'my-applications'
                  ? 'bg-slate-800 shadow-sm text-green-400 font-extrabold'
                  : 'text-slate-400 font-semibold'"
                class="flex-1 py-3 text-xs rounded-xl transition duration-200 focus:outline-none flex items-center justify-center gap-1.5">
          <span class="material-icons text-sm">how_to_reg</span>
          My Applications
        </button>
      </div>

      <!-- MESSAGES -->
      <div *ngIf="successMsg()" class="p-4 bg-emerald-950/20 border border-emerald-800/40 text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-slide-up">
        <span class="material-icons text-sm">check_circle</span>
        <span class="font-semibold">{{ successMsg() }}</span>
      </div>
      <div *ngIf="errorMsg()" class="p-4 bg-rose-950/20 border border-rose-800/40 text-rose-400 rounded-xl text-xs flex items-center gap-2 animate-slide-up">
        <span class="material-icons text-sm">error</span>
        <span class="font-semibold">{{ errorMsg() }}</span>
      </div>

      <!-- ═══ TAB: AVAILABLE JOBS ═══ -->
      <div *ngIf="activeTab() === 'available'" class="space-y-5 animate-slide-up">

        <!-- Search bar -->
        <div class="flex gap-3 items-center">
          <div class="relative flex-1 max-w-md">
            <span class="material-icons absolute left-3.5 top-2.5 text-slate-500 text-lg">search</span>
            <input type="text" [(ngModel)]="villageFilter" (keyup.enter)="searchJobs()"
                   placeholder="Search by village or location..."
                   class="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 outline-none text-xs font-bold text-white
                          placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition" />
          </div>
          <button (click)="searchJobs()"
                  class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition active:scale-[0.97]">
            Search
          </button>
          <button *ngIf="villageFilter" (click)="villageFilter = ''; searchJobs()"
                  class="px-3 py-2.5 text-slate-400 hover:text-white text-xs font-bold transition">
            Clear
          </button>
        </div>

        <!-- Loading -->
        <div *ngIf="loading()" class="text-center py-16">
          <span class="material-icons text-4xl text-slate-600 animate-spin">hourglass_top</span>
          <p class="text-xs text-slate-500 mt-2 font-bold">Loading available jobs...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && openJobs().length === 0" class="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <span class="material-icons text-5xl text-slate-700">work_off</span>
          <p class="text-sm text-slate-500 mt-3 font-bold">No open jobs found</p>
          <p class="text-[11px] text-slate-600 mt-1">Try a different village or check back later</p>
        </div>

        <!-- Job Grid -->
        <div *ngIf="!loading() && openJobs().length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <fs-job-card *ngFor="let job of openJobs(); trackBy: trackByJobId"
                       [job]="job"
                       [showApply]="job.farmerId !== currentUserId()"
                       (onApply)="onApplyForJob($event)">
          </fs-job-card>
        </div>
      </div>

      <!-- ═══ TAB: MY POSTED JOBS ═══ -->
      <div *ngIf="activeTab() === 'my-jobs'" class="space-y-5 animate-slide-up">

        <!-- Loading -->
        <div *ngIf="loading()" class="text-center py-16">
          <span class="material-icons text-4xl text-slate-600 animate-spin">hourglass_top</span>
          <p class="text-xs text-slate-500 mt-2 font-bold">Loading your jobs...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && myJobs().length === 0" class="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <span class="material-icons text-5xl text-slate-700">post_add</span>
          <p class="text-sm text-slate-500 mt-3 font-bold">You haven't posted any jobs yet</p>
          <p class="text-[11px] text-slate-600 mt-1">Click "Post a Job" to get started</p>
        </div>

        <!-- Job Grid (with Manage button) -->
        <div *ngIf="!loading() && myJobs().length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <fs-job-card *ngFor="let job of myJobs(); trackBy: trackByJobId"
                       [job]="job"
                       [showManage]="true"
                       (onManage)="onManageJob($event)">
          </fs-job-card>
        </div>
      </div>

      <!-- ═══ TAB: MY APPLICATIONS ═══ -->
      <div *ngIf="activeTab() === 'my-applications'" class="space-y-4 animate-slide-up">

        <!-- Loading -->
        <div *ngIf="loading()" class="text-center py-16">
          <span class="material-icons text-4xl text-slate-600 animate-spin">hourglass_top</span>
          <p class="text-xs text-slate-500 mt-2 font-bold">Loading your applications...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && myApplications().length === 0" class="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <span class="material-icons text-5xl text-slate-700">assignment_turned_in</span>
          <p class="text-sm text-slate-500 mt-3 font-bold">No applications yet</p>
          <p class="text-[11px] text-slate-600 mt-1">Browse available jobs and apply to get started</p>
        </div>

        <!-- Applications List -->
        <div *ngIf="!loading() && myApplications().length > 0" class="space-y-3">
          <div *ngFor="let app of myApplications()"
               class="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5
                      flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/60 transition">
            <div class="space-y-1">
              <h4 class="text-sm font-extrabold text-white">{{ app.jobTitle }}</h4>
              <p class="text-[10px] text-slate-500 font-semibold">
                Applied {{ formatTimeAgo(app.appliedAt) }}
              </p>
            </div>
            <span [class]="getApplicationBadge(app.applicationStatus)"
                  class="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider self-start flex items-center gap-1">
              <span class="material-icons text-xs">{{ getApplicationIcon(app.applicationStatus) }}</span>
              {{ app.applicationStatus }}
            </span>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LaborBookingComponent implements OnInit {
  private readonly laborService = inject(LaborService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly activeTab = signal<'available' | 'my-jobs' | 'my-applications'>('available');
  readonly openJobs = signal<LaborJob[]>([]);
  readonly myJobs = signal<LaborJob[]>([]);
  readonly myApplications = signal<any[]>([]);
  readonly loading = signal(false);
  readonly showPostForm = signal(false);
  readonly successMsg = signal<string | null>(null);
  readonly errorMsg = signal<string | null>(null);

  villageFilter = '';

  currentUserId = () => this.auth.currentUser()?.id ?? 0;

  ngOnInit(): void {
    this.loadOpenJobs();
    this.loadMyJobs();
  }

  onTabChange(tab: 'available' | 'my-jobs' | 'my-applications'): void {
    this.activeTab.set(tab);
    this.successMsg.set(null);
    this.errorMsg.set(null);

    if (tab === 'available') this.loadOpenJobs();
    else if (tab === 'my-jobs') this.loadMyJobs();
    else if (tab === 'my-applications') this.loadMyApplications();
  }

  loadOpenJobs(): void {
    this.loading.set(true);
    this.laborService.getOpenJobs(this.villageFilter || undefined).subscribe({
      next: (jobs) => {
        this.openJobs.set(jobs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Failed to load available jobs');
      }
    });
  }

  loadMyJobs(): void {
    this.laborService.getMyJobs().subscribe({
      next: (jobs) => this.myJobs.set(jobs),
      error: () => this.errorMsg.set('Failed to load your posted jobs')
    });
  }

  loadMyApplications(): void {
    this.loading.set(true);
    this.laborService.getMyApplications().subscribe({
      next: (apps) => {
        this.myApplications.set(apps);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Failed to load your applications');
      }
    });
  }

  searchJobs(): void {
    this.loadOpenJobs();
  }

  onJobCreated(job: LaborJob): void {
    this.showPostForm.set(false);
    this.successMsg.set('Job posted successfully! Workers can now apply.');
    this.loadOpenJobs();
    this.loadMyJobs();
  }

  onApplyForJob(jobId: number): void {
    this.successMsg.set(null);
    this.errorMsg.set(null);

    this.laborService.applyForJob(jobId).subscribe({
      next: () => {
        this.successMsg.set('Application submitted successfully! The farmer will review it.');
        this.loadOpenJobs();
      },
      error: (err) => {
        this.errorMsg.set(err.message || 'Failed to apply for this job');
      }
    });
  }

  onManageJob(jobId: number): void {
    this.router.navigate(['/app/labor-booking/manage', jobId]);
  }

  trackByJobId(_: number, job: LaborJob): number {
    return job.id;
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

  getApplicationBadge(status: string): string {
    switch (status) {
      case 'APPLIED':
        return 'bg-blue-950/40 text-blue-400 border border-blue-800/40';
      case 'ACCEPTED':
        return 'bg-green-950/40 text-green-400 border border-green-800/40';
      case 'REJECTED':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  }

  getApplicationIcon(status: string): string {
    switch (status) {
      case 'APPLIED': return 'schedule';
      case 'ACCEPTED': return 'check_circle';
      case 'REJECTED': return 'cancel';
      default: return 'help';
    }
  }
}
