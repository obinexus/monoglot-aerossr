import type { ServerResponse } from 'http';

export interface ExtendedResponseData {
  raw: ServerResponse;
  statusCode: number;
  headersSent: boolean;
  headers: Map<string, string>;
  body: Buffer | string;
}
