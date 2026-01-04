import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    const path = request.url;

    // Default values for non-HttpException errors
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] = 'Unexpected error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const resBody = exception.getResponse() as any;

      // Nest can return string | object with message
      if (typeof resBody === 'string') {
        message = resBody;
        error = exception.name;
      } else {
        message = resBody.message ?? exception.message;
        error = resBody.error ?? exception.name ?? error;
      }
    }

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      path,
      timestamp,
    });
  }
}
