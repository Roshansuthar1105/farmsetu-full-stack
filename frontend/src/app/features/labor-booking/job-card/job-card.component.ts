import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LaborJob } from '../../../core/models/labor.model';

@Component({
  selector: 'fs-job-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="group relative bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-sm
                hover:shadow-lg hover:shadow-green-900/10 hover:border-slate-600/60 transition-all duration-300
                flex flex-col justify-between gap-4 overflow-hidden">

      <!-- Subtle top-accent glow -->
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <!-- Header -->
      <div class="space-y-3">
        <div class="flex justify-between items-start gap-2">
          <h3 class="font-extrabold text-white text-sm leading-snug line-clamp-2">
            {{ job.title }}
          </h3>
          <span [class]="getStatusBadge(job.status)"
                class="text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shrink-0">
            {{ job.status }}
          </span>
        </div>

        <!-- Description -->
        <p *ngIf="job.description" class="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
          {{ job.description }}
        </p>

        <!-- Meta row -->
        <div class="flex flex-wrap gap-2">
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/40">
            <span class="material-icons text-xs text-blue-400">calendar_today</span>
            {{ formatDate(job.jobDate) }}
          </span>
          <span *ngIf="job.villageLocation" class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/40">
            <span class="material-icons text-xs text-amber-400">location_on</span>
            {{ job.villageLocation }}
          </span>
        </div>
      </div>

      <!-- Wage + Progress -->
      <div class="space-y-3 pt-2 border-t border-slate-700/40">
        <!-- Daily Wage - Prominent -->
        <div class="flex items-baseline justify-between">
          <div>
            <p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Daily Wage</p>
            <p class="text-xl font-black text-green-400 tracking-tight">
              ₹{{ job.dailyWage | number }}
              <span class="text-[10px] font-semibold text-slate-500">/day</span>
            </p>
          </div>
          <div class="text-right">
            <p class="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Workers</p>
            <p class="text-sm font-black"
               [class.text-green-400]="job.workersHired < job.requiredWorkers"
               [class.text-amber-400]="job.workersHired === job.requiredWorkers">
              {{ job.workersHired }}/{{ job.requiredWorkers }}
              <span class="text-[10px] font-semibold text-slate-500">Hired</span>
            </p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div class="h-full rounded-full transition-all duration-700 ease-out"
               [class.bg-gradient-to-r]="true"
               [class.from-green-500]="hiredPercent < 100"
               [class.to-emerald-400]="hiredPercent < 100"
               [class.from-amber-500]="hiredPercent >= 100"
               [class.to-yellow-400]="hiredPercent >= 100"
               [style.width.%]="hiredPercent">
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-between gap-2 pt-1">
        <p class="text-[10px] text-slate-500 font-semibold">
          Posted by <span class="text-slate-300 font-bold">{{ job.farmerName }}</span>
        </p>

        <!-- Apply Button (for laborers - only OPEN jobs, not own job) -->
        <button *ngIf="showApply && job.status === 'OPEN'"
                (click)="onApply.emit(job.id)"
                class="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400
                       text-white text-xs font-extrabold rounded-xl shadow-md shadow-green-600/20
                       transition-all duration-200 active:scale-[0.97] flex items-center gap-1.5">
          <span class="material-icons text-sm">person_add</span>
          Apply Now
        </button>

        <!-- Manage Button (for farmers - own jobs) -->
        <button *ngIf="showManage"
                (click)="onManage.emit(job.id)"
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600/50
                       text-slate-200 text-xs font-extrabold rounded-xl
                       transition-all duration-200 active:scale-[0.97] flex items-center gap-1.5">
          <span class="material-icons text-sm">groups</span>
          Manage
        </button>
      </div>
    </div>
  `
})
export class JobCardComponent {
  @Input({ required: true }) job!: LaborJob;
  @Input() showApply = false;
  @Input() showManage = false;

  @Output() onApply = new EventEmitter<number>();
  @Output() onManage = new EventEmitter<number>();

  get hiredPercent(): number {
    if (!this.job.requiredWorkers) return 0;
    return Math.min(100, (this.job.workersHired / this.job.requiredWorkers) * 100);
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
