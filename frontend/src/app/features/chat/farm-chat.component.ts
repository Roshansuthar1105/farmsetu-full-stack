import { Component, OnInit, OnDestroy, inject, signal, effect, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';

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

@Component({
  selector: 'fs-farm-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './farm-chat.component.html',
  styleUrls: ['./farm-chat.component.scss']
})
export class FarmChatComponent implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly ws = inject(WebsocketService);
  private readonly toastr = inject(ToastrService);

  @ViewChild('messageArea') private messageArea!: ElementRef;
  @ViewChild('fileInput') private fileInput!: ElementRef;

  windowWidth = window.innerWidth;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.windowWidth = window.innerWidth;
  }

  readonly contacts = signal<any[]>([]);
  readonly onlineUserIds = signal<Set<number>>(new Set());
  readonly selectedContact = signal<any | null>(null);
  readonly messages = signal<ChatMessage[]>([]);

  readonly searchQuery = signal('');
  readonly chatSearchQuery = signal('');
  readonly showChatSearch = signal(false);
  readonly showInfoDrawer = signal(false);

  // Message input
  messageText = '';

  // Recording voice notes
  readonly isRecording = signal(false);
  readonly recordingDuration = signal(0);
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingInterval: any = null;

  // Connection
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

      // Load contacts & online status
      this.loadContacts();
      this.loadOnlineUsers();
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribeMessages) this.unsubscribeMessages();
    if (this.unsubscribeStatus) this.unsubscribeStatus();
    this.stopRecordingTimer();
  }

  loadContacts(): void {
    this.api.get<any[]>('/api/users', { is_user: true }).subscribe({
      next: (users) => {
        const filtered = users.filter(u => u.id !== this.currentUser?.id && !u.isAi && !(u as any).ai);
        // Map mock last messages
        const contactsWithMsg = filtered.map(u => ({
          ...u,
          lastMessage: '',
          lastMessageTime: '',
          unreadCount: 0,
          pinned: false
        }));
        this.contacts.set(contactsWithMsg);

        // Load initial conversation lists to fetch last messages/unread counts if needed
        contactsWithMsg.forEach(c => {
          this.api.get<ChatMessage[]>(`/api/chats/${c.id}?page=0&size=1`).subscribe({
            next: (msgs) => {
              if (msgs && msgs.length > 0) {
                const last = msgs[0];
                c.lastMessage = last.messageText || (last.messageType === 'IMAGE' ? 'Photo' : last.messageType === 'VOICE' ? 'Voice note' : 'File');
                c.lastMessageTime = last.createdAt;

                // Count unread
                c.unreadCount = msgs.filter(m => m.senderId === c.id && !m.read).length;
              }
            },
            error: (err) => {
              console.error(`Error loading last message for contact ${c.id}:`, err);
            }
          });
        });
      },
      error: (err) => {
        console.error('Error loading contacts:', err);
      }
    });
  }

  loadOnlineUsers(): void {
    this.api.get<number[]>('/api/chats/online').subscribe({
      next: (ids) => {
        this.onlineUserIds.set(new Set(ids));
      },
      error: (err) => {
        console.error('Error loading online users:', err);
      }
    });
  }

  selectContact(contact: any): void {
    this.selectedContact.set(contact);
    this.messages.set([]);
    this.showChatSearch.set(false);
    this.chatSearchQuery.set('');

    // Fetch conversation history
    this.api.get<ChatMessage[]>(`/api/chats/${contact.id}?size=50`).subscribe({
      next: (msgs) => {
        // Backend returns DESC order, reverse for chronological view
        const ordered = [...msgs].reverse();
        this.messages.set(ordered);

        // Mark conversation as read
        this.api.put(`/api/chats/read-all/${contact.id}`, {}).subscribe({
          next: () => {
            contact.unreadCount = 0;
          },
          error: (err) => {
            console.error(`Error marking messages read for ${contact.id}:`, err);
          }
        });
      },
      error: (err) => {
        console.error(`Error loading chat history for ${contact.id}:`, err);
      }
    });
  }

  sendMessage(): void {
    if (!this.messageText.trim() || !this.selectedContact() || !this.currentUser) return;

    const payload = {
      senderId: this.currentUser.id,
      receiverId: this.selectedContact().id,
      messageText: this.messageText,
      messageType: 'TEXT',
      mediaUrl: ''
    };

    this.ws.send('/app/chat.send', payload);
    this.messageText = '';
  }

  handleIncomingSocketPayload(payload: any): void {
    // Check if payload is message
    if (payload.id) {
      const msg = payload as ChatMessage;
      const activeContact = this.selectedContact();

      if (activeContact && (msg.senderId === activeContact.id || msg.senderId === this.currentUser?.id)) {
        // Append to active message list
        this.messages.update(list => {
          if (!list.some(m => m.id === msg.id)) {
            return [...list, msg];
          }
          return list;
        });

        // Mark as read if received from partner and chat is open
        if (msg.senderId === activeContact.id) {
          this.api.put(`/api/chats/${msg.id}/read`, {}).subscribe({
            error: (err) => console.error('Error marking message as read:', err)
          });
        }
      }

      // Update contact list last message
      this.contacts.update(list => {
        return list.map(c => {
          if (c.id === msg.senderId || c.id === msg.receiverId) {
            c.lastMessage = msg.messageText || (msg.messageType === 'IMAGE' ? 'Photo' : msg.messageType === 'VOICE' ? 'Voice note' : 'File');
            c.lastMessageTime = msg.createdAt;
            if (msg.senderId === c.id && (!activeContact || activeContact.id !== c.id)) {
              c.unreadCount++;
            }
          }
          return c;
        });
      });
    }
    // Check if payload is read-all update
    else if (payload.readAll) {
      const partnerId = payload.senderId;
      if (this.selectedContact()?.id === partnerId) {
        this.messages.update(list => {
          return list.map(m => {
            if (m.receiverId === partnerId) {
              m.read = true;
            }
            return m;
          });
        });
      }
    }
    // Check if payload is single message read receipt
    else if (payload.messageId && payload.read) {
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

  togglePinMessage(msg: ChatMessage): void {
    this.api.put(`/api/chats/${msg.id}/pin`, {}).subscribe({
      next: () => {
        this.messages.update(list => {
          return list.map(m => {
            if (m.id === msg.id) {
              m.pinned = !m.pinned;
            }
            return m;
          });
        });
      },
      error: (err) => {
        console.error(`Error toggling pin message ${msg.id}:`, err);
      }
    });
  }

  isOnline(userId: number): boolean {
    return this.onlineUserIds().has(userId);
  }

  get filteredContacts() {
    const q = this.searchQuery().toLowerCase();
    return this.contacts().filter(c => c.name.toLowerCase().includes(q));
  }

  get filteredMessages() {
    const q = this.chatSearchQuery().toLowerCase();
    const list = this.messages();
    if (!q) return list;
    return list; // highlights handled in UI template
  }

  // File sharing
  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file || !this.selectedContact() || !this.currentUser) return;

    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = environment.apiUrl || 'http://localhost:8080';
    this.http.post<any>(`${baseUrl}/api/chats/upload`, formData).subscribe({
      next: (res) => {
        const fileUrl = res.data;
        const type = file.type.startsWith('image/') ? 'IMAGE' : 'FILE';

        const payload = {
          senderId: this.currentUser?.id,
          receiverId: this.selectedContact().id,
          messageText: file.name,
          messageType: type,
          mediaUrl: fileUrl
        };
        this.ws.send('/app/chat.send', payload);
      },
      error: (err) => {
        console.error('Error uploading file:', err);
        this.toastr.error('File upload failed. Please try again.');
      }
    });
  }

  // Voice recording
  startRecording(): void {
    if (this.isRecording()) return;

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
      this.toastr.warning('Microphone access is required to record voice notes.');
    });
  }

  stopRecording(send = true): void {
    if (!this.isRecording() || !this.mediaRecorder) return;

    this.stopRecordingTimer();
    this.isRecording.set(false);

    if (send) {
      this.mediaRecorder.stop();
    } else {
      // Cancel recording
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
    if (!this.selectedContact() || !this.currentUser) return;

    const file = new File([blob], 'voice-note.webm', { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', file);

    const baseUrl = environment.apiUrl || 'http://localhost:8080';
    this.http.post<any>(`${baseUrl}/api/chats/upload`, formData).subscribe({
      next: (res) => {
        const fileUrl = res.data;
        const payload = {
          senderId: this.currentUser?.id,
          receiverId: this.selectedContact().id,
          messageText: 'Voice message',
          messageType: 'VOICE',
          mediaUrl: fileUrl
        };
        this.ws.send('/app/chat.send', payload);
      },
      error: (err) => {
        console.error('Error uploading voice note:', err);
        this.toastr.error('Voice note upload failed. Please try again.');
      }
    });
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

  formatDateHeader(isoString: string): string {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  }

  shouldShowDateHeader(msg: ChatMessage, index: number): boolean {
    if (index === 0) return true;
    const prev = this.messages()[index - 1];
    try {
      const prevDate = new Date(prev.createdAt).toDateString();
      const currDate = new Date(msg.createdAt).toDateString();
      return prevDate !== currDate;
    } catch {
      return false;
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
