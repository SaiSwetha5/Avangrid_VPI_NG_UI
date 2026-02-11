import {  Injectable, signal, WritableSignal } from '@angular/core'; 
import {  SearchFilteredDataInput, VPIDataItem } from '../interfaces/vpi-interface';
   

@Injectable({
  providedIn: 'root'
})
export class DataService {
public readonly pagedDataSignal = signal<VPIDataItem[]>([]);
public readonly totalRecordsSignal = signal(0);
public readonly loadingTableDataSignal = signal<boolean>(false);
public readonly loadingAudioFile = signal<boolean>(false);
public readonly successToasterSignal = signal<boolean>(true);
public readonly vpiDataSignal = signal<VPIDataItem[]>([]);
public selectedOpcode: WritableSignal<string | null> = signal(null);

private payloadSignal = signal<SearchFilteredDataInput>({
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

  public setPayload(payload: SearchFilteredDataInput) { 
     this.payloadSignal.set(payload);
  }

  public getTotalRecords() {
    return this.totalRecordsSignal();
  }

  public setTotalRecords(count: number) {
    this.totalRecordsSignal.set(count);
  }
}
 