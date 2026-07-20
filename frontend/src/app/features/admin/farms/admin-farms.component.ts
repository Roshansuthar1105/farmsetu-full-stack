import { Component, OnInit, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../services/admin.service';
import { TranslateModule } from '@ngx-translate/core';
import * as L from 'leaflet';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-farms',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './admin-farms.component.html'
})
export class AdminFarmsComponent implements OnInit, OnDestroy {
  private adminService = inject(AdminService);
  private destroy$ = new Subject<void>();
  
  loading = signal(true);
  farms = signal<any[]>([]);
  private map: L.Map | null = null;

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
    // Fetch a large number of farms for the map, e.g. 500
    this.adminService.getFarms(0, 500).pipe(
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

  // Generate a consistent color based on user ID
  getColorForUser(userId: number | undefined): string {
    if (!userId) return '#808080'; // Gray for unknown
    
    // Simple hash to generate a hue
    const hash = userId * 137.5; // Golden angle approx
    const hue = hash % 360;
    
    // Generate HSL color with good saturation and lightness
    return `hsl(${hue}, 70%, 50%)`;
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const currentFarms = this.farms();
    
    // Default to center of India
    let defaultLat = 20.5937;
    let defaultLng = 78.9629;
    
    if (currentFarms.length > 0 && currentFarms[0].latitude) {
       defaultLat = currentFarms[0].latitude;
       defaultLng = currentFarms[0].longitude;
    }

    const mapElement = document.getElementById('adminFarmsMap');
    if (!mapElement) return;

    this.map = L.map('adminFarmsMap').setView([defaultLat, defaultLng], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const bounds = L.latLngBounds([]);
    let boundsExtended = false;

    currentFarms.forEach(farm => {
      const lat = farm.latitude;
      const lng = farm.longitude;
      const hasLocation = !!lat && !!lng;
      const userId = farm.user?.id;
      const color = this.getColorForUser(userId);

      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h3 class="font-bold text-lg mb-1" style="color: ${color}">${farm.name || 'Unnamed Farm'}</h3>
          <div class="text-sm space-y-1">
            <p><b>Owner:</b> ${farm.user?.name || 'Unknown'} (ID: ${userId || 'N/A'})</p>
            <p><b>Email:</b> ${farm.user?.email || 'N/A'}</p>
            <p><b>Area:</b> ${farm.farmArea || farm.calculatedArea || '--'} Acres</p>
            <p><b>Soil:</b> ${farm.soilType || '--'}</p>
            <p><b>Farming Type:</b> ${farm.farmingType || '--'}</p>
          </div>
        </div>
      `;

      if (hasLocation) {
        // Create custom colored marker
        const markerHtml = `
          <div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>
        `;
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: markerHtml,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        L.marker([lat, lng], { icon: customIcon })
          .addTo(this.map!)
          .bindPopup(popupContent);
        
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
              fillOpacity: 0.4,
              weight: 3
            }).addTo(this.map!);
            
            polygon.bindPopup(popupContent);
            bounds.extend(polygon.getBounds());
            boundsExtended = true;
          }
        } catch (e) {
          console.error('Failed to parse boundary for farm', farm.id, e);
        }
      }
    });

    if (boundsExtended && bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [30, 30] });
    }
  }
}
