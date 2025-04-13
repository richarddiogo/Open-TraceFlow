import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }

  /**
   * Formata a duração em milissegundos para um formato legível
   * @param ms Duração em milissegundos
   * @returns String formatada (ex: "5s", "2m 30s", "1h 15m")
   */
  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Formata um timestamp para uma data legível
   * @param timestamp Timestamp em milissegundos
   * @returns String formatada com data e hora
   */
  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }

  /**
   * Gera um ID único
   * @param prefix Prefixo opcional para o ID
   * @returns String com ID único
   */
  generateUniqueId(prefix: string = ''): string {
    return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verifica se um elemento é sensível (contém dados que não devem ser capturados)
   * @param element Elemento HTML a ser verificado
   * @returns Boolean indicando se o elemento é sensível
   */
  isSensitiveElement(element: HTMLElement): boolean {
    if (!(element instanceof HTMLElement)) {
      return false;
    }

    // Verificar atributos que indicam campos sensíveis
    if (
      (element instanceof HTMLInputElement && element.type === 'password') ||
      element.getAttribute('data-sensitive') === 'true' ||
      element.hasAttribute('data-fs-exclude') ||
      element.classList.contains('fs-exclude')
    ) {
      return true;
    }

    // Verificar nomes de campos comuns que podem conter dados sensíveis
    const sensitiveTerms = ['password', 'credit', 'card', 'cvv', 'ssn', 'social', 'secret'];
    const elementName = (element.getAttribute('name') || '').toLowerCase();
    const elementId = (element.getAttribute('id') || '').toLowerCase();
    
    return sensitiveTerms.some(term => 
      elementName.includes(term) || elementId.includes(term)
    );
  }

  /**
   * Obtém o caminho do elemento no DOM
   * @param element Elemento HTML
   * @returns Array com o caminho do elemento
   */
  getElementPath(element: HTMLElement | null): string[] {
    if (!element) return [];
    
    const path: string[] = [];
    let currentElement: HTMLElement | null = element;
    
    while (currentElement && currentElement !== document.body) {
      let identifier = currentElement.tagName.toLowerCase();
      
      if (currentElement.id) {
        identifier += `#${currentElement.id}`;
      } else if (currentElement.className) {
        const classes = Array.from(currentElement.classList).join('.');
        if (classes) {
          identifier += `.${classes}`;
        }
      }
      
      path.unshift(identifier);
      currentElement = currentElement.parentElement;
    }
    
    return path;
  }

  /**
   * Calcula a porcentagem de um valor em relação ao total
   * @param value Valor
   * @param total Total
   * @returns String formatada com a porcentagem
   */
  getPercentage(value: number, total: number): string {
    if (!total) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  }

  /**
   * Verifica se duas coordenadas estão dentro de um raio específico
   * @param x1 Coordenada X do primeiro ponto
   * @param y1 Coordenada Y do primeiro ponto
   * @param x2 Coordenada X do segundo ponto
   * @param y2 Coordenada Y do segundo ponto
   * @param radius Raio máximo
   * @returns Boolean indicando se os pontos estão dentro do raio
   */
  isWithinRadius(x1: number, y1: number, x2: number, y2: number, radius: number): boolean {
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance <= radius;
  }

  /**
   * Detecta o tipo de dispositivo com base no user agent
   * @param userAgent String do user agent
   * @returns String com o tipo de dispositivo
   */
  detectDeviceType(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('iphone') || ua.includes('ipod')) {
      return 'iPhone';
    } else if (ua.includes('ipad')) {
      return 'iPad';
    } else if (ua.includes('android')) {
      return ua.includes('mobile') ? 'Android Phone' : 'Android Tablet';
    }
    
    return 'Desktop';
  }

  /**
   * Detecta o navegador com base no user agent
   * @param userAgent String do user agent
   * @returns String com o nome do navegador
   */
  detectBrowser(userAgent: string): string {
    const ua = userAgent.toLowerCase();
    
    if (ua.includes('firefox')) {
      return 'Firefox';
    } else if (ua.includes('chrome') && !ua.includes('edg')) {
      return 'Chrome';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      return 'Safari';
    } else if (ua.includes('edg')) {
      return 'Edge';
    } else if (ua.includes('opera') || ua.includes('opr')) {
      return 'Opera';
    }
    
    return 'Unknown';
  }

  /**
   * Comprime dados JSON para armazenamento eficiente
   * @param data Objeto a ser comprimido
   * @returns String comprimida
   */
  compressData(data: any): string {
    try {
      // Versão simplificada - em uma implementação real, usaríamos uma biblioteca de compressão
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error compressing data:', error);
      return '';
    }
  }

  /**
   * Descomprime dados JSON
   * @param compressedData String comprimida
   * @returns Objeto descomprimido
   */
  decompressData(compressedData: string): any {
    try {
      // Versão simplificada - em uma implementação real, usaríamos uma biblioteca de descompressão
      return JSON.parse(compressedData);
    } catch (error) {
      console.error('Error decompressing data:', error);
      return null;
    }
  }

  /**
   * Limita o tamanho de um array, mantendo os itens mais recentes
   * @param array Array a ser limitado
   * @param maxSize Tamanho máximo
   * @returns Array limitado
   */
  limitArraySize<T>(array: T[], maxSize: number): T[] {
    if (array.length <= maxSize) {
      return array;
    }
    return array.slice(array.length - maxSize);
  }

  /**
   * Agrupa um array de objetos por uma propriedade
   * @param array Array a ser agrupado
   * @param key Propriedade para agrupar
   * @returns Objeto com os grupos
   */
  groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
    return array.reduce((result, item) => {
      const groupKey = String(item[key]);
      result[groupKey] = result[groupKey] || [];
      result[groupKey].push(item);
      return result;
    }, {} as { [key: string]: T[] });
  }
}
