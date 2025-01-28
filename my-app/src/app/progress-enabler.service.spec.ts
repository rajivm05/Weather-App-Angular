import { TestBed } from '@angular/core/testing';

import { ProgressEnablerService } from './progress-enabler.service';

describe('ProgressEnablerService', () => {
  let service: ProgressEnablerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProgressEnablerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
