import { Request } from '../http/Request';
import { Response } from '../http/Response';
export type NextFunction = (error?: Error) => Promise<void>;
export type ErrorHandler = (error: Error) => Promise<void>;
export type RequestHandler = (req: Request, res: Response) => Promise<void>;
export type MiddlewareHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export type ErrorMiddlewareHandler = (error: Error, req: Request, res: Response, next: NextFunction) => Promise<void>;
export type Middleware = {
    (error: Error): Promise<void>;
    (req: Request, res: Response): Promise<void>;
    (req: Request, res: Response, next: NextFunction): Promise<void>;
    (error: Error, req: Request, res: Response, next: NextFunction): Promise<void>;
};
export declare class MiddlewareFactory {
    private static wrapErrorHandler;
    private static wrapRequestHandler;
    private static wrapMiddlewareHandler;
    private static wrapErrorMiddlewareHandler;
    static create(handler: ErrorHandler | RequestHandler | MiddlewareHandler | ErrorMiddlewareHandler): Middleware;
    private static isErrorHandler;
    private static isRequestHandler;
    private static isMiddlewareHandler;
    private static isErrorMiddlewareHandler;
}
export declare function ErrorMiddleware(): MethodDecorator;
export declare function RequestMiddleware(): MethodDecorator;
export declare function Middleware(): MethodDecorator;
export declare class ExampleMiddleware {
    handleError(error: Error): Promise<void>;
    handleRequest(req: Request, res: Response): Promise<void>;
    process(req: Request, res: Response, next: NextFunction): Promise<void>;
}
