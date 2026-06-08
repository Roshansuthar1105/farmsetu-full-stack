import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { ToastrService } from 'ngx-toastr';
import * as L from 'leaflet';

interface FarmData {
  id?: number;
  name?: string;
  farmArea?: number;
  calculatedArea?: number;
  soilType?: string;
  soilPh?: number;
  waterSource?: string;
  farmingType?: string;
  farmBoundary?: string;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  waterLevel?: number;
  latitude?: number;
  longitude?: number;
}

interface FarmerProfileData {
  id?: number;
  farmingExperience?: number;
  currentCrops?: string[];
  user?: {
    name?: string;
    email?: string;
    bio?: string;
  };
}

interface DashboardResponse {
  farmProfile: FarmerProfileData;
  activeCalendars: any[];
  recentNotifications: any[];
  farms: FarmData[];
}

@Component({
  selector: 'fs-farm-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingSkeletonComponent, RouterLink],
  templateUrl: './farm-dashboard.component.html',
  styleUrl: './farm-dashboard.component.scss'
})
export class FarmDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  readonly loading = signal(true);
  readonly dashboardData = signal<DashboardResponse | null>(null);
  
  // Multi-Farm state signals
  readonly farms = signal<FarmData[]>([]);
  readonly selectedFarm = signal<FarmData | null>(null);
  readonly isEditModalOpen = signal(false);
  readonly isAddingNewFarm = signal(false);

  // Form Group
  editForm!: FormGroup;

  // Leaflet Maps
  private mainMap: L.Map | null = null;
  private modalMap: L.Map | null = null;

  private mainPolygon: L.Polygon | null = null;
  private mainMarker: L.Marker | null = null;

  private modalPolygon: L.Polygon | null = null;
  private modalMarker: L.Marker | null = null;
  modalDrawnPoints: L.LatLng[] = [];
  private modalPolyline: L.Polyline | null = null;

  // Map drawing state
  isDrawingMode = false;

  constructor() {
    this.initLeafletIcons();
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.initForm();
  }

  private initLeafletIcons(): void {
    const defaultIcon = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = defaultIcon;
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    const userId = this.auth.currentUser()?.id ?? 1;

    this.api.get<DashboardResponse>(`/api/dashboard/${userId}`).subscribe({
      next: (res) => {
        this.dashboardData.set(res);
        
        const currentFarms = res.farms || [];
        this.farms.set(currentFarms);

        // Retain previous selection or default to first
        const previouslySelected = this.selectedFarm();
        const updatedSelected = previouslySelected ? currentFarms.find(f => f.id === previouslySelected.id) : null;
        this.selectedFarm.set(updatedSelected || (currentFarms.length > 0 ? currentFarms[0] : null));

        this.loading.set(false);

        // Wait for DOM to render map element
        setTimeout(() => {
          this.initMainMap();
        }, 100);
      },
      error: (err) => {
        this.toastr.error('Failed to load dashboard details', 'Error');
        this.loading.set(false);
      }
    });
  }

  private initForm(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      farmArea: [null, [Validators.required, Validators.min(0.1)]],
      calculatedArea: [null],
      soilType: ['loamy'],
      soilPh: [null, [Validators.min(0), Validators.max(14)]],
      waterSource: ['borewell'],
      farmingExperience: [null, [Validators.min(0)]],
      farmingType: ['ORGANIC'],
      nitrogen: [null, [Validators.min(0)]],
      phosphorus: [null, [Validators.min(0)]],
      potassium: [null, [Validators.min(0)]],
      temperature: [null],
      humidity: [null, [Validators.min(0), Validators.max(100)]],
      rainfall: [null, [Validators.min(0)]],
      waterLevel: [null, [Validators.min(0)]],
      latitude: [null],
      longitude: [null],
      farmBoundary: ['']
    });
  }

  selectFarm(farm: FarmData): void {
    this.selectedFarm.set(farm);
    setTimeout(() => {
      this.initMainMap();
    }, 100);
  }

  private initMainMap(): void {
    const farm = this.selectedFarm();
    if (this.mainMap) {
      this.mainMap.remove();
      this.mainMap = null;
    }

    if (!farm) return;

    const lat = farm.latitude ?? 20.5937;
    const lng = farm.longitude ?? 78.9629;
    const hasLocation = !!farm.latitude && !!farm.longitude;

    // Initialize map
    this.mainMap = L.map('mainMap').setView([lat, lng], hasLocation ? 14 : 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mainMap);

    // Render location marker
    if (hasLocation) {
      this.mainMarker = L.marker([lat, lng])
        .addTo(this.mainMap)
        .bindPopup(`<b>${farm.name || 'Farm Center'}</b>`)
        .openPopup();
    }

    // Render boundary polygon
    if (farm.farmBoundary) {
      try {
        const coords = JSON.parse(farm.farmBoundary);
        if (Array.isArray(coords) && coords.length > 0) {
          this.mainPolygon = L.polygon(coords, {
            color: '#16a34a',
            fillColor: '#22c55e',
            fillOpacity: 0.35,
            weight: 3
          }).addTo(this.mainMap);

          // Focus map on boundary
          this.mainMap.fitBounds(this.mainPolygon.getBounds());
        }
      } catch (e) {
        console.error('Failed to parse farm boundary coordinates', e);
      }
    }
  }

  openCreateModal(): void {
    this.isAddingNewFarm.set(true);

    this.editForm.reset({
      name: '',
      farmArea: null,
      calculatedArea: null,
      soilType: 'loamy',
      soilPh: null,
      waterSource: 'borewell',
      farmingExperience: this.farmProfile?.farmingExperience || 0,
      farmingType: 'ORGANIC',
      nitrogen: null,
      phosphorus: null,
      potassium: null,
      temperature: null,
      humidity: null,
      rainfall: null,
      waterLevel: null,
      latitude: 20.5937,
      longitude: 78.9629,
      farmBoundary: ''
    });

    this.isEditModalOpen.set(true);

    setTimeout(() => {
      this.initModalMap();
    }, 150);
  }

  openEditModal(): void {
    const farm = this.selectedFarm();
    if (!farm) return;

    this.isAddingNewFarm.set(false);

    this.editForm.patchValue({
      name: farm.name || 'Primary Farm',
      farmArea: farm.farmArea,
      calculatedArea: farm.calculatedArea,
      soilType: farm.soilType || 'loamy',
      soilPh: farm.soilPh,
      waterSource: farm.waterSource || 'borewell',
      farmingExperience: this.farmProfile?.farmingExperience || 0,
      farmingType: farm.farmingType || 'ORGANIC',
      nitrogen: farm.nitrogen,
      phosphorus: farm.phosphorus,
      potassium: farm.potassium,
      temperature: farm.temperature,
      humidity: farm.humidity,
      rainfall: farm.rainfall,
      waterLevel: farm.waterLevel,
      latitude: farm.latitude,
      longitude: farm.longitude,
      farmBoundary: farm.farmBoundary || ''
    });

    this.isEditModalOpen.set(true);

    setTimeout(() => {
      this.initModalMap();
    }, 150);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
    this.isDrawingMode = false;
    this.modalDrawnPoints = [];
    if (this.modalMap) {
      this.modalMap.remove();
      this.modalMap = null;
    }
  }

  private initModalMap(): void {
    const latVal = this.editForm.get('latitude')?.value ?? 20.5937;
    const lngVal = this.editForm.get('longitude')?.value ?? 78.9629;
    const hasLocation = !!this.editForm.get('latitude')?.value && !!this.editForm.get('longitude')?.value;

    this.modalMap = L.map('modalMap').setView([latVal, lngVal], hasLocation ? 14 : 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.modalMap);

    // Setup marker
    this.modalMarker = L.marker([latVal, lngVal], { draggable: true })
      .addTo(this.modalMap)
      .bindPopup('<b>Drag to locate farm center</b>')
      .openPopup();

    this.modalMarker.on('dragend', (e: any) => {
      const position = e.target.getLatLng();
      this.editForm.patchValue({
        latitude: Number(position.lat.toFixed(6)),
        longitude: Number(position.lng.toFixed(6))
      });
    });

    // Handle clicks for drawing boundary
    this.modalMap.on('click', (e: L.LeafletMouseEvent) => {
      if (!this.isDrawingMode) {
        // If not in drawing mode, clicking just moves the marker
        const latlng = e.latlng;
        if (this.modalMarker) {
          this.modalMarker.setLatLng(latlng);
          this.editForm.patchValue({
            latitude: Number(latlng.lat.toFixed(6)),
            longitude: Number(latlng.lng.toFixed(6))
          });
        }
        return;
      }

      // If drawing boundary
      const point = e.latlng;
      this.modalDrawnPoints.push(point);
      this.drawModalLines();
    });

    // Render existing boundary if present
    const boundaryStr = this.editForm.get('farmBoundary')?.value;
    if (boundaryStr) {
      try {
        const coords = JSON.parse(boundaryStr);
        if (Array.isArray(coords) && coords.length > 0) {
          this.modalDrawnPoints = coords.map((c: any) => L.latLng(c[0], c[1]));
          
          this.modalPolygon = L.polygon(coords, {
            color: '#16a34a',
            fillColor: '#22c55e',
            fillOpacity: 0.3,
            weight: 3
          }).addTo(this.modalMap);

          this.modalMap.fitBounds(this.modalPolygon.getBounds());
        }
      } catch (e) {
        console.error('Failed to parse existing boundary', e);
      }
    }
  }

  toggleDrawingMode(): void {
    this.isDrawingMode = !this.isDrawingMode;
    if (this.isDrawingMode) {
      this.toastr.info('Drawing Mode Active. Click on the map to place boundary points.', 'Drawing');
      this.clearBoundaryDrawing();
    }
  }

  private drawModalLines(): void {
    if (this.modalPolyline) {
      this.modalMap?.removeLayer(this.modalPolyline);
    }
    if (this.modalPolygon) {
      this.modalMap?.removeLayer(this.modalPolygon);
    }

    if (this.modalDrawnPoints.length < 2) return;

    this.modalPolyline = L.polyline(this.modalDrawnPoints, { color: '#16a34a', weight: 3 }).addTo(this.modalMap!);
  }

  completePolygon(): void {
    if (this.modalDrawnPoints.length < 3) {
      this.toastr.warning('Please click at least 3 points on the map to define a closed area boundary.', 'Incomplete Shape');
      return;
    }

    if (this.modalPolyline) {
      this.modalMap?.removeLayer(this.modalPolyline);
      this.modalPolyline = null;
    }

    // Connect polygon
    this.modalPolygon = L.polygon(this.modalDrawnPoints, {
      color: '#16a34a',
      fillColor: '#22c55e',
      fillOpacity: 0.3,
      weight: 3
    }).addTo(this.modalMap!);

    // Save boundary coordinates JSON
    const boundaryCoords = this.modalDrawnPoints.map(p => [Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6))]);
    
    // Calculate predicted area from geodesic points
    const predictedArea = this.calculateAreaInAcres(this.modalDrawnPoints);

    this.editForm.patchValue({
      farmBoundary: JSON.stringify(boundaryCoords),
      calculatedArea: predictedArea
    });

    this.isDrawingMode = false;
    this.toastr.success(`Farm boundary shape closed. Calculated Area: ${predictedArea} Acres`, 'Success');
  }

  clearBoundaryDrawing(): void {
    this.modalDrawnPoints = [];
    if (this.modalPolyline) {
      this.modalMap?.removeLayer(this.modalPolyline);
      this.modalPolyline = null;
    }
    if (this.modalPolygon) {
      this.modalMap?.removeLayer(this.modalPolygon);
      this.modalPolygon = null;
    }
    this.editForm.patchValue({
      farmBoundary: '',
      calculatedArea: null
    });
  }

  saveDetails(): void {
    if (this.editForm.invalid) {
      this.toastr.warning('Please fill in all required fields correctly', 'Invalid Form');
      return;
    }

    const userId = this.auth.currentUser()?.id ?? 1;
    const formVals = this.editForm.value;

    const payload = {
      name: formVals.name,
      farmArea: formVals.farmArea,
      calculatedArea: formVals.calculatedArea,
      soilType: formVals.soilType,
      soilPh: formVals.soilPh,
      waterSource: formVals.waterSource,
      farmingType: formVals.farmingType,
      farmBoundary: formVals.farmBoundary,
      nitrogen: formVals.nitrogen,
      phosphorus: formVals.phosphorus,
      potassium: formVals.potassium,
      temperature: formVals.temperature,
      humidity: formVals.humidity,
      rainfall: formVals.rainfall,
      waterLevel: formVals.waterLevel,
      latitude: formVals.latitude,
      longitude: formVals.longitude
    };

    const isAdd = this.isAddingNewFarm();
    const farmId = this.selectedFarm()?.id;

    // Use specific endpoint for create vs update
    const request$ = isAdd
      ? this.api.post<FarmData>(`/api/dashboard/farms/${userId}`, payload)
      : this.api.put<FarmData>(`/api/dashboard/farms/${userId}/${farmId}`, payload);

    request$.subscribe({
      next: (res) => {
        this.toastr.success(isAdd ? 'Farm created successfully' : 'Farm details updated successfully', 'Success');
        
        if (isAdd) {
          // Temporarily set to null so loadDashboardData selects the new one
          this.selectedFarm.set(null);
        } else {
          this.selectedFarm.set(res);
        }

        this.closeEditModal();
        this.loadDashboardData();
      },
      error: (err) => {
        this.toastr.error('Failed to save details: ' + (err.error?.message || err.message), 'Error');
      }
    });
  }

  deleteSelectedFarm(): void {
    const farm = this.selectedFarm();
    if (!farm || !farm.id) return;

    if (!confirm(`Are you sure you want to delete "${farm.name}"? This action cannot be undone.`)) {
      return;
    }

    const userId = this.auth.currentUser()?.id ?? 1;

    this.api.delete<void>(`/api/dashboard/farms/${userId}/${farm.id}`).subscribe({
      next: () => {
        this.toastr.success('Farm deleted successfully', 'Success');
        this.selectedFarm.set(null);
        this.loadDashboardData();
      },
      error: (err) => {
        this.toastr.error('Failed to delete farm: ' + (err.error?.message || err.message), 'Error');
      }
    });
  }

  calculateAreaInAcres(coords: L.LatLng[]): number {
    if (coords.length < 3) return 0;
    
    let area = 0;
    const R = 6378137; // Earth's mean radius in meters
    
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      
      const lat1 = p1.lat * Math.PI / 180;
      const lat2 = p2.lat * Math.PI / 180;
      const lon1 = p1.lng * Math.PI / 180;
      const lon2 = p2.lng * Math.PI / 180;
      
      area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    
    const areaM2 = Math.abs(area * R * R / 2);
    const areaAcres = areaM2 / 4046.85642;
    return Number(areaAcres.toFixed(2));
  }

  // Helper getters
  get farmProfile() {
    return this.dashboardData()?.farmProfile;
  }

  get activeCalendars() {
    return this.dashboardData()?.activeCalendars ?? [];
  }

  get recentNotifications() {
    return this.dashboardData()?.recentNotifications ?? [];
  }

  getPhStatus(ph: number | undefined): { label: string; colorClass: string } {
    if (ph === undefined || ph === null) return { label: 'Unknown', colorClass: 'text-gray-400' };
    if (ph < 6.0) return { label: 'Acidic', colorClass: 'text-red-500 bg-red-50 dark:bg-red-950/20' };
    if (ph > 7.5) return { label: 'Alkaline', colorClass: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' };
    return { label: 'Optimal (Neutral)', colorClass: 'text-green-500 bg-green-50 dark:bg-green-950/20' };
  }
}
