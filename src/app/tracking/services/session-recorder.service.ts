import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { EventTrackerService, TrackingEvent } from './event-tracker.service';

export interface SessionData {
  sessionId: string;
  startTime: number;
  events: TrackingEvent[];
  metadata: {
    userAgent: string;
    screenWidth: number;
    screenHeight: number;
    url: string;
    referrer: string;
    [key: string]: any;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SessionRecorderService {
  private currentSession: SessionData | null = null;
  private sessions$ = new BehaviorSubject<SessionData[]>([]);
  private isRecording = false;
  private storageKey = 'open_traceflow_sessions';
  
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private eventTracker: EventTrackerService
  ) {}

  /**
   * Inicia a gravação da sessão do usuário
   */
  startRecording(): void {
    if (!isPlatformBrowser(this.platformId) || this.isRecording) {
      return;
    }

    this.isRecording = true;
    this.eventTracker.startCapturing();
    
    // Cria uma nova sessão
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      events: [],
      metadata: this.collectMetadata()
    };
    
    // Inscreve-se nos eventos capturados
    this.eventTracker.getEvents().subscribe(event => {
      if (this.currentSession) {
        this.currentSession.events.push(event);
        
        // Salva a sessão periodicamente (a cada 50 eventos)
        if (this.currentSession.events.length % 50 === 0) {
          this.saveCurrentSession();
        }
      }
    });
    
    console.log('Session recording started', this.currentSession.sessionId);
  }

  /**
   * Para a gravação da sessão do usuário
   */
  stopRecording(): void {
    if (!isPlatformBrowser(this.platformId) || !this.isRecording) {
      return;
    }

    this.isRecording = false;
    this.eventTracker.stopCapturing();
    
    // Salva a sessão atual
    if (this.currentSession) {
      this.saveCurrentSession();
      console.log('Session recording stopped', this.currentSession.sessionId);
      this.currentSession = null;
    }
  }

  /**
   * Retorna todas as sessões gravadas
   */
  getSessions(): Observable<SessionData[]> {
    if (isPlatformBrowser(this.platformId)) {
      try {
        // Carrega as sessões do armazenamento local
        this.loadSessions();
      } catch (error) {
        console.error('Erro ao carregar sessões:', error);
        // Garante que sempre temos um array vazio em caso de erro
        this.sessions$.next([]);
      }
    }
    return this.sessions$.asObservable();
  }

  /**
   * Retorna uma sessão específica pelo ID
   */
  getSessionById(sessionId: string): SessionData | null {
    if (!sessionId) {
      return null;
    }
    
    try {
      const sessions = this.sessions$.getValue();
      if (!Array.isArray(sessions)) {
        return null;
      }
      
      return sessions.find(session => session && session.sessionId === sessionId) || null;
    } catch (error) {
      console.error('Erro ao buscar sessão por ID:', error);
      return null;
    }
  }

  /**
   * Limpa todas as sessões gravadas
   */
  clearAllSessions(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.storageKey);
      this.sessions$.next([]);
    }
  }

  /**
   * Adiciona metadados à sessão atual
   */
  addSessionMetadata(key: string, value: any): void {
    if (this.currentSession) {
      this.currentSession.metadata[key] = value;
    }
  }

  /**
   * Gera um ID único para a sessão
   */
  private generateSessionId(): string {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Coleta metadados sobre o ambiente do usuário
   */
  private collectMetadata(): any {
    if (!isPlatformBrowser(this.platformId)) {
      return {};
    }

    return {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      url: window.location.href,
      referrer: document.referrer,
      timestamp: Date.now(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };
  }

  /**
   * Salva a sessão atual no armazenamento local
   */
  private saveCurrentSession(): void {
    if (!isPlatformBrowser(this.platformId) || !this.currentSession) {
      return;
    }

    try {
      // Carrega as sessões existentes
      const existingSessions = this.loadSessionsFromStorage();
      
      // Adiciona ou atualiza a sessão atual
      const sessionIndex = existingSessions.findIndex(
        session => session.sessionId === this.currentSession!.sessionId
      );
      
      if (sessionIndex >= 0) {
        existingSessions[sessionIndex] = this.currentSession;
      } else {
        existingSessions.push(this.currentSession);
      }
      
      // Limita o número de sessões armazenadas (mantém as 10 mais recentes)
      const limitedSessions = existingSessions
        .sort((a, b) => b.startTime - a.startTime)
        .slice(0, 10);
      
      // Salva no armazenamento local
      localStorage.setItem(this.storageKey, JSON.stringify(limitedSessions));
      
      // Atualiza o BehaviorSubject
      this.sessions$.next(limitedSessions);
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Carrega as sessões do armazenamento local
   */
  private loadSessions(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const sessions = this.loadSessionsFromStorage();
    this.sessions$.next(sessions);
  }

  /**
   * Carrega as sessões do armazenamento local
   */
  private loadSessionsFromStorage(): SessionData[] {
    if (!isPlatformBrowser(this.platformId)) {
      return [];
    }

    try {
      const sessionsJson = localStorage.getItem(this.storageKey);
      if (!sessionsJson) {
        return [];
      }
      
      const parsedSessions = JSON.parse(sessionsJson);
      
      // Verificar se o resultado é um array
      if (!Array.isArray(parsedSessions)) {
        console.warn('Formato de sessões armazenadas é inválido, esperava um array');
        return [];
      }
      
      // Filtrar sessões para garantir que apenas sessões válidas sejam retornadas
      return parsedSessions.filter(session => this.isValidSession(session));
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      // Se houver erro de parsing, limpar o localStorage para evitar problemas futuros
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }
  
  /**
   * Verifica se uma sessão é válida
   */
  private isValidSession(session: any): boolean {
    return session &&
           typeof session.sessionId === 'string' &&
           typeof session.startTime === 'number' &&
           Array.isArray(session.events) &&
           typeof session.metadata === 'object';
  }
}
