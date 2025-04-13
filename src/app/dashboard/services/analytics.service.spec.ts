import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';
import { SessionRecorderService } from '../../tracking/services/session-recorder.service';
import { of } from 'rxjs';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let sessionRecorderMock: jasmine.SpyObj<SessionRecorderService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('SessionRecorderService', ['getSessions']);
    
    // Mock de sessões para teste
    const mockSessions = [
      {
        sessionId: 'test_session_1',
        startTime: Date.now() - 60000, // 1 minuto atrás
        events: [
          { type: 'click', timestamp: Date.now() - 55000, data: { path: ['button', 'submit'] } },
          { type: 'mousemove', timestamp: Date.now() - 50000 },
          { type: 'scroll', timestamp: Date.now() - 45000 },
          { type: 'click', timestamp: Date.now() - 40000, data: { path: ['button', 'cancel'] } },
          { type: 'custom', timestamp: Date.now() - 35000, data: { name: 'rage_click' } }
        ],
        metadata: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          screenWidth: 1920,
          screenHeight: 1080,
          url: 'https://example.com/test',
          referrer: 'https://example.com'
        }
      }
    ];
    
    spy.getSessions.and.returnValue(of(mockSessions));

    TestBed.configureTestingModule({
      providers: [
        AnalyticsService,
        { provide: SessionRecorderService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(AnalyticsService);
    sessionRecorderMock = TestBed.inject(SessionRecorderService) as jasmine.SpyObj<SessionRecorderService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should process session data correctly', (done) => {
    service.getMetrics().subscribe(metrics => {
      expect(metrics.totalSessions).toBe(1);
      expect(metrics.totalEvents).toBe(5);
      expect(metrics.rageClicks).toBe(1);
      expect(metrics.eventsByType['click']).toBe(2);
      expect(metrics.eventsByType['mousemove']).toBe(1);
      expect(metrics.eventsByType['scroll']).toBe(1);
      expect(metrics.eventsByType['custom']).toBe(1);
      expect(metrics.browserStats['Chrome']).toBe(1);
      expect(metrics.deviceStats['Desktop']).toBe(1);
      expect(metrics.pageViews['https://example.com/test']).toBe(1);
      done();
    });
  });

  it('should format duration correctly', () => {
    expect(service.formatDuration(1000)).toBe('1s');
    expect(service.formatDuration(60000)).toBe('1m 0s');
    expect(service.formatDuration(3600000)).toBe('1h 0m');
    expect(service.formatDuration(3661000)).toBe('1h 1m');
  });
});
