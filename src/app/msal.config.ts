import { PublicClientApplication } from '@azure/msal-browser';
import { MSAL_INSTANCE } from '@azure/msal-angular';

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: 'ab5a57ac-0579-427c-a3ef-7a4e1b2b8677',
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
