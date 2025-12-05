import { RequestContextData } from "../http/http";
import { ErrorHandlerFunction } from "./Middleware";

export class ErrorHandler {
    private errorHandlers: ErrorHandlerFunction[];
  
    constructor() {
      this.errorHandlers = [];
    }
  
    public use(handler: ErrorHandlerFunction): void {
      this.errorHandlers.push(handler);
    }
  
    public async handle(
      error: Error,
      context: RequestContextData
    ): Promise<void> {
      for (const handler of this.errorHandlers) {
        try {
          await handler(
            error,
            context.request,
            context.response,
            async () => {
              // Allow chaining error handlers
            }
          );
          return;
        } catch (err) {
          // Ignore and move to the next error handler
        }
      }
  
      // Default error handling
      context.response.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  