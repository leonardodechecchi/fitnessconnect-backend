import type { Response } from 'express';
import { z } from 'zod';

export class ApiResponse<T = any> {
  readonly code: number;
  readonly data: T;
  readonly success: boolean;
  readonly message: string;

  private constructor(code: number, data: T, message: string = 'Success') {
    this.code = code;
    this.data = data;
    this.success = code < 400;
    this.message = message;
  }

  toJSON() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
    };
  }

  static ok<T>(data: T, message: string = 'OK') {
    return new ApiResponse<T>(200, data, message);
  }

  static created<T>(data: T, message: string = 'Created') {
    return new ApiResponse<T>(201, data, message);
  }

  static noContent(message: string = 'No Content') {
    return new ApiResponse(200, null, message);
  }
}

const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.unknown(),
  timestamp: z.string(),
});

type SuccessResponseSchema = z.infer<typeof successResponseSchema>;

export const defineSuccessResponseSchema = <T extends z.ZodTypeAny>(
  schema?: T
) => {
  return successResponseSchema.extend({
    data: schema ?? z.record(z.string(), z.any()),
  });
};

const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  code: z.string(),
  details: z.any().optional(),
  timestamp: z.string(),
});

type ErrorResponseSchema = z.infer<typeof errorResponseSchema>;

const paginatedResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().optional(),
  data: z.array(z.unknown()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
  timestamp: z.string(),
});

type PaginatedResponseSchema = z.infer<typeof paginatedResponseSchema>;

export const definePaginatedResponseSchema = <T extends z.ZodTypeAny>(
  schema: T
) => {
  return paginatedResponseSchema.extend({ data: schema });
};

export class ApiResponse2 {
  #response: Response;

  private constructor(response: Response) {
    this.#response = response;
  }

  static from(response: Response) {
    return new ApiResponse2(response);
  }

  ok<T>(data: T, message: string = 'OK') {
    const response: SuccessResponseSchema = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(200).json(response);
  }

  created<T>(data: T, message: string = 'Created') {
    return this.#response.status(201).json({ success: true, message, data });
  }

  paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'OK'
  ) {
    const response: PaginatedResponseSchema = {
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(200).json(response);
  }

  unauthorized(code: string, message: string = 'Unauthorized') {
    const response: ErrorResponseSchema = {
      success: false,
      message,
      code,
      timestamp: new Date().toISOString(),
    };

    return this.#response.status(401).json(response);
  }
}
