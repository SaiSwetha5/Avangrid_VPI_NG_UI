import { ErrorHandler, inject, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorService } from 'services/error.service';

interface AppError {
  message?: string;
  name?: string;
  status?: number;
  toString(): string;
}

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);

  handleError(error: unknown): void {
    const router = this.injector.get(Router);
    const errorService = this.injector.get(ErrorService);

    const appError = error as AppError;

    const message = appError.message ?? appError.toString();

    const apiError = {
      timestamp: new Date().toISOString(),
      status: appError.status ?? 0,
      error: appError.name ?? 'Application Error',
      message: message
    };

    errorService.set(apiError);

    if (!router.url.startsWith('/error')) {
      router.navigateByUrl('/error');
    }

    console.error('Global Handler Caught:', error);
  }
}