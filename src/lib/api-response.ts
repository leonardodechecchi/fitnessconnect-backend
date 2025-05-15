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
