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
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withFetch(), // Keep withFetch for Angular 19 performance
      withInterceptorsFromDi()
    ),

    // 1. REGISTER MSAL INTERCEPTOR CORRECTLY
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    // 2. REGISTER YOUR ERROR INTERCEPTOR
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: HttpErrorInterceptor, 
      multi: true 
    },

    ...msalProviders, // Provides MSAL_INSTANCE

    {
      provide: MSAL_GUARD_CONFIG,
      useValue: {
        interactionType: InteractionType.Redirect,
        authRequest: {
          // Uses dynamic scopes from your Vercel env
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
          [environment.apiBaseUrl, [environment.accessScope]]
        ])
      } as MsalInterceptorConfiguration
    },

    // Required MSAL Services
    MsalService,
    MsalGuard,
    MsalBroadcastService,

    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
  ]
};