import { Component, HostListener, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { NavigationEnd, RouterModule,RouterOutlet,Router } from '@angular/router';
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
  
  //  @Input() activate?: (e: KeyboardEvent) => void;
  public title = "Avangrid VPI GUI";
  public msalService = inject(MsalService);
  public router = inject(Router);
  public _dataService = inject(DataService);
  public items: MenuItem[] | undefined;
  public opCodes: OPCODES[] | undefined;
  public container: OPCODES[] | undefined;
  public pageNumber = 1;
  public fromDate: Date | null = null;
  public toDate: Date | null = null;
  public currentUrl = '';
  public userMenu: UserMenuItem[] = [];
  public opCode: { name: string; code: string } | null = null;

  public ngOnInit() {
    this.msalService.instance.handleRedirectPromise().then((result) => {
      if (result !== null && result.account !== null) {

        this.msalService.instance.setActiveAccount(result.account);
      } else {
        const currentAccounts = this.msalService.instance.getAllAccounts();
        if (currentAccounts.length > 0) {
          this.msalService.instance.setActiveAccount(currentAccounts[0]);
        }
      }

      this.updateUserMenu();
    }); 
    
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
        label: '<img src="assets/vpi.png" alt="VPI"  > VPI',
        command: () => {
          this.router.navigate(['/vpi']);
          this._dataService.pagedDataSignal.set([]);

        }
      },
      {
        label: '<img src="assets/genesys.png" alt="Genesys" > GENESYS'

      },
      {
        label: '<img src="assets/nice.png" alt="Nice"  > NICE',
      },
    ];
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


  
  // @HostListener('keydown.enter', ['$event'])
  // @HostListener('keydown.space', ['$event'])
  // onKeydown(e: KeyboardEvent) {
  //    e.preventDefault();
  //   this.activate?.(e);
  // }


}
