import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultsTabComponent } from './results-tab.component';

describe('ResultsTabComponent', () => {
  let component: ResultsTabComponent;
  let fixture: ComponentFixture<ResultsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
