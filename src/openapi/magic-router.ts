import { Router, type Request, type Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { apiResponseSchema } from '../lib/api-response.js';
import { validateRequest } from '../middlewares/validate-request.js';
import type { ZodObjectWithEffect } from '../types/zod.js';
import { registry } from './openapi-service.js';
import { camelCaseToTitleCase, expressToOpenAPIPath } from './openapi-utils.js';

type IDontKnow = unknown | never | any;
type MaybePromise = void | Promise<void>;
type RequestAny = Request<IDontKnow, IDontKnow, IDontKnow, IDontKnow>;
type ResponseAny = Response<IDontKnow, Record<string, unknown>>;

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

type MagicPath = `/${string}`;

type MagicMiddleware = (req: RequestAny, res: ResponseAny) => MaybePromise;

type MagicRouteP<PathSet extends boolean> = PathSet extends true
  ? [
      requestAndResponseSchema: RequestAndResponseSchema,
      ...middleware: MagicMiddleware[]
    ]
  : [
      path: MagicPath,
      requestAndResponseSchema: RequestAndResponseSchema,
      ...middleware: MagicMiddleware[]
    ];

type MagicRouteR<PathSet extends boolean> = Omit<
  MagicRouter<PathSet>,
  'route' | 'getRouter' | 'use'
>;

export type RequestSchema = {
  body?: ZodObjectWithEffect;
  params?: ZodObjectWithEffect;
  query?: ZodObjectWithEffect;
};

type RequestAndResponseSchema = {
  requestSchema?: RequestSchema;
  responseModel?: ZodTypeAny;
};

export class MagicRouter<PathSet extends boolean = false> {
  private router: Router;
  private rootRoute: string;
  private currentPath?: MagicPath;

  constructor(rootRoute: string, currentPath?: MagicPath) {
    this.router = Router();
    this.rootRoute = rootRoute;
    this.currentPath = currentPath;
  }

  private getPath(path: string) {
    return this.rootRoute + expressToOpenAPIPath(path);
  }

  private wrapper(
    method: Method,
    path: MagicPath,
    requestAndResponseSchema: RequestAndResponseSchema,
    ...middlewares: Array<MagicMiddleware>
  ): void {
    const { requestSchema, responseModel } = requestAndResponseSchema;

    const body = requestSchema?.body;
    const params = requestSchema?.params;
    const query = requestSchema?.query;
    const responseSchema = responseModel ?? apiResponseSchema;

    const handler = middlewares[middlewares.length - 1];

    const bodySchema = body
      ? registry.register(`${camelCaseToTitleCase(handler?.name)} Input`, body)
      : null;

    // TODO
    // const hasSecurity = middlewares.some(
    //   (middleware) => middleware.name === authenticateRequest.name
    // );

    registry.registerPath({
      method,
      path: this.getPath(path),
      request: {
        params,
        query,
        ...(bodySchema
          ? {
              body: { content: { 'application/json': { schema: bodySchema } } },
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

    if (Object.keys(requestSchema ?? {}).length > 0) {
      this.router[method](
        path,
        validateRequest(requestSchema ?? {}),
        ...middlewares
      );
    } else {
      this.router[method](path, ...middlewares);
    }
  }

  private routeHandler(method: Method, ...args: MagicRouteP<PathSet>) {
    if (this.currentPath) {
      const [requestAndResponseSchema, ...middlewares] = args as [
        RequestAndResponseSchema,
        ...MagicMiddleware[]
      ];

      this.wrapper(
        method,
        this.currentPath,
        requestAndResponseSchema,
        ...middlewares
      );

      return this;
    }

    const [path, requestAndResponseSchema, ...middlewares] = args as [
      MagicPath,
      RequestAndResponseSchema,
      ...MagicMiddleware[]
    ];

    this.wrapper(method, path, requestAndResponseSchema, ...middlewares);

    return this;
  }

  public get(...args: MagicRouteP<PathSet>): MagicRouteR<PathSet> {
    return this.routeHandler('get', ...args);
  }

  public post(...args: MagicRouteP<PathSet>): MagicRouteR<PathSet> {
    return this.routeHandler('post', ...args);
  }

  public put(...args: MagicRouteP<PathSet>): MagicRouteR<PathSet> {
    return this.routeHandler('put', ...args);
  }

  public patch(...args: MagicRouteP<PathSet>): MagicRouteR<PathSet> {
    return this.routeHandler('patch', ...args);
  }

  public delete(...args: MagicRouteP<PathSet>): MagicRouteR<PathSet> {
    return this.routeHandler('delete', ...args);
  }

  public use(...args: Parameters<Router['use']>) {
    this.router.use(...args);
  }
}
