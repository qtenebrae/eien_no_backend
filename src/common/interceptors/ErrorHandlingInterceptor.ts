import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	HttpException,
	InternalServerErrorException
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { KeycloakError } from '../errors/keycloak-error';

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		return next.handle().pipe(
			catchError((error) => {
				if (error instanceof KeycloakError) {
					return throwError(() => new HttpException(error.message, error.status));
				}
				return throwError(() => new InternalServerErrorException());
			})
		);
	}
}
