export interface FilteredDataInterface {
  message: string;
  status: string;
  data: VPIDataItem[];
  pagination: {
    totalRecords: number;
    totalPages: number;
  };
}

export interface PaginatorState {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

export interface VPIDataItem {
  fileName: string;
  extensionNum: string;
  objectId: string;
  channelNum: string;
  aniAliDigits: string;
  name: string;
  dateAdded: Date;
  opco: string;
  agentID: string;
  duration: number;
  direction: boolean;
  isChecked?: boolean;
}

export interface Pagination {
  totalRecords: number;
  totalPages: number;
  pageNumber: number;
  pageSize: number;
}

export interface MetaDataPayload {
  opco: string;
  filename: string;
  date: string;
}

export interface FilteredPayload {
  from_date?: string;
  to_date?: string;
  opco?: string;
  filters?: {
    fileName?: string[] | null;
    extensionNum?: string[] | null;
    objectID?: string[] | null;
    channelNum?: string[] | null;
    aniAliDigits?: string[] | null;
    name?: string[] | null;
  };
  pagination?: {
    pageNumber?: number;
    pageSize?: number;
  };
}

