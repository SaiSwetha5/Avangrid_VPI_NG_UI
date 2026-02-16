import { PublicClientApplication } from '@azure/msal-browser';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { environment } from 'environments/environment';

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: environment.msal.clientId,
    authority: environment.msal.authority,
     redirectUri:  `${window.location.origin}/auth-callback`,
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  }
});

export const msalProviders = [
  {
    provide: MSAL_INSTANCE,
    useValue: msalInstance
  }
];
