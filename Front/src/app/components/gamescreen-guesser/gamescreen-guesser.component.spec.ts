import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GamescreenGuesserComponent } from './gamescreen-guesser.component';

describe('GamescreenGuesserComponent', () => {
  let component: GamescreenGuesserComponent;
  let fixture: ComponentFixture<GamescreenGuesserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GamescreenGuesserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GamescreenGuesserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
