import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PersonalInfoStepComponent } from './steps/personal-info-step.component';
import { OtpVerificationStepComponent } from './steps/otp-verification-step.component';
import { FarmDetailsStepComponent } from './steps/farm-details-step.component';
import { AuthHeaderComponent } from '../shared/auth-header.component';
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
    AuthHeaderComponent,
    PersonalInfoStepComponent,
    OtpVerificationStepComponent,
    FarmDetailsStepComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">

      <!-- Compact header for registration -->
      <fs-auth-header tagline="Join the farming revolution" height="25vh" />

      <!-- Main Card -->
      <div class="flex-1 -mt-6 relative z-10">
        <div class="bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl min-h-full px-6 pt-6 pb-6">

          <!-- Progress Bar -->
          <div class="max-w-md mx-auto mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-green-600 dark:text-green-400">
                Step {{ currentStep() }} of 3
              </span>
              <span class="text-xs text-gray-400">
                {{ stepLabels[currentStep() - 1] }}
              </span>
            </div>
            <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full
                          transition-all duration-500 ease-out"
                   [style.width.%]="(currentStep() / 3) * 100">
              </div>
            </div>

            <!-- Step indicators -->
            <div class="flex justify-between mt-3">
              @for (step of [1, 2, 3]; track step) {
                <div class="flex flex-col items-center gap-1">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                              transition-all duration-300"
                       [class]="step <= currentStep()
                         ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                         : 'bg-gray-200 dark:bg-gray-700 text-gray-400'">
                    @if (step < currentStep()) {
                      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    } @else {
                      {{ step }}
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Step Content -->
          <div class="max-w-md mx-auto">
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
        </div>
      </div>
    </div>
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