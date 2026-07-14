import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface StompFrame {
  command: string;
  headers: Record<string, string>;
  body: string;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private readonly isConnected = signal(false);
  private readonly subscriptions = new Map<string, Array<(body: any) => void>>();
  private messageQueue: string[] = [];
  private currentUserId: number | null = null;

  connect(userId?: number): void {
    if (userId) {
      this.currentUserId = userId;
    }
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      if (this.socket.readyState === WebSocket.OPEN && this.currentUserId) {
        this.sendPresence(this.currentUserId);
      }
      return;
    }

    const wsBase = environment.wsUrl || 'http://localhost:8080';
    const wsScheme = wsBase.startsWith('https') ? 'wss' : 'ws';
    const hostPath = wsBase.replace(/^https?:\/\//, '');
    const wsUrl = `${wsScheme}://${hostPath}/ws`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.sendFrame('CONNECT', {
          'accept-version': '1.1,1.2',
          'heart-beat': '10000,10000'
        }, '');
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.socket.onclose = () => {
        this.isConnected.set(false);
        setTimeout(() => {
          if (this.currentUserId) {
            this.connect();
          }
        }, 3000);
      };

      this.socket.onerror = () => {
        if (this.socket) {
          this.socket.close();
        }
      };
    } catch (e) {
      console.error('WebSocket connection failed:', e);
    }
  }

  disconnect(): void {
    this.currentUserId = null;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected.set(false);
  }

  subscribe(destination: string, callback: (body: any) => void): () => void {
    if (!this.subscriptions.has(destination)) {
      this.subscriptions.set(destination, []);
      if (this.isConnected()) {
        this.sendFrame('SUBSCRIBE', {
          id: `sub-${destination}`,
          destination: destination
        }, '');
      }
    }

    this.subscriptions.get(destination)!.push(callback);

    return () => {
      const list = this.subscriptions.get(destination);
      if (list) {
        const index = list.indexOf(callback);
        if (index >= 0) {
          list.splice(index, 1);
        }
        if (list.length === 0) {
          this.subscriptions.delete(destination);
          if (this.isConnected()) {
            this.sendFrame('UNSUBSCRIBE', {
              id: `sub-${destination}`
            }, '');
          }
        }
      }
    };
  }

  send(destination: string, payload: any): void {
    const bodyString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    this.sendFrame('SEND', {
      destination: destination,
      'content-type': 'application/json'
    }, bodyString);
  }

  private sendPresence(userId: number): void {
    this.send('/app/chat.online', { userId });
  }

  private sendFrame(command: string, headers: Record<string, string>, body: string): void {
    let frame = `${command}\n`;
    for (const key of Object.keys(headers)) {
      frame += `${key}:${headers[key]}\n`;
    }
    frame += `\n${body}\u0000`;

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(frame);
    } else {
      this.messageQueue.push(frame);
    }
  }

  private handleMessage(rawData: string): void {
    const frame = this.parseFrame(rawData);
    if (!frame) return;

    if (frame.command === 'CONNECTED') {
      this.isConnected.set(true);
      if (this.currentUserId) {
        this.sendPresence(this.currentUserId);
      }
      for (const dest of this.subscriptions.keys()) {
        this.sendFrame('SUBSCRIBE', {
          id: `sub-${dest}`,
          destination: dest
        }, '');
      }
      const queue = [...this.messageQueue];
      this.messageQueue = [];
      queue.forEach(f => this.socket?.send(f));
    } else if (frame.command === 'MESSAGE') {
      const destination = frame.headers['destination'];
      if (destination && this.subscriptions.has(destination)) {
        let parsedBody = frame.body;
        try {
          parsedBody = JSON.parse(frame.body);
        } catch {
          // ignore
        }
        this.subscriptions.get(destination)!.forEach(cb => cb(parsedBody));
      }
    }
  }

  private parseFrame(raw: string): StompFrame | null {
    const nullIdx = raw.indexOf('\u0000');
    const data = nullIdx >= 0 ? raw.substring(0, nullIdx) : raw;
    const parts = data.split('\n\n');
    if (parts.length < 1) return null;
    const headerLines = parts[0].split('\n');
    const command = headerLines[0].trim();
    if (!command) return null;

    const headers: Record<string, string> = {};
    for (let i = 1; i < headerLines.length; i++) {
      const line = headerLines[i];
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        headers[line.substring(0, colonIdx).trim()] = line.substring(colonIdx + 1).trim();
      }
    }
    const body = parts.slice(1).join('\n\n').trim();
    return { command, headers, body };
  }
}
