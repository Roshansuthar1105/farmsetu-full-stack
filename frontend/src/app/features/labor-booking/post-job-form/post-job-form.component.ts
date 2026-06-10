import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LaborService } from '../../../core/services/labor.service';
import { CreateJobPayload, LaborJob } from '../../../core/models/labor.model';

@Component({
  selector: 'fs-post-job-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-slate-900/70 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-lg space-y-6">

      <div class="flex items-center justify-between">
        <h2 class="font-extrabold text-white text-base flex items-center gap-2">
          <span class="material-icons text-green-400">add_circle</span>
          Post a New Job
        </h2>
        <button (click)="onCancel.emit()"
                class="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition">
          <span class="material-icons text-lg">close</span>
        </button>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMsg()" class="p-4 bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-slide-up">
        <span class="material-icons text-sm">check_circle</span>
        <span class="font-semibold">{{ successMsg() }}</span>
      </div>

      <!-- Error Message -->
      <div *ngIf="errorMsg()" class="p-4 bg-rose-950/30 border border-rose-800/40 text-rose-400 rounded-xl text-xs flex items-center gap-2 animate-slide-up">
        <span class="material-icons text-sm">error</span>
        <span class="font-semibold">{{ errorMsg() }}</span>
      </div>

      <form [formGroup]="jobForm" (ngSubmit)="onSubmit()" class="space-y-5">

        <!-- Title -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            Job Title *
          </label>
          <input type="text" formControlName="title" placeholder="e.g. Onion Harvesting Helpers Needed"
                 class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none text-xs font-bold text-white
                        placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition" />
          <p *ngIf="jobForm.get('title')?.touched && jobForm.get('title')?.errors?.['required']"
             class="text-rose-400 text-[10px] mt-1 font-bold">Job title is required</p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            Description
          </label>
          <textarea formControlName="description" rows="3"
                    placeholder="Describe the work, tools needed, timing, etc..."
                    class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none text-xs font-semibold text-white
                           placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition resize-none"></textarea>
        </div>

        <!-- Row: Date + Workers + Wage -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Job Date *
            </label>
            <input type="date" formControlName="jobDate"
                   class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 outline-none text-xs font-bold text-white
                          focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition cursor-pointer" />
            <p *ngIf="jobForm.get('jobDate')?.touched && jobForm.get('jobDate')?.errors?.['required']"
               class="text-rose-400 text-[10px] mt-1 font-bold">Date is required</p>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Workers Needed *
            </label>
            <input type="number" formControlName="requiredWorkers" min="1" placeholder="5"
                   class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 outline-none text-xs font-bold text-white
                          placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition" />
            <p *ngIf="jobForm.get('requiredWorkers')?.touched && jobForm.get('requiredWorkers')?.errors?.['required']"
               class="text-rose-400 text-[10px] mt-1 font-bold">Required</p>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Daily Wage (₹) *
            </label>
            <input type="number" formControlName="dailyWage" min="1" placeholder="350"
                   class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 outline-none text-xs font-bold text-white
                          placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition" />
            <p *ngIf="jobForm.get('dailyWage')?.touched && jobForm.get('dailyWage')?.errors?.['required']"
               class="text-rose-400 text-[10px] mt-1 font-bold">Required</p>
          </div>
        </div>

        <!-- Village Location -->
        <div>
          <label class="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
            Village / Location
          </label>
          <input type="text" formControlName="villageLocation" placeholder="e.g. Nashik, Maharashtra"
                 class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none text-xs font-bold text-white
                        placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition" />
        </div>

        <!-- Submit -->
        <button type="submit" [disabled]="loading()"
                class="w-full py-3.5 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400
                       text-white font-extrabold rounded-xl shadow-lg shadow-green-600/15 transition-all duration-200
                       active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="material-icons text-sm">{{ loading() ? 'hourglass_top' : 'publish' }}</span>
          {{ loading() ? 'Publishing...' : 'Publish Job' }}
        </button>
      </form>
    </div>
  `
})
export class PostJobFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly laborService = inject(LaborService);

  @Output() jobCreated = new EventEmitter<LaborJob>();
  @Output() onCancel = new EventEmitter<void>();

  readonly loading = signal(false);
  readonly successMsg = signal<string | null>(null);
  readonly errorMsg = signal<string | null>(null);

  jobForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    jobDate: [new Date().toISOString().split('T')[0], Validators.required],
    requiredWorkers: [1, [Validators.required, Validators.min(1)]],
    dailyWage: [null, [Validators.required, Validators.min(1)]],
    villageLocation: ['']
  });

  onSubmit(): void {
    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMsg.set(null);
    this.successMsg.set(null);

    const payload: CreateJobPayload = this.jobForm.value;

    this.laborService.createJob(payload).subscribe({
      next: (job) => {
        this.loading.set(false);
        this.successMsg.set('Job published successfully!');
        this.jobCreated.emit(job);
        this.jobForm.reset({
          title: '',
          description: '',
          jobDate: new Date().toISOString().split('T')[0],
          requiredWorkers: 1,
          dailyWage: null,
          villageLocation: ''
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.message || 'Failed to create job');
      }
    });
  }
}
