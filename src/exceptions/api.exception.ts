import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends HttpException {
  code: string;

  constructor(message: string, status: HttpStatus, code: string) {
    super(message, status);
    this.code = code || 'UNSPECIFIED_ERROR';
  }

  static badRequest(message: string, code = 'BAD_REQUEST'): ApiException {
    return new ApiException(message, HttpStatus.BAD_REQUEST, code);
  }

  static notAllowed(message: string, code = 'NOT_ALLOWED'): ApiException {
    return new ApiException(message, HttpStatus.FORBIDDEN, code);
  }

  static notFound(message: string, code = 'NOT_FOUND'): ApiException {
    return new ApiException(message, HttpStatus.NOT_FOUND, code);
  }

  static unauthorized(message: string, code = 'UNAUTHORIZED'): ApiException {
    return new ApiException(message, HttpStatus.UNAUTHORIZED, code);
  }

  static serverError(message: string, code = 'SERVER_ERROR'): ApiException {
    return new ApiException(message, HttpStatus.INTERNAL_SERVER_ERROR, code);
  }

  static conflictError(message: string, code = 'CONFLICT_ERROR'): ApiException {
    return new ApiException(message, HttpStatus.CONFLICT, code);
  }
}
