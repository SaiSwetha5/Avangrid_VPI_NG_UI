import { PublicClientApplication } from '@azure/msal-browser';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { environment } from 'environments/environment';
 
 
export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: environment.msal.clientId,
    authority: `https://login.microsoftonline.com/${environment.msal.tenantId}`,
    redirectUri:  globalThis.location.origin,
    postLogoutRedirectUri: globalThis.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false}
});

export const msalProviders = [
  {
    provide: MSAL_INSTANCE,
    useValue: msalInstance
  }
];
