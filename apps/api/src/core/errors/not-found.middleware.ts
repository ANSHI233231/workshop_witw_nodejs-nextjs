import type { Request, Response } from 'express';

import { failed } from '../http';

/** The fall-through after every router: an unknown path gets the envelope, not Express's HTML page. */
export const notFoundHandler = (req: Request, res: Response): void => {
    failed(res, 404, `Route ${req.method} ${req.path} not found.`, 'ENDPOINT_NOT_FOUND', {
        requestId: req.requestId,
    });
};
