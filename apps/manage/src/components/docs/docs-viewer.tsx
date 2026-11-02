import Link from 'next/link';
import { Fragment } from 'react';

import { longDate } from '@/components/ui/date-range';
import { ArrowLeftIcon, ArrowRightIcon, BreadcrumbChevronIcon, DownloadIcon } from '@/components/ui/icons';
import { docHref, docSourceHref, README_NAME } from '@/lib/docs/doc-links';
import { type Block, parseInline, plainText } from '@/lib/docs/markdown';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Translate } from '@/lib/i18n/locale';
import type { DocEntry, DocFolderNode, DocLink } from '@/types/docs.types';

import { DocMarkdown, type DocRenderContext } from './doc-markdown';
import { DocPdfButton } from './doc-pdf-button';
import { DocsSidebar } from './docs-sidebar';

const addedText = (entry: DocEntry, t: Translate): string => {
    const date = longDate(entry.added);
    return entry.addedBy ? t('Added {date} by {name}', { date, name: entry.addedBy }) : t('Added {date}', { date });
};

const updatedText = (entry: DocEntry, t: Translate): string | undefined => {
    const date = longDate(entry.updated);
    if (!entry.isCommitted) return t('Last updated {date} (not committed)', { date });
    if (entry.updated <= entry.added && entry.updatedBy === entry.addedBy) return undefined;
    return entry.updatedBy
        ? t('Last updated {date} by {name}', { date, name: entry.updatedBy })
        : t('Last updated {date}', { date });
};

const datesLine = (entry: DocEntry, t: Translate): string =>
    [addedText(entry, t), updatedText(entry, t)].filter(Boolean).join(' · ');

const cssString = (text: string): string =>
    `"${text
        .replace(/[\\"]/g, '\\$&')
        .replace(/[\n\r]/g, ' ')
        .replace(/</g, '\\3C ')}"`;

const printHeaderOf = (title: string): string => `@page{@top-center{content:${cssString(title)}}}`;

type Crumb = { readonly label: string; readonly href: string | undefined };

const crumbsOf = (docPath: string, known: ReadonlySet<string>): readonly Crumb[] => {
    const segments = docPath.split('/');
    const folders = segments.slice(0, -1).map((segment, index): Crumb => {
        const readme = `${segments.slice(0, index + 1).join('/')}/${README_NAME}`;
        return { label: segment, href: known.has(readme) && readme !== docPath ? docHref(readme) : undefined };
    });
    const file = segments[segments.length - 1] ?? docPath;
    return file === README_NAME && folders.length > 0 ? folders : [...folders, { label: file, href: undefined }];
};

export async function DocsViewer({
    tree,
    order,
    docPath,
    entry,
    blocks,
    context,
}: {
    readonly tree: DocFolderNode;
    readonly order: readonly DocLink[];
    readonly docPath: string;
    readonly entry: DocEntry;
    readonly blocks: readonly Block[];
    readonly context: DocRenderContext;
}) {
    const { t } = await serverTranslator();
    const position = order.findIndex((entry) => entry.path === docPath);
    const previous = position > 0 ? order[position - 1] : undefined;
    const next = position >= 0 ? order[position + 1] : undefined;
    const sections = blocks.filter(
        (block): block is Extract<Block, { type: 'heading' }> => block.type === 'heading' && block.level === 2,
    );
    const crumbs = crumbsOf(docPath, context.known);
    const [firstBlock] = blocks;
    const leadHeading = firstBlock?.type === 'heading' && firstBlock.level === 1 ? firstBlock : undefined;
    const firstHeading = blocks.find((block) => block.type === 'heading' && block.level === 1);
    const title =
        firstHeading?.type === 'heading' ? plainText(parseInline(firstHeading.text)) : docPath.replace(/^.*\//, '');
    return (
        <div className="page dc-page">
            <style>{printHeaderOf(title)}</style>
            <div className="dc-head">
                <nav className="breadcrumb dc-crumbs" aria-label={t('Breadcrumb')}>
                    <Link href={docHref('README.md')}>{t('Tech Documentation')}</Link>
                    {crumbs.map((crumb, index) => (
                        <Fragment key={index}>
                            <BreadcrumbChevronIcon />
                            {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                        </Fragment>
                    ))}
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Tech Documentation')}</h1>
                </div>
            </div>
            <div className="dc-layout">
                <DocsSidebar tree={tree} currentPath={docPath} />
                <article className="card dc-article">
                    <div className="dc-title-row">
                        {leadHeading ? (
                            <DocMarkdown blocks={[leadHeading]} context={context} className="dc-title" />
                        ) : (
                            <div className="dc-body dc-title">
                                <h1>{title}</h1>
                            </div>
                        )}
                        <div className="dc-actions">
                            <a href={docSourceHref(docPath)} download className="btn btn-secondary dc-md">
                                <DownloadIcon />
                                {t('Download .md')}
                            </a>
                            <DocPdfButton docPath={docPath} />
                        </div>
                    </div>
                    <div className="dc-details">
                        <p className="dc-path">docs/{docPath}</p>
                        <p className="dc-meta">{datesLine(entry, t)}</p>
                        {entry.editors.length > 1 ? (
                            <p className="dc-meta">{t('Edited by: {names}', { names: entry.editors.join(', ') })}</p>
                        ) : null}
                    </div>
                    <DocMarkdown blocks={leadHeading ? blocks.slice(1) : blocks} context={context} />
                    <nav className="dc-pager" aria-label={t('Previous and next file')}>
                        {previous ? (
                            <Link href={docHref(previous.path)} className="dc-pager-link">
                                <span className="dc-pager-label">
                                    <ArrowLeftIcon />
                                    {t('Previous')}
                                </span>
                                <span className="dc-pager-title">{previous.title}</span>
                            </Link>
                        ) : (
                            <span />
                        )}
                        {next ? (
                            <Link href={docHref(next.path)} className="dc-pager-link dc-pager-next">
                                <span className="dc-pager-label">
                                    {t('Next')}
                                    <ArrowRightIcon />
                                </span>
                                <span className="dc-pager-title">{next.title}</span>
                            </Link>
                        ) : null}
                    </nav>
                </article>
                {sections.length > 0 ? (
                    <nav className="dc-toc" aria-label={t('On this page')}>
                        <p className="dc-toc-title">{t('On this page')}</p>
                        <ul>
                            {sections.map((section) => (
                                <li key={section.id}>
                                    <a href={`#${section.id}`}>{plainText(parseInline(section.text))}</a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                ) : null}
            </div>
        </div>
    );
}
