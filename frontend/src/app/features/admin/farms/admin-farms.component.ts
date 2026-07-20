import { Component, OnInit, signal, inject, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../services/admin.service';
import * as L from 'leaflet';
import { Subject, takeUntil } from 'rxjs';
import {
  LucideSearch,
  LucideDownload,
  LucideX,
  LucideMapPin,
  LucideUser,
  LucideMail,
  LucidePhone,
  LucideDroplet,
  LucideSprout,
  LucideRuler,
  LucideLayers
} from '@lucide/angular';

@Component({
  selector: 'app-admin-farms',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    LucideSearch,
    LucideDownload,
    LucideX,
    LucideMapPin,
    LucideUser,
    LucideMail,
    LucidePhone,
    LucideDroplet,
    LucideSprout,
    LucideRuler,
    LucideLayers
  ],
  templateUrl: './admin-farms.component.html'
})
export class AdminFarmsComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private destroy$ = new Subject<void>();

  loading = signal(true);
  farms = signal<any[]>([]);
  searchQuery = signal('');
  selectedFarm = signal<any | null>(null);
  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private polygonsLayer: L.LayerGroup | null = null;

  // Filtered farms based on search
  filteredFarms = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const allFarms = this.farms();
    if (!query) return allFarms;
    return allFarms.filter(f => {
      const farmName = (f.name || '').toLowerCase();
      const userName = (f.user?.name || '').toLowerCase();
      const userEmail = (f.user?.email || '').toLowerCase();
      const userPhone = (f.user?.phone || '').toLowerCase();
      const soilType = (f.soilType || '').toLowerCase();
      const farmingType = (f.farmingType || '').toLowerCase();
      return farmName.includes(query) ||
        userName.includes(query) ||
        userEmail.includes(query) ||
        userPhone.includes(query) ||
        soilType.includes(query) ||
        farmingType.includes(query);
    });
  });

  // Analytics
  totalFarms = computed(() => this.filteredFarms().length);

  totalArea = computed(() => {
    return this.filteredFarms().reduce((sum, f) => {
      const area = parseFloat(f.farmArea || f.calculatedArea || '0');
      return sum + (isNaN(area) ? 0 : area);
    }, 0);
  });

  averageSize = computed(() => {
    const total = this.totalFarms();
    if (total === 0) return 0;
    return this.totalArea() / total;
  });

  uniqueFarmers = computed(() => {
    const ids = new Set(this.filteredFarms().map(f => f.user?.id).filter(Boolean));
    return ids.size;
  });

  ngOnInit(): void {
    this.fetchFarms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.map) {
      this.map.remove();
    }
  }

  fetchFarms(): void {
    this.loading.set(true);
    this.adminService.getFarms(0, 2000).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res) => {
        this.farms.set(res.content || []);
        this.loading.set(false);
        setTimeout(() => this.initMap(), 100);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getColorForUser(userId: number | undefined): string {
    if (!userId) return '#808080';
    const hash = userId * 137.5;
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  selectFarm(farm: any): void {
    this.selectedFarm.set(farm);
  }

  closeSidePanel(): void {
    this.selectedFarm.set(null);
  }

  onSearchChange(): void {
    this.rebuildMarkers();
  }

  downloadCsv(): void {
    const data = this.filteredFarms();
    if (data.length === 0) return;

    const headers = ['Farm ID', 'Farm Name', 'Owner Name', 'Owner Email', 'Owner Phone', 'Area (Acres)', 'Soil Type', 'Soil pH', 'Water Source', 'Farming Type', 'Latitude', 'Longitude'];
    const rows = data.map(f => [
      f.id || '',
      (f.name || '').replace(/,/g, ' '),
      (f.user?.name || '').replace(/,/g, ' '),
      f.user?.email || '',
      f.user?.phone || '',
      f.farmArea || f.calculatedArea || '',
      f.soilType || '',
      f.soilPh || '',
      f.waterSource || '',
      f.farmingType || '',
      f.latitude || '',
      f.longitude || ''
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `farms_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  }

  private rebuildMarkers(): void {
    if (!this.map) return;

    // Clear existing layers
    if (this.markersLayer) {
      this.markersLayer.clearLayers();
    }
    if (this.polygonsLayer) {
      this.polygonsLayer.clearLayers();
    }

    const filtered = this.filteredFarms();
    const bounds = L.latLngBounds([]);
    let boundsExtended = false;

    filtered.forEach(farm => {
      const lat = farm.latitude;
      const lng = farm.longitude;
      const hasLocation = !!lat && !!lng;
      const userId = farm.user?.id;
      const color = this.getColorForUser(userId);

      if (hasLocation) {
        const markerHtml = `
          <div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35); cursor: pointer;"></div>
        `;
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: markerHtml,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const marker = L.marker([lat, lng], { icon: customIcon });
        marker.on('click', () => this.selectFarm(farm));
        this.markersLayer!.addLayer(marker);

        bounds.extend([lat, lng]);
        boundsExtended = true;
      }

      if (farm.farmBoundary) {
        try {
          const coords = JSON.parse(farm.farmBoundary);
          if (Array.isArray(coords) && coords.length > 0) {
            const polygon = L.polygon(coords, {
              color: color,
              fillColor: color,
              fillOpacity: 0.3,
              weight: 2
            });
            polygon.on('click', () => this.selectFarm(farm));
            this.polygonsLayer!.addLayer(polygon);
            bounds.extend(polygon.getBounds());
            boundsExtended = true;
          }
        } catch (e) {
          console.error('Failed to parse boundary for farm', farm.id, e);
        }
      }
    });

    if (boundsExtended && bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const currentFarms = this.farms();

    let defaultLat = 20.5937;
    let defaultLng = 78.9629;

    if (currentFarms.length > 0 && currentFarms[0].latitude) {
      defaultLat = currentFarms[0].latitude;
      defaultLng = currentFarms[0].longitude;
    }

    const mapElement = document.getElementById('adminFarmsMap');
    if (!mapElement) return;

    this.map = L.map('adminFarmsMap').setView([defaultLat, defaultLng], 5);

    // Street tile layer
    const streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    });

    // Satellite tile layer
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: '© Esri'
    });

    streets.addTo(this.map);

    // Layer control
    L.control.layers(
      { 'Street': streets, 'Satellite': satellite },
      {},
      { position: 'topright' }
    ).addTo(this.map);

    // Create layer groups for markers and polygons
    this.markersLayer = L.layerGroup().addTo(this.map);
    this.polygonsLayer = L.layerGroup().addTo(this.map);

    this.rebuildMarkers();
  }
}
