import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MachineryService } from '../../core/services/machinery.service';
import { AuthService } from '../../core/services/auth.service';
import { Equipment, EquipmentBooking, EquipmentCategory } from '../../core/models/machinery.model';
import { EquipmentCardComponent } from './equipment-card/equipment-card.component';
import { BookingRequestModalComponent } from './booking-modal/booking-modal.component';
import { ListEquipmentFormComponent } from './list-equipment-form/list-equipment-form.component';

@Component({
  selector: 'fs-machinery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EquipmentCardComponent,
    BookingRequestModalComponent,
    ListEquipmentFormComponent
  ],
  template: `
    <div class="space-y-6 animate-slide-up pb-10">

      <!-- HEADER -->
      <div class="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 rounded-2xl shadow-lg
                  flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <!-- Decorative background elements -->
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        <div class="absolute right-16 -bottom-6 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>

        <div class="relative z-10">
          <h1 class="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
            <span class="material-icons text-white/90 text-3xl">agriculture</span>
            Machinery Rental
          </h1>
          <p class="text-sm text-teal-100 mt-1 max-w-xl leading-relaxed">
            Rent high-quality farming equipment from neighbors or list your own tractors, harvesters, and agricultural tools to earn extra income.
          </p>
        </div>

        <button (click)="toggleListForm()"
                class="relative z-10 px-5 py-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-xl
                       text-sm font-extrabold hover:bg-white/25 transition-all duration-200 active:scale-[0.97]
                       flex items-center gap-2 self-start md:self-auto shadow-lg">
          <span class="material-icons text-lg">{{ showListForm() ? 'close' : 'add_circle' }}</span>
          {{ showListForm() ? 'Close Form' : 'List My Equipment' }}
        </button>
      </div>

      <!-- COLLAPSIBLE LIST / EDIT FORM -->
      <fs-list-equipment-form *ngIf="showListForm()"
                               [equipmentToEdit]="editingEquipment"
                               (onSave)="onEquipmentSaved($event)"
                               (onCancel)="closeListForm()">
      </fs-list-equipment-form>

      <!-- TAB SWITCHER -->
      <div class="flex p-1 bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl overflow-x-auto">
        <button (click)="onTabChange('nearby')"
                [class]="activeTab() === 'nearby'
                  ? 'bg-slate-800 shadow-sm text-green-400 font-extrabold'
                  : 'text-slate-400 font-semibold'"
                class="flex-1 py-3 px-4 text-xs rounded-xl transition duration-200 focus:outline-none flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span class="material-icons text-sm">explore</span>
          Nearby Equipment
        </button>
        <button (click)="onTabChange('my-listings')"
                [class]="activeTab() === 'my-listings'
                  ? 'bg-slate-800 shadow-sm text-green-400 font-extrabold'
                  : 'text-slate-400 font-semibold'"
                class="flex-1 py-3 px-4 text-xs rounded-xl transition duration-200 focus:outline-none flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span class="material-icons text-sm">inventory_2</span>
          My Listings
          <span *ngIf="myListings().length > 0"
                class="ml-1 bg-emerald-950/40 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-emerald-800/30">
            {{ myListings().length }}
          </span>
        </button>
        <button (click)="onTabChange('my-bookings')"
                [class]="activeTab() === 'my-bookings'
                  ? 'bg-slate-800 shadow-sm text-green-400 font-extrabold'
                  : 'text-slate-400 font-semibold'"
                class="flex-1 py-3 px-4 text-xs rounded-xl transition duration-200 focus:outline-none flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span class="material-icons text-sm">event_available</span>
          My Bookings
        </button>
        <button (click)="onTabChange('incoming')"
                [class]="activeTab() === 'incoming'
                  ? 'bg-slate-800 shadow-sm text-green-400 font-extrabold'
                  : 'text-slate-400 font-semibold'"
                class="flex-1 py-3 px-4 text-xs rounded-xl transition duration-200 focus:outline-none flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span class="material-icons text-sm">pending_actions</span>
          Incoming Requests
          <span *ngIf="pendingIncomingCount() > 0"
                class="ml-1 bg-rose-950/50 text-rose-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-rose-800/30 animate-pulse">
            {{ pendingIncomingCount() }}
          </span>
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

      <!-- ═══ TAB: NEARBY EQUIPMENT ═══ -->
      <div *ngIf="activeTab() === 'nearby'" class="space-y-5 animate-slide-up">
        
        <!-- Filters (Category Pills & Radius) -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/60 p-4 rounded-2xl">
          <!-- Category Pills -->
          <div class="flex flex-wrap gap-2">
            <button *ngFor="let cat of categories"
                    (click)="onCategoryChange(cat.value)"
                    [class]="categoryFilter() === cat.value
                      ? 'bg-green-600 text-white font-extrabold shadow-md shadow-green-950/20 border-green-600'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white font-semibold'"
                    class="px-4 py-2 text-xs rounded-xl border transition duration-200 active:scale-[0.97] flex items-center gap-1">
              <span class="material-icons text-sm" *ngIf="cat.icon">{{ cat.icon }}</span>
              {{ cat.label }}
            </button>
          </div>

          <!-- Radius Search -->
          <div class="flex items-center gap-3 shrink-0">
            <label class="text-xs text-slate-400 font-bold whitespace-nowrap">Within Radius:</label>
            <div class="relative">
              <select [(ngModel)]="radiusFilter" 
                      (change)="loadNearbyEquipment()"
                      class="bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-8 py-2 text-xs font-bold text-white
                             focus:border-green-500 focus:ring-1 focus:ring-green-500/30 outline-none transition appearance-none">
                <option [value]="5">5 km</option>
                <option [value]="10">10 km</option>
                <option [value]="20">20 km</option>
                <option [value]="50">50 km</option>
                <option [value]="100">100 km</option>
              </select>
              <span class="material-icons absolute right-2.5 top-2 text-slate-500 text-sm pointer-events-none">expand_more</span>
            </div>
            <button (click)="loadNearbyEquipment()" 
                    class="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-800 transition active:scale-[0.97]"
                    title="Refresh list">
              <span class="material-icons text-sm">refresh</span>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading()" class="text-center py-16">
          <span class="material-icons text-4xl text-slate-600 animate-spin">hourglass_top</span>
          <p class="text-xs text-slate-500 mt-2 font-bold">Finding nearby machinery...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && nearbyEquipment().length === 0" class="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <span class="material-icons text-5xl text-slate-700">agriculture</span>
          <p class="text-sm text-slate-500 mt-3 font-bold">No active machinery listed nearby</p>
          <p class="text-[11px] text-slate-600 mt-1">Try expanding the search radius or check back later</p>
        </div>

        <!-- Equipment Grid -->
        <div *ngIf="!loading() && nearbyEquipment().length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <fs-equipment-card *ngFor="let eq of nearbyEquipment(); trackBy: trackById"
                             [equipment]="eq"
                             [showManage]="false"
                             (onBook)="openBookingModal($event)">
          </fs-equipment-card>
        </div>
      </div>

      <!-- ═══ TAB: MY LISTINGS ═══ -->
      <div *ngIf="activeTab() === 'my-listings'" class="space-y-5 animate-slide-up">
        
        <!-- Loading -->
        <div *ngIf="loading()" class="text-center py-16">
          <span class="material-icons text-4xl text-slate-600 animate-spin">hourglass_top</span>
          <p class="text-xs text-slate-500 mt-2 font-bold">Loading your machinery listings...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && myListings().length === 0" class="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <span class="material-icons text-5xl text-slate-700">post_add</span>
          <p class="text-sm text-slate-500 mt-3 font-bold">You haven't listed any equipment yet</p>
          <p class="text-[11px] text-slate-600 mt-1">Click "List My Equipment" to start renting out your tractors or tools</p>
        </div>

        <!-- Equipment Grid -->
        <div *ngIf="!loading() && myListings().length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <fs-equipment-card *ngFor="let eq of myListings(); trackBy: trackById"
                             [equipment]="eq"
                             [showManage]="true"
                             (onToggle)="onToggleActive($event)"
                             (onEdit)="startEditEquipment($event)">
          </fs-equipment-card>
        </div>
      </div>

      <!-- ═══ TAB: MY BOOKINGS (RENTER VIEW) ═══ -->
      <div *ngIf="activeTab() === 'my-bookings'" class="space-y-4 animate-slide-up">
        
        <!-- Loading -->
        <div *ngIf="loading()" class="text-center py-16">
          <span class="material-icons text-4xl text-slate-600 animate-spin">hourglass_top</span>
          <p class="text-xs text-slate-500 mt-2 font-bold">Loading your bookings...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && myBookings().length === 0" class="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <span class="material-icons text-5xl text-slate-700">event_busy</span>
          <p class="text-sm text-slate-500 mt-3 font-bold">No equipment rented yet</p>
          <p class="text-[11px] text-slate-600 mt-1">Browse nearby machinery and submit a booking request</p>
        </div>

        <!-- Rented Bookings List -->
        <div *ngIf="!loading() && myBookings().length > 0" class="grid grid-cols-1 gap-4">
          <div *ngFor="let booking of myBookings(); trackBy: trackById"
               class="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-700 transition duration-200">
            <div class="space-y-1 max-w-md">
              <div class="flex items-center gap-2">
                <span class="material-icons text-lg text-emerald-400">{{ getCategoryIcon(booking.equipmentCategory) }}</span>
                <h4 class="text-sm font-extrabold text-white">{{ booking.equipmentName }}</h4>
                <span class="bg-slate-800 border border-slate-700 text-[9px] font-black text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {{ booking.equipmentCategory }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                <span class="material-icons text-xs">calendar_today</span>
                {{ formatDateTime(booking.startTime) }} — {{ formatDateTime(booking.endTime) }}
              </p>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-bold">
                <span class="flex items-center gap-0.5">
                  <span class="material-icons text-xs">person</span>
                  Owner: {{ booking.ownerName }}
                </span>
                <span *ngIf="booking.ownerPhone" class="flex items-center gap-0.5">
                  <span class="material-icons text-xs">phone</span>
                  {{ booking.ownerPhone }}
                </span>
              </div>
              <p *ngIf="booking.notes" class="text-[11px] text-slate-500 italic font-semibold mt-1">
                Note: "{{ booking.notes }}"
              </p>
            </div>

            <!-- Cost & Status -->
            <div class="flex items-center justify-between md:justify-end gap-5 w-full md:w-auto border-t md:border-t-0 border-slate-800/60 pt-3 md:pt-0">
              <div class="text-left md:text-right">
                <p class="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-0.5">Cost</p>
                <p class="text-sm font-black text-emerald-400">₹{{ booking.totalCost }}</p>
              </div>

              <span [class]="getBookingStatusBadge(booking.status)"
                    class="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-sm">
                <span class="material-icons text-xs">{{ getBookingStatusIcon(booking.status) }}</span>
                {{ booking.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ TAB: INCOMING REQUESTS (OWNER VIEW) ═══ -->
      <div *ngIf="activeTab() === 'incoming'" class="space-y-4 animate-slide-up">
        
        <!-- Loading -->
        <div *ngIf="loading()" class="text-center py-16">
          <span class="material-icons text-4xl text-slate-600 animate-spin">hourglass_top</span>
          <p class="text-xs text-slate-500 mt-2 font-bold">Loading rental requests...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading() && incomingRequests().length === 0" class="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <span class="material-icons text-5xl text-slate-700">pending_actions</span>
          <p class="text-sm text-slate-500 mt-3 font-bold">No rental requests received yet</p>
          <p class="text-[11px] text-slate-600 mt-1">Requests for your listed machinery will appear here</p>
        </div>

        <!-- Incoming Requests List -->
        <div *ngIf="!loading() && incomingRequests().length > 0" class="grid grid-cols-1 gap-4">
          <div *ngFor="let request of incomingRequests(); trackBy: trackById"
               class="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-slate-700 transition duration-200">
            
            <div class="space-y-1 max-w-xl">
              <div class="flex items-center gap-2">
                <span class="material-icons text-lg text-emerald-400">{{ getCategoryIcon(request.equipmentCategory) }}</span>
                <h4 class="text-sm font-extrabold text-white">{{ request.equipmentName }}</h4>
                <span class="bg-slate-800 border border-slate-700 text-[9px] font-black text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {{ request.equipmentCategory }}
                </span>
              </div>
              <p class="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                <span class="material-icons text-xs">calendar_today</span>
                {{ formatDateTime(request.startTime) }} — {{ formatDateTime(request.endTime) }}
              </p>
              <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500 font-bold">
                <span class="flex items-center gap-0.5">
                  <span class="material-icons text-xs">person</span>
                  Renter: {{ request.renterName }}
                </span>
                <span *ngIf="request.renterPhone" class="flex items-center gap-0.5">
                  <span class="material-icons text-xs">phone</span>
                  {{ request.renterPhone }}
                </span>
              </div>
              <p *ngIf="request.notes" class="text-[11px] text-slate-500 italic font-semibold mt-1">
                Notes: "{{ request.notes }}"
              </p>
            </div>

            <!-- Cost & Actions / Status -->
            <div class="flex items-center justify-between lg:justify-end gap-5 w-full lg:w-auto border-t lg:border-t-0 border-slate-800/60 pt-3 lg:pt-0">
              <div class="text-left lg:text-right shrink-0">
                <p class="text-[9px] text-slate-500 font-black uppercase tracking-wider mb-0.5">Total Income</p>
                <p class="text-sm font-black text-emerald-400">₹{{ request.totalCost }}</p>
              </div>

              <!-- Pending Approvals -->
              <div *ngIf="request.status === 'PENDING'" class="flex gap-2 shrink-0">
                <button (click)="onRejectBooking(request.id)"
                        class="px-3 py-2 bg-red-950/30 border border-red-900/30 hover:bg-red-950/50 text-red-400 rounded-xl transition active:scale-[0.97]"
                        title="Reject request">
                  <span class="material-icons text-sm">close</span>
                </button>
                <button (click)="onApproveBooking(request.id)"
                        class="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition active:scale-[0.97] flex items-center gap-1">
                  <span class="material-icons text-sm">check</span>
                  Approve
                </button>
              </div>

              <!-- Approved -> Complete -->
              <div *ngIf="request.status === 'APPROVED'" class="shrink-0">
                <button (click)="onCompleteBooking(request.id)"
                        class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg transition active:scale-[0.97] flex items-center gap-1.5">
                  <span class="material-icons text-sm">task_alt</span>
                  Mark Completed
                </button>
              </div>

              <!-- Final Status (REJECTED/COMPLETED) -->
              <span *ngIf="request.status !== 'PENDING' && request.status !== 'APPROVED'" 
                    [class]="getBookingStatusBadge(request.status)"
                    class="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shrink-0 border">
                <span class="material-icons text-xs">{{ getBookingStatusIcon(request.status) }}</span>
                {{ request.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- BOOKING REQUEST MODAL -->
    <fs-booking-modal *ngIf="selectedEquipmentForBooking"
                       [equipment]="selectedEquipmentForBooking"
                       (onClose)="closeBookingModal()"
                       (onBookingSuccess)="onBookingRequested($event)">
    </fs-booking-modal>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MachineryDashboardComponent implements OnInit {
  private readonly machineryService = inject(MachineryService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // Tab and loading state
  readonly activeTab = signal<'nearby' | 'my-listings' | 'my-bookings' | 'incoming'>('nearby');
  readonly loading = signal(false);
  readonly showListForm = signal(false);

  // Lists
  readonly nearbyEquipment = signal<Equipment[]>([]);
  readonly myListings = signal<Equipment[]>([]);
  readonly myBookings = signal<EquipmentBooking[]>([]);
  readonly incomingRequests = signal<EquipmentBooking[]>([]);

  // Count helper
  readonly pendingIncomingCount = signal(0);

  // Filtering
  readonly categoryFilter = signal<string>('ALL');
  radiusFilter = 20; // Default 20km

  // Forms / Modals
  editingEquipment: Equipment | null = null;
  selectedEquipmentForBooking: Equipment | null = null;

  // Feedback notifications
  readonly successMsg = signal<string | null>(null);
  readonly errorMsg = signal<string | null>(null);

  readonly categories = [
    { label: 'All', value: 'ALL', icon: '' },
    { label: 'Tractor', value: 'TRACTOR', icon: 'agriculture' },
    { label: 'Drone', value: 'DRONE', icon: 'flight_takeoff' },
    { label: 'Harvester', value: 'HARVESTER', icon: 'grain' },
    { label: 'Implement', value: 'IMPLEMENT', icon: 'plumbing' }
  ];

  ngOnInit(): void {
    this.loadNearbyEquipment();
    this.preloadCountsAndIncoming();
  }

  // ─── Data Loading ────────────────────────────────────────────────────

  loadNearbyEquipment(): void {
    this.loading.set(true);
    
    const getNearby = (lat?: number, lng?: number) => {
      this.machineryService.getNearbyEquipment(lat, lng, this.radiusFilter, this.categoryFilter()).subscribe({
        next: (eq) => {
          // Filter out owner's own equipment from the discover list
          const userId = this.auth.currentUser()?.id;
          this.nearbyEquipment.set(eq.filter(item => item.ownerId !== userId));
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.errorMsg.set('Failed to load nearby machinery listings.');
        }
      });
    };

    const user = this.auth.currentUser();
    if (user?.latitude && user?.longitude) {
      getNearby(user.latitude, user.longitude);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => getNearby(pos.coords.latitude, pos.coords.longitude),
        () => getNearby(undefined, undefined)
      );
    } else {
      getNearby(undefined, undefined);
    }
  }

  loadMyListings(): void {
    this.loading.set(true);
    this.machineryService.getMyEquipment().subscribe({
      next: (eq) => {
        this.myListings.set(eq);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Failed to load your listed equipment.');
      }
    });
  }

  loadMyBookings(): void {
    this.loading.set(true);
    this.machineryService.getMyBookings().subscribe({
      next: (bookings) => {
        this.myBookings.set(bookings);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Failed to load your rentals/bookings.');
      }
    });
  }

  loadIncomingRequests(): void {
    this.loading.set(true);
    this.machineryService.getIncomingRequests().subscribe({
      next: (requests) => {
        this.incomingRequests.set(requests);
        this.pendingIncomingCount.set(requests.filter(r => r.status === 'PENDING').length);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMsg.set('Failed to load incoming rental requests.');
      }
    });
  }

  private preloadCountsAndIncoming(): void {
    // Silently pre-load incoming count for badge notification
    this.machineryService.getIncomingRequests().subscribe({
      next: (requests) => {
        this.pendingIncomingCount.set(requests.filter(r => r.status === 'PENDING').length);
      }
    });
  }

  // ─── Interactive Events ──────────────────────────────────────────────

  onTabChange(tab: 'nearby' | 'my-listings' | 'my-bookings' | 'incoming'): void {
    this.activeTab.set(tab);
    this.successMsg.set(null);
    this.errorMsg.set(null);
    this.closeListForm();

    if (tab === 'nearby') this.loadNearbyEquipment();
    else if (tab === 'my-listings') this.loadMyListings();
    else if (tab === 'my-bookings') this.loadMyBookings();
    else if (tab === 'incoming') this.loadIncomingRequests();
  }

  onCategoryChange(category: string): void {
    this.categoryFilter.set(category);
    this.loadNearbyEquipment();
  }

  // ─── Listing Forms / Controls ─────────────────────────────────────────

  toggleListForm(): void {
    if (this.showListForm()) {
      this.closeListForm();
    } else {
      this.editingEquipment = null;
      this.showListForm.set(true);
    }
  }

  closeListForm(): void {
    this.showListForm.set(false);
    this.editingEquipment = null;
  }

  startEditEquipment(eq: Equipment): void {
    this.editingEquipment = eq;
    this.showListForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onEquipmentSaved(equipment: Equipment): void {
    this.closeListForm();
    this.successMsg.set(
      this.editingEquipment 
        ? 'Machinery listing updated successfully!'
        : 'Machinery listing created successfully! Nearby farmers can now find it.'
    );
    this.loadMyListings();
    this.loadNearbyEquipment();
  }

  onToggleActive(equipmentId: number): void {
    this.successMsg.set(null);
    this.errorMsg.set(null);
    this.machineryService.toggleActive(equipmentId).subscribe({
      next: (updated) => {
        this.successMsg.set(
          updated.isActive 
            ? 'Machinery listing activated and visible to renters.' 
            : 'Machinery listing deactivated.'
        );
        this.loadMyListings();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to update active status.');
      }
    });
  }

  // ─── Booking Request Modal ───────────────────────────────────────────

  openBookingModal(equipment: Equipment): void {
    this.selectedEquipmentForBooking = equipment;
  }

  closeBookingModal(): void {
    this.selectedEquipmentForBooking = null;
  }

  onBookingRequested(booking: EquipmentBooking): void {
    this.closeBookingModal();
    this.successMsg.set('Rental booking request submitted! The owner will verify and approve.');
    this.loadNearbyEquipment();
  }

  // ─── Incoming Booking Approvals ──────────────────────────────────────

  onApproveBooking(bookingId: number): void {
    this.successMsg.set(null);
    this.errorMsg.set(null);
    this.machineryService.approveBooking(bookingId).subscribe({
      next: () => {
        this.successMsg.set('Booking request approved!');
        this.loadIncomingRequests();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to approve booking request.');
      }
    });
  }

  onRejectBooking(bookingId: number): void {
    this.successMsg.set(null);
    this.errorMsg.set(null);
    this.machineryService.rejectBooking(bookingId).subscribe({
      next: () => {
        this.successMsg.set('Booking request rejected.');
        this.loadIncomingRequests();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to reject booking.');
      }
    });
  }

  onCompleteBooking(bookingId: number): void {
    this.successMsg.set(null);
    this.errorMsg.set(null);
    this.machineryService.completeBooking(bookingId).subscribe({
      next: () => {
        this.successMsg.set('Rental booking marked as completed.');
        this.loadIncomingRequests();
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Failed to complete booking.');
      }
    });
  }

  // ─── Utility Formatters ─────────────────────────────────────────────

  trackById(_: number, item: any): number {
    return item.id;
  }

  formatDateTime(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      };
      return date.toLocaleDateString('en-IN', options);
    } catch {
      return dateStr;
    }
  }

  getBookingStatusBadge(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-blue-950/40 text-blue-400 border border-blue-800/40';
      case 'APPROVED':
        return 'bg-green-950/40 text-green-400 border border-green-800/40';
      case 'REJECTED':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
      case 'COMPLETED':
        return 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/50';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  }

  getBookingStatusIcon(status: string): string {
    switch (status) {
      case 'PENDING': return 'schedule';
      case 'APPROVED': return 'check_circle';
      case 'REJECTED': return 'cancel';
      case 'COMPLETED': return 'task_alt';
      default: return 'help';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'TRACTOR': return 'agriculture';
      case 'DRONE': return 'flight_takeoff';
      case 'HARVESTER': return 'grain';
      case 'IMPLEMENT': return 'plumbing';
      default: return 'build';
    }
  }
}
