import { PublicClientApplication } from '@azure/msal-browser';
import { MSAL_INSTANCE } from '@azure/msal-angular';

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: '23007d1f-aba6-4e26-9b91-1ea8cc9a8d40',
    authority: 'https://login.microsoftonline.com/aeea9a9c-cd86-4e5c-a3e4-db2be94c0c08',
    redirectUri: 'http://localhost:4200',  
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
