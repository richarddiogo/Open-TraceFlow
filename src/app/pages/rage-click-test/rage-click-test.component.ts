import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RageClickDetectorService } from '../../tracking/services/rage-click-detector.service';
import { BaseTestPage } from '../base-test-page';

@Component({
  selector: 'app-rage-click-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-page">
      <h2>Teste de Rage Clicks</h2>
      
      <div class="test-area">
        <div class="click-area" (click)="trackClick($event)">
          Clique aqui rápido e repetidamente!
        </div>
      </div>
      
      <div class="status-area" [class.rage-detected]="rageDetected">
        {{ rageDetected ? 'RAGE CLICK DETECTADO!' : 'Aguardando rage clicks...' }}
      </div>
      
      <div class="instructions">
        <h3>Instruções:</h3>
        <p>Clique várias vezes rapidamente na mesma área para simular um "rage click".</p>
        <p>Um rage click é detectado quando você clica 3+ vezes rapidamente na mesma área.</p>
      </div>
      
      <button class="back-button" (click)="navigateBack()">Voltar</button>
    </div>
  `,
  styles: [`
    .test-page {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    
    h2 {
      text-align: center;
      margin-bottom: 30px;
    }
    
    .test-area {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }
    
    .click-area {
      width: 300px;
      height: 150px;
      background-color: #f0f0f0;
      border: 2px solid #ddd;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      text-align: center;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .click-area:hover {
      background-color: #e0e0e0;
    }
    
    .status-area {
      text-align: center;
      padding: 15px;
      margin: 20px 0;
      background-color: #f8f9fa;
      border-radius: 4px;
      font-size: 18px;
      font-weight: bold;
      transition: all 0.3s;
    }
    
    .rage-detected {
      background-color: #dc3545;
      color: white;
      animation: pulse 0.5s infinite alternate;
    }
    
    @keyframes pulse {
      from { opacity: 0.8; }
      to { opacity: 1; }
    }
    
    .instructions {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    
    .back-button {
      display: block;
      margin: 0 auto;
      padding: 10px 20px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
  `]
})
export class RageClickTestComponent extends BaseTestPage {
  rageDetected = false;
  
  constructor(
    router: Router,
    private rageClickDetector: RageClickDetectorService
  ) {
    super(router);
  }
  
  override ngOnInit(): void {
    super.ngOnInit();
    
    // Habilita o detector de rage clicks
    this.rageClickDetector.enable();
    
    // Assina eventos de rage click
    this.subscriptions.push(
      this.rageClickDetector.getRageClicks().subscribe(event => {
        console.log('Rage click detectado:', event);
        this.rageDetected = true;
        
        // Reseta a flag após alguns segundos
        setTimeout(() => {
          this.rageDetected = false;
        }, 2000);
      })
    );
  }
  
  trackClick(event: MouseEvent): void {
    // O próprio EventTrackerService vai capturar o clique
    // O RageClickDetectorService vai processar se ele for um rage click
    const target = event.target as HTMLElement;
    this.rageClickDetector.processClick(target, event.clientX, event.clientY);
  }
  
  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.rageClickDetector.disable();
  }
} 