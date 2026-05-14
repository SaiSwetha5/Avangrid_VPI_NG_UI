import { Component, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { ButtonModule } from 'primeng/button';
 
@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent {
  private readonly  msalService = inject(MsalService);
 
  public onLogin(): void {
    this.msalService.loginRedirect({
      scopes: [],
      redirectUri: globalThis.location.origin + '/home'
    });
  }
}