
export interface RequestContextData {
  request: Request;
  response: Response;
  state: Map<string, unknown>;
  params: Map<string, string>;
  query: Map<string, string>;
  request: Request;
  response: Response;
}

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
};

// Data structures
export interface RouteDefinitionData {
  method: string;
  path: string;
  pattern: RegExp;
  handlers: Array<MiddlewareFunction>;
}

export interface ServerData {
  port: number;
  host: string;
  routes: Map<string, RouteDefinitionData>;
  middlewares: MiddlewareFunction[];
  errorHandlers: ErrorHandlerFunction[];
}

export interface ServerState {
  isRunning: boolean;
  connections: Set<string>;
  lastError: Error | null;
}

export interface ServerConfig {
  port?: number;
  host?: string;
  middleware?: MiddlewareFunction[];
}

export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: () => Promise<void>
) => Promise<void>;

export type ErrorHandlerFunction = (
  error: Error,
  req: Request,
  res: Response,
  next: () => Promise<void>
) => Promise<void>;


export interface ResponseState {
    statusCode: number;
    headers: Map<string, string | string[]>;
    body: Buffer | string | null;
    headersSent: boolean;
};

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