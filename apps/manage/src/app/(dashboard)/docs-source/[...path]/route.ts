import { consoleSession } from '@/lib/console-session';
import { mayOpenArea } from '@/lib/console-access';
import { readDocSource } from '@/lib/docs/docs-files';

export const runtime = 'nodejs';

const NOT_FOUND = () => new Response('Not found', { status: 404 });

const docPathOf = (segments: readonly string[]): string | null => {
    try {
        return segments.map((segment) => decodeURIComponent(segment)).join('/');
    } catch {
        return null;
    }
};

const fileNameOf = (docPath: string): string => docPath.slice(docPath.lastIndexOf('/') + 1);

export async function GET(_request: Request, context: RouteContext<'/docs-source/[...path]'>) {
    const session = await consoleSession();
    if (!session || !mayOpenArea(session.access, session.roles, 'platform')) return NOT_FOUND();
    const { path } = await context.params;
    const docPath = docPathOf(path);
    const source = docPath ? await readDocSource(docPath) : null;
    if (!docPath || !source) return NOT_FOUND();
    const fileName = fileNameOf(docPath);
    return new Response(new Uint8Array(source), {
        headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': `attachment; filename="${fileName.replace(/["\\]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
