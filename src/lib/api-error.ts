type ApiErrorResponse = {
  success: false;
  error: {
    code: number;
    message: string;
    details?: any[];
  };
};

export class ApiError extends Error {
  readonly code: number;
  readonly details?: any[];

  constructor(code: number, message: string, details?: any[]) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ApiErrorResponse {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        ...(this.details ?? { details: this.details }),
      },
    };
  }

  static badRequest(message: string = 'Bad Request', details?: any[]) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message: string = 'Unauthorized', details?: any[]) {
    return new ApiError(401, message, details);
  }

  static forbidden(message: string = 'Forbidden', details?: any[]) {
    return new ApiError(403, message, details);
  }

  static notFound(message: string = 'Not Found', details?: any[]) {
    return new ApiError(404, message, details);
  }

  static conflict(message: string = 'Conflict', details?: any[]) {
    return new ApiError(409, message, details);
  }

  static internalError(
    message: string = 'Internal Server Error',
    details?: any[]
  ) {
    return new ApiError(500, message, details);
  }

  static serviceUnavailable(
    message: string = 'Service Unavailable',
    details?: any[]
  ) {
    return new ApiError(503, message, details);
  }
}
