import type { MiddlewareFunction } from './types';

export interface RouteDefinitionData {
  method: string;
  path: string;
  pattern: RegExp;
  handlers: MiddlewareFunction[];
}
