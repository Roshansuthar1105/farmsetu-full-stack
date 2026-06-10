import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Equipment,
  EquipmentBooking,
  CreateEquipmentPayload,
  CostEstimate
} from '../models/machinery.model';

@Injectable({ providedIn: 'root' })
export class MachineryService {
  private readonly api = inject(ApiService);

  // ─── Equipment Listings ──────────────────────────────────────────────

  getNearbyEquipment(
    lat?: number,
    lng?: number,
    radius?: number,
    category?: string
  ): Observable<Equipment[]> {
    const params: Record<string, string> = {};
    if (lat !== undefined && lat !== null) params['lat'] = lat.toString();
    if (lng !== undefined && lng !== null) params['lng'] = lng.toString();
    if (radius !== undefined && radius !== null) params['radius'] = radius.toString();
    if (category) params['category'] = category;

    return this.api.get<Equipment[]>('/api/machinery/equipment/nearby', params);
  }

  getMyEquipment(): Observable<Equipment[]> {
    return this.api.get<Equipment[]>('/api/machinery/equipment/my');
  }

  getEquipmentDetail(id: number): Observable<Equipment> {
    return this.api.get<Equipment>(`/api/machinery/equipment/${id}`);
  }

  addEquipment(payload: any): Observable<Equipment> {
    return this.api.post<Equipment>('/api/machinery/equipment', payload);
  }

  updateEquipment(id: number, payload: any): Observable<Equipment> {
    return this.api.put<Equipment>(`/api/machinery/equipment/${id}`, payload);
  }

  toggleActive(id: number): Observable<Equipment> {
    return this.api.put<Equipment>(`/api/machinery/equipment/${id}/toggle`, {});
  }

  calculateCost(id: number, startTime: string, endTime: string): Observable<CostEstimate> {
    return this.api.post<CostEstimate>(`/api/machinery/equipment/${id}/calculate-cost`, {
      startTime,
      endTime
    });
  }

  // ─── Bookings ────────────────────────────────────────────────────────

  requestBooking(payload: {
    equipmentId: number;
    startTime: string;
    endTime: string;
    notes?: string;
  }): Observable<EquipmentBooking> {
    return this.api.post<EquipmentBooking>('/api/machinery/bookings', payload);
  }

  getMyBookings(): Observable<EquipmentBooking[]> {
    return this.api.get<EquipmentBooking[]>('/api/machinery/bookings/my');
  }

  getIncomingRequests(): Observable<EquipmentBooking[]> {
    return this.api.get<EquipmentBooking[]>('/api/machinery/bookings/incoming');
  }

  approveBooking(id: number): Observable<EquipmentBooking> {
    return this.api.put<EquipmentBooking>(`/api/machinery/bookings/${id}/approve`, {});
  }

  rejectBooking(id: number): Observable<EquipmentBooking> {
    return this.api.put<EquipmentBooking>(`/api/machinery/bookings/${id}/reject`, {});
  }

  completeBooking(id: number): Observable<EquipmentBooking> {
    return this.api.put<EquipmentBooking>(`/api/machinery/bookings/${id}/complete`, {});
  }
}
