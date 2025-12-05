// src/router/types.ts
import { IncomingMessage, ServerResponse } from 'http';
import { Request } from '../http/Request';
import { Response } from '../http/Response';
import { RequestContextData } from '../http/';

export type NextFunction = () => Promise<void>;

export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export type ErrorHandlerFunction = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

export class Middleware {
  private middlewares: MiddlewareFunction[];

  constructor() {
    this.middlewares = [];
  }

  /**
   * Registers a middleware function to the stack.
   * @param middleware Middleware function to register.
   */
  public use(middleware: MiddlewareFunction): void {
    this.middlewares.push(middleware);
  }

  /**
   * Executes all middlewares in sequence.
   * @param context RequestContextData containing request/response data.
   * @param next Final `next` function to call after all middlewares.
   */
  public async execute(
    context: RequestContextData,
    next: NextFunction
  ): Promise<void> {
    let index = 0;

    const executeNext = async (): Promise<void> => {
      if (index >= this.middlewares.length) {
        return next(); // Call the final `next` function.
      }
      const middleware = this.middlewares[index++];
      await middleware(context.request, context.response, executeNext);
    };

    await executeNext();
  }
}
