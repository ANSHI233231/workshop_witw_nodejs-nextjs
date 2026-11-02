import { serverTranslator } from '@/lib/i18n/server-translator';

export async function DashboardOverview({ name }: { readonly name: string }) {
    const { t } = await serverTranslator();
    return (
        <div className="page">
            <div className="page-head">
                <h1 className="page-title">{t('Dashboard')}</h1>
            </div>
            <div className="card portal-card">
                <div className="card-title">
                    <span>{t('Welcome, {name}', { name })}</span>
                </div>
                <p className="kpi-meta">{t('This app is the starting point for a new portal: add its pages here.')}</p>
            </div>
        </div>
    );
}
