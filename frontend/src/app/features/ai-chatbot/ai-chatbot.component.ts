import { Component, OnInit, OnDestroy, inject, signal, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { Router } from '@angular/router';

interface ChatMessage {
  id?: number;
  text: string;
  fromBot: boolean;
  createdAt?: string;
  isSpeaking?: boolean;
}

@Component({
  selector: 'fs-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './ai-chatbot.component.html',
  styleUrls: ['./ai-chatbot.component.scss']
})
export class AiChatbotComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly router = inject(Router);

  @ViewChild('chatScrollContainer') private chatScrollContainer!: ElementRef;
  @ViewChild('imageFileInput') private imageFileInput!: ElementRef;

  readonly messages = signal<ChatMessage[]>([]);
  readonly loading = signal<boolean>(false);
  readonly initialLoading = signal<boolean>(true);
  readonly selectedCategory = signal<string>('all');
  readonly isEscalated = signal<boolean>(false);
  readonly escalationStatus = signal<string>('');
  readonly isRecordingVoice = signal<boolean>(false);
  readonly activeSpeechId = signal<number | null>(null);

  userInput: string = '';
  selectedImageUrl: string = '';
  selectedImageFileName: string = '';

  // Speech Recognition object
  private recognition: any = null;

  readonly topicChips = [
    { label: '🌾 Fertilizer Calculation', query: 'What is the optimal NPK ratio and urea dosage for wheat sowing?' },
    { label: '🐛 Pest Control', query: 'How to control leaf blight and fall armyworm organically?' },
    { label: '📊 Mandi Trends', query: 'What are current market rates and price forecasts for soybean and wheat?' },
    { label: '🌤️ Weather & Irrigation', query: 'Should I irrigate my crops based on current weather forecast?' },
    { label: '🏛️ Govt Schemes', query: 'How do I apply for PM-KISAN subsidy and PMFBY crop insurance?' }
  ];

  get currentUser() {
    return this.auth.currentUser();
  }

  ngOnInit(): void {
    this.loadHistory();
    this.initSpeechRecognition();
  }

  ngOnDestroy(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
  }

  loadHistory(): void {
    this.initialLoading.set(true);
    this.api.get<any[]>('/api/ai-chat/history').subscribe({
      next: (history) => {
        if (history && history.length > 0) {
          const list: ChatMessage[] = history.map(h => ({
            id: h.id,
            text: h.text,
            fromBot: h.fromBot,
            createdAt: h.createdAt
          }));
          this.messages.set(list);
        } else {
          // Welcome message
          this.addWelcomeMessage();
        }
        this.initialLoading.set(false);
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => {
        console.error('Failed to load AI chat history:', err);
        this.addWelcomeMessage();
        this.initialLoading.set(false);
      }
    });
  }

  addWelcomeMessage(): void {
    const welcomeText = `### 👋 Welcome to Setu AI Agronomist!\n\nI am your 24/7 digital agriculture advisor. Ask me anything about crop health, pest treatments, mandi pricing, weather forecasts, or government subsidies.\n\n*Tap any quick question below to get started!*`;
    this.messages.set([
      { text: welcomeText, fromBot: true, createdAt: new Date().toISOString() }
    ]);
  }

  sendMessage(presetQuery?: string): void {
    const textToSend = presetQuery || this.userInput.trim();
    if (!textToSend && !this.selectedImageUrl) return;

    const userMsg: ChatMessage = {
      text: textToSend + (this.selectedImageFileName ? `\n[Uploaded Image: ${this.selectedImageFileName}]` : ''),
      fromBot: false,
      createdAt: new Date().toISOString()
    };

    this.messages.update(list => [...list, userMsg]);
    this.userInput = '';
    this.isEscalated.set(false);
    const currentImageUrl = this.selectedImageUrl;
    this.clearImage();
    this.loading.set(true);
    setTimeout(() => this.scrollToBottom(), 50);

    const payload = {
      message: textToSend,
      category: this.selectedCategory(),
      language: this.auth.currentUser()?.preferredLanguage || 'en',
      imageUrl: currentImageUrl
    };

    this.api.post<any>('/api/ai-chat/query', payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res && res.answer) {
          const botMsg: ChatMessage = {
            text: res.answer,
            fromBot: true,
            createdAt: new Date().toISOString()
          };
          this.messages.update(list => [...list, botMsg]);
          setTimeout(() => this.scrollToBottom(), 50);
        }
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Error querying AI Bot:', err);
        this.toastr.error('Unable to reach AI server. Please try again.');
      }
    });
  }

  escalateToExpert(): void {
    if (this.isEscalated()) {
      this.toastr.info('Your session is already in the Agronomist Expert queue.');
      return;
    }

    const reason = 'Farmer requested live chat handover to human Agronomist Expert from AI Chatbot interface.';
    this.api.post<any>('/api/ai-chat/escalate', { reason }).subscribe({
      next: (res) => {
        this.isEscalated.set(true);
        this.escalationStatus.set('Transferred to Human Expert Queue');
        this.toastr.success('Chat transferred to Human Expert queue! An expert will connect shortly.');
        
        const botNotice: ChatMessage = {
          text: `### 🚨 Expert Escalation Initiated\n\nYour conversation and diagnostic summary have been forwarded to FarmSetu's verified Agronomist team.\n\n- **Status**: WAITING_FOR_EXPERT\n- **Queue Position**: Next in line\n\nYou can also monitor or chat directly in [Farm Chat](/app/farm-chat).`,
          fromBot: true,
          createdAt: new Date().toISOString()
        };
        this.messages.update(list => [...list, botNotice]);
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: (err) => {
        console.error('Escalation failed:', err);
        this.toastr.error(err?.error?.message || 'Failed to transfer chat to expert.');
      }
    });
  }

  clearChat(): void {
    if (confirm('Are you sure you want to clear AI chat history?')) {
      this.api.delete('/api/ai-chat/history').subscribe({
        next: () => {
          this.toastr.success('Chat history cleared.');
          this.addWelcomeMessage();
          this.isEscalated.set(false);
        },
        error: (err) => {
          console.error('Failed to clear chat:', err);
        }
      });
    }
  }

  triggerImageUpload(): void {
    this.imageFileInput.nativeElement.click();
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedImageFileName = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.selectedImageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  clearImage(): void {
    this.selectedImageUrl = '';
    this.selectedImageFileName = '';
  }

  // Speech Recognition
  private initSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        this.userInput += (this.userInput ? ' ' : '') + transcript;
        this.isRecordingVoice.set(false);
      };

      this.recognition.onerror = () => {
        this.isRecordingVoice.set(false);
        this.toastr.warning('Speech recognition error or microphone denied.');
      };

      this.recognition.onend = () => {
        this.isRecordingVoice.set(false);
      };
    }
  }

  toggleVoiceInput(): void {
    if (!this.recognition) {
      this.toastr.warning('Speech recognition is not supported in this browser.');
      return;
    }

    if (this.isRecordingVoice()) {
      this.recognition.stop();
      this.isRecordingVoice.set(false);
    } else {
      this.isRecordingVoice.set(true);
      try {
        this.recognition.start();
      } catch (e) {
        this.isRecordingVoice.set(false);
      }
    }
  }

  // Text to Speech
  speakText(text: string, index: number): void {
    if (!('speechSynthesis' in window)) {
      this.toastr.warning('Voice playback is not supported in this browser.');
      return;
    }

    if (this.activeSpeechId() === index) {
      window.speechSynthesis.cancel();
      this.activeSpeechId.set(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_|[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;

    utterance.onend = () => {
      this.activeSpeechId.set(null);
    };

    utterance.onerror = () => {
      this.activeSpeechId.set(null);
    };

    this.activeSpeechId.set(index);
    window.speechSynthesis.speak(utterance);
  }

  copyToClipboard(text: string): void {
    const cleanText = text.replace(/[#*`_]/g, '');
    navigator.clipboard.writeText(cleanText).then(() => {
      this.toastr.success('Copied message to clipboard!');
    });
  }

  formatMarkdown(text: string): string {
    if (!text) return '';

    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // 1. Code blocks ```lang\ncode```
    html = html.replace(/```([\s\S]*?)```/gim, (match, p1) => {
      const code = p1.trim();
      return `<pre class="my-2 p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800"><code>${code}</code></pre>`;
    });

    // 2. Inline code `code`
    html = html.replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-mono text-xs rounded-md border border-slate-200 dark:border-slate-700">$1</code>');

    // 3. Tables (| col1 | col2 |)
    html = html.replace(/^\|(.+)\|$/gim, (match) => {
      const cols = match.split('|').filter(c => c.trim() !== '');
      if (cols.every(c => c.trim().startsWith('---') || c.trim().startsWith(':---') || c.trim().startsWith('---:'))) {
        return ''; // Divider line
      }
      const cells = cols.map(c => `<td class="border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs">${c.trim()}</td>`).join('');
      return `<tr>${cells}</tr>`;
    });
    html = html.replace(/(<tr>[\s\S]*?<\/tr>)/gim, '<div class="my-2 overflow-x-auto"><table class="w-full border-collapse border border-slate-200 dark:border-slate-700 text-left rounded-xl overflow-hidden">$1</table></div>');

    // 4. Headers (###### down to #)
    html = html.replace(/^###### (.*$)/gim, '<h6 class="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2 mb-1 font-display">$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5 class="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 mb-1 font-display">$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="text-xs font-bold text-slate-800 dark:text-slate-100 mt-2.5 mb-1 font-display">$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-1 font-display">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-extrabold text-slate-900 dark:text-white mt-3.5 mb-1.5 font-display">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-black text-slate-900 dark:text-white mt-4 mb-2 font-display">$1</h1>');

    // 5. Blockquotes (> quote)
    html = html.replace(/^&gt;\s?(.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 pl-3 my-2 text-slate-600 dark:text-slate-350 italic">$1</blockquote>');

    // 6. Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 font-bold underline hover:text-emerald-700">$1</a>');

    // 7. Bold & Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong class="font-bold italic text-slate-900 dark:text-slate-100">$1</strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-900 dark:text-slate-100">$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

    // 8. Bullet Lists (- item or * item)
    html = html.replace(/^[\-*] (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 my-0.5">$1</li>');
    html = html.replace(/((?:<li class="ml-4 list-disc.*<\/li>\n?)+)/gim, '<ul class="my-1.5 space-y-0.5">$1</ul>');

    // 9. Line breaks
    html = html.replace(/\n/gim, '<br>');

    return html;
  }

  formatTime(isoString?: string): string {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.chatScrollContainer) {
        this.chatScrollContainer.nativeElement.scrollTop = this.chatScrollContainer.nativeElement.scrollHeight;
      }
    } catch (e) {}
  }
}
