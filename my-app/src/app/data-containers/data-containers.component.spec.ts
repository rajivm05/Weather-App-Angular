import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataContainersComponent } from './data-containers.component';

describe('DataContainersComponent', () => {
  let component: DataContainersComponent;
  let fixture: ComponentFixture<DataContainersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataContainersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DataContainersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
