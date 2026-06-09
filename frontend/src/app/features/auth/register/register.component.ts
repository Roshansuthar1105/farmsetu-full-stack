import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PersonalInfoStepComponent } from './steps/personal-info-step.component';
import { OtpVerificationStepComponent } from './steps/otp-verification-step.component';
import { FarmDetailsStepComponent } from './steps/farm-details-step.component';
import { AuthLayoutComponent } from '../shared/auth-layout.component';
import { AuthService } from '../../../core/services/auth.service';

export interface RegistrationData {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: string;
  otp: string;
  state: string;
  district: string;
  village: string;
  farmArea: number;
  farmAreaUnit: string;
  primaryCrops: string[];
  soilType: string;
  experience: number;
}

@Component({
  selector: 'fs-register',
  standalone: true,
  imports: [
    AuthLayoutComponent,
    PersonalInfoStepComponent,
    OtpVerificationStepComponent,
    FarmDetailsStepComponent
  ],
  template: `
    <fs-auth-layout>
      <!-- Progress Bar & Step Tracker -->
      <div class="space-y-3 mb-6">
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider">
            Step {{ currentStep() }} of 3
          </span>
          <span class="text-xs font-bold text-gray-400">
            {{ stepLabels[currentStep() - 1] }}
          </span>
        </div>
        <div class="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full
                      transition-all duration-500 ease-out"
               [style.width.%]="(currentStep() / 3) * 100">
          </div>
        </div>
      </div>

      <!-- Step Content -->
      <div>
        @switch (currentStep()) {
          @case (1) {
            <fs-personal-info-step
              [data]="registrationData()"
              (next)="onPersonalInfoNext($event)" />
          }
          @case (2) {
            <fs-otp-verification-step
              [phone]="registrationData().phone ?? ''"
              (verified)="onOtpVerified($event)"
              (back)="currentStep.set(1)"
              (changeNumber)="currentStep.set(1)" />
          }
          @case (3) {
            <fs-farm-details-step
              [data]="registrationData()"
              (complete)="onRegistrationComplete($event)"
              (back)="currentStep.set(2)" />
          }
        }
      </div>
    </fs-auth-layout>
  `
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentStep = signal(1);
  readonly stepLabels = ['Personal Info', 'Verification', 'Farm Details'];

  readonly registrationData = signal<Partial<RegistrationData>>({});

  onPersonalInfoNext(data: Partial<RegistrationData>): void {
    this.registrationData.update(prev => ({ ...prev, ...data }));
    this.currentStep.set(2);
  }

  onOtpVerified(otp: string): void {
    this.registrationData.update(prev => ({ ...prev, otp }));
    this.currentStep.set(3);
  }

  onRegistrationComplete(data: Partial<RegistrationData>): void {
    this.registrationData.update(prev => ({ ...prev, ...data }));
    const payload = this.registrationData();
    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        console.error('Registration failed:', err);
      }
    });
  }
}