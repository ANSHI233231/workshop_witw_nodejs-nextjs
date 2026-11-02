import { timingSafeEqual } from 'node:crypto';

import type { RequestHandler } from 'express';

import { NotFoundException, UnauthenticatedException } from '../../../core/exceptions';

export const INGEST_KEY_HEADER = 'x-log-key';

const sameKey = (given: string, expected: string): boolean => {
    const left = Buffer.from(given);
    const right = Buffer.from(expected);
    return left.length === right.length && timingSafeEqual(left, right);
};

export const requireIngestKey =
    (ingestKey: string | null): RequestHandler =>
    (req, _res, next) => {
        if (!ingestKey) {
            next(new NotFoundException('This page was not found.', 'NOT_FOUND'));
            return;
        }
        const given = req.header(INGEST_KEY_HEADER);
        if (!given || !sameKey(given, ingestKey)) {
            next(new UnauthenticatedException('A valid log key is required.', 'LOG_INGEST_DENIED'));
            return;
        }
        next();
    };
