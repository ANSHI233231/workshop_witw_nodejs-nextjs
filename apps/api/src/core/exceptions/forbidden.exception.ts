import { AppError } from './app-error.exception';

export class ForbiddenException extends AppError {
    constructor(message = 'You do not have permission to do this.', code = 'FORBIDDEN') {
        super(message, code, 403);
    }
}
