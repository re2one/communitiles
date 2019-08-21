import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GamescreenRecommenderComponent } from './gamescreen-recommender.component';

describe('GamescreenRecommenderComponent', () => {
  let component: GamescreenRecommenderComponent;
  let fixture: ComponentFixture<GamescreenRecommenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GamescreenRecommenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GamescreenRecommenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
