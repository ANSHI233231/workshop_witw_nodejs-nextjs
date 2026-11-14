import type { Request, Response } from 'express';

import type { QuoteRequestParams } from '../validators/quote-request.validators';

type SignedInUser = { readonly id: number };

export const signedInUserId = (res: Response): number => (res.locals['authUser'] as SignedInUser).id;

export const idOf = (req: Request): number => (req.params as unknown as QuoteRequestParams).id;
