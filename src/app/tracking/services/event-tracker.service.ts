import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Observable } from 'rxjs';

export interface TrackingEvent {
  type: string;
  target?: HTMLElement | null;
  timestamp: number;
  data?: any;
  x?: number;
  y?: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventTrackerService {
  private events$ = new Subject<TrackingEvent>();
  private isCapturing = false;
  private eventListeners: { [key: string]: any } = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Inicia a captura de eventos do usuário
   */
  startCapturing(): void {
    if (!isPlatformBrowser(this.platformId) || this.isCapturing) {
      return;
    }

    this.isCapturing = true;
    this.attachEventListeners();
    console.log('Event tracking started');
  }

  /**
   * Para a captura de eventos do usuário
   */
  stopCapturing(): void {
    if (!isPlatformBrowser(this.platformId) || !this.isCapturing) {
      return;
    }

    this.isCapturing = false;
    this.detachEventListeners();
    console.log('Event tracking stopped');
  }

  /**
   * Retorna um Observable com todos os eventos capturados
   */
  getEvents(): Observable<TrackingEvent> {
    return this.events$.asObservable();
  }

  /**
   * Registra um evento personalizado
   */
  trackCustomEvent(eventName: string, data: any): void {
    if (!this.isCapturing) {
      return;
    }

    this.events$.next({
      type: 'custom',
      timestamp: Date.now(),
      data: {
        name: eventName,
        ...data
      }
    });
  }

  /**
   * Anexa os listeners de eventos ao DOM
   */
  private attachEventListeners(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Cliques
    this.eventListeners['click'] = this.handleClick.bind(this);
    document.addEventListener('click', this.eventListeners['click']);

    // Movimento do mouse
    this.eventListeners['mousemove'] = this.handleMouseMove.bind(this);
    document.addEventListener('mousemove', this.eventListeners['mousemove']);

    // Rolagem
    this.eventListeners['scroll'] = this.handleScroll.bind(this);
    document.addEventListener('scroll', this.eventListeners['scroll'], true);

    // Redimensionamento da janela
    this.eventListeners['resize'] = this.handleResize.bind(this);
    window.addEventListener('resize', this.eventListeners['resize']);

    // Mudanças de foco
    this.eventListeners['focus'] = this.handleFocus.bind(this);
    document.addEventListener('focus', this.eventListeners['focus'], true);
    this.eventListeners['blur'] = this.handleBlur.bind(this);
    document.addEventListener('blur', this.eventListeners['blur'], true);

    // Entrada de dados
    this.eventListeners['input'] = this.handleInput.bind(this);
    document.addEventListener('input', this.eventListeners['input'], true);

    // Mudanças no DOM
    this.observeDOMChanges();
  }

  /**
   * Remove os listeners de eventos do DOM
   */
  private detachEventListeners(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    document.removeEventListener('click', this.eventListeners['click']);
    document.removeEventListener('mousemove', this.eventListeners['mousemove']);
    document.removeEventListener('scroll', this.eventListeners['scroll'], true);
    window.removeEventListener('resize', this.eventListeners['resize']);
    document.removeEventListener('focus', this.eventListeners['focus'], true);
    document.removeEventListener('blur', this.eventListeners['blur'], true);
    document.removeEventListener('input', this.eventListeners['input'], true);

    // Desconectar o observador de mutações
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
  }

  // Handlers para diferentes tipos de eventos
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    this.events$.next({
      type: 'click',
      target,
      timestamp: Date.now(),
      x: event.clientX,
      y: event.clientY,
      data: {
        button: event.button,
        path: this.getElementPath(target)
      }
    });
  }

  private handleMouseMove(event: MouseEvent): void {
    // Limitamos a captura de movimentos do mouse para não sobrecarregar
    if (event.timeStamp % 100 > 50) return; // Amostragem para reduzir volume

    this.events$.next({
      type: 'mousemove',
      timestamp: Date.now(),
      x: event.clientX,
      y: event.clientY
    });
  }

  private handleScroll(event: Event): void {
    const target = event.target as HTMLElement;
    this.events$.next({
      type: 'scroll',
      target,
      timestamp: Date.now(),
      data: {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        path: this.getElementPath(target)
      }
    });
  }

  private handleResize(event: UIEvent): void {
    this.events$.next({
      type: 'resize',
      timestamp: Date.now(),
      data: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  private handleFocus(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    this.events$.next({
      type: 'focus',
      target,
      timestamp: Date.now(),
      data: {
        path: this.getElementPath(target)
      }
    });
  }

  private handleBlur(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    this.events$.next({
      type: 'blur',
      target,
      timestamp: Date.now(),
      data: {
        path: this.getElementPath(target)
      }
    });
  }

  private handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    
    // Não capturamos o valor real para campos sensíveis
    const isSensitive = this.isSensitiveField(target);
    
    this.events$.next({
      type: 'input',
      target,
      timestamp: Date.now(),
      data: {
        path: this.getElementPath(target),
        value: isSensitive ? '[REDACTED]' : target.value
      }
    });
  }

  // MutationObserver para detectar mudanças no DOM
  private mutationObserver: MutationObserver | null = null;

  private observeDOMChanges(): void {
    if (!isPlatformBrowser(this.platformId) || !window.MutationObserver) {
      return;
    }

    this.mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Verifica se o target é um elemento válido antes de processá-lo
        if (mutation.target && mutation.target.nodeType === Node.ELEMENT_NODE) {
          this.events$.next({
            type: 'dom',
            timestamp: Date.now(),
            data: {
              type: mutation.type,
              target: this.getElementPath(mutation.target as HTMLElement)
            }
          });
        }
      });
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      attributes: true,
      characterData: true,
      subtree: true,
      attributeOldValue: true,
      characterDataOldValue: true
    });
  }

  // Utilitários
  private getElementPath(element: HTMLElement | null): string[] {
    if (!element) return [];
    
    const path: string[] = [];
    let currentElement: HTMLElement | null = element;
    
    while (currentElement && currentElement !== document.body) {
      // Verificar se currentElement tem a propriedade tagName antes de acessá-la
      if (!currentElement.tagName) {
        currentElement = currentElement.parentElement;
        continue;
      }
      
      let identifier = currentElement.tagName.toLowerCase();
      
      if (currentElement.id) {
        identifier += `#${currentElement.id}`;
      } else if (currentElement.className) {
        // Verifica se classList existe e é um objeto
        if (currentElement.classList && typeof currentElement.classList.forEach === 'function') {
          const classes = Array.from(currentElement.classList).join('.');
          if (classes) {
            identifier += `.${classes}`;
          }
        }
      }
      
      path.unshift(identifier);
      currentElement = currentElement.parentElement;
    }
    
    return path;
  }

  private isSensitiveField(element: HTMLElement): boolean {
    if (!(element instanceof HTMLInputElement)) {
      return false;
    }

    // Verificar atributos que indicam campos sensíveis
    if (
      element.type === 'password' ||
      (element.name && element.name.toLowerCase().includes('password')) ||
      (element.name && element.name.toLowerCase().includes('credit')) ||
      (element.name && element.name.toLowerCase().includes('card')) ||
      element.getAttribute('data-sensitive') === 'true' ||
      element.hasAttribute('data-fs-exclude')
    ) {
      return true;
    }

    return false;
  }
}
