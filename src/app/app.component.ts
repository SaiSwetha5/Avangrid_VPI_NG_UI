import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { NavigationEnd, RouterModule, RouterOutlet, Router } from '@angular/router';
import { SplitButton } from 'primeng/splitbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular'; 
import { InteractionStatus, EventMessage, EventType, AuthenticationResult } from '@azure/msal-browser';
import { DataService } from 'services/data.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface OPCODES { name: string; code: string; }
interface UserMenuItem { label: string; command?: () => void; }

@Component({
  selector: 'app-root',
  imports: [SplitButton, MenuModule, RouterModule, RouterOutlet, ToolbarModule, CommonModule, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly _destroying$ = new Subject<void>();
  public msalService = inject(MsalService);
  public msalBroadcastService = inject(MsalBroadcastService); 
  public router = inject(Router);
  public _dataService = inject(DataService);

  public title = "Avangrid VPI GUI";
  public items: MenuItem[] | undefined;
  public opCodes: OPCODES[] | undefined;
  public currentUrl = '';
  public userMenu: UserMenuItem[] = [];

  ngOnInit() {
    this.msalService.instance.handleRedirectPromise().then((result) => {
      if (result) {
        this.msalService.instance.setActiveAccount(result.account);
      }
      this.updateUserMenu();
    }).catch(err => {
      console.error('MSAL Redirect Error:', err);
    });

    this.msalBroadcastService.msalSubject$
      .pipe(
        filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
        takeUntil(this._destroying$)
      )
      .subscribe((result: EventMessage) => {
        const payload = result.payload as AuthenticationResult;
        this.msalService.instance.setActiveAccount(payload.account);
        this.updateUserMenu();
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.updateUserMenu();
      });

    this.initMenus();
  }

  private initMenus() {
    this.opCodes = [{ name: 'RGE', code: 'RGE' }, { name: 'NYSEG', code: 'NYSEG' }, { name: 'CMP', code: 'CMP' }];
    this.items = [
          {
            label: '<img src="assets/vpi.png" alt="VPI"  > VPI',
            command: () => {
              this._dataService.payload.set(undefined);
              this._dataService.pagedDataSignal.set([]);
              this.router.navigate(['/vpi']);

            }
          },
          {
            label: '<img src="assets/genesys.png" alt="Genesys" > GENESYS'

          },
          {
            label: '<img src="assets/nice.png" alt="Nice"  > NICE',
          },
        ];

   this.router.events.pipe(
     filter((event): event is NavigationEnd => event instanceof NavigationEnd),
     takeUntil(this._destroying$)
   ).subscribe(event => {
     this.currentUrl = event.urlAfterRedirects;
   });
}

public updateUserMenu(): void {
  const account = this.msalService.instance.getActiveAccount() 
               ?? this.msalService.instance.getAllAccounts()[0];

  if (account) {
    const username = account.name ?? account.username ?? 'User';
    this.userMenu = [
      { label: username },
      { label: 'Logout', command: () => this.logout() }
    ];
  } else {
    this.userMenu = [
      { label: 'Sign In', command: () => this.msalService.loginRedirect() }
    ];
  }
}

 
  public logout(): void {
   const activeAccount = this.msalService.instance.getActiveAccount();

  if (activeAccount) {
    this.msalService.logoutRedirect({
       account: activeAccount, 
       postLogoutRedirectUri: globalThis.location.origin
    });
  } else {
     const allAccounts = this.msalService.instance.getAllAccounts();
    if (allAccounts.length > 0) {
      this.msalService.logoutRedirect({
        account: allAccounts[0],
        postLogoutRedirectUri: globalThis.location.origin
      });
    } else {
      this.msalService.logoutRedirect();
    }
  }
}

 public ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }

  public navigateHomePage(): void {
    this.router.navigate(['/home']);
  }

  public navigateVPIPage(): void {
    this._dataService.payload.set(undefined);
    this.router.navigate(['/vpi']);
  }
}