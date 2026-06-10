import { Component, OnInit, OnDestroy, inject, signal, effect, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { WebsocketService } from '../../core/services/websocket.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  private readonly sanitizer = inject(DomSanitizer);

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

  // Expert chat session signals
  readonly activeSession = signal<any | null>(null);
  readonly escalationSuggested = signal<boolean>(false);
  readonly queuePosition = signal<number>(1);
  readonly expertTab = signal<'queue' | 'active'>('queue');
  readonly expertQueue = signal<any[]>([]);
  readonly activeExpertSessions = signal<any[]>([]);
  readonly selectedSession = signal<any | null>(null);

  // Websocket subscriptions
  private unsubscribeMessages: (() => void) | null = null;
  private unsubscribeStatus: (() => void) | null = null;
  private unsubscribeExpertQueue: (() => void) | null = null;

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

      // Setup role-based expert/farmer flows
      if (user.role === 'EXPERT' || user.role === 'ADMIN') {
        this.unsubscribeExpertQueue = this.ws.subscribe('/topic/expert-queue', (payload) => {
          this.handleExpertQueueUpdate(payload);
        });
        this.loadExpertQueue();
        this.loadActiveExpertSessions();
      } else {
        // If farmer, check for active sessions on load
        this.api.get<any[]>('/api/expert-chat/my-sessions').subscribe({
          next: (sessions) => {
            const active = sessions.find(s => s.status === 'AI_ACTIVE' || s.status === 'WAITING_FOR_EXPERT' || s.status === 'EXPERT_ACTIVE');
            if (active) {
              this.activeSession.set(active);
              if (active.status === 'EXPERT_ACTIVE' && active.expertId) {
                this.loadExpertUserAndChat(active.expertId, active);
              } else if (active.status === 'WAITING_FOR_EXPERT') {
                this.updateQueuePosition(active.id);
                setTimeout(() => {
                  const aiBot = this.experts().find(e => e.id === -1);
                  if (aiBot) this.selectedExpert.set(aiBot);
                }, 200);
              } else if (active.status === 'AI_ACTIVE') {
                setTimeout(() => {
                  const aiBot = this.experts().find(e => e.id === -1);
                  if (aiBot) this.selectExpert(aiBot);
                }, 200);
              }
            }
          }
        });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.unsubscribeMessages) this.unsubscribeMessages();
    if (this.unsubscribeStatus) this.unsubscribeStatus();
    if (this.unsubscribeExpertQueue) this.unsubscribeExpertQueue();
    this.stopRecordingTimer();
  }

  loadExperts(): void {
    // Define 10 distinct agricultural AI experts trained for specific roles
    const aiBots: Expert[] = [
      {
        id: -1,
        name: 'Crop Disease & Pest Bot',
        role: 'EXPERT',
        profilePhoto: 'https://ui-avatars.com/api/?name=Disease+Bot&background=10b981&color=fff&bold=true&rounded=true',
        bio: 'Your AI Crop Disease & Pest Specialist. I specialize in identifying crop diseases, insect infestations, and offering remedies.',
        specialties: ['Pest Pathology', 'Disease Control', 'Plant Health'],
        rating: 5.0,
        unreadCount: 0
      },
      {
        id: -2,
        name: 'Soil & Nutrient Bot',
        role: 'EXPERT',
        profilePhoto: 'https://ui-avatars.com/api/?name=Soil+Bot&background=8b5cf6&color=fff&bold=true&rounded=true',
        bio: 'Your AI Soil & Nutrient Expert. I specialize in soil health cards, nitrogen/phosphorus/potassium ratios, compost, and fertilizers.',
        specialties: ['Soil Health', 'NPK Ratios', 'Fertilizers'],
        rating: 5.0,
        unreadCount: 0
      },
      {
        id: -3,
        name: 'Market Analyst Bot',
        role: 'EXPERT',
        profilePhoto: 'https://ui-avatars.com/api/?name=Market+Bot&background=f59e0b&color=fff&bold=true&rounded=true',
        bio: 'Your AI Market Analyst & Pricing Advisor. I specialize in Indian mandi rates, MSP, wholesale market trends, and selling advice.',
        specialties: ['Mandi Rates', 'MSP Info', 'Wholesale Trends'],
        rating: 5.0,
        unreadCount: 0
      },
      {
        id: -4,
        name: 'Irrigation Bot',
        role: 'EXPERT',
        profilePhoto: 'https://ui-avatars.com/api/?name=Irrigation+Bot&background=3b82f6&color=fff&bold=true&rounded=true',
        bio: 'Your AI Irrigation Specialist. I specialize in drip/sprinkler systems, water management, harvesting, and conservation.',
        specialties: ['Drip & Sprinkler', 'Water Management', 'Conservation'],
        rating: 5.0,
        unreadCount: 0
      },
      {
        id: -5,
        name: 'Weather Advisor Bot',
        role: 'EXPERT',
        profilePhoto: 'https://ui-avatars.com/api/?name=Weather+Bot&background=06b6d4&color=fff&bold=true&rounded=true',
        bio: 'Your AI Weather Advisory Specialist. I specialize in short and long-term weather forecasting, monsoons, and frost/heatwave mitigation.',
        specialties: ['Weather Forecasts', 'Climate Resilient', 'Frost Mitigation'],
        rating: 5.0,
        unreadCount: 0
      },
      {
        id: -6,
        name: 'Gov Schemes Bot',
        role: 'EXPERT',
        profilePhoto: 'https://ui-avatars.com/api/?name=Schemes+Bot&background=ec4899&color=fff&bold=true&rounded=true',
        bio: 'Your AI Government Schemes Expert. I specialize in Indian agricultural subsidies, PM-Kisan, KCC loans, and crop insurance.',
        specialties: ['Subsidies', 'PM-Kisan', 'KCC Loans'],
        rating: 5.0,
        unreadCount: 0
      },
      {
        id: -7,
        name: 'Seed Selection Bot',
        role: 'EXPERT',
        profilePhoto: 'https://ui-avatars.com/api/?name=Seed+Bot&background=0284c7&color=fff&bold=true&rounded=true',
        bio: 'Your AI Seed Selection Expert. I specialize in high-yield seed varieties, hybrid breeding, treatment, and climate-matching.',
        specialties: ['Seed Varieties', 'Hybrid Breeding', 'Germination'],
        rating: 5.0,
        unreadCount: 0
      },
      {
        id: -8,
        name: 'Organic Farming Bot',
        role: 'EXPERT',
        profilePhoto: 'https://ui-avatars.com/api/?name=Organic+Bot&background=16a34a&color=fff&bold=true&rounded=true',
        bio: 'Your AI Organic Farming Consultant. I specialize in natural farming, permaculture, vermicomposting, and biological pest control.',
        specialties: ['Organic Remedies', 'Natural Farming', 'Vermicomposting'],
        rating: 5.0,
        unreadCount: 0
      },
      {
        id: -9,
        name: 'Livestock & Dairy Bot',
        role: 'EXPERT',
        profilePhoto: 'https://ui-avatars.com/api/?name=Livestock+Bot&background=e11d48&color=fff&bold=true&rounded=true',
        bio: 'Your AI Livestock and Dairy Expert. I specialize in cattle health, poultry feed, veterinary first-aid, and milk production.',
        specialties: ['Cattle Health', 'Poultry Feed', 'Milk Production'],
        rating: 5.0,
        unreadCount: 0
      },
      {
        id: -10,
        name: 'Farm Machinery Bot',
        role: 'EXPERT',
        profilePhoto: 'https://ui-avatars.com/api/?name=Machinery+Bot&background=4b5563&color=fff&bold=true&rounded=true',
        bio: 'Your AI Farm Machinery & Drone Specialist. I specialize in smart tractors, drone spraying, harvesters, and tools.',
        specialties: ['Smart Tractors', 'Drone Spraying', 'Implements'],
        rating: 5.0,
        unreadCount: 0
      }
    ];

    this.api.get<any[]>('/api/users').subscribe({
      next: (users) => {
        const expertsOnly = users.filter(u => u.role === 'EXPERT' && u.id !== this.currentUser?.id && u.id >= 0);
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

        this.experts.set([...aiBots, ...mapped]);

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
    this.escalationSuggested.set(false);

    if (expert.id < 0) {
      this.api.post<any>('/api/expert-chat/sessions', {}).subscribe({
        next: (session) => {
          this.activeSession.set(session);
          if (session.status === 'EXPERT_ACTIVE' && session.expertId) {
            this.loadExpertUserAndChat(session.expertId, session);
          } else {
            // Load chat history for the AI Bot
            this.api.get<any[]>(`/api/chats/${expert.id}?size=50`).subscribe({
              next: (msgs) => {
                const ordered = [...msgs].reverse();
                
                const welcomeMsg = {
                  id: 0,
                  senderId: expert.id,
                  receiverId: this.currentUser?.id || 0,
                  messageText: `Hello! I am your ${expert.name}. ${expert.bio}`,
                  messageType: 'TEXT' as const,
                  read: true,
                  pinned: false,
                  createdAt: new Date().toISOString()
                };

                // Prepend welcome message to the history
                this.messages.set([welcomeMsg, ...ordered]);

                if (session.status === 'WAITING_FOR_EXPERT') {
                  this.updateQueuePosition(session.id);
                }
              },
              error: () => {
                // Fallback to welcome message if history retrieval fails
                this.messages.set([
                  {
                    id: 0,
                    senderId: expert.id,
                    receiverId: this.currentUser?.id || 0,
                    messageText: `Hello! I am your ${expert.name}. ${expert.bio}`,
                    messageType: 'TEXT',
                    read: true,
                    pinned: false,
                    createdAt: new Date().toISOString()
                  }
                ]);
              }
            });
          }
        }
      });
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

  loadExpertUserAndChat(expertId: number, session: any): void {
    const found = this.experts().find(e => e.id === expertId);
    if (found) {
      this.selectedExpert.set(found);
      this.selectExpert(found);
      this.activeSession.set(session);
    } else {
      this.api.get<any[]>(`/api/users`).subscribe({
        next: (users) => {
          const user = users.find(u => u.id === expertId);
          const mappedExpert: Expert = user ? {
            id: user.id,
            name: user.name,
            role: 'EXPERT',
            profilePhoto: user.profilePhoto,
            bio: 'Certified Expert',
            specialties: ['General Agronomy'],
            rating: 4.8,
            unreadCount: 0
          } : {
            id: expertId,
            name: session.expertName || 'Expert',
            role: 'EXPERT',
            profilePhoto: session.expertPhoto,
            bio: 'Certified Expert',
            specialties: ['General Agronomy'],
            rating: 4.8,
            unreadCount: 0
          };
          this.experts.update(list => [...list, mappedExpert]);
          this.selectedExpert.set(mappedExpert);
          this.selectExpert(mappedExpert);
          this.activeSession.set(session);
        }
      });
    }
  }

  sendMessage(): void {
    if (!this.messageText.trim() || !this.selectedExpert() || !this.currentUser) return;

    const text = this.messageText;
    this.messageText = '';

    const selectedBot = this.selectedExpert();
    if (selectedBot && selectedBot.id < 0) {
      const userMsg = {
        id: Date.now(),
        senderId: this.currentUser.id,
        receiverId: selectedBot.id,
        messageText: text,
        messageType: 'TEXT' as const,
        read: true,
        pinned: false,
        createdAt: new Date().toISOString()
      };
      
      this.messages.update(list => [...list, userMsg]);
      this.isAiLoading.set(true);

      const sess = this.activeSession();

      this.api.post<any>('/api/ai/chat', { 
        message: text,
        sessionId: sess ? sess.id : null,
        botId: selectedBot.id
      }).subscribe({
        next: (res) => {
          this.isAiLoading.set(false);
          const aiMsg = {
            id: Date.now() + 1,
            senderId: selectedBot.id,
            receiverId: this.currentUser?.id || 0,
            messageText: res.reply || JSON.stringify(res),
            messageType: 'TEXT' as const,
            read: true,
            pinned: false,
            createdAt: new Date().toISOString()
          };
          this.messages.update(list => [...list, aiMsg]);

          if (res.escalationSuggested) {
            this.escalationSuggested.set(true);
          }

          if (sess) {
            this.api.get<any>(`/api/expert-chat/sessions/${sess.id}`).subscribe({
              next: (updatedSess) => {
                this.activeSession.set(updatedSess);
              }
            });
          }
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
    if (payload.type === 'EXPERT_JOINED') {
      this.api.get<any>(`/api/expert-chat/sessions/${payload.sessionId}`).subscribe({
        next: (session) => {
          this.activeSession.set(session);
          this.loadExpertUserAndChat(payload.expertId, session);
          this.messages.update(list => [
            ...list,
            {
              id: Date.now(),
              senderId: -2,
              receiverId: this.currentUser?.id || 0,
              messageText: payload.message,
              messageType: 'TEXT',
              read: true,
              pinned: false,
              createdAt: new Date().toISOString()
            }
          ]);
        }
      });
      return;
    }

    if (payload.type === 'SESSION_RESOLVED') {
      this.api.get<any>(`/api/expert-chat/sessions/${payload.sessionId}`).subscribe({
        next: (session) => {
          this.activeSession.set(session);
          this.messages.update(list => [
            ...list,
            {
              id: Date.now(),
              senderId: -2,
              receiverId: this.currentUser?.id || 0,
              messageText: 'This advisory session has been resolved by the expert.',
              messageType: 'TEXT',
              read: true,
              pinned: false,
              createdAt: new Date().toISOString()
            }
          ]);
        }
      });
      return;
    }

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

  escalateSession(): void {
    const session = this.activeSession();
    if (!session) return;

    const reason = prompt('Please describe your query briefly for the expert:', 'Need agronomy advice for crop issue');
    if (reason === null) return;

    this.api.put<any>(`/api/expert-chat/sessions/${session.id}/escalate`, { reason }).subscribe({
      next: (res) => {
        this.activeSession.set(res);
        this.escalationSuggested.set(false);
        this.updateQueuePosition(res.id);
      }
    });
  }

  updateQueuePosition(sessionId: number): void {
    this.api.get<any[]>('/api/expert-chat/queue').subscribe({
      next: (queue) => {
        const idx = queue.findIndex(s => s.id === sessionId);
        this.queuePosition.set(idx >= 0 ? idx + 1 : 1);
      }
    });
  }

  loadExpertQueue(): void {
    this.api.get<any[]>('/api/expert-chat/queue').subscribe({
      next: (queue) => {
        this.expertQueue.set(queue);
      }
    });
  }

  loadActiveExpertSessions(): void {
    this.api.get<any[]>('/api/expert-chat/active-sessions').subscribe({
      next: (sessions) => {
        this.activeExpertSessions.set(sessions);
      }
    });
  }

  handleExpertQueueUpdate(payload: any): void {
    if (payload && payload.type === 'QUEUE_UPDATE') {
      this.expertQueue.set(payload.queue);
    }
  }

  acceptSession(session: any): void {
    this.api.put<any>(`/api/expert-chat/sessions/${session.id}/accept`, {}).subscribe({
      next: (updatedSession) => {
        this.expertQueue.update(q => q.filter(s => s.id !== session.id));
        this.activeExpertSessions.update(a => [...a, updatedSession]);
        this.selectSession(updatedSession);
      }
    });
  }

  resolveSession(session: any): void {
    this.api.put<any>(`/api/expert-chat/sessions/${session.id}/resolve`, {}).subscribe({
      next: (updatedSession) => {
        this.activeExpertSessions.update(a => a.filter(s => s.id !== session.id));
        this.selectedExpert.set(null);
        this.activeSession.set(null);
        this.selectedSession.set(null);
      }
    });
  }

  selectSession(session: any): void {
    this.selectedSession.set(session);
    if (session.status === 'EXPERT_ACTIVE') {
      const partner: Expert = {
        id: session.farmerId,
        name: session.farmerName,
        role: 'FARMER',
        profilePhoto: session.farmerPhoto,
        bio: `Farmer from ${session.farmerDistrict || ''}, ${session.farmerState || ''}`,
        specialties: ['Farmer', session.farmerDistrict || '', session.farmerState || ''].filter(Boolean),
        rating: 5.0,
        unreadCount: 0
      };
      this.selectedExpert.set(partner);
      this.activeSession.set(session);

      this.api.get<ChatMessage[]>(`/api/chats/${partner.id}?size=50`).subscribe({
        next: (msgs) => {
          const ordered = [...msgs].reverse();
          this.messages.set(ordered);
          this.api.put(`/api/chats/read-all/${partner.id}`, {}).subscribe();
        }
      });
    }
  }

  startNewAiSession(): void {
    this.api.post<any>('/api/expert-chat/sessions', {}).subscribe({
      next: (session) => {
        this.activeSession.set(session);
        const currentBot = this.selectedExpert() && this.selectedExpert()!.id < 0 ? this.selectedExpert() : this.experts().find(e => e.id === -1);
        this.selectedExpert.set(currentBot || null);
        this.messages.set([
          {
            id: 0,
            senderId: currentBot ? currentBot.id : -1,
            receiverId: this.currentUser?.id || 0,
            messageText: currentBot ? `Hello! I am your ${currentBot.name}. ${currentBot.bio}` : 'Hello! I am your FarmSetu AI Agricultural Assistant.',
            messageType: 'TEXT',
            read: true,
            pinned: false,
            createdAt: new Date().toISOString()
          }
        ]);
      }
    });
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
    if (userId < 0) return true; // AI is always online
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
    if (this.selectedExpert() && this.selectedExpert()!.id < 0) {
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

    if (this.selectedExpert() && this.selectedExpert()!.id < 0) {
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

  renderMessageText(text: string): SafeHtml {
    if (!text) return this.sanitizer.bypassSecurityTrustHtml('');
    
    // First escape HTML characters to prevent XSS
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // Headings
    escaped = escaped.replace(/^### (.*?)$/gm, '<h3 class="text-sm font-bold mt-2 mb-1">$1</h3>');
    escaped = escaped.replace(/^## (.*?)$/gm, '<h2 class="text-base font-bold mt-3 mb-1.5">$1</h2>');
    escaped = escaped.replace(/^# (.*?)$/gm, '<h1 class="text-lg font-bold mt-4 mb-2">$1</h1>');

    // Bold (**text**)
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic (*text*)
    escaped = escaped.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Bullet lists (- text or * text)
    escaped = escaped.replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li class="ml-4 list-disc">$1</li>');
    
    // Ordered lists (1. text)
    escaped = escaped.replace(/^\s*(\d+)\.\s+(.*?)$/gm, '<div class="ml-2 my-1"><span class="font-semibold">$1.</span> $2</div>');

    // Line breaks
    escaped = escaped.replace(/\n/g, '<br>');

    return this.sanitizer.bypassSecurityTrustHtml(escaped);
  }

  scrollToBottom(): void {
    try {
      this.messageArea.nativeElement.scrollTop = this.messageArea.nativeElement.scrollHeight;
    } catch (err) {
      // ignore
    }
  }
}
