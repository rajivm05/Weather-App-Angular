import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteTabComponent } from './favorite-tab.component';

describe('FavoriteTabComponent', () => {
  let component: FavoriteTabComponent;
  let fixture: ComponentFixture<FavoriteTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoriteTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
