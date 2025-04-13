import { Component, OnInit, OnDestroy } from '@angular/core';
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
      <p class="github-link">
        <a href="https://github.com/richarddiogo/Open-TraceFlow/blob/main/src/app/pages/error-test/error-test.component.ts" target="_blank">
          Ver código no GitHub
        </a>
      </p>
      
      <div class="button-container">
        <button class="error-button" (click)="generateError('log')">Gerar Console.log</button>
        <button class="error-button" (click)="generateError('warn')">Gerar Console.warn</button>
        <button class="error-button" (click)="generateError('error')">Gerar Console.error</button>
        <button class="error-button" (click)="generateError('exception')">Gerar Exception</button>
        <button class="error-button" (click)="generateError('promise')">Gerar Promise Rejection</button>
        <button class="error-button" (click)="generateError('reference')">Gerar Erro de Referência</button>
        <button class="error-button" (click)="generateError('syntax')">Gerar Erro de Sintaxe</button>
        <button class="error-button" (click)="generateError('type')">Gerar Erro de Tipo</button>
      </div>
      
      <div class="error-log">
        <h3>Erros Capturados:</h3>
        <pre>{{ errorLog || 'Nenhum erro capturado ainda. Gere um erro para testar.' }}</pre>
      </div>
      
      <div class="instructions">
        <h3>Instruções:</h3>
        <p>Clique nos botões acima para gerar diferentes tipos de erros e mensagens de console.</p>
        <p>Esta página captura <strong>todos os erros e mensagens de erro</strong> usando:</p>
        <ul>
          <li><code>window.onerror</code> - Captura erros não tratados de JavaScript</li>
          <li><code>window.onunhandledrejection</code> - Captura rejeições de Promise não tratadas</li>
          <li><code>console.error</code> - Captura todas as chamadas ao console.error</li>
        </ul>
        <p>Todos os erros serão registrados acima e também exibidos no console do navegador (F12).</p>
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
      margin-bottom: 10px;
    }
    
    .github-link {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .github-link a {
      color: #0366d6;
      text-decoration: none;
      font-size: 14px;
    }
    
    .github-link a:hover {
      text-decoration: underline;
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
      max-height: 300px;
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
    
    .instructions ul {
      margin-left: 20px;
    }
    
    .instructions code {
      background-color: #eee;
      padding: 2px 4px;
      border-radius: 3px;
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
export class ErrorTestComponent extends BaseTestPage implements OnInit, OnDestroy {
  errorLog: string = '';
  
  // Propriedades para armazenar os manipuladores originais
  private originalOnError: OnErrorEventHandler | null = null;
  private originalOnUnhandledRejection: ((event: PromiseRejectionEvent) => void) | null = null;
  private originalConsoleError: (...data: any[]) => void;
  
  constructor(router: Router) {
    super(router);
    // Precisamos armazenar isso no construtor antes do setupErrorHandlers modificá-lo
    this.originalConsoleError = console.error;
  }
  
  override ngOnInit(): void {
    // Armazena os manipuladores originais
    this.originalOnError = window.onerror;
    this.originalOnUnhandledRejection = window.onunhandledrejection;
    
    // Configura os manipuladores de erro globais
    this.setupErrorHandlers();
  }
  
  override ngOnDestroy(): void {
    // Restaura os manipuladores originais quando o componente é destruído
    window.onerror = this.originalOnError;
    window.onunhandledrejection = this.originalOnUnhandledRejection;
    console.error = this.originalConsoleError;
  }
  
  setupErrorHandlers(): void {
    // Manipulador para erros gerais do JavaScript
    window.onerror = (message, source, lineno, colno, error) => {
      const timestamp = new Date().toLocaleTimeString();
      const errorMessage = `${message} em ${source}:${lineno}:${colno}`;
      this.addToErrorLog(timestamp, 'GLOBAL ERROR', errorMessage);
      
      // Se houver um manipulador original, chama-o também
      if (this.originalOnError) {
        return this.originalOnError(message, source, lineno, colno, error);
      }
      
      // Retorna false para permitir a propagação do erro
      return false;
    };
    
    // Manipulador para rejeições de Promise não tratadas
    window.onunhandledrejection = (event) => {
      const timestamp = new Date().toLocaleTimeString();
      const reason = event.reason?.message || 'Razão desconhecida';
      this.addToErrorLog(timestamp, 'UNHANDLED REJECTION', reason);
      
      // Se houver um manipulador original, chama-o também
      if (this.originalOnUnhandledRejection) {
        this.originalOnUnhandledRejection(event);
      }
    };
    
    // Captura erros de console.error
    console.error = (...args) => {
      const timestamp = new Date().toLocaleTimeString();
      const message = args.map(arg => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}`;
        }
        return String(arg);
      }).join(' ');
      
      // Capturamos todas as mensagens de console.error sem filtros
      this.addToErrorLog(timestamp, 'CONSOLE ERROR', message);
      
      // Chama o console.error original
      this.originalConsoleError.apply(console, args);
    };
  }
  
  generateError(type: string): void {
    // Gera os erros para serem capturados pelos manipuladores globais
    
    switch (type) {
      case 'log':
        console.log('Isto é um console.log de teste');
        break;
        
      case 'warn':
        console.warn('Isto é um console.warn de teste');
        break;
        
      case 'error':
        // Usando uma mensagem simples, já que capturamos todas as chamadas ao console.error
        console.error('Isto é um console.error de teste');
        break;
        
      case 'exception':
        try {
          throw new Error('Isto é uma exceção de teste');
        } catch (err) {
          console.error(err);
        }
        break;
        
      case 'promise':
        // Cria uma rejeição de Promise não tratada
        setTimeout(() => {
          Promise.reject(new Error('Isto é uma promise rejection não tratada'));
        }, 0);
        break;
        
      case 'reference':
        // Gera um erro de referência (ReferenceError)
        setTimeout(() => {
          try {
            // @ts-ignore
            nonExistentVariable.doSomething();
          } catch (err) {
            // Em vez de silenciar, re-lançamos para ser capturado por window.onerror
            throw err;
          }
        }, 0);
        break;
        
      case 'syntax':
        // Gera um erro de sintaxe (SyntaxError) usando eval
        setTimeout(() => {
          try {
            eval('if (true) {');
          } catch (err) {
            // Em vez de silenciar, re-lançamos para ser capturado por window.onerror
            throw err;
          }
        }, 0);
        break;
        
      case 'type':
        // Gera um erro de tipo (TypeError)
        setTimeout(() => {
          try {
            // @ts-ignore - Ignoramos o erro de tipo para forçar um erro em tempo de execução
            const num: any = null;
            num.toString();
          } catch (err) {
            // Em vez de silenciar, re-lançamos para ser capturado por window.onerror
            throw err;
          }
        }, 0);
        break;
    }
  }
  
  addToErrorLog(timestamp: string, type: string, message: string): void {
    // Executa a atualização do log de forma assíncrona para não interferir em erros
    setTimeout(() => {
      this.errorLog = `[${timestamp}] ${type}: ${message}\n${this.errorLog}`;
    }, 0);
  }
} 