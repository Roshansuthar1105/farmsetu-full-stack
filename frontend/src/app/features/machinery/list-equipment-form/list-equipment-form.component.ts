import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipment, EquipmentCategory } from '../../../core/models/machinery.model';
import { MachineryService } from '../../../core/services/machinery.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'fs-list-equipment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-slide-up">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800/80">
        <h3 class="text-sm font-extrabold text-white flex items-center gap-1.5">
          <span class="material-icons text-green-400">agriculture</span>
          {{ equipmentToEdit ? 'Edit Equipment Listing' : 'List New Machinery' }}
        </h3>
        <button (click)="onCancel.emit()" class="text-slate-500 hover:text-white transition">
          <span class="material-icons text-sm">close</span>
        </button>
      </div>

      <form (ngSubmit)="onSubmit()" #form="ngForm" class="space-y-4">
        
        <!-- Row 1: Name and Category -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Equipment Name / Model *</label>
            <input type="text" 
                   [(ngModel)]="payload.name" 
                   name="name" 
                   required 
                   placeholder="e.g. John Deere 5050 D"
                   class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white
                          placeholder-slate-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition" />
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Category *</label>
            <select [(ngModel)]="payload.category" 
                    name="category" 
                    required
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white
                           focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition appearance-none">
              <option value="" disabled>Select category</option>
              <option value="TRACTOR">Tractor</option>
              <option value="DRONE">Drone</option>
              <option value="HARVESTER">Harvester</option>
              <option value="IMPLEMENT">Implement (Plow, Seeder, etc.)</option>
            </select>
          </div>
        </div>

        <!-- Row 2: Rates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Hourly Rate (₹) *</label>
            <input type="number" 
                   [(ngModel)]="payload.hourlyRate" 
                   name="hourlyRate" 
                   required 
                   min="1"
                   placeholder="Hourly cost in INR"
                   class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white
                          placeholder-slate-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition" />
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Daily Rate (₹) *</label>
            <input type="number" 
                   [(ngModel)]="payload.dailyRate" 
                   name="dailyRate" 
                   required 
                   min="1"
                   placeholder="Daily cost (usually 8+ hours)"
                   class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white
                          placeholder-slate-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition" />
          </div>
        </div>

        <!-- Row 3: Image URL -->
        <div class="space-y-1">
          <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Equipment Image URL (Optional)</label>
          <input type="text" 
                 [(ngModel)]="payload.imageUrl" 
                 name="imageUrl" 
                 placeholder="Paste a link to an image of the equipment"
                 class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white
                        placeholder-slate-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition" />
        </div>

        <!-- Row 4: Custom Coordinates & Village -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-1">
            <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Latitude (Optional)</label>
            <input type="number" 
                   step="0.000001"
                   [(ngModel)]="payload.locationLat" 
                   name="locationLat" 
                   placeholder="Auto-fills from profile"
                   class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white
                          placeholder-slate-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition" />
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Longitude (Optional)</label>
            <input type="number" 
                   step="0.000001"
                   [(ngModel)]="payload.locationLng" 
                   name="locationLng" 
                   placeholder="Auto-fills from profile"
                   class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white
                          placeholder-slate-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition" />
          </div>

          <div class="space-y-1">
            <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Village / Town (Optional)</label>
            <input type="text" 
                   [(ngModel)]="payload.village" 
                   name="village" 
                   placeholder="Auto-fills from profile"
                   class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white
                          placeholder-slate-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition" />
          </div>
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <label class="block text-[10px] text-slate-400 font-black uppercase tracking-wider">Description</label>
          <textarea [(ngModel)]="payload.description" 
                    name="description" 
                    rows="3" 
                    placeholder="Provide details like engine horsepower, working condition, attachments, or rules..."
                    class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-white
                           placeholder-slate-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition resize-none"></textarea>
        </div>

        <!-- Error Alert -->
        <div *ngIf="errorMsg" class="p-4 bg-rose-950/20 border border-rose-800/40 text-rose-400 rounded-xl text-xs flex items-center gap-2 animate-slide-up">
          <span class="material-icons text-sm shrink-0">error</span>
          <span class="font-semibold">{{ errorMsg }}</span>
        </div>

        <!-- Form Actions -->
        <div class="pt-4 border-t border-slate-800/80 flex justify-end gap-3">
          <button type="button" 
                  (click)="onCancel.emit()"
                  class="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black rounded-xl transition">
            Cancel
          </button>
          <button type="submit" 
                  [disabled]="form.invalid || isSaving"
                  class="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5">
            <span class="material-icons text-sm animate-spin" *ngIf="isSaving">hourglass_top</span>
            <span class="material-icons text-sm" *ngIf="!isSaving">save</span>
            {{ isSaving ? 'Saving...' : 'Save Listing' }}
          </button>
        </div>

      </form>
    </div>
  `
})
export class ListEquipmentFormComponent implements OnInit, OnChanges {
  @Input() equipmentToEdit: Equipment | null = null;
  @Output() onSave = new EventEmitter<Equipment>();
  @Output() onCancel = new EventEmitter<void>();

  private readonly machineryService = inject(MachineryService);
  private readonly authService = inject(AuthService);

  payload = this.getDefaultPayload();
  isSaving = false;
  errorMsg: string | null = null;

  ngOnInit(): void {
    this.initPayload();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['equipmentToEdit']) {
      this.initPayload();
    }
  }

  private initPayload(): void {
    if (this.equipmentToEdit) {
      this.payload = {
        name: this.equipmentToEdit.name,
        category: this.equipmentToEdit.category,
        description: this.equipmentToEdit.description || '',
        hourlyRate: this.equipmentToEdit.hourlyRate,
        dailyRate: this.equipmentToEdit.dailyRate,
        imageUrl: this.equipmentToEdit.imageUrl || '',
        locationLat: this.equipmentToEdit.locationLat,
        locationLng: this.equipmentToEdit.locationLng,
        village: this.equipmentToEdit.village || ''
      };
    } else {
      this.payload = this.getDefaultPayload();
      
      // Auto-fill from user profile
      const user = this.authService.currentUser();
      if (user && user.latitude && user.longitude) {
        this.payload.locationLat = user.latitude;
        this.payload.locationLng = user.longitude;
        this.payload.village = user.village || '';
      } else {
        if (user) {
          this.payload.village = user.village || '';
        }
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              this.payload.locationLat = pos.coords.latitude;
              this.payload.locationLng = pos.coords.longitude;
            }
          );
        }
      }
    }
  }

  private getDefaultPayload() {
    return {
      name: '',
      category: '' as EquipmentCategory | '',
      description: '',
      hourlyRate: null as number | null,
      dailyRate: null as number | null,
      imageUrl: '',
      locationLat: undefined as number | undefined,
      locationLng: undefined as number | undefined,
      village: ''
    };
  }

  onSubmit(): void {
    if (this.payload.hourlyRate === null || this.payload.dailyRate === null || !this.payload.category) {
      this.errorMsg = 'Please complete all required fields';
      return;
    }

    this.isSaving = true;
    this.errorMsg = null;

    const saveObs = this.equipmentToEdit
      ? this.machineryService.updateEquipment(this.equipmentToEdit.id, this.payload)
      : this.machineryService.addEquipment(this.payload);

    saveObs.subscribe({
      next: (equipment) => {
        this.isSaving = false;
        this.onSave.emit(equipment);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMsg = err.error?.message || err.message || 'Failed to save machinery listing';
      }
    });
  }
}
