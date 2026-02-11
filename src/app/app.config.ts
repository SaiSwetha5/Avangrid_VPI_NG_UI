import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { msalProviders } from './msal.config';
import { InteractionType } from '@azure/msal-browser';

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
        interactionType: InteractionType.Redirect,
        authRequest: {
          scopes: ['User.Read', 'api://d6acffb4-c10c-41d1-9209-247df35d7e6d/access']
        }
      } as MsalGuardConfiguration
    },

    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          ['https://graph.microsoft.com/v1.0', ['User.Read']],
          ['https://spring-boot-v1-final.onrender.com', ['api://d6acffb4-c10c-41d1-9209-247df35d7e6d/access']]
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
