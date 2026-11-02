import { AppError } from './app-error.exception';

export class BadRequestException extends AppError {
    constructor(message = 'The request is invalid.', code = 'BAD_REQUEST') {
        super(message, code, 400);
    }
}
