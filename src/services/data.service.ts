import {  Injectable, signal } from '@angular/core'; 
import {  FilteredPayload, VPIDataItem } from '../interfaces/vpi-interface';
   

@Injectable({
  providedIn: 'root'
})
export class DataService {
public pagedDataSignal = signal<VPIDataItem[]>([]);
public totalRecordsSignal = signal(0);
public loadingTableDataSignal = signal<boolean>(false);
public loadingAudioFile = signal<boolean>(false);
public successToasterSignal = signal<boolean>(true);
public vpiDataSignal = signal<VPIDataItem[]>([]);        

private payloadSignal = signal<FilteredPayload>({
  filters: {},
  pagination: {
    pageNumber: 1,
    pageSize: 10
  }
});

  public payload = this.payloadSignal;

  public getPayload() {
    return this.payloadSignal();
  }

  public setPayload(payload: FilteredPayload) { 
     this.payloadSignal.set(payload);
  }

  public getTotalRecords() {
    return this.totalRecordsSignal();
  }

  public setTotalRecords(count: number) {
    this.totalRecordsSignal.set(count);
  }
}
 