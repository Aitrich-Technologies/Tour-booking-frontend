import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourCatalogComponent } from './tour-catalog.component';

describe('TourCatalogComponent', () => {
  let component: TourCatalogComponent;
  let fixture: ComponentFixture<TourCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TourCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
