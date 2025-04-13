import { Component, OnInit } from '@angular/core';
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
export class UrlApiTestComponent extends BaseTestPage implements OnInit {
  urlToNavigate = '';
  showIframe = false;
  safeUrl: SafeResourceUrl | null = null;
  
  apiResponse: any = null;
  apiSuccess = false;
  
  resourceMessage = '';
  
  eventLogs: {type: string, timestamp: Date, message: string}[] = [];
  
  constructor(
    router: Router,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {
    super(router);
  }
  
  override ngOnInit(): void {
    this.addLog('info', 'Componente de teste de URL/API inicializado');
  }
  
  // Métodos para testes de URL
  navigateToUrl(): void {
    try {
      if (!this.urlToNavigate) {
        this.addLog('warning', 'URL vazia. Por favor, digite uma URL para navegar.');
        return;
      }
      
      // Verificação básica se a URL é válida
      const urlObj = new URL(this.urlToNavigate);
      this.addLog('info', `Tentando navegar para: ${this.urlToNavigate}`);
      
      // Sanitizar a URL para uso seguro em iframe
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlToNavigate);
      this.showIframe = true;
    } catch (error) {
      this.addLog('error', `URL inválida: ${error}`);
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
    this.addLog('success', 'Iframe carregado com sucesso');
  }
  
  handleIframeError(): void {
    this.addLog('error', 'Erro ao carregar iframe');
  }
  
  // Métodos para testes de API
  makeSuccessApiCall(): void {
    this.addLog('info', 'Iniciando chamada de API com sucesso (200)');
    this.http.get('https://jsonplaceholder.typicode.com/posts/1').subscribe(
      (response) => {
        this.apiResponse = response;
        this.apiSuccess = true;
        this.addLog('success', 'API respondeu com sucesso (200)');
      },
      (error) => {
        this.handleApiError(error);
      }
    );
  }
  
  makeNotFoundApiCall(): void {
    this.addLog('info', 'Iniciando chamada de API com erro 404');
    this.http.get('https://jsonplaceholder.typicode.com/posts/999999').subscribe(
      (response) => {
        this.apiResponse = response;
        this.apiSuccess = true;
        this.addLog('success', 'API respondeu com sucesso (não esperado)');
      },
      (error) => {
        this.handleApiError(error);
      }
    );
  }
  
  makeServerErrorApiCall(): void {
    this.addLog('info', 'Iniciando chamada de API com erro 500');
    // Uma URL que deve causar um erro 500
    this.http.get('https://httpstat.us/500').subscribe(
      (response) => {
        this.apiResponse = response;
        this.apiSuccess = true;
        this.addLog('success', 'API respondeu com sucesso (não esperado)');
      },
      (error) => {
        this.handleApiError(error);
      }
    );
  }
  
  makeTimeoutApiCall(): void {
    this.addLog('info', 'Iniciando chamada de API com timeout');
    // Uma URL que deve causar timeout
    this.http.get('https://httpstat.us/200?sleep=10000').subscribe(
      (response) => {
        this.apiResponse = response;
        this.apiSuccess = true;
        this.addLog('success', 'API respondeu com sucesso (não esperado)');
      },
      (error) => {
        this.handleApiError(error);
      }
    );
  }
  
  makeCORSErrorApiCall(): void {
    this.addLog('info', 'Iniciando chamada de API com erro de CORS');
    // Uma URL que deve causar erro de CORS
    this.http.get('https://api.spotify.com/v1/tracks/2TpxZ7JUBn3uw46aR7qd6V').subscribe(
      (response) => {
        this.apiResponse = response;
        this.apiSuccess = true;
        this.addLog('success', 'API respondeu com sucesso (não esperado)');
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
    this.addLog('error', `Erro de API: ${error.status} - ${error.message}`);
  }
  
  // Métodos para testes de recursos
  loadBrokenImage(): void {
    this.addLog('info', 'Carregando imagem quebrada');
    const target = document.getElementById('resource-target');
    if (target) {
      target.innerHTML = '';
      
      const img = document.createElement('img');
      img.src = 'https://example.com/non-existent-image.jpg';
      img.alt = 'Imagem quebrada';
      img.style.maxWidth = '100%';
      
      img.onload = () => {
        this.resourceMessage = 'Imagem carregada com sucesso (não esperado)';
        this.addLog('success', 'Imagem carregada com sucesso (não esperado)');
      };
      
      img.onerror = () => {
        this.resourceMessage = 'Erro ao carregar a imagem (esperado)';
        this.addLog('warning', 'Erro ao carregar a imagem (comportamento esperado)');
      };
      
      target.appendChild(img);
    }
  }
  
  loadBrokenScript(): void {
    this.addLog('info', 'Carregando script quebrado');
    const target = document.getElementById('resource-target');
    if (target) {
      target.innerHTML = '';
      
      const script = document.createElement('script');
      script.src = 'https://example.com/non-existent-script.js';
      
      script.onload = () => {
        this.resourceMessage = 'Script carregado com sucesso (não esperado)';
        this.addLog('success', 'Script carregado com sucesso (não esperado)');
      };
      
      script.onerror = () => {
        this.resourceMessage = 'Erro ao carregar o script (esperado)';
        this.addLog('warning', 'Erro ao carregar o script (comportamento esperado)');
      };
      
      target.appendChild(script);
    }
  }
  
  loadBrokenCSS(): void {
    this.addLog('info', 'Carregando CSS quebrado');
    const target = document.getElementById('resource-target');
    if (target) {
      target.innerHTML = '';
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://example.com/non-existent-styles.css';
      
      link.onload = () => {
        this.resourceMessage = 'CSS carregado com sucesso (não esperado)';
        this.addLog('success', 'CSS carregado com sucesso (não esperado)');
      };
      
      link.onerror = () => {
        this.resourceMessage = 'Erro ao carregar o CSS (esperado)';
        this.addLog('warning', 'Erro ao carregar o CSS (comportamento esperado)');
      };
      
      target.appendChild(link);
    }
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
    this.addLog('info', 'Logs limpos');
  }
} 