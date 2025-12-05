import { ServerResponse } from "http";
export interface ResponseState {
    statusCode: number;
    headers: Map<string, string | string[]>;
    body: Buffer | string | null;
    headersSent: boolean;
}
export interface Response {
    readonly raw: ServerResponse;
    readonly state: ResponseState;
    readonly sent: boolean;
    status(code: number): this;
    send(body: unknown): void;
    json(body: unknown): void;
    end(data?: string | Buffer): void;
    redirect(url: string, code?: number): void;
    setHeader(name: string, value: string | string[]): this;
    getHeader(name: string): string | string[] | undefined;
    removeHeader(name: string): this;
    hasHeader(name: string): boolean;
    type(contentType: string): this;
    attachment(filename?: string): this;
    download(path: string, filename?: string): void;
}
export declare class Response {
    private readonly _raw;
    private readonly _state;
    private readonly _emitter;
    constructor(raw: ServerResponse);
    getRaw(): ServerResponse;
    getState(): ResponseState;
    getSent(): boolean;
    on(event: 'send' | 'end', listener: (...args: any[]) => void): this;
    once(event: 'send' | 'end', listener: (...args: any[]) => void): this;
    off(event: 'send' | 'end', listener: (...args: any[]) => void): this;
}
