import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventTrackerService } from '../../tracking/services/event-tracker.service';
import { BaseTestPage } from '../base-test-page';

@Component({
  selector: 'app-click-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-page">
      <h2>Teste de Eventos de Clique</h2>
      
      <div class="test-area">
        <div class="click-area" (click)="trackClick($event)">
          Clique aqui (clicado: {{ clickCount }} vezes)
        </div>
      </div>
      
      <div class="instructions">
        <h3>Instruções:</h3>
        <p>Clique repetidamente na área acima para gerar eventos de clique.</p>
        <p>Os cliques estão sendo capturados pelo rastreador de eventos.</p>
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
      margin-bottom: 30px;
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
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .click-area:hover {
      background-color: #e0e0e0;
    }
    
    .click-area:active {
      background-color: #d0d0d0;
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
    
    .back-button:hover {
      background-color: #0069d9;
    }
  `]
})
export class ClickTestComponent extends BaseTestPage {
  clickCount = 0;
  
  constructor(
    router: Router,
    private eventTracker: EventTrackerService
  ) {
    super(router);
  }
  
  trackClick(event: MouseEvent): void {
    this.clickCount++;
    console.log('Clique detectado:', { x: event.clientX, y: event.clientY });
  }
} 