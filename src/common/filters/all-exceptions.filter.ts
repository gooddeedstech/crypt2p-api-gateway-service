import {
  ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception instanceof RpcException) {
      const err = exception.getError() as any;
      const message = typeof err === 'string' ? err : err?.message || 'Microservice error';
      const status = (err?.status && Number(err.status)) || HttpStatus.BAD_GATEWAY;
      this.logger.error(`RPC → ${message}`);
      return response.status(status).json({
        statusCode: status,
        message,
        status: 'error',
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res: any = exception.getResponse();
      const message = typeof res === 'string' ? res : res?.message || exception.message;
      this.logger.error(`HTTP → ${message}`);
      return response.status(status).json({
        statusCode: status,
        message,
        status: 'error',
      });
    }

    this.logger.error(`UNHANDLED → ${String(exception)}`);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: 500,
      message: 'Internal server error',
      status: 'error',
    });
  }
}
  