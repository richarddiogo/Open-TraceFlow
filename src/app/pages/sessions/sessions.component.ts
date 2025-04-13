import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionRecorderService, SessionData } from '../../tracking/services/session-recorder.service';
import { SessionListComponent } from '../../session-list/session-list.component';
import { SessionPlayerComponent } from '../../session-player/session-player.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [
    CommonModule,
    SessionListComponent,
    SessionPlayerComponent
  ],
  template: `
    <div class="sessions-page">
      <h2 class="page-title">Sessões Gravadas</h2>
      
      <div class="page-description">
        <p>Visualize e reproduza as sessões de usuários gravadas pelo Open-TraceFlow</p>
      </div>
      
      <div class="sessions-container">
        <div class="session-list-wrapper">
          <app-session-list (sessionSelected)="onSessionSelected($event)"></app-session-list>
        </div>
        <div class="session-player-wrapper">
          <app-session-player [session]="selectedSession"></app-session-player>
        </div>
      </div>
      
      <div *ngIf="!selectedSession" class="no-session-message">
        <p>Selecione uma sessão na lista à esquerda para visualizar sua reprodução</p>
      </div>
    </div>
  `,
  styles: [`
    .sessions-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .page-title {
      text-align: center;
      font-size: 1.8rem;
      margin-bottom: 15px;
      color: #333;
    }
    
    .page-description {
      text-align: center;
      margin-bottom: 30px;
      color: #666;
    }
    
    .sessions-container {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .session-list-wrapper {
      flex: 1;
      min-width: 300px;
      max-width: 400px;
    }
    
    .session-player-wrapper {
      flex: 2;
      min-height: 500px;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
      background-color: #f8f9fa;
    }
    
    .no-session-message {
      text-align: center;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
      color: #666;
    }
    
    @media (max-width: 768px) {
      .sessions-container {
        flex-direction: column;
      }
      
      .session-list-wrapper {
        max-width: 100%;
      }
    }
  `]
})
export class SessionsComponent implements OnInit, OnDestroy {
  selectedSession: SessionData | null = null;
  private subscription: Subscription | null = null;
  
  constructor(private sessionRecorder: SessionRecorderService) {}
  
  ngOnInit(): void {
    try {
      // Inscreve-se para receber atualizações das sessões gravadas
      this.subscription = this.sessionRecorder.getSessions().subscribe(sessions => {
        if (Array.isArray(sessions) && sessions.length > 0 && !this.selectedSession) {
          this.selectSession(sessions[0]);
        }
      });
    } catch (error) {
      console.error('Erro ao inicializar o componente de sessões:', error);
    }
  }

  ngOnDestroy(): void {
    // Cancela a inscrição para evitar memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
  
  onSessionSelected(session: SessionData): void {
    this.selectSession(session);
  }
  
  private selectSession(session: SessionData | null): void {
    try {
      if (!session) {
        console.warn('Tentativa de selecionar sessão nula');
        return;
      }
      
      // Validação básica da estrutura da sessão
      if (!session.sessionId || !session.startTime || !Array.isArray(session.events)) {
        console.warn('Sessão selecionada tem formato inválido', session);
        return;
      }
      
      this.selectedSession = session;
    } catch (error) {
      console.error('Erro ao selecionar sessão:', error);
    }
  }
} 