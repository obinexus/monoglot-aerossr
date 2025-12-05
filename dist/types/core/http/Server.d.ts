import { AddressInfo } from 'net';
import { Request } from './Request';
import { Response } from './Response';
interface ServerConfig {
    port?: number;
    host?: string;
    middleware?: MiddlewareFunction[];
}
type MiddlewareFunction = (req: Request, res: Response, next: () => Promise<void>) => Promise<void>;
type ErrorHandlerFunction = (error: Error, req: Request, res: Response, next: () => Promise<void>) => Promise<void>;
export declare class Server {
    private readonly data;
    private readonly state;
    private server;
    private readonly emitter;
    constructor(config?: ServerConfig);
    private setupServer;
    private handleRequest;
    private findRoute;
    private handleError;
    start(): Promise<AddressInfo>;
    stop(): Promise<void>;
    use(middleware: MiddlewareFunction): this;
    onError(handler: ErrorHandlerFunction): this;
    addRoute(method: string, path: string, ...handlers: MiddlewareFunction[]): this;
    on(event: 'error' | 'start' | 'stop', listener: (...args: any[]) => void): this;
    off(event: 'error' | 'start' | 'stop', listener: (...args: any[]) => void): this;
    isRunning(): boolean;
    getConnections(): string[];
    getLastError(): Error | null;
}
export {};
