import { Component, signal } from '@angular/core';
import { PersonalInfoStepComponent } from './steps/personal-info-step.component';
import { OtpVerificationStepComponent } from './steps/otp-verification-step.component';
import { FarmDetailsStepComponent } from './steps/farm-details-step.component';
import { AuthHeaderComponent } from '../shared/auth-header.component';

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
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300 pb-12">

      <!-- Compact header for registration -->
      <fs-auth-header tagline="Join the agricultural revolution" height="28vh" />

      <!-- Main Card Wrap -->
      <div class="flex-1 -mt-8 relative z-10 px-4">
        <div class="glass-card max-w-md mx-auto p-8 shadow-2xl relative overflow-hidden">
          
          <!-- Top Accent Line -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>

          <!-- Progress Bar & Stepper -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-semibold text-primary-650 dark:text-primary-400 uppercase tracking-wider">
                Step {{ currentStep() }} of 3
              </span>
              <span class="text-xs text-slate-450 dark:text-slate-400 font-medium">
                {{ stepLabels[currentStep() - 1] }}
              </span>
            </div>
            
            <!-- Sleek Progress Track -->
            <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full
                          transition-all duration-500 ease-out"
                   [style.width.%]="(currentStep() / 3) * 100">
              </div>
            </div>

            <!-- Custom Stepper Dots -->
            <div class="flex justify-between mt-5 relative">
              <!-- Background connector line -->
              <div class="absolute top-3.5 left-0 right-0 h-[2px] bg-slate-100 dark:bg-slate-800 -z-10"></div>
              
              @for (step of [1, 2, 3]; track step) {
                <div class="flex flex-col items-center gap-1.5">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                              transition-all duration-300 z-10"
                       [class]="step <= currentStep()
                         ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                         : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'">
                    @if (step < currentStep()) {
                      <span class="material-icons text-sm">done</span>
                    } @else {
                      {{ step }}
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Step Content Container -->
          <div class="mt-4 animate-fade-in-up">
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
    // Final registration API call
    console.log('Complete registration:', this.registrationData());
  }
}