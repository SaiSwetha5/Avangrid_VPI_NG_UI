import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AudioRecordingInput, SearchFilteredDataInput, SearchFilteredDataOutput, VPIMetaDataOutput } from '../interfaces/vpi-interface';
import { AuthService } from './auth.service';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiCallsService {
  public apiResponse = ''; 
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  public getFilteredData(payload: SearchFilteredDataInput): Observable<SearchFilteredDataOutput> {
    return this.auth.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        });

        return this.http.post<SearchFilteredDataOutput>(`${environment.apiBaseUrl}/search`, payload, { headers });
      })
    );
  }

public getMetaData(id: string, opco: string | null): Observable<VPIMetaDataOutput> {
  const params = new HttpParams()
    .set('id', id ?? '')
    .set('opco', opco ?? '');

  return this.auth.getAccessToken().pipe(
    switchMap(token => {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      });

       return this.http.get<VPIMetaDataOutput>(
        `${environment.apiBaseUrl}/metadata`,
        { params, headers }
      );
    })
  );
}


  public getAudioRecordings(payload: AudioRecordingInput): Observable<Blob> {

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

  public downloadRecordings(payload: AudioRecordingInput[]): Observable<Blob> {

    return this.auth.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        return this.http.post(`${environment.apiBaseUrl}/download`, payload, {
          headers,
          responseType: 'blob'
        });
      })
    );
  }
}









