import { TestBed } from '@angular/core/testing';
import { UtilsService } from './utils.service';

describe('UtilsService', () => {
  let service: UtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format duration correctly', () => {
    expect(service.formatDuration(1000)).toBe('1s');
    expect(service.formatDuration(60000)).toBe('1m 0s');
    expect(service.formatDuration(3600000)).toBe('1h 0m');
    expect(service.formatDuration(3661000)).toBe('1h 1m');
  });

  it('should format timestamp correctly', () => {
    const date = new Date(2025, 3, 10, 12, 0, 0);
    expect(service.formatTimestamp(date.getTime())).toBe(date.toLocaleString());
  });

  it('should generate unique IDs', () => {
    const id1 = service.generateUniqueId();
    const id2 = service.generateUniqueId();
    expect(id1).not.toEqual(id2);

    const prefixedId = service.generateUniqueId('test_');
    expect(prefixedId.startsWith('test_')).toBeTrue();
  });

  it('should detect sensitive elements', () => {
    // Criar elementos para teste
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    
    const sensitiveDiv = document.createElement('div');
    sensitiveDiv.setAttribute('data-sensitive', 'true');
    
    const excludedDiv = document.createElement('div');
    excludedDiv.setAttribute('data-fs-exclude', '');
    
    const normalDiv = document.createElement('div');
    
    const creditCardInput = document.createElement('input');
    creditCardInput.setAttribute('name', 'credit-card-number');

    // Testar cada elemento
    expect(service.isSensitiveElement(passwordInput)).toBeTrue();
    expect(service.isSensitiveElement(sensitiveDiv)).toBeTrue();
    expect(service.isSensitiveElement(excludedDiv)).toBeTrue();
    expect(service.isSensitiveElement(normalDiv)).toBeFalse();
    expect(service.isSensitiveElement(creditCardInput)).toBeTrue();
  });

  it('should calculate percentage correctly', () => {
    expect(service.getPercentage(25, 100)).toBe('25%');
    expect(service.getPercentage(0, 100)).toBe('0%');
    expect(service.getPercentage(100, 0)).toBe('0%');
  });

  it('should check if points are within radius', () => {
    expect(service.isWithinRadius(0, 0, 3, 4, 5)).toBeTrue();
    expect(service.isWithinRadius(0, 0, 3, 4, 4)).toBeFalse();
  });

  it('should detect device type correctly', () => {
    const iphoneUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1';
    const androidPhoneUA = 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36';
    const desktopUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    expect(service.detectDeviceType(iphoneUA)).toBe('iPhone');
    expect(service.detectDeviceType(androidPhoneUA)).toBe('Android Phone');
    expect(service.detectDeviceType(desktopUA)).toBe('Desktop');
  });

  it('should detect browser correctly', () => {
    const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    const firefoxUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
    const edgeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59';
    
    expect(service.detectBrowser(chromeUA)).toBe('Chrome');
    expect(service.detectBrowser(firefoxUA)).toBe('Firefox');
    expect(service.detectBrowser(edgeUA)).toBe('Edge');
  });

  it('should compress and decompress data', () => {
    const testData = { name: 'Test', value: 123, nested: { a: 1, b: 2 } };
    const compressed = service.compressData(testData);
    const decompressed = service.decompressData(compressed);
    
    expect(decompressed).toEqual(testData);
  });

  it('should limit array size', () => {
    const array = [1, 2, 3, 4, 5];
    expect(service.limitArraySize(array, 3)).toEqual([3, 4, 5]);
    expect(service.limitArraySize(array, 10)).toEqual(array);
  });

  it('should group array by key', () => {
    const array = [
      { type: 'A', value: 1 },
      { type: 'B', value: 2 },
      { type: 'A', value: 3 }
    ];
    
    const grouped = service.groupBy(array, 'type');
    expect(grouped['A'].length).toBe(2);
    expect(grouped['B'].length).toBe(1);
    expect(grouped['A'][0].value).toBe(1);
    expect(grouped['A'][1].value).toBe(3);
  });
});
