import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastrService } from 'ngx-toastr';

interface Crop {
  id: number;
  name: string;
  season?: string;
}

interface CropCalendar {
  id?: number;
  crop?: Crop;
  season: 'KHARIF' | 'RABI' | 'ZAID';
  year: number;
  plantingDate: string;
  expectedHarvestDate: string;
  plotArea: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
}

interface CalendarTask {
  id?: number;
  taskName: string;
  taskType: 'SOWING' | 'IRRIGATION' | 'FERTILIZING' | 'PESTICIDE_APPLICATION' | 'HARVESTING' | 'SELLING';
  scheduledDate: string;
  completedDate?: string;
  completed: boolean;
  reminderEnabled: boolean;
  notes?: string;
}

@Component({
  selector: 'fs-crop-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingSkeletonComponent, RouterLink],
  templateUrl: './crop-calendar.component.html',
  styleUrl: './crop-calendar.component.scss'
})
export class CropCalendarComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  readonly loading = signal(true);
  readonly tasksLoading = signal(false);
  readonly calendars = signal<CropCalendar[]>([]);
  readonly selectedCalendar = signal<CropCalendar | null>(null);
  readonly tasks = signal<CalendarTask[]>([]);
  readonly crops = signal<Crop[]>([]);

  // Modals visibility
  readonly isPlanModalOpen = signal(false);
  readonly isAddingPlan = signal(false);
  readonly isTaskModalOpen = signal(false);
  readonly isAddingTask = signal(false);
  readonly isCropModalOpen = signal(false);

  // Forms
  planForm!: FormGroup;
  taskForm!: FormGroup;
  cropForm!: FormGroup;
  selectedTaskToEdit: CalendarTask | null = null;

  ngOnInit(): void {
    this.loadCalendars();
    this.loadCrops();
    this.initForms();
  }

  private initForms(): void {
    this.planForm = this.fb.group({
      cropId: [null, [Validators.required]],
      season: ['KHARIF', [Validators.required]],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(2020), Validators.max(2100)]],
      plantingDate: ['', [Validators.required]],
      expectedHarvestDate: ['', [Validators.required]],
      plotArea: [null, [Validators.required, Validators.min(0.1)]],
      status: ['ACTIVE', [Validators.required]]
    });

    this.cropForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      season: ['KHARIF', [Validators.required]],
      growingDays: [90, [Validators.required, Validators.min(1)]],
      waterRequirement: ['MEDIUM', [Validators.required]]
    });

    this.taskForm = this.fb.group({
      taskName: ['', [Validators.required, Validators.maxLength(150)]],
      taskType: ['SOWING', [Validators.required]],
      scheduledDate: ['', [Validators.required]],
      notes: [''],
      completed: [false],
      completedDate: [''],
      reminderEnabled: [true]
    });

    // Handle completed date toggling in form
    this.taskForm.get('completed')?.valueChanges.subscribe(comp => {
      const dateCtrl = this.taskForm.get('completedDate');
      if (comp) {
        if (!dateCtrl?.value) {
          dateCtrl?.setValue(new Date().toISOString().split('T')[0]);
        }
      } else {
        dateCtrl?.setValue('');
      }
    });
  }

  loadCalendars(): void {
    this.loading.set(true);
    const userId = this.auth.currentUser()?.id ?? 1;

    this.api.get<CropCalendar[]>(`/api/calendar/${userId}`).subscribe({
      next: (data) => {
        this.calendars.set(data);
        
        // Restore active selection or set default
        const prev = this.selectedCalendar();
        const updated = prev ? data.find(c => c.id === prev.id) : null;
        this.selectCalendar(updated || (data.length > 0 ? data[0] : null));

        this.loading.set(false);
      },
      error: (err) => {
        this.toastr.error('Failed to load crop cultivation calendars', 'Error');
        this.loading.set(false);
      }
    });
  }

  private loadCrops(): void {
    this.api.get<Crop[]>('/api/crops').subscribe({
      next: (data) => this.crops.set(data),
      error: () => this.toastr.error('Failed to load crops list', 'Error')
    });
  }

  selectCalendar(calendar: CropCalendar | null): void {
    this.selectedCalendar.set(calendar);
    if (calendar && calendar.id) {
      this.loadTasks(calendar.id);
    } else {
      this.tasks.set([]);
    }
  }

  private loadTasks(calendarId: number): void {
    this.tasksLoading.set(true);
    this.api.get<CalendarTask[]>(`/api/calendar/${calendarId}/tasks`).subscribe({
      next: (data) => {
        // Sort tasks by scheduled date
        data.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
        this.tasks.set(data);
        this.tasksLoading.set(false);
      },
      error: () => {
        this.toastr.error('Failed to load tasks checklist', 'Error');
        this.tasksLoading.set(false);
      }
    });
  }

  // Plan Modals Logic
  openPlanModal(plan?: CropCalendar): void {
    if (plan) {
      this.isAddingPlan.set(false);
      this.planForm.patchValue({
        cropId: plan.crop?.id,
        season: plan.season,
        year: plan.year,
        plantingDate: plan.plantingDate,
        expectedHarvestDate: plan.expectedHarvestDate,
        plotArea: plan.plotArea,
        status: plan.status
      });
      // Disable crop field during edits to maintain plan integrity
      this.planForm.get('cropId')?.disable();
    } else {
      this.isAddingPlan.set(true);
      this.planForm.reset({
        cropId: null,
        season: 'KHARIF',
        year: new Date().getFullYear(),
        plantingDate: '',
        expectedHarvestDate: '',
        plotArea: null,
        status: 'ACTIVE'
      });
      this.planForm.get('cropId')?.enable();
    }
    this.isPlanModalOpen.set(true);
  }

  closePlanModal(): void {
    this.isPlanModalOpen.set(false);
  }

  savePlan(): void {
    if (this.planForm.invalid) {
      this.toastr.warning('Please fill in all fields correctly', 'Invalid Form');
      return;
    }

    const userId = this.auth.currentUser()?.id ?? 1;
    // Get raw values to read disabled controls as well
    const formVals = this.planForm.getRawValue();

    const payload = {
      farmer: { id: userId },
      crop: { id: formVals.cropId },
      season: formVals.season,
      year: formVals.year,
      plantingDate: formVals.plantingDate,
      expectedHarvestDate: formVals.expectedHarvestDate,
      plotArea: formVals.plotArea,
      status: formVals.status
    };

    const isAdd = this.isAddingPlan();
    const planId = this.selectedCalendar()?.id;

    const req$ = isAdd
      ? this.api.post<CropCalendar>('/api/calendar', payload)
      : this.api.put<CropCalendar>(`/api/calendar/${planId}`, payload);

    req$.subscribe({
      next: (res) => {
        this.toastr.success(isAdd ? 'Cultivation plan created' : 'Cultivation plan updated', 'Success');
        if (isAdd) {
          // Select the new plan
          this.selectedCalendar.set(null);
        } else {
          this.selectedCalendar.set(res);
        }
        this.closePlanModal();
        this.loadCalendars();
      },
      error: (err) => this.toastr.error('Failed to save cultivation plan: ' + (err.error?.message || err.message), 'Error')
    });
  }

  deletePlan(planId: number | undefined): void {
    if (!planId) return;
    if (!confirm('Are you sure you want to delete this crop cultivation plan? This will also remove all scheduled tasks.')) return;

    this.api.delete(`/api/calendar/${planId}`).subscribe({
      next: () => {
        this.toastr.success('Plan deleted successfully', 'Success');
        this.selectedCalendar.set(null);
        this.loadCalendars();
      },
      error: () => this.toastr.error('Failed to delete cultivation plan', 'Error')
    });
  }

  // Task Modals Logic
  openTaskModal(task?: CalendarTask): void {
    if (task) {
      this.isAddingTask.set(false);
      this.selectedTaskToEdit = task;
      this.taskForm.patchValue({
        taskName: task.taskName,
        taskType: task.taskType,
        scheduledDate: task.scheduledDate,
        notes: task.notes || '',
        completed: task.completed,
        completedDate: task.completedDate || '',
        reminderEnabled: task.reminderEnabled
      });
    } else {
      this.isAddingTask.set(true);
      this.selectedTaskToEdit = null;
      this.taskForm.reset({
        taskName: '',
        taskType: 'SOWING',
        scheduledDate: '',
        notes: '',
        completed: false,
        completedDate: '',
        reminderEnabled: true
      });
    }
    this.isTaskModalOpen.set(true);
  }

  closeTaskModal(): void {
    this.isTaskModalOpen.set(false);
    this.selectedTaskToEdit = null;
  }

  saveTask(): void {
    if (this.taskForm.invalid) {
      this.toastr.warning('Please fill in all required fields', 'Invalid Form');
      return;
    }

    const calendar = this.selectedCalendar();
    if (!calendar || !calendar.id) {
      this.toastr.error('No active crop plan selected', 'Error');
      return;
    }

    const formVals = this.taskForm.value;
    const payload = {
      taskName: formVals.taskName,
      taskType: formVals.taskType,
      scheduledDate: formVals.scheduledDate,
      notes: formVals.notes,
      completed: formVals.completed,
      completedDate: formVals.completed ? formVals.completedDate : null,
      reminderEnabled: formVals.reminderEnabled
    };

    const isAdd = this.isAddingTask();
    const taskId = this.selectedTaskToEdit?.id;

    const req$ = isAdd
      ? this.api.post<CalendarTask>(`/api/calendar/${calendar.id}/tasks`, payload)
      : this.api.put<CalendarTask>(`/api/calendar/tasks/${taskId}`, payload);

    req$.subscribe({
      next: () => {
        this.toastr.success(isAdd ? 'Task scheduled successfully' : 'Task updated successfully', 'Success');
        this.closeTaskModal();
        this.loadTasks(calendar.id!);
      },
      error: (err) => this.toastr.error('Failed to save task: ' + (err.error?.message || err.message), 'Error')
    });
  }

  deleteTask(taskId: number | undefined): void {
    if (!taskId) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    this.api.delete(`/api/calendar/tasks/${taskId}`).subscribe({
      next: () => {
        this.toastr.success('Task deleted successfully', 'Success');
        this.loadTasks(this.selectedCalendar()!.id!);
      },
      error: () => this.toastr.error('Failed to delete task', 'Error')
    });
  }

  toggleTaskCompletion(task: CalendarTask): void {
    const calendar = this.selectedCalendar();
    if (!calendar || !calendar.id) return;

    const updatedTask = {
      ...task,
      completed: !task.completed,
      completedDate: !task.completed ? new Date().toISOString().split('T')[0] : null
    };

    this.api.put<CalendarTask>(`/api/calendar/tasks/${task.id}`, updatedTask).subscribe({
      next: () => {
        this.toastr.success(updatedTask.completed ? 'Task marked complete' : 'Task marked incomplete', 'Checked');
        this.loadTasks(calendar.id!);
      },
      error: () => this.toastr.error('Failed to update task completion status', 'Error')
    });
  }

  // Helpers
  getProgress(startStr: string | undefined, endStr: string | undefined): number {
    if (!startStr || !endStr) return 0;
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const today = new Date().getTime();
    if (today <= start) return 0;
    if (today >= end) return 100;
    const total = end - start;
    const elapsed = today - start;
    return Math.round((elapsed / total) * 100);
  }

  getTaskIcon(type: string): string {
    switch (type) {
      case 'SOWING': return 'agriculture';
      case 'IRRIGATION': return 'water_drop';
      case 'FERTILIZING': return 'science';
      case 'PESTICIDE_APPLICATION': return 'healing';
      case 'HARVESTING': return 'eco';
      case 'SELLING': return 'payments';
      default: return 'event_note';
    }
  }

  getTaskColorClass(type: string): string {
    switch (type) {
      case 'SOWING': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50';
      case 'IRRIGATION': return 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border-sky-100 dark:border-sky-900/50';
      case 'FERTILIZING': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/50';
      case 'PESTICIDE_APPLICATION': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/50';
      case 'HARVESTING': return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50';
      case 'SELLING': return 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-100 dark:border-purple-900/50';
      default: return 'bg-gray-50 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400 border-gray-100 dark:border-gray-900/50';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  openCropModal(): void {
    this.cropForm.reset({
      name: '',
      season: 'KHARIF',
      growingDays: 90,
      waterRequirement: 'MEDIUM'
    });
    this.isCropModalOpen.set(true);
  }

  closeCropModal(): void {
    this.isCropModalOpen.set(false);
  }

  saveCrop(): void {
    if (this.cropForm.invalid) {
      this.toastr.warning('Please fill in all crop details correctly', 'Invalid Form');
      return;
    }

    const formVals = this.cropForm.value;
    const payload = {
      name: formVals.name,
      season: formVals.season,
      growingDays: formVals.growingDays,
      waterRequirement: formVals.waterRequirement
    };

    this.api.post<Crop>('/api/crops', payload).subscribe({
      next: (newCrop) => {
        this.toastr.success(`Crop "${newCrop.name}" registered successfully!`, 'Success');
        this.closeCropModal();
        
        // Refresh crop list and auto-select the newly added crop
        this.api.get<Crop[]>('/api/crops').subscribe({
          next: (data) => {
            this.crops.set(data);
            this.planForm.patchValue({ cropId: newCrop.id });
          }
        });
      },
      error: (err) => this.toastr.error('Failed to create new crop: ' + (err.error?.message || err.message), 'Error')
    });
  }
}
