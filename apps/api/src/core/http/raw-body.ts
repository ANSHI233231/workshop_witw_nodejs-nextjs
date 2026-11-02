import type { IncomingMessage } from 'node:http';

const rawBodies = new WeakMap<IncomingMessage, Buffer>();

export const keepRawBody = (req: IncomingMessage, _res: unknown, body: Buffer): void => {
    rawBodies.set(req, body);
};

export const rawBodyOf = (req: IncomingMessage): Buffer => rawBodies.get(req) ?? Buffer.alloc(0);
