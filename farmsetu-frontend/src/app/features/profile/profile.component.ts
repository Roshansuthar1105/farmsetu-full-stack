import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-profile',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, PageHeaderComponent],
  template: `
    <fs-page-header title="My Profile" subtitle="Manage your profile & view earned achievements" />

    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Profile Information Card -->
      @if (user(); as u) {
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-emerald-950/20 
                    border border-green-100 dark:border-emerald-900/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div class="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-40 h-40 bg-green-200/30 dark:bg-green-700/10 rounded-full blur-3xl"></div>
          
          <div class="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
            <!-- Avatar -->
            <div class="w-24 h-24 rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-green-500/20">
              {{ u.name ? u.name.charAt(0) : 'F' }}
            </div>
            
            <!-- Details -->
            <div class="flex-1 text-center md:text-left space-y-2">
              <div class="flex flex-col md:flex-row md:items-center gap-3">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ u.name }}</h2>
                <span class="px-3 py-1 text-xs font-semibold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 rounded-full w-max mx-auto md:mx-0">
                  {{ u.role }}
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                📍 {{ u.village || 'Village' }}, {{ u.district || 'District' }}, {{ u.state || 'State' }}
              </p>
              <p class="text-gray-600 dark:text-gray-300 text-sm max-w-xl italic">
                "{{ u.bio || 'No bio added yet. Tell us about your farming journey!' }}"
              </p>
              
              <!-- Stats Row -->
              <div class="flex justify-center md:justify-start gap-6 pt-2">
                <div class="text-center md:text-left">
                  <span class="block text-xl font-bold text-green-600 dark:text-green-400">{{ u.reputationScore ?? 0 }}</span>
                  <span class="text-xs text-gray-500">Reputation</span>
                </div>
                <div class="text-center md:text-left border-l border-gray-200 dark:border-gray-700 pl-6">
                  <span class="block text-xl font-bold text-green-600 dark:text-green-400">{{ u.preferredLanguage | uppercase }}</span>
                  <span class="text-xs text-gray-500">Language</span>
                </div>
              </div>
            </div>

            <!-- Edit Action -->
            <button (click)="openEdit()" class="md:absolute md:top-0 md:right-0 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition duration-200 shadow-md shadow-green-500/20 active:scale-[0.98]">
              Edit Profile
            </button>
          </div>
        </div>
      }

      <!-- Achievements / Badges Section -->
      <div class="space-y-4">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>🏆 Achievements & Badges</span>
          <span class="text-xs font-medium text-gray-400">({{ badges().length }} earned)</span>
        </h3>
        
        @if (badges().length) {
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (ub of badges(); track ub.id) {
              <div class="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-4 shadow-md hover:shadow-lg transition duration-300 flex items-start gap-4">
                <div class="w-12 h-12 bg-amber-50 dark:bg-amber-950/30 rounded-xl flex items-center justify-center text-2xl shrink-0">
                  🏅
                </div>
                <div class="space-y-1">
                  <h4 class="font-bold text-gray-900 dark:text-white text-sm">{{ ub.badge?.name }}</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{{ ub.badge?.description }}</p>
                  <span class="inline-block text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full mt-1">
                    {{ ub.badge?.badgeType || 'STANDARD' }}
                  </span>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 text-center text-gray-500 dark:text-gray-400">
            <span class="text-3xl block mb-2">⭐</span>
            <p class="text-sm">Complete challenges, sell products, or write posts to earn your first badge!</p>
          </div>
        }
      </div>
    </div>

    <!-- Edit Profile Modal -->
    @if (showEditModal()) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Edit Profile Details</h3>
            <button (click)="showEditModal.set(false)" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          
          <form (ngSubmit)="saveProfile()" class="p-6 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
              <input type="text" [(ngModel)]="editForm.name" name="name" required class="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Bio (Farming Journey)</label>
              <textarea [(ngModel)]="editForm.bio" name="bio" rows="3" class="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">State</label>
                <input type="text" [(ngModel)]="editForm.state" name="state" class="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">District</label>
                <input type="text" [(ngModel)]="editForm.district" name="district" class="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Village</label>
                <input type="text" [(ngModel)]="editForm.village" name="village" class="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Language</label>
                <select [(ngModel)]="editForm.preferredLanguage" name="preferredLanguage" class="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
              <button type="button" (click)="showEditModal.set(false)" class="px-5 py-3 rounded-xl border font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">Cancel</button>
              <button type="submit" class="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition shadow-md shadow-green-500/20 active:scale-[0.98]">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProfileComponent implements OnInit {
  private readonly userService = inject(UserService);
  
  readonly user = signal<User | null>(null);
  readonly badges = signal<any[]>([]);
  readonly showEditModal = signal(false);

  editForm = {
    name: '',
    bio: '',
    state: '',
    district: '',
    village: '',
    preferredLanguage: 'en'
  };

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (u) => {
        this.user.set(u);
        this.userService.getBadges().subscribe({
          next: (b) => this.badges.set(b)
        });
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
    this.userService.updateProfile(this.editForm).subscribe({
      next: (u) => {
        this.user.set(u);
        this.showEditModal.set(false);
      }
    });
  }
}
