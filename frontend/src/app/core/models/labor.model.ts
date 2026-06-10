export type JobStatus = 'OPEN' | 'FILLED' | 'COMPLETED' | 'CANCELED';
export type ApplicationStatus = 'APPLIED' | 'ACCEPTED' | 'REJECTED';

export interface LaborJob {
  id: number;
  farmerId: number;
  farmerName: string;
  farmerVillage?: string;
  title: string;
  description?: string;
  requiredWorkers: number;
  workersHired: number;
  dailyWage: number;
  jobDate: string;
  villageLocation?: string;
  status: JobStatus;
  totalApplications?: number;
  createdAt?: string;
}

export interface LaborApplication {
  id: number;
  jobId: number;
  jobTitle: string;
  laborerId: number;
  laborerName: string;
  laborerPhone?: string;
  laborerVillage?: string;
  appliedAt: string;
  applicationStatus: ApplicationStatus;
}

export interface CreateJobPayload {
  title: string;
  description?: string;
  requiredWorkers: number;
  dailyWage: number;
  jobDate: string;
  villageLocation?: string;
}
