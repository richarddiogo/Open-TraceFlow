import { Component, Input, OnChanges, OnInit, SimpleChanges, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { SessionData } from '../tracking/services/session-recorder.service';
import { TrackingEvent } from '../tracking/services/event-tracker.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-session-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-player.component.html',
  styleUrls: ['./session-player.component.scss']
})
export class SessionPlayerComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() session: SessionData | null = null;
  @ViewChild('playerContainer') playerContainer!: ElementRef;
  
  isPlaying = false;
  currentEventIndex = 0;
  playbackSpeed = 1;
  currentTime = 0;
  totalDuration = 0;
  
  // Elementos virtuais para reprodução
  private virtualElements: Map<string, HTMLElement> = new Map();
  private playbackInterval: any = null;
  
  constructor() { }

  ngOnInit(): void {
  }
  
  ngAfterViewInit(): void {
    try {
      if (this.isValidSession(this.session)) {
        this.prepareSession();
      }
    } catch (err) {
      console.warn('Erro ao preparar a sessão:', err);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    try {
      if (changes['session'] && this.isValidSession(this.session)) {
        this.resetPlayer();
        if (this.playerContainer && this.playerContainer.nativeElement) {
          this.prepareSession();
        }
      }
    } catch (err) {
      console.warn('Erro ao processar mudanças na sessão:', err);
    }
  }
  
  /**
   * Verifica se a sessão é válida para reprodução
   */
  private isValidSession(session: SessionData | null): boolean {
    return !!session && 
           Array.isArray(session.events) && 
           session.events.length > 0 &&
           typeof session.sessionId === 'string' &&
           typeof session.startTime === 'number';
  }
  
  /**
   * Prepara a sessão para reprodução
   */
  private prepareSession(): void {
    if (!this.isValidSession(this.session)) {
      console.warn('Sessão inválida ou vazia');
      return;
    }
    
    // Verifica se o container está disponível
    if (!this.playerContainer || !this.playerContainer.nativeElement) {
      console.warn('Container de reprodução não disponível');
      return;
    }
    
    // Limpa o container
    this.playerContainer.nativeElement.innerHTML = '';
    this.virtualElements.clear();
    
    try {
      // Calcula a duração total se tivermos eventos suficientes
      if (this.session && this.session.events.length >= 2) {
        const firstEvent = this.session.events[0];
        const lastEvent = this.session.events[this.session.events.length - 1];
        this.totalDuration = lastEvent.timestamp - firstEvent.timestamp;
      } else {
        this.totalDuration = 0;
      }
      
      // Cria um iframe para simular o DOM original
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      
      this.playerContainer.nativeElement.appendChild(iframe);
      
      // Espera o iframe ser carregado
      iframe.onload = () => {
        try {
          // Obtém o documento do iframe
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          if (!iframeDoc) {
            console.warn('Não foi possível acessar o documento do iframe');
            return;
          }
          
          // Cria a estrutura do documento usando a API DOM
          const html = iframeDoc.createElement('html');
          const head = iframeDoc.createElement('head');
          const body = iframeDoc.createElement('body');
          
          // Cria os elementos meta e title
          const meta1 = iframeDoc.createElement('meta');
          meta1.setAttribute('charset', 'utf-8');
          
          const meta2 = iframeDoc.createElement('meta');
          meta2.setAttribute('name', 'viewport');
          meta2.setAttribute('content', 'width=device-width, initial-scale=1');
          
          const title = iframeDoc.createElement('title');
          title.textContent = 'Session Replay';
          
          // Cria o estilo
          const style = iframeDoc.createElement('style');
          style.textContent = `
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 0; 
              position: relative;
            }
            .cursor {
              position: absolute;
              width: 20px;
              height: 20px;
              background: rgba(255, 0, 0, 0.5);
              border-radius: 50%;
              pointer-events: none;
              transform: translate(-50%, -50%);
              z-index: 9999;
            }
            .click-indicator {
              position: absolute;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              border: 2px solid red;
              opacity: 0.7;
              pointer-events: none;
              transform: translate(-50%, -50%);
              z-index: 9998;
              animation: click-animation 0.5s ease-out forwards;
            }
            @keyframes click-animation {
              0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
              100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
            }
          `;
          
          // Cria o cursor
          const cursor = iframeDoc.createElement('div');
          cursor.className = 'cursor';
          cursor.style.display = 'none';
          
          // Monta a estrutura do documento
          head.appendChild(meta1);
          head.appendChild(meta2);
          head.appendChild(title);
          head.appendChild(style);
          
          body.appendChild(cursor);
          
          html.appendChild(head);
          html.appendChild(body);
          
          // Adiciona ao documento
          iframeDoc.open();
          iframeDoc.appendChild(html);
          iframeDoc.close();
        } catch (error) {
          console.error('Erro ao configurar o iframe:', error);
        }
      };
      
      // Trigger de carregamento manual, necessário em alguns navegadores
      iframe.src = 'about:blank';
    } catch (error) {
      console.error('Erro ao criar iframe para reprodução:', error);
    }
  }
  
  /**
   * Inicia a reprodução da sessão
   */
  play(): void {
    if (!this.session || !this.session.events || this.session.events.length === 0) {
      return;
    }
    
    this.isPlaying = true;
    
    // Obtém o iframe
    const iframe = this.playerContainer.nativeElement.querySelector('iframe');
    const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
    if (!iframeDoc) return;
    
    // Obtém o cursor
    const cursor = iframeDoc.querySelector('.cursor') as HTMLElement;
    if (!cursor) {
      console.warn('Cursor não encontrado no iframe');
      return;
    }
    
    cursor.style.display = 'block';
    
    // Calcula o tempo inicial
    const startTime = this.session.events[0].timestamp;
    let lastTimestamp = Date.now();
    
    // Inicia o loop de reprodução
    this.playbackInterval = setInterval(() => {
      if (!this.isPlaying || !this.session || this.currentEventIndex >= this.session.events.length) {
        this.pause();
        return;
      }
      
      // Calcula o tempo decorrido desde o último frame
      const now = Date.now();
      const elapsed = (now - lastTimestamp) * this.playbackSpeed;
      lastTimestamp = now;
      
      // Atualiza o tempo atual
      this.currentTime += elapsed;
      
      // Reproduz eventos até o tempo atual
      while (
        this.currentEventIndex < this.session.events.length && 
        this.session.events[this.currentEventIndex].timestamp - startTime <= this.currentTime
      ) {
        this.playEvent(this.session.events[this.currentEventIndex], iframeDoc, cursor);
        this.currentEventIndex++;
      }
      
      // Verifica se chegou ao fim
      if (this.currentEventIndex >= this.session.events.length) {
        this.pause();
      }
    }, 16); // ~60fps
  }
  
  /**
   * Pausa a reprodução
   */
  pause(): void {
    this.isPlaying = false;
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }
  
  /**
   * Reinicia a reprodução
   */
  restart(): void {
    this.pause();
    this.resetPlayer();
    this.play();
  }
  
  /**
   * Altera a velocidade de reprodução
   */
  setPlaybackSpeed(speed: number): void {
    this.playbackSpeed = speed;
  }
  
  /**
   * Manipula o evento de mudança de velocidade do select
   */
  onSpeedChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    if (select && select.value) {
      this.setPlaybackSpeed(+select.value);
    }
  }
  
  /**
   * Reseta o player para o início
   */
  private resetPlayer(): void {
    this.pause();
    this.currentEventIndex = 0;
    this.currentTime = 0;
    this.virtualElements.clear();
    
    if (this.playerContainer) {
      const iframe = this.playerContainer.nativeElement.querySelector('iframe');
      const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
      if (iframeDoc) {
        const cursor = iframeDoc.querySelector('.cursor') as HTMLElement;
        if (cursor) {
          cursor.style.display = 'none';
          cursor.style.left = '0';
          cursor.style.top = '0';
        }
      }
    }
  }
  
  /**
   * Reproduz um evento específico
   */
  private playEvent(event: TrackingEvent, doc: Document, cursor: HTMLElement): void {
    try {
      switch (event.type) {
        case 'mousemove':
          if (event.x !== undefined && event.y !== undefined) {
            cursor.style.left = `${event.x}px`;
            cursor.style.top = `${event.y}px`;
          }
          break;
          
        case 'click':
          if (event.x !== undefined && event.y !== undefined) {
            // Atualiza a posição do cursor
            cursor.style.left = `${event.x}px`;
            cursor.style.top = `${event.y}px`;
            
            // Cria um indicador de clique
            const clickIndicator = doc.createElement('div');
            clickIndicator.className = 'click-indicator';
            clickIndicator.style.left = `${event.x}px`;
            clickIndicator.style.top = `${event.y}px`;
            
            // Certifica-se de que o body existe
            if (doc.body) {
              doc.body.appendChild(clickIndicator);
              
              // Remove o indicador após a animação
              setTimeout(() => {
                try {
                  doc.body.removeChild(clickIndicator);
                } catch (err) {
                  console.warn('Erro ao remover indicador de clique:', err);
                }
              }, 500);
            }
            
            // Simula o clique no elemento virtual correspondente
            if (event.data?.path) {
              // Implementação simplificada - em uma versão completa, 
              // aqui reconstruiríamos o DOM e simularíamos o clique real
            }
          }
          break;
          
        case 'scroll':
          if (event.data?.scrollX !== undefined && event.data?.scrollY !== undefined) {
            if (doc.documentElement) {
              doc.documentElement.scrollLeft = event.data.scrollX;
              doc.documentElement.scrollTop = event.data.scrollY;
            }
          }
          break;
          
        case 'input':
          // Implementação simplificada - em uma versão completa, 
          // aqui atualizaríamos o valor do campo correspondente
          break;
          
        case 'dom':
          // Implementação simplificada - em uma versão completa, 
          // aqui reconstruiríamos as mudanças no DOM
          break;
      }
    } catch (err) {
      console.warn('Erro ao reproduzir evento:', err);
    }
  }
  
  /**
   * Formata o tempo em formato legível (mm:ss)
   */
  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  /**
   * Calcula a porcentagem de progresso
   */
  getProgressPercentage(): number {
    if (!this.totalDuration) return 0;
    return (this.currentTime / this.totalDuration) * 100;
  }
}
