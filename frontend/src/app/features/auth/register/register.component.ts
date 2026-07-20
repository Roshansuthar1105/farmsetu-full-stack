import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PersonalInfoStepComponent } from './steps/personal-info-step.component';
import { CompleteProfileModalComponent } from './complete-profile-modal.component';
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
    CompleteProfileModalComponent
  ],
  template: `
    <fs-auth-layout>
      <!-- Registration Form -->
      <fs-personal-info-step
        [data]="registrationData()"
        [loading]="loading"
        [errorMsg]="errorMsg"
        (next)="onRegister($event)" />
    </fs-auth-layout>

    <!-- Profile Completion Modal (shown after successful register) -->
    @if (showProfileModal()) {
      <fs-complete-profile-modal
        [userId]="registeredUserId()"
        (saved)="onProfileSaved()"
        (dismissed)="onProfileDismissed()" />
    }
  `
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly showProfileModal = signal(false);
  readonly registeredUserId = signal(0);

  readonly registrationData = signal<Partial<RegistrationData>>({});

  onRegister(data: Partial<RegistrationData>): void {
    this.loading.set(true);
    this.errorMsg.set(null);
    this.registrationData.set(data);

    const payload: Record<string, unknown> = {
      name: data.name,
      phone: data.phone,
      password: data.password,
      role: data.role ?? 'FARMER'
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        // Store user id for profile modal
        if (res?.user?.id) {
          this.registeredUserId.set(res.user.id);
        }
        // Show profile completion modal
        this.showProfileModal.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err?.error?.message ?? err?.message ?? 'Registration failed. Please try again.';
        this.errorMsg.set(message);
      }
    });
  }

  onProfileSaved(): void {
    this.showProfileModal.set(false);
    this.router.navigate(['/app/dashboard']);
  }

  onProfileDismissed(): void {
    this.showProfileModal.set(false);
    this.router.navigate(['/app/dashboard']);
  }
}
