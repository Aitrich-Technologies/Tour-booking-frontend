import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyBookingsComponent } from './agency-bookings.component';

describe('AgencyBookingsComponent', () => {
  let component: AgencyBookingsComponent;
  let fixture: ComponentFixture<AgencyBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgencyBookingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgencyBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
