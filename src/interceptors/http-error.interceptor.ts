import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ErrorService } from 'services/error.service';
 
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
    catchError((error: HttpErrorResponse) => {
        const apiError = {
          timestamp: new Date().toISOString(),
          status: error.status ?? 0,
          error: error.name ?? 'HttpError',
          message: this.normalizeErrorMessage(error),
        };

        this.errorService.set(apiError);

         if (!this.router.url.startsWith('/error')) {
          this.router.navigate(['/error'], { state: { error: apiError } }); 
               }

         return throwError(() => error);
      })
    );
  }
 private normalizeErrorMessage(error: HttpErrorResponse): string {
   if (typeof error.error === 'string' && error.error.trim().length > 0) {
    return error.error;
  }

   if (error.error?.message) {
    return error.error.message;
  }

   if (error.message) {
    return error.message;
  }

   return `Unexpected error (HTTP ${error.status || 'unknown'})`;
}
}