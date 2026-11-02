'use client';

import { Fragment, type ReactNode } from 'react';

import { useT } from '@/hooks/i18n/use-t';

const withLinks = (text: string, links: Readonly<Record<string, ReactNode>>): ReactNode[] =>
    text
        .split(/\{(\w+)\}/)
        .map((part, index) => <Fragment key={index}>{index % 2 === 1 ? (links[part] ?? `{${part}}`) : part}</Fragment>);

export function ConsoleFooter() {
    const t = useT();
    return (
        <footer className="app-footer">
            <span>
                {withLinks(t('© {year} All rights reserved.'), { year: String(new Date().getFullYear()) })}
            </span>
        </footer>
    );
}
