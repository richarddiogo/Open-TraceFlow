import { Component, OnInit } from '@angular/core';
import { SessionRecorderService } from './tracking/services/session-recorder.service';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink
  ],
  template: `
    <div class="app-container">
      <header class="header">
        <h1>Open-TraceFlow</h1>
        <p class="subtitle">Uma solução open source para rastreamento e análise de sessões de usuário</p>
        <nav class="main-nav">
          <a routerLink="/" class="nav-link">Início</a>
          <a routerLink="/sessions" class="nav-link">Sessões</a>
          <a routerLink="/dashboard" class="nav-link">Dashboard</a>
          <a routerLink="/test" class="nav-link">Testes Isolados</a>
        </nav>
      </header>

      <router-outlet></router-outlet>

      <footer class="footer">
        <p>Open-TraceFlow &copy; 2025 - Uma alternativa open source para análise de experiência do usuário</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      background-color: #007bff;
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    h1 {
      margin: 0;
      font-size: 2.5rem;
    }
    
    .subtitle {
      margin-top: 10px;
      font-size: 1.2rem;
      opacity: 0.9;
    }
    
    .main-nav {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      gap: 20px;
    }
    
    .nav-link {
      color: white;
      text-decoration: none;
      font-size: 1.1rem;
      padding: 8px 15px;
      border-radius: 4px;
      transition: background-color 0.2s;
    }
    
    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
    
    .footer {
      text-align: center;
      margin-top: 30px;
      padding: 20px;
      color: #666;
      font-size: 0.9rem;
      border-top: 1px solid #eee;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    private sessionRecorder: SessionRecorderService
  ) {}

  ngOnInit() {
    try {
      // Inicia a gravação de sessão automaticamente
      this.sessionRecorder.startRecording();
      
      // Adiciona metadados à sessão
      this.sessionRecorder.addSessionMetadata('app_version', '1.0.0');
    } catch (error) {
      console.error('Erro ao iniciar gravação de sessão:', error);
    }
  }
}
