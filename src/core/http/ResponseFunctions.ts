import type { ExtendedResponseData } from './ExtendedResponseData';

export const ResponseFunctions = {
  setStatus(response: ExtendedResponseData, code: number): ExtendedResponseData {
    response.statusCode = code;
    return response;
  },

  setHeaders(
    response: ExtendedResponseData,
    headers: Map<string, string>
  ): ExtendedResponseData {
    response.headers = new Map([...response.headers, ...headers]);
    return response;
  },

  async sendResponse(
    response: ExtendedResponseData,
    body: unknown
  ): Promise<void> {
    if (!response.headersSent) {
      response.raw.statusCode = response.statusCode;
      response.headers.forEach((v, k) => response.raw.setHeader(k, v));
      response.headersSent = true;
    }
    response.raw.end(body);
  },
};
