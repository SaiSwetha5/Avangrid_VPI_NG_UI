import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

class MockMsalService {
  instance = {
    handleRedirectPromise: () => Promise.resolve(null),
    getActiveAccount: () => ({ username: 'mockUser' }),
    getAllAccounts: () => [],
    addEventCallback: jasmine.createSpy('addEventCallback').and.returnValue(null)
  };
  loginRedirect = () => of(null);
  loginPopup = () => of(null);
  logout = () => of(null);
}

class MockMsalBroadcastService {
  inProgress$ = of('none');
  msalSubject$ = of({ eventType: 'initializeStart' });
}

describe('AppComponent', () => {
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MsalService, useClass: MockMsalService },
        { provide: MsalBroadcastService, useClass: MockMsalBroadcastService }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
