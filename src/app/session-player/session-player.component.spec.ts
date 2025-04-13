import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionPlayerComponent } from './session-player.component';

describe('SessionPlayerComponent', () => {
  let component: SessionPlayerComponent;
  let fixture: ComponentFixture<SessionPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionPlayerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
