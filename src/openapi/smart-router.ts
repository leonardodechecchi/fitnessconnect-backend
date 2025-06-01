import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from 'express';
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
import {
  camelCaseToTitleCase,
  expressToOpenAPIPath,
  routeToClassName,
} from '../utils/openapi.js';
import { registry } from './openapi-service.js';

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

  private wrapper(method: SmartMethod, ...args: SmartRouteParameters) {
    const [path, schemas, ...middlewares] = args;

    const requestSchemas = schemas.request ?? {};
    const responseSchema =
      schemas.response instanceof ZodArray
        ? defineSuccessPaginatedResponse(schemas.response)
        : defineSuccessResponse(schemas.response);

    const handler = middlewares[middlewares.length - 1];

    const openAPIPath = this.rootPath + expressToOpenAPIPath(path);
    const entityName = routeToClassName(this.rootPath);
    const title = camelCaseToTitleCase(handler?.name);

    if (requestSchemas.body) {
      registry.register(`${title} Input`, requestSchemas.body);
    }

    registry.registerPath({
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
