import { TestBed } from '@angular/core/testing';
import { EventTrackerService } from './event-tracker.service';
import { PLATFORM_ID } from '@angular/core';

describe('EventTrackerService', () => {
  let service: EventTrackerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventTrackerService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(EventTrackerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start and stop capturing', () => {
    // Espiona o console.log
    spyOn(console, 'log');
    
    // Inicia a captura
    service.startCapturing();
    expect(console.log).toHaveBeenCalledWith('Event tracking started');
    
    // Para a captura
    service.stopCapturing();
    expect(console.log).toHaveBeenCalledWith('Event tracking stopped');
  });

  it('should track custom events', (done) => {
    // Inicia a captura
    service.startCapturing();
    
    // Inscreve-se para receber eventos
    service.getEvents().subscribe(event => {
      expect(event.type).toBe('custom');
      expect(event.data.name).toBe('test_event');
      expect(event.data.value).toBe(123);
      done();
    });
    
    // Rastreia um evento personalizado
    service.trackCustomEvent('test_event', { value: 123 });
  });
});
