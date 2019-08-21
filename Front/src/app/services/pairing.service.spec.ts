import { TestBed } from '@angular/core/testing';

import { PairingService } from './pairing.service';

describe('PairingService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PairingService = TestBed.get(PairingService);
    expect(service).toBeTruthy();
  });
});
