import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseTestPage } from '../base-test-page';

@Component({
  selector: 'app-error-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-page">
      <h2>Teste de Erros de Console</h2>
      
      <div class="button-container">
        <button class="error-button" (click)="generateError('log')">Gerar Console.log</button>
        <button class="error-button" (click)="generateError('warn')">Gerar Console.warn</button>
        <button class="error-button" (click)="generateError('error')">Gerar Console.error</button>
        <button class="error-button" (click)="generateError('exception')">Gerar Exception</button>
        <button class="error-button" (click)="generateError('promise')">Gerar Promise Rejection</button>
      </div>
      
      <div class="error-log">
        <h3>Log de Erros:</h3>
        <pre>{{ errorLog }}</pre>
      </div>
      
      <div class="instructions">
        <h3>Instruções:</h3>
        <p>Clique nos botões acima para gerar diferentes tipos de erros e mensagens de console.</p>
        <p>Verifique o console do navegador (F12) para ver os resultados.</p>
      </div>
      
      <button class="back-button" (click)="navigateBack()">Voltar</button>
    </div>
  `,
  styles: [`
    .test-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h2 {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .button-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin-bottom: 30px;
    }
    
    .error-button {
      padding: 10px 15px;
      background-color: #6c757d;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .error-button:hover {
      background-color: #5a6268;
    }
    
    .error-log {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .error-log pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-all;
    }
    
    .instructions {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
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
  `]
})
export class ErrorTestComponent extends BaseTestPage {
  errorLog: string = '';
  
  constructor(router: Router) {
    super(router);
  }
  
  generateError(type: string): void {
    const timestamp = new Date().toLocaleTimeString();
    
    switch (type) {
      case 'log':
        console.log('Isto é um console.log de teste');
        this.addToErrorLog(timestamp, 'LOG', 'Isto é um console.log de teste');
        break;
        
      case 'warn':
        console.warn('Isto é um console.warn de teste');
        this.addToErrorLog(timestamp, 'WARN', 'Isto é um console.warn de teste');
        break;
        
      case 'error':
        console.error('Isto é um console.error de teste');
        this.addToErrorLog(timestamp, 'ERROR', 'Isto é um console.error de teste');
        break;
        
      case 'exception':
        try {
          throw new Error('Isto é uma exceção de teste');
        } catch (err) {
          console.error(err);
          this.addToErrorLog(timestamp, 'EXCEPTION', 'Isto é uma exceção de teste');
        }
        break;
        
      case 'promise':
        Promise.reject(new Error('Isto é uma promise rejection de teste')).catch(err => {
          console.error(err);
          this.addToErrorLog(timestamp, 'PROMISE', 'Isto é uma promise rejection de teste');
        });
        break;
    }
  }
  
  addToErrorLog(timestamp: string, type: string, message: string): void {
    this.errorLog = `[${timestamp}] ${type}: ${message}\n${this.errorLog}`;
  }
} 