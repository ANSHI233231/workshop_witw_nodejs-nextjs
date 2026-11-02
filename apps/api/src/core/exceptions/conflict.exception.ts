import { AppError } from './app-error.exception';

export class ConflictException extends AppError {
    constructor(message: string, code = 'CONFLICT') {
        super(message, code, 409);
    }
}
