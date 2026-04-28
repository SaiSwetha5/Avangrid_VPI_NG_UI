import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VpiSliderComponent } from './vpi-slider.component';

describe('VpiSliderComponent', () => {
  let component: VpiSliderComponent;
  let fixture: ComponentFixture<VpiSliderComponent>;
  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [VpiSliderComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VpiSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create VPI Slider Component', () => {
    expect(component).toBeTruthy();
  });

  it('should reset form and initialize date values when openDrawerFunction is called', () => {
    component.openDrawerFunction();
    expect(component.fromDate).toBeInstanceOf(Date);
    expect(component.toDate).toBeInstanceOf(Date);

  });


  it('should reset all errors when no dates are provided', () => {
    component.toDate = new Date();
    component.fromDate = new Date();
    component.validateToDate();
    expect(component.toDateError).toBeFalse();
    expect(component.fromDateError).toBeFalse();
    expect(component.dateRangeError).toBeFalse();
  });

  it('should not set any errors when dates are valid (past or today)', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    component.fromDate = yesterday;
    component.toDate = today;

    component.validateToDate();

    expect(component.toDateError).toBeFalse();
    expect(component.fromDateError).toBeFalse();
    expect(component.dateRangeError).toBeFalse();
  });
});