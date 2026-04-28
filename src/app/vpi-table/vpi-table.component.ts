import { ViewEncapsulation, Component, computed, DestroyRef, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { DISPLAY_HEADERS, DownloadRecordingInput, PaginatorState, SearchFilteredDataInput, SearchFilteredDataOutput, VPIDataItem, VPIMetaDataOutput } from 'interfaces/vpi-interface';
import { CheckboxModule } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { CommonModule, DatePipe } from '@angular/common';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { DialogModule } from 'primeng/dialog';
import { PanelModule } from 'primeng/panel';
import { TabsModule } from 'primeng/tabs';
import { DataService } from 'services/data.service';
import { VpiSliderComponent } from '../vpi-slider/vpi-slider.component';
import WaveSurfer from 'wavesurfer.js';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { catchError, Observable, of, tap, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TooltipModule } from 'primeng/tooltip';
import { ApiCallsService } from 'services/api-calls.service';
import { ProgressBar } from 'primeng/progressbar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vpi-table',
  imports: [ProgressBar, TooltipModule, ToastModule, ProgressSpinnerModule, VpiSliderComponent, CheckboxModule, PanelModule, TabsModule, DialogModule, AccordionModule, CardModule, CommonModule, TableModule, InputIconModule, FormsModule, ButtonModule],
  standalone: true,
  providers: [DatePipe, MessageService],
  templateUrl: './vpi-table.component.html',
  styleUrl: './vpi-table.component.scss',
  encapsulation: ViewEncapsulation.None
})


export class VpiTableComponent {
  @ViewChild('waveform') waveFormRef!: ElementRef<HTMLDivElement>;
  public pagination = {
    pageNumber: 1,
    pageSize: 20,
  };
  public payload = computed(() => this._dataService.getPayload());
  public currentPayload: SearchFilteredDataInput | undefined;
  public _dataService = inject(DataService);
  private readonly _apiService = inject(ApiCallsService);
  private readonly _messageService = inject(MessageService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _router = inject(Router);
  private readonly datePipe = inject(DatePipe);
  public getSelectedOpcode = this._dataService.selectedOpcode;
  public first = signal<number>(0);
  public hasErrorForAudioFile = false;
  public audioErrorMessage = ''
  public totalPages = signal(0);
  public audioPopUpVisible = false;
  public selectedRow: VPIDataItem[] = [];
  public rowSelected = false;
  public displayHeaders = DISPLAY_HEADERS;
  public selectedRowData!: VPIMetaDataOutput;
  public audioUrl: string | null = null;
  private wavesurfer: WaveSurfer | null = null;
  public trackById = (index: number, header: { id: string }) => header.id;
  public downloadDisabled = true;
  public loading = computed(() => this._dataService.loadingTableDataSignal());
  public loadingAudioFile1 = computed(() => this._dataService.loadingAudioFile());

  private readonly effectData = effect(() => {
    this.currentPayload = this.payload();

    if (!this.currentPayload || !this._dataService.hasAnyValue(this.currentPayload)) {
      this._dataService.loadingTableDataSignal.set(false);
      return;
    }
    this.first.set(0);
    this.selectedRow = [];
    this.fetchData(this.currentPayload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe();
  }
  );

  public onPageChange(event: PaginatorState): void {
    const pageNumber = Math.floor(event.first / event.rows) + 1;
    this.first.set(event.first);
    const newPayload: SearchFilteredDataInput = {
      ...this._dataService.getPayload(),
      pagination: {
        pageNumber,
        pageSize: event.rows
      }
    };
    this._dataService.setPayload(newPayload);
  }

  public fetchData(payload: SearchFilteredDataInput | undefined): Observable<SearchFilteredDataOutput> {
    this._dataService.loadingTableDataSignal.set(true);
    return this._apiService.getFilteredData(payload).pipe(
      tap((response: SearchFilteredDataOutput) => {
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
        return throwError(() => err);
      })
    );
  }

  public onRowClick(rowData: VPIDataItem) {
    this._dataService.loadingAudioFile.set(true);
    this.clearWaveform();

    this.audioUrl = null;
    const getOpcode = this.getSelectedOpcode();
    this._apiService.getMetaData(rowData.objectId, getOpcode).pipe(
      catchError((error: HttpErrorResponse) => {
        this._router.navigate(['/error'], {
          state: { error: error.error }
        });

        return of(null);
      })
    ).subscribe((metadata) => {
      if (!metadata) {
        this._dataService.loadingAudioFile.set(false);
        return;
      }
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
      const audioRecordingInput = {
        date: rowData.startTime ? rowData.startTime : '',
        opco: this._dataService.selectedOpcode() ?? '',
        username: rowData.username ? rowData.username : '',
        aniAliDigits: rowData.aniAliDigits ? rowData.aniAliDigits : '',
        extensionNum: rowData.extensionNum ? rowData.extensionNum : '',
        channelNum: rowData.channelNum ? rowData.channelNum : 0,
        objectId: rowData.objectId ? rowData.objectId : '',
        duration: rowData.duration ? rowData.duration : 0
      };

      this._apiService.getAudioRecordings(audioRecordingInput).pipe(
        catchError(async (err: HttpErrorResponse) => {
          this.handleAudioError(err);
          return null;
        })
      ).subscribe((audioFile) => {
        this.hasErrorForAudioFile = false;
        this.audioErrorMessage = "";
        if (audioFile) {
          this._dataService.loadingAudioFile.set(false);
          this.clearWaveform();
          this.audioUrl = URL.createObjectURL(audioFile);
          setTimeout(() => this.waveform(), 0);
        } else {
          this._dataService.loadingAudioFile.set(false);
        }
      });

    });
  }

  private async handleAudioError(error: HttpErrorResponse) {
    this._dataService.loadingAudioFile.set(false);
    this.hasErrorForAudioFile = false;
    this.audioErrorMessage = "";
    if (error.error instanceof Blob && error.error.type === 'application/json') {
      const jsonText = await error.error.text();
      const errObj = JSON.parse(jsonText);
      this.hasErrorForAudioFile = true;
      this.audioErrorMessage = errObj.message || 'Failed to load waveform data.';
    }
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
    if (a) {
      document.body.removeChild(a);
    }
    setTimeout(() => {
      this._messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Audio file downloaded successfully'
      });
    }, 3000);
  }

  public downloadAudioFiles(): void {
    if (this.selectedRow.length === 0) return;
    const payload: DownloadRecordingInput[] = this.selectedRow.map(row => ({
      date: row.startTime ? row.startTime : null,
      opco: row.opco ? row.opco : null,
      username: row.username ? row.username : null,
      aniAliDigits: row.aniAliDigits ? row.aniAliDigits : null,
      extensionNum: row.extensionNum ? row.extensionNum : null,
      channelNum: row.channelNum ? row.channelNum : null,
      objectId: row.objectId ? row.objectId : null,
      duration: row.duration ? row.duration : null
    }));
    this._apiService.downloadRecordings(payload).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/zip' });
        const url = globalThis.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'avangrid-recordings.zip';
        anchor.click();
        setTimeout(() => {
          globalThis.URL.revokeObjectURL(url);
          this._messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Audio files downloaded successfully'
          });
        }, 5000);
      },
      error: (err) => {
        console.error('Download failed', err);
        this._router.navigate(['/error'], {
          state: { error: err.error }
        });

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

  private clearWaveform(): void {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();

    }
    this.wavesurfer = null;
    this.hasErrorForAudioFile = false;
    this.audioErrorMessage = "";
  }

  public waveform(): void {
    if (!this.waveFormRef) {
      return;
    }

    this.wavesurfer = WaveSurfer.create({
      container: this.waveFormRef.nativeElement,
      waveColor: ["#A5D6A7", "#81C784", "#66BB6A"],
      progressColor: ["#FFFFFF", "#FFF176", "#FFEB3B"],
      backend: 'MediaElement',
      mediaControls: true,
      height: 100,
      barWidth: 3,
    });

    this.wavesurfer?.load(this.audioUrl ?? '');

  }


  convertUtcToEst(value: string): string {
    if (!value) return '';
    const utcDate = new Date(value + ' UTC');

    return new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(utcDate);
  }

}
