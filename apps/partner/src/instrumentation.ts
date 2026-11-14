// Server-side logging (Node.js runtime): Next.js calls `register` once when the server starts,
// and `onRequestError` for every server error it catches. See src/lib/logger.

import type { Instrumentation } from 'next';

export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;
    const { installServerLogging } = await import('./lib/logger/server/install');
    installServerLogging();
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
    if (process.env.NEXT_RUNTIME !== 'nodejs') return;
    const { logRequestError } = await import('./lib/logger/server/request-error');
    logRequestError(error, request, context);
};
