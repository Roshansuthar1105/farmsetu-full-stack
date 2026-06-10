import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipment, EquipmentBooking } from '../../../core/models/machinery.model';
import { MachineryService } from '../../../core/services/machinery.service';

@Component({
  selector: 'fs-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white flex justify-between items-center">
          <div>
            <h3 class="text-base font-extrabold flex items-center gap-1.5">
              <span class="material-icons text-lg">event_note</span>
              Rent {{ equipment.name }}
            </h3>
            <p class="text-[11px] text-green-100 font-semibold mt-0.5">
              Offered by {{ equipment.ownerName }}
            </p>
          </div>
          <button (click)="onClose.emit()" class="text-white/80 hover:text-white transition">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Content -->
        <form (ngSubmit)="submitBooking()" #bookingForm="ngForm" class="p-6 space-y-4">
          
          <!-- Rates Info Summary -->
          <div class="flex justify-between items-center p-3 bg-slate-950/50 rounded-xl border border-slate-800/60 text-xs">
            <div>
              <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Hourly Rate</p>
              <p class="font-extrabold text-white">₹{{ equipment.hourlyRate }}/hr</p>
            </div>
            <div class="h-6 border-l border-slate-800"></div>
            <div>
              <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Daily Rate</p>
              <p class="font-extrabold text-white">₹{{ equipment.dailyRate }}/day</p>
            </div>
            <div class="h-6 border-l border-slate-800"></div>
            <div class="text-right">
              <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Category</p>
              <span class="bg-slate-800 text-slate-300 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-slate-700/60">
                {{ equipment.category }}
              </span>
            </div>
          </div>

          <!-- Start Date Time -->
          <div class="space-y-1">
            <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Start Date & Time</label>
            <div class="relative">
              <span class="material-icons absolute left-3 top-2.5 text-slate-500 text-sm">schedule</span>
              <input type="datetime-local" 
                     [(ngModel)]="startTime" 
                     name="startTime" 
                     required
                     [min]="minDateTime"
                     (change)="onTimeChange()"
                     class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-white
                            placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition" />
            </div>
          </div>

          <!-- End Date Time -->
          <div class="space-y-1">
            <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">End Date & Time</label>
            <div class="relative">
              <span class="material-icons absolute left-3 top-2.5 text-slate-500 text-sm">update</span>
              <input type="datetime-local" 
                     [(ngModel)]="endTime" 
                     name="endTime" 
                     required
                     [min]="startTime || minDateTime"
                     (change)="onTimeChange()"
                     class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-white
                            placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition" />
            </div>
          </div>

          <!-- Renter Notes -->
          <div class="space-y-1">
            <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Special Requests / Notes (Optional)</label>
            <textarea [(ngModel)]="notes" 
                      name="notes"
                      rows="2"
                      placeholder="Specify your field conditions, crop type, or requirements..."
                      class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-white
                             placeholder-slate-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition resize-none"></textarea>
          </div>

          <!-- Error Alert -->
          <div *ngIf="modalError" class="p-3 bg-rose-950/20 border border-rose-800/40 text-rose-400 rounded-xl text-[11px] font-semibold flex items-center gap-2 animate-slide-up">
            <span class="material-icons text-sm shrink-0">error</span>
            <span>{{ modalError }}</span>
          </div>

          <!-- Live Cost Preview -->
          <div *ngIf="isEstimating" class="flex items-center justify-center py-3">
            <span class="material-icons text-lg text-slate-600 animate-spin">sync</span>
            <span class="text-[10px] text-slate-500 font-bold ml-1.5">Calculating estimate...</span>
          </div>

          <div *ngIf="!isEstimating && estimatedCost !== null" 
               class="p-4 bg-emerald-950/20 border border-emerald-800/40 text-emerald-400 rounded-2xl animate-slide-up flex items-center justify-between">
            <div class="space-y-0.5">
              <p class="text-[9px] text-emerald-500 font-black uppercase tracking-wider">Estimated Duration</p>
              <p class="text-xs font-black text-white">{{ durationLabel }}</p>
            </div>
            <div class="text-right space-y-0.5">
              <p class="text-[9px] text-emerald-500 font-black uppercase tracking-wider">Total Cost</p>
              <p class="text-base font-black">₹{{ estimatedCost }}</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pt-4 border-t border-slate-800/60 flex justify-end gap-3">
            <button type="button" 
                    (click)="onClose.emit()"
                    class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black rounded-xl transition">
              Cancel
            </button>
            <button type="submit" 
                    [disabled]="bookingForm.invalid || isSubmitting || estimatedCost === null"
                    class="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
              <span class="material-icons text-sm" *ngIf="!isSubmitting">shopping_cart</span>
              <span class="material-icons text-sm animate-spin" *ngIf="isSubmitting">hourglass_top</span>
              {{ isSubmitting ? 'Requesting...' : 'Confirm Request' }}
            </button>
          </div>

        </form>

      </div>
    </div>
  `,
  styles: [`
    .animate-scale-up {
      animation: scaleUp 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class BookingRequestModalComponent implements OnInit {
  @Input({ required: true }) equipment!: Equipment;
  @Output() onClose = new EventEmitter<void>();
  @Output() onBookingSuccess = new EventEmitter<EquipmentBooking>();

  private readonly machineryService = inject(MachineryService);

  startTime = '';
  endTime = '';
  notes = '';
  minDateTime = '';

  isEstimating = false;
  estimatedCost: number | null = null;
  durationLabel = '';
  modalError: string | null = null;
  isSubmitting = false;

  ngOnInit(): void {
    // Set min datetime to current hour plus 1
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    this.minDateTime = this.formatToLocalISO(now);
  }

  onTimeChange(): void {
    this.modalError = null;
    this.estimatedCost = null;
    this.durationLabel = '';

    if (!this.startTime || !this.endTime) return;

    const start = new Date(this.startTime);
    const end = new Date(this.endTime);

    if (start >= end) {
      this.modalError = 'End date & time must be after the start date & time';
      return;
    }

    // Call cost calculation API
    this.isEstimating = true;
    this.machineryService.calculateCost(this.equipment.id, this.startTime, this.endTime).subscribe({
      next: (res) => {
        this.estimatedCost = res.totalCost;
        this.isEstimating = false;
        
        // Calculate readable duration label
        const diffMs = end.getTime() - start.getTime();
        const diffHours = diffMs / 3600000;
        if (diffHours >= 24) {
          const days = Math.floor(diffHours / 24);
          const remHours = Math.round(diffHours % 24);
          this.durationLabel = `${days} day(s)${remHours > 0 ? ` and ${remHours} hour(s)` : ''}`;
        } else {
          this.durationLabel = `${Math.round(diffHours * 10) / 10} hour(s)`;
        }
      },
      error: (err) => {
        this.isEstimating = false;
        this.modalError = err.error?.message || 'Could not calculate cost estimate. Please check your inputs.';
      }
    });
  }

  submitBooking(): void {
    if (!this.startTime || !this.endTime || this.estimatedCost === null) return;
    
    this.isSubmitting = true;
    this.modalError = null;

    this.machineryService.requestBooking({
      equipmentId: this.equipment.id,
      startTime: this.startTime,
      endTime: this.endTime,
      notes: this.notes || undefined
    }).subscribe({
      next: (booking) => {
        this.isSubmitting = false;
        this.onBookingSuccess.emit(booking);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.modalError = err.error?.message || err.message || 'Failed to submit rental request';
      }
    });
  }

  private formatToLocalISO(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const yyyy = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  }
}
