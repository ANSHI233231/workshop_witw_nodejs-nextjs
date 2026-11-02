import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DocsViewer } from '@/components/docs/docs-viewer';
import { mayOpenArea } from '@/lib/console-access';
import { consoleSession, requireConsoleArea } from '@/lib/console-session';
import { ROOT_README } from '@/lib/docs/doc-links';
import { diagramUrls, docLibrary, readDoc } from '@/lib/docs/docs-files';
import { codeBlocksOf, parseMarkdown } from '@/lib/docs/markdown';
import { serverTranslator } from '@/lib/i18n/server-translator';

type DocsPageProps = { readonly params: Promise<{ readonly path?: readonly string[] }> };

const docPathOf = (segments: readonly string[] | undefined): string | undefined => {
    if (!segments || segments.length === 0) return ROOT_README;
    try {
        return segments.map((segment) => decodeURIComponent(segment)).join('/');
    } catch {
        return undefined;
    }
};

export const generateMetadata = async ({ params }: DocsPageProps): Promise<Metadata> => {
    const { t } = await serverTranslator();
    const title = t('Tech Documentation');
    const session = await consoleSession();
    if (!session || !mayOpenArea(session.access, session.roles, 'platform')) return { title };
    const docPath = docPathOf((await params).path);
    const doc = docPath ? await readDoc(docPath) : null;
    return { title: doc ? `${doc.title} · ${title}` : title };
};

export default async function DocsPage({ params }: DocsPageProps) {
    await requireConsoleArea('platform');
    const docPath = docPathOf((await params).path);
    const doc = docPath ? await readDoc(docPath) : null;
    if (!doc) notFound();
    const library = await docLibrary();
    const blocks = parseMarkdown(doc.content);
    const diagrams = await diagramUrls(
        codeBlocksOf(blocks)
            .filter((block) => block.lang === 'mermaid')
            .map((block) => block.text),
    );
    return (
        <DocsViewer
            tree={library.tree}
            order={library.order}
            docPath={doc.path}
            entry={doc.entry}
            blocks={blocks}
            context={{ docPath: doc.path, known: library.known, diagrams }}
        />
    );
}
