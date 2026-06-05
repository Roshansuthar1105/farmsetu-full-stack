import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'fs-admin-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white">Email Broadcaster</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Send direct notifications or HTML newsletters to users</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
        <form (ngSubmit)="sendMail()" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Recipient Email</label>
            <input type="email" [(ngModel)]="mailForm.to" name="to" placeholder="e.g. user@example.com" required 
                   class="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
            <input type="text" [(ngModel)]="mailForm.subject" name="subject" placeholder="Enter email subject" required 
                   class="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Content (Plain text or HTML)</label>
            <textarea [(ngModel)]="mailForm.content" name="content" rows="8" placeholder="Type message body. Wrap in <html>...</html> tags to send Rich HTML emails." required 
                      class="w-full border rounded-xl px-4 py-3 dark:bg-gray-700 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition text-sm font-mono"></textarea>
          </div>

          <div class="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
            <button type="submit" [disabled]="loading()" 
                    class="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 active:scale-[0.98] transition flex items-center gap-2">
              @if (loading()) {
                <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Sending...</span>
              } @else {
                <span>✉️ Send Email</span>
              }
            </button>
          </div>
        </form>
      </div>
      
      <!-- Tips card -->
      <div class="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 text-xs text-blue-800 dark:text-blue-300">
        <p class="font-bold mb-1">💡 Pro Tips for Broadcasters:</p>
        <ul class="list-disc list-inside space-y-1 opacity-90">
          <li>Standard text messages will be delivered using plain formatting.</li>
          <li>For styled newsletters, start with &lt;html&gt; and design using clean inline CSS.</li>
          <li>Emails are sent asynchronously to avoid thread blocking. Check backend container logs for tracking.</li>
        </ul>
      </div>
    </div>
  `
})
export class AdminEmailComponent {
  private readonly api = inject(ApiService);
  private readonly toastr = inject(ToastrService);

  readonly loading = signal(false);

  mailForm = {
    to: '',
    subject: '',
    content: ''
  };

  sendMail(): void {
    if (!this.mailForm.to || !this.mailForm.subject || !this.mailForm.content) return;
    this.loading.set(true);

    this.api.post<any>('/api/admin/mail/send', this.mailForm).subscribe({
      next: () => {
        this.toastr.success('Email successfully sent!', 'Success');
        this.mailForm = { to: '', subject: '', content: '' };
        this.loading.set(false);
      },
      error: (err) => {
        this.toastr.error(err?.message || 'Failed to dispatch email.', 'Error');
        this.loading.set(false);
      }
    });
  }
}
