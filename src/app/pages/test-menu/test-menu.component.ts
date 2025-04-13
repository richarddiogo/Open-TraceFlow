import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BaseTestPage } from '../base-test-page';

@Component({
  selector: 'app-test-menu',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="test-menu">
      <h2>Menu de Páginas de Teste</h2>
      
      <div class="menu-description">
        Selecione uma das páginas de teste abaixo para testar funcionalidades isoladamente:
      </div>
      
      <div class="menu-grid">
        <div class="menu-item" routerLink="/test/click">
          <div class="menu-icon">🖱️</div>
          <div class="menu-title">Teste de Cliques</div>
          <div class="menu-desc">Testar rastreamento de eventos de clique simples</div>
        </div>
        
        <div class="menu-item" routerLink="/test/rage-click">
          <div class="menu-icon">😡</div>
          <div class="menu-title">Teste de Rage Clicks</div>
          <div class="menu-desc">Testar detecção de cliques repetidos (frustração)</div>
        </div>
        
        <div class="menu-item" routerLink="/test/form">
          <div class="menu-icon">📝</div>
          <div class="menu-title">Teste de Formulários</div>
          <div class="menu-desc">Testar rastreamento de entradas em formulários</div>
        </div>
        
        <div class="menu-item" routerLink="/test/error">
          <div class="menu-icon">⚠️</div>
          <div class="menu-title">Teste de Erros</div>
          <div class="menu-desc">Testar geração e captura de erros no console</div>
        </div>

        <div class="menu-item" routerLink="/test/url-api">
          <div class="menu-icon">🌐</div>
          <div class="menu-title">Teste de URLs e APIs</div>
          <div class="menu-desc">Testar navegação para URLs e chamadas de API</div>
        </div>
      </div>
      
      <button class="back-button" (click)="navigateBack()">Voltar para Home</button>
    </div>
  `,
  styles: [`
    .test-menu {
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h2 {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .menu-description {
      text-align: center;
      margin-bottom: 30px;
      font-size: 18px;
      color: #666;
    }
    
    .menu-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .menu-item {
      background-color: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .menu-item:hover {
      transform: translateY(-5px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    .menu-icon {
      font-size: 32px;
      margin-bottom: 15px;
      text-align: center;
    }
    
    .menu-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #007bff;
    }
    
    .menu-desc {
      font-size: 14px;
      color: #666;
    }
    
    .back-button {
      display: block;
      margin: 0 auto;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
    
    .back-button:hover {
      background-color: #0069d9;
    }
  `]
})
export class TestMenuComponent extends BaseTestPage {
  constructor(router: Router) {
    super(router);
  }
  
  override navigateBack(): void {
    this.router.navigate(['/']);
  }
} 