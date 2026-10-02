import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiException } from '../exceptions/api.exception';
import { ErrorCode } from '../exceptions/error-codes.enum';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code: string = ErrorCode.INTERNAL_ERROR;
    let details = null;

    if (exception instanceof ApiException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = res.message;
      code = res.code;
      details = res.details;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse() as any;
      message = typeof res === 'string' ? res : res.message || res.error;
      code = status === 400 ? ErrorCode.VALIDATION_ERROR : ErrorCode.INTERNAL_ERROR;
      details = typeof res === 'object' && res.message ? res.message : null;
    } else {
      console.error(exception);
    }

    const requestId = request.headers['x-request-id'] || 'req_' + Math.random().toString(36).substring(7);

    const errorResponse = {
      success: false,
      code,
      message,
      requestId,
      details,
    };

    Logger.error(`[${request.method}] ${request.url} - ${status} - ${message}`, exception instanceof Error ? exception.stack : String(exception));

    response.status(status).json(errorResponse);
  }
}
