import {
    Component, Input, Output, EventEmitter,
    ViewChildren, QueryList, ElementRef, AfterViewInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor } from '@angular/common';

@Component({
    selector: 'fs-otp-input',
    standalone: true,
    imports: [FormsModule, NgFor],
    template: `
    <div class="flex justify-center gap-3">
      @for (digit of digits; track $index) {
        <input
          #otpInput
          type="text"
          inputmode="numeric"
          autocomplete="off"
          name="otp_digit_{{$index}}"
          data-lpignore="true"
          data-form-type="other"
          maxlength="1"
          [value]="digit"
          (input)="onInput($event, $index)"
          (keydown)="onKeyDown($event, $index)"
          (paste)="onPaste($event)"
          class="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl
                 transition-all duration-200 outline-none
                 bg-white dark:bg-gray-800
                 border-gray-300 dark:border-gray-600
                 focus:border-green-500 focus:ring-4 focus:ring-green-500/20
                 text-gray-900 dark:text-white" />
      }
    </div>
  `
})
export class OtpInputComponent implements AfterViewInit {
    @Input() length = 6;
    @Output() otpComplete = new EventEmitter<string>();

    @ViewChildren('otpInput') inputs!: QueryList<ElementRef<HTMLInputElement>>;

    digits: string[] = [];

    ngAfterViewInit(): void {
        this.digits = new Array(this.length).fill('');
        setTimeout(() => this.inputs.first?.nativeElement.focus());
    }

    onInput(event: Event, index: number): void {
        const input = event.target as HTMLInputElement;
        const value = input.value.replace(/\D/g, '');
        this.digits[index] = value;

        if (value && index < this.length - 1) {
            this.inputs.get(index + 1)?.nativeElement.focus();
        }

        this.checkComplete();
    }

    onKeyDown(event: KeyboardEvent, index: number): void {
        if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
            this.inputs.get(index - 1)?.nativeElement.focus();
        }
    }

    onPaste(event: ClipboardEvent): void {
        event.preventDefault();
        const paste = event.clipboardData?.getData('text')?.replace(/\D/g, '') ?? '';
        paste.split('').slice(0, this.length).forEach((char, i) => {
            this.digits[i] = char;
            const inputEl = this.inputs.get(i)?.nativeElement;
            if (inputEl) inputEl.value = char;
        });
        this.checkComplete();
    }

    private checkComplete(): void {
        const otp = this.digits.join('');
        if (otp.length === this.length) {
            this.otpComplete.emit(otp);
        }
    }
}