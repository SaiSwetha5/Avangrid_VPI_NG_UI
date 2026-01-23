import { TestBed } from '@angular/core/testing';
import { VpiTableComponent } from './vpi-table.component';
import { MsalService } from '@azure/msal-angular';
import { AuthService } from 'services/auth.service';
import { MessageService } from 'primeng/api';
import { ApiCallsService } from 'services/api-calls.service';
import { DataService } from 'services/data.service';
import WaveSurfer from 'wavesurfer.js';

class MockMsalService {
  instance = {
    activeAccount: null,
    getActiveAccount: () => null,
    getAllAccounts: () => [],
    setActiveAccount: () => { '' }
  };
}

describe('VpiTableComponent', () => {
  let component: VpiTableComponent;
  let apiService: jasmine.SpyObj<ApiCallsService>;
  let dataService: jasmine.SpyObj<DataService>;
  let messageService: jasmine.SpyObj<MessageService>;
  beforeEach(() => {
    apiService = jasmine.createSpyObj('ApiService', ['getFilteredData']);
    dataService = jasmine.createSpyObj('DataService', [
      'loadingTableDataSignal',
      'pagedDataSignal',
      'totalRecordsSignal'
    ], {
      loadingTableDataSignal: { set: jasmine.createSpy('set') },
      pagedDataSignal: { set: jasmine.createSpy('set') },
      totalRecordsSignal: { set: jasmine.createSpy('set') }
    });
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      imports: [VpiTableComponent],
      providers: [
        ApiCallsService,
        AuthService,
        { provide: MsalService, useClass: MockMsalService },
        VpiTableComponent,
        { provide: ApiCallsService, useValue: apiService },
        { provide: DataService, useValue: dataService },
        { provide: MessageService, useValue: messageService }
      ]
    });
    const fixture = TestBed.createComponent(VpiTableComponent);
    component = fixture.componentInstance;
  });

  it('should create VPI Table Component', () => {
    expect(component).toBeTruthy();
  });

  it('should show error message when audioUrl is missing in the selected row data', () => {
    component['audioUrl'] = null;
 
    component.downloadAudio();

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'error',
      detail: 'No audio URL to download'
    });
  });



  it('should create wavesurfer instance and load audio when waveFormRef exists', () => {
    const mockWaveSurfer = jasmine.createSpyObj('WaveSurfer', ['load']);
    spyOn(WaveSurfer, 'create').and.returnValue(mockWaveSurfer);

    component.waveFormRef = { nativeElement: document.createElement('div') };
    component.audioUrl = 'http://localhost/audio/test.wav';

    component.Waveform();

    expect(WaveSurfer.create).toHaveBeenCalledWith(jasmine.objectContaining({
      container: component.waveFormRef.nativeElement
    }));
    expect(mockWaveSurfer.load).toHaveBeenCalledWith('http://localhost/audio/test.wav');
  });
});
