import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VpiSliderComponent } from './vpi-slider.component';
import { NgForm } from '@angular/forms';

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
    const mockForm = {
      resetForm: jasmine.createSpy('resetForm')
    } as unknown as NgForm;
    component.openDrawerFunction(mockForm);
    expect(mockForm.resetForm).toHaveBeenCalled();
    expect(component.fromDate).toEqual(jasmine.any(Date));
    expect(component.toDate).toEqual(jasmine.any(Date));
    expect(component.openDrawer).toBeTrue();
    expect(component.toDateError).toBeFalse();
    expect(component.fromDateError).toBeFalse();
    expect(component.dateRangeError).toBeFalse();
  });


  it('should reset all errors when no dates are provided', () => {
    component.toDate = new Date();
    component.fromDate = new Date();
    component.validateToDate();
    expect(component.toDateError).toBeFalse();
    expect(component.fromDateError).toBeFalse();
    expect(component.dateRangeError).toBeFalse();
  });


  it('should set toDateError true when toDate is in the future', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    component.toDate = futureDate;
    component.validateToDate();
    expect(component.toDateError).toBeTrue();
    expect(component.fromDateError).toBeFalse();
    expect(component.dateRangeError).toBeFalse();
  });



  it('should set dateRangeError true when fromDate > toDate', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    component.fromDate = today;
    component.toDate = yesterday;

    component.validateToDate();

    expect(component.dateRangeError).toBeTrue();
    expect(component.toDateError).toBeFalse();
    expect(component.fromDateError).toBeFalse();
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
