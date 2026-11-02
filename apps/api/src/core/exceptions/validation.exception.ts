import { AppError } from './app-error.exception';

export type FieldError = {
    readonly field: string;
    readonly message: string;
};

export class ValidationException extends AppError {
    constructor(
        message = 'Validation failed.',
        public readonly errors: ReadonlyArray<FieldError> = [],
        code = 'VALIDATION_FAILED',
    ) {
        super(message, code, 422);
    }
}
