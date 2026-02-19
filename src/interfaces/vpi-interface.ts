export interface SearchFilteredDataOutput {
  message: string;
  status: number;
  data: VPIDataItem[];
  pagination: {
    totalRecords: number;
    totalPages: number;
    pageNumber: number;
    pageSize: number;
  };
}
 
export interface PaginatorState {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

export interface VPIDataItem { 
      objectId: string,
      dateAdded: string,
      userId: string,
      startTime: string,
      duration: number,
      tags: string | null,
      channelName: string,
      channelNum: number,
      callId: string,
      username: string,
      aniAliDigits: string | null,
      extensionNum: string | null,
      direction: string,
      agentId: string,
      opco: string
      isChecked?: boolean;
}
 
export interface DownloadRecordingInput {

  date: string | null;
  opco: string | null;
  username: string | null;
  aniAliDigits: string | null;
  extensionNum: string | null;
  channelNum: number | null;
  objectId: string | null;
  duration: number | null;

}

export interface VPIMetaDataOutput {
  isChecked?: boolean;
  objectId: string;             
  dateAdded: string;         
  resourceId: string;
  workstationId: string;
  userId: string;               
  startTime: string;            
  gmtOffset: number;
  gmtStartTime: string;         
  duration: number; 
  triggeredByResourceTypeId: string;
  triggeredByObjectId: string;
  flagId: string;
  tags: string;
  sensitivityLevel: string;
  clientId: string; 
  channelNum: number;
  channelName: string;
  extensionNum: string;
  agentId: string;
  pbxDnis: string;
  aniAliDigits: string;
  direction: string;
  mediaFileId: string;
  mediaManagerId: string;
  mediaRetention: string; 
  callId: string;
  previousCallId: string;
  globalCallId: string; 
  classOfService: string;
  classOfServiceDate: string;   
  xPlatformRef: string; 
  transcriptResult: string;
  warehouseObjectKey: string;
  transcriptStatus: string;
  audioChannels: number;
  hasTalkover: boolean;
}
export interface Pagination {
  totalRecords: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface MetaDataPayload {
 objectIDs: string; 
 dateAdded: string;
}

export interface SearchFilteredDataInput {
  from_date?: string;
  to_date?: string;
  opco?: string;
  filters?: {
    agentID?: string[] | null;
    extensionNum?: string[] | null;
    objectIDs?: string[] | null;
    channelNum?: string[] | null;
    aniAliDigits?: string[] | null;
    name?: string[] | null;
    direction?: string | null;
  };
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
  };
}

export interface ApiError {
   timestamp: string; 
   status: number;
   error: string;
   message: string;
}
 
export interface HeaderItem { id: string; label: string; }

export const DISPLAY_HEADERS: HeaderItem[] = [
  { id: 'objectId', label: 'Object ID' },
  { id: 'dateAdded', label: 'Date Added (UTC)' },
  { id: 'userId', label: 'User ID' },
  { id: 'startTime', label: 'Start Time (UTC)' },
  { id: 'duration', label: 'Duration' },
  { id: 'tags', label: 'Tags' },
  { id: 'channelName', label: 'Channel Name' },
  { id: 'callId', label: 'Call ID' },
  { id: 'username', label: 'User Name' },
  { id: 'aniAliDigits', label: 'ANI/ALI Digits' },
  { id: 'extensionNum', label: 'Extension Num' },
  { id: 'direction', label: 'Direction' }
];