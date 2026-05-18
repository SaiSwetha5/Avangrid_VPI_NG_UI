import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

class MockMsalService {
  instance = {
    handleRedirectPromise: () => Promise.resolve(null),
    getActiveAccount: (): { username: string } | null => ({ username: 'mockUser' }),
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

  let fixture: ComponentFixture<AppComponent>;
  let mockMsalService: MockMsalService;

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

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    mockMsalService = TestBed.inject(MsalService) as unknown as MockMsalService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should update user menu with active account', () => {
    component.updateUserMenu();
    expect(component.userMenu[0].label).toBe('mockUser');
    expect(component.userMenu.some(item => item.label === 'Logout')).toBeTrue();
  });

  it('should show Sign In menu if no account', () => {
    spyOn(mockMsalService.instance, 'getActiveAccount').and.returnValue(null);
    component.updateUserMenu();
    expect(component.userMenu[0].label).toBe('Sign In');
  });
});
