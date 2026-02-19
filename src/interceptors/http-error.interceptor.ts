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

        if (error.status >= 400 && error.status < 500) {
          return throwError(() => error);
        } if (!this.router.url.startsWith('/error')) {
          this.router.navigate(['/error'], { replaceUrl: true });
        }
        return throwError(() => error);
      })
    );
  }

  private normalizeErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      const msg = error.message || '';
      if (/ERR_CERT_|SSL|certificate/i.test(msg)) return 'Secure connection failed (SSL certificate mismatch).';
      if (/CORS|cors/i.test(msg)) return 'Request blocked by CORS policy.';
      return 'Network error: No response from server.';
    }
    if (typeof error.error === 'string') return error.error;
    if (error.error?.message) return error.error.message;
    return error.message || `HTTP ${error.status}`;
  }
}