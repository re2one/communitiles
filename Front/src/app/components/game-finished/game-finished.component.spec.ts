import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameFinishedComponent } from './game-finished.component';

describe('GameFinishedComponent', () => {
  let component: GameFinishedComponent;
  let fixture: ComponentFixture<GameFinishedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameFinishedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameFinishedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
