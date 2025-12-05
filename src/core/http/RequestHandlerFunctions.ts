import type { IncomingMessage, ServerResponse } from 'http';
import type { RequestContextData } from './RequestContextData';
import type { ExtendedRequestData } from './ExtendedRequestData';
import type { ExtendedResponseData } from './ExtendedResponseData';

export const RequestHandlerFunctions = {
  createRequestContext(
    req: IncomingMessage,
    res: ServerResponse
  ): RequestContextData {
    const extendedReq: ExtendedRequestData = {
      raw: req,
      path: req.url || '',
      method: req.method || 'GET',
      headers: new Map(Object.entries(req.headers as Record<string, string>)),
      body: null,
    };

    const extendedRes: ExtendedResponseData = {
      raw: res,
      statusCode: 200,
      headersSent: false,
      headers: new Map(),
      body: '',
    };

    return {
      request: extendedReq,
      response: extendedRes,
      state: new Map(),
      params: new Map(),
      query: new Map(),
    };
  },
};
