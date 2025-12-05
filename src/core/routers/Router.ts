import { Middleware } from './Middleware';
import { ErrorHandler } from './ErrorHandler';

export class Router {
  private routes: Map<string, RouteDefinitionData>;
  private middleware: Middleware;
  private errorHandler: ErrorHandler;

  constructor() {
    this.routes = new Map();
    this.middleware = new Middleware();
    this.errorHandler = new ErrorHandler();
  }

  public use(middleware: MiddlewareFunction): this {
    this.middleware.use(middleware);
    return this;
  }

  public onError(handler: ErrorHandlerFunction): this {
    this.errorHandler.use(handler);
    return this;
  }

  public route(method: string, path: string, ...handlers: MiddlewareFunction[]): this {
    const pattern = pathToRegexp(path);
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, { method: method.toUpperCase(), path, pattern, handlers });
    return this;
  }

  public async handle(request: Request, response: Response): Promise<void> {
    const context = RequestHandlerFunctions.createRequestContext(request.raw, response.raw);

    try {
      // Execute global middleware
      await this.middleware.execute(context, async () => {
        // Match and handle route
        const match = RouterFunctions.matchRoute(
          { routes: this.routes, middlewares: [], errorHandlers: [] },
          request
        );

        if (match) {
          context.params = new Map(Object.entries(match.params));
          await this.middleware.execute(context, async () => {
            for (const handler of match.route.handlers) {
              await handler(context.request, context.response, async () => {});
            }
          });
        } else {
          context.response.status(404).json({ error: 'Not Found' });
        }
      });
    } catch (error) {
      await this.errorHandler.handle(error as Error, context);
    }
  }
}
