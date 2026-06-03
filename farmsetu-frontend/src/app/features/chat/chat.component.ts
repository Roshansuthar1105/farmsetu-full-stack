import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'fs-chat',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent],
  template: `
    <fs-page-header title="Chat & AI Expert" subtitle="Message experts or ask the AI bot" />
    <div class="grid lg:grid-cols-2 gap-4">
      <div class="fs-card h-96 flex flex-col">
        <p class="text-sm text-gray-500 mb-4">Expert chat (WebSocket ready)</p>
        <div class="flex-1 overflow-y-auto border rounded-lg p-3 text-sm text-gray-500">Select a conversation</div>
      </div>
      <form class="fs-card space-y-3" [formGroup]="aiForm" (ngSubmit)="askAi()">
        <h3 class="font-semibold">AI Agricultural Assistant</h3>
        <textarea formControlName="message" rows="4" class="w-full border rounded-lg p-2 dark:bg-gray-700" placeholder="Ask about crops, pests, weather..."></textarea>
        <button type="submit" class="fs-btn-primary">Ask AI</button>
        @if (aiReply()) {
          <p class="text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">{{ aiReply() }}</p>
        }
      </form>
    </div>
  `
})
export class ChatComponent {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  readonly aiReply = signal('');
  readonly aiForm = this.fb.group({ message: [''] });

  askAi(): void {
    const message = this.aiForm.value.message ?? '';
    this.api.post<Record<string, string>>('/api/ai/chat', { message }).subscribe({
      next: (r) => this.aiReply.set(r['reply'] ?? JSON.stringify(r))
    });
  }
}
