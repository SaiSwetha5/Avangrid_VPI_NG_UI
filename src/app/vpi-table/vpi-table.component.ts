import { Component, computed, DestroyRef, effect, ElementRef, inject, OnInit, signal, ViewChild, ViewEncapsulation, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, EMPTY, firstValueFrom, Observable, Subject, switchMap, tap, throwError } from 'rxjs';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { PanelModule } from 'primeng/panel';
import { ProgressBar } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import WaveSurfer from 'wavesurfer.js';
import { ApiCallsService } from 'services/api-calls.service';
import { DataService } from 'services/data.service';
import { DISPLAY_HEADERS, DownloadRecordingInput, PaginatorState, SearchFilteredDataInput, SearchFilteredDataOutput, VPIDataItem, VPIMetaDataOutput } from 'interfaces/vpi-interface';
import { VpiSliderComponent } from 'app/vpi-slider/vpi-slider.component';

@Component({
  selector: 'app-vpi-table',
  imports: [AccordionModule, ButtonModule, CardModule, CheckboxModule, CommonModule, DialogModule, FormsModule, InputIconModule, PanelModule, ProgressBar, ProgressSpinnerModule, TableModule, TabsModule, ToastModule, TooltipModule, VpiSliderComponent],
  standalone: true,
  providers: [MessageService],
  templateUrl: './vpi-table.component.html',
  styleUrl: './vpi-table.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class VpiTableComponent implements OnInit {

  @ViewChild('waveform') waveFormRef!: ElementRef<HTMLDivElement>;
  private readonly _apiService = inject(ApiCallsService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _messageService = inject(MessageService);
  private readonly _router = inject(Router);
  public _dataService = inject(DataService);

  private readonly rowClick$ = new Subject<VPIDataItem | null>();
  private audioFileName: string | null = null;
  private wavesurfer: WaveSurfer | null = null;

  public audioErrorMessage = '';
  public audioPopUpVisible = false;
  public audioUrl: string | null = null;
  public currentPayload: SearchFilteredDataInput | undefined;
  public displayHeaders = DISPLAY_HEADERS;
  public downloadDisabled = true;
  public first = signal<number>(0);
  public getSelectedOpcode = this._dataService.selectedOpcode;
  public hasErrorForAudioFile = false;
  public isMetaDataAvailable: WritableSignal<boolean> = signal<boolean>(false);
  public loading = computed(() => this._dataService.loadingTableDataSignal());
  public loadingAudioFile1 = computed(() => this._dataService.loadingAudioFile());
  public pagination = { pageNumber: 1, pageSize: 20 };
  public payload = computed(() => this._dataService.getPayload());
  public rowSelected = false;
  public selectedRow: VPIDataItem[] = [];
  public selectedRowData: VPIMetaDataOutput | null = null;
  public totalPages = signal(0);
  public trackById = (index: number, header: { id: string }) => header.id;

  public ngOnInit(): void {
    this.rowClick$.pipe(
      debounceTime(500),
      switchMap((data) => data ? this.loadMetaData(data) : EMPTY),
      takeUntilDestroyed(this._destroyRef)
    ).subscribe();
  }

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
    this.rowClick$.next(rowData);
  }


  public onDialogClose(): void {
    this.rowClick$.next(null);
    this.clearWaveform();
    this.audioUrl = null;
    this.hasErrorForAudioFile = false;
    this.audioErrorMessage = "";
    this.rowSelected = false;
    this.selectedRowData = null;
    this._dataService.loadingAudioFile.set(false);
    this._dataService.loadingTableDataSignal.set(false);

    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
  }

  private initializeAudioPopup(): void {
    this.audioPopUpVisible = true;
    this.clearWaveform();
    this.audioUrl = null;
    this.hasErrorForAudioFile = false;
    this.audioErrorMessage = "";
  }

  private buildAudioRecordingInput(rowData: VPIDataItem): DownloadRecordingInput {
    return {
      date: rowData.startTime ?? '',
      opco: this._dataService.selectedOpcode() ?? '',
      username: rowData.username ?? '',
      aniAliDigits: rowData.aniAliDigits ?? '',
      extensionNum: rowData.extensionNum ?? '',
      channelNum: rowData.channelNum ?? 0,
      objectId: rowData.objectId ?? '',
      duration: rowData.duration ?? 0
    };
  }

  private async getMetadata(rowData: VPIDataItem): Promise<void> {
    this.isMetaDataAvailable.set(true);
    const metadata = await firstValueFrom(
      this._apiService.getMetaData(rowData.objectId, this.getSelectedOpcode())
    );

    if (!metadata) return;

    this.isMetaDataAvailable.set(false);
    this.selectedRowData = metadata;
    this.rowSelected = true;
    this.isCheckBoxSelected(metadata);
  }


  private isCheckBoxSelected(metadata: VPIMetaDataOutput): void {
    const isAlreadySelected = this.selectedRow.some(
      (row: VPIDataItem) => row.objectId === metadata.objectId
    );

    if (isAlreadySelected) {
      if (this.selectedRowData) {
        this.selectedRowData.isChecked = false;
      }
      this.selectedRow = this.selectedRow.filter(
        (row: VPIDataItem) => row.objectId !== metadata.objectId
      );
    }
  }

  private async fetchAndApplyAudio(audioRecordingInput: DownloadRecordingInput): Promise<void> {
    this._dataService.loadingAudioFile.set(true);

    const audioFile = await firstValueFrom(
      this._apiService.getAudioRecordings(audioRecordingInput)
    );

    const contentDisposition = audioFile.headers.get('Content-Disposition');
    this.audioFileName = this.extractFileName(contentDisposition) ?? 'audio_recording';

    if (audioFile.body instanceof Blob) {
      this.applyAudioBlob(audioFile.body);
    }
  }

  private applyAudioBlob(blob: Blob): void {
    this.hasErrorForAudioFile = false;
    this.audioErrorMessage = "";
    this.clearWaveform();
    this.audioUrl = URL.createObjectURL(blob);
    setTimeout(() => this.waveform(), 0);
  }


  private async loadMetaData(rowData: VPIDataItem): Promise<void> {
    this.initializeAudioPopup();
    const audioRecordingInput = this.buildAudioRecordingInput(rowData);

    try {
      await this.getMetadata(rowData);
      await this.fetchAndApplyAudio(audioRecordingInput);
    } catch (error) {
      await this.handleAudioError(error as HttpErrorResponse);
      this.audioPopUpVisible = true;
    } finally {
      this._dataService.loadingAudioFile.set(false);
    }
  }

  private extractFileName(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const utf8Pattern = /filename\*=UTF-8''([^;]*)/;
    const standardPattern = /filename="?([^";\n]*)"?/;

    const fileNameMatch =
      utf8Pattern.exec(contentDisposition) ??
      standardPattern.exec(contentDisposition);

    return fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : null;
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
    a.download = this.audioFileName ? this.audioFileName.toString() : 'audio_recording.wav';
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
        anchor.download = 'avangrid-audio-recordings.zip';
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
    if (!value) {
      return '';
    }
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
