import { Injectable } from '@angular/core';
import { ApiError } from 'interfaces/vpi-interface';
 
@Injectable({ providedIn: 'root' })
export class ErrorService {
  private lastError: ApiError | undefined = undefined;

  set(error: ApiError) {
    this.lastError = error;
  }

  get(): ApiError | undefined {
    return this.lastError;
  }
  
}