import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // ✅ Determine HTTP status
    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;
    let errorResponse: any;

    // ✅ Handle HttpException (includes UnauthorizedException, BadRequestException, etc.)
    if (exception instanceof HttpException) {
      errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        // e.g. "Unauthorized"
        message = errorResponse;
      } else if (Array.isArray((errorResponse as any)?.message)) {
        // e.g. ValidationPipe returns an array
        message = (errorResponse as any).message.join(', ');
      } else {
        // 👇 this is the important fix — cast to any
        const errObj = errorResponse as Record<string, any>;
        message = errObj?.message || exception.message || 'Internal server error';
      }
    }

    // ✅ Handle RpcException (microservice errors)
    else if (exception instanceof RpcException) {
      const rpcError = exception.getError() as any;
      message =
        typeof rpcError === 'string'
          ? rpcError
          : rpcError?.message || 'Microservice error';
      status = rpcError?.statusCode || HttpStatus.BAD_GATEWAY;
    }

    // ✅ Handle generic errors
    else {
      message = exception.message || 'Internal server error';
      errorResponse = { message };
    }

    // 🔎 Replace generic Unauthorized message if needed
    if (message === 'Unauthorized') {
      message = 'User not authenticated. Please log in again.';
    }

    // 🧾 Log cleanly
    this.logger.error(
      `[${request.method}] ${request.url} → ${message}`,
      exception.stack,
    );

    // ✅ Unified response
    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}