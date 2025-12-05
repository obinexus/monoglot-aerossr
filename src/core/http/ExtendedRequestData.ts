import type { IncomingMessage } from 'http';

export interface ExtendedRequestData {
  raw: IncomingMessage;
  path: string;
  method: string;
  headers: Map<string, string>;
  body: unknown;
}
