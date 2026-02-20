export {};

declare global {
  interface Window {
    __env?: {
      APIBASEURL?: string;
      GRAPHAPIURL?: string;
      BACKENDSCOPE?: string;
      MSALCLIENTID?: string;
      AZURETENANTID?: string;
      [key: string]: string | undefined;
    };
  }
}