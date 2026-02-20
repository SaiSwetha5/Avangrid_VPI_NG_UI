import { PublicClientApplication } from '@azure/msal-browser';
import { MSAL_INSTANCE } from '@azure/msal-angular';
import { environment } from '../environments/environment';

// 1. Create a factory function to ensure environment variables are ready
export function MSALInstanceFactory(): PublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msal.clientId, // Now safely reads from env.js
      authority: `https://login.microsoftonline.com/${environment.msal.tenantId}`,
      redirectUri: typeof window !== 'undefined' ? window.location.origin : '/',
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true,
    }
  });
}

// 2. Export the provider using useFactory instead of useValue
export const msalProviders = [
  {
    provide: MSAL_INSTANCE,
    useFactory: MSALInstanceFactory
  }
];
 