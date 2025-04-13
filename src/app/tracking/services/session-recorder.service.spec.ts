import { TestBed } from '@angular/core/testing';
import { SessionRecorderService } from './session-recorder.service';
import { EventTrackerService } from './event-tracker.service';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';

describe('SessionRecorderService', () => {
  let service: SessionRecorderService;
  let eventTrackerMock: jasmine.SpyObj<EventTrackerService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('EventTrackerService', ['startCapturing', 'stopCapturing', 'getEvents']);
    spy.getEvents.and.returnValue(of({ type: 'click', timestamp: Date.now() }));

    TestBed.configureTestingModule({
      providers: [
        SessionRecorderService,
        { provide: EventTrackerService, useValue: spy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });
    service = TestBed.inject(SessionRecorderService);
    eventTrackerMock = TestBed.inject(EventTrackerService) as jasmine.SpyObj<EventTrackerService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start and stop recording', () => {
    // Espiona o console.log
    spyOn(console, 'log');
    
    // Inicia a gravação
    service.startRecording();
    expect(eventTrackerMock.startCapturing).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/Session recording started/));
    
    // Para a gravação
    service.stopRecording();
    expect(eventTrackerMock.stopCapturing).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(jasmine.stringMatching(/Session recording stopped/));
  });

  it('should add session metadata', () => {
    // Inicia a gravação
    service.startRecording();
    
    // Adiciona metadados
    service.addSessionMetadata('test_key', 'test_value');
    
    // Verifica se os metadados foram adicionados
    service.getSessions().subscribe(sessions => {
      if (sessions.length > 0) {
        expect(sessions[0].metadata['test_key']).toBe('test_value');
      }
    });
  });

  it('should clear all sessions', () => {
    // Inicia a gravação
    service.startRecording();
    
    // Limpa todas as sessões
    service.clearAllSessions();
    
    // Verifica se as sessões foram limpas
    service.getSessions().subscribe(sessions => {
      expect(sessions.length).toBe(0);
    });
  });
});
