
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';

import { ApiCallsService } from './api-calls.service';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { SearchFilteredDataInput, SearchFilteredDataOutput, VPIDataItem } from 'interfaces/vpi-interface';

class AuthServiceMock {
  getAccessToken = jasmine.createSpy('getAccessToken').and.returnValue(of('mock-token-123'));
}


function makeVPIDataItem(overrides: Partial<VPIDataItem> = {}): VPIDataItem {
  const base: VPIDataItem = {
    "objectId": "a1627b23-fcf5-4894-b0a6-12c39b51cddd",
    "dateAdded": "2015-01-01T12:11:30",
    "userId": "9d5b0df8-3c8c-4d3e-b36c-f1d6fe77822f",
    "startTime": "2015-01-01T12:06:30",
    "duration": 280,
    "tags": null,
    "channelName": "Channel 102",
    "callId": "0f2b8f05-c361-408c-9067-3e1629a8b723",
    "username": "CHRISTINE ODEA",
    "aniAliDigits": null,
    "extensionNum": null,
    "direction": "0",
    "isChecked": false,
    "channelNum": 122,
    "agentId": "agent-123",
    "opco": "RGE"
  };
  return { ...base, ...overrides };
}

const vpiDataMock: VPIDataItem[] = [
  makeVPIDataItem({
    "objectId": "a1627b23-fcf5-4894-b0a6-12c39b51cddd",
    "dateAdded": "2015-01-01T12:11:30",
    "userId": "9d5b0df8-3c8c-4d3e-b36c-f1d6fe77822f",
    "startTime": "2015-01-01T12:06:30",
    "duration": 280,
    "tags": null,
    "channelName": "Channel 102",
    "callId": "0f2b8f05-c361-408c-9067-3e1629a8b723",
    "username": "CHRISTINE ODEA",
    "aniAliDigits": null,
    "extensionNum": null,
    "direction": "0",
    "isChecked": false,
    "channelNum": 122,
    "agentId": "agent-123",
    "opco": "RGE"
  }),
  makeVPIDataItem({
    "objectId": "a1627b23-fcf5-4894-b0a6-12c39b51cddd",
    "dateAdded": "2015-01-01T12:11:30",
    "userId": "9d5b0df8-3c8c-4d3e-b36c-f1d6fe77822f",
    "startTime": "2015-01-01T12:06:30",
    "duration": 280,
    "tags": null,
    "channelName": "Channel 102",
    "callId": "0f2b8f05-c361-408c-9067-3e1629a8b723",
    "username": "CHRISTINE ODEA",
    "aniAliDigits": null,
    "extensionNum": null,
    "direction": "0",
    "isChecked": false,
    "channelNum": 122,
    "agentId": "agent-123",
    "opco": "RGE"
  }),
];

const mockResponse: SearchFilteredDataOutput = {
  message: 'Success',
  status: 200,
  data: vpiDataMock,
  pagination: { totalRecords: vpiDataMock.length, totalPages: 1, pageNumber: 1, pageSize: 10 },
};

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
    const payload: SearchFilteredDataInput = {
      from_date: '2025-01-01',
      to_date: '2025-01-31',
      opco: 'RGE',
      filters: {
        agentID: ['122'],
        extensionNum: ['123'],
        objectIDs: null,
        channelNum: null,
        aniAliDigits: ['9123456780'],
      },
      pagination: { pageNumber: 2, pageSize: 50 },
    };

    let response: SearchFilteredDataOutput | undefined;

    service.getFilteredData(payload).subscribe(res => (response = res));

    const req = httpMock.expectOne('/api/filtered');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    expect(req.request.headers.get('Content-Type')).toBe('application/json');
    expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token-123');

    req.flush(mockResponse);

    expect(response).toEqual(mockResponse);
    expect(response?.data.length).toBe(2);
    expect(response?.data[0].username).toBe('VPI_support_001.wav');
    expect(response?.pagination.totalRecords).toBe(2);
    expect(authMock.getAccessToken).toHaveBeenCalledTimes(1);
  });



});