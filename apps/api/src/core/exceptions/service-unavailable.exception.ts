import { AppError } from './app-error.exception';

export class ServiceUnavailableException extends AppError {
    constructor(message = 'The service is temporarily unavailable.', code = 'SERVICE_UNAVAILABLE') {
        super(message, code, 503);
    }
}
