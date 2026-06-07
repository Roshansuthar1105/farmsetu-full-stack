import { Component, OnInit, OnDestroy, inject, signal, effect, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  messageText: string;
  messageType: 'TEXT' | 'IMAGE' | 'VOICE' | 'FILE';
  mediaUrl?: string;
  read: boolean;
  pinned: boolean;
  createdAt: string;
}

interface Expert {
  id: number;
  name: string;
  role: string;
  profilePhoto?: string;
  bio?: string;
  specialties: string[];
  rating: number;
  phone?: string;
  preferredLanguage?: string;
  state?: string;
  district?: string;
  village?: string;
  unreadCount?: number;
}

@Component({
  selector: 'fs-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly ws = inject(WebsocketService);

  @ViewChild('messageArea') private messageArea!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef;

  windowWidth = window.innerWidth;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = window.innerWidth;
  }

  readonly experts = signal<Expert[]>([]);
  readonly onlineUserIds = signal<Set<number>>(new Set());
  readonly selectedExpert = signal<Expert | null>(null);
  readonly messages = signal<any[]>([]);
  readonly isAiLoading = signal(false);

  // Search filter
  readonly searchQuery = signal('');

  // Input control
  messageText = '';

  // Recording voice notes
  readonly isRecording = signal(false);
  readonly recordingDuration = signal(0);
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingInterval: any = null;

  // Websocket subscriptions
  private unsubscribeMessages: (() => void) | null = null;
  private unsubscribeStatus: (() => void) | null = null;

  get currentUser() {
    return this.auth.currentUser();
  }

  constructor() {
    // Scroll to bottom when messages update
    effect(() => {
      if (this.messages().length > 0) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  ngOnInit(): void {
    const user = this.currentUser;
    if (user) {
      this.ws.connect(user.id);
      
      // Subscribe to personal queue for messages and read events
      this.unsubscribeMessages = this.ws.subscribe(`/topic/messages/${user.id}`, (payload) => {
        this.handleIncomingSocketPayload(payload);
      });

      // Subscribe to status presence
      this.unsubscribeStatus = this.ws.subscribe('/topic/status', (statusPayload) => {
        this.handleStatusUpdate(statusPayload);
      });

      // Load experts & online status
      this.loadExperts();
      this.loadOnlineUsers();
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribeMessages) this.unsubscribeMessages();
    if (this.unsubscribeStatus) this.unsubscribeStatus();
    this.stopRecordingTimer();
  }

  loadExperts(): void {
    // Add permanent AI bot entry
    const aiBot: Expert = {
      id: -1,
      name: 'FarmSetu AI Assistant',
      role: 'EXPERT',
      profilePhoto: 'assets/ai-avatar.png',
      bio: 'Your automated agricultural expert assistant. Ask me anything about crop diseases, fertilizers, weather advisory or marketplace pricing!',
      specialties: ['AI Botany', 'Instant Support', 'Diseases & Soils'],
      rating: 5.0,
      unreadCount: 0
    };

    this.api.get<any[]>('/api/users').subscribe({
      next: (users) => {
        const expertsOnly = users.filter(u => u.role === 'EXPERT' && u.id !== this.currentUser?.id);
        const mapped = expertsOnly.map(u => {
          let specialties = ['General Agronomy'];
          let rating = 4.8;
          
          if (u.name.toLowerCase().includes('ramesh') || u.id % 3 === 0) {
            specialties = ['Soil Science', 'Fertility'];
            rating = 4.9;
          } else if (u.name.toLowerCase().includes('sunita') || u.id % 3 === 1) {
            specialties = ['Pest Pathology', 'Crop Safety'];
            rating = 4.8;
          } else {
            specialties = ['Irrigation Systems', 'Horticulture'];
            rating = 4.7;
          }
          return {
            ...u,
            specialties,
            rating,
            unreadCount: 0
          };
        });

        this.experts.set([aiBot, ...mapped]);

        // Load last message mock metadata if needed
        mapped.forEach(c => {
          this.api.get<ChatMessage[]>(`/api/chats/${c.id}?page=0&size=1`).subscribe(msgs => {
            if (msgs && msgs.length > 0) {
              c.unreadCount = msgs.filter(m => m.senderId === c.id && !m.read).length;
            }
          });
        });
      }
    });
  }

  loadOnlineUsers(): void {
    this.api.get<number[]>('/api/chats/online').subscribe({
      next: (ids) => {
        this.onlineUserIds.set(new Set(ids));
      }
    });
  }

  selectExpert(expert: Expert): void {
    this.selectedExpert.set(expert);
    this.messages.set([]);

    if (expert.id === -1) {
      // Load AI Welcome
      this.messages.set([
        {
          id: 0,
          senderId: -1,
          receiverId: this.currentUser?.id || 0,
          messageText: 'Hello! I am your FarmSetu AI Agricultural Assistant. Ask me any question related to seeds, fertilizers, mandis, weather or pest controls!',
          messageType: 'TEXT',
          read: true,
          pinned: false,
          createdAt: new Date().toISOString()
        }
      ]);
      return;
    }

    // Load expert chat history
    this.api.get<ChatMessage[]>(`/api/chats/${expert.id}?size=50`).subscribe({
      next: (msgs) => {
        const ordered = [...msgs].reverse();
        this.messages.set(ordered);
        
        // Mark read
        this.api.put(`/api/chats/read-all/${expert.id}`, {}).subscribe(() => {
          expert.unreadCount = 0;
        });
      }
    });
  }

  sendMessage(): void {
    if (!this.messageText.trim() || !this.selectedExpert() || !this.currentUser) return;

    const text = this.messageText;
    this.messageText = '';

    if (this.selectedExpert()?.id === -1) {
      // Send to AI
      const userMsg = {
        id: Date.now(),
        senderId: this.currentUser.id,
        receiverId: -1,
        messageText: text,
        messageType: 'TEXT' as const,
        read: true,
        pinned: false,
        createdAt: new Date().toISOString()
      };
      
      this.messages.update(list => [...list, userMsg]);
      this.isAiLoading.set(true);

      this.api.post<any>('/api/ai/chat', { message: text }).subscribe({
        next: (res) => {
          this.isAiLoading.set(false);
          const aiMsg = {
            id: Date.now() + 1,
            senderId: -1,
            receiverId: this.currentUser?.id || 0,
            messageText: res.reply || JSON.stringify(res),
            messageType: 'TEXT' as const,
            read: true,
            pinned: false,
            createdAt: new Date().toISOString()
          };
          this.messages.update(list => [...list, aiMsg]);
        },
        error: () => {
          this.isAiLoading.set(false);
        }
      });
      return;
    }

    const payload = {
      senderId: this.currentUser.id,
      receiverId: this.selectedExpert()?.id || 0,
      messageText: text,
      messageType: 'TEXT',
      mediaUrl: ''
    };

    this.ws.send('/app/chat.send', payload);
  }

  handleIncomingSocketPayload(payload: any): void {
    if (payload.id) {
      const msg = payload as ChatMessage;
      const activeExpert = this.selectedExpert();

      if (activeExpert && (msg.senderId === activeExpert.id || msg.senderId === this.currentUser?.id)) {
        this.messages.update(list => {
          if (!list.some(m => m.id === msg.id)) {
            return [...list, msg];
          }
          return list;
        });

        if (msg.senderId === activeExpert.id) {
          this.api.put(`/api/chats/${msg.id}/read`, {}).subscribe();
        }
      }

      this.experts.update(list => {
        return list.map(c => {
          if (c.id === msg.senderId && (!activeExpert || activeExpert.id !== c.id)) {
            if (c.unreadCount !== undefined) c.unreadCount++;
          }
          return c;
        });
      });
    } else if (payload.readAll) {
      const partnerId = payload.senderId;
      if (this.selectedExpert()?.id === partnerId) {
        this.messages.update(list => {
          return list.map(m => {
            if (m.receiverId === partnerId) {
              m.read = true;
            }
            return m;
          });
        });
      }
    } else if (payload.messageId && payload.read) {
      this.messages.update(list => {
        return list.map(m => {
          if (m.id === payload.messageId) {
            m.read = true;
          }
          return m;
        });
      });
    }
  }

  handleStatusUpdate(payload: any): void {
    const userId = Number(payload.userId);
    const status = payload.status;
    this.onlineUserIds.update(set => {
      const next = new Set(set);
      if (status === 'ONLINE') {
        next.add(userId);
      } else {
        next.delete(userId);
      }
      return next;
    });
  }

  isOnline(userId: number): boolean {
    if (userId === -1) return true; // AI is always online
    return this.onlineUserIds().has(userId);
  }

  get filteredExperts() {
    const q = this.searchQuery().toLowerCase();
    return this.experts().filter(e => e.name.toLowerCase().includes(q));
  }

  // File uploading
  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file || !this.selectedExpert() || !this.currentUser) return;

    // AI doesn't support attachments in mock
    if (this.selectedExpert()?.id === -1) {
      alert('AI Assistant currently only supports text queries.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = environment.apiUrl || 'http://localhost:8080';
    this.http.post<any>(`${baseUrl}/api/chats/upload`, formData).subscribe({
      next: (res) => {
        const fileUrl = res.data;
        const type = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';
        
        const payload = {
          senderId: this.currentUser?.id,
          receiverId: this.selectedExpert()?.id || 0,
          messageText: file.name,
          messageType: type,
          mediaUrl: fileUrl
        };
        this.ws.send('/app/chat.send', payload);
      }
    });
  }

  // Voice recording
  startRecording(): void {
    if (this.isRecording()) return;

    if (this.selectedExpert()?.id === -1) {
      alert('AI Assistant currently only supports text queries.');
      return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (e) => {
        this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.uploadVoiceNote(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordingDuration.set(0);
      
      this.recordingInterval = setInterval(() => {
        this.recordingDuration.update(d => d + 1);
      }, 1000);
    }).catch(err => {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required to record voice notes.');
    });
  }

  stopRecording(send = true): void {
    if (!this.isRecording() || !this.mediaRecorder) return;

    this.stopRecordingTimer();
    this.isRecording.set(false);

    if (send) {
      this.mediaRecorder.stop();
    } else {
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.stop();
      this.mediaRecorder = null;
    }
  }

  private stopRecordingTimer(): void {
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  private uploadVoiceNote(blob: Blob): void {
    if (!this.selectedExpert() || !this.currentUser) return;

    const file = new File([blob], 'voice-note.webm', { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = environment.apiUrl || 'http://localhost:8080';
    this.http.post<any>(`${baseUrl}/api/chats/upload`, formData).subscribe({
      next: (res) => {
        const fileUrl = res.data;
        const payload = {
          senderId: this.currentUser?.id,
          receiverId: this.selectedExpert()?.id || 0,
          messageText: 'Voice message',
          messageType: 'VOICE',
          mediaUrl: fileUrl
        };
        this.ws.send('/app/chat.send', payload);
      }
    });
  }

  bookVideoCall(): void {
    const expert = this.selectedExpert();
    if (!expert) return;
    alert(`Success: Video Consultation booking request with ${expert.name} initiated! You will receive notification confirmation via SMS shortly.`);
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  formatTime(isoString: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }

  scrollToBottom(): void {
    try {
      this.messageArea.nativeElement.scrollTop = this.messageArea.nativeElement.scrollHeight;
    } catch (err) {
      // ignore
    }
  }
}
