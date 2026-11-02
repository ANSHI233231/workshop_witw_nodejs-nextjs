import { AppError } from './app-error.exception';

export class NotFoundException extends AppError {
    constructor(message: string, code: string) {
        super(message, code, 404);
    }

    /** `forResource('user')` → `USER_NOT_FOUND` / "User not found." */
    static forResource(resourceName: string): NotFoundException {
        const trimmed = resourceName.trim();
        const code = `${trimmed.toUpperCase().replace(/[\s-]+/g, '_')}_NOT_FOUND`;
        const message = `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)} not found.`;
        return new NotFoundException(message, code);
    }
}
