import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameQuittedComponent } from './game-quitted.component';

describe('GameQuittedComponent', () => {
  let component: GameQuittedComponent;
  let fixture: ComponentFixture<GameQuittedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameQuittedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameQuittedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
