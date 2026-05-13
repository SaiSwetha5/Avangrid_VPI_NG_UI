import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SplitButton } from 'primeng/splitbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { ApiCallsService } from 'services/api-calls.service';
import { DataService } from 'services/data.service';

interface UserMenuItem { label: string; command?: () => void; }

const ADMIN_OPCODES = ['RGE', 'NYSEG', 'CMP'];

@Component({
  selector: 'app-root',
  imports: [ButtonModule, CommonModule, DialogModule, MenuModule, ProgressSpinnerModule, RouterModule, RouterOutlet, SplitButton, ToolbarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
})
export class AppComponent implements OnInit, OnDestroy {

  private readonly _destroying$ = new Subject<void>();
  private readonly _sanitizer = inject(DomSanitizer);
  public _dataService = inject(DataService);
  public apiService = inject(ApiCallsService);
  public msalBroadcastService = inject(MsalBroadcastService);
  public msalService = inject(MsalService);
  public router = inject(Router);

  public currentUrl = '';
  public items: MenuItem[] | undefined;
  public loadingOpcodes = false;
  public noAuthVisible = false;
  public outlookComposeUrl: SafeUrl = '';
  public title = 'VPI Record System';
  public userMenu: UserMenuItem[] = [];

  public ngOnInit() {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const previous = this._dataService.currentUrl();
        const next = e.urlAfterRedirects.split('?')[0];
        if (previous?.startsWith('/vpi') && !next.startsWith('/vpi')) {
          this._dataService.drawerFormState.set(undefined);
        }
        this._dataService.currentUrl.set(next);
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.updateUserMenu();
        this.checkAndLoadData();
      });

    this.initMenus();

  }

  private checkAndLoadData() {

    const account = this.msalService.instance.getActiveAccount()
      ?? this.msalService.instance.getAllAccounts()[0];
    if (account) {
      this.loadOpcodes();
    }
  }

  public updateUserMenu(): void {
    const account = this.msalService.instance.getActiveAccount()
      ?? this.msalService.instance.getAllAccounts()[0];

    if (account) {
      const username = account.name ?? account.username ?? 'User';
      const userEmail = '_LD_ACD-IVR@avangrid.com';

      const body = encodeURIComponent('Hello Team,\n\nI need support with...');
      const subject = encodeURIComponent('Support Request');

      const url = `mailto:${userEmail}?subject=${subject}&body=${body}`;

      this.outlookComposeUrl = this._sanitizer.bypassSecurityTrustUrl(url);
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

  private loadOpcodes(): void {
    if (this._dataService.opcodesSignal().length > 0) {
      return;
    }

    const cachedOpcodes = sessionStorage.getItem('VPI_OPCODES');
    if (cachedOpcodes) {
      const parsedData = JSON.parse(cachedOpcodes);
      this._dataService.opcodesSignal.set(parsedData);
      this._dataService.isOpcodeAvailable.set(true);
      return;
    }
    this.loadingOpcodes = true;
    this.apiService.getOPCODES().subscribe({
      next: (opcos) => {
        this.loadingOpcodes = false;
        if (opcos.length === 0) {
          this._dataService.isOpcodeAvailable.set(false);
          return;
        }

        const mapped = opcos.includes('ADMIN')
          ? ADMIN_OPCODES.map(code => ({ name: code, code }))
          : opcos.filter(c => c !== 'ADMIN').map(code => ({ name: code, code }));

        this._dataService.isOpcodeAvailable.set(true);
        this._dataService.opcodesSignal.set(mapped);
        sessionStorage.setItem('VPI_OPCODES', JSON.stringify(mapped));
        const current = this._dataService.getPayload();
        const opcoIsInvalid = current?.opco && !mapped.find(o => o.code === current.opco);
        if (opcoIsInvalid) {
          this._dataService.resetPayload();
        }
      },
      error: (err) => {
        this.loadingOpcodes = false;

        this._dataService.isOpcodeAvailable.set(false);
        console.error('Failed to load opcodes', err);
      }
    });
  }
  private initMenus() {
    this.items = [
      {
        label: '<img src="assets/vpi.png" alt="VPI"> VPI',
        command: () => {
          this._dataService.payload.set(undefined);
          this._dataService.pagedDataSignal.set([]);
          const opcodes = this._dataService.opcodesSignal();

          if (!opcodes || opcodes.length === 0) {
            this.noAuthVisible = true;
          } else {
            this.router.navigate(['/vpi']);
          }
        }
      },
      {
        label: '<img src="assets/genesys.png" alt="Genesys"> GENESYS'
      },
      {
        label: '<img src="assets/nice.png" alt="Nice"> NICE',
      },
    ];

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this._destroying$)
    ).subscribe(event => {
      this.currentUrl = event.urlAfterRedirects;
    });
  }



  public logout(): void {
    sessionStorage.clear();
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
    this.router.navigate(['/vpi']);
  }
}