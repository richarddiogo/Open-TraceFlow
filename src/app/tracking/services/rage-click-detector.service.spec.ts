import { TestBed } from '@angular/core/testing';
import { RageClickDetectorService } from './rage-click-detector.service';
import { PLATFORM_ID } from '@angular/core';

describe('RageClickDetectorService', () => {
  let service: RageClickDetectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RageClickDetectorService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(RageClickDetectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should enable and disable rage click detection', () => {
    // Espiona o console.log
    spyOn(console, 'log');
    
    // Habilita a detecção
    service.enable();
    expect(console.log).toHaveBeenCalledWith('Rage click detection enabled');
    
    // Desabilita a detecção
    service.disable();
    expect(console.log).toHaveBeenCalledWith('Rage click detection disabled');
  });

  it('should detect rage clicks', (done) => {
    // Habilita a detecção
    service.enable();
    
    // Cria um elemento de teste
    const element = document.createElement('button');
    document.body.appendChild(element);
    
    // Inscreve-se para receber eventos de rage clicks
    service.getRageClicks().subscribe(event => {
      expect(event.element).toBe(element);
      expect(event.clickCount).toBeGreaterThanOrEqual(3);
      document.body.removeChild(element);
      done();
    });
    
    // Simula múltiplos cliques rápidos na mesma área
    const x = 100;
    const y = 100;
    
    // Processa 3 cliques rápidos
    service.processClick(element, x, y);
    service.processClick(element, x + 2, y - 1);
    service.processClick(element, x - 1, y + 2);
  });
});
