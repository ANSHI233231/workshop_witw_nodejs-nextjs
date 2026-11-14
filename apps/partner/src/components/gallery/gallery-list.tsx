import Link from 'next/link';

import { PageBreadcrumb } from '@/components/portal/page-breadcrumb';
import { PlusIcon } from '@/components/ui/icons';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { GALLERY_TABS, type GalleryTabList } from '@/types/gallery.types';

import { GalleryCards } from './gallery-cards';
import { GALLERY_PATH, TAB_LABELS, tabUrl } from './gallery-format';

export async function GalleryList({ list }: { readonly list: GalleryTabList }) {
    const { t } = await serverTranslator();
    return (
        <div className="page">
            <div>
                <PageBreadcrumb portalLabel={t('Partner Portal')} pageLabel={t('Gallery')} ariaLabel={t('Breadcrumb')} />
                <div className="page-head">
                    <h1 className="page-title">{t('Gallery')}</h1>
                    <div className="actions">
                        <Link className="btn btn-primary" href={`${GALLERY_PATH}/new`}>
                            <PlusIcon />
                            {t('Add gallery')}
                        </Link>
                    </div>
                </div>
            </div>
            <div className="pq-card">
                <div className="nt-tabs" role="tablist">
                    {GALLERY_TABS.map((key) => (
                        <Link
                            key={key}
                            href={tabUrl(key)}
                            className={key === list.tab ? 'nt-tab is-on' : 'nt-tab'}
                            role="tab"
                            aria-selected={key === list.tab}
                        >
                            {t(TAB_LABELS[key])}
                            <span>{list.counts[key]}</span>
                        </Link>
                    ))}
                </div>
                <GalleryCards items={list.items} tab={list.tab} />
            </div>
        </div>
    );
}
