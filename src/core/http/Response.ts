import { ServerResponse } from "http";
import { EventEmitter } from 'events';
import { IncomingMessage } from 'http';
import { ParsedUrlQuery } from 'querystring';
import tls from 'tls';
import fs from 'fs/promises';
import { ResponseState } from "./http";



export class Response {
  private readonly _raw: ServerResponse;
  private readonly _state: ResponseState;
  private readonly _emitter: EventEmitter;

  constructor(raw: ServerResponse) {
    this._raw = raw;
    this._emitter = new EventEmitter();
    this._state = {
      statusCode: 200,
      headers: new Map(),
      body: null,
      headersSent: false
    };
  }

  getRaw(): ServerResponse {
    return this._raw;
  }

  getState(): ResponseState {
    return { ...this._state };
  }

  getSent(): boolean {
    return this._state.headersSent;
  }

  public status(code: number): this {
    this._state.statusCode = code;
    return this;
  }

  public send(body: unknown): void {
    if (this._state.headersSent) return;
    this._state.body = body as string | Buffer | null;
    this._raw.statusCode = this._state.statusCode;
    this._state.headers.forEach((value, name) => {
      this._raw.setHeader(name, value);
    });
    this._raw.end(body);
    this._state.headersSent = true;
    this._emitter.emit('send', body);
  }

  public json(body: unknown): void {
    this.type('application/json');
    this.send(JSON.stringify(body));
  }

  public end(data?: string | Buffer): void {
    if (this._state.headersSent) return;
    this._raw.end(data);
    this._state.headersSent = true;
    this._emitter.emit('end', data);
  }

  public redirect(url: string, code: number = 302): void {
    this.status(code);
    this.setHeader('Location', url);
    this.end();
  }

  public setHeader(name: string, value: string | string[]): this {
    this._state.headers.set(name.toLowerCase(), value);
    return this;
  }

  public getHeader(name: string): string | string[] | undefined {
    return this._state.headers.get(name.toLowerCase());
  }

  public removeHeader(name: string): this {
    this._state.headers.delete(name.toLowerCase());
    return this;
  }

  public hasHeader(name: string): boolean {
    return this._state.headers.has(name.toLowerCase());
  }

  public type(contentType: string): this {
    this.setHeader('Content-Type', contentType);
    return this;
  }

  public attachment(filename?: string): this {
    if (filename) {
      this.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else {
      this.setHeader('Content-Disposition', 'attachment');
    }
    return this;
  }

  public async download(path: string, filename?: string): Promise<void> {
    // Convert to blob using fs.readFile and URL.createObjectURL
    // Send blob as response
    // Set Content-Disposition header to attachment; filename="filename"
    const data = await fs.readFile(path);
    this.attachment(filename);
    this.send(data);
  }

  public on(event: 'send' | 'end', listener: (...args: any[]) => void): this {
    this._emitter.on(event, listener);
    return this;
  }

  public once(event: 'send' | 'end', listener: (...args: any[]) => void): this {
    this._emitter.once(event, listener);
    return this;
  }

  public off(event: 'send' | 'end', listener: (...args: any[]) => void): this {
    this._emitter.off(event, listener);
    return this;
  }
}