import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { InteractionType } from '@azure/msal-browser';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideAnimations } from '@angular/platform-browser/animations';

import { msalProviders } from './msal.config';
import { routes } from './app.routes';

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
import { HttpErrorInterceptor } from 'interceptors/http-error.interceptor';
import { environment } from 'environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },

    ...msalProviders,
    {
      provide: MSAL_GUARD_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        authRequest: {
          scopes: ['User.Read', environment.accessScope]
        }
      } as MsalGuardConfiguration
    },

    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          [environment.graphApiUrl, ['User.Read']],
          [environment.apiBaseUrl , [environment.accessScope]]
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
