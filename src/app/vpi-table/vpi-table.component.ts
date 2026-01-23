import { Component, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { DISPLAY_HEADERS, DISPLAY_LABELS } from 'app/app.component.mock';
import { FilteredDataInterface, FilteredPayload, MetaDataPayload, PaginatorState, VPIDataItem } from 'interfaces/vpi-interface';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { CommonModule, DatePipe } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import WaveSurfer from 'wavesurfer.js';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { Dialog, DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { DataService } from 'services/data.service';
import { Toolbar } from 'primeng/toolbar';
import { VpiSliderComponent } from '../vpi-slider/vpi-slider.component';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { catchError, EMPTY, Observable, of, tap, throwError } from 'rxjs';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { TooltipModule } from 'primeng/tooltip';
import { Chip } from 'primeng/chip';
import { ApiCallsService } from 'services/api-calls.service';
import { ProgressBar } from 'primeng/progressbar';

@Component({
  selector: 'app-vpi-table',
  imports: [HttpClientModule, ProgressBar,Chip, TooltipModule, ToastModule, ProgressSpinnerModule, VpiSliderComponent, Toolbar, Dialog, CheckboxModule, PanelModule, TabsModule, DialogModule, AccordionModule, CardModule, CommonModule, TableModule, InputIconModule, FormsModule, ButtonModule],
  standalone: true,
  providers: [DatePipe,MessageService],
  templateUrl: './vpi-table.component.html',
  styleUrl: './vpi-table.component.scss',
})


export class VpiTableComponent  {
  @ViewChild('waveform') waveFormRef!: ElementRef<HTMLDivElement>;
  public pagination = {
    pageNumber: 1,
    pageSize: 10,
  };
  public first = signal<number>(0);
  public rows = signal<number>(10);
  public hasErrorForAudioFile = false;
  public audioErrorMessage = ''
  public totalPages = signal(0);
  public checked = true;
  public fromDate: string | null = null;
  public toDate: string | null = null;
  public opCode: { name: string; code: string } | null = null;
  public audioPopUpVisible = false;
  public filterDialog = false;
  public selectedRow: VPIDataItem[] = [];
  public rowSelected = false;
  public displayHeaders = DISPLAY_HEADERS;
  public displayLabels = DISPLAY_LABELS;
  public selectedRowData!: VPIDataItem;
  public audioUrl: string | null = null;
  private wavesurfer: WaveSurfer | null = null;
  public currentPayload!: FilteredPayload;
  public isFirstRun = true;
  public payload = computed(() => this._dataService.getPayload());
  public _dataService = inject(DataService);
  private _apiService = inject(ApiCallsService);
  private datePipe = inject(DatePipe);
  private _messageService = inject(MessageService);
  public downloadDisabled = true;
  public loading = computed(() => this._dataService.loadingTableDataSignal());
  public loadingAudioFile1 = computed(() => this._dataService.loadingAudioFile());
  public successToaster = computed(() => this._dataService.successToasterSignal());
  public effectData = effect(() => {
  this.currentPayload = this.payload();
  if (!this.currentPayload || !this.currentPayload.filters) {
     return;  

  }
        this.fetchData(this.payload()).subscribe();

});
 
public onPageChange(event: PaginatorState): void {
    const pageNumber = Math.floor(event.first / event.rows) + 1;
    this.first.set(event.first);
    const newPayload: FilteredPayload = {
      ...this._dataService.getPayload(),
      pagination: {
        pageNumber,
        pageSize: event.rows
      }
    };

    this._dataService.setPayload(newPayload);
   }

  public fetchData(payload: FilteredPayload): Observable<FilteredDataInterface> {
   this._dataService.loadingTableDataSignal.set(true);

  if (!payload.filters || Object.keys(payload.filters).length === 0) {
    setTimeout(() => { this._dataService.loadingTableDataSignal.set(false);
    }, 3000);
    return EMPTY;
  }
    return this._apiService.getFilteredData(payload).pipe(
      tap((response: FilteredDataInterface) => {
        if (!response.data || response.data.length === 0) {
          this._dataService.pagedDataSignal.set([]);
          this._messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No data found.'
          });
        } else {
          this._dataService.pagedDataSignal.set(response.data);
          const totalRecords = response.pagination.totalRecords;
          const totalPages = response.pagination.totalPages;
          this._dataService.totalRecordsSignal.set(totalRecords);
          this.totalPages.set(totalPages);

          this._messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: response.message || 'Data fetched successfully.'
          });
        }

        this._dataService.loadingTableDataSignal.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        console.error('Metadata API error:', err);
        this._dataService.loadingTableDataSignal.set(false);
        return throwError(() => err);
      })
    );
  }

  public onRowClick(rowData: VPIDataItem) {
      this._dataService.loadingAudioFile.set(true);
    this.clearWaveform();
    this.audioUrl = null;
    const metaData: MetaDataPayload = {
      opco: rowData.opco,
      filename: rowData.fileName,
      date: this.getFormattedDate(rowData.dateAdded),
    };
    this._apiService.getMetaData(metaData).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error("Metadata API failed:", error.message);
        return of(null);
      })
    ).subscribe((metadata) => {
      if (metadata) {
        this.selectedRowData = metadata;
        if (this.selectedRowData) {
          this.rowSelected = true;
        }
        this.audioPopUpVisible = true;
        const isAlreadySelected = this.selectedRow.some(
          (row: VPIDataItem) => row.objectId === metadata.objectId
        );
     if (isAlreadySelected) {
          this.selectedRowData.isChecked = false;
          this.selectedRow = this.selectedRow.filter(
            (row: VPIDataItem) =>
              row.objectId !== metadata.objectId
          );
        }
        this.audioUrl = null;
        this._apiService.getAudioRecordings(metaData).pipe(
    
          catchError((error: HttpErrorResponse) => {
            this.hasErrorForAudioFile = true;
            this._messageService.add({ severity: 'error', summary: 'error', detail: 'No audio found,Failed to load waveform data.' });
            this.audioErrorMessage = error?.error?.message || 'Failed to load waveform data.';
            return of(null);
          })
        ).subscribe((audioFile) => {
          if (audioFile) {
            this.audioUrl = URL.createObjectURL(audioFile);
            setTimeout(() => this.Waveform(), 0);
          }
         this._dataService.loadingAudioFile.set(false);
        });
      } 
    });
  }


public downloadAudio(): void {
  const audioUrl = this.audioUrl;
  if (!audioUrl) {
    this.downloadDisabled = true;
    this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No audio URL to download' });
    return;
  }
   this.downloadDisabled = false;
  const a = document.createElement('a');
  a.href = audioUrl;
  a.download = 'avangridRecording.mp3';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    this._messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Audio file downloaded successfully'
    });
  },3000);
}


  public downloadAudioFiles(): void {
    if (this.selectedRow.length === 0) return;
    const payload = this.selectedRow.map(row => ({
      opco: row.opco,
      date: this.getFormattedDate(new Date(row.dateAdded)),
      filename: row.fileName
    }));

    this._apiService.downloadRecordings(payload).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'avangrid-recordings.zip';
        anchor.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          this._messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Audio files downloaded successfully'
          });
        }, 5000);
      },
      error: (err) => {
        console.error('Download failed', err);
      }
    });

  }

  public onMaximize(): void {
    if (this.waveFormRef) {
      const waveform = this.waveFormRef.nativeElement as HTMLElement;
      waveform.style.width = '100%';
      waveform.style.maxWidth = 'none';
    }
  }

  public formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  private clearWaveform(): void {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
      this.wavesurfer = null;
    //  this.hasErrorForAudioFile = false;

    }
  }

  public onCheckboxChange(isChecked: CheckboxChangeEvent, rowData: VPIDataItem) {
    if (isChecked) {
      if (!this.selectedRow.some((row: VPIDataItem) => {
        return row.objectId === rowData.objectId;
      })) {
        this.selectedRow = [...this.selectedRow, rowData];
      }
    } else {
      this.selectedRow = this.selectedRow.filter((row: VPIDataItem) => row.objectId !== rowData.objectId);
    }

  }

  public Waveform(): void {
    if (!this.waveFormRef) {
      return;
    }
     this.clearWaveform();

    this.wavesurfer = WaveSurfer.create({
      container: this.waveFormRef.nativeElement,
      waveColor: ["green", "blue", "rgba(255,165,0,0.7)"],
      progressColor: ["#FFA500", "#1E90FF", "#32CD32"],
      backend: 'MediaElement',
      mediaControls: true,
      height: 100,
      barWidth: 3,
    });

    this.wavesurfer?.load(this.audioUrl ?? '');
  }


  private getFormattedDate(date: Date | null): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd HH:mm:ss') || '';
  }

}

