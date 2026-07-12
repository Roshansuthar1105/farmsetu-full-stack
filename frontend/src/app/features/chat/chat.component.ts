import { Component, OnInit, OnDestroy, inject, signal, effect, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
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
  isAi?: boolean;
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
  readonly storeAiChats = signal<boolean>(localStorage.getItem('fs_store_ai_chats') !== 'false');

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

  // Polling interval
  private pollingInterval: any = null;

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
      // Register presence as online via REST API
      this.api.post('/api/chats/presence?online=true', {}).subscribe({
        error: (err) => console.error('Error registering presence online:', err)
      });

      // Load experts & online status
      this.loadExperts();
      this.loadOnlineUsers();

      // Setup role-based expert/farmer flows
      if (user.role === 'EXPERT' || user.role === 'ADMIN') {
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
                  const aiBot = this.experts().find(e => e.isAi);
                  if (aiBot) this.selectedExpert.set(aiBot);
                }, 200);
              } else if (active.status === 'AI_ACTIVE') {
                setTimeout(() => {
                  const aiBot = this.experts().find(e => e.isAi);
                  if (aiBot) this.selectExpert(aiBot);
                }, 200);
              }
            }
          },
          error: (err) => {
            console.error('Error fetching my-sessions:', err);
          }
        });
      }

      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    // Register presence as offline via REST API
    this.api.post('/api/chats/presence?online=false', {}).subscribe({
      error: (err) => console.error('Error registering presence offline:', err)
    });
    this.stopRecordingTimer();
  }

  startPolling(): void {
    if (this.pollingInterval) return;
    this.pollingInterval = setInterval(() => {
      this.pollUpdates();
    }, 3000);
  }

  pollUpdates(): void {
    const user = this.currentUser;
    if (!user) return;

    // 1. Poll online status
    this.loadOnlineUsers();

    // 2. Poll active expert queue and active sessions if expert/admin
    if (user.role === 'EXPERT' || user.role === 'ADMIN') {
      this.loadExpertQueue();
      this.loadActiveExpertSessions();
    }

    // 3. Poll current expert/farmer chat history if standard chat is open and not AI bot
    const activeExpert = this.selectedExpert();
    if (activeExpert && !this.isAiBot(activeExpert.id)) {
      this.api.get<ChatMessage[]>(`/api/chats/${activeExpert.id}?size=50`, undefined, { 'X-Skip-Loader': 'true' }).subscribe({
        next: (msgs) => {
          const ordered = [...msgs].reverse();
          const currentMsgs = this.messages();
          const hasChanges = currentMsgs.length !== ordered.length ||
            currentMsgs.some((m, i) => m.id !== ordered[i]?.id || m.read !== ordered[i]?.read || m.pinned !== ordered[i]?.pinned);
          
          if (hasChanges) {
            this.messages.set(ordered);
            // Mark all read if there are unread messages from the other user
            const hasUnread = ordered.some(m => !m.read && m.senderId !== this.currentUser?.id);
            if (hasUnread) {
              this.api.put(`/api/chats/read-all/${activeExpert.id}`, {}).subscribe({
                next: () => {
                  activeExpert.unreadCount = 0;
                }
              });
            }
          }
        },
        error: (err) => console.error('Error polling conversation history:', err)
      });
    }

    // 4. Poll farmer session status
    if (user.role === 'FARMER') {
      this.api.get<any[]>('/api/expert-chat/my-sessions', undefined, { 'X-Skip-Loader': 'true' }).subscribe({
        next: (sessions) => {
          const active = sessions.find(s => s.status === 'AI_ACTIVE' || s.status === 'WAITING_FOR_EXPERT' || s.status === 'EXPERT_ACTIVE');
          if (active) {
            const currentActive = this.activeSession();
            if (!currentActive || currentActive.status !== active.status || currentActive.expertId !== active.expertId) {
              this.activeSession.set(active);
              if (active.status === 'EXPERT_ACTIVE' && active.expertId) {
                this.loadExpertUserAndChat(active.expertId, active);
              } else if (active.status === 'WAITING_FOR_EXPERT') {
                this.updateQueuePosition(active.id);
              }
            }
          } else {
            if (this.activeSession()) {
              this.activeSession.set(null);
            }
          }
        },
        error: (err) => console.error('Error polling my-sessions:', err)
      });
    }
  }

  loadExperts(): void {
    this.api.get<any[]>('/api/users').subscribe({
      next: (users) => {
        // Filter to only keep users with role = 'EXPERT' or isAi = true
        const filteredUsers = users.filter(u => u.role === 'EXPERT' || u.isAi || (u as any).ai);

        // Filter out regular experts (excluding current user and AI bots)
        const expertsOnly = filteredUsers.filter(u => u.id !== this.currentUser?.id && !u.isAi && !(u as any).ai);
        
        // Find the single AI Assistant if present in the list
        const aiBotUser = filteredUsers.find(u => u.isAi || (u as any).ai);
        
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
            unreadCount: 0,
            isAi: false
          };
        });

        const finalExpertsList: Expert[] = [];
        if (aiBotUser) {
          finalExpertsList.push({
            id: aiBotUser.id,
            name: aiBotUser.name,
            role: 'EXPERT',
            profilePhoto: aiBotUser.profilePhoto || 'https://ui-avatars.com/api/?name=AI+Assistant&background=10b981&color=fff&bold=true&rounded=true',
            bio: aiBotUser.bio || 'Your AI Agricultural Assistant. I can help with crop disease, soil health, mandi rates, and irrigation advice.',
            specialties: ['AI Diagnostic', 'Soil Health', 'Market Trends'],
            rating: 5.0,
            unreadCount: 0,
            isAi: true
          });
        }

        finalExpertsList.push(...mapped);
        this.experts.set(finalExpertsList);

        // Load last message mock metadata if needed
        mapped.forEach(c => {
          this.api.get<ChatMessage[]>(`/api/chats/${c.id}?page=0&size=1`, undefined, { 'X-Skip-Loader': 'true' }).subscribe({
            next: (msgs) => {
              if (msgs && msgs.length > 0) {
                c.unreadCount = msgs.filter(m => m.senderId === c.id && !m.read).length;
              }
            },
            error: (err) => {
              console.error(`Error loading unread counts for expert ${c.id}:`, err);
            }
          });
        });
      },
      error: (err) => {
        console.error('Error loading experts:', err);
      }
    });
  }

  loadOnlineUsers(): void {
    this.api.get<number[]>('/api/chats/online', undefined, { 'X-Skip-Loader': 'true' }).subscribe({
      next: (ids) => {
        this.onlineUserIds.set(new Set(ids));
      },
      error: (err) => {
        console.error('Error loading online users:', err);
      }
    });
  }

  selectExpert(expert: Expert): void {
    this.selectedExpert.set(expert);
    this.messages.set([]);
    this.escalationSuggested.set(false);

    if (this.isAiBot(expert.id)) {
      if (this.currentUser?.role !== 'FARMER') {
        // Load chat history directly without a session
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
            this.messages.set([welcomeMsg, ...ordered]);
          },
          error: () => {
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
        return;
      }

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
        },
        error: (err) => {
          console.error('Error starting AI session:', err);
        }
      });
      return;
    }

    this.activeSession.set(null);
    this.api.get<any[]>('/api/expert-chat/my-sessions').subscribe({
      next: (sessions) => {
        const matchingSession = sessions.find(s => 
          s.expertId === expert.id && (s.status === 'EXPERT_ACTIVE' || s.status === 'WAITING_FOR_EXPERT')
        );
        if (matchingSession) {
          this.activeSession.set(matchingSession);
        }
      },
      error: (err) => {
        console.error('Error fetching sessions for selected expert:', err);
      }
    });

    // Load expert chat history
    this.api.get<ChatMessage[]>(`/api/chats/${expert.id}?size=50`).subscribe({
      next: (msgs) => {
        const ordered = [...msgs].reverse();
        this.messages.set(ordered);
        
        // Mark read
        this.api.put(`/api/chats/read-all/${expert.id}`, {}).subscribe({
          next: () => {
            expert.unreadCount = 0;
          },
          error: (err) => {
            console.error(`Error marking chats read for ${expert.id}:`, err);
          }
        });
      },
      error: (err) => {
        console.error(`Error loading chat history for ${expert.id}:`, err);
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
        },
        error: (err) => {
          console.error('Error fetching users in loadExpertUserAndChat:', err);
        }
      });
    }
  }

  sendMessage(): void {
    if (!this.messageText.trim() || !this.selectedExpert() || !this.currentUser) return;

    const text = this.messageText;
    this.messageText = '';

    const selectedBot = this.selectedExpert();
    if (selectedBot && this.isAiBot(selectedBot.id)) {
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
        botId: selectedBot.id,
        storeHistory: this.storeAiChats()
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
              },
              error: (err) => {
                console.error('Error fetching session update:', err);
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

    const body = {
      receiverId: this.selectedExpert()?.id || 0,
      message: text,
      messageType: 'TEXT',
      mediaUrl: ''
    };

    this.api.post<any>('/api/chats/send', body).subscribe({
      next: (msg) => {
        this.messages.update(list => {
          if (!list.some(m => m.id === msg.id)) {
            return [...list, msg];
          }
          return list;
        });
        this.scrollToBottom();
      },
      error: (err) => console.error('Error sending chat message:', err)
    });
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
      },
      error: (err) => {
        console.error('Error escalating session:', err);
      }
    });
  }

  updateQueuePosition(sessionId: number): void {
    this.api.get<any[]>('/api/expert-chat/queue', undefined, { 'X-Skip-Loader': 'true' }).subscribe({
      next: (queue) => {
        const idx = queue.findIndex(s => s.id === sessionId);
        this.queuePosition.set(idx >= 0 ? idx + 1 : 1);
      },
      error: (err) => {
        console.error('Error updating queue position:', err);
      }
    });
  }

  loadExpertQueue(): void {
    this.api.get<any[]>('/api/expert-chat/queue', undefined, { 'X-Skip-Loader': 'true' }).subscribe({
      next: (queue) => {
        this.expertQueue.set(queue);
      },
      error: (err) => {
        console.error('Error loading expert queue:', err);
      }
    });
  }

  loadActiveExpertSessions(): void {
    this.api.get<any[]>('/api/expert-chat/active-sessions', undefined, { 'X-Skip-Loader': 'true' }).subscribe({
      next: (sessions) => {
        this.activeExpertSessions.set(sessions);
      },
      error: (err) => {
        console.error('Error loading active expert sessions:', err);
      }
    });
  }



  acceptSession(session: any): void {
    this.api.put<any>(`/api/expert-chat/sessions/${session.id}/accept`, {}).subscribe({
      next: (updatedSession) => {
        this.expertQueue.update(q => q.filter(s => s.id !== session.id));
        this.activeExpertSessions.update(a => [...a, updatedSession]);
        this.selectSession(updatedSession);
      },
      error: (err) => {
        console.error('Error accepting session:', err);
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
      },
      error: (err) => {
        console.error('Error resolving session:', err);
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
          this.api.put(`/api/chats/read-all/${partner.id}`, {}).subscribe({
            error: (err) => console.error(`Error marking chat read-all for partner ${partner.id}:`, err)
          });
        },
        error: (err) => {
          console.error(`Error loading chat history for partner ${partner.id}:`, err);
        }
      });
    }
  }

  startNewAiSession(): void {
    this.api.post<any>('/api/expert-chat/sessions', {}).subscribe({
      next: (session) => {
        this.activeSession.set(session);
        const currentBot = this.selectedExpert() && this.isAiBot(this.selectedExpert()!.id) ? this.selectedExpert() : this.experts().find(e => e.isAi);
        this.selectedExpert.set(currentBot || null);
        if (currentBot) {
          this.messages.set([
            {
              id: 0,
              senderId: currentBot.id,
              receiverId: this.currentUser?.id || 0,
              messageText: `Hello! I am your ${currentBot.name}. ${currentBot.bio}`,
              messageType: 'TEXT',
              read: true,
              pinned: false,
              createdAt: new Date().toISOString()
            }
          ]);
        }
      },
      error: (err) => {
        console.error('Error starting new AI session:', err);
      }
    });
  }



  isAiBot(id: number | undefined): boolean {
    if (id === undefined) return false;
    const exp = this.experts().find(e => e.id === id);
    return !!exp?.isAi;
  }

  isOnline(userId: number): boolean {
    if (this.isAiBot(userId)) return true; // AI is always online
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
    if (this.selectedExpert() && this.isAiBot(this.selectedExpert()!.id)) {
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
        
        const body = {
          receiverId: this.selectedExpert()?.id || 0,
          message: file.name,
          messageType: type,
          mediaUrl: fileUrl
        };
        this.api.post<any>('/api/chats/send', body).subscribe({
          next: (msg) => {
            this.messages.update(list => {
              if (!list.some(m => m.id === msg.id)) {
                return [...list, msg];
              }
              return list;
            });
            this.scrollToBottom();
          },
          error: (err) => console.error('Error sending file message:', err)
        });
      },
      error: (err) => {
        console.error('Error uploading file:', err);
        alert('File upload failed. Please try again.');
      }
    });
  }

  // Voice recording
  startRecording(): void {
    if (this.isRecording()) return;

    if (this.selectedExpert() && this.isAiBot(this.selectedExpert()!.id)) {
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
        const body = {
          receiverId: this.selectedExpert()?.id || 0,
          message: 'Voice message',
          messageType: 'VOICE',
          mediaUrl: fileUrl
        };
        this.api.post<any>('/api/chats/send', body).subscribe({
          next: (msg) => {
            this.messages.update(list => {
              if (!list.some(m => m.id === msg.id)) {
                return [...list, msg];
              }
              return list;
            });
            this.scrollToBottom();
          },
          error: (err) => console.error('Error sending voice message:', err)
        });
      },
      error: (err) => {
        console.error('Error uploading voice note:', err);
        alert('Voice note upload failed. Please try again.');
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

  toggleStoreAiChats(event: any): void {
    const val = event.target.checked;
    this.storeAiChats.set(val);
    localStorage.setItem('fs_store_ai_chats', val.toString());
  }

  clearAiChatHistory(): void {
    const selectedBot = this.selectedExpert();
    if (!selectedBot || !this.isAiBot(selectedBot.id)) return;

    if (!confirm('Are you sure you want to clear your AI chat history? This cannot be undone.')) {
      return;
    }

    this.api.delete(`/api/ai/chat/${selectedBot.id}`).subscribe({
      next: () => {
        // Clear local messages list except welcome message
        const welcomeMsg = {
          id: 0,
          senderId: selectedBot.id,
          receiverId: this.currentUser?.id || 0,
          messageText: `Hello! I am your ${selectedBot.name}. ${selectedBot.bio}`,
          messageType: 'TEXT' as const,
          read: true,
          pinned: false,
          createdAt: new Date().toISOString()
        };
        this.messages.set([welcomeMsg]);
      },
      error: (err) => {
        console.error('Error clearing AI chat history:', err);
        alert('Failed to clear AI chat history. Please try again.');
      }
    });
  }

  scrollToBottom(): void {
    try {
      this.messageArea.nativeElement.scrollTop = this.messageArea.nativeElement.scrollHeight;
    } catch (err) {
      // ignore
    }
  }
}
