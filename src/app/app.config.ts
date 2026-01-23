import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { msalProviders } from './msal.config';

import {
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalGuard,
  MsalService,
  MsalInterceptor,
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
  MsalBroadcastService
} from '@azure/msal-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    ...msalProviders,
    {
      provide: MSAL_GUARD_CONFIG,
      useValue: {
        interactionType: 'redirect',
        authRequest: {
          scopes: ['User.read', 'api://23007d1f-aba6-4e26-9b91-1ea8cc9a8d40/access_as_user']
        }
      } as MsalGuardConfiguration
    },

    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: {
        interactionType: 'redirect',
        protectedResourceMap: new Map([
          ['https://graph.microsoft.com/v1.0', ['User.read']],
          ['https://avangrid-springboot.onrender.com', ['api://23007d1f-aba6-4e26-9b91-1ea8cc9a8d40/access_as_user']]
        ])

      } as MsalInterceptorConfiguration
    },


    MsalService,
    MsalGuard,
    MsalInterceptor,
    MsalBroadcastService,

    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),

    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(routes),

  ]
};
