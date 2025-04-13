import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SessionRecorderService, SessionData } from '../../tracking/services/session-recorder.service';
import { TrackingEvent } from '../../tracking/services/event-tracker.service';
import { RageClickEvent } from '../../tracking/services/rage-click-detector.service';
import { Observable, BehaviorSubject, map } from 'rxjs';

export interface BrowserStats {
  [browser: string]: number;
}

export interface DeviceStats {
  [device: string]: number;
}

export interface EventCountStats {
  [eventType: string]: number;
}

export interface SessionMetrics {
  sessionId: string;
  startTime: number;
  eventCount: number;
  duration: number;
  url: string;
}

export interface AnalyticsMetrics {
  totalSessions: number;
  totalEvents: number;
  averageSessionDuration: number;
  browsers: BrowserStats;
  devices: DeviceStats;
  eventTypes: EventCountStats;
  lastUpdated: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private metrics$ = new BehaviorSubject<AnalyticsMetrics>({
    totalSessions: 0,
    totalEvents: 0,
    averageSessionDuration: 0,
    browsers: {},
    devices: {},
    eventTypes: {},
    lastUpdated: Date.now()
  });

  private sessionMetrics$ = new BehaviorSubject<SessionMetrics[]>([]);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private sessionRecorder: SessionRecorderService
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initAnalytics();
    }
  }

  /**
   * Inicializa o serviço de analytics e se inscreve nas sessões
   */
  private initAnalytics(): void {
    this.sessionRecorder.getSessions().subscribe(sessions => {
      this.processSessionData(sessions);
    });
  }

  /**
   * Processa os dados das sessões para gerar métricas
   */
  private processSessionData(sessions: SessionData[]): void {
    if (!sessions || sessions.length === 0) {
      return;
    }

    const metrics: AnalyticsMetrics = {
      totalSessions: sessions.length,
      totalEvents: 0,
      averageSessionDuration: 0,
      browsers: {},
      devices: {},
      eventTypes: {},
      lastUpdated: Date.now()
    };

    const sessionMetrics: SessionMetrics[] = [];
    let totalDuration = 0;

    // Itera pelas sessões para coletar métricas
    sessions.forEach(session => {
      // Calcula a duração da sessão
      const duration = this.calculateSessionDuration(session);
      totalDuration += duration;

      // Conta os eventos
      if (session.events) {
        metrics.totalEvents += session.events.length;

        // Contabiliza os tipos de eventos
        session.events.forEach(event => {
          metrics.eventTypes[event.type] = (metrics.eventTypes[event.type] || 0) + 1;
        });
      }

      // Contabiliza navegadores
      if (session.metadata && session.metadata.userAgent) {
        const browser = this.detectBrowser(session.metadata.userAgent);
        metrics.browsers[browser] = (metrics.browsers[browser] || 0) + 1;

        // Contabiliza dispositivos
        const device = this.detectDeviceType(session.metadata.userAgent);
        metrics.devices[device] = (metrics.devices[device] || 0) + 1;
      }

      // Adiciona às métricas de sessão
      sessionMetrics.push({
        sessionId: session.sessionId,
        startTime: session.startTime,
        eventCount: session.events ? session.events.length : 0,
        duration,
        url: session.metadata?.url || 'Desconhecido'
      });
    });

    // Calcula a média de duração das sessões
    metrics.averageSessionDuration = totalDuration / sessions.length;

    // Atualiza os BehaviorSubjects
    this.metrics$.next(metrics);
    this.sessionMetrics$.next(sessionMetrics);
  }

  /**
   * Calcula a duração de uma sessão em ms
   */
  private calculateSessionDuration(session: SessionData): number {
    if (!session.events || session.events.length === 0) {
      return 0;
    }

    const lastEvent = session.events[session.events.length - 1];
    return lastEvent.timestamp - session.startTime;
  }

  /**
   * Formata a duração para exibição
   */
  formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }

    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }

  /**
   * Detecta o tipo de dispositivo com base no user agent
   */
  private detectDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('iphone') || ua.includes('ipod')) {
      return 'iPhone';
    } else if (ua.includes('ipad')) {
      return 'iPad';
    } else if (ua.includes('android')) {
      return ua.includes('mobile') ? 'Android Phone' : 'Android Tablet';
    }
    
    return 'Desktop';
  }

  /**
   * Detecta o navegador com base no user agent
   */
  private detectBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('firefox')) {
      return 'Firefox';
    } else if (ua.includes('chrome') && !ua.includes('edg')) {
      return 'Chrome';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'Safari';
    } else if (ua.includes('edg')) {
      return 'Edge';
    } else if (ua.includes('opera') || ua.includes('opr')) {
      return 'Opera';
    }
    
    return 'Unknown';
  }

  /**
   * Obtém as métricas de analytics
   */
  getMetrics(): Observable<AnalyticsMetrics> {
    return this.metrics$.asObservable();
  }

  /**
   * Obtém as métricas de sessões individuais
   */
  getSessionMetrics(): Observable<SessionMetrics[]> {
    return this.sessionMetrics$.asObservable();
  }
}
