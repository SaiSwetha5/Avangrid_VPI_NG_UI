import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { NavigationEnd, RouterModule, RouterOutlet, Router } from '@angular/router';
import { SplitButton } from 'primeng/splitbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { DataService } from 'services/data.service';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

interface OPCODES {
  name: string;
  code: string;
}

interface UserMenuItem {
  label: string;
  command?: () => void;
}

@Component({
  selector: 'app-root',
  imports: [SplitButton, MenuModule, RouterModule, RouterOutlet, ToolbarModule, SelectModule, CommonModule, ButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  providers: [MessageService],
  standalone: true,
})
export class AppComponent implements OnInit, OnDestroy {
  public title = "Avangrid VPI GUI";
  public msalService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);
  public router = inject(Router);
  public _dataService = inject(DataService);
  
  private readonly _destroying$ = new Subject<void>();
  public loginFinished = false; // Used in HTML to hide UI until ready
  public items: MenuItem[] | undefined;
  public opCodes: OPCODES[] | undefined;
  public container: OPCODES[] | undefined;
  public currentUrl = '';
  public userMenu: UserMenuItem[] = [];

  ngOnInit(): void {
    // 1. Monitor MSAL status to see when interaction (login) is finished
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        this.checkAccount();
        this.loginFinished = true; // Safe to show the app now
      });

    this.initMsal();

    // ... Rest of your opCodes, container, and router events logic ...
    this.opCodes = [{ name: 'RGE', code: 'RGE' }, { name: 'NYSEG', code: 'NYSEG' }, { name: 'CMP', code: 'CMP' }];
    this.container = [{ name: 'VPI', code: 'VPI' }, { name: 'GENESYS', code: 'GENESYS' }, { name: 'NICE', code: 'NICE' }];
    
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    });

    this.items = [
      { label: 'VPI', command: () => { this.router.navigate(['/vpi']); this._dataService.pagedDataSignal.set([]); } },
      { label: 'GENESYS' },
      { label: 'NICE' }
    ];
  }

  private async initMsal(): Promise<void> {
    try {
      // Required for MSAL v3+
      await this.msalService.instance.initialize();
      
      // Process result if returning from a redirect
      await this.msalService.instance.handleRedirectPromise();
      
      this.checkAccount();
    } catch (error) {
      console.error("MSAL Initialization Error:", error);
    }
  }

  private checkAccount() {
    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.msalService.instance.setActiveAccount(accounts[0]);
      this.updateUserMenu();
    }
    // REMOVED manual loginRedirect() call to avoid conflict with MsalGuard
  }

  public updateUserMenu(): void {
    const account = this.msalService.instance.getActiveAccount(); 
    const username = account?.name || account?.username || 'Guest';
    this.userMenu = [
      { label: username },
      { label: 'Logout', command: () => this.logout() }
    ];
  }

  public logout(): void {
     this.msalService.logoutRedirect();
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}