// Every EXPECTED failure is thrown as a subclass of this, and only `core/errors`' handler turns
// one into a response. Anything reaching that handler that is NOT an AppError is a bug or an
// outage, and is answered with a generic 500 that reveals nothing.

export abstract class AppError extends Error {
    /**
     * SCREAMING_SNAKE_CASE, resource-prefixed where specific (`USER_NOT_FOUND`).
     * Frontends branch on this, never on `message`: message text may change, a code may not.
     */
    public readonly code: string;

    public readonly httpStatus: number;

    protected constructor(message: string, code: string, httpStatus: number) {
        super(message);
        this.name = new.target.name;
        this.code = code;
        this.httpStatus = httpStatus;
    }
}
