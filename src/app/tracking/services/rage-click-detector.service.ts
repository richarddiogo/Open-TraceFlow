import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject, Observable } from 'rxjs';

export interface RageClickEvent {
  element: HTMLElement;
  path: string[];
  timestamp: number;
  clickCount: number;
  timeSpan: number;
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class RageClickDetectorService {
  private rageClicks$ = new Subject<RageClickEvent>();
  private clickHistory: {element: HTMLElement, timestamp: number, x: number, y: number}[] = [];
  private isEnabled = false;
  
  // Configurações para detecção de rage clicks
  private readonly RAGE_CLICK_THRESHOLD = 3; // Número mínimo de cliques para considerar um rage click
  private readonly RAGE_CLICK_TIMESPAN = 2000; // Janela de tempo em ms para considerar cliques consecutivos
  private readonly RAGE_CLICK_RADIUS = 30; // Raio em pixels para considerar cliques na mesma área

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Inicia a detecção de rage clicks
   */
  enable(): void {
    if (!isPlatformBrowser(this.platformId) || this.isEnabled) {
      return;
    }
    
    this.isEnabled = true;
    this.clickHistory = [];
    console.log('Rage click detection enabled');
  }

  /**
   * Para a detecção de rage clicks
   */
  disable(): void {
    if (!isPlatformBrowser(this.platformId) || !this.isEnabled) {
      return;
    }
    
    this.isEnabled = false;
    this.clickHistory = [];
    console.log('Rage click detection disabled');
  }

  /**
   * Retorna um Observable com eventos de rage clicks detectados
   */
  getRageClicks(): Observable<RageClickEvent> {
    return this.rageClicks$.asObservable();
  }

  /**
   * Processa um evento de clique para detectar rage clicks
   * Deve ser chamado pelo EventTrackerService quando um clique é detectado
   */
  processClick(element: HTMLElement, x: number, y: number): void {
    if (!this.isEnabled) {
      return;
    }

    const now = Date.now();
    
    // Adiciona o clique atual ao histórico
    this.clickHistory.push({
      element,
      timestamp: now,
      x,
      y
    });
    
    // Remove cliques antigos fora da janela de tempo
    this.clickHistory = this.clickHistory.filter(click => 
      now - click.timestamp <= this.RAGE_CLICK_TIMESPAN
    );
    
    // Verifica se há rage clicks na mesma área
    this.detectRageClicks(x, y, element);
  }

  /**
   * Detecta rage clicks com base no histórico de cliques
   */
  private detectRageClicks(x: number, y: number, element: HTMLElement): void {
    // Filtra cliques próximos à posição atual
    const nearbyClicks = this.clickHistory.filter(click => 
      this.isWithinRadius(click.x, click.y, x, y, this.RAGE_CLICK_RADIUS)
    );
    
    // Se houver cliques suficientes próximos, emite um evento de rage click
    if (nearbyClicks.length >= this.RAGE_CLICK_THRESHOLD) {
      const firstClick = nearbyClicks[0];
      const lastClick = nearbyClicks[nearbyClicks.length - 1];
      const timeSpan = lastClick.timestamp - firstClick.timestamp;
      
      this.rageClicks$.next({
        element,
        path: this.getElementPath(element),
        timestamp: Date.now(),
        clickCount: nearbyClicks.length,
        timeSpan,
        x,
        y
      });
      
      // Limpa o histórico após detectar um rage click para evitar duplicações
      this.clickHistory = [];
    }
  }

  /**
   * Verifica se duas coordenadas estão dentro de um raio específico
   */
  private isWithinRadius(x1: number, y1: number, x2: number, y2: number, radius: number): boolean {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance <= radius;
  }

  /**
   * Obtém o caminho do elemento no DOM
   */
  private getElementPath(element: HTMLElement): string[] {
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
}
