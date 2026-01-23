
import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MsalService } from '@azure/msal-angular';

describe('AppComponent', () => {
  let msalServiceSpy: jasmine.SpyObj<MsalService>;

  beforeEach(async () => {
    const instanceSpy = jasmine.createSpyObj('GetActiveAccounts', [
      'getActiveAccount',
      'getAllAccounts',
    ]);

    instanceSpy.getActiveAccount.and.returnValue(null);
    instanceSpy.getAllAccounts.and.returnValue([]);
    msalServiceSpy = jasmine.createSpyObj('MsalService', [], { instance: instanceSpy });
    await TestBed.configureTestingModule({
      providers: [{ provide: MsalService, useValue: msalServiceSpy }]
    }).compileComponents();
  });

  it(`should have the 'Avangrid VPI GUI' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Avangrid VPI GUI');
  });

  it('should get the all accounts on init', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(msalServiceSpy.instance.getAllAccounts).toHaveBeenCalled();
  });
});
