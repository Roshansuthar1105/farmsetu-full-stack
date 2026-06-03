import { Component, Input, Output, EventEmitter, signal, OnInit, OnDestroy } from '@angular/core';
import { OtpInputComponent } from '../../shared/otp-input.component';

@Component({
  selector: 'fs-otp-verification-step',
  standalone: true,
  imports: [OtpInputComponent],
  template: `
    <div class="space-y-6 text-center">

      <!-- Illustration -->
      <div class="flex justify-center">
        <div class="w-32 h-32 bg-green-100 dark:bg-green-900/30 rounded-full
                    flex items-center justify-center">
          <span class="text-6xl">📱</span>
        </div>
      </div>

      <!-- Heading -->
      <div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          Verify Your Number
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-sm">
          OTP sent to
          <span class="font-semibold text-gray-700 dark:text-gray-300">
            +91 {{ maskedPhone }}
          </span>
        </p>
      </div>

      <!-- OTP Input -->
      <fs-otp-input
        [length]="6"
        (otpComplete)="onOtpEntered($event)" />

      <!-- Timer -->
      <div class="text-sm">
        @if (timerSeconds() > 0) {
          <p class="text-gray-400">
            Resend in
            <span class="font-bold text-green-600 dark:text-green-400">
              {{ formatTime(timerSeconds()) }}
            </span>
          </p>
        } @else {
          <button (click)="resendOtp()"
                  class="font-semibold text-green-600 dark:text-green-400
                         hover:text-green-700 transition-colors">
            Resend OTP
          </button>
        }
      </div>

      <!-- Error -->
      @if (error()) {
        <div class="flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/20
                    border border-red-200 dark:border-red-800 rounded-xl">
          <p class="text-sm text-red-600 dark:text-red-400">{{ error() }}</p>
        </div>
      }

      <!-- Verify Button -->
      <button (click)="verify()"
              [disabled]="!enteredOtp() || loading()"
              class="w-full py-4 rounded-xl text-base font-bold text-white
                     bg-gradient-to-r from-green-600 to-emerald-600
                     hover:from-green-700 hover:to-emerald-700
                     disabled:opacity-50 disabled:cursor-not-allowed
                     shadow-lg shadow-green-500/30
                     transition-all duration-200"
              style="height: 56px;">
        @if (loading()) {
          Verifying...
        } @else {
          Verify ✓
        }
      </button>

      <!-- Actions Row -->
      <div class="flex items-center justify-between text-sm">
        <button (click)="back.emit()"
                class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300
                       font-medium transition-colors flex items-center gap-1">
          ← Back
        </button>
        <button (click)="changeNumber.emit()"
                class="text-amber-600 dark:text-amber-400 hover:text-amber-700
                       font-medium transition-colors">
          Change number
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