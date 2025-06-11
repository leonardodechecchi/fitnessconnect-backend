import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';

export interface ResponseExtended extends Response {
  jsonValidate: Response['json'];
  sendValidate: Response['send'];
}

export const validateResponse =
  (schema: ZodTypeAny) =>
  async (_: Request, res: Response, next: NextFunction) => {
    const json = res.json;
    const send = res.send;

    (res as ResponseExtended).jsonValidate = function (body) {
      if (res.statusCode >= 400) {
        return json.call(this, body);
      }

      const { success, data, error } = schema.safeParse(body);
      if (!success) {
        throw new Error(error.toString());
      }

      return json.call(this, data);
    };

    (res as ResponseExtended).sendValidate = function (body) {
      if (res.statusCode >= 400) {
        return send.call(this, body);
      }

      const { success, data, error } = schema.safeParse(body);
      if (!success) {
        throw new Error(error.toString());
      }

      return send.call(this, data);
    };

    return next();
  };
