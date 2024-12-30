import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiException } from './api.exception';
import {
  EntityNotFoundError,
  QueryFailedError,
  CustomRepositoryNotFoundError,
  TransactionNotStartedError,
} from 'typeorm';

@Catch(
  ApiException,
  EntityNotFoundError,
  QueryFailedError,
  CustomRepositoryNotFoundError,
  TransactionNotStartedError,
)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(
    exception:
      | ApiException
      | EntityNotFoundError
      | QueryFailedError
      | CustomRepositoryNotFoundError
      | TransactionNotStartedError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof ApiException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof ApiException) {
      responseBody['code'] = exception.code;
    }

    response.status(status).json(responseBody);
  }
}
