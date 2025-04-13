import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-container">
      <h2 class="welcome-title">Bem-vindo ao Open-TraceFlow</h2>
      
      <div class="description">
        <p>
          Uma ferramenta de código aberto para análise de experiência do usuário.
          Rastreie, grave e reproduza sessões de usuários para entender melhor como 
          eles interagem com sua aplicação.
        </p>
      </div>
      
      <div class="features-grid">
        <div class="feature-card" routerLink="/sessions">
          <div class="icon">📊</div>
          <h3>Sessões Gravadas</h3>
          <p>Visualize e reproduza as sessões gravadas dos usuários</p>
        </div>
        
        <div class="feature-card" routerLink="/dashboard">
          <div class="icon">📈</div>
          <h3>Dashboard</h3>
          <p>Acompanhe métricas e estatísticas de uso da aplicação</p>
        </div>
        
        <div class="feature-card" routerLink="/test">
          <div class="icon">🧪</div>
          <h3>Testes Isolados</h3>
          <p>Teste funcionalidades específicas de rastreamento</p>
        </div>
        
        <div class="feature-card" routerLink="/settings">
          <div class="icon">⚙️</div>
          <h3>Configurações</h3>
          <p>Ajuste as configurações de rastreamento e gravação</p>
        </div>
      </div>
      
      <div class="info-section">
        <h3>Sobre o Open-TraceFlow</h3>
        <p>
          Esta é uma alternativa de código aberto para ferramentas de análise de comportamento de usuários.
          Capture eventos, detecte problemas de usabilidade e melhore a experiência do usuário 
          sem depender de serviços externos.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1100px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .welcome-title {
      text-align: center;
      font-size: 2rem;
      margin-bottom: 20px;
      color: #333;
    }
    
    .description {
      text-align: center;
      margin-bottom: 40px;
      font-size: 1.2rem;
      line-height: 1.6;
      color: #555;
    }
    
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 25px;
      margin-bottom: 40px;
    }
    
    .feature-card {
      background-color: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
      text-align: center;
    }
    
    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    
    .icon {
      font-size: 3rem;
      margin-bottom: 15px;
    }
    
    .feature-card h3 {
      font-size: 1.3rem;
      margin-bottom: 10px;
      color: #007bff;
    }
    
    .feature-card p {
      color: #666;
      line-height: 1.5;
    }
    
    .info-section {
      background-color: #f8f9fa;
      padding: 25px;
      border-radius: 10px;
      margin-top: 30px;
    }
    
    .info-section h3 {
      font-size: 1.5rem;
      margin-bottom: 15px;
      color: #333;
    }
    
    .info-section p {
      line-height: 1.6;
      color: #555;
    }
    
    @media (max-width: 768px) {
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {
} 