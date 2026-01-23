import { TestBed } from '@angular/core/testing';
import { VpiDashboardComponent } from './vpi-dashboard.component';

describe('VpiDashboardComponent', () => {
  let component: VpiDashboardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [VpiDashboardComponent]
    });
    const fixture = TestBed.createComponent(VpiDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create the VpiDashboardComponent', () => {
    expect(component).toBeTruthy();
  });
});
