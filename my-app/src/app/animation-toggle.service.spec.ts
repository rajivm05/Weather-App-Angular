import { TestBed } from '@angular/core/testing';

import { AnimationToggleService } from './animation-toggle.service';

describe('AnimationToggleService', () => {
  let service: AnimationToggleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimationToggleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
