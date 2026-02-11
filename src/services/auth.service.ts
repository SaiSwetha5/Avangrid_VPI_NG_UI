import { inject, Injectable } from "@angular/core";
import { MsalService } from "@azure/msal-angular";
import { from, map, Observable, throwError } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly scope = 'api://d6acffb4-c10c-41d1-9209-247df35d7e6d/access';
  private msalService = inject(MsalService);


getAccessToken(): Observable<string> {
  const account = this.msalService.instance.getActiveAccount();
 
  if (!account) {
    return throwError(() => new Error('No active account set'));
  }

  return from(
    this.msalService.instance.acquireTokenSilent({
      scopes: [this.scope],
      account
    }).catch(() => {
       return this.msalService.instance.acquireTokenPopup({
        scopes: [this.scope],
        account
      });
    })
  ).pipe(
    map(result => result.accessToken)
  );
}

}
