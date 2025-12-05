import { IncomingMessage } from 'http';
import { ParsedUrlQuery } from 'querystring';
export type HeaderValue = string | string[] | undefined;
export type RequestHeaders = Record<string, HeaderValue>;
export interface RequestState {
    url: string;
    method: string;
    headers: RequestHeaders;
    rawBody: Buffer;
    parsedBody?: unknown;
    query: ParsedUrlQuery;
    params: Record<string, string>;
    ip?: string;
    protocol?: string;
}
/**
 * @class Request - Make an AeroSSR Request
 */
export declare class Request {
    private readonly _raw;
    private readonly _state;
    private readonly _emitter;
    private _body;
    private _isEnded;
    constructor(raw: IncomingMessage);
    private initializeState;
    private setupEventListeners;
    private parseBody;
    on(event: 'data' | 'end' | 'error' | 'close' | 'body', listener: (...args: any[]) => void): this;
    once(event: 'data' | 'end' | 'error' | 'close' | 'body', listener: (...args: any[]) => void): this;
    off(event: 'data' | 'end' | 'error' | 'close' | 'body', listener: (...args: any[]) => void): this;
    get raw(): IncomingMessage;
    get state(): RequestState;
    getHeader(name: string): HeaderValue;
    getAllHeaders(): RequestHeaders;
    hasHeader(name: string): boolean;
    accepts(type: string): boolean;
    getBody<T = unknown>(): T;
    getQuery(): ParsedUrlQuery;
    getParams(): Record<string, string>;
    getMethod(): string;
    getPath(): string;
    getIP(): string;
    getProtocol(): string;
}
