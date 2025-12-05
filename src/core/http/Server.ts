import { createServer, Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import { AddressInfo } from 'net';
import { EventEmitter } from 'events';
import { Request } from './Request';
import { Response } from './Response';
import { ServerData, ServerState, ServerConfig, RouteDefinitionData, MiddlewareFunction, ErrorHandlerFunction } from './http';

// Server class
export class Server {
  private readonly data: ServerData;
  private readonly state: ServerState;
  private server: HttpServer | null = null;
  private readonly emitter: EventEmitter;

  constructor(config: ServerConfig = {}) {
    // Initialize data structure
    this.data = {
      port: config.port ?? 3000,
      host: config.host ?? 'localhost',
      routes: new Map(),
      middlewares: config.middleware ?? [],
      errorHandlers: []
    };

    // Initialize state
    this.state = {
      isRunning: false,
      connections: new Set(),
      lastError: null
    };

    this.emitter = new EventEmitter();
    this.setupServer();
  }

  private setupServer(): void {
    this.server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      const request = new Request(req);
      const response = new Response(res);

      try {
        await this.handleRequest(request, response);
      } catch (error) {
        await this.handleError(error as Error, request, response);
      }
    });

    this.server.on('connection', (socket) => {
      const id = `${socket.remoteAddress}:${socket.remotePort}`;
      this.state.connections.add(id);
      
      socket.on('close', () => {
        this.state.connections.delete(id);
      });
    });

    this.server.on('error', (error) => {
      this.state.lastError = error;
      this.emitter.emit('error', error);
    });
  }

  private async handleRequest(req: Request, res: Response): Promise<void> {
    // Execute middleware chain
    for (const middleware of this.data.middlewares) {
      await middleware(req, res, async () => {
        // Next function implementation
      });
    }

    // Handle route
    const route = this.findRoute(req);
    if (route) {
      for (const handler of route.handlers) {
        await handler(req, res, async () => {
          // Next function implementation
        });
      }
    } else {
      res.status(404).json({ error: 'Not Found' });
    }
  }

  private findRoute(req: Request): RouteDefinitionData | undefined {
    const key = `${req.getMethod()}:${req.getPath()}`;
    return this.data.routes.get(key);
  }

  private async handleError(error: Error, req: Request, res: Response): Promise<void> {
    for (const handler of this.data.errorHandlers) {
      try {
        await handler(error, req, res, async () => {
          // Next function implementation
          
        });
        return;
      } catch (err) {
        continue;
      }
    }

    // Default error handler
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Public API
  public async start(): Promise<AddressInfo> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        reject(new Error('Server not initialized'));
        return;
      }

      this.server.listen(this.data.port, this.data.host, () => {
        this.state.isRunning = true;
        const addr = this.server?.address() as AddressInfo;
        resolve(addr);
      });
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server || !this.state.isRunning) {
        reject(new Error('Server not running'));
        return;
      }

      this.server.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        this.state.isRunning = false;
        resolve();
      });
    });
  }

  public use(middleware: MiddlewareFunction): this {
    this.data.middlewares.push(middleware);
    return this;
  }

  public onError(handler: ErrorHandlerFunction): this {
    this.data.errorHandlers.push(handler);
    return this;
  }

  public addRoute(method: string, path: string, ...handlers: MiddlewareFunction[]): this {
    const key = `${method.toUpperCase()}:${path}`;
    this.data.routes.set(key, {
      method: method.toUpperCase(),
      path,
      pattern: new RegExp(path),
      handlers
    });
    return this;
  }

  // Event listeners
  public on(event: 'error' | 'start' | 'stop', listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  public off(event: 'error' | 'start' | 'stop', listener: (...args: any[]) => void): this {
    this.emitter.off(event, listener);
    return this;
  }

  // State accessors
  public isRunning(): boolean {
    return this.state.isRunning;
  }

  public getConnections(): string[] {
    return Array.from(this.state.connections);
  }

  public getLastError(): Error | null {
    return this.state.lastError;
  }
}