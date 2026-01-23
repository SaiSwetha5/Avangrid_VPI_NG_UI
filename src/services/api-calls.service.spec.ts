
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ApiCallsService } from './api-calls.service';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { FilteredDataInterface, FilteredPayload, MetaDataPayload, VPIDataItem } from 'interfaces/vpi-interface';
 
class AuthServiceMock {
  getAccessToken = jasmine.createSpy('getAccessToken').and.returnValue(of('mock-token-123'));
}


function makeVPIDataItem(overrides: Partial<VPIDataItem> = {}): VPIDataItem {
  const base: VPIDataItem = {
    fileName: 'call_2025_01_01.wav',
    extensionNum: '1234',
    objectId: 'OBJ-001',
    channelNum: 'CH-01',
    aniAliDigits: '553210',
    name: 'Sai Swetha',
    dateAdded: new Date('2025-01-03T10:15:00Z'),
    opco: 'NYSEG',
    agentID: 'AGT-009',
    duration: 245,
    direction: true,
    isChecked: false,
  };
  return { ...base, ...overrides };
}

const vpiDataMock: VPIDataItem[] = [
  makeVPIDataItem({
    fileName: 'VPI_support_001.wav',
    extensionNum: '5678',
    objectId: 'OBJ-101',
    channelNum: 'CH-19',
    aniAliDigits: '456123780',
    name: 'Sai Swetha',
    dateAdded: new Date('2025-01-05T08:00:00Z'),
    agentID: 'AGT-012',
    duration: 312,
    direction: false,
  }),
  makeVPIDataItem({
    fileName: 'customer_VPI_002.wav',
    extensionNum: '2222',
    objectId: 'OBJ-102',
    channelNum: 'CH-23',
    aniAliDigits: '123456666',
    name: 'Sai Swetha Patnaik',
    dateAdded: new Date('2025-01-06T14:30:00Z'),
    agentID: 'AGT-015',
    duration: 128,
    direction: true,
    isChecked: true,
  }),
];

const mockResponse: FilteredDataInterface = {
  message: 'Success',
  status: 'OK',
  data: vpiDataMock,
  pagination: { totalRecords: vpiDataMock.length, totalPages: 1 },
};

const baseURL = "https://spring-boot-jwt-8utp.onrender.com";
describe('ApiCallsService', () => {
  let service: ApiCallsService;
  let httpMock: HttpTestingController;
  let authMock: AuthServiceMock;

  beforeEach(() => {
    authMock = new AuthServiceMock();
    httpMock = jasmine.createSpyObj('HttpTestingController', ['expectOne']);
    TestBed.configureTestingModule({
      providers: [
        ApiCallsService,
        provideHttpClient(), provideHttpClientTesting(),
        { provide: AuthService, useValue: authMock }],
    });
    service = TestBed.inject(ApiCallsService);
    httpMock = TestBed.inject(HttpTestingController);

   });


  afterEach(() => {
    if (httpMock) httpMock.verify();
  });


  it('Should call getFilteredData Method when applied filters button is clicked, VPI Data will be fetched,', () => {
    const payload: FilteredPayload = {
      from_date: '2025-01-01',
      to_date: '2025-01-31',
      opco: 'RGE',
      filters: {
        fileName: ['VPI_001.pdf'],
        extensionNum: ['123'],
        objectID: ['OBJ-101'],
        channelNum: null,
        aniAliDigits: ['9123456780'],
        name: ['Sai'],
      },
      pagination: { pageNumber: 2, pageSize: 50 },
    };

    let response: FilteredDataInterface | undefined;

    service.getFilteredData(payload).subscribe(res => (response = res));

    const req = httpMock.expectOne('/api/filtered');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token-123');

    req.flush(mockResponse);

    expect(response).toEqual(mockResponse);
    expect(response?.data.length).toBe(2);
    expect(response?.data[0].fileName).toBe('VPI_support_001.wav');
    expect(response?.pagination.totalRecords).toBe(2);
    expect(authMock.getAccessToken).toHaveBeenCalledTimes(1);
  });

  it('should call downloadRecordings method with correct payload and return an audio Blob', () => {
    const mockToken = 'mock-token';
    const mockPayload: MetaDataPayload[] = [
      { opco: 'GRE', filename: 'call_001.wav', date: '2025-12-04' },
      { opco: 'CMP', filename: 'call_002.wav', date: '2025-12-03' }
    ];
    const mockBlob = new Blob(['FAKE_AUDIO_DATA'], { type: 'audio/wav' });

    authMock.getAccessToken.and.returnValue(of(mockToken));

    service.downloadRecordings(mockPayload).subscribe(response => {
      expect(response).toEqual(mockBlob);
    });

    const req = httpMock.expectOne(`${baseURL}/download-recordings`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(req.request.responseType).toBe('blob');
    expect(req.request.body).toEqual(mockPayload);

    req.flush(mockBlob);
  });

  it('should give error if backend returns an error', () => {
    const mockToken = 'mock-token';
    const mockPayload: MetaDataPayload[] = [
      { opco: 'NYSEG', filename: 'call_001.wav', date: '2025-12-04' }
    ];
    const mockError = { status: 500, statusText: 'Server Error' };

    authMock.getAccessToken.and.returnValue(of(mockToken));

    service.downloadRecordings(mockPayload).subscribe({
      next: () => fail('Expected error, but got success'),
      error: (err) => {
        expect(err.status).toBe(500);
        expect(err.statusText).toBe('Server Error');
      }
    });

    const req = httpMock.expectOne(`${baseURL}/download-recordings`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    expect(req.request.responseType).toBe('blob');
    expect(req.request.body).toEqual(mockPayload);
    req.flush(null, mockError);
  });
});