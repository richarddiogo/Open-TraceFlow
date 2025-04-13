import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BaseTestPage } from '../base-test-page';

@Component({
  selector: 'app-form-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-page">
      <h2>Teste de Rastreamento de Formulários</h2>
      
      <div class="form-container">
        <div class="form-group">
          <label for="username">Nome de usuário:</label>
          <input type="text" id="username" name="username" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="password">Senha (campo sensível):</label>
          <input type="password" id="password" name="password" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="credit-card">Cartão de crédito (campo sensível):</label>
          <input type="text" id="credit-card" name="credit-card" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="comments">Comentários:</label>
          <textarea id="comments" name="comments" class="form-control"></textarea>
        </div>
        
        <div class="form-group">
          <button type="button" class="submit-button">Enviar</button>
        </div>
      </div>
      
      <div class="instructions">
        <h3>Instruções:</h3>
        <p>Preencha os campos do formulário para testar o rastreamento de entradas.</p>
        <p>Os campos marcados como sensíveis não devem ter seus valores capturados.</p>
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
    
    .form-container {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    
    textarea.form-control {
      height: 100px;
      resize: vertical;
    }
    
    .submit-button {
      padding: 10px 20px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
    
    .submit-button:hover {
      background-color: #218838;
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
export class FormTestComponent extends BaseTestPage {
  constructor(router: Router) {
    super(router);
  }
} 