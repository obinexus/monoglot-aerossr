import { EventEmitter } from 'events';
import { IncomingMessage } from 'http';
import { ParsedUrlQuery } from 'querystring';
import tls from 'tls';
import type { RequestState, RequestHeaders, HeaderValue } from './http.d';

/**
 * @class Request - Make an AeroSSR Request 
 */
export class Request {
  private readonly _raw: IncomingMessage;
  private readonly _state: RequestState;
  private readonly _emitter: EventEmitter;
  private _body: Buffer;
  private _isEnded: boolean = false;

  constructor(raw: IncomingMessage) {
    this._raw = raw;
    this._emitter = new EventEmitter();
    this._body = Buffer.alloc(0);
    this._state = this.initializeState(raw);
    this.setupEventListeners();
  }

  private initializeState(raw: IncomingMessage): RequestState {
    return {
      url: raw.url || '/',
      method: raw.method || 'GET',
      headers: raw.headers as RequestHeaders,
      rawBody: Buffer.alloc(0),
      query: {},
      params: {},
      ip: raw.socket?.remoteAddress,
      protocol: raw.socket instanceof tls.TLSSocket ? 'https' : 'http'
    };
  }

  private setupEventListeners(): void {
    this._raw.on('data', (chunk: Buffer) => {
      this._body = Buffer.concat([this._body, chunk]);
      this._state.rawBody = this._body;
      this._emitter.emit('data', chunk);
    });

    this._raw.on('end', () => {
      this._isEnded = true;
      this.parseBody();
      this._emitter.emit('end', this._state.parsedBody);
    });

    this._raw.on('error', (error: Error) => {
      this._emitter.emit('error', error);
    });

    this._raw.on('close', () => {
      this._emitter.emit('close');
    });
  }

  private parseBody(): void {
    const contentType = this.getHeader('content-type');
    
    try {
      if (typeof contentType === 'string') {
        if (contentType.includes('application/json')) {
          this._state.parsedBody = JSON.parse(this._body.toString());
          this._emitter.emit('body', this._state.parsedBody);
        } else if (contentType.includes('application/x-www-form-urlencoded')) {
          const urlSearchParams = new URLSearchParams(this._body.toString());
          this._state.parsedBody = Object.fromEntries(urlSearchParams);
          this._emitter.emit('body', this._state.parsedBody);
        }
      }
    } catch (error) {
      this._emitter.emit('error', new Error(`Failed to parse body: ${(error as Error).message}`));
    }
  }

  public on(event: 'data' | 'end' | 'error' | 'close' | 'body', listener: (...args: any[]) => void): this {
    this._emitter.on(event, listener);
    
    // If the request has already ended, immediately emit end and body events
    if (this._isEnded && (event === 'end' || event === 'body')) {
      process.nextTick(() => {
        if (event === 'end') {
          listener(this._state.parsedBody);
        } else if (event === 'body' && this._state.parsedBody) {
          listener(this._state.parsedBody);
        }
      });
    }
    
    return this;
  }

  public once(event: 'data' | 'end' | 'error' | 'close' | 'body', listener: (...args: any[]) => void): this {
    this._emitter.once(event, listener);
    
    // Handle late subscription for ended requests
    if (this._isEnded && (event === 'end' || event === 'body')) {
      process.nextTick(() => {
        if (event === 'end') {
          listener(this._state.parsedBody);
        } else if (event === 'body' && this._state.parsedBody) {
          listener(this._state.parsedBody);
        }
      });
    }
    
    return this;
  }

  public off(event: 'data' | 'end' | 'error' | 'close' | 'body', listener: (...args: any[]) => void): this {
    this._emitter.off(event, listener);
    return this;
  }

  get raw(): IncomingMessage {
    return this._raw;
  }

  get state(): RequestState {
    return { ...this._state };
  }

  public getHeader(name: string): HeaderValue {
    return this._state.headers[name.toLowerCase()];
  }

  public getAllHeaders(): RequestHeaders {
    return { ...this._state.headers };
  }

  public hasHeader(name: string): boolean {
    return name.toLowerCase() in this._state.headers;
  }

  public accepts(type: string): boolean {
    const acceptHeader = this.getHeader('accept');
    if (!acceptHeader) return false;
    const accepts = Array.isArray(acceptHeader)
      ? acceptHeader.join(',').split(',')
      : acceptHeader.split(',');
    return accepts.some(t => t.trim().toLowerCase() === type.toLowerCase());
  }

  public getBody<T = unknown>(): T {
    return this._state.parsedBody as T;
  }

  public getQuery(): ParsedUrlQuery {
    return { ...this._state.query };
  }

  public getParams(): Record<string, string> {
    return { ...this._state.params };
  }

  public getMethod(): string {
    return this._state.method;
  }

  public getPath(): string {
    return this._state.url;
  }

  public getIP(): string {
    return this._state.ip || '';
  }

  public getProtocol(): string {
    return this._state.protocol || 'http';
  }
}