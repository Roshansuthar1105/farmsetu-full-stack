import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipment } from '../../../core/models/machinery.model';

@Component({
  selector: 'fs-equipment-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-slate-900/60 backdrop-blur-md border rounded-2xl p-5 flex flex-col justify-between h-full transition-all duration-300 hover:-translate-y-1"
         [ngClass]="{
           'border-slate-800': equipment.isActive,
           'border-red-950/40': !equipment.isActive,
           'opacity-80': !equipment.isActive
         }">
      <div>
        <!-- Image & Category Icon -->
        <div class="relative w-full h-40 bg-slate-950 rounded-xl overflow-hidden mb-4 border border-slate-800 flex items-center justify-center">
          <img *ngIf="equipment.imageUrl" 
               [src]="equipment.imageUrl" 
               [alt]="equipment.name"
               class="w-full h-full object-cover" 
               (error)="onImgError($event)" />
          
          <div *ngIf="!equipment.imageUrl" class="flex flex-col items-center justify-center text-slate-600">
            <span class="material-icons text-5xl">{{ getCategoryIcon(equipment.category) }}</span>
          </div>

          <!-- Category Badge -->
          <span class="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-[10px] font-black text-slate-300 border border-slate-700/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {{ equipment.category }}
          </span>

          <!-- Active/Inactive Status Badge (Visible to owner) -->
          <span *ngIf="showManage" 
                [class]="equipment.isActive ? 'bg-green-950/80 text-green-400 border-green-800/40' : 'bg-red-950/80 text-red-400 border-red-800/40'"
                class="absolute top-3 right-3 text-[10px] font-black border px-2.5 py-1 rounded-full uppercase tracking-wider">
            {{ equipment.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>

        <!-- Name & Distance -->
        <div class="flex items-start justify-between gap-2 mb-2">
          <h3 class="text-sm font-extrabold text-white truncate max-w-[75%]">
            {{ equipment.name }}
          </h3>
          <span *ngIf="equipment.distanceKm !== undefined" 
                class="text-[10px] font-black text-green-400 bg-green-950/40 border border-green-800/40 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
            <span class="material-icons text-[10px]">place</span>
            {{ equipment.distanceKm }} km
          </span>
          <span *ngIf="equipment.distanceKm === undefined && equipment.village" 
                class="text-[10px] font-black text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 max-w-[35%] truncate">
            <span class="material-icons text-[10px]">place</span>
            {{ equipment.village }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-xs text-slate-400 line-clamp-2 mb-4 min-h-[2rem]">
          {{ equipment.description || 'No description provided.' }}
        </p>

        <!-- Rates -->
        <div class="grid grid-cols-2 gap-3 p-3 bg-slate-950/50 rounded-xl border border-slate-800/60 mb-5">
          <div>
            <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Hourly Rate</p>
            <p class="text-xs font-black text-emerald-400">₹{{ equipment.hourlyRate }}/hr</p>
          </div>
          <div class="border-l border-slate-800/80 pl-3">
            <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Daily Rate</p>
            <p class="text-xs font-black text-emerald-400">₹{{ equipment.dailyRate }}/day</p>
          </div>
        </div>

        <!-- Provider details for renters -->
        <div *ngIf="!showManage" class="flex items-center gap-2 mb-4 p-2 bg-slate-800/20 rounded-lg border border-slate-800/40 text-[10px] text-slate-400">
          <span class="material-icons text-xs">person</span>
          <span class="font-bold truncate">Owner: {{ equipment.ownerName }}</span>
          <span *ngIf="equipment.ownerPhone" class="ml-auto flex items-center gap-0.5 text-slate-500 font-semibold">
            <span class="material-icons text-[10px]">phone</span>
            {{ equipment.ownerPhone }}
          </span>
        </div>
      </div>

      <!-- Action Footer -->
      <div class="pt-3 border-t border-slate-800/50 flex gap-2">
        <ng-container *ngIf="showManage; else renterActions">
          <button (click)="onToggle.emit(equipment.id)"
                  [class]="equipment.isActive ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-green-950/30 hover:bg-green-950/50 border border-green-800/30 text-green-400'"
                  class="flex-1 py-2 text-xs font-black rounded-xl transition active:scale-[0.97] flex items-center justify-center gap-1">
            <span class="material-icons text-sm">{{ equipment.isActive ? 'visibility_off' : 'visibility' }}</span>
            {{ equipment.isActive ? 'Deactivate' : 'Activate' }}
          </button>
          <button (click)="onEdit.emit(equipment)"
                  class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition active:scale-[0.97] flex items-center justify-center">
            <span class="material-icons text-sm">edit</span>
          </button>
        </ng-container>

        <ng-template #renterActions>
          <button *ngIf="equipment.isActive" 
                  (click)="onBook.emit(equipment)"
                  class="w-full py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-black rounded-xl shadow-lg shadow-green-950/20 transition active:scale-[0.97] flex items-center justify-center gap-1.5">
            <span class="material-icons text-sm">event</span>
            Request Booking
          </button>
          <button *ngIf="!equipment.isActive" 
                  disabled
                  class="w-full py-2.5 bg-slate-800 text-slate-600 text-xs font-black rounded-xl cursor-not-allowed flex items-center justify-center gap-1.5">
            <span class="material-icons text-sm">block</span>
            Currently Unavailable
          </button>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `]
})
export class EquipmentCardComponent {
  @Input({ required: true }) equipment!: Equipment;
  @Input() showManage = false;

  @Output() onBook = new EventEmitter<Equipment>();
  @Output() onToggle = new EventEmitter<number>();
  @Output() onEdit = new EventEmitter<Equipment>();

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'TRACTOR': return 'agriculture';
      case 'DRONE': return 'flight_takeoff';
      case 'HARVESTER': return 'grain';
      case 'IMPLEMENT': return 'plumbing';
      default: return 'build';
    }
  }

  onImgError(event: any): void {
    event.target.style.display = 'none';
  }
}
