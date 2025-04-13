import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Importando os serviços
import { EventTrackerService } from './services/event-tracker.service';
import { RageClickDetectorService } from './services/rage-click-detector.service';
import { SessionRecorderService } from './services/session-recorder.service';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    EventTrackerService,
    RageClickDetectorService,
    SessionRecorderService
  ]
})
export class TrackingModule {
  /**
   * Método estático para uso em AppModule
   * Permite inicializar o módulo de rastreamento com configurações padrão
   */
  static forRoot() {
    return {
      ngModule: TrackingModule,
      providers: [
        EventTrackerService,
        RageClickDetectorService,
        SessionRecorderService
      ]
    };
  }
}
