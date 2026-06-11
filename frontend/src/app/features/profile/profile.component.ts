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
import {
  LucideUser,
  LucideMail,
  LucidePhone,
  LucideMapPin,
  LucideCalendar,
  LucideAward,
  LucideGrid,
  LucideSprout,
  LucideSliders,
  LucideTrash2,
  LucideEdit3,
  LucideCamera,
  LucideShieldCheck,
  LucideSettings,
  LucidePlus,
  LucideChevronRight,
  LucideActivity,
  LucideLanguages,
  LucideCompass,
  LucideDroplet,
  LucideBeaker,
  LucideX
} from '@lucide/angular';

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
  imports: [
    RouterLink,
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    LucideUser,
    LucideMail,
    LucidePhone,
    LucideMapPin,
    LucideCalendar,
    LucideAward,
    LucideGrid,
    LucideSprout,
    LucideSliders,
    LucideTrash2,
    LucideEdit3,
    LucideCamera,
    LucideShieldCheck,
    LucideSettings,
    LucidePlus,
    LucideChevronRight,
    LucideActivity,
    LucideLanguages,
    LucideCompass,
    LucideDroplet,
    LucideBeaker,
    LucideX
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
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
