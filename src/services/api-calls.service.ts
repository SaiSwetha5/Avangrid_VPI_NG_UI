import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { FilteredDataInterface, FilteredPayload, MetaDataPayload, VPIDataItem } from '../interfaces/vpi-interface';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {
  public apiResponse = ''; 
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  public getFilteredData(payload: FilteredPayload): Observable<FilteredDataInterface> {
    return this.auth.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        return this.http.post<FilteredDataInterface>(`${environment.apiBaseUrl}/fetch-metadata`, payload, { headers });
      })
    );
  }

  public getMetaData(payload: MetaDataPayload): Observable<VPIDataItem> {

    return this.auth.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        return this.http.post<VPIDataItem>(`${environment.apiBaseUrl}/recording-metadata`, payload, { headers });
      })
    );
  }

  public getAudioRecordings(payload: MetaDataPayload): Observable<Blob> {

    return this.auth.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        return this.http.post(`${environment.apiBaseUrl}/recording`, payload, { headers, responseType: 'blob' });
      })
    );

  }

  public downloadRecordings(payload: MetaDataPayload[]): Observable<Blob> {

    return this.auth.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        return this.http.post(`${environment.apiBaseUrl}/download-recordings`, payload, {
          headers,
          responseType: 'blob'
        });
      })
    );
  }
}









