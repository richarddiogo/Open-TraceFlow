import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SessionRecorderService } from '../../tracking/services/session-recorder.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <h2 class="page-title">Configurações</h2>
      
      <div class="page-description">
        <p>Configure as opções de rastreamento e gravação de sessões</p>
      </div>
      
      <div class="settings-container">
        <div class="settings-section">
          <h3>Opções de Gravação</h3>
          
          <div class="form-group">
            <label for="autoRecording">
              <input type="checkbox" id="autoRecording" name="autoRecording" [(ngModel)]="autoRecording" (change)="toggleAutoRecording()">
              Iniciar gravação automaticamente
            </label>
            <p class="form-help">Quando ativado, a gravação de sessão começa automaticamente ao carregar a página</p>
          </div>
          
          <div class="form-group">
            <button class="btn-primary" (click)="startRecording()" [disabled]="isRecording">Iniciar Gravação</button>
            <button class="btn-secondary" (click)="stopRecording()" [disabled]="!isRecording">Parar Gravação</button>
          </div>
          
          <div *ngIf="isRecording" class="recording-indicator">
            <span class="recording-dot"></span> Gravando sessão
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Opções de Armazenamento</h3>
          
          <div class="form-group">
            <label for="maxSessions">Número máximo de sessões:</label>
            <input type="number" id="maxSessions" name="maxSessions" [(ngModel)]="maxSessions" min="1" max="50">
            <p class="form-help">Limita o número de sessões armazenadas localmente</p>
          </div>
          
          <div class="form-group">
            <button class="btn-danger" (click)="clearAllSessions()">Limpar Todas as Sessões</button>
            <p class="form-help">Apaga permanentemente todas as sessões gravadas</p>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Opções de Privacidade</h3>
          
          <div class="form-group">
            <label for="trackSensitiveFields">
              <input type="checkbox" id="trackSensitiveFields" name="trackSensitiveFields" [(ngModel)]="trackSensitiveFields">
              Incluir campos sensíveis
            </label>
            <p class="form-help">ATENÇÃO: Ativa o rastreamento de valores em campos marcados como sensíveis (não recomendado)</p>
          </div>
          
          <div class="form-group">
            <label for="trackConsoleErrors">
              <input type="checkbox" id="trackConsoleErrors" name="trackConsoleErrors" [(ngModel)]="trackConsoleErrors">
              Capturar erros de console
            </label>
            <p class="form-help">Registra erros de console durante a sessão do usuário</p>
          </div>
        </div>
      </div>
      
      <div class="actions">
        <button class="btn-primary" (click)="saveSettings()">Salvar Configurações</button>
        <button class="btn-secondary" (click)="resetSettings()">Restaurar Padrões</button>
      </div>
    </div>
  `,
  styles: [`
    .settings-page {
      max-width: 800px;
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
    
    .settings-container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
      margin-bottom: 30px;
    }
    
    .settings-section {
      padding: 20px;
      border-bottom: 1px solid #eee;
    }
    
    .settings-section h3 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
      font-size: 1.3rem;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
    }
    
    .form-help {
      font-size: 0.9rem;
      color: #666;
      margin-top: 5px;
    }
    
    input[type="checkbox"] {
      margin-right: 8px;
    }
    
    input[type="number"] {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      width: 80px;
    }
    
    button {
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 10px;
      font-weight: bold;
    }
    
    .btn-primary {
      background-color: #007bff;
      color: white;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-danger {
      background-color: #dc3545;
      color: white;
    }
    
    .recording-indicator {
      display: flex;
      align-items: center;
      color: #dc3545;
      font-weight: bold;
      margin-top: 10px;
    }
    
    .recording-dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      background-color: #dc3545;
      border-radius: 50%;
      margin-right: 8px;
      animation: pulse 1.5s infinite;
    }
    
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    
    .actions {
      text-align: center;
      margin-top: 20px;
    }
    
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class SettingsComponent {
  autoRecording = true;
  isRecording = false;
  maxSessions = 10;
  trackSensitiveFields = false;
  trackConsoleErrors = true;
  
  constructor(private sessionRecorder: SessionRecorderService) {
    // No mundo real, carregaríamos as configurações salvas
    this.isRecording = true; // Apenas para exemplo
  }
  
  toggleAutoRecording(): void {
    // Implementação futura
    console.log('Gravação automática:', this.autoRecording);
  }
  
  startRecording(): void {
    try {
      this.sessionRecorder.startRecording();
      this.isRecording = true;
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  }
  
  stopRecording(): void {
    try {
      this.sessionRecorder.stopRecording();
      this.isRecording = false;
    } catch (error) {
      console.error('Erro ao parar gravação:', error);
    }
  }
  
  clearAllSessions(): void {
    if (confirm('Tem certeza que deseja excluir todas as sessões gravadas? Esta ação não pode ser desfeita.')) {
      try {
        this.sessionRecorder.clearAllSessions();
      } catch (error) {
        console.error('Erro ao limpar sessões:', error);
      }
    }
  }
  
  saveSettings(): void {
    // Implementação futura - salvar configurações
    alert('Configurações salvas com sucesso!');
  }
  
  resetSettings(): void {
    // Restaura as configurações padrão
    this.autoRecording = true;
    this.maxSessions = 10;
    this.trackSensitiveFields = false;
    this.trackConsoleErrors = true;
  }
} 