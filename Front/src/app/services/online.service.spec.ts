import { TestBed } from '@angular/core/testing';

import { OnlineService } from './online.service';

describe('OnlineService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OnlineService = TestBed.get(OnlineService);
    expect(service).toBeTruthy();
  });
});
