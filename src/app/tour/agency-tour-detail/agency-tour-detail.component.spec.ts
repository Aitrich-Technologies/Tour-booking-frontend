import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgencyTourDetailComponent } from './agency-tour-detail.component';

describe('AgencyTourDetailComponent', () => {
  let component: AgencyTourDetailComponent;
  let fixture: ComponentFixture<AgencyTourDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgencyTourDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgencyTourDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
