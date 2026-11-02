import { AppError } from './app-error.exception';

export class UnauthenticatedException extends AppError {
    constructor(message = 'Authentication is required.', code = 'UNAUTHENTICATED') {
        super(message, code, 401);
    }
}
