import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
import { OtpInputComponent } from '../../shared/otp-input.component';

@Component({
  selector: 'fs-otp-verification-step',
  standalone: true,
  imports: [OtpInputComponent],
  template: `
    <div class="space-y-6 text-center">

      <!-- Shield/Device Illustration -->
      <div class="flex justify-center">
        <div class="w-20 h-20 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center border border-green-100 dark:border-green-900/50">
          <span class="material-icons text-4xl text-green-600 dark:text-green-400">phonelink_lock</span>
        </div>
      </div>

      <!-- Heading -->
      <div class="space-y-1">
        <h2 class="text-xl font-extrabold text-gray-900 dark:text-white">
          Verify Your Number
        </h2>
        <p class="text-gray-400 text-xs">
          OTP sent to <span class="font-bold text-gray-700 dark:text-gray-300">+91 {{ maskedPhone }}</span>
        </p>
      </div>

      <!-- OTP Input -->
      <div class="py-2">
        <fs-otp-input
          [length]="6"
          (otpComplete)="onOtpEntered($event)" />
      </div>

      <!-- Timer / Resend -->
      <div class="text-xs">
        @if (timerSeconds() > 0) {
          <p class="text-gray-400 font-medium">
            Resend OTP in
            <span class="font-bold text-green-600 dark:text-green-400">
              {{ formatTime(timerSeconds()) }}
            </span>
          </p>
        } @else {
          <button (click)="resendOtp()"
                  class="font-bold text-green-600 dark:text-green-400 hover:text-green-700 transition-colors">
            Resend OTP
          </button>
        }
      </div>

      <!-- Error -->
      @if (error()) {
        <div class="flex items-center justify-center gap-2.5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-xl text-red-650 dark:text-red-400 text-xs">
          <span class="material-icons text-base shrink-0">error_outline</span>
          <p>{{ error() }}</p>
        </div>
      }

      <!-- Verify Button -->
      <button (click)="verify()"
              [disabled]="!enteredOtp() || loading()"
              class="w-full rounded-xl text-sm font-bold text-white
                     bg-gradient-to-r from-green-600 to-emerald-600
                     hover:from-green-700 hover:to-emerald-700
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-green-500/10
                     transition-all duration-200 flex items-center justify-center gap-2"
              style="height: 48px;">
        @if (loading()) {
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <span>Verifying...</span>
        } @else {
          <span>Verify ✓</span>
        }
      </button>

      <!-- Actions Row -->
      <div class="flex items-center justify-between text-xs border-t border-gray-100 dark:border-gray-800 pt-4">
        <button (click)="back.emit()"
                class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-bold transition flex items-center gap-1">
          <span class="material-icons text-sm">arrow_back</span> Back
        </button>
        <button (click)="changeNumber.emit()"
                class="text-amber-600 dark:text-amber-400 hover:text-amber-700 font-bold transition">
          Change Number
        </button>
      </div>
    </div>
  `
})
export class OtpVerificationStepComponent implements OnInit, OnDestroy {
  @Input() phone = '';
  @Output() verified = new EventEmitter<string>();
  @Output() back = new EventEmitter<void>();
  @Output() changeNumber = new EventEmitter<void>();

  readonly timerSeconds = signal(45);
  readonly enteredOtp = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  private timerInterval?: ReturnType<typeof setInterval>;

  get maskedPhone(): string {
    if (this.phone.length >= 10) {
      return 'XXXXXX' + this.phone.slice(-4);
    }
    return this.phone;
  }

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  onOtpEntered(otp: string): void {
    this.enteredOtp.set(otp);
  }

  verify(): void {
    if (!this.enteredOtp()) return;
    this.loading.set(true);
    this.error.set(null);

    // Simulate API call
    setTimeout(() => {
      this.loading.set(false);
      this.verified.emit(this.enteredOtp());
    }, 1500);
  }

  resendOtp(): void {
    this.timerSeconds.set(45);
    this.startTimer();
    // Call resend OTP API
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  private startTimer(): void {
    this.clearTimer();
    this.timerInterval = setInterval(() => {
      const current = this.timerSeconds();
      if (current <= 0) {
        this.clearTimer();
        return;
      }
      this.timerSeconds.set(current - 1);
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
