import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { NavigationEnd, RouterModule, RouterOutlet, Router } from '@angular/router';
import { SplitButton } from 'primeng/splitbutton';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu'
import { MsalService } from '@azure/msal-angular';
import { DataService } from 'services/data.service';

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
export class AppComponent implements OnInit {
  public title = "Avangrid VPI GUI";
  public msalService = inject(MsalService);
  public router = inject(Router);
  public _dataService = inject(DataService);
  
  public items: MenuItem[] | undefined;
  public opCodes: OPCODES[] | undefined;
  public container: OPCODES[] | undefined;
  public currentUrl = '';
  public userMenu: UserMenuItem[] = [];

  ngOnInit(): void {
    // Call the async initialization without making ngOnInit async
    this.initMsal();

    this.opCodes = [
      { name: 'RGE', code: 'RGE' },
      { name: 'NYSEG', code: 'NYSEG' },
      { name: 'CMP', code: 'CMP' },
    ];

    this.container = [
      { name: 'VPI', code: 'VPI' },
      { name: 'GENESYS', code: 'GENESYS' },
      { name: 'NICE', code: 'NICE' },
    ];

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
      }
    });

    this.items = [
      {
        label: '<img src="assets/vpi.png" alt="VPI"> VPI',
        command: () => {
          this.router.navigate(['/vpi']);
          this._dataService.pagedDataSignal.set([]);
        }
      },
      { label: '<img src="assets/genesys.png" alt="Genesys"> GENESYS' },
      { label: '<img src="assets/nice.png" alt="Nice"> NICE' },
    ];
  }

private async initMsal(): Promise<void> {
  console.log("DEBUG: MSAL Start");
  try {
    // If it hangs here, the clientId or tenantId is rejected by MSAL
    await this.msalService.instance.initialize();
    console.log("DEBUG: MSAL Initialized");

    const result = await this.msalService.instance.handleRedirectPromise();
    console.log("DEBUG: Redirect Result:", result);

    const accounts = this.msalService.instance.getAllAccounts();
    if (accounts.length > 0) {
      this.msalService.instance.setActiveAccount(accounts[0]);
      console.log("DEBUG: Account active:", accounts[0].username);
    } else {
      console.log("DEBUG: No account found, calling loginRedirect");
      this.msalService.loginRedirect();
    }
    this.updateUserMenu();
  } catch (error) {
    console.error("DEBUG: MSAL Error", error);
  }
}

  public navigateHomePage(): void {
    this._dataService.setPayload({});
    this.router.navigate(['/home']);
  }

  public navigateVPIPage(): void {
    this._dataService.setPayload({});
    this.router.navigate(['/vpi']);
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
}