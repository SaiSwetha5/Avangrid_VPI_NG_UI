import { HeaderItem, SearchFilteredDataInput, SearchFilteredDataOutput, VPIDataItem } from "interfaces/vpi-interface";
 
export const DISPLAY_HEADERS: HeaderItem[] = [
  { id: 'objectId', label: 'Object ID' },
  { id: 'dateAdded', label: 'Date Added' },
  { id: 'userId', label: 'User ID' },
  { id: 'opco', label: 'Opco' },
  { id: 'startTime', label: 'Start Time' },
  { id: 'duration', label: 'Duration' },
  { id: 'tags', label: 'Tags' },
  { id: 'channelName', label: 'Channel Name' },
  { id: 'callId', label: 'Call ID' },
  { id: 'userName', label: 'User Name' },
  { id: 'aniAliDigits', label: 'ANI/ALI Digits' },
  { id: 'extensionNum', label: 'Extension Num' },
  { id: 'direction', label: 'Direction' }
];
 
export const mockAudioBlob: Blob = new Blob(
  ['AUDIO_DATA'],
  { type: 'audio/wav' }
);

export const metaDataResponse: VPIDataItem = {
    "objectId": "a1627b23-fcf5-4894-b0a6-12c39b51cddd",
      "dateAdded": "2015-01-01T12:11:30",
      "userId": "9d5b0df8-3c8c-4d3e-b36c-f1d6fe77822f",
      "startTime": "2015-01-01T12:06:30",
      "duration": 280,
      "tags": null,
      "channelName": "Channel 102",
      "callId": "0f2b8f05-c361-408c-9067-3e1629a8b723",
      "userName": "CHRISTINE ODEA",
      "aniAliDigits": null,
      "extensionNum": null,
      "direction": "0"

}


export const mockFilteredPayloadInput: SearchFilteredDataInput = {
  from_date: '2025-12-01',
  to_date: '2025-12-04',
  opco: 'RGE',
  filters: {
    agentID: ['vpi_v.pdf', 'VPIsummary.xlsx'],
    extensionNum: ['1234', '5678'],
    objectIDs: ['OBJ001', 'OBJ002'],
    channelNum: ['CH01', 'CH02'],
    aniAliDigits: ['9876543210'],
    name: ['Sai Swetha', 'Test User1']
  },
  pagination: {
    pageNumber: 1,
    pageSize: 20
  }
};

export const mockVpiDataItem: VPIDataItem = {
   "objectId": "a1627b23-fcf5-4894-b0a6-12c39b51cddd",
      "dateAdded": "2015-01-01T12:11:30",
      "userId": "9d5b0df8-3c8c-4d3e-b36c-f1d6fe77822f",
      "startTime": "2015-01-01T12:06:30",
      "duration": 280,
      "tags": null,
      "channelName": "Channel 102",
      "callId": "0f2b8f05-c361-408c-9067-3e1629a8b723",
      "userName": "CHRISTINE ODEA",
      "aniAliDigits": null,
      "extensionNum": null,
      "direction": "0",
      "isChecked": false
};

export const mockFilteredData: SearchFilteredDataOutput = {
  message: 'Data fetched successfully',
  status: 200,
  data: [
    mockVpiDataItem,
    {
       "objectId": "a1627b23-fcf5-4894-b0a6-12c39b51cddd",
      "dateAdded": "2015-01-01T12:11:30",
      "userId": "9d5b0df8-3c8c-4d3e-b36c-f1d6fe77822f",
      "startTime": "2015-01-01T12:06:30",
      "duration": 280,
      "tags": null,
      "channelName": "Channel 102",
      "callId": "0f2b8f05-c361-408c-9067-3e1629a8b723",
      "userName": "CHRISTINE ODEA",
      "aniAliDigits": null,
      "extensionNum": null,
      "direction": "0"

    }
  ],
  pagination: {
    totalRecords: 2,
    totalPages: 1,
    pageNumber: 1,
    pageSize: 10
  }
};



export const mockFilteredDataError: SearchFilteredDataOutput = {
  message: 'Failed to fetch data',
  status: 500,
  data: [],
  pagination: {
    totalRecords: 0,
    totalPages: 0,
    pageNumber: 1,
    pageSize: 10
  }
};

export function makeVPIDataItem(overrides: Partial<VPIDataItem> = {}): VPIDataItem {
  const base: VPIDataItem = {
     "objectId": "a1627b23-fcf5-4894-b0a6-12c39b51cddd",
      "dateAdded": "2015-01-01T12:11:30",
      "userId": "9d5b0df8-3c8c-4d3e-b36c-f1d6fe77822f",
      "startTime": "2015-01-01T12:06:30",
      "duration": 280,
      "tags": null,
      "channelName": "Channel 102",
      "callId": "0f2b8f05-c361-408c-9067-3e1629a8b723",
      "userName": "CHRISTINE ODEA",
      "aniAliDigits": null,
      "extensionNum": null,
      "direction": "0",
    isChecked: false,
  };
  return { ...base, ...overrides };
}


export const vpiDataMock: VPIDataItem[] = [
  makeVPIDataItem({
      "objectId": "a1627b23-fcf5-4894-b0a6-12c39b51cddd",
      "dateAdded": "2015-01-01T12:11:30",
      "userId": "9d5b0df8-3c8c-4d3e-b36c-f1d6fe77822f",
      "startTime": "2015-01-01T12:06:30",
      "duration": 280,
      "tags": null,
      "channelName": "Channel 102",
      "callId": "0f2b8f05-c361-408c-9067-3e1629a8b723",
      "userName": "CHRISTINE ODEA",
      "aniAliDigits": null,
      "extensionNum": null,
      "direction": "0"

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
      "userName": "CHRISTINE ODEA",
      "aniAliDigits": null,
      "extensionNum": null,
      "direction": "0",
    isChecked: true,
  }),
];
