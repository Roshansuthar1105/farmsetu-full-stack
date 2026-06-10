export type EquipmentCategory = 'TRACTOR' | 'DRONE' | 'HARVESTER' | 'IMPLEMENT';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface Equipment {
  id: number;
  ownerId: number;
  ownerName: string;
  ownerPhone?: string;
  name: string;
  category: EquipmentCategory;
  description?: string;
  hourlyRate: number;
  dailyRate: number;
  imageUrl?: string;
  locationLat?: number;
  locationLng?: number;
  village?: string;
  isActive: boolean;
  createdAt?: string;
  distanceKm?: number;
}

export interface EquipmentBooking {
  id: number;
  equipmentId: number;
  equipmentName: string;
  equipmentCategory: EquipmentCategory;
  ownerId: number;
  ownerName: string;
  ownerPhone?: string;
  renterId: number;
  renterName: string;
  renterPhone?: string;
  startTime: string;
  endTime: string;
  totalCost: number;
  status: BookingStatus;
  notes?: string;
  createdAt?: string;
}

export interface CreateEquipmentPayload {
  name: string;
  category: EquipmentCategory | '';
  description?: string;
  hourlyRate: number | null;
  dailyRate: number | null;
  imageUrl?: string;
  locationLat?: number;
  locationLng?: number;
  village?: string;
}

export interface CostEstimate {
  totalCost: number;
}
