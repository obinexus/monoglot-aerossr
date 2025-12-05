import type { Request } from './Request';
import type { Response } from './Response';

export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: () => Promise<void>
) => Promise<void>;

export type ErrorHandlerFunction = (
  err: Error,
  req: Request,
  res: Response,
  next: () => Promise<void>
) => Promise<void>;
