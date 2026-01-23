import { FilteredDataInterface, FilteredPayload, MetaDataPayload, VPIDataItem } from "interfaces/vpi-interface";


export const DISPLAY_LABELS = [
  "File Name",
  "Object ID",
  "Extension Number",
  "Channel Number",
  "ANI/ALI Digits",
  "Name",
  "Date Added",
  "Opco",
  "Direction",
  "Duration",
  "Agent ID",
];


export const DISPLAY_HEADERS = [
  "fileName",
  "objectId",
  "extensionNum",
  "channelNum",
  "aniAliDigits",
  "name",
  "dateAdded",
  "opco",
  "direction",
  "duration",
  "agentID"
]

export const mockMetaDataPayload: MetaDataPayload = {
  opco: 'RGE',
  filename: 'call_recording_001.wav',
  date: '2025-12-04'
};

export const mockAudioBlob: Blob = new Blob(
  ['AUDIO_DATA'],
  { type: 'audio/wav' }
);

export const metaDataResponse: VPIDataItem = {
  "fileName": "REC002.wav",
  "extensionNum": "101",
  "objectId": "OBJ001",
  "channelNum": "CH001",
  "aniAliDigits": "1234567890",
  "name": "John Doe",
  "dateAdded": new Date("2025-09-02T14:35:00"),
  "opco": "VPI",
  "direction": true,
  "duration": 0,
  "agentID": "UNKNOWN"
}


export const mockFilteredPayload: FilteredPayload = {
  from_date: '2025-12-01',
  to_date: '2025-12-04',
  opco: 'RGE',
  filters: {
    fileName: ['vpi_v.pdf', 'VPIsummary.xlsx'],
    extensionNum: ['1234', '5678'],
    objectID: ['OBJ001', 'OBJ002'],
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
  fileName: 'call_recording_001.wav',
  extensionNum: '1234',
  objectId: 'OBJ-001',
  channelNum: 'CH-01',
  aniAliDigits: '9876543210',
  name: 'Sai Swetha',
  dateAdded: new Date('2025-12-01T10:30:00Z'),
  opco: 'NYSEG',
  agentID: 'AGT-5678',
  duration: 360,
  direction: true,
  isChecked: false
};

export const mockFilteredData: FilteredDataInterface = {
  message: 'Data fetched successfully',
  status: 'success',
  data: [
    mockVpiDataItem,
    {
      fileName: 'call_recording_002.wav',
      extensionNum: '5678',
      objectId: 'OBJ-002',
      channelNum: 'CH-02',
      aniAliDigits: '9123456780',
      name: 'Test User',
      dateAdded: new Date('2025-12-02T14:45:00Z'),
      opco: 'NYSEG',
      agentID: 'AGT-9876',
      duration: 420,
      direction: false,
      isChecked: true
    }
  ],
  pagination: {
    totalRecords: 2,
    totalPages: 1
  }
};



export const mockFilteredDataError: FilteredDataInterface = {
  message: 'Failed to fetch data',
  status: 'error',
  data: [],
  pagination: {
    totalRecords: 0,
    totalPages: 0
  }
};

export function makeVPIDataItem(overrides: Partial<VPIDataItem> = {}): VPIDataItem {
  const base: VPIDataItem = {
    fileName: 'call_2025_01_01.wav',
    extensionNum: '1234',
    objectId: 'OBJ-001',
    channelNum: 'CH-01',
    aniAliDigits: '9876543210',
    name: 'Sai Swetha',
    dateAdded: new Date('2025-01-03T10:15:00Z'),
    opco: 'RGE',
    agentID: 'AGT-009',
    duration: 245,
    direction: true,
    isChecked: false,
  };
  return { ...base, ...overrides };
}


export const vpiDataMock: VPIDataItem[] = [
  makeVPIDataItem({
    fileName: 'VPI_support_001.wav',
    extensionNum: '5678',
    objectId: 'OBJ-101',
    channelNum: 'CH-19',
    aniAliDigits: '9123456780',
    name: 'Sai Swetha',
    dateAdded: new Date('2025-01-05T08:00:00Z'),
    agentID: 'AGT-012',
    duration: 312,
    direction: false,
  }),
  makeVPIDataItem({
    fileName: 'customer_callback_002.wav',
    extensionNum: '2222',
    objectId: 'OBJ-102',
    channelNum: 'CH-23',
    aniAliDigits: '9988776655',
    name: 'Swetha Patnaik',
    dateAdded: new Date('2025-01-06T14:30:00Z'),
    agentID: 'AGT-015',
    duration: 128,
    direction: true,
    isChecked: true,
  }),
];
