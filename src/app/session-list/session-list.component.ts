import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { SessionRecorderService, SessionData } from '../tracking/services/session-recorder.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-list.component.html',
  styleUrls: ['./session-list.component.scss']
})
export class SessionListComponent implements OnInit, OnDestroy {
  sessions: SessionData[] = [];
  private subscription: Subscription | null = null;
  selectedSessionId: string | null = null;
  @Output() sessionSelected = new EventEmitter<SessionData>();

  constructor(private sessionRecorder: SessionRecorderService) { }

  ngOnInit(): void {
    try {
      // Inscreve-se para receber atualizações das sessões gravadas
      this.subscription = this.sessionRecorder.getSessions().subscribe(
        sessions => {
          if (Array.isArray(sessions)) {
            // Filtra sessões inválidas
            this.sessions = sessions.filter(session => this.isValidSession(session));
            
            // Se não tiver sessão selecionada e houver sessões disponíveis, seleciona a primeira
            if (!this.selectedSessionId && this.sessions.length > 0) {
              this.selectSession(this.sessions[0].sessionId);
            }
          } else {
            console.warn('Formato de sessões recebido é inválido:', sessions);
            this.sessions = [];
          }
        },
        error => {
          console.error('Erro ao obter sessões:', error);
          this.sessions = [];
        }
      );
    } catch (error) {
      console.error('Erro ao inicializar componente de lista de sessões:', error);
    }
  }

  ngOnDestroy(): void {
    // Cancela a inscrição ao destruir o componente
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  /**
   * Verifica se uma sessão tem a estrutura válida
   */
  private isValidSession(session: any): boolean {
    return session && 
           typeof session.sessionId === 'string' && 
           typeof session.startTime === 'number' &&
           Array.isArray(session.events);
  }

  /**
   * Seleciona uma sessão para visualização
   */
  selectSession(sessionId: string): void {
    try {
      if (!sessionId) {
        console.warn('ID de sessão vazio');
        return;
      }
      
      this.selectedSessionId = sessionId;
      const session = this.sessionRecorder.getSessionById(sessionId);
      
      if (session && this.isValidSession(session)) {
        this.sessionSelected.emit(session);
      } else {
        console.warn('Sessão selecionada é inválida:', session);
      }
    } catch (error) {
      console.error('Erro ao selecionar sessão:', error);
    }
  }

  /**
   * Formata a data de início da sessão
   */
  formatSessionDate(timestamp: number): string {
    try {
      if (typeof timestamp !== 'number') {
        return 'Data desconhecida';
      }
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      console.warn('Erro ao formatar data de sessão:', error);
      return 'Data inválida';
    }
  }

  /**
   * Retorna a duração da sessão em formato legível
   */
  getSessionDuration(session: SessionData): string {
    try {
      if (!session || !session.events || !Array.isArray(session.events) || session.events.length === 0) {
        return '0s';
      }

      const lastEvent = session.events[session.events.length - 1];
      if (!lastEvent || !lastEvent.timestamp || !session.startTime) {
        return '0s';
      }
      
      const duration = (lastEvent.timestamp - session.startTime) / 1000; // em segundos
      
      if (duration < 0) {
        return '0s';
      } else if (duration < 60) {
        return `${Math.round(duration)}s`;
      } else if (duration < 3600) {
        return `${Math.floor(duration / 60)}m ${Math.round(duration % 60)}s`;
      } else {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        return `${hours}h ${minutes}m`;
      }
    } catch (error) {
      console.warn('Erro ao calcular duração da sessão:', error);
      return 'Duração desconhecida';
    }
  }

  /**
   * Retorna o número de eventos na sessão
   */
  getEventCount(session: SessionData): number {
    try {
      return session && session.events && Array.isArray(session.events) ? session.events.length : 0;
    } catch (error) {
      console.warn('Erro ao contar eventos da sessão:', error);
      return 0;
    }
  }

  /**
   * Limpa todas as sessões gravadas
   */
  clearAllSessions(): void {
    try {
      if (confirm('Tem certeza que deseja excluir todas as sessões gravadas?')) {
        this.sessionRecorder.clearAllSessions();
        this.selectedSessionId = null;
        this.sessions = [];
      }
    } catch (error) {
      console.error('Erro ao limpar sessões:', error);
    }
  }
}
