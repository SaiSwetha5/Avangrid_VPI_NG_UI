import { inject, Injectable } from "@angular/core";
import { MsalService } from "@azure/msal-angular";
import { from, map, Observable, throwError } from "rxjs";

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly scope = 'api://23007d1f-aba6-4e26-9b91-1ea8cc9a8d40/access_as_user';
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
