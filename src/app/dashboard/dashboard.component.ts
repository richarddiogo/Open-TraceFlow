import { Component, OnInit, OnDestroy } from '@angular/core';
import { AnalyticsService, AnalyticsMetrics, SessionMetrics } from './services/analytics.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h2>Dashboard de Análise</h2>
      
      <div *ngIf="!metrics || !metrics.totalSessions" class="no-data">
        <p>Nenhum dado de sessão disponível para análise.</p>
        <p>Comece a capturar sessões de usuários para visualizar métricas e insights.</p>
      </div>
      
      <div *ngIf="metrics && metrics.totalSessions > 0" class="dashboard-content">
        <div class="metrics-summary">
          <div class="metric-box">
            <div class="metric-value">{{ metrics.totalSessions }}</div>
            <div class="metric-label">Sessões</div>
          </div>
          
          <div class="metric-box">
            <div class="metric-value">{{ metrics.totalEvents }}</div>
            <div class="metric-label">Eventos</div>
          </div>
          
          <div class="metric-box">
            <div class="metric-value">{{ formatDuration(metrics.averageSessionDuration) }}</div>
            <div class="metric-label">Duração Média</div>
          </div>
        </div>
        
        <div class="charts-row">
          <div class="chart-container">
            <h3>Navegadores</h3>
            <div class="chart-bars">
              <div *ngFor="let browser of getObjectKeys(metrics.browsers)" class="chart-bar">
                <div class="bar-label">{{ browser }}</div>
                <div class="bar-container">
                  <div class="bar-fill" [style.width]="getPercentage(metrics.browsers[browser], metrics.totalSessions)"></div>
                </div>
                <div class="bar-value">{{ metrics.browsers[browser] }}</div>
              </div>
            </div>
          </div>
          
          <div class="chart-container">
            <h3>Dispositivos</h3>
            <div class="chart-bars">
              <div *ngFor="let device of getObjectKeys(metrics.devices)" class="chart-bar">
                <div class="bar-label">{{ device }}</div>
                <div class="bar-container">
                  <div class="bar-fill" [style.width]="getPercentage(metrics.devices[device], metrics.totalSessions)"></div>
                </div>
                <div class="bar-value">{{ metrics.devices[device] }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="charts-row">
          <div class="chart-container">
            <h3>Tipos de Eventos</h3>
            <div class="chart-bars">
              <div *ngFor="let eventType of getObjectKeys(metrics.eventTypes)" class="chart-bar">
                <div class="bar-label">{{ eventType }}</div>
                <div class="bar-container">
                  <div class="bar-fill" [style.width]="getPercentage(metrics.eventTypes[eventType], metrics.totalEvents)"></div>
                </div>
                <div class="bar-value">{{ metrics.eventTypes[eventType] }}</div>
              </div>
            </div>
          </div>
          
          <div class="chart-container">
            <h3>Sessões Recentes</h3>
            <div class="recent-sessions">
              <div *ngFor="let session of sessionMetrics" class="session-item">
                <div class="session-date">{{ formatDate(session.startTime) }}</div>
                <div class="session-duration">{{ formatDuration(session.duration) }}</div>
                <div class="session-events">{{ session.eventCount }} eventos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button (click)="navigateBack()" class="btn-back">Voltar</button>
    </div>
  `,
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  metrics: AnalyticsMetrics | null = null;
  sessionMetrics: SessionMetrics[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private analyticsService: AnalyticsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Inscreve-se para receber atualizações das métricas
    this.subscriptions.push(
      this.analyticsService.getMetrics().subscribe(metrics => {
        this.metrics = metrics;
      })
    );

    // Inscreve-se para receber atualizações das métricas de sessão
    this.subscriptions.push(
      this.analyticsService.getSessionMetrics().subscribe(sessionMetrics => {
        this.sessionMetrics = sessionMetrics;
      })
    );
  }

  ngOnDestroy(): void {
    // Cancela todas as inscrições ao destruir o componente
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  /**
   * Navega de volta para a página principal
   */
  navigateBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Formata a duração em formato legível
   */
  formatDuration(ms: number): string {
    return this.analyticsService.formatDuration(ms);
  }

  /**
   * Formata a data em formato legível
   */
  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  /**
   * Retorna as chaves de um objeto
   */
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  /**
   * Retorna a porcentagem de um valor em relação ao total
   */
  getPercentage(value: number, total: number): string {
    if (!total) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  }

  /**
   * Retorna a classe CSS para um valor de porcentagem
   */
  getPercentageClass(value: number, total: number): string {
    const percentage = total ? (value / total) * 100 : 0;
    if (percentage >= 70) return 'high';
    if (percentage >= 30) return 'medium';
    return 'low';
  }
}
