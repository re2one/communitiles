import { TestBed } from '@angular/core/testing';

import { OnlinesocketService } from './onlinesocket.service';

describe('OnlinesocketService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OnlinesocketService = TestBed.get(OnlinesocketService);
    expect(service).toBeTruthy();
  });
});
