import Link from 'next/link';
import type { ReactNode } from 'react';

import { resolveDocLink } from '@/lib/docs/doc-links';
import { type Block, type InlineNode, parseInline, plainText } from '@/lib/docs/markdown';

export type DocRenderContext = {
    readonly docPath: string;
    readonly known: ReadonlySet<string>;
    readonly diagrams: ReadonlyMap<string, string>;
};

const WEB_IMAGE = /^https?:\/\//i;

function DocLink({
    href,
    nodes,
    context,
}: {
    readonly href: string;
    readonly nodes: readonly InlineNode[];
    readonly context: DocRenderContext;
}) {
    const children = renderInline(nodes, context);
    const link = resolveDocLink(href, context.docPath, context.known);
    if (link.kind === 'anchor') return <a href={link.href}>{children}</a>;
    if (link.kind === 'doc') return <Link href={link.href}>{children}</Link>;
    if (link.kind === 'web') {
        return (
            <a href={link.href} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        );
    }
    const label = plainText(nodes);
    const showsPath = label === link.path || link.path.endsWith(label);
    return (
        <span className="dc-ref" title={link.path}>
            {children}
            {showsPath ? null : <span className="dc-ref-path"> ({link.path})</span>}
        </span>
    );
}

const renderInline = (nodes: readonly InlineNode[], context: DocRenderContext): ReactNode[] =>
    nodes.map((node, index) => {
        switch (node.kind) {
            case 'text':
                return node.text;
            case 'code':
                return <code key={index}>{node.text}</code>;
            case 'strong':
                return <strong key={index}>{renderInline(node.children, context)}</strong>;
            case 'em':
                return <em key={index}>{renderInline(node.children, context)}</em>;
            case 'del':
                return <del key={index}>{renderInline(node.children, context)}</del>;
            case 'break':
                return <br key={index} />;
            case 'image':
                return WEB_IMAGE.test(node.src) ? (
                    <img key={index} src={node.src} alt={node.alt} className="dc-img" />
                ) : (
                    <span key={index} className="dc-ref" title={node.src}>
                        {node.alt}
                    </span>
                );
            case 'link':
                return <DocLink key={index} href={node.href} nodes={node.children} context={context} />;
        }
    });

const Inline = ({ text, context }: { readonly text: string; readonly context: DocRenderContext }) => (
    <>{renderInline(parseInline(text), context)}</>
);

function Heading({
    block,
    context,
}: {
    readonly block: Extract<Block, { type: 'heading' }>;
    readonly context: DocRenderContext;
}) {
    const content = (
        <>
            <Inline text={block.text} context={context} />
            <a className="dc-anchor" href={`#${block.id}`} aria-hidden="true" tabIndex={-1}>
                #
            </a>
        </>
    );
    switch (block.level) {
        case 1:
            return <h1 id={block.id}>{content}</h1>;
        case 2:
            return <h2 id={block.id}>{content}</h2>;
        case 3:
            return <h3 id={block.id}>{content}</h3>;
        case 4:
            return <h4 id={block.id}>{content}</h4>;
        case 5:
            return <h5 id={block.id}>{content}</h5>;
        default:
            return <h6 id={block.id}>{content}</h6>;
    }
}

function CodeBlock({
    block,
    context,
}: {
    readonly block: Extract<Block, { type: 'code' }>;
    readonly context: DocRenderContext;
}) {
    const diagram = block.lang === 'mermaid' ? context.diagrams.get(block.text) : undefined;
    if (diagram) {
        return (
            <figure className="dc-diagram">
                <img src={diagram} alt="Diagram" />
            </figure>
        );
    }
    return (
        <pre className="dc-pre">
            <code>{block.text}</code>
        </pre>
    );
}

function Table({
    block,
    context,
}: {
    readonly block: Extract<Block, { type: 'table' }>;
    readonly context: DocRenderContext;
}) {
    return (
        <div className="dc-table">
            <table>
                <thead>
                    <tr>
                        {block.head.map((cell, column) => (
                            <th key={column} style={{ textAlign: block.align[column] }}>
                                <Inline text={cell} context={context} />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {block.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((cell, column) => (
                                <td key={column} style={{ textAlign: block.align[column] }}>
                                    <Inline text={cell} context={context} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ListItem({ blocks, context }: { readonly blocks: readonly Block[]; readonly context: DocRenderContext }) {
    const [first, ...rest] = blocks;
    if (first?.type !== 'paragraph') return <li>{renderBlocks(blocks, context)}</li>;
    return (
        <li>
            <Inline text={first.text} context={context} />
            {renderBlocks(rest, context)}
        </li>
    );
}

function BlockView({ block, context }: { readonly block: Block; readonly context: DocRenderContext }) {
    switch (block.type) {
        case 'heading':
            return <Heading block={block} context={context} />;
        case 'paragraph':
            return (
                <p>
                    <Inline text={block.text} context={context} />
                </p>
            );
        case 'code':
            return <CodeBlock block={block} context={context} />;
        case 'quote':
            return <blockquote>{renderBlocks(block.blocks, context)}</blockquote>;
        case 'rule':
            return <hr />;
        case 'table':
            return <Table block={block} context={context} />;
        case 'details':
            return (
                <details>
                    <summary>
                        <Inline text={block.summary || 'Details'} context={context} />
                    </summary>
                    {renderBlocks(block.blocks, context)}
                </details>
            );
        case 'list': {
            const items = block.items.map((item, index) => <ListItem key={index} blocks={item} context={context} />);
            return block.ordered ? <ol start={block.start}>{items}</ol> : <ul>{items}</ul>;
        }
    }
}

const renderBlocks = (blocks: readonly Block[], context: DocRenderContext): ReactNode[] =>
    blocks.map((block, index) => <BlockView key={index} block={block} context={context} />);

export function DocMarkdown({
    blocks,
    context,
    className,
}: {
    readonly blocks: readonly Block[];
    readonly context: DocRenderContext;
    readonly className?: string;
}) {
    return <div className={className ? `dc-body ${className}` : 'dc-body'}>{renderBlocks(blocks, context)}</div>;
}
