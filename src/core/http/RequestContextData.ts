import type { ExtendedRequestData } from './ExtendedRequestData';
import type { ExtendedResponseData } from './ExtendedResponseData';

export interface RequestContextData {
  request: ExtendedRequestData;
  response: ExtendedResponseData;
  state: Map<string, unknown>;
  params: Map<string, string>;
  query: Map<string, string>;
}
