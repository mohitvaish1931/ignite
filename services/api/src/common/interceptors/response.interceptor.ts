import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

@Injectable()
export class ResponseInterceptor<T> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return (next.handle() as any).pipe(
      map(data => {
        // If data is already in the standardized format, return it
        if (data && typeof data === 'object' && 'success' in data && 'message' in data) {
          return data;
        }

        return {
          success: true,
          message: 'Success',
          data: data,
        };
      })
    ) as any;
  }
}
