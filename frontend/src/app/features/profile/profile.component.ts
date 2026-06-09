import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

interface FarmData {
  id?: number;
  name: string;
  farmArea: number;
  calculatedArea?: number;
  soilType: string;
  soilPh: number;
  waterSource: string;
  farmingType: string;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  latitude?: number;
  longitude?: number;
}

@Component({
  selector: 'fs-profile',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <fs-page-header title="My Profile & Farm Hub" subtitle="Manage your farmer identity, upload profile photo, customize soil profiles, and manage active farms" />

    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Profile Information Card -->
      @if (user(); as u) {
        <div class="bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div class="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          
          <div class="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <!-- Avatar Upload Option -->
            <div class="group relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center border-2 border-white/40 shadow-lg cursor-pointer active:scale-95 transition"
                 (click)="fileInput.click()">
              
              <img *ngIf="u.profilePhoto" [src]="u.profilePhoto" alt="Profile" class="w-full h-full object-cover" />
              <div *ngIf="!u.profilePhoto" class="text-white text-4xl font-extrabold">
                {{ u.name ? u.name.charAt(0).toUpperCase() : 'F' }}
              </div>
              
              <!-- Hover Overlay -->
              <div class="absolute inset-0 bg-black/45 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200">
                <span class="material-icons text-white text-lg">photo_camera</span>
                <span class="text-[9px] text-white/90 font-bold uppercase tracking-wider mt-0.5">Upload</span>
              </div>

              <!-- Uploading state indicator -->
              <div *ngIf="uploadingPhoto()" class="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span class="material-icons text-white text-lg animate-spin">sync</span>
              </div>
            </div>
            
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" class="hidden" />
            
            <!-- Details -->
            <div class="flex-1 text-center md:text-left space-y-2">
              <div class="flex flex-col md:flex-row md:items-center gap-3">
                <h2 class="text-2xl font-black">{{ u.name }}</h2>
                <span class="px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-green-950 bg-green-200 rounded-full w-max mx-auto md:mx-0">
                  {{ u.role }}
                </span>
                <span *ngIf="u.verified" class="px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 rounded-full w-max mx-auto md:mx-0 flex items-center gap-0.5">
                  <span class="material-icons text-[10px]">verified</span> Verified Expert
                </span>
              </div>
              <p class="text-xs text-green-150 flex items-center justify-center md:justify-start gap-1 font-bold">
                <span class="material-icons text-sm">place</span>
                {{ u.village || 'Village' }}, {{ u.district || 'District' }}, {{ u.state || 'State' }}
              </p>
              <p class="text-white/80 text-xs max-w-xl italic font-semibold leading-relaxed">
                "{{ u.bio || 'No bio added yet. Tell us about your farming journey!' }}"
              </p>
              
              <!-- Stats Row -->
              <div class="flex justify-center md:justify-start gap-6 pt-2">
                <div class="text-center md:text-left">
                  <span class="block text-lg font-black text-green-200">{{ u.reputationScore ?? 0 }}</span>
                  <span class="text-[10px] uppercase font-bold text-white/60">Reputation Score</span>
                </div>
                <div class="text-center md:text-left border-l border-white/20 pl-6">
                  <span class="block text-lg font-black text-green-200">{{ u.preferredLanguage | uppercase }}</span>
                  <span class="text-[10px] uppercase font-bold text-white/60">Preferred Language</span>
                </div>
              </div>
            </div>

            <!-- Edit Action -->
            <button (click)="openEdit()" class="px-4 py-2 text-xs font-bold text-green-700 bg-white hover:bg-green-50 rounded-xl transition shadow-md active:scale-[0.98]">
              Edit Profile
            </button>
          </div>
        </div>
      }

      <!-- TABS SWITCHER -->
      <div class="flex p-1 bg-gray-150 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl max-w-lg">
        <button (click)="activeTab.set('info')"
                [class.bg-white]="activeTab() === 'info'"
                [class.dark:bg-gray-750]="activeTab() === 'info'"
                [class.shadow-sm]="activeTab() === 'info'"
                [class.text-green-600]="activeTab() === 'info'"
                [class.dark:text-green-400]="activeTab() === 'info'"
                [class.font-extrabold]="activeTab() === 'info'"
                [class.text-gray-500]="activeTab() !== 'info'"
                [class.dark:text-gray-400]="activeTab() !== 'info'"
                class="flex-1 py-3.5 text-xs font-semibold rounded-xl transition focus:outline-none flex items-center justify-center gap-1">
          <span class="material-icons text-sm">badge</span>
          Personal Info
        </button>
        <button (click)="activeTab.set('farmer')"
                [class.bg-white]="activeTab() === 'farmer'"
                [class.dark:bg-gray-750]="activeTab() === 'farmer'"
                [class.shadow-sm]="activeTab() === 'farmer'"
                [class.text-green-600]="activeTab() === 'farmer'"
                [class.dark:text-green-400]="activeTab() === 'farmer'"
                [class.font-extrabold]="activeTab() === 'farmer'"
                [class.text-gray-500]="activeTab() !== 'farmer'"
                [class.dark:text-gray-400]="activeTab() !== 'farmer'"
                class="flex-1 py-3.5 text-xs font-semibold rounded-xl transition focus:outline-none flex items-center justify-center gap-1">
          <span class="material-icons text-sm">agriculture</span>
          Farming Profile
        </button>
        <button (click)="activeTab.set('farms')"
                [class.bg-white]="activeTab() === 'farms'"
                [class.dark:bg-gray-750]="activeTab() === 'farms'"
                [class.shadow-sm]="activeTab() === 'farms'"
                [class.text-green-600]="activeTab() === 'farms'"
                [class.dark:text-green-400]="activeTab() === 'farms'"
                [class.font-extrabold]="activeTab() === 'farms'"
                [class.text-gray-500]="activeTab() !== 'farms'"
                [class.dark:text-gray-400]="activeTab() !== 'farms'"
                class="flex-1 py-3.5 text-xs font-semibold rounded-xl transition focus:outline-none flex items-center justify-center gap-1">
          <span class="material-icons text-sm">grid_view</span>
          My Lands & Farms
        </button>
        <button (click)="activeTab.set('badges')"
                [class.bg-white]="activeTab() === 'badges'"
                [class.dark:bg-gray-750]="activeTab() === 'badges'"
                [class.shadow-sm]="activeTab() === 'badges'"
                [class.text-green-600]="activeTab() === 'badges'"
                [class.dark:text-green-400]="activeTab() === 'badges'"
                [class.font-extrabold]="activeTab() === 'badges'"
                [class.text-gray-500]="activeTab() !== 'badges'"
                [class.dark:text-gray-400]="activeTab() !== 'badges'"
                class="flex-1 py-3.5 text-xs font-semibold rounded-xl transition focus:outline-none flex items-center justify-center gap-1">
          <span class="material-icons text-sm">military_tech</span>
          Badges
        </button>
      </div>

      <!-- TAB 1: PERSONAL INFO DETAILS -->
      <div *ngIf="activeTab() === 'info'" class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-slide-up space-y-6">
        <h3 class="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <span class="material-icons text-blue-500">contact_page</span>
          Personal & Login Information
        </h3>
        
        @if (user(); as u) {
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div class="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-750 rounded-2xl space-y-1">
              <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Full Name</span>
              <p class="font-black text-gray-900 dark:text-white text-sm">{{ u.name }}</p>
            </div>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-750 rounded-2xl space-y-1">
              <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">User Role</span>
              <p class="font-black text-gray-900 dark:text-white text-sm">{{ u.role }}</p>
            </div>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-750 rounded-2xl space-y-1">
              <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Email Address</span>
              <p class="font-black text-gray-900 dark:text-white text-sm">{{ u.email || 'No Email Added' }}</p>
            </div>
            
            <div class="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-750 rounded-2xl space-y-1">
              <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Phone Number</span>
              <p class="font-black text-gray-900 dark:text-white text-sm">{{ u.phone || 'No Phone Registered' }}</p>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-750 rounded-2xl space-y-1 sm:col-span-2">
              <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Registered Location Details</span>
              <p class="font-black text-gray-900 dark:text-white text-sm">
                🏡 {{ u.village || 'N/A' }} (Village), {{ u.district || 'N/A' }} (District), {{ u.state || 'N/A' }} (State)
              </p>
            </div>
          </div>
        }
      </div>

      <!-- TAB 2: FARMING PROFILE DETAILS -->
      <div *ngIf="activeTab() === 'farmer'" class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-slide-up space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span class="material-icons text-green-500">psychology</span>
            Farmer Profile & Agricultural Settings
          </h3>
          <button (click)="openEditFarmer()" class="px-4 py-2 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 font-bold rounded-xl text-xs active:scale-95 transition">
            Edit Agricultural Info
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div class="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-750 rounded-2xl space-y-1">
            <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Farming Experience</span>
            <p class="font-black text-gray-900 dark:text-white text-sm">{{ farmProfile()?.farmingExperience ?? 0 }} Years</p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-750 rounded-2xl space-y-1">
            <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Farming Type</span>
            <p class="font-black text-gray-900 dark:text-white text-sm">{{ farmProfile()?.farmingType || 'ORGANIC' }}</p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-750 rounded-2xl space-y-1">
            <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Primary Soil Type</span>
            <p class="font-black text-gray-900 dark:text-white text-sm">{{ farmProfile()?.soilType || 'Loamy' | titlecase }}</p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-750 rounded-2xl space-y-1">
            <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Primary Water Source</span>
            <p class="font-black text-gray-900 dark:text-white text-sm">{{ farmProfile()?.waterSource || 'Borewell' | titlecase }}</p>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-750 rounded-2xl space-y-1 sm:col-span-2">
            <span class="text-gray-400 font-bold uppercase tracking-wider text-[9px]">Current Harvest Crops</span>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span *ngFor="let crop of farmProfile()?.currentCrops" class="px-2.5 py-1 text-[10px] font-extrabold text-green-700 bg-green-100 dark:bg-green-950/45 dark:text-green-400 rounded-lg border border-green-200/40">
                🌱 {{ crop }}
              </span>
              <p *ngIf="!farmProfile()?.currentCrops?.length" class="text-gray-400 font-bold">No crops pinned yet</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: LANDS & FARMS -->
      <div *ngIf="activeTab() === 'farms'" class="animate-slide-up space-y-6">
        <div class="flex justify-between items-center">
          <h3 class="font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span class="material-icons text-green-500">grid_goldenratio</span>
            Registered Lands & Farms Registry
          </h3>
          <button (click)="openAddFarm()" class="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-xl text-xs active:scale-95 transition flex items-center gap-1 shadow-md shadow-green-500/10">
            <span class="material-icons text-sm">add</span> Register New Farm
          </button>
        </div>

        <div *ngIf="farms().length === 0" class="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm text-center">
          <span class="material-icons text-4xl text-gray-300 dark:text-gray-600">nature_people</span>
          <p class="text-xs text-gray-400 dark:text-gray-500 font-bold mt-2">No farms registered. Click 'Register New Farm' to get started!</p>
        </div>

        <div *ngIf="farms().length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div *ngFor="let farm of farms()" class="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-4">
            <div class="space-y-3">
              <div class="flex justify-between items-start gap-2">
                <div>
                  <h4 class="font-black text-gray-950 dark:text-white text-base">🚜 {{ farm.name }}</h4>
                  <p class="text-[9px] uppercase tracking-wider font-extrabold text-gray-400 mt-0.5">Soil Profile: {{ farm.soilType }} (pH {{ farm.soilPh }})</p>
                </div>
                
                <span class="px-2.5 py-1 text-[9px] font-black uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 rounded-lg">
                  {{ farm.farmingType }}
                </span>
              </div>

              <!-- Farm Metrics Grid -->
              <div class="grid grid-cols-2 gap-3 text-xs">
                <div class="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl space-y-0.5">
                  <span class="text-gray-400 text-[9px] uppercase font-bold">Acreage Area</span>
                  <p class="font-extrabold text-gray-900 dark:text-white">{{ farm.farmArea }} Acres</p>
                </div>
                <div class="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl space-y-0.5">
                  <span class="text-gray-400 text-[9px] uppercase font-bold">Water Source</span>
                  <p class="font-extrabold text-gray-900 dark:text-white">{{ farm.waterSource | titlecase }}</p>
                </div>
                
                <div class="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl space-y-0.5 col-span-2">
                  <span class="text-gray-400 text-[9px] uppercase font-bold">NPK Ratio (Nitrogen / Phos / Pot)</span>
                  <p class="font-extrabold text-gray-900 dark:text-white">🧪 N: {{ farm.nitrogen ?? 0 }}% | P: {{ farm.phosphorus ?? 0 }}% | K: {{ farm.potassium ?? 0 }}%</p>
                </div>
                
                <div *ngIf="farm.latitude && farm.longitude" class="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-xl space-y-0.5 col-span-2 font-mono text-[10px]">
                  <span class="text-gray-400 text-[9px] uppercase font-bold font-sans">Farm Coordinates</span>
                  <p class="text-gray-500 dark:text-gray-450">Lat: {{ farm.latitude }} | Lng: {{ farm.longitude }}</p>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-2 pt-3 border-t border-gray-150 dark:border-gray-700/50">
              <button (click)="openEditFarm(farm)" class="px-3.5 py-2 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold rounded-xl text-xs active:scale-95 transition flex items-center gap-1">
                <span class="material-icons text-sm">edit</span> Edit Farm
              </button>
              <button (click)="onDeleteFarm(farm.id)" class="px-3.5 py-2 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 font-bold rounded-xl text-xs active:scale-95 transition flex items-center gap-1">
                <span class="material-icons text-sm">delete</span> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: ACHIEVEMENTS & BADGES -->
      <div *ngIf="activeTab() === 'badges'" class="animate-slide-up space-y-4">
        <h3 class="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🏆 Achievements & Badges</span>
          <span class="text-xs font-semibold text-gray-450">({{ badges().length }} earned)</span>
        </h3>
        
        @if (badges().length) {
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (ub of badges(); track ub.id) {
              <div class="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-start gap-4">
                <div class="w-12 h-12 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  🏅
                </div>
                <div class="space-y-1">
                  <h4 class="font-extrabold text-gray-900 dark:text-white text-xs">{{ ub.badge?.name }}</h4>
                  <p class="text-[10px] text-gray-400 dark:text-gray-500 line-clamp-2 leading-relaxed">{{ ub.badge?.description }}</p>
                  <span class="inline-block text-[9px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-0.5 rounded-full mt-1">
                    {{ ub.badge?.badgeType || 'STANDARD' }}
                  </span>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-8 text-center text-gray-500 dark:text-gray-400">
            <span class="text-3xl block mb-2">⭐</span>
            <p class="text-xs font-bold">Complete tasks, use the marketplace, and verify expert status to earn badges!</p>
          </div>
        }
      </div>
    </div>

    <!-- MODAL 1: EDIT PERSONAL PROFILE INFO -->
    @if (showEditModal()) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-scale-up">
          <div class="p-6 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
            <h3 class="text-base font-black text-gray-900 dark:text-white">Edit Profile Details</h3>
            <button (click)="showEditModal.set(false)" class="text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 transition">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <form (ngSubmit)="saveProfile()" class="p-6 space-y-4 text-xs font-bold text-gray-500 dark:text-gray-400">
            <div>
              <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" [(ngModel)]="editForm.name" name="name" required class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" />
            </div>

            <div>
              <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Bio (Farming Journey)</label>
              <textarea [(ngModel)]="editForm.bio" name="bio" rows="3" class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition resize-none"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">State</label>
                <input type="text" [(ngModel)]="editForm.state" name="state" class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" />
              </div>
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">District</label>
                <input type="text" [(ngModel)]="editForm.district" name="district" class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Village</label>
                <input type="text" [(ngModel)]="editForm.village" name="village" class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" />
              </div>
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Language</label>
                <div class="relative">
                  <select [(ngModel)]="editForm.preferredLanguage" name="preferredLanguage" class="w-full border dark:border-gray-700 rounded-xl px-4.5 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition cursor-pointer appearance-none">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                  <span class="material-icons absolute right-3.5 top-3 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end gap-2.5">
              <button type="button" (click)="showEditModal.set(false)" class="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 font-extrabold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition">Cancel</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold shadow-md shadow-green-600/10 transition active:scale-[0.98]">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- MODAL 2: EDIT AGRICULTURAL INFO -->
    @if (showFarmerProfileModal()) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-scale-up">
          <div class="p-6 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
            <h3 class="text-base font-black text-gray-900 dark:text-white">Edit Agricultural Info</h3>
            <button (click)="showFarmerProfileModal.set(false)" class="text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 transition">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <form (ngSubmit)="saveFarmerProfile()" class="p-6 space-y-4 text-xs font-bold text-gray-500 dark:text-gray-400">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Farming Experience (Years)</label>
                <input type="number" min="0" [(ngModel)]="editFarmerForm.farmingExperience" name="farmingExperience" required class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" />
              </div>
              
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Farming Type</label>
                <div class="relative">
                  <select [(ngModel)]="editFarmerForm.farmingType" name="farmingType" class="w-full border dark:border-gray-700 rounded-xl px-4.5 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition cursor-pointer appearance-none">
                    <option value="ORGANIC">ORGANIC</option>
                    <option value="CHEMICAL">CHEMICAL</option>
                    <option value="MIXED">MIXED</option>
                  </select>
                  <span class="material-icons absolute right-3.5 top-3 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Soil Type</label>
                <input type="text" [(ngModel)]="editFarmerForm.soilType" name="soilType" required class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" placeholder="e.g. loamy, sandy, clay" />
              </div>
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Soil pH Level</label>
                <input type="number" step="0.1" min="0" max="14" [(ngModel)]="editFarmerForm.soilPh" name="soilPh" required class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" />
              </div>
            </div>

            <div>
              <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Primary Water Source</label>
              <input type="text" [(ngModel)]="editFarmerForm.waterSource" name="waterSource" required class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" placeholder="e.g. borewell, canal, rainwater" />
            </div>

            <div>
              <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Current Crops (Comma separated list)</label>
              <input type="text" [(ngModel)]="editFarmerForm.currentCrops" name="currentCrops" class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" placeholder="e.g. Cotton, Wheat, Mustard" />
              <p class="text-[9px] text-gray-400 mt-1">Separate crops with a comma. These are saved to your crop advisory settings.</p>
            </div>

            <div class="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end gap-2.5">
              <button type="button" (click)="showFarmerProfileModal.set(false)" class="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 font-extrabold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition">Cancel</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold shadow-md shadow-green-600/10 transition active:scale-[0.98]">Save Details</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- MODAL 3: ADD/EDIT LAND/FARM -->
    @if (showFarmModal()) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-scale-up">
          <div class="p-6 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
            <h3 class="text-base font-black text-gray-900 dark:text-white">{{ isAddingNewFarm() ? 'Register New Farm Land' : 'Edit Farm Land Details' }}</h3>
            <button (click)="showFarmModal.set(false)" class="text-gray-400 hover:text-gray-650 dark:hover:text-gray-200 transition">
              <span class="material-icons">close</span>
            </button>
          </div>
          
          <form (ngSubmit)="saveFarm()" class="p-6 space-y-4 text-xs font-bold text-gray-500 dark:text-gray-400">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Farm Name</label>
                <input type="text" [(ngModel)]="editFarmForm.name" name="name" required class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" placeholder="e.g. Muhana East Field" />
              </div>
              
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Size (Acres)</label>
                <input type="number" min="0.1" step="0.1" [(ngModel)]="editFarmForm.farmArea" name="farmArea" required class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Soil Type</label>
                <input type="text" [(ngModel)]="editFarmForm.soilType" name="soilType" required class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" placeholder="loamy" />
              </div>
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Soil pH</label>
                <input type="number" min="0" max="14" step="0.1" [(ngModel)]="editFarmForm.soilPh" name="soilPh" required class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" />
              </div>
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Farming Type</label>
                <select [(ngModel)]="editFarmForm.farmingType" name="farmingType" class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition cursor-pointer">
                  <option value="ORGANIC">ORGANIC</option>
                  <option value="CHEMICAL">CHEMICAL</option>
                  <option value="MIXED">MIXED</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Water Source</label>
                <input type="text" [(ngModel)]="editFarmForm.waterSource" name="waterSource" required class="w-full border dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" placeholder="borewell" />
              </div>
              <div>
                <label class="block text-[10px] font-extrabold uppercase tracking-wider mb-1.5">Coordinates (Latitude, Longitude)</label>
                <div class="flex gap-2">
                  <input type="number" step="0.0001" [(ngModel)]="editFarmForm.latitude" name="latitude" required class="w-1/2 border dark:border-gray-700 rounded-xl px-3 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" placeholder="Lat" />
                  <input type="number" step="0.0001" [(ngModel)]="editFarmForm.longitude" name="longitude" required class="w-1/2 border dark:border-gray-700 rounded-xl px-3 py-3 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" placeholder="Lng" />
                </div>
              </div>
            </div>

            <!-- NPK Inputs -->
            <div class="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-700/50 space-y-3">
              <span class="text-gray-400 text-[10px] uppercase font-extrabold tracking-wider">NPK Ratios (Nutrients percentage)</span>
              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="block text-[9px] font-bold text-gray-450 uppercase mb-1">Nitrogen (N)</label>
                  <input type="number" min="0" max="100" [(ngModel)]="editFarmForm.nitrogen" name="nitrogen" class="w-full border dark:border-gray-700 rounded-xl px-3 py-2 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" />
                </div>
                <div>
                  <label class="block text-[9px] font-bold text-gray-450 uppercase mb-1">Phosphorus (P)</label>
                  <input type="number" min="0" max="100" [(ngModel)]="editFarmForm.phosphorus" name="phosphorus" class="w-full border dark:border-gray-700 rounded-xl px-3 py-2 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" />
                </div>
                <div>
                  <label class="block text-[9px] font-bold text-gray-450 uppercase mb-1">Potassium (K)</label>
                  <input type="number" min="0" max="100" [(ngModel)]="editFarmForm.potassium" name="potassium" class="w-full border dark:border-gray-700 rounded-xl px-3 py-2 dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-green-500 transition" />
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-150 dark:border-gray-700 flex justify-end gap-2.5">
              <button type="button" (click)="showFarmModal.set(false)" class="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 font-extrabold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition">Cancel</button>
              <button type="submit" class="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold shadow-md shadow-green-600/10 transition active:scale-[0.98]">Save Farm</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  
  readonly user = signal<User | null>(null);
  readonly badges = signal<any[]>([]);
  readonly farms = signal<any[]>([]);
  readonly farmProfile = signal<any | null>(null);

  // Tab: 'info' | 'farmer' | 'farms' | 'badges'
  readonly activeTab = signal<'info' | 'farmer' | 'farms' | 'badges'>('info');

  // Modal controls
  readonly showEditModal = signal(false);
  readonly showFarmerProfileModal = signal(false);
  readonly showFarmModal = signal(false);
  readonly isAddingNewFarm = signal(false);

  // Loading indicator for photo uploads
  readonly uploadingPhoto = signal(false);

  // Profile forms
  editForm = {
    name: '',
    bio: '',
    state: '',
    district: '',
    village: '',
    preferredLanguage: 'en'
  };

  editFarmerForm = {
    farmingExperience: 0,
    farmingType: 'ORGANIC',
    soilType: 'loamy',
    soilPh: 7.0,
    waterSource: 'borewell',
    currentCrops: ''
  };

  // Farm land form
  editFarmForm = {
    id: 0,
    name: '',
    farmArea: 0,
    soilType: 'loamy',
    soilPh: 7.0,
    waterSource: 'borewell',
    farmingType: 'ORGANIC',
    nitrogen: 0,
    phosphorus: 0,
    potassium: 0,
    latitude: 26.8809,
    longitude: 75.7590
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (u) => {
        this.user.set(u);

        // Fetch user dashboard to load FarmerProfile details and farms list
        this.api.get<any>(`/api/dashboard/${u.id}`).subscribe({
          next: (res) => {
            this.farms.set(res.farms || []);
            this.farmProfile.set(res.farmProfile || null);
          },
          error: () => this.toastr.error('Failed to load farm profile statistics')
        });

        // Load achievements badges
        this.userService.getBadges().subscribe({
          next: (b) => this.badges.set(b)
        });
      },
      error: () => this.toastr.error('Failed to fetch user credentials')
    });
  }

  // Profile photo upload handler
  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.uploadingPhoto.set(true);
    this.userService.uploadFile(file).subscribe({
      next: (url) => {
        const u = this.user();
        if (u) {
          this.userService.updateProfilePhoto(u.id, url).subscribe({
            next: (updatedUser) => {
              this.user.set(updatedUser);
              this.auth.updateCurrentUser(updatedUser);
              this.uploadingPhoto.set(false);
              this.toastr.success('Profile photo updated successfully');
            },
            error: () => {
              this.uploadingPhoto.set(false);
              this.toastr.error('Failed to save profile photo url');
            }
          });
        }
      },
      error: (err) => {
        this.uploadingPhoto.set(false);
        this.toastr.error(err.message || 'Failed to upload photo to server');
      }
    });
  }

  openEdit(): void {
    const u = this.user();
    if (u) {
      this.editForm = {
        name: u.name || '',
        bio: u.bio || '',
        state: u.state || '',
        district: u.district || '',
        village: u.village || '',
        preferredLanguage: u.preferredLanguage || 'en'
      };
      this.showEditModal.set(true);
    }
  }

  saveProfile(): void {
    const cropsList = this.farmProfile()?.currentCrops || [];
    const payload = {
      ...this.editForm,
      currentCrops: cropsList
    };

    this.userService.updateProfile(payload).subscribe({
      next: (u) => {
        this.user.set(u);
        this.auth.updateCurrentUser(u);
        this.showEditModal.set(false);
        this.toastr.success('Personal profile details saved');
      },
      error: () => this.toastr.error('Failed to save profile changes')
    });
  }

  openEditFarmer(): void {
    const fp = this.farmProfile();
    this.editFarmerForm = {
      farmingExperience: fp?.farmingExperience ?? 0,
      farmingType: fp?.farmingType || 'ORGANIC',
      soilType: fp?.soilType || 'loamy',
      soilPh: fp?.soilPh ?? 7.0,
      waterSource: fp?.waterSource || 'borewell',
      currentCrops: fp?.currentCrops ? fp.currentCrops.join(', ') : ''
    };
    this.showFarmerProfileModal.set(true);
  }

  saveFarmerProfile(): void {
    const u = this.user();
    if (!u) return;

    const cropsArray = this.editFarmerForm.currentCrops
      ? this.editFarmerForm.currentCrops.split(',').map(c => c.trim()).filter(c => c.length > 0)
      : [];

    const payload = {
      farmingExperience: this.editFarmerForm.farmingExperience,
      farmingType: this.editFarmerForm.farmingType,
      soilType: this.editFarmerForm.soilType,
      soilPh: this.editFarmerForm.soilPh,
      waterSource: this.editFarmerForm.waterSource,
      currentCrops: cropsArray,
      user: {
        id: u.id
      }
    };

    // Update agricultural settings on backend
    this.api.put<any>(`/api/dashboard/farm-details/${u.id}`, payload).subscribe({
      next: (res) => {
        this.farmProfile.set(res);
        this.showFarmerProfileModal.set(false);
        this.toastr.success('Agricultural profile updated successfully');

        // Also update local crops list in User session
        const updatedUser = {
          ...u,
          currentCrops: cropsArray
        };
        this.user.set(updatedUser);
        this.auth.updateCurrentUser(updatedUser);
      },
      error: () => this.toastr.error('Failed to update agricultural settings')
    });
  }

  // Farm lands CRUD
  openAddFarm(): void {
    this.isAddingNewFarm.set(true);
    this.editFarmForm = {
      id: 0,
      name: '',
      farmArea: 2.5,
      soilType: 'loamy',
      soilPh: 7.0,
      waterSource: 'borewell',
      farmingType: 'ORGANIC',
      nitrogen: 45,
      phosphorus: 25,
      potassium: 30,
      latitude: 26.8809,
      longitude: 75.7590
    };
    this.showFarmModal.set(true);
  }

  openEditFarm(farm: any): void {
    this.isAddingNewFarm.set(false);
    this.editFarmForm = {
      id: farm.id,
      name: farm.name || '',
      farmArea: farm.farmArea || 0,
      soilType: farm.soilType || 'loamy',
      soilPh: farm.soilPh ?? 7.0,
      waterSource: farm.waterSource || 'borewell',
      farmingType: farm.farmingType || 'ORGANIC',
      nitrogen: farm.nitrogen ?? 0,
      phosphorus: farm.phosphorus ?? 0,
      potassium: farm.potassium ?? 0,
      latitude: farm.latitude ?? 26.8809,
      longitude: farm.longitude ?? 75.7590
    };
    this.showFarmModal.set(true);
  }

  saveFarm(): void {
    const u = this.user();
    if (!u) return;

    const isAdd = this.isAddingNewFarm();
    const payload = {
      name: this.editFarmForm.name,
      farmArea: this.editFarmForm.farmArea,
      soilType: this.editFarmForm.soilType,
      soilPh: this.editFarmForm.soilPh,
      waterSource: this.editFarmForm.waterSource,
      farmingType: this.editFarmForm.farmingType,
      nitrogen: this.editFarmForm.nitrogen,
      phosphorus: this.editFarmForm.phosphorus,
      potassium: this.editFarmForm.potassium,
      latitude: this.editFarmForm.latitude,
      longitude: this.editFarmForm.longitude
    };

    const request$ = isAdd
      ? this.api.post<any>(`/api/dashboard/farms/${u.id}`, payload)
      : this.api.put<any>(`/api/dashboard/farms/${u.id}/${this.editFarmForm.id}`, payload);

    request$.subscribe({
      next: () => {
        this.toastr.success(isAdd ? 'Farm registered successfully' : 'Farm land updated');
        this.showFarmModal.set(false);
        this.loadProfile();
      },
      error: (err) => this.toastr.error('Failed to save land: ' + (err.error?.message || err.message))
    });
  }

  onDeleteFarm(farmId: number): void {
    if (!confirm('Are you sure you want to remove this farm from your profile?')) return;

    const u = this.user();
    if (!u) return;

    this.api.delete<void>(`/api/dashboard/farms/${u.id}/${farmId}`).subscribe({
      next: () => {
        this.toastr.success('Farm land deleted');
        this.loadProfile();
      },
      error: () => this.toastr.error('Failed to remove farm land')
    });
  }
}
