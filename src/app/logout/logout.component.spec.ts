import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoutComponent } from './logout.component';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { of } from 'rxjs';

class MockMsalService {
  instance = {
    handleRedirectPromise: () => Promise.resolve(null),
    getActiveAccount: () => null,
    getAllAccounts: () => [],
    setActiveAccount: () => {}
  };
  loginRedirect = () => of(null);
  logoutRedirect = () => of(null);
}

class MockMsalBroadcastService {
  inProgress$ = of('none');
}

describe('LogoutComponent', () => {
  let component: LogoutComponent;
  let fixture: ComponentFixture<LogoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoutComponent],
      providers: [
        { provide: MsalService, useClass: MockMsalService },
        { provide: MsalBroadcastService, useClass: MockMsalBroadcastService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
