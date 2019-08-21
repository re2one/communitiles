import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameTimeoutComponent } from './game-timeout.component';

describe('GameTimeoutComponent', () => {
  let component: GameTimeoutComponent;
  let fixture: ComponentFixture<GameTimeoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameTimeoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameTimeoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
