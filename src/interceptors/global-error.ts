import { ErrorHandler, inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorService } from 'services/error.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);

   handleError(error: any): void {
    const router = this.injector.get(Router);
    const errorService = this.injector.get(ErrorService);
    const message = error.message || error.toString();
    
    const apiError = {
      timestamp: new Date().toISOString(),
      status: error.status || 0,
      error: error.name || 'Application Error',
      message: message
    };

     errorService.set(apiError);

     if (!router.url.startsWith('/error')) {
      router.navigateByUrl('/error');
    }

    console.error('Global Handler Caught:', error);
  }
}