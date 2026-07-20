import { Component, Input, OnChanges } from '@angular/core';

@Component({
    selector: 'fs-password-strength',
    standalone: true,
    template: `
    <div class="mt-2">
      <!-- Strength bars -->
      <div class="flex gap-1.5">
        @for (segment of segments; track $index) {
          <div class="h-1.5 flex-1 rounded-full transition-all duration-300"
               [class]="$index < strength ? colors[strength - 1] : 'bg-gray-200 dark:bg-gray-700'">
          </div>
        }
      </div>
      <!-- Label -->
      @if (password.length > 0) {
        <p class="text-xs mt-1.5 font-medium" [class]="textColors[strength - 1] || 'text-gray-400'">
          {{ labels[strength - 1] || '' }}
        </p>
      }
    </div>
  `
})
export class PasswordStrengthComponent implements OnChanges {
    @Input() password = '';

    readonly segments = [1, 2, 3, 4, 5];
    readonly labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    readonly colors = [
        'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'
    ];
    readonly textColors = [
        'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-emerald-500'
    ];

    strength = 0;

    ngOnChanges(): void {
        this.strength = this.calculateStrength(this.password);
    }

    private calculateStrength(pw: string): number {
        if (!pw) return 0;
        let score = 0;
        if (pw.length >= 6) score++;
        if (pw.length >= 10) score++;
        if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
        if (/\d/.test(pw)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++;
        return Math.min(score, 5);
    }
}
