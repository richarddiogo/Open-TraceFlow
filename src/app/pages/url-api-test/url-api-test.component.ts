import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseTestPage } from '../base-test-page';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-url-api-test',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './url-api-test.component.html',
  styleUrls: ['./url-api-test.component.scss']
})
export class UrlApiTestComponent extends BaseTestPage implements OnInit, OnDestroy {
  urlToNavigate = '';
  showIframe = false;
  safeUrl: SafeResourceUrl | null = null;
  
  apiResponse: any = null;
  apiSuccess = false;
  
  resourceMessage = '';
  
  eventLogs: {type: string, timestamp: Date, message: string}[] = [];
  
  // Propriedades para armazenar os manipuladores originais
  private originalOnError: OnErrorEventHandler | null = null;
  private originalOnUnhandledRejection: ((event: PromiseRejectionEvent) => void) | null = null;
  private originalConsoleError: (...data: any[]) => void;
  private errorEventListener: EventListener | null = null;
  
  constructor(
    router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    super(router);
    // Armazenamos a referência original do console.error
    this.originalConsoleError = console.error;
  }
  
  override ngOnInit(): void {
    // Armazena os manipuladores originais
    this.originalOnError = window.onerror;
    this.originalOnUnhandledRejection = window.onunhandledrejection;
    
    // Configura os manipuladores de erro globais
    this.setupErrorHandlers();
    
    // Não adicionamos mais logs manuais, apenas capturamos erros nativos
  }
  
  override ngOnDestroy(): void {
    // Restaura os manipuladores originais quando o componente é destruído
    window.onerror = this.originalOnError;
    window.onunhandledrejection = this.originalOnUnhandledRejection;
    console.error = this.originalConsoleError;
    
    // Remove o listener do evento de erro
    if (this.errorEventListener) {
      window.removeEventListener('error', this.errorEventListener);
    }
  }
  
  setupErrorHandlers(): void {
    // Manipulador para erros gerais do JavaScript
    window.onerror = (message, source, lineno, colno, error) => {
      const timestamp = new Date();
      this.addLog('error', `GLOBAL ERROR: ${message} (${source}:${lineno}:${colno})`);
      
      // Se houver um manipulador original, chama-o também
      if (this.originalOnError) {
        return this.originalOnError(message, source, lineno, colno, error);
      }
      
      // Retorna false para permitir a propagação do erro
      return false;
    };
    
    // Evento específico para erros de carregamento de recursos (imagens, scripts, CSS)
    this.errorEventListener = (event: Event) => {
      const errorEvent = event as ErrorEvent;
      if (errorEvent.target && 'tagName' in errorEvent.target) {
        const target = errorEvent.target as HTMLElement;
        const tagName = target.tagName.toLowerCase();
        const src = 'src' in target ? (target as HTMLImageElement | HTMLScriptElement).src : 
                  'href' in target ? (target as HTMLLinkElement).href : 'desconhecido';
        
        this.addLog('error', `RECURSO FALHOU: Falha ao carregar ${tagName} de ${src}`);
      }
    };
    
    // Adicionando o listener global para o evento de erro
    window.addEventListener('error', this.errorEventListener, true);
    
    // Manipulador para rejeições de Promise não tratadas
    window.onunhandledrejection = (event) => {
      const timestamp = new Date();
      const reason = event.reason?.message || 'Razão desconhecida';
      this.addLog('error', `PROMISE REJECTION: ${reason}`);
      
      // Se houver um manipulador original, chama-o também
      if (this.originalOnUnhandledRejection) {
        this.originalOnUnhandledRejection(event);
      }
    };
    
    // Captura erros de console.error
    console.error = (...args) => {
      const message = args.map(arg => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}`;
        }
        return String(arg);
      }).join(' ');
      
      this.addLog('error', `CONSOLE ERROR: ${message}`);
      
      // Chama o console.error original
      this.originalConsoleError.apply(console, args);
    };
  }
  
  // Métodos para testes de URL
  navigateToUrl(): void {
    try {
      if (!this.urlToNavigate) {
        // Uso de console.error para que seja capturado pelo manipulador
        console.error('URL vazia. Por favor, digite uma URL para navegar.');
        return;
      }
      
      // Verificação básica se a URL é válida
      const urlObj = new URL(this.urlToNavigate);
      
      // Sanitizar a URL para uso seguro em iframe
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlToNavigate);
      this.showIframe = true;
      
      // Em vez de log, apenas atualizamos o resourceMessage para feedback ao usuário
      this.resourceMessage = `Tentando navegar para: ${this.urlToNavigate}`;
    } catch (error) {
      // Em vez de log manual, usamos console.error para que seja capturado pelo manipulador
      console.error(`URL inválida: ${error}`);
      this.resourceMessage = `Erro ao analisar URL: ${error}`;
    }
  }
  
  navigateTo404(): void {
    this.urlToNavigate = 'https://jsonplaceholder.typicode.com/posts/999999';
    this.navigateToUrl();
  }
  
  navigateToInvalid(): void {
    this.urlToNavigate = 'https://invalid-domain-that-doesnt-exist-abcxyz.com';
    this.navigateToUrl();
  }
  
  handleIframeLoad(): void {
    this.resourceMessage = 'Iframe carregado com sucesso';
  }
  
  handleIframeError(): void {
    // Usamos console.error para que seja capturado pelo manipulador
    console.error('Erro ao carregar iframe');
  }
  
  // Métodos para testes de API
  makeSuccessApiCall(): void {
    this.resourceMessage = 'Iniciando chamada de API com sucesso (200)';
    this.http.get('https://jsonplaceholder.typicode.com/posts/1').subscribe(
      (response) => {
        this.apiResponse = response;
        this.apiSuccess = true;
        this.resourceMessage = 'API respondeu com sucesso (200)';
      },
      (error) => {
        this.handleApiError(error);
      }
    );
  }
  
  makeNotFoundApiCall(): void {
    this.resourceMessage = 'Iniciando chamada de API com erro 404';
    this.http.get('https://jsonplaceholder.typicode.com/posts/999999').subscribe(
      (response) => {
        this.apiResponse = response;
        this.apiSuccess = true;
        this.resourceMessage = 'API respondeu com sucesso (não esperado)';
      },
      (error) => {
        this.handleApiError(error);
      }
    );
  }
  
  makeServerErrorApiCall(): void {
    this.resourceMessage = 'Iniciando chamada de API com erro 500';
    // Uma URL que deve causar um erro 500
    this.http.get('https://httpstat.us/500').subscribe(
      (response) => {
        this.apiResponse = response;
        this.apiSuccess = true;
        this.resourceMessage = 'API respondeu com sucesso (não esperado)';
      },
      (error) => {
        this.handleApiError(error);
      }
    );
  }
  
  makeTimeoutApiCall(): void {
    this.resourceMessage = 'Iniciando chamada de API com timeout';
    // Uma URL que deve causar timeout
    this.http.get('https://httpstat.us/200?sleep=10000').subscribe(
      (response) => {
        this.apiResponse = response;
        this.apiSuccess = true;
        this.resourceMessage = 'API respondeu com sucesso (não esperado)';
      },
      (error) => {
        this.handleApiError(error);
      }
    );
  }
  
  makeCORSErrorApiCall(): void {
    this.resourceMessage = 'Iniciando chamada de API com erro de CORS';
    // Uma URL que deve causar erro de CORS
    this.http.get('https://api.spotify.com/v1/tracks/2TpxZ7JUBn3uw46aR7qd6V').subscribe(
      (response) => {
        this.apiResponse = response;
        this.apiSuccess = true;
        this.resourceMessage = 'API respondeu com sucesso (não esperado)';
      },
      (error) => {
        this.handleApiError(error);
      }
    );
  }
  
  private handleApiError(error: any): void {
    this.apiResponse = { 
      status: error.status,
      message: error.message,
      name: error.name,
      error: error.error
    };
    this.apiSuccess = false;
    
    // Em vez de adicionar um log manual, usamos console.error para que seja capturado pelo manipulador
    console.error(`Erro de API: ${error.status} - ${error.message}`);
  }
  
  // Métodos para testes de recursos
  loadBrokenImage(): void {
    this.resourceMessage = 'Carregando imagem quebrada...';
    const target = document.getElementById('resource-target');
    if (target) {
      target.innerHTML = '';
      
      const img = document.createElement('img');
      img.src = 'https://example.com/non-existent-image.jpg';
      img.alt = 'Imagem quebrada';
      img.style.maxWidth = '100%';
      
      target.appendChild(img);
    }
  }
  
  loadBrokenScript(): void {
    this.resourceMessage = 'Carregando script quebrado...';
    const target = document.getElementById('resource-target');
    if (target) {
      target.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://example.com/non-existent-script.js';
      
      target.appendChild(script);
    }
  }
  
  loadBrokenCSS(): void {
    this.resourceMessage = 'Carregando CSS quebrado...';
    const target = document.getElementById('resource-target');
    if (target) {
      target.innerHTML = '';
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://example.com/non-existent-styles.css';
      
      target.appendChild(link);
    }
  }
  
  // Métodos para testes de erro
  generateReferenceError(): void {
    this.resourceMessage = 'Gerando erro de referência (ReferenceError)...';
    setTimeout(() => {
      try {
        // @ts-ignore - Acesso deliberado a uma variável não definida
        nonExistentVariable.doSomething();
      } catch (err) {
        // Lançamos novamente para ser capturado pelo window.onerror
        throw err;
      }
    }, 0);
  }
  
  generateTypeError(): void {
    this.resourceMessage = 'Gerando erro de tipo (TypeError)...';
    setTimeout(() => {
      try {
        // @ts-ignore - Forçando um error de tipo
        const num: any = null;
        num.toString();
      } catch (err) {
        // Lançamos novamente para ser capturado pelo window.onerror
        throw err;
      }
    }, 0);
  }
  
  generatePromiseRejection(): void {
    this.resourceMessage = 'Gerando Promise Rejection não tratada...';
    setTimeout(() => {
      Promise.reject(new Error('Esta é uma Promise rejection deliberada'));
    }, 0);
  }
  
  generateConsoleError(): void {
    this.resourceMessage = 'Gerando console.error...';
    console.error('Este é um erro de console gerado manualmente');
  }
  
  // Métodos para log de eventos
  addLog(type: 'info' | 'success' | 'warning' | 'error', message: string): void {
    this.eventLogs.unshift({
      type,
      timestamp: new Date(),
      message
    });
    
    // Limita o número de logs para evitar problemas de performance
    if (this.eventLogs.length > 50) {
      this.eventLogs.pop();
    }
  }
  
  clearLogs(): void {
    this.eventLogs = [];
    // Não adicionamos mais logs manuais, apenas uma mensagem para o usuário
    this.resourceMessage = 'Logs limpos';
  }
} 