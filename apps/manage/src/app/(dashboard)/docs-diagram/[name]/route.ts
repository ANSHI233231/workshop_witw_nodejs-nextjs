import { consoleSession } from '@/lib/console-session';
import { mayOpenArea } from '@/lib/console-access';
import { readDiagram } from '@/lib/docs/docs-files';

export const runtime = 'nodejs';

const NOT_FOUND = () => new Response('Not found', { status: 404 });

export async function GET(_request: Request, context: RouteContext<'/docs-diagram/[name]'>) {
    const session = await consoleSession();
    if (!session || !mayOpenArea(session.access, session.roles, 'platform')) return NOT_FOUND();
    const { name } = await context.params;
    const picture = await readDiagram(name);
    if (!picture) return NOT_FOUND();
    return new Response(new Uint8Array(picture), {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'private, max-age=3600',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
