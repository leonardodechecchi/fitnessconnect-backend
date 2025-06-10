import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
import pluralize from 'pluralize';
import {
  ZodArray,
  ZodSchema,
  type AnyZodObject,
  type ZodEffects,
  type ZodTypeAny,
} from 'zod';
import { validateRequest } from '../middlewares/validate-request.js';
import {
  defineSuccessPaginatedResponse,
  defineSuccessResponse,
} from '../modules/common/common-utils.js';
import { openAPIRegistry } from './openapi-service.js';

type ZodObjectWithEffect =
  | AnyZodObject
  | ZodEffects<ZodObjectWithEffect, unknown, unknown>;

type SmartPath = `/${string}`;

type SmartMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type ValidationSchemas = {
  request?: {
    params?: ZodObjectWithEffect;
    query?: ZodObjectWithEffect;
    body?: ZodSchema;
  };
  response?: ZodTypeAny;
};

type SmartRouteParameters = [
  path: SmartPath,
  schemas: ValidationSchemas,
  ...middlewares: SmartMiddleware[]
];

type SmartMiddleware = (
  req: RequestAny,
  res: ResponseAny,
  next: NextFunction
) => any | Promise<any>;

type SmartRouterOptions = {
  mergeParams?: boolean;
};

type IDontKnow = unknown | never | any;
type RequestAny = Request<IDontKnow, IDontKnow, IDontKnow, IDontKnow>;
type ResponseAny = Response<IDontKnow, Record<string, unknown>>;

export class SmartRouter {
  readonly router: Router;
  readonly rootPath: SmartPath;

  constructor(rootPath: SmartPath) {
    this.router = Router();
    this.rootPath = rootPath;
  }

  // Converte un percorso Express con parametri (es. /user/:id) in formato OpenAPI (/user/{id})
  // Esempio: "/user/:id/orders/:orderId" → "/user/{id}/orders/{orderId}"
  private expressToOpenAPIPath(route: string): string {
    return route.replace(/\/:(\w+)/g, '/{$1}');
  }

  /**
   * Converte un percorso (es. /users/) in un nome di classe in PascalCase al singolare
   * Esempio: "/users/" → "User"
   */
  private routeToClassName(): string {
    const route = this.rootPath;

    const cleanedRoute = route.replace(/^\/|\/$/g, '').toLocaleLowerCase();
    const singular = pluralize.singular(cleanedRoute);
    return singular.charAt(0).toUpperCase() + singular.slice(1);
  }

  /**
   * Converte una stringa in camelCase in Title Case separato da spazi
   * Esempio: "userName" → "User Name"
   */
  private camelCaseToTitleCase(input: string): string {
    let titleCase = input
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();

    return titleCase;
  }

  private wrapper(method: SmartMethod, ...args: SmartRouteParameters) {
    const [path, schemas, ...middlewares] = args;

    const requestSchemas = schemas.request ?? {};
    const responseSchema =
      schemas.response instanceof ZodArray
        ? defineSuccessPaginatedResponse(schemas.response)
        : defineSuccessResponse(schemas.response);

    const handler = middlewares[middlewares.length - 1];
    if (!handler) throw new Error('Router handler not provided');

    const openAPIPath = this.expressToOpenAPIPath(this.rootPath + path);
    const entityName = this.routeToClassName();
    const title = this.camelCaseToTitleCase(handler.name);

    if (requestSchemas.body) {
      openAPIRegistry.register(`${title} Input`, requestSchemas.body);
    }

    openAPIRegistry.registerPath({
      method,
      path: openAPIPath,
      tags: [entityName],
      description: title,
      summary: title,
      request: {
        params: requestSchemas.params,
        query: requestSchemas.query,
        ...(requestSchemas.body
          ? {
              body: {
                content: {
                  'application/json': { schema: requestSchemas.body },
                },
              },
            }
          : {}),
      },
      responses: {
        200: {
          description: '',
          content: {
            'application/json': {
              schema: responseSchema,
            },
          },
        },
      },
    });

    Object.keys(requestSchemas).length > 0
      ? this.router[method](
          path,
          validateRequest(requestSchemas),
          ...middlewares
        )
      : this.router[method](path, ...middlewares);
  }

  use(...middlewares: SmartMiddleware[]) {
    this.router.use(...middlewares);
  }

  get(...args: SmartRouteParameters) {
    this.wrapper('get', ...args);
  }

  post(...args: SmartRouteParameters) {
    this.wrapper('post', ...args);
  }

  put(...args: SmartRouteParameters) {
    this.wrapper('put', ...args);
  }

  patch(...args: SmartRouteParameters) {
    this.wrapper('patch', ...args);
  }

  delete(...args: SmartRouteParameters) {
    this.wrapper('delete', ...args);
  }
}
